
import { Language } from "../types";

export const TRANSLATIONS = {
  en: {
    hero: {
      title: "Identify Symptoms.",
      subtitle: "Get help fast.",
      desc: "Powered by advanced Artificial Intelligence to help you understand your symptoms and guide you to the best course of action."
    },
    header: {
      howItWorks: "How it Works",
      faq: "FAQ",
      emergency: "Emergency",
      system: "Operational System",
      aboutMenuTitle: "About MurakMed-AI",
      aboutMenuSubtitle: "What Is It & Why use it?",
      doctorPortal: "Doctor Portal",
      patientMode: "Switch to Patient Mode"
    },
    doctor: {
      dashboard: "Specialist Dashboard",
      welcome: "Welcome, Dr.",
      upcoming: "Upcoming Appointments",
      availability: "My Availability",
      noAppointments: "No upcoming appointments scheduled.",
      patient: "Patient",
      symptoms: "Symptoms",
      time: "Time",
      status: "Status",
      manageSlots: "Manage Slots",
      updateStatus: "Update Status",
      currentStatus: "Current Status",
      available: "Available Today",
      unavailable: "Unavailable Today",
      tomorrow: "Available Tomorrow",
      busy: "Busy/Fully Booked",
      saveStatus: "Save Status",
      viewRecord: "View Medical Record",
      notified: "You will be notified of new bookings."
    },
    auscultation: {
      title: "Specialist Auscultation Test",
      subtitle: "Professional physical examination and sound analysis",
      heart: "Heart Sounds",
      lung: "Lung Sounds",
      bowel: "Bowel Sounds",
      findings: "Clinical Findings",
      performBtn: "Run Auscultation Test",
      saveBtn: "Save Examination Results",
      heartPlaceholder: "Describe heart rhythm and sounds (e.g., S1, S2 audible, no murmurs)",
      lungPlaceholder: "Describe breath sounds (e.g., Clear bilaterally, no wheezing)",
      bowelPlaceholder: "Describe abdominal sounds (e.g., Normoactive)",
      findingsPlaceholder: "Summary of physical examination findings",
      success: "Auscultation results recorded successfully.",
      viewResults: "View Exam Results"
    },
    scheduler: {
      title: "Schedule Appointment",
      selectDate: "Choose a Date",
      selectTime: "Select Time Slot",
      confirm: "Confirm Booking",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      selected: "Selected",
      success: "Appointment Saved Successfully!",
      backToResults: "← Back to Results",
      pendingChoice: "Pending Choice",
      bookNow: "Book Appointment",
      reminders: {
        title: "Reminders",
        enable: "Set a reminder for this appointment",
        method: "Reminder Method",
        email: "Email Notification",
        app: "In-App Notification",
        timing: "When to remind?",
        opt1: "1 hour before",
        opt2: "12 hours before",
        opt3: "1 day before"
      }
    },
    dashboard: {
      welcomeSub: "Welcome to the Future of Health",
      hello: "Hello",
      heroDesc: "MurakMed-AI isn't just a symptom analysis tool. It's your intelligent health companion, bridging the gap between complexity and care.",
      actions: {
        newAnalysis: "New Analysis",
        newAnalysisDesc: "Check your symptoms with AI",
        history: "Medical History",
        historyDesc: "Review your past reports",
        profile: "Profile Settings",
        profileDesc: "Manage your identity"
      },
      insights: {
        title: "The Power of MurakMed-AI",
        subtitle: "Leveraging the world's most advanced AI models to provide localized healthcare insights for Timor-Leste.",
        item1Title: "Instant Intelligence",
        item1Desc: "Seconds to analyze, minutes to action. We eliminate waiting.",
        item2Title: "Verified Guidance",
        item2Desc: "Condition-specialist mapping to ensure you see the right doctor.",
        item3Title: "Empathetic Tech",
        item3Desc: "Built for people, with simple language and caring insights."
      }
    },
    auth: {
      login: {
        title: "Welcome Back",
        subtitle: "Sign in to your MurakMed account",
        username: "Username",
        password: "Password",
        forgot: "Forgot?",
        signIn: "Sign In",
        noAccount: "New to MurakMed?",
        createAccount: "Create Account",
        recent: "Recently used on this device",
        error: "Invalid credentials. Try 'Sarah Silva' / 'doctor123'",
        cancel: "Cancel",
        doctorLogin: "Doctor/Specialist Login"
      },
      signup: {
        title: "Create Account",
        subtitle: "Join MurakMed AI to track your health journey",
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email Address",
        username: "Username",
        password: "Password",
        dob: "Date of Birth",
        sex: "Sex",
        uploadPhoto: "Upload Profile Photo",
        complete: "Complete Signup",
        haveAccount: "Already have an account?",
        signIn: "Sign In",
        error: "Signup failed. Please try again.",
        cancel: "Cancel"
      },
      reset: {
        title: "Reset Password",
        subtitle: "Verify your identity to secure your account",
        findAccount: "Find Account",
        backToLogin: "Back to Login",
        hello: "Hello",
        newPass: "New Password",
        confirmPass: "Confirm Password",
        mismatch: "Passwords do not match.",
        length: "Password must be at least 5 characters long.",
        successTitle: "Password Updated!",
        successDesc: "Your account is now secure. Redirecting you to login...",
        goNow: "Go Now",
        notYourAccount: "Not your account?"
      },
      profile: {
        title: "Account Settings",
        subtitle: "Manage your medical profile and security",
        save: "Save Profile Changes",
        success: "Profile updated successfully!",
        back: "Back"
      }
    },
    history: {
      title: "Medical History",
      noRecords: "No medical history records found yet.",
      startNew: "Start a new symptom check to create a record.",
      visits: "Visits",
      lastUpdate: "Last Update",
      snapshot: "Symptom Snapshot:",
      reference: "Reference ID",
      reportTitle: "Medical Report",
      verifiedPatient: "Verified Patient",
      symptoms: "Reported Symptoms",
      notes: "Doctor's Notes / Summary",
      noNotes: "No additional notes recorded for this visit.",
      primaryDiagnosis: "Primary Diagnosis",
      specialist: "Recommended Specialist",
      archive: "Full Analysis Archive",
      notAvailable: "Detailed AI analysis data not available for this record.",
      pendingSpecialist: "Pending Specialist Selection"
    },
    certificate: {
      title: "MEDICAL CERTIFICATE",
      subTitle: "Artificial Intelligence Health Assessment",
      certId: "Certificate ID",
      issuedDate: "Date of Issue",
      patientInfo: "Patient Information",
      clinicalFindings: "Clinical Findings & AI Analysis",
      primaryDiagnosis: "Primary Suggested Condition",
      probability: "Likelihood",
      reportedSymptoms: "Reported Symptoms",
      recommendations: "Recommendations",
      advice: "General Health Advice",
      disclaimer: "DISCLAIMER: This certificate is generated by AI for informational purposes only. It does not replace a physical examination by a registered medical practitioner. Please consult a doctor for a definitive diagnosis.",
      verified: "AI VERIFIED",
      downloadBtn: "Download Certificate (PDF)",
      notAvailable: "Certificate will be available after your specialist meeting."
    },
    input: {
      title: "Patient Info & Symptoms",
      desc: "Provide clear details to get accurate results.",
      name: "Full Name",
      dob: "Date of Birth",
      age: "Age",
      sex: "Sex",
      sexOptions: {
        select: "Select (Optional)...",
        male: "Male",
        female: "Female",
        other: "Other"
      },
      address: "Address",
      addressPlaceholder: "Street, City (Optional)",
      onset: "When did it start?",
      onsetPlaceholder: "e.g., 2 days ago (Optional)",
      symptomsLabel: "Describe Symptoms",
      symptomsPlaceholder: "Describe what the patient is feeling, or upload an image...",
      imagePlaceholder: "Add optional text to describe the image...",
      quickAdd: "Quick Add:",
      uploadBtn: "Add Photo",
      changePhoto: "Change Photo",
      analyzeBtn: "Record & Analyze",
      analyzing: "Analyzing...",
      fileError: "File too large. Please upload an image under 5MB."
    },
    commonSymptoms: ["Headache", "Fever", "Cough", "Nausea", "Fatigue", "Sore Throat", "Itchy Skin", "Dizziness"],
    results: {
      title: "Analysis Results",
      recordSaved: "Saved to History",
      recordFailed: "Save Failed",
      newRecord: "New Record",
      emergencyTitle: "Potential Medical Emergency",
      emergencyDefault: "Your symptoms indicate a serious condition. Please seek immediate medical attention or call emergency services.",
      seekEmergency: "Seek Emergency Services",
      conditionsTitle: "Possible Conditions",
      recommendedAction: "Recommended Actions",
      whyThis: "Why this matches:",
      medications: "Suggested Medications & Treatments",
      dosage: "Dosage:",
      nextStep: "NEXT STEP",
      disclaimer: "MurakMed AI provides information only. It does not substitute professional medical advice, diagnosis, or treatment.",
      specialistsTitle: "Recommended Specialists",
      callDoctor: "Call Doctor",
      noSpecialist: "No specific specialist available for this condition. Please consult a General Practitioner.",
      selectSpecialist: "Choose preferred specialist",
      specialistChosen: "Specialist chosen",
      filterLabel: "Filter by availability:",
      filterAll: "All",
      filterToday: "Available Today",
      filterTomorrow: "Tomorrow",
      filterLater: "Later"
    },
    specialistNames: {
      "General Practitioner": "General Practitioner",
      "Cardiologist": "Cardiologist",
      "Dermatologist": "Dermatologist",
      "Neurologist": "Neurologist",
      "Pediatrician": "Pediatrician",
      "ENT Specialist": "ENT Specialist",
      "Internal Medicine": "Internal Medicine",
      "Ophthalmologist": "Ophthalmologist",
      "Orthopedic Surgeon": "Orthopedic Surgeon",
      "Obstetrician-Gynecologist": "Obstetrician-Gynecologist",
      "Dentist": "Dentist",
      "Psychiatrist": "Psychiatrist"
    },
    about: {
      back: "Back",
      title: "About MurakMed-",
      bio1: "MurakMed-AI is an intelligent health assistant designed to bridge the gap between patients and medical understanding. Powered by advanced Artificial Intelligence, it helps users decipher complex symptoms and provides instant, easy-to-understand health insights.",
      bio2: "Our mission is to make preliminary health assessment accessible to everyone, ensuring that language and location are never barriers to understanding your own health.",
      whyTitle: "Why you should use MurakMed-AI",
      features: [
        { title: "Advanced AI Analysis", desc: "Utilizes state-of-the-art Gemini models to analyze symptoms with high precision and provide context-aware medical suggestions." },
        { title: "Instant Results", desc: "No waiting rooms. Get a preliminary analysis of your condition in seconds, available 24/7 whenever you need it." },
        { title: "Comprehensive Care", desc: "Goes beyond just naming a disease. We provide recommended actions, potential medications, and lifestyle advice." },
        { title: "Privacy Focused", desc: "Your health journey is private. We process your symptoms anonymously and prioritize your data security." }
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          q: "Is MurakMed AI a replacement for a real doctor?",
          a: "No. MurakMed AI is an informational tool designed to help you understand potential causes of your symptoms. It cannot provide an official medical diagnosis. Always consult a qualified healthcare professional for medical decisions."
        },
        {
          q: "How does the AI analyze my symptoms?",
          a: "The app uses Google's advanced Gemini AI models. It compares the symptoms you describe (text or image) against a vast database of medical knowledge to identify patterns and suggest probable conditions."
        },
        {
          q: "Is my personal data safe?",
          a: "Yes. We prioritize privacy. While we record visit data to help improve healthcare tracking, we do not share your personal identifiable information with third-party advertisers."
        },
        {
          q: "What should I do if the app shows a red Emergency alert?",
          a: "If you see a red Emergency alert, ignore the other details and seek immediate medical help at the nearest hospital or call emergency services right away."
        },
        {
          q: "Why are some specialist recommendations in English?",
          a: "To ensure accuracy when matching with our database of local doctors, specific medical titles (like 'Cardiologist') are kept in English, even if the rest of the app is in Tetum or Indonesian."
        }
      ]
    },
    footer: {
      safety: "MurakMed AI provides informational suggestions only. For best results, seek advice from your doctor or qualified health professional.",
      copyright: "All Rights Reserved."
    },
    error: "There was a problem during analysis. Please try again."
  },
  tet: {
    hero: {
      title: "Identifika Sintomas.",
      subtitle: "Ajuda ita lalais.",
      desc: "Apoia husi Inteligénsia Artifisial avansadu atu facilita kompriensaun kona-ba saida mak ita sente no orienta medida ne’ebé mak di’ak liu atu halo."
    },
    header: {
      howItWorks: "Oinsá Servisu",
      faq: "Perguntas (FAQ)",
      emergency: "Emerjénsia",
      system: "Sistema Operasional",
      aboutMenuTitle: "Kona-ba MurakMed-AI",
      aboutMenuSubtitle: "Saida Mak & Tansa Uza?",
      doctorPortal: "Portal Doutór",
      patientMode: "Troka ba Modu Pasiente"
    },
    doctor: {
      dashboard: "Dashboard Espesialista",
      welcome: "Benvinda, Dr.",
      upcoming: "Ajendamentu Tuirmai",
      availability: "Ha'u-nia Disponibilidade",
      noAppointments: "Laiha ajendamentu foun.",
      patient: "Pasiente",
      symptoms: "Sintoma",
      time: "Oras",
      status: "Status",
      manageSlots: "Jere Oras",
      updateStatus: "Atualiza Status",
      currentStatus: "Status Agora",
      available: "Disponivel Ohin",
      unavailable: "La Disponivel",
      tomorrow: "Disponivel Aban",
      busy: "Ocupadu/Prizu",
      saveStatus: "Rai Status",
      viewRecord: "Haree Rejista Médiku",
      notified: "Ita sei hetan notifikasaun ba ajendamentu foun."
    },
    auscultation: {
      title: "Teste Auskultasaun Espesialista",
      subtitle: "Ezame fíziku profesional no análize lian isin nian",
      heart: "Lian Fuan",
      lung: "Lian Pulmaun",
      bowel: "Lian Kabun",
      findings: "Konkluzaun Kliniku",
      performBtn: "Hala'o Teste Auskultasaun",
      saveBtn: "Rai Rezultadu Ezame",
      heartPlaceholder: "Deskreve ritmu no lian fuan (ez: S1, S2 rona, laiha sopru)",
      lungPlaceholder: "Deskreve lian dada iis (ez: moos iha sorin rua, laiha sibeiru)",
      bowelPlaceholder: "Deskreve lian husi kabun laran (ez: normoativu)",
      findingsPlaceholder: "Rezumu husi konkluzaun ezame fíziku",
      success: "Rezultadu auskultasaun rejista ho susesu.",
      viewResults: "Haree Rezultadu Ezame"
    },
    scheduler: {
      title: "Ajenda Konsulta",
      selectDate: "Hili Loron",
      selectTime: "Hili Oras",
      confirm: "Konfirma Rezerva",
      morning: "Dadeer",
      afternoon: "Lokraik",
      evening: "Kalan",
      selected: "Hili Ona",
      success: "Ajendamentu Rai Ona ho Susesu!",
      backToResults: "← Fila ba Rezultadu",
      pendingChoice: "Seidauk Hili",
      bookNow: "Ajenda Konsulta",
      reminders: {
        title: "Lembransa (Reminders)",
        enable: "Halo lembransa ba ajendamentu ida ne'e",
        method: "Metodu Lembransa",
        email: "Notifikasaun E-mail",
        app: "Notifikasaun iha App",
        timing: "Horibainhira atu fo lembransa?",
        opt1: "Oras 1 molok",
        opt2: "Oras 12 molok",
        opt3: "Loron 1 molok"
      }
    },
    dashboard: {
      welcomeSub: "Benvinda ba Futuru Saude nian",
      hello: "Olá",
      heroDesc: "MurakMed-AI la'ós de'it análize sintoma ida. Ne'e mak ita-nia akompañante saude intelijente, hodi liga entre kompleksidade no kuidadu.",
      actions: {
        newAnalysis: "Análize Foun",
        newAnalysisDesc: "Análize ita-nia sintoma ho AI",
        history: "Istóriku Médiku",
        historyDesc: "Haree fali ita-nia rezultadu pasadu",
        profile: "Konfigurasaun Perfil",
        profileDesc: "Jere ita-nia identidade"
      },
      insights: {
        title: "Podér husi MurakMed-AI",
        subtitle: "Uza modelu AI avansadu liu iha mundu atu fornese informasaun saude lokalizadu ba Timor-Leste.",
        item1Title: "Intelijénsia Imediatu",
        item1Desc: "Segundu de'it atu analiza, minutu de'it atu foti asaun. Ami hasai tiha tempu hein.",
        item2Title: "Orientasaun Verifikadu",
        item2Desc: "Mapeamentu kondisaun-espesialista atu garante ita hasoru doutór ne'ebé loos.",
        item3Title: "Teknolojia ho Empatia",
        item3Desc: "Imajinadu ba ema, ho lian simples no kuidadu.",
      }
    },
    auth: {
      login: {
        title: "Benvinda Fila Fali",
        subtitle: "Tama ba ita-nia konta MurakMed",
        username: "Uza-na'in",
        password: "Kontrasenia",
        forgot: "Haluha?",
        signIn: "Tama",
        noAccount: "Seidauk iha konta?",
        createAccount: "Rejista Konta",
        recent: "Uza foin lalais iha dispozitivu ne'e",
        error: "Kredensia la loos. Koko 'Sarah Silva' / 'doctor123'",
        cancel: "Kansela",
        doctorLogin: "Login Doutór/Espesialista"
      },
      signup: {
        title: "Rejista Konta",
        subtitle: "Partisipa iha MurakMed AI atu akompaña ita-nia saúde",
        firstName: "Naran Primeiru",
        lastName: "Naran Apelidu",
        email: "E-mail",
        username: "Uza-na'in",
        password: "Kontrasenia",
        dob: "Data Moris",
        sex: "Seksu",
        uploadPhoto: "Upload Foto Perfil",
        complete: "Kompleta Rejista",
        haveAccount: "Iha tiha ona konta?",
        signIn: "Tama",
        error: "Falla atu rejista. Favor koko fali.",
        cancel: "Kansela"
      },
      reset: {
        title: "Troka Kontrasenia",
        subtitle: "Verifika identidade atu asegura ita-nia konta",
        findAccount: "Buka Konta",
        backToLogin: "Buka Konta",
        hello: "Olá",
        newPass: "Kontrasenia Foun",
        confirmPass: "Konfirma Kontrasenia",
        mismatch: "Kontrasenia la hanesan.",
        length: "Kontrasenia tenke iha karakter 5 ba leten.",
        successTitle: "Kontrasenia Troka Ona!",
        successDesc: "Ita-nia konta agora seguru ona. Redireksiona ba pajina tama...",
        goNow: "Bá Agora",
        notYourAccount: "La'ós ita-nia konta?"
      },
      profile: {
        title: "Konfigurasaun Konta",
        subtitle: "Jere ita-nia perfil médiku no seguransa",
        save: "Rai Mudansa Perfil",
        success: "Perfil atualiza ona ho susesu!",
        back: "Fila"
      }
    },
    history: {
      title: "Istóriku Médiku",
      noRecords: "Seidauk iha rejista istóriku médiku.",
      startNew: "Komesa análize sintoma foun atu kria rejista ida.",
      visits: "Vizita",
      lastUpdate: "Atualiza ikus",
      snapshot: "Rezumu Sintoma:",
      reference: "ID Referénsia",
      reportTitle: "Relatóriu Médiku",
      verifiedPatient: "Pasiente Verifikadu",
      symptoms: "Sintoma ne'ebé Relata",
      notes: "Nota Doutór / Rezumu",
      noNotes: "Laiha nota adisional ba vizita isu ne'e.",
      primaryDiagnosis: "Diagnoza Prinsipal",
      specialist: "Espesialista Rekomendada",
      archive: "Arkivu Análize Kompletu",
      notAvailable: "Dadus análize AI ladun kompletu ba rejista iha ne'e.",
      pendingSpecialist: "Seidauk Hili Espesialista"
    },
    certificate: {
      title: "SERTIFIKADU MÉDIKU",
      subTitle: "Avaliasaun Saude Inteligénsia Artifisial",
      certId: "ID Sertifikadu",
      issuedDate: "Data Emisaun",
      patientInfo: "Informasaun Pasiente",
      clinicalFindings: "Rezultadu Kliniku & Análize AI",
      primaryDiagnosis: "Kondisaun Sujeridu Prinsipal",
      probability: "Posibilidade",
      reportedSymptoms: "Sintoma ne'ebé Relata",
      recommendations: "Rekomendasaun",
      advice: "Konsellu Saude Jerál",
      disclaimer: "AVISU: Sertifikadu ida ne'e jere husi AI ba kestaun informativu de'it. Ne'e la substitui ezame fíziku husi profesional saúde ne'ebé rejistadu. Favor konsulta doutór ba diagnoza definitivu.",
      verified: "VERIFIKADU AI",
      downloadBtn: "Download Sertifikadu (PDF)",
      notAvailable: "Sertifikadu disponivel hafoin hasoru doutor."
    },
    input: {
      title: "Informasaun Pasiente & Sintoma",
      desc: "Fornese informasaun lolos no ka'an hodi hetan diagnoza ne'ebe akuradu.",
      name: "Naran Kompletu",
      dob: "Data Moris",
      age: "Idade",
      sex: "Seksu",
      sexOptions: {
        select: "Hili (Opsional)...",
        male: "Mane",
        female: "Feto",
        other: "Seluk"
      },
      address: "Hela Fatin",
      addressPlaceholder: "Estrada, Sidade (Opsional)",
      onset: "Moras komesa horibainhira?",
      onsetPlaceholder: "ez. loron 2 liuba (Opsional)",
      symptomsLabel: "Deskreve Sintomas",
      symptomsPlaceholder: "Deskreve saida mak pasiente sente, ka upload imajen kondisaun nian...",
      imagePlaceholder: "Aumenta testu opsional atu deskreve imajen...",
      quickAdd: "Aumenta Lalais:",
      uploadBtn: "Aumenta Foto",
      changePhoto: "Troka Foto",
      analyzeBtn: "Grava & Analiza",
      analyzing: "Analiza hela...",
      fileError: "File boot liu. Favor upload imajen menus husi 5MB."
    },
    commonSymptoms: ["Ulun Moras", "Isin Manas", "Mear", "Muta", "Kole", "Kakorok Moras", "Isin Katar", "Oin Halai"],
    results: {
      title: "Rezultadu Análize",
      recordSaved: "Rezultadu Rai Ona",
      recordFailed: "Falla atu Rai Rekord",
      newRecord: "Rejista Foun",
      emergencyTitle: "Emerjénsia Médika Potensial",
      emergencyDefault: "Ita-nia sintoma indika kondisaun sériu. Favor buka atendimentu médiku imediatu ka liga ba servisu emerjénsia.",
      seekEmergency: "Buka Servisu Emerjénsia",
      conditionsTitle: "Kondisaun Potensial",
      recommendedAction: "Asaun Rekomendada",
      whyThis: "Tansá ida ne'e hanesan:",
      medications: "Medikamentu & Tratamentu Sujeridu",
      dosage: "Doze:",
      nextStep: "PASU TUIRMAI",
      disclaimer: "MurakMed AI fornese informasaun de'it. Ne'e la substitui konsellu médiku profisional, diagnoz, ka tratamentu.",
      specialistsTitle: "Espesialista Rekomendada",
      callDoctor: "Liga Doutor",
      noSpecialist: "La hetan espesialista espesifiku. Favor konsulta ho Doutor Jeral.",
      selectSpecialist: "Hili espesialista ne'ebé ita prefere",
      specialistChosen: "Hili ona",
      filterLabel: "Hili tuir disponibilidade:",
      filterAll: "Hotu-hotu",
      filterToday: "Disponivel Ohin",
      filterTomorrow: "Aban",
      filterLater: "Seluk fali"
    },
    specialistNames: {
      "General Practitioner": "Médiku Jerál",
      "Cardiologist": "Kardiologista",
      "Dermatologist": "Dermatologista",
      "Neurologist": "Neurolofista",
      "Pediatrician": "Pediatra",
      "ENT Specialist": "Espesialista ENT",
      "Internal Medicine": "Medisina Interna",
      "Ophthalmologist": "Oftalmologista",
      "Orthopedic Surgeon": "Sirurjiaun Ortopédiku",
      "Obstetrician-Gynecologist": "Obstetra-Jinekolojista",
      "Dentist": "Dentista",
      "Psychiatra": "Psikiatra"
    },
    about: {
      back: "Fila",
      title: "Kona-ba MurakMed-",
      bio1: "MurakMed-AI mak asistente saude intelijente ne'ebé dezenvolve atu sai ponte entre pasiente no kompriensaun médiku. Uza Inteligénsia Artifisial avansadu, ajuda uza-na'in komprende sintoma komplikadu no fornese informasaun saude ne'ebé fasil komprende.",
      bio2: "Ami-nia misaun mak atu halo avaliasaun saude preliminariu asesivel ba ema hotu, garante katak lian no lokasaun la sai obstákulu atu komprende ita-nia saude rasik.",
      whyTitle: "Tansa Uza MurakMed-AI",
      features: [
        { title: "Análize AI Avansadu", desc: "Uza modelu Gemini foun liu atu analiza sintoma ho presizaun aas no fornese sujestaun médiku ne'ebé relevante." },
        { title: "Rezultadu Imediatu", desc: "La presiza hein. Hetan análize preliminariu kona-ba ita-nia kondisaun iha segundu laran, disponivel 24/7 bainhira de'it ita presiza." },
        { title: "Kuidadu Abranjente", desc: "La'ós de'it identifika moras. Ami fornese asaun rekomendada, medikamentu potensial, no konsellu estilu moris." },
        { title: "Privasidade Prioridade", desc: "Ita-nia jornada saude privadu. Ami prozesa ita-nia sintoma ho anónimu no prioriza seguransa dadus." }
      ]
    },
    faq: {
      title: "Perguntas Baibain (FAQ)",
      items: [
        {
          q: "MurakMed AI troka fali Doutor sira ka lae?",
          a: "Lae. MurakMed AI mak ferramenta informasaun nian de'it atu ajuda komprende kauza husi ita-nia sintoma. Nia labele fo diagnoza ofisial. Favor konsulta nafatin ho profesional saude."
        },
        {
          q: "Oinsá AI analiza ha'u-nia sintoma?",
          a: "Aplikasaun ne'e uza modelu Google Gemini AI. Nia kompara sintoma ne'ebé ita hakerek (testu ka imajen) ho database mediku boot atu identifika padraun no sujere kondisaun provavel."
        },
        {
          q: "Ha'u-nia dadus privadu seguru ka lae?",
          a: "Sin. Ami tau importansia ba privasidade. Maske ami rai dadus vizita nian atu hadia servisu, ami la fahe informasaun pessoal ba ema seluk."
        },
        {
          q: "Saida mak ha'u tenke halo se aplikasaun hatudu avizu Emerjénsia mean?",
          a: "Se ita haree avizu Emerjénsia mean, ignora detalhe seluk no buka kedas ajuda médiku iha ospital besik ka liga ba servisu emerjénsia."
        },
        {
          q: "Tansá rekomendasaun espesialista balu uza lian Inglés?",
          a: "Atu garante katak ami rekomenda doutor ne'ebé los husi ami-nia database, titulu médiku (hanesan 'Cardiologist') mantem iha Inglés, maske aplikasaun uza lian Tetum."
        }
      ]
    },
    footer: {
      safety: "MurakMed AI fornese sujestaun informativu de'it. Atu diak liu, buka konsellu husi ita-nia doutór, profesional saude ne'ebe kualifikadu.",
      copyright: "Direitu hotu rezervadu."
    },
    error: "Iha problema durante análize dadus. Favor koko fali."
  },
  id: {
    hero: {
      title: "Identifikasi Gejala.",
      subtitle: "Dapatkan bantuan cepat.",
      desc: "Didukung oleh Kecerdasan Buatan canggih untuk membantu Anda memahami gejala dan memandu Anda ke tindakan terbaik."
    },
    header: {
      howItWorks: "Cara Kerja",
      faq: "FAQ",
      emergency: "Darurat",
      system: "Sistem Operasional",
      aboutMenuTitle: "Tentang MurakMed-AI",
      aboutMenuSubtitle: "Apa & Mengapa menggunakannya?",
      doctorPortal: "Portal Dokter",
      patientMode: "Beralih ke Mode Pasien"
    },
    doctor: {
      dashboard: "Dasbor Spesialis",
      welcome: "Selamat Datang, Dr.",
      upcoming: "Janji Temu Mendatang",
      availability: "Ketersediaan Saya",
      noAppointments: "Belum ada janji temu.",
      patient: "Pasien",
      symptoms: "Gejala",
      time: "Waktu",
      status: "Status",
      manageSlots: "Kelola Slot",
      updateStatus: "Perbarui Status",
      currentStatus: "Status Saat Ini",
      available: "Tersedia Hari Ini",
      unavailable: "Tidak Tersedia",
      tomorrow: "Tersedia Besok",
      busy: "Sibuk/Penuh",
      saveStatus: "Simpan Status",
      viewRecord: "Lihat Rekam Medis",
      notified: "Anda akan diberitahu jika ada janji temu baru."
    },
    auscultation: {
      title: "Uji Auskultasi Spesialis",
      subtitle: "Pemeriksaan fisik profesional dan analisis suara",
      heart: "Suara Jantung",
      lung: "Suara Paru",
      bowel: "Suara Perut",
      findings: "Temuan Klinis",
      performBtn: "Jalankan Tes Auskultasi",
      saveBtn: "Simpan Hasil Pemeriksaan",
      heartPlaceholder: "Jelaskan ritme dan suara jantung (cth: S1, S2 terdengar, tidak ada bising)",
      lungPlaceholder: "Jelaskan suara nafas (cth: Bersih secara bilateral, tidak ada mengi)",
      bowelPlaceholder: "Jelaskan suara usus (cth: Normoaktif)",
      findingsPlaceholder: "Ringkasan temuan pemeriksaan fisik",
      success: "Hasil auskultasi berhasil direkam.",
      viewResults: "Lihat Hasil Pemeriksaan"
    },
    scheduler: {
      title: "Buat Janji Temu",
      selectDate: "Pilih Tanggal",
      selectTime: "Pilih Waktu",
      confirm: "Konfirmasi Pemesanan",
      morning: "Pagi",
      afternoon: "Siang",
      evening: "Sore",
      selected: "Terpilih",
      success: "Janji Temu Berhasil Disimpan!",
      backToResults: "← Kembali ke Hasil",
      pendingChoice: "Belum Memilih",
      bookNow: "Buat Janji Temu",
      reminders: {
        title: "Pengingat",
        enable: "Atur pengingat untuk janji temu ini",
        method: "Metode Pengingat",
        email: "Notifikasi Email",
        app: "Notifikasi Aplikasi",
        timing: "Kapan diingatkan?",
        opt1: "1 jam sebelumnya",
        opt2: "12 jam sebelumnya",
        opt3: "1 hari sebelumnya"
      }
    },
    dashboard: {
      welcomeSub: "Selamat Datang di Masa Depan Kesehatan",
      hello: "Halo",
      heroDesc: "MurakMed-AI bukan sekadar alat analisis gejala. Ini adalah pendamping kesehatan cerdas Anda, menjembatani kesenjangan antara kompleksitas dan perawatan.",
      actions: {
        newAnalysis: "Analisis Baru",
        newAnalysisDesc: "Analisis gejala Anda dengan AI",
        history: "Riwayat Medis",
        historyDesc: "Tinjau laporan masa lalu Anda",
        profile: "Pengaturan Profil",
        profileDesc: "Kelola identitas Anda"
      },
      insights: {
        title: "Kekuatan MurakMed-AI",
        subtitle: "Memanfaatkan model AI tercanggih di dunia untuk memberikan wawasan kesehatan lokal bagi Timor-Leste.",
        item1Title: "Kecerdasan Instan",
        item1Desc: "Detik untuk menganalisis, menit untuk bertindak. Kami menghilangkan waktu tunggu.",
        item2Title: "Panduan Terverifikasi",
        item2Desc: "Pemetaan kondisi-spesialis untuk memastikan Anda menemui dokter yang tepat.",
        item3Title: "Teknologi Empati",
        item3Desc: "Dibangun untuk orang-orang, dengan bahasa yang sederhana dan perhatian yang tulus.",
      }
    },
    auth: {
      login: {
        title: "Selamat Datang Kembali",
        subtitle: "Masuk ke akun MurakMed Anda",
        username: "Nama Pengguna",
        password: "Kata Sandi",
        forgot: "Lupa?",
        signIn: "Masuk",
        noAccount: "Belum punya akun?",
        createAccount: "Buat Akun",
        recent: "Baru digunakan di perangkat ini",
        error: "Kredensial tidak valid. Coba 'Sarah Silva' / 'doctor123'",
        cancel: "Batal",
        doctorLogin: "Login Dokter/Spesialis"
      },
      signup: {
        title: "Buat Akun",
        subtitle: "Bergabung dengan MurakMed AI untuk memantau kesehatan Anda",
        firstName: "Nama Depan",
        lastName: "Nama Belakang",
        email: "Alamat Email",
        username: "Nama Pengguna",
        password: "Kata Sandi",
        dob: "Tanggal Lahir",
        sex: "Jenis Kelamin",
        uploadPhoto: "Unggah Foto Profil",
        complete: "Selesaikan Pendaftaran",
        haveAccount: "Sudah punya akun?",
        signIn: "Masuk",
        error: "Pendaftaran gagal. Silakan coba lagi.",
        cancel: "Batal"
      },
      reset: {
        title: "Atur Ulang Kata Sandi",
        subtitle: "Verifikasi identitas Anda untuk mengamankan akun",
        findAccount: "Cari Akun",
        backToLogin: "Kembali ke Masuk",
        hello: "Halo",
        newPass: "Kata Sandi Baru",
        confirmPass: "Konfirmasi Kata Sandi",
        mismatch: "Kata sandi tidak cocok.",
        length: "Kata sandi minimal 5 karakter.",
        successTitle: "Kata Sandi Diperbarui!",
        successDesc: "Akun Anda sekarang aman. Mengalihkan ke halaman masuk...",
        goNow: "Buka Sekarang",
        notYourAccount: "Bukan akun Anda?"
      },
      profile: {
        title: "Pengaturan Akun",
        subtitle: "Kelola profil medis dan keamanan Anda",
        save: "Simpan Perubahan Profil",
        success: "Profil berhasil diperbarui!",
        back: "Kembali"
      }
    },
    history: {
      title: "Riwayat Medis",
      noRecords: "Belum ada catatan riwayat medis.",
      startNew: "Mulai analisis gejala baru untuk membuat catatan.",
      visits: "Kunjungan",
      lastUpdate: "Pembaruan Terakhir",
      snapshot: "Ringkasan Gejala:",
      reference: "ID Referensi",
      reportTitle: "Laporan Medis",
      verifiedPatient: "Pasien Terverifikasi",
      symptoms: "Gejala yang Dilaporkan",
      notes: "Catatan Dokter / Ringkasan",
      noNotes: "Tidak ada catatan tambahan untuk kunjungan ini.",
      primaryDiagnosis: "Diagnosis Utama",
      specialist: "Spesialis yang Disarankan",
      archive: "Arsip Analisis Lengkap",
      notAvailable: "Data analisis AI tidak tersedia untuk catatan ini.",
      pendingSpecialist: "Belum Memilih Spesialis"
    },
    certificate: {
      title: "SURAT KETERANGAN MEDIS",
      subTitle: "Penilaian Kesehatan Kecerdasan Buatan",
      certId: "ID Sertifikat",
      issuedDate: "Tanggal Terbit",
      patientInfo: "Informasi Pasien",
      clinicalFindings: "Temuan Klinis & Analisis AI",
      primaryDiagnosis: "Kondisi Utama yang Disarankan",
      probability: "Kemungkinan",
      reportedSymptoms: "Gejala yang Dilaporkan",
      recommendations: "Rekomendasi",
      advice: "Saran Kesehatan Umum",
      disclaimer: "DISCLAIMER: Sertifikat ini dibuat oleh AI untuk tujuan informasi saja. Ini tidak menggantikan pemeriksaan fisik oleh praktisi medis terdaftar. Silakan berkonsultasi dengan dokter untuk diagnosis definitif.",
      verified: "VERIFIKASI AI",
      downloadBtn: "Unduh Sertifikat (PDF)",
      notAvailable: "Sertifikat tersedia setelah bertemu dokter."
    },
    input: {
      title: "Info Pasien & Gejala",
      desc: "Berikan detail yang jelas untuk mendapatkan hasil yang akurat.",
      name: "Nama Lengkap",
      dob: "Tanggal Lahir",
      age: "Umur",
      sex: "Jenis Kelamin",
      sexOptions: {
        select: "Pilih (Opsional)...",
        male: "Laki-laki",
        female: "Perempuan",
        other: "Lainnya"
      },
      address: "Alamat",
      addressPlaceholder: "Jalan, Kota (Opsional)",
      onset: "Kapan mulai sakit?",
      onsetPlaceholder: "cth. 2 hari yang lalu (Opsional)",
      symptomsLabel: "Jelaskan Gejala",
      symptomsPlaceholder: "Jelaskan apa yang dirasakan pasien, atau unggah gambar...",
      imagePlaceholder: "Tambahkan teks opsional untuk menjelaskan gambar...",
      quickAdd: "Tambah Cepat:",
      uploadBtn: "Tambah Foto",
      changePhoto: "Ganti Foto",
      analyzeBtn: "Rekam & Analisis",
      analyzing: "Menganalisis...",
      fileError: "File terlalu besar. Harap unggah gambar di bawah 5MB."
    },
    commonSymptoms: ["Sakit Kepala", "Demam", "Batuk", "Mual", "Lelah", "Sakit Tenggorokan", "Gatal", "Pusing"],
    results: {
      title: "Hasil Analisis",
      recordSaved: "Simpan ke Riwayat",
      recordFailed: "Gagal Menyimpan",
      newRecord: "Rekam Baru",
      emergencyTitle: "Potensi Darurat Medis",
      emergencyDefault: "Gejala Anda menunjukkan kondisi serius. Segera cari bantuan medis atau hubungi layanan darurat.",
      seekEmergency: "Cari Layanan Darurat",
      conditionsTitle: "Kemungkinan Kondisi",
      recommendedAction: "Tindakan yang Disarankan",
      whyThis: "Mengapa ini cocok:",
      medications: "Saran Obat & Perawatan",
      dosage: "Dosis:",
      nextStep: "LANGKAH BERIKUTNYA",
      disclaimer: "MurakMed AI hanya menyediakan informasi. Ini tidak menggantikan saran medis profesional, diagnosis, atau perawatan.",
      specialistsTitle: "Recommended Specialists",
      callDoctor: "Hubungi Dokter",
      noSpecialist: "Tidak ada spesialis khusus yang ditemukan. Silakan konsultasi dengan Dokter Umum.",
      selectSpecialist: "Pilih spesialis pilihan Anda",
      specialistChosen: "Terpilih",
      filterLabel: "Filter berdasarkan ketersediaan:",
      filterAll: "Semua",
      filterToday: "Tersedia Hari Ini",
      filterTomorrow: "Besok",
      filterLater: "Nanti"
    },
    specialistNames: {
      "General Practitioner": "Dokter Umum",
      "Cardiologist": "Spesialis Jantung",
      "Dermatologist": "Spesialis Kulit",
      "Neurologist": "Spesialis Saraf",
      "Pediatrician": "Spesialis Anak",
      "ENT Specialist": "Spesialis THT",
      "Internal Medicine": "Spesialis Penyakit Dalam",
      "Ophthalmologist": "Spesialis Mata",
      "Orthopedic Surgeon": "Bedah Ortopedi",
      "Obstetrician-Gynecologist": "Dokter Kandungan",
      "Dentist": "Dokter Gigi",
      "Psychiatrist": "Psikiater"
    },
    about: {
      back: "Kembali",
      title: "Tentang MurakMed-",
      bio1: "MurakMed-AI adalah asisten kesehatan cerdas yang dirancang untuk menjembatani kesenjangan antara pasien dan pemahaman medis. Didukung oleh Kecerdasan Buatan canggih, membantu pengguna menguraikan gejala kompleks dan memberikan wawasan kesehatan yang instan dan mudah dimengerti.",
      bio2: "Misi kami adalah membuat penilaian kesehatan awal dapat diakses oleh semua orang, memastikan bahwa bahasa dan lokasi tidak pernah menjadi penghalang untuk memahami kesehatan Anda sendiri.",
      whyTitle: "Mengapa Anda harus menggunakan MurakMed-AI",
      features: [
        { title: "Analisis AI Canggih", desc: "Menggunakan model Gemini mutakhir untuk menganalisis gejala dengan presisi tinggi dan memberikan saran medis yang sadar konteks." },
        { title: "Hasil Instan", desc: "Tidak ada ruang tunggu. Dapatkan analisis awal kondisi Anda dalam hitungan detik, tersedia 24/7 kapan pun Anda membutuhkannya." },
        { title: "Perawatan Komprehensif", desc: "Lebih dari sekadar menamai penyakit. Kami memberikan tindakan yang disarankan, obat potensial, dan saran gaya hidup." },
        { title: "Fokus Privasi", desc: "Perjalanan kesehatan Anda bersifat pribadi. Kami memproses gejala Anda secara anonim dan memprioritaskan keamanan data Anda." }
      ]
    },
    faq: {
      title: "Pertanyaan Umum (FAQ)",
      items: [
        {
          q: "Apakah MurakMed AI pengganti dokter asli?",
          a: "Tidak. MurakMed AI adalah alat informasi yang dirancang untuk membantu Anda memahami potensi penyebab gejala Anda. Ini tidak dapat memberikan diagnosis medis resmi. Selalu berkonsultasi dengan profesional kesehatan yang berkualifikasi."
        },
        {
          q: "Bagaimana AI menganalisis gejala saya?",
          a: "Aplikasi ini menggunakan model Google Gemini AI yang canggih. Ini membandingkan gejala yang Anda jelaskan (teks atau gambar) dengan basis data pengetahuan medis yang luas untuk mengidentifikasi pola dan menyarankan kondisi yang mungkin."
        },
        {
          q: "Apakah data pribadi saya aman?",
          a: "Ya. Kami memprioritaskan privasi. Meskipun kami merekam data kunjungan untuk membantu meningkatkan pelacakan kesehatan, kami tidak membagikan informasi identitas pribadi Anda kepada pengiklan pihak ketiga."
        },
        {
          q: "Apa yang harus saya lakukan jika aplikasi menunjukkan peringatan Darurat merah?",
          a: "Jika Anda melihat peringatan Darurat merah, abaikan detail lainnya dan segera cari bantuan medis di rumah sakit terdekat atau hubungi layanan darurat segera."
        },
        {
          q: "Mengapa beberapa rekomendasi spesialis dalam bahasa Inggris?",
          a: "Untuk memastikan keakuratan saat mencocokkan dengan basis data dokter lokal kami, gelar medis tertentu (seperti 'Cardiologist') disimpan dalam bahasa Inggris, meskipun sisa aplikasi dalam bahasa Indonesia."
        }
      ]
    },
    footer: {
      safety: "MurakMed AI hanya memberikan saran informatif. Untuk hasil terbaik, mintalah saran dari dokter atau profesional kesehatan yang berkualifikasi.",
      copyright: "Hak Cipta Dilindungi Undang-Undang."
    },
    error: "Ada masalah selama analisis. Silakan coba lagi."
  }
};
