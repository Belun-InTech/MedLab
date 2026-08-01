export const TRANSLATIONS = {
  en: {
    hero: {
      title: "Care for your child.",
      subtitle: "From the first month onward.",
      desc: "Médiku Labarik uses Artificial Intelligence to help parents and caregivers in Timor-Leste understand their child's symptoms — and guides them to the right care."
    },
    header: {
      aboutMenuTitle: "About MédLab",
      aboutMenuSubtitle: "What is it & why use it?",
      howItWorks: "Home",
      howItWorksSubtitle: "Back to your dashboard",
      faq: "FAQ",
      faqSubtitle: "Common questions",
      editProfile: "Family Profile",
      editProfileSubtitle: "Edit your children",
      logout: "Log out",
      logoutSubtitle: "Sign out of this device",
      language: "Language"
    },
    auth: {
      loginTab: "Log in",
      signupTab: "Sign up",
      welcomeTitle: "Welcome to Médiku Labarik",
      loginSubtitle: "Log in to continue.",
      signupSubtitle: "Only a parent or guardian can create an account.",
      name: "Your name",
      dob: "Your date of birth",
      dobHelp: "We use this to confirm you are a parent or guardian.",
      email: "Email",
      password: "Password",
      loginBtn: "Log in",
      signupBtn: "Create account",
      noAccountYet: "No account yet? Sign up",
      haveAccount: "Already have an account? Log in",
      invalidCredentials: "Email or password is not correct.",
      noAccount: "No account found on this device. Sign up first.",
      fieldsRequired: "Please fill in all fields.",
      passwordTooShort: "Password must be at least 4 characters.",
      underAge: "You must be at least 18 to register as a parent or guardian.",
      emailTaken: "That email is already registered. Log in instead.",
      networkError: "Could not reach the server. Check your connection and try again.",
      demoNote: "Demo account — for evaluation only."
    },
    home: {
      welcomeSub: "Child Health Companion",
      hello: "Hello",
      heroDesc: "Your children's health assistant: check symptoms, keep vaccines on time, and reach a doctor when you need one.",
      cards: {
        checker: "Check Symptoms",
        checkerDesc: "AI analysis for your child, from the first month",
        vaccines: "Vaccinations",
        vaccinesDesc: "Keep your children's vaccines on schedule",
        doctor: "Talk to a Doctor",
        doctorDesc: "Chat or call a health professional",
        facilities: "Find a Facility",
        facilitiesDesc: "Hospitals and health centers near you"
      }
    },
    onboarding: {
      title: "Register your children",
      subtitle: "Add each child so we can tailor advice to their exact age. Their records stay private to your account.",
      editTitle: "Family Profile",
      childrenSection: "Your children",
      addChild: "Add a child",
      childName: "Child's name",
      childDob: "Date of birth",
      childSex: "Sex",
      boy: "Boy",
      girl: "Girl",
      remove: "Remove",
      noChildrenHint: "Add at least one child to continue.",
      save: "Save & Continue",
      childRequired: "Please add at least one child with a name and date of birth."
    },
    selector: {
      title: "Which child needs help today?",
      subtitle: "Choose the child you want to check symptoms for.",
      months: "months",
      years: "years",
      noChildrenNote: "Add a child to your family profile to start a check."
    },
    input: {
      title: "Describe the Symptoms",
      desc: "Provide clear details to get accurate guidance.",
      forPatient: "Checking for",
      age: "Age",
      weight: "Weight (kg, optional)",
      weightPlaceholder: "e.g., 12",
      onset: "When did it start?",
      onsetPlaceholder: "e.g., 2 days ago (Optional)",
      symptomsLabel: "Describe Symptoms",
      symptomsPlaceholder: "Describe what is happening, or upload a photo...",
      imagePlaceholder: "Add optional text to describe the image...",
      quickAdd: "Quick Add:",
      uploadBtn: "Add Photo",
      changePhoto: "Change Photo",
      analyzeBtn: "Analyze",
      analyzing: "Analyzing...",
      fileError: "File too large. Please upload an image under 5MB.",
      back: "← Back"
    },
    childSymptoms: ["Fever", "Cough", "Diarrhea", "Vomiting", "Not eating", "Rash", "Fast breathing", "Crying a lot"],
    results: {
      title: "Analysis Results",
      newRecord: "New Check",
      translating: "Auto-translating to",
      emergencyTitle: "Potential Medical Emergency",
      emergencyDefault: "These symptoms may indicate a serious condition. Please go to the nearest health facility immediately.",
      seekEmergency: "Call a Doctor Now",
      conditionsTitle: "Possible Conditions",
      recommendedAction: "Recommended Actions",
      whyThis: "Why this matches:",
      medications: "Suggested Medications & Treatments",
      dosage: "Dosage:",
      nextStep: "NEXT STEP",
      disclaimer: "Médiku Labarik provides information only. It does not substitute professional medical advice, diagnosis, or treatment.",
      selectSpecialist: "Choose a care provider",
      specialistChosen: "Chosen",
      choose: "Choose",
      noSpecialist: "No specific specialist available for this condition. Please consult a General Practitioner.",
      filterLabel: "Filter by availability:",
      filterAll: "All",
      filterToday: "Available Today",
      filterTomorrow: "Tomorrow",
      filterLater: "Later",
      talkToDoctor: "Talk to this Doctor"
    },
    specialistNames: {
      "General Practitioner": "General Practitioner",
      "Pediatrician": "Pediatrician",
    },
    vaccines: {
      title: "Vaccination Schedule",
      subtitle: "Timor-Leste national immunization program (EPI)",
      selectChild: "Select a child",
      statusOverdue: "Overdue",
      statusDue: "Due now",
      statusUpcoming: "Upcoming",
      statusGiven: "Given",
      dueAt: "Scheduled at",
      atBirth: "At birth",
      weeks: "weeks",
      months: "months",
      markGiven: "Mark as given",
      unmark: "Undo",
      noChildren: "No children in your family profile yet.",
      addChildHint: "Add a child in your family profile to see their vaccine schedule.",
      goToProfile: "Open Family Profile"
    },
    facilities: {
      title: "Find a Health Facility",
      subtitle: "Hospitals, health centers, and health posts in Timor-Leste",
      filterLabel: "Municipality",
      all: "All municipalities",
      callBtn: "Call",
      types: {
        "Hospital": "Hospital",
        "CHC": "Community Health Center",
        "Health Post": "Health Post",
        "Clinic": "Clinic"
      }
    },
    doctorTalk: {
      title: "Talk to a Doctor",
      subtitle: "Chat or call a health professional",
      online: "Online",
      chatBtn: "Start Chat",
      callBtn: "Start Call",
      inputPlaceholder: "Type your message...",
      calling: "Calling...",
      inCall: "In call",
      mute: "Mute",
      muted: "Muted",
      speaker: "Speaker",
      endCall: "End Call",
      callEnded: "Call ended",
      duration: "Duration",
      back: "← Back",
      demoBadge: "Demo simulation",
      cannedReplies: [
        "Hello! I'm Dr. Sarah. I can see the AI analysis you shared. How is the patient feeling right now?",
        "Thank you. Based on what you describe, please keep the patient hydrated and monitor the temperature every few hours.",
        "If you notice any danger signs — trouble breathing, convulsions, or the condition getting worse — go to the nearest health facility immediately.",
        "You're doing the right thing by checking early. Do you have any other questions for me?"
      ]
    },
    paywall: {
      title: "MédLab Premium",
      subtitle: "Direct access to doctors, whenever your child needs them.",
      freeName: "Free",
      freeFeatures: ["AI symptom checks", "Vaccination schedule", "Facility directory", "Emergency alerts"],
      premiumName: "Premium",
      premiumFeatures: ["Everything in Free", "Unlimited chat with doctors", "Voice calls with specialists", "Priority emergency guidance"],
      perMonth: "/ month",
      price: "$2.99",
      free: "$0",
      subscribeBtn: "Subscribe Now",
      activeBadge: "Premium Active",
      maybeLater: "Maybe later",
      note: "Demo mode: no payment is processed. Payment options for Timor-Leste are on our roadmap."
    },
    about: {
      back: "Back",
      title: "About Médiku Labarik ",
      bio1: "Médiku Labarik (MédLab) is an intelligent child health assistant built for Timor-Leste. Powered by Artificial Intelligence, it helps parents and caregivers understand their child's symptoms — from the first month of life — and connects them with the right care.",
      bio2: "Our mission is to reduce preventable child illness by putting trusted, easy-to-understand health guidance — in Tetum, English, and Indonesian — into every parent's hands.",
      whyTitle: "Why use MédLab",
      features: [
        { title: "Built for Children", desc: "Analysis tuned to your child's exact age in months — not generic adult advice." },
        { title: "Instant, 24/7", desc: "No waiting rooms. Get preliminary guidance in seconds, day or night, in your language." },
        { title: "From Advice to Action", desc: "Danger-sign alerts, care provider matching, vaccination reminders, and a direct line to doctors." },
        { title: "Privacy First", desc: "Your family's records are private to your account. We never sell or share your data." }
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          q: "Is Médiku Labarik a replacement for a real doctor?",
          a: "No. MédLab is an informational tool to help you understand possible causes of your child's symptoms. It cannot provide an official medical diagnosis. Always consult a qualified health professional for medical decisions."
        },
        {
          q: "How does the AI analyze the symptoms?",
          a: "The app uses an AI medical model. It compares the symptoms you describe (text or photo) with medical knowledge — including the IMCI danger signs for children — to suggest probable conditions and next steps."
        },
        {
          q: "What should I do if the app shows a red Emergency alert?",
          a: "If you see a red Emergency alert, do not wait. Go immediately to the nearest health facility or hospital, or use the 'Talk to a Doctor' feature for urgent guidance."
        },
        {
          q: "Is my family's data safe?",
          a: "Your children's records and health checks are stored in your private MédLab account, protected by your password. We do not sell or share your personal information."
        },
        {
          q: "Why are some care provider names in English?",
          a: "To match correctly with our directory of local providers, professional titles (like 'Pediatrician') are kept in English, even when the rest of the app is in Tetum or Indonesian."
        }
      ]
    },
    footer: {
      safety: "Médiku Labarik provides informational suggestions only. For medical decisions, always consult your doctor or nearest health facility."
    },
    error: "There was a problem during analysis. Please make sure the AI service is running and try again."
  },

  tet: {
    hero: {
      title: "Kuidadu ba ita-nia oan.",
      subtitle: "Husi fulan dahuluk ba oin.",
      desc: "Médiku Labarik uza Inteligénsia Artifisial atu ajuda inan-aman no kuidadór sira iha Timor-Leste komprende sintoma iha sira-nia oan — no orienta sira ba kuidadu ne'ebé loos."
    },
    header: {
      aboutMenuTitle: "Kona-ba MédLab",
      aboutMenuSubtitle: "Saida mak & tansá uza?",
      howItWorks: "Pájina Prinsipál",
      howItWorksSubtitle: "Fila ba ita-nia dashboard",
      faq: "Perguntas (FAQ)",
      faqSubtitle: "Perguntas baibain",
      editProfile: "Perfil Família",
      editProfileSubtitle: "Edita ita-nia oan sira",
      logout: "Sai",
      logoutSubtitle: "Sai husi dispozitivu ida ne'e",
      language: "Lian"
    },
    auth: {
      loginTab: "Tama",
      signupTab: "Rejista",
      welcomeTitle: "Benvinda ba Médiku Labarik",
      loginSubtitle: "Tama atu kontinua.",
      signupSubtitle: "Inan-aman ka responsável de'it mak bele kria konta.",
      name: "Ita-nia naran",
      dob: "Ita-nia data moris",
      dobHelp: "Ami uza ida ne'e atu konfirma katak ita mak inan-aman ka responsável.",
      email: "Email",
      password: "Password",
      loginBtn: "Tama",
      signupBtn: "Kria konta",
      noAccountYet: "Seidauk iha konta? Rejista",
      haveAccount: "Iha ona konta? Tama",
      invalidCredentials: "Email ka password la loos.",
      noAccount: "La hetan konta iha dispozitivu ida ne'e. Rejista uluk.",
      fieldsRequired: "Favor prenxe kampu hotu.",
      passwordTooShort: "Password tenke iha karakter 4 ba leten.",
      underAge: "Ita tenke iha tinan 18 ba leten atu rejista nu'udar inan-aman ka responsável.",
      emailTaken: "Email ne'e rejista ona. Favor tama.",
      networkError: "La bele hetan servidor. Verifika ligasaun no koko fali.",
      demoNote: "Konta demo — ba avaliasaun de'it."
    },
    home: {
      welcomeSub: "Akompañante Saúde Labarik",
      hello: "Olá",
      heroDesc: "Asistente saúde ba ita-nia oan sira: analiza sintoma, kumpri orariu vasina, no kontaktu doutór bainhira presiza.",
      cards: {
        checker: "Analiza Sintoma",
        checkerDesc: "Análize AI ba ita-nia oan, husi fulan dahuluk",
        vaccines: "Vasina",
        vaccinesDesc: "Kumpri orariu vasina ba ita-nia oan sira",
        doctor: "Ko'alia ho Doutór",
        doctorDesc: "Chat ka liga ba profisionál saúde",
        facilities: "Buka Fasilidade",
        facilitiesDesc: "Ospitál no sentru saúde besik ita"
      }
    },
    onboarding: {
      title: "Rejista ita-nia oan sira",
      subtitle: "Aumenta oan ida-idak atu ami bele fó konsellu tuir sira-nia idade loloos. Sira-nia rejistu privadu ba ita-nia konta.",
      editTitle: "Perfil Família",
      childrenSection: "Ita-nia oan sira",
      addChild: "Aumenta oan ida",
      childName: "Naran oan nian",
      childDob: "Data moris",
      childSex: "Seksu",
      boy: "Mane",
      girl: "Feto",
      remove: "Hasai",
      noChildrenHint: "Aumenta oan ida pelumenus atu kontinua.",
      save: "Rai & Kontinua",
      childRequired: "Favor aumenta oan ida pelumenus ho naran no data moris."
    },
    selector: {
      title: "Oan ida-ne'ebé presiza ajuda ohin?",
      subtitle: "Hili oan ne'ebé ita hakarak analiza sintoma ba.",
      months: "fulan",
      years: "tinan",
      noChildrenNote: "Aumenta oan ida iha perfil família atu komesa análize."
    },
    input: {
      title: "Deskreve Sintoma",
      desc: "Fornese detallu klaru atu hetan orientasaun ne'ebé akuradu.",
      forPatient: "Analiza ba",
      age: "Idade",
      weight: "Todan (kg, opsionál)",
      weightPlaceholder: "ez., 12",
      onset: "Komesa horibainhira?",
      onsetPlaceholder: "ez. loron 2 liuba (Opsionál)",
      symptomsLabel: "Deskreve Sintoma",
      symptomsPlaceholder: "Deskreve saida mak akontese, ka upload foto ida...",
      imagePlaceholder: "Aumenta testu opsionál atu deskreve imajen...",
      quickAdd: "Aumenta Lalais:",
      uploadBtn: "Aumenta Foto",
      changePhoto: "Troka Foto",
      analyzeBtn: "Analiza",
      analyzing: "Analiza hela...",
      fileError: "File boot liu. Favor upload imajen menus husi 5MB.",
      back: "← Fila"
    },
    childSymptoms: ["Isin manas", "Mear", "Kabun-been", "Muta", "Lakohi han", "Isin sae", "Dada iis lalais", "Tanis barak"],
    results: {
      title: "Rezultadu Análize",
      newRecord: "Análize Foun",
      translating: "Tradús hela ba",
      emergencyTitle: "Emerjénsia Médika Potensiál",
      emergencyDefault: "Sintoma sira ne'e bele indika kondisaun sériu. Favor bá kedas fasilidade saúde besik liu.",
      seekEmergency: "Liga ba Doutór Agora",
      conditionsTitle: "Kondisaun Potensiál",
      recommendedAction: "Asaun Rekomendada",
      whyThis: "Tansá ida ne'e hanesan:",
      medications: "Medikamentu & Tratamentu Sujeridu",
      dosage: "Doze:",
      nextStep: "PASU TUIRMAI",
      disclaimer: "Médiku Labarik fornese informasaun de'it. Ne'e la substitui konsellu médiku profisionál, diagnoza, ka tratamentu.",
      selectSpecialist: "Hili fornesedor kuidadu ida",
      specialistChosen: "Hili ona",
      choose: "Hili",
      noSpecialist: "La hetan espesialista espesífiku. Favor konsulta ho Médiku Jerál.",
      filterLabel: "Filtra tuir disponibilidade:",
      filterAll: "Hotu-hotu",
      filterToday: "Disponivel Ohin",
      filterTomorrow: "Aban",
      filterLater: "Ikus mai",
      talkToDoctor: "Ko'alia ho Doutór Ne'e"
    },
    specialistNames: {
      "General Practitioner": "Médiku Jerál",
      "Pediatrician": "Pediatra",
    },
    vaccines: {
      title: "Orariu Vasina",
      subtitle: "Programa imunizasaun nasionál Timor-Leste (EPI)",
      selectChild: "Hili oan ida",
      statusOverdue: "Tarde ona",
      statusDue: "Tempu agora",
      statusUpcoming: "Sei mai",
      statusGiven: "Simu ona",
      dueAt: "Ajendadu iha",
      atBirth: "Bainhira moris",
      weeks: "semana",
      months: "fulan",
      markGiven: "Marka simu ona",
      unmark: "Hasai marka",
      noChildren: "Seidauk iha oan iha ita-nia perfil família.",
      addChildHint: "Aumenta oan ida iha perfil família atu haree sira-nia orariu vasina.",
      goToProfile: "Loke Perfil Família"
    },
    facilities: {
      title: "Buka Fasilidade Saúde",
      subtitle: "Ospitál, sentru saúde, no postu saúde iha Timor-Leste",
      filterLabel: "Munisípiu",
      all: "Munisípiu hotu-hotu",
      callBtn: "Liga",
      types: {
        "Hospital": "Ospitál",
        "CHC": "Sentru Saúde Komunitária",
        "Health Post": "Postu Saúde",
        "Clinic": "Klínika"
      }
    },
    doctorTalk: {
      title: "Ko'alia ho Doutór",
      subtitle: "Chat ka liga ba profisionál saúde",
      online: "Online",
      chatBtn: "Komesa Chat",
      callBtn: "Komesa Ligasaun",
      inputPlaceholder: "Hakerek ita-nia mensajen...",
      calling: "Liga hela...",
      inCall: "Iha ligasaun",
      mute: "Hamate lian",
      muted: "Lian mate",
      speaker: "Altifalante",
      endCall: "Remata Ligasaun",
      callEnded: "Ligasaun remata",
      duration: "Durasaun",
      back: "← Fila",
      demoBadge: "Simulasaun demo",
      cannedReplies: [
        "Olá! Ha'u Dr. Sarah. Ha'u haree tiha análize AI ne'ebé ita fahe. Pasiente sente oinsá agora?",
        "Obrigada. Bazeia ba saida mak ita deskreve, favor fó bee barak ba pasiente no monitoriza isin manas kada oras balu.",
        "Se ita haree sinál perigu ruma — susar dada iis, konvulsaun, ka kondisaun sai aat liu — bá kedas fasilidade saúde besik liu.",
        "Ita halo buat ne'ebé loos hodi analiza sedu. Ita iha pergunta seluk ba ha'u?"
      ]
    },
    paywall: {
      title: "MédLab Premium",
      subtitle: "Asesu diretu ba doutór sira, bainhira de'it ita-nia oan presiza.",
      freeName: "Grátis",
      freeFeatures: ["Análize sintoma AI", "Orariu vasina", "Diretóriu fasilidade", "Alerta emerjénsia"],
      premiumName: "Premium",
      premiumFeatures: ["Buat hotu iha Grátis", "Chat ilimitadu ho doutór", "Ligasaun lian ho espesialista", "Orientasaun emerjénsia prioridade"],
      perMonth: "/ fulan",
      price: "$2.99",
      free: "$0",
      subscribeBtn: "Subskreve Agora",
      activeBadge: "Premium Ativu",
      maybeLater: "Ikus mai karik",
      note: "Modu demo: laiha pagamentu prosesa. Opsaun pagamentu ba Timor-Leste iha ami-nia planu."
    },
    about: {
      back: "Fila",
      title: "Kona-ba Médiku Labarik ",
      bio1: "Médiku Labarik (MédLab) mak asistente saúde inteligente ba labarik, harii ba Timor-Leste. Ho Inteligénsia Artifisial, nia ajuda inan-aman no kuidadór sira komprende sintoma iha sira-nia oan — husi fulan dahuluk moris — no liga sira ho kuidadu ne'ebé loos.",
      bio2: "Ami-nia misaun mak atu hamenus moras labarik ne'ebé bele prevene, hodi tau orientasaun saúde ne'ebé fiar no fásil komprende — iha Tetun, Inglés, no Indonézia — iha inan-aman hotu-hotu nia liman.",
      whyTitle: "Tansá uza MédLab",
      features: [
        { title: "Harii ba Labarik", desc: "Análize tuir ita-nia oan nia idade loloos iha fulan — la'ós konsellu jerál ba ema boot." },
        { title: "Imediatu, 24/7", desc: "La presiza hein. Hetan orientasaun preliminár iha segundu laran, loron ka kalan, iha ita-nia lian." },
        { title: "Husi Konsellu ba Asaun", desc: "Alerta sinál perigu, rekomendasaun fornesedor kuidadu, lembransa vasina, no liña diretu ba doutór." },
        { title: "Privasidade Uluk", desc: "Ita-nia rejistu família privadu ba ita-nia konta. Ami la fa'an ka fahe ita-nia dadus." }
      ]
    },
    faq: {
      title: "Perguntas Baibain (FAQ)",
      items: [
        {
          q: "Médiku Labarik troka fali doutór sira ka lae?",
          a: "Lae. MédLab mak ferramenta informasaun nian atu ajuda komprende kauza posivel husi sintoma iha ita-nia oan. Nia labele fó diagnoza ofisiál. Konsulta nafatin ho profisionál saúde kualifikadu ba desizaun médika."
        },
        {
          q: "Oinsá AI analiza sintoma sira?",
          a: "Aplikasaun ne'e uza modelu AI médiku. Nia kompara sintoma ne'ebé ita deskreve (testu ka foto) ho koñesimentu médiku — inklui sinál perigu IMCI ba labarik — atu sujere kondisaun provavel no pasu tuirmai."
        },
        {
          q: "Saida mak ha'u tenke halo se aplikasaun hatudu avizu Emerjénsia mean?",
          a: "Se ita haree avizu Emerjénsia mean, keta hein. Bá kedas fasilidade saúde ka ospitál besik liu, ka uza funsaun 'Ko'alia ho Doutór' ba orientasaun urjente."
        },
        {
          q: "Ha'u-nia família nia dadus seguru ka lae?",
          a: "Ita-nia oan sira-nia rejistu no análize saúde rai iha ita-nia konta MédLab privadu, proteje ho ita-nia password. Ami la fa'an ka fahe ita-nia informasaun pesoál."
        },
        {
          q: "Tansá naran fornesedor kuidadu balu iha lian Inglés?",
          a: "Atu tuir loloos ho ami-nia diretóriu fornesedor lokál, títulu profisionál (hanesan 'Pediatrician') mantein iha Inglés, maske parte seluk husi aplikasaun iha Tetun ka Indonézia."
        }
      ]
    },
    footer: {
      safety: "Médiku Labarik fornese sujestaun informativu de'it. Ba desizaun médika, konsulta nafatin ita-nia doutór ka fasilidade saúde besik liu."
    },
    error: "Iha problema durante análize. Favor verifika katak servisu AI la'o hela no koko fali."
  },

  id: {
    hero: {
      title: "Rawat anak Anda.",
      subtitle: "Sejak bulan pertama.",
      desc: "Médiku Labarik menggunakan Kecerdasan Buatan untuk membantu orang tua dan pengasuh di Timor-Leste memahami gejala pada anak mereka — serta memandu ke perawatan yang tepat."
    },
    header: {
      aboutMenuTitle: "Tentang MédLab",
      aboutMenuSubtitle: "Apa & mengapa menggunakannya?",
      howItWorks: "Beranda",
      howItWorksSubtitle: "Kembali ke dasbor Anda",
      faq: "FAQ",
      faqSubtitle: "Pertanyaan umum",
      editProfile: "Profil Keluarga",
      editProfileSubtitle: "Edit anak-anak Anda",
      logout: "Keluar",
      logoutSubtitle: "Keluar dari perangkat ini",
      language: "Bahasa"
    },
    auth: {
      loginTab: "Masuk",
      signupTab: "Daftar",
      welcomeTitle: "Selamat datang di Médiku Labarik",
      loginSubtitle: "Masuk untuk melanjutkan.",
      signupSubtitle: "Hanya orang tua atau wali yang dapat membuat akun.",
      name: "Nama Anda",
      dob: "Tanggal lahir Anda",
      dobHelp: "Kami menggunakannya untuk memastikan Anda orang tua atau wali.",
      email: "Email",
      password: "Kata sandi",
      loginBtn: "Masuk",
      signupBtn: "Buat akun",
      noAccountYet: "Belum punya akun? Daftar",
      haveAccount: "Sudah punya akun? Masuk",
      invalidCredentials: "Email atau kata sandi salah.",
      noAccount: "Tidak ada akun di perangkat ini. Daftar dulu.",
      fieldsRequired: "Harap isi semua kolom.",
      passwordTooShort: "Kata sandi minimal 4 karakter.",
      underAge: "Anda harus berusia minimal 18 tahun untuk mendaftar sebagai orang tua atau wali.",
      emailTaken: "Email itu sudah terdaftar. Silakan masuk.",
      networkError: "Tidak dapat menghubungi server. Periksa koneksi dan coba lagi.",
      demoNote: "Akun demo — hanya untuk evaluasi."
    },
    home: {
      welcomeSub: "Pendamping Kesehatan Anak",
      hello: "Halo",
      heroDesc: "Asisten kesehatan anak-anak Anda: periksa gejala, jaga jadwal vaksin, dan hubungi dokter saat dibutuhkan.",
      cards: {
        checker: "Periksa Gejala",
        checkerDesc: "Analisis AI untuk anak Anda, sejak bulan pertama",
        vaccines: "Vaksinasi",
        vaccinesDesc: "Jaga jadwal vaksin anak-anak Anda",
        doctor: "Bicara dengan Dokter",
        doctorDesc: "Chat atau telepon tenaga kesehatan",
        facilities: "Cari Fasilitas",
        facilitiesDesc: "Rumah sakit dan puskesmas di dekat Anda"
      }
    },
    onboarding: {
      title: "Daftarkan anak-anak Anda",
      subtitle: "Tambahkan setiap anak agar kami dapat menyesuaikan saran dengan usia mereka yang tepat. Catatan mereka bersifat pribadi untuk akun Anda.",
      editTitle: "Profil Keluarga",
      childrenSection: "Anak-anak Anda",
      addChild: "Tambah anak",
      childName: "Nama anak",
      childDob: "Tanggal lahir",
      childSex: "Jenis kelamin",
      boy: "Laki-laki",
      girl: "Perempuan",
      remove: "Hapus",
      noChildrenHint: "Tambahkan setidaknya satu anak untuk melanjutkan.",
      save: "Simpan & Lanjutkan",
      childRequired: "Harap tambahkan setidaknya satu anak dengan nama dan tanggal lahir."
    },
    selector: {
      title: "Anak mana yang perlu bantuan hari ini?",
      subtitle: "Pilih anak yang ingin Anda periksa gejalanya.",
      months: "bulan",
      years: "tahun",
      noChildrenNote: "Tambahkan anak di profil keluarga untuk memulai pemeriksaan."
    },
    input: {
      title: "Jelaskan Gejala",
      desc: "Berikan detail yang jelas untuk mendapatkan panduan yang akurat.",
      forPatient: "Memeriksa untuk",
      age: "Umur",
      weight: "Berat badan (kg, opsional)",
      weightPlaceholder: "cth., 12",
      onset: "Kapan mulai?",
      onsetPlaceholder: "cth. 2 hari yang lalu (Opsional)",
      symptomsLabel: "Jelaskan Gejala",
      symptomsPlaceholder: "Jelaskan apa yang terjadi, atau unggah foto...",
      imagePlaceholder: "Tambahkan teks opsional untuk menjelaskan gambar...",
      quickAdd: "Tambah Cepat:",
      uploadBtn: "Tambah Foto",
      changePhoto: "Ganti Foto",
      analyzeBtn: "Analisis",
      analyzing: "Menganalisis...",
      fileError: "File terlalu besar. Harap unggah gambar di bawah 5MB.",
      back: "← Kembali"
    },
    childSymptoms: ["Demam", "Batuk", "Diare", "Muntah", "Tidak mau makan", "Ruam", "Napas cepat", "Sering menangis"],
    results: {
      title: "Hasil Analisis",
      newRecord: "Pemeriksaan Baru",
      translating: "Menerjemahkan ke",
      emergencyTitle: "Potensi Darurat Medis",
      emergencyDefault: "Gejala ini dapat menunjukkan kondisi serius. Segera pergi ke fasilitas kesehatan terdekat.",
      seekEmergency: "Hubungi Dokter Sekarang",
      conditionsTitle: "Kemungkinan Kondisi",
      recommendedAction: "Tindakan yang Disarankan",
      whyThis: "Mengapa ini cocok:",
      medications: "Saran Obat & Perawatan",
      dosage: "Dosis:",
      nextStep: "LANGKAH BERIKUTNYA",
      disclaimer: "Médiku Labarik hanya menyediakan informasi. Ini tidak menggantikan saran medis profesional, diagnosis, atau perawatan.",
      selectSpecialist: "Pilih penyedia layanan",
      specialistChosen: "Terpilih",
      choose: "Pilih",
      noSpecialist: "Tidak ada spesialis khusus yang ditemukan. Silakan konsultasi dengan Dokter Umum.",
      filterLabel: "Filter berdasarkan ketersediaan:",
      filterAll: "Semua",
      filterToday: "Tersedia Hari Ini",
      filterTomorrow: "Besok",
      filterLater: "Nanti",
      talkToDoctor: "Bicara dengan Dokter Ini"
    },
    specialistNames: {
      "General Practitioner": "Dokter Umum",
      "Pediatrician": "Dokter Anak",
    },
    vaccines: {
      title: "Jadwal Vaksinasi",
      subtitle: "Program imunisasi nasional Timor-Leste (EPI)",
      selectChild: "Pilih anak",
      statusOverdue: "Terlambat",
      statusDue: "Waktunya sekarang",
      statusUpcoming: "Mendatang",
      statusGiven: "Sudah diberikan",
      dueAt: "Dijadwalkan pada",
      atBirth: "Saat lahir",
      weeks: "minggu",
      months: "bulan",
      markGiven: "Tandai sudah diberikan",
      unmark: "Batalkan",
      noChildren: "Belum ada anak di profil keluarga Anda.",
      addChildHint: "Tambahkan anak di profil keluarga untuk melihat jadwal vaksinnya.",
      goToProfile: "Buka Profil Keluarga"
    },
    facilities: {
      title: "Cari Fasilitas Kesehatan",
      subtitle: "Rumah sakit, puskesmas, dan pos kesehatan di Timor-Leste",
      filterLabel: "Kotamadya",
      all: "Semua kotamadya",
      callBtn: "Telepon",
      types: {
        "Hospital": "Rumah Sakit",
        "CHC": "Puskesmas",
        "Health Post": "Pos Kesehatan",
        "Clinic": "Klinik"
      }
    },
    doctorTalk: {
      title: "Bicara dengan Dokter",
      subtitle: "Chat atau telepon tenaga kesehatan",
      online: "Online",
      chatBtn: "Mulai Chat",
      callBtn: "Mulai Panggilan",
      inputPlaceholder: "Ketik pesan Anda...",
      calling: "Memanggil...",
      inCall: "Dalam panggilan",
      mute: "Bisukan",
      muted: "Dibisukan",
      speaker: "Pengeras suara",
      endCall: "Akhiri Panggilan",
      callEnded: "Panggilan berakhir",
      duration: "Durasi",
      back: "← Kembali",
      demoBadge: "Simulasi demo",
      cannedReplies: [
        "Halo! Saya Dr. Sarah. Saya sudah melihat analisis AI yang Anda bagikan. Bagaimana kondisi pasien sekarang?",
        "Terima kasih. Berdasarkan yang Anda jelaskan, pastikan pasien tetap terhidrasi dan pantau suhu tubuh setiap beberapa jam.",
        "Jika Anda melihat tanda bahaya — sulit bernapas, kejang, atau kondisi memburuk — segera pergi ke fasilitas kesehatan terdekat.",
        "Anda melakukan hal yang benar dengan memeriksa sejak dini. Ada pertanyaan lain untuk saya?"
      ]
    },
    paywall: {
      title: "MédLab Premium",
      subtitle: "Akses langsung ke dokter, kapan pun anak Anda membutuhkannya.",
      freeName: "Gratis",
      freeFeatures: ["Pemeriksaan gejala AI", "Jadwal vaksinasi", "Direktori fasilitas", "Peringatan darurat"],
      premiumName: "Premium",
      premiumFeatures: ["Semua fitur Gratis", "Chat tanpa batas dengan dokter", "Panggilan suara dengan spesialis", "Panduan darurat prioritas"],
      perMonth: "/ bulan",
      price: "$2.99",
      free: "$0",
      subscribeBtn: "Berlangganan Sekarang",
      activeBadge: "Premium Aktif",
      maybeLater: "Nanti saja",
      note: "Mode demo: tidak ada pembayaran yang diproses. Opsi pembayaran untuk Timor-Leste ada di roadmap kami."
    },
    about: {
      back: "Kembali",
      title: "Tentang Médiku Labarik ",
      bio1: "Médiku Labarik (MédLab) adalah asisten kesehatan anak yang cerdas, dibuat untuk Timor-Leste. Didukung Kecerdasan Buatan, aplikasi ini membantu orang tua dan pengasuh memahami gejala pada anak mereka — sejak bulan pertama kehidupan — serta menghubungkan mereka dengan perawatan yang tepat.",
      bio2: "Misi kami adalah mengurangi penyakit anak yang dapat dicegah dengan menghadirkan panduan kesehatan yang terpercaya dan mudah dipahami — dalam bahasa Tetum, Inggris, dan Indonesia — ke tangan setiap orang tua.",
      whyTitle: "Mengapa menggunakan MédLab",
      features: [
        { title: "Dibuat untuk Anak", desc: "Analisis disesuaikan dengan usia anak Anda dalam bulan — bukan saran umum untuk orang dewasa." },
        { title: "Instan, 24/7", desc: "Tanpa ruang tunggu. Dapatkan panduan awal dalam hitungan detik, siang atau malam, dalam bahasa Anda." },
        { title: "Dari Saran ke Tindakan", desc: "Peringatan tanda bahaya, pencocokan penyedia layanan, pengingat vaksin, dan jalur langsung ke dokter." },
        { title: "Privasi Utama", desc: "Catatan keluarga Anda bersifat pribadi untuk akun Anda. Kami tidak pernah menjual atau membagikan data Anda." }
      ]
    },
    faq: {
      title: "Pertanyaan Umum (FAQ)",
      items: [
        {
          q: "Apakah Médiku Labarik pengganti dokter sungguhan?",
          a: "Tidak. MédLab adalah alat informasi untuk membantu Anda memahami kemungkinan penyebab gejala pada anak Anda. Ini tidak dapat memberikan diagnosis medis resmi. Selalu konsultasikan keputusan medis dengan tenaga kesehatan yang berkualifikasi."
        },
        {
          q: "Bagaimana AI menganalisis gejala?",
          a: "Aplikasi ini menggunakan model AI medis. Ia membandingkan gejala yang Anda jelaskan (teks atau foto) dengan pengetahuan medis — termasuk tanda bahaya IMCI untuk anak — untuk menyarankan kemungkinan kondisi dan langkah berikutnya."
        },
        {
          q: "Apa yang harus saya lakukan jika aplikasi menunjukkan peringatan Darurat merah?",
          a: "Jika Anda melihat peringatan Darurat merah, jangan menunggu. Segera pergi ke fasilitas kesehatan atau rumah sakit terdekat, atau gunakan fitur 'Bicara dengan Dokter' untuk panduan mendesak."
        },
        {
          q: "Apakah data keluarga saya aman?",
          a: "Catatan anak-anak dan pemeriksaan kesehatan Anda disimpan di akun MédLab pribadi Anda, dilindungi kata sandi. Kami tidak menjual atau membagikan informasi pribadi Anda."
        },
        {
          q: "Mengapa beberapa nama penyedia layanan dalam bahasa Inggris?",
          a: "Agar cocok dengan direktori penyedia lokal kami, gelar profesional (seperti 'Pediatrician') tetap dalam bahasa Inggris, meskipun bagian lain aplikasi dalam bahasa Tetum atau Indonesia."
        }
      ]
    },
    footer: {
      safety: "Médiku Labarik hanya memberikan saran informatif. Untuk keputusan medis, selalu konsultasikan dengan dokter atau fasilitas kesehatan terdekat."
    },
    error: "Ada masalah selama analisis. Pastikan layanan AI berjalan dan coba lagi."
  }
};
