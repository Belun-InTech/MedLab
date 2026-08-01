/**
 * Demo seed. Run with `npm run db:seed`.
 *
 * These six doctors used to be MOCK_SPECIALISTS in constants/medicalData.ts. They are now
 * real accounts with real availability, because an empty doctor directory is a worse demo
 * than six bookable doctors — and a client-side mock living alongside a live API
 * guarantees that someone eventually renders a doctor you cannot actually book.
 *
 * Idempotent: every account is keyed on its email, so re-running changes nothing. You will
 * run this more than once.
 */
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from './index.js';
import { hashPassword } from '../lib/auth.js';
import { HEALTH_FACILITIES } from '../../../shared/facilities.js';

/** Every demo account shares this. Never do this anywhere that is not a demo. */
const DEMO_PASSWORD = 'medlab123';

type SpokenLanguage = 'tet' | 'pt' | 'id' | 'en';

interface SeedDoctor {
  name: string;
  email: string;
  dob: string;
  specialty: 'Pediatrician' | 'General Practitioner';
  licenseNumber: string;
  facilityId: number;
  phone: string;
  photoUrl: string;
  bio: string;
  languages: SpokenLanguage[];
  status: 'pending' | 'approved';
  ratingAvg: string | null;
  ratingCount: number;
}

const DOCTORS: SeedDoctor[] = [
  {
    name: 'Dr. Budi Santoso', email: 'budi.santoso@medlab.tl', dob: '1979-04-12',
    specialty: 'Pediatrician', licenseNumber: 'TL-PED-1043', facilityId: 5,
    phone: '+670 7777-3333',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Paediatrician with 15 years in community child health across Dili.',
    languages: ['tet', 'id', 'en'], status: 'approved', ratingAvg: '4.80', ratingCount: 62,
  },
  {
    name: 'Dr. Linda Chen', email: 'linda.chen@medlab.tl', dob: '1985-09-30',
    specialty: 'Pediatrician', licenseNumber: 'TL-PED-1088', facilityId: 1,
    phone: '+670 7777-4444',
    photoUrl: 'https://images.unsplash.com/photo-1651008325506-71d345a90e3d?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Neonatal and infant care at Hospital Nacional Guido Valadares.',
    languages: ['tet', 'en'], status: 'approved', ratingAvg: '4.60', ratingCount: 41,
  },
  {
    name: 'Dr. Ana Ximenes', email: 'ana.ximenes@medlab.tl', dob: '1982-01-22',
    specialty: 'Pediatrician', licenseNumber: 'TL-PED-1105', facilityId: 3,
    phone: '+670 7777-5555',
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Focus on nutrition, growth monitoring and the EPI schedule.',
    languages: ['tet', 'pt', 'en'], status: 'approved', ratingAvg: '4.90', ratingCount: 87,
  },
  {
    name: 'Dr. Sarah Silva', email: 'sarah.silva@medlab.tl', dob: '1981-07-05',
    specialty: 'General Practitioner', licenseNumber: 'TL-GP-2011', facilityId: 2,
    phone: '+670 7777-1111',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Family medicine, with a special interest in childhood respiratory illness.',
    languages: ['tet', 'pt', 'en'], status: 'approved', ratingAvg: '4.50', ratingCount: 33,
  },
  {
    name: 'Dr. Robert Costa', email: 'robert.costa@medlab.tl', dob: '1976-11-18',
    specialty: 'General Practitioner', licenseNumber: 'TL-GP-2044', facilityId: 1,
    phone: '+670 7777-2222',
    photoUrl: 'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'General practice and emergency triage, HNGV.',
    languages: ['tet', 'pt', 'id', 'en'], status: 'approved', ratingAvg: '4.30', ratingCount: 58,
  },
  {
    name: 'Dr. Julia Pereira', email: 'julia.pereira@medlab.tl', dob: '1988-03-09',
    specialty: 'General Practitioner', licenseNumber: 'TL-GP-2079', facilityId: 4,
    phone: '+670 7777-6666',
    photoUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'Community health centre practice in Becora, Dili.',
    languages: ['tet', 'en'], status: 'approved', ratingAvg: '4.70', ratingCount: 25,
  },
  // Left pending on purpose: the admin verification queue must not be empty on stage.
  {
    name: 'Dr. Marcos Guterres', email: 'marcos.guterres@medlab.tl', dob: '1990-06-27',
    specialty: 'Pediatrician', licenseNumber: 'TL-PED-1190', facilityId: 22,
    phone: '+670 7777-8888',
    photoUrl: '',
    bio: 'Recently returned from paediatric training in Portugal. Awaiting verification.',
    languages: ['tet', 'pt'], status: 'pending', ratingAvg: null, ratingCount: 0,
  },
];

const ADMIN = { name: 'MédLab Administrator', email: 'admin@medlab.tl', dob: '1985-05-15' };

/** Mon–Fri, 09:00–12:00 and 14:00–17:00, in Dili wall-clock minutes from midnight. */
const DEFAULT_RULES = [1, 2, 3, 4, 5].flatMap((weekday) => [
  { weekday, startMinute: 9 * 60, endMinute: 12 * 60 },
  { weekday, startMinute: 14 * 60, endMinute: 17 * 60 },
]);

const findByEmail = async (email: string) => {
  const [row] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return row;
};

const seed = async (): Promise<void> => {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  let created = 0;
  let skipped = 0;

  if (await findByEmail(ADMIN.email)) {
    skipped++;
  } else {
    await db.insert(schema.users).values({
      id: randomUUID(), name: ADMIN.name, email: ADMIN.email,
      passwordHash, dob: ADMIN.dob, role: 'admin',
    });
    created++;
  }

  for (const doc of DOCTORS) {
    if (await findByEmail(doc.email)) {
      skipped++;
      continue;
    }

    const facility = HEALTH_FACILITIES.find((f) => f.id === doc.facilityId);
    if (!facility) throw new Error(`Unknown facility id ${doc.facilityId} for ${doc.name}`);

    const userId = randomUUID();
    await db.insert(schema.users).values({
      id: userId, name: doc.name, email: doc.email,
      passwordHash, dob: doc.dob, role: 'doctor',
    });

    await db.insert(schema.doctorProfiles).values({
      userId,
      specialty: doc.specialty,
      licenseNumber: doc.licenseNumber,
      facilityId: facility.id,
      facilityName: facility.name,
      phone: doc.phone,
      photoUrl: doc.photoUrl || null,
      bio: doc.bio,
      languages: doc.languages,
      slotMinutes: 30,
      status: doc.status,
      ratingAvg: doc.ratingAvg,
      ratingCount: doc.ratingCount,
    });

    // A pending doctor has no published hours — they cannot be booked either way.
    if (doc.status === 'approved') {
      await db.insert(schema.doctorAvailabilityRules).values(
        DEFAULT_RULES.map((r) => ({ id: randomUUID(), doctorId: userId, ...r })),
      );
    }

    created++;
  }

  console.log(`Seed complete: ${created} account(s) created, ${skipped} already present.`);
  console.log(`Demo password for every seeded account: ${DEMO_PASSWORD}`);
  console.log(`  admin    ${ADMIN.email}`);
  console.log(`  doctor   ${DOCTORS[0]!.email}   (approved)`);
  console.log(`  doctor   ${DOCTORS[6]!.email}   (pending — approve this one in the demo)`);
};

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
