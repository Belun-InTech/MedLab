import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';

export const childrenRouter = Router();
childrenRouter.use(requireAuth);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

const childSchema = z.object({
  name: z.string().trim().min(1).max(120),
  dob: isoDate,
  sex: z.enum(['Male', 'Female']),
});

/** Ownership check — every child route must go through this, never trust a client id. */
const ownedChild = async (userId: string, childId: string) => {
  const [child] = await db
    .select()
    .from(schema.children)
    .where(and(eq(schema.children.id, childId), eq(schema.children.userId, userId)))
    .limit(1);
  return child;
};

childrenRouter.get('/', async (req, res) => {
  const rows = await db
    .select()
    .from(schema.children)
    .where(eq(schema.children.userId, req.userId!))
    .orderBy(asc(schema.children.dob));
  res.json({ children: rows.map(({ userId, createdAt, updatedAt, ...c }) => c) });
});

childrenRouter.post('/', async (req, res) => {
  const parsed = childSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }
  const id = randomUUID();
  await db.insert(schema.children).values({ id, userId: req.userId!, ...parsed.data });
  res.status(201).json({ child: { id, ...parsed.data } });
});

childrenRouter.put('/:id', async (req, res) => {
  const parsed = childSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }
  if (!(await ownedChild(req.userId!, req.params.id))) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  await db.update(schema.children).set(parsed.data).where(eq(schema.children.id, req.params.id));
  res.json({ child: { id: req.params.id, ...parsed.data } });
});

childrenRouter.delete('/:id', async (req, res) => {
  if (!(await ownedChild(req.userId!, req.params.id))) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  // Vaccinations and consultations cascade via FK.
  await db.delete(schema.children).where(eq(schema.children.id, req.params.id));
  res.status(204).end();
});

/**
 * Replace the whole family in one call — mirrors how FamilyProfileSetup saves.
 * Children absent from the payload are deleted (cascading their records), which is the
 * behaviour the form implies when a row is removed.
 */
childrenRouter.put('/', async (req, res) => {
  const parsed = z
    .object({ children: z.array(childSchema.extend({ id: z.string().optional() })).max(20) })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }

  const existing = await db
    .select({ id: schema.children.id })
    .from(schema.children)
    .where(eq(schema.children.userId, req.userId!));
  const existingIds = new Set(existing.map((c) => c.id));

  const kept: string[] = [];
  for (const child of parsed.data.children) {
    const { id, ...values } = child;
    if (id && existingIds.has(id)) {
      await db.update(schema.children).set(values).where(eq(schema.children.id, id));
      kept.push(id);
    } else {
      const newId = randomUUID();
      await db.insert(schema.children).values({ id: newId, userId: req.userId!, ...values });
      kept.push(newId);
    }
  }

  const removed = [...existingIds].filter((id) => !kept.includes(id));
  if (removed.length) {
    await db.delete(schema.children).where(inArray(schema.children.id, removed));
  }

  const rows = await db
    .select()
    .from(schema.children)
    .where(eq(schema.children.userId, req.userId!))
    .orderBy(asc(schema.children.dob));
  res.json({ children: rows.map(({ userId, createdAt, updatedAt, ...c }) => c) });
});

// --- Vaccinations -----------------------------------------------------------

childrenRouter.get('/:id/vaccinations', async (req, res) => {
  if (!(await ownedChild(req.userId!, req.params.id))) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  const rows = await db
    .select({ doseId: schema.childVaccinations.doseId, givenAt: schema.childVaccinations.givenAt })
    .from(schema.childVaccinations)
    .where(eq(schema.childVaccinations.childId, req.params.id));
  res.json({ given: rows });
});

/** Toggle a dose. Idempotent by the (child_id, dose_id) unique index. */
childrenRouter.post('/:id/vaccinations/:doseId/toggle', async (req, res) => {
  if (!(await ownedChild(req.userId!, req.params.id))) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  const { id: childId, doseId } = req.params;

  const [existing] = await db
    .select({ id: schema.childVaccinations.id })
    .from(schema.childVaccinations)
    .where(
      and(
        eq(schema.childVaccinations.childId, childId),
        eq(schema.childVaccinations.doseId, doseId),
      ),
    )
    .limit(1);

  if (existing) {
    await db.delete(schema.childVaccinations).where(eq(schema.childVaccinations.id, existing.id));
    res.json({ doseId, given: false });
    return;
  }

  await db.insert(schema.childVaccinations).values({
    id: randomUUID(),
    childId,
    doseId,
    givenAt: new Date().toISOString().slice(0, 10),
  });
  res.json({ doseId, given: true });
});
