import type { HealthFacility } from './types.js';

/**
 * The national facility list. It lives in shared/ rather than constants/ because the
 * database seed needs it too, and server/tsconfig.json only includes src/ and shared/.
 * constants/facilities.ts re-exports it so existing frontend imports are unchanged.
 *
 * These are reference data, not user data — hence plain int ids rather than the char(36)
 * UUIDs used by every table a user can write to.
 */
export const MUNICIPALITIES = [
  'Dili', 'Baucau', 'Bobonaro', 'Ainaro', 'Aileu', 'Covalima',
  'Ermera', 'Lautém', 'Liquiçá', 'Manatuto', 'Manufahi', 'Viqueque', 'Oecusse (RAEOA)'
];

export const HEALTH_FACILITIES: HealthFacility[] = [
  { id: 1,  name: 'Hospital Nacional Guido Valadares (HNGV)', type: 'Hospital',    municipality: 'Dili',            phone: '+670 331-1008' },
  { id: 2,  name: 'Dili Medical Center',                      type: 'Clinic',      municipality: 'Dili',            phone: '+670 331-2100' },
  { id: 3,  name: 'CHC Comoro',                               type: 'CHC',         municipality: 'Dili',            phone: '+670 7723-0001' },
  { id: 4,  name: 'CHC Becora',                               type: 'CHC',         municipality: 'Dili',            phone: '+670 7723-0002' },
  { id: 5,  name: 'Klinik Bairro Pite',                       type: 'Clinic',      municipality: 'Dili',            phone: '+670 7723-0003' },
  { id: 6,  name: 'Marie Stopes Timor-Leste',                 type: 'Clinic',      municipality: 'Dili',            phone: '+670 331-2405' },
  { id: 7,  name: 'Stamford Medical Clinic',                  type: 'Clinic',      municipality: 'Dili',            phone: '+670 331-0141' },
  { id: 8,  name: 'Hospital Referral Baucau',                 type: 'Hospital',    municipality: 'Baucau',          phone: '+670 7724-0001' },
  { id: 9,  name: 'CHC Baucau Vila',                          type: 'CHC',         municipality: 'Baucau',          phone: '+670 7724-0002' },
  { id: 10, name: 'Hospital Referral Maliana',                type: 'Hospital',    municipality: 'Bobonaro',        phone: '+670 7725-0001' },
  { id: 11, name: 'CHC Maliana',                              type: 'CHC',         municipality: 'Bobonaro',        phone: '+670 7725-0002' },
  { id: 12, name: 'Hospital Referral Maubisse',               type: 'Hospital',    municipality: 'Ainaro',          phone: '+670 7726-0001' },
  { id: 13, name: 'CHC Ainaro Vila',                          type: 'CHC',         municipality: 'Ainaro',          phone: '+670 7726-0002' },
  { id: 14, name: 'CHC Aileu Vila',                           type: 'CHC',         municipality: 'Aileu',           phone: '+670 7727-0001' },
  { id: 15, name: 'Hospital Referral Suai',                   type: 'Hospital',    municipality: 'Covalima',        phone: '+670 7728-0001' },
  { id: 16, name: 'CHC Suai Vila',                            type: 'CHC',         municipality: 'Covalima',        phone: '+670 7728-0002' },
  { id: 17, name: 'CHC Gleno',                                type: 'CHC',         municipality: 'Ermera',          phone: '+670 7729-0001' },
  { id: 18, name: 'Posto Saúde Letefoho',                     type: 'Health Post', municipality: 'Ermera',          phone: '+670 7729-0002' },
  { id: 19, name: 'CHC Lospalos',                             type: 'CHC',         municipality: 'Lautém',          phone: '+670 7730-0001' },
  { id: 20, name: 'CHC Liquiçá Vila',                         type: 'CHC',         municipality: 'Liquiçá',         phone: '+670 7731-0001' },
  { id: 21, name: 'CHC Manatuto Vila',                        type: 'CHC',         municipality: 'Manatuto',        phone: '+670 7732-0001' },
  { id: 22, name: 'CHC Same',                                 type: 'CHC',         municipality: 'Manufahi',        phone: '+670 7733-0001' },
  { id: 23, name: 'CHC Viqueque Vila',                        type: 'CHC',         municipality: 'Viqueque',        phone: '+670 7734-0001' },
  { id: 24, name: 'Hospital Referral Oecusse',                type: 'Hospital',    municipality: 'Oecusse (RAEOA)', phone: '+670 7735-0001' },
];

/** Used by the doctor profile, which stores facilityId plus a name snapshot. */
export const facilityById = (id: number): HealthFacility | undefined =>
  HEALTH_FACILITIES.find((f) => f.id === id);
