import { VaccineDose } from "../types";

// Timor-Leste EPI (Expanded Programme on Immunization) childhood schedule.
// ageMonths uses fractions for week-based doses (6 wk ≈ 1.4 mo, 10 wk ≈ 2.3 mo, 14 wk ≈ 3.2 mo).
export const EPI_SCHEDULE: VaccineDose[] = [
  { id: 'bcg',    vaccine: 'BCG',                          doseLabel: '1',       ageMonths: 0 },
  { id: 'hepb0',  vaccine: 'Hepatitis B',                  doseLabel: 'Birth',   ageMonths: 0 },
  { id: 'penta1', vaccine: 'Pentavalent (DTP-HepB-Hib)',   doseLabel: '1',       ageMonths: 1.4 },
  { id: 'opv1',   vaccine: 'Oral Polio (OPV)',             doseLabel: '1',       ageMonths: 1.4 },
  { id: 'penta2', vaccine: 'Pentavalent (DTP-HepB-Hib)',   doseLabel: '2',       ageMonths: 2.3 },
  { id: 'opv2',   vaccine: 'Oral Polio (OPV)',             doseLabel: '2',       ageMonths: 2.3 },
  { id: 'penta3', vaccine: 'Pentavalent (DTP-HepB-Hib)',   doseLabel: '3',       ageMonths: 3.2 },
  { id: 'opv3',   vaccine: 'Oral Polio (OPV)',             doseLabel: '3',       ageMonths: 3.2 },
  { id: 'ipv',    vaccine: 'Inactivated Polio (IPV)',      doseLabel: '1',       ageMonths: 3.2 },
  { id: 'mr1',    vaccine: 'Measles-Rubella (MR)',         doseLabel: '1',       ageMonths: 9 },
  { id: 'mr2',    vaccine: 'Measles-Rubella (MR)',         doseLabel: '2',       ageMonths: 18 },
  { id: 'dtpb',   vaccine: 'DTP Booster',                  doseLabel: 'Booster', ageMonths: 18 },
];
