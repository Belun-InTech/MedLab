import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import { env } from './env.js';
import { pingDatabase } from './db/index.js';
import { authRouter } from './routes/auth.js';
import { childrenRouter } from './routes/children.js';
import { consultationsRouter } from './routes/consultations.js';
import { doctorsRouter } from './routes/doctors.js';
import { appointmentsRouter } from './routes/appointments.js';
import { adminRouter } from './routes/admin.js';
import { activeProvider, negotiatedStructuredMode } from './ai/providers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Compiled output lands at dist-server/server/src/index.js, so the built SPA is three
// levels up, not two. Overridable for container layouts that differ.
const distDir = process.env.SPA_DIR
  ? path.resolve(process.env.SPA_DIR)
  : path.resolve(__dirname, '../../../dist');

const app = express();

// Photos arrive as base64 data URLs, so the default 100kb body limit is far too small.
app.use(express.json({ limit: '12mb' }));
app.use(cookieParser());

app.get('/api/health', async (_req, res) => {
  try {
    await pingDatabase();
    res.json({
      ok: true,
      database: 'up',
      aiProvider: activeProvider(),
      structuredMode: negotiatedStructuredMode(),
    });
  } catch (err) {
    res.status(503).json({ ok: false, database: 'down', error: String(err) });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/children', childrenRouter);
app.use('/api/consultations', consultationsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/admin', adminRouter);

// Must stay last: this swallows every unmatched /api path.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// In production this same process serves the built SPA, so the frontend and API are one
// origin and one container. In dev, Vite serves the SPA and proxies /api here.
if (env.isProd) {
  app.use(express.static(distDir));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'internal_error' });
});

app.listen(env.port, () => {
  console.log(`MedLab API listening on :${env.port} (ai provider: ${activeProvider()})`);
  if (env.isProd) console.log(`Serving SPA from ${distDir}`);
});
