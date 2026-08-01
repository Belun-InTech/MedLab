
import { User, HistoryRecord, Appointment, AnalysisResult, AuscultationData } from "../types";

const USERS_STORAGE_KEY = 'murakmed_users_list';
const HISTORY_STORAGE_KEY = 'murakmed_history_storage';
const APPOINTMENTS_STORAGE_KEY = 'murakmed_appointments_storage';
const SESSION_STORAGE_KEY = 'murakmed_active_session';

// Initial Mock User Database
const MOCK_PATIENT: User = {
  id: 'u1',
  name: 'Holipuna Tafa',
  firstName: 'Holipuna',
  lastName: 'Tafa',
  username: 'Holipuna Tafa',
  avatar: 'https://ui-avatars.com/api/?name=Holipuna+Tafa&background=2563eb&color=fff',
  dob: '1995-05-20',
  sex: 'Male',
  email: 'holipuna@example.com',
  password: '12345',
  role: 'Patient'
};

const MOCK_DOCTOR: User = {
  id: 'd1',
  name: 'Dr. Sarah Silva',
  firstName: 'Sarah',
  lastName: 'Silva',
  username: 'Sarah Silva',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
  email: 'sarah.silva@murakmed.com',
  password: 'doctor123',
  role: 'Specialist',
  specialistId: 1 // Links to Dr. Sarah Silva profile
};

const MOCK_HISTORY: HistoryRecord[] = [
  {
    id: 'h1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    symptoms: "Persistent dry cough, mild fever, fatigue",
    diagnosis: "Bronchitis",
    doctorMet: "General Practitioner",
    notes: "Prescribed antibiotics and rest. AI Assessment Complete.",
    status: "Completed" as const,
    fullResult: {
      emergencyAlert: false,
      possibleConditions: [
        {
          name: "Bronchitis",
          probability: "High",
          description: "Inflammation of the lining of your bronchial tubes, which carry air to and from your lungs.",
          reasoning: "Patient presents with persistent cough and mild fever, which are classic signs of bronchial inflammation.",
          recommendedAction: "Rest, stay hydrated, and complete the prescribed antibiotic course.",
          suggestedMedications: [
            { name: "Amoxicillin", type: "Prescription", description: "Antibiotic to treat bacterial infection." },
            { name: "Guaifenesin", type: "Over-the-counter", description: "Expectorant to help clear mucus." }
          ]
        }
      ],
      generalAdvice: ["Drink plenty of fluids", "Use a humidifier", "Avoid smoke and other lung irritants"],
      recommendedSpecialist: "General Practitioner",
      disclaimer: "Informational purposes only."
    }
  }
];

export const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure the mock users always exist for demo accessibility
      if (!parsed.some((u: User) => u.id === 'u1')) {
        parsed.push(MOCK_PATIENT);
      }
      if (!parsed.some((u: User) => u.id === 'd1')) {
        parsed.push(MOCK_DOCTOR);
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (e) {
    console.warn("Error reading users storage", e);
  }
  const initialUsers = [MOCK_PATIENT, MOCK_DOCTOR];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
  return initialUsers;
};

export const persistSession = (user: User) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
};

export const getPersistedSession = (): User | null => {
  try {
    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    if (session) {
      const sessionUser = JSON.parse(session);
      const users = getStoredUsers();
      return users.find(u => u.id === sessionUser.id) || null;
    }
  } catch (e) {
    console.warn("Error reading session storage", e);
  }
  return null;
};

export const clearPersistedSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const loginUser = async (username: string, password: string): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.username === username && u.password === password);
  
  if (userIndex !== -1) {
    const foundUser = users[userIndex];
    foundUser.lastLogin = new Date().toISOString();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    persistSession(foundUser);
    return foundUser;
  }
  return null;
};

export const signupUser = async (userData: Partial<User>): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  const users = getStoredUsers();
  if (users.some(u => u.username === userData.username)) {
    throw new Error("Username already taken.");
  }

  const newUser: User = {
    id: `u-${Date.now()}`,
    name: `${userData.firstName} ${userData.lastName}`,
    firstName: userData.firstName,
    lastName: userData.lastName,
    username: userData.username || '',
    email: userData.email || '',
    password: userData.password || '',
    avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=random`,
    dob: userData.dob,
    sex: userData.sex || '',
    lastLogin: new Date().toISOString(),
    role: 'Patient' // Default role for signups
  };

  const updatedUsers = [...users, newUser];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  persistSession(newUser);
  return newUser;
};

export const findUserForRecovery = async (username: string, email: string): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const users = getStoredUsers();
  return users.find(u => 
    u.username.toLowerCase() === username.toLowerCase() && 
    u.email?.toLowerCase() === email.toLowerCase()
  ) || null;
};

export const resetUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return false;

  users[index].password = newPassword;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return true;
};

export const updateUserProfile = async (userId: string, updatedData: Partial<User>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) throw new Error("User not found");

  if (updatedData.username && updatedData.username !== users[userIndex].username) {
    if (users.some(u => u.username === updatedData.username)) {
      throw new Error("Username already taken.");
    }
  }

  const updatedUser: User = {
    ...users[userIndex],
    ...updatedData,
    name: updatedData.firstName && updatedData.lastName 
      ? `${updatedData.firstName} ${updatedData.lastName}` 
      : users[userIndex].name
  };

  users[userIndex] = updatedUser;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  persistSession(updatedUser);
  return updatedUser;
};

export const getPatientHistory = async (userId: string): Promise<HistoryRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  let records: HistoryRecord[] = [];
  
  try {
    const key = `${HISTORY_STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      records = JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Error reading history", e);
  }

  if (userId === 'u1') {
    MOCK_HISTORY.forEach(mockRec => {
      if (!records.some(r => r.id === mockRec.id)) {
        records.push(mockRec);
      }
    });
  }

  return records.sort((a: HistoryRecord, b: HistoryRecord) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const saveNewHistoryRecord = async (userId: string, record: HistoryRecord): Promise<void> => {
  try {
    const key = `${HISTORY_STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    const currentHistory = stored ? JSON.parse(stored) : [];
    const updatedHistory = [record, ...currentHistory];
    localStorage.setItem(key, JSON.stringify(updatedHistory));

    // If there's an appointment, record it in the specialist's global pool
    if (record.appointment) {
      saveAppointmentToSpecialist(record.appointment, record.symptoms, userId, record.fullResult, record.auscultation);
    }
  } catch (e) {
    console.error("Failed to save history record", e);
  }
};

const saveAppointmentToSpecialist = (
  appointment: Appointment, 
  symptoms: string, 
  patientId: string, 
  analysisResult?: AnalysisResult,
  auscultation?: AuscultationData
) => {
  try {
    const key = APPOINTMENTS_STORAGE_KEY;
    const stored = localStorage.getItem(key);
    const currentAppointments: Appointment[] = stored ? JSON.parse(stored) : [];
    
    const users = getStoredUsers();
    const patient = users.find(u => u.id === patientId);

    const fullAppointment: Appointment = {
      ...appointment,
      id: appointment.id || `app-${Date.now()}`,
      patientId,
      patientName: patient?.name || "Patient",
      patientSymptoms: symptoms,
      patientAge: patient?.dob ? calculateAge(patient.dob) : undefined,
      patientSex: patient?.sex,
      analysisResult,
      auscultation
    };

    // Remove old version if updating
    const filtered = currentAppointments.filter(a => a.id !== fullAppointment.id);
    localStorage.setItem(key, JSON.stringify([fullAppointment, ...filtered]));
  } catch (e) {
    console.error("Failed to sync appointment to specialist pool", e);
  }
};

const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const getSpecialistAppointments = async (specialistId: number): Promise<Appointment[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  try {
    const key = APPOINTMENTS_STORAGE_KEY;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const allApps: Appointment[] = JSON.parse(stored);
    return allApps.filter(a => a.specialistId === specialistId);
  } catch (e) {
    console.error("Error fetching specialist appointments", e);
    return [];
  }
};

export const updateAppointmentBySpecialist = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
  try {
    const key = APPOINTMENTS_STORAGE_KEY;
    const stored = localStorage.getItem(key);
    if (!stored) return;
    
    const allApps: Appointment[] = JSON.parse(stored);
    const index = allApps.findIndex(a => a.id === appointmentId);
    
    if (index !== -1) {
      const updatedApp = { ...allApps[index], ...updates };
      allApps[index] = updatedApp;
      localStorage.setItem(key, JSON.stringify(allApps));

      // Sync back to patient's history record
      if (updatedApp.patientId) {
        const historyKey = `${HISTORY_STORAGE_KEY}_${updatedApp.patientId}`;
        const patientHistoryRaw = localStorage.getItem(historyKey);
        if (patientHistoryRaw) {
          const patientHistory: HistoryRecord[] = JSON.parse(patientHistoryRaw);
          const historyIndex = patientHistory.findIndex(h => h.appointment?.id === appointmentId);
          if (historyIndex !== -1) {
            patientHistory[historyIndex].appointment = updatedApp;
            if (updates.auscultation) {
              patientHistory[historyIndex].auscultation = updates.auscultation;
              // MEETING COMPLETE: Update status from Pending to Completed
              if (patientHistory[historyIndex].status === 'Pending') {
                 patientHistory[historyIndex].status = 'Completed';
                 patientHistory[historyIndex].notes = "Doctor's physical exam completed. Medical certificate unlocked.";
              }
            }
            localStorage.setItem(historyKey, JSON.stringify(patientHistory));
          }
        }
      }
    }
  } catch (e) {
    console.error("Failed to update appointment", e);
  }
};

export const updateHistoryRecord = async (userId: string, recordId: string, updates: Partial<HistoryRecord>): Promise<void> => {
  try {
    const key = `${HISTORY_STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return;
    
    const currentHistory: HistoryRecord[] = JSON.parse(stored);
    const index = currentHistory.findIndex(r => r.id === recordId);
    
    if (index !== -1) {
      currentHistory[index] = { ...currentHistory[index], ...updates };
      localStorage.setItem(key, JSON.stringify(currentHistory));

      // Sync appointment if updated
      if (updates.appointment || updates.auscultation || updates.fullResult) {
        saveAppointmentToSpecialist(
          currentHistory[index].appointment || (updates.appointment as Appointment), 
          currentHistory[index].symptoms, 
          userId,
          currentHistory[index].fullResult,
          currentHistory[index].auscultation
        );
      }
    }
  } catch (e) {
    console.error("Failed to update history record", e);
  }
};
