// The list itself moved to shared/facilities.ts so the database seed can import it —
// server/tsconfig.json only includes src/ and shared/. Re-exported here so every existing
// frontend import keeps working unchanged.
export { HEALTH_FACILITIES, MUNICIPALITIES, facilityById } from '../shared/facilities';
