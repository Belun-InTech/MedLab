export const TRANSLATIONS = {
  en: {
    hero: {
      title: "Care for your child.",
      subtitle: "Care for your pregnancy.",
      desc: "Médiku Labarik uses Artificial Intelligence to help mothers and caregivers in Timor-Leste understand symptoms in children and during pregnancy — and guides you to the right care."
    },
    header: {
      aboutMenuTitle: "About MédLab",
      aboutMenuSubtitle: "What is it & why use it?",
      howItWorks: "Home",
      howItWorksSubtitle: "Back to your dashboard",
      faq: "FAQ",
      faqSubtitle: "Common questions",
      editProfile: "Family Profile",
      editProfileSubtitle: "Edit mother & children",
      language: "Language"
    },
    home: {
      welcomeSub: "Maternal & Child Health Companion",
      hello: "Hello",
      heroDesc: "Your family's health assistant: check symptoms, follow your pregnancy, keep vaccines on time, and reach a doctor when you need one.",
      cards: {
        checker: "Check Symptoms",
        checkerDesc: "AI analysis for your child or your pregnancy",
        tracker: "Pregnancy Tracker",
        trackerDesc: "Follow your pregnancy week by week",
        vaccines: "Vaccinations",
        vaccinesDesc: "Keep your children's vaccines on schedule",
        doctor: "Talk to a Doctor",
        doctorDesc: "Chat or call a health professional",
        facilities: "Find a Facility",
        facilitiesDesc: "Hospitals and health centers near you"
      }
    },
    onboarding: {
      title: "Welcome to Médiku Labarik",
      subtitle: "Tell us about your family so we can personalize your care. Everything stays on this device.",
      editTitle: "Family Profile",
      momSection: "About the mother",
      momName: "Mother's name",
      momDob: "Date of birth (optional)",
      pregnantQ: "Are you currently pregnant?",
      yes: "Yes",
      no: "No",
      lmp: "First day of your last menstrual period",
      lmpHelp: "We use this to calculate your pregnancy week and due date.",
      childrenSection: "Your children",
      addChild: "Add a child",
      childName: "Child's name",
      childDob: "Date of birth",
      childSex: "Sex",
      boy: "Boy",
      girl: "Girl",
      remove: "Remove",
      noChildrenHint: "You can add children now or later.",
      save: "Save & Continue",
      nameRequired: "Please enter the mother's name."
    },
    selector: {
      title: "Who needs help today?",
      subtitle: "Choose who you want to check symptoms for.",
      mother: "Mother",
      pregnantBadge: "Pregnant",
      week: "Week",
      months: "months",
      years: "years",
      notPregnantNote: "Pregnancy check is available when the profile says you are pregnant."
    },
    input: {
      title: "Describe the Symptoms",
      desc: "Provide clear details to get accurate guidance.",
      forPatient: "Checking for",
      age: "Age",
      weight: "Weight (kg, optional)",
      weightPlaceholder: "e.g., 12",
      gestationalAge: "Pregnancy week",
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
    pregnancySymptoms: ["Nausea", "Headache", "Swelling", "Bleeding", "Abdominal pain", "Dizziness", "Less baby movement", "Back pain"],
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
      "Obstetrician-Gynecologist": "Obstetrician-Gynecologist",
      "Midwife": "Midwife"
    },
    tracker: {
      title: "Pregnancy Tracker",
      subtitle: "Following your journey week by week",
      week: "Week",
      of40: "of 40",
      trimester: "Trimester",
      trimesterNames: ["First trimester", "Second trimester", "Third trimester"],
      dueDate: "Estimated due date",
      daysToGo: "days to go",
      overdueNote: "Past the estimated due date — please see your midwife.",
      tipsTitle: "Tips for this stage",
      tips: [
        [
          "Start taking folic acid and iron tablets from the health center.",
          "Eat small, frequent meals if you feel nausea.",
          "Avoid alcohol, tobacco, and unprescribed medicines.",
          "Go to your first antenatal (ANC) visit as early as possible."
        ],
        [
          "You should start to feel the baby move — tell your midwife if you don't.",
          "Sleep under a mosquito net to prevent malaria and dengue.",
          "Keep attending your ANC visits and take your iron tablets.",
          "Eat protein-rich foods: eggs, fish, beans, and green vegetables."
        ],
        [
          "Count baby movements daily — fewer movements is a danger sign.",
          "Plan your birth: decide the facility and transport in advance.",
          "Watch for danger signs: bleeding, severe headache, swelling of face or hands.",
          "Prepare clean clothes and documents for the birth."
        ]
      ],
      ancTitle: "Antenatal Care (ANC) Visits",
      ancSubtitle: "WHO recommends 8 contacts during pregnancy",
      contact: "Contact",
      weekLabel: "Week",
      done: "Done",
      next: "Next visit",
      upcoming: "Upcoming",
      notPregnant: "No active pregnancy",
      notPregnantDesc: "Update your family profile if you are pregnant to activate the tracker.",
      updateProfile: "Update Profile"
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
      subtitle: "Direct access to doctors and midwives, whenever you need them.",
      freeName: "Free",
      freeFeatures: ["AI symptom checks", "Pregnancy tracker", "Vaccination schedule", "Facility directory"],
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
      bio1: "Médiku Labarik (MédLab) is an intelligent maternal and child health assistant built for Timor-Leste. Powered by Artificial Intelligence, it helps mothers and caregivers understand symptoms in children and during pregnancy, and connects them with the right care.",
      bio2: "Our mission is to reduce preventable child and maternal illness by putting trusted, easy-to-understand health guidance — in Tetum, English, and Indonesian — into every family's hands.",
      whyTitle: "Why use MédLab",
      features: [
        { title: "Built for Mothers & Children", desc: "Age-aware analysis for children and gestation-aware analysis for pregnancy — not generic adult advice." },
        { title: "Instant, 24/7", desc: "No waiting rooms. Get preliminary guidance in seconds, day or night, in your language." },
        { title: "From Advice to Action", desc: "Danger-sign alerts, care provider matching, vaccination reminders, and a direct line to doctors." },
        { title: "Privacy First", desc: "Your family profile stays on your device. We prioritize your data security." }
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          q: "Is Médiku Labarik a replacement for a real doctor?",
          a: "No. MédLab is an informational tool to help you understand possible causes of symptoms in your child or during pregnancy. It cannot provide an official medical diagnosis. Always consult a qualified health professional for medical decisions."
        },
        {
          q: "How does the AI analyze the symptoms?",
          a: "The app uses an AI medical model. It compares the symptoms you describe (text or photo) with medical knowledge — including child danger signs and pregnancy danger signs — to suggest probable conditions and next steps."
        },
        {
          q: "What should I do if the app shows a red Emergency alert?",
          a: "If you see a red Emergency alert, do not wait. Go immediately to the nearest health facility or hospital, or use the 'Talk to a Doctor' feature for urgent guidance."
        },
        {
          q: "Is my family's data safe?",
          a: "Yes. Your family profile and health checks are stored only on your own device. We do not share your personal information."
        },
        {
          q: "Why are some care provider names in English?",
          a: "To match correctly with our directory of local providers, professional titles (like 'Pediatrician') are kept in English, even when the rest of the app is in Tetum or Indonesian."
        }
      ]
    },
    footer: {
      safety: "Médiku Labarik provides informational suggestions only. For medical decisions, always consult your doctor, midwife, or nearest health facility."
    },
    error: "There was a problem during analysis. Please make sure the AI service is running and try again."
  },

  tet: {
    hero: {
      title: "Kuidadu ba ita-nia oan.",
      subtitle: "Kuidadu ba ita-nia isin-rua.",
      desc: "Médiku Labarik uza Inteligénsia Artifisial atu ajuda inan no kuidadór sira iha Timor-Leste komprende sintoma iha labarik no durante isin-rua — no orienta ita ba kuidadu ne'ebé loos."
    },
    header: {
      aboutMenuTitle: "Kona-ba MédLab",
      aboutMenuSubtitle: "Saida mak & tansá uza?",
      howItWorks: "Pájina Prinsipál",
      howItWorksSubtitle: "Fila ba ita-nia dashboard",
      faq: "Perguntas (FAQ)",
      faqSubtitle: "Perguntas baibain",
      editProfile: "Perfil Família",
      editProfileSubtitle: "Edita inan no oan sira",
      language: "Lian"
    },
    home: {
      welcomeSub: "Akompañante Saúde Inan no Oan",
      hello: "Olá",
      heroDesc: "Asistente saúde ba ita-nia família: analiza sintoma, akompaña isin-rua, kumpri orariu vasina, no kontaktu doutór bainhira presiza.",
      cards: {
        checker: "Analiza Sintoma",
        checkerDesc: "Análize AI ba ita-nia oan ka isin-rua",
        tracker: "Akompaña Isin-rua",
        trackerDesc: "Akompaña ita-nia isin-rua semana ba semana",
        vaccines: "Vasina",
        vaccinesDesc: "Kumpri orariu vasina ba ita-nia oan sira",
        doctor: "Ko'alia ho Doutór",
        doctorDesc: "Chat ka liga ba profisionál saúde",
        facilities: "Buka Fasilidade",
        facilitiesDesc: "Ospitál no sentru saúde besik ita"
      }
    },
    onboarding: {
      title: "Benvinda ba Médiku Labarik",
      subtitle: "Konta ami kona-ba ita-nia família atu ami bele personaliza kuidadu. Dadus hotu rai de'it iha dispozitivu ida ne'e.",
      editTitle: "Perfil Família",
      momSection: "Kona-ba inan",
      momName: "Naran inan nian",
      momDob: "Data moris (opsionál)",
      pregnantQ: "Ita isin-rua hela ka lae?",
      yes: "Sin",
      no: "Lae",
      lmp: "Loron primeiru husi menstruasaun ikus",
      lmpHelp: "Ami uza ida ne'e atu kalkula semana isin-rua no data partu.",
      childrenSection: "Ita-nia oan sira",
      addChild: "Aumenta oan ida",
      childName: "Naran oan nian",
      childDob: "Data moris",
      childSex: "Seksu",
      boy: "Mane",
      girl: "Feto",
      remove: "Hasai",
      noChildrenHint: "Ita bele aumenta oan sira agora ka ikus mai.",
      save: "Rai & Kontinua",
      nameRequired: "Favor hakerek naran inan nian."
    },
    selector: {
      title: "Sé mak presiza ajuda ohin?",
      subtitle: "Hili sé mak ita hakarak analiza sintoma ba.",
      mother: "Inan",
      pregnantBadge: "Isin-rua",
      week: "Semana",
      months: "fulan",
      years: "tinan",
      notPregnantNote: "Análize isin-rua disponivel bainhira perfil hatete katak ita isin-rua."
    },
    input: {
      title: "Deskreve Sintoma",
      desc: "Fornese detallu klaru atu hetan orientasaun ne'ebé akuradu.",
      forPatient: "Analiza ba",
      age: "Idade",
      weight: "Todan (kg, opsionál)",
      weightPlaceholder: "ez., 12",
      gestationalAge: "Semana isin-rua",
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
    pregnancySymptoms: ["Muta-muta", "Ulun moras", "Isin bubu", "Raan sai", "Kabun moras", "Oin halai", "Bebé book uitoan", "Kotuk moras"],
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
      "Obstetrician-Gynecologist": "Obstetra-Jinekolojista",
      "Midwife": "Parteira"
    },
    tracker: {
      title: "Akompaña Isin-rua",
      subtitle: "Akompaña ita-nia viajen semana ba semana",
      week: "Semana",
      of40: "husi 40",
      trimester: "Trimestre",
      trimesterNames: ["Trimestre primeiru", "Trimestre segundu", "Trimestre terseiru"],
      dueDate: "Data partu estimada",
      daysToGo: "loron tan",
      overdueNote: "Liu tiha ona data partu estimada — favor hasoru ita-nia parteira.",
      tipsTitle: "Konsellu ba faze ida ne'e",
      tips: [
        [
          "Komesa hemu ai-moruk ásidu fóliku no ferru husi sentru saúde.",
          "Han ki'ik maibé dala barak se ita sente muta-muta.",
          "Evita tua, tabaku, no ai-moruk laiha reseita.",
          "Bá vizita ANC (konsulta isin-rua) primeiru sedu bele."
        ],
        [
          "Ita tenke komesa sente bebé book — hatete ba parteira se lae.",
          "Toba iha muskiteiru laran atu prevene malária no dengue.",
          "Kontinua bá vizita ANC no hemu ai-moruk ferru.",
          "Han hahán ho proteína: tolun, ikan, fore, no modo matak."
        ],
        [
          "Sura bebé nia movimentu loron-loron — movimentu uitoan mak sinál perigu.",
          "Planeia ita-nia partu: deside fatin no transporte molok tempu to'o.",
          "Atensaun ba sinál perigu: raan sai, ulun moras makaas, isin bubu iha oin ka liman.",
          "Prepara roupa moos no dokumentu ba partu."
        ]
      ],
      ancTitle: "Vizita Kuidadu Antenatál (ANC)",
      ancSubtitle: "OMS rekomenda kontaktu 8 durante isin-rua",
      contact: "Kontaktu",
      weekLabel: "Semana",
      done: "Halo tiha ona",
      next: "Vizita tuirmai",
      upcoming: "Sei mai",
      notPregnant: "Laiha isin-rua ativu",
      notPregnantDesc: "Atualiza ita-nia perfil família se ita isin-rua atu ativa akompañamentu.",
      updateProfile: "Atualiza Perfil"
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
      subtitle: "Asesu diretu ba doutór no parteira sira, bainhira de'it ita presiza.",
      freeName: "Grátis",
      freeFeatures: ["Análize sintoma AI", "Akompaña isin-rua", "Orariu vasina", "Diretóriu fasilidade"],
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
      bio1: "Médiku Labarik (MédLab) mak asistente saúde inteligente ba inan no oan, harii ba Timor-Leste. Ho Inteligénsia Artifisial, nia ajuda inan no kuidadór sira komprende sintoma iha labarik no durante isin-rua, no liga sira ho kuidadu ne'ebé loos.",
      bio2: "Ami-nia misaun mak atu hamenus moras labarik no inan ne'ebé bele prevene, hodi tau orientasaun saúde ne'ebé fiar no fásil komprende — iha Tetun, Inglés, no Indonézia — iha família hotu-hotu nia liman.",
      whyTitle: "Tansá uza MédLab",
      features: [
        { title: "Harii ba Inan no Oan", desc: "Análize tuir idade ba labarik no tuir semana isin-rua ba inan — la'ós konsellu jerál ba ema boot." },
        { title: "Imediatu, 24/7", desc: "La presiza hein. Hetan orientasaun preliminár iha segundu laran, loron ka kalan, iha ita-nia lian." },
        { title: "Husi Konsellu ba Asaun", desc: "Alerta sinál perigu, rekomendasaun fornesedor kuidadu, lembransa vasina, no liña diretu ba doutór." },
        { title: "Privasidade Uluk", desc: "Ita-nia perfil família rai de'it iha ita-nia dispozitivu. Ami prioriza seguransa dadus." }
      ]
    },
    faq: {
      title: "Perguntas Baibain (FAQ)",
      items: [
        {
          q: "Médiku Labarik troka fali doutór sira ka lae?",
          a: "Lae. MédLab mak ferramenta informasaun nian atu ajuda komprende kauza posivel husi sintoma iha ita-nia oan ka durante isin-rua. Nia labele fó diagnoza ofisiál. Konsulta nafatin ho profisionál saúde kualifikadu ba desizaun médika."
        },
        {
          q: "Oinsá AI analiza sintoma sira?",
          a: "Aplikasaun ne'e uza modelu AI médiku. Nia kompara sintoma ne'ebé ita deskreve (testu ka foto) ho koñesimentu médiku — inklui sinál perigu labarik nian no isin-rua nian — atu sujere kondisaun provavel no pasu tuirmai."
        },
        {
          q: "Saida mak ha'u tenke halo se aplikasaun hatudu avizu Emerjénsia mean?",
          a: "Se ita haree avizu Emerjénsia mean, keta hein. Bá kedas fasilidade saúde ka ospitál besik liu, ka uza funsaun 'Ko'alia ho Doutór' ba orientasaun urjente."
        },
        {
          q: "Ha'u-nia família nia dadus seguru ka lae?",
          a: "Sin. Ita-nia perfil família no análize saúde rai de'it iha ita-nia dispozitivu rasik. Ami la fahe ita-nia informasaun pesoál."
        },
        {
          q: "Tansá naran fornesedor kuidadu balu iha lian Inglés?",
          a: "Atu tuir loloos ho ami-nia diretóriu fornesedor lokál, títulu profisionál (hanesan 'Pediatrician') mantein iha Inglés, maske parte seluk husi aplikasaun iha Tetun ka Indonézia."
        }
      ]
    },
    footer: {
      safety: "Médiku Labarik fornese sujestaun informativu de'it. Ba desizaun médika, konsulta nafatin ita-nia doutór, parteira, ka fasilidade saúde besik liu."
    },
    error: "Iha problema durante análize. Favor verifika katak servisu AI la'o hela no koko fali."
  },

  id: {
    hero: {
      title: "Rawat anak Anda.",
      subtitle: "Rawat kehamilan Anda.",
      desc: "Médiku Labarik menggunakan Kecerdasan Buatan untuk membantu ibu dan pengasuh di Timor-Leste memahami gejala pada anak dan selama kehamilan — serta memandu Anda ke perawatan yang tepat."
    },
    header: {
      aboutMenuTitle: "Tentang MédLab",
      aboutMenuSubtitle: "Apa & mengapa menggunakannya?",
      howItWorks: "Beranda",
      howItWorksSubtitle: "Kembali ke dasbor Anda",
      faq: "FAQ",
      faqSubtitle: "Pertanyaan umum",
      editProfile: "Profil Keluarga",
      editProfileSubtitle: "Edit ibu & anak-anak",
      language: "Bahasa"
    },
    home: {
      welcomeSub: "Pendamping Kesehatan Ibu & Anak",
      hello: "Halo",
      heroDesc: "Asisten kesehatan keluarga Anda: periksa gejala, pantau kehamilan, jaga jadwal vaksin, dan hubungi dokter saat dibutuhkan.",
      cards: {
        checker: "Periksa Gejala",
        checkerDesc: "Analisis AI untuk anak atau kehamilan Anda",
        tracker: "Pemantau Kehamilan",
        trackerDesc: "Ikuti kehamilan Anda minggu demi minggu",
        vaccines: "Vaksinasi",
        vaccinesDesc: "Jaga jadwal vaksin anak-anak Anda",
        doctor: "Bicara dengan Dokter",
        doctorDesc: "Chat atau telepon tenaga kesehatan",
        facilities: "Cari Fasilitas",
        facilitiesDesc: "Rumah sakit dan puskesmas di dekat Anda"
      }
    },
    onboarding: {
      title: "Selamat Datang di Médiku Labarik",
      subtitle: "Ceritakan tentang keluarga Anda agar kami dapat mempersonalisasi perawatan. Semua data tetap di perangkat ini.",
      editTitle: "Profil Keluarga",
      momSection: "Tentang ibu",
      momName: "Nama ibu",
      momDob: "Tanggal lahir (opsional)",
      pregnantQ: "Apakah Anda sedang hamil?",
      yes: "Ya",
      no: "Tidak",
      lmp: "Hari pertama haid terakhir",
      lmpHelp: "Kami menggunakannya untuk menghitung minggu kehamilan dan perkiraan tanggal persalinan.",
      childrenSection: "Anak-anak Anda",
      addChild: "Tambah anak",
      childName: "Nama anak",
      childDob: "Tanggal lahir",
      childSex: "Jenis kelamin",
      boy: "Laki-laki",
      girl: "Perempuan",
      remove: "Hapus",
      noChildrenHint: "Anda dapat menambahkan anak sekarang atau nanti.",
      save: "Simpan & Lanjutkan",
      nameRequired: "Silakan masukkan nama ibu."
    },
    selector: {
      title: "Siapa yang perlu bantuan hari ini?",
      subtitle: "Pilih siapa yang ingin Anda periksa gejalanya.",
      mother: "Ibu",
      pregnantBadge: "Hamil",
      week: "Minggu",
      months: "bulan",
      years: "tahun",
      notPregnantNote: "Pemeriksaan kehamilan tersedia jika profil menyatakan Anda sedang hamil."
    },
    input: {
      title: "Jelaskan Gejala",
      desc: "Berikan detail yang jelas untuk mendapatkan panduan yang akurat.",
      forPatient: "Memeriksa untuk",
      age: "Umur",
      weight: "Berat badan (kg, opsional)",
      weightPlaceholder: "cth., 12",
      gestationalAge: "Minggu kehamilan",
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
    pregnancySymptoms: ["Mual", "Sakit kepala", "Bengkak", "Pendarahan", "Nyeri perut", "Pusing", "Gerakan bayi berkurang", "Sakit punggung"],
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
      "Obstetrician-Gynecologist": "Dokter Kandungan",
      "Midwife": "Bidan"
    },
    tracker: {
      title: "Pemantau Kehamilan",
      subtitle: "Mengikuti perjalanan Anda minggu demi minggu",
      week: "Minggu",
      of40: "dari 40",
      trimester: "Trimester",
      trimesterNames: ["Trimester pertama", "Trimester kedua", "Trimester ketiga"],
      dueDate: "Perkiraan tanggal persalinan",
      daysToGo: "hari lagi",
      overdueNote: "Sudah melewati perkiraan tanggal persalinan — segera temui bidan Anda.",
      tipsTitle: "Tips untuk tahap ini",
      tips: [
        [
          "Mulai konsumsi asam folat dan tablet zat besi dari puskesmas.",
          "Makan sedikit tapi sering jika merasa mual.",
          "Hindari alkohol, rokok, dan obat tanpa resep.",
          "Lakukan kunjungan ANC (pemeriksaan kehamilan) pertama sedini mungkin."
        ],
        [
          "Anda seharusnya mulai merasakan gerakan bayi — beri tahu bidan jika tidak.",
          "Tidur dengan kelambu untuk mencegah malaria dan demam berdarah.",
          "Terus lakukan kunjungan ANC dan minum tablet zat besi.",
          "Makan makanan kaya protein: telur, ikan, kacang-kacangan, dan sayuran hijau."
        ],
        [
          "Hitung gerakan bayi setiap hari — gerakan berkurang adalah tanda bahaya.",
          "Rencanakan persalinan: tentukan fasilitas dan transportasi sejak awal.",
          "Waspadai tanda bahaya: pendarahan, sakit kepala hebat, bengkak di wajah atau tangan.",
          "Siapkan pakaian bersih dan dokumen untuk persalinan."
        ]
      ],
      ancTitle: "Kunjungan Pemeriksaan Kehamilan (ANC)",
      ancSubtitle: "WHO merekomendasikan 8 kontak selama kehamilan",
      contact: "Kontak",
      weekLabel: "Minggu",
      done: "Selesai",
      next: "Kunjungan berikutnya",
      upcoming: "Mendatang",
      notPregnant: "Tidak ada kehamilan aktif",
      notPregnantDesc: "Perbarui profil keluarga Anda jika sedang hamil untuk mengaktifkan pemantau.",
      updateProfile: "Perbarui Profil"
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
      subtitle: "Akses langsung ke dokter dan bidan, kapan pun Anda membutuhkannya.",
      freeName: "Gratis",
      freeFeatures: ["Pemeriksaan gejala AI", "Pemantau kehamilan", "Jadwal vaksinasi", "Direktori fasilitas"],
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
      bio1: "Médiku Labarik (MédLab) adalah asisten kesehatan ibu dan anak yang cerdas, dibuat untuk Timor-Leste. Didukung Kecerdasan Buatan, aplikasi ini membantu ibu dan pengasuh memahami gejala pada anak dan selama kehamilan, serta menghubungkan mereka dengan perawatan yang tepat.",
      bio2: "Misi kami adalah mengurangi penyakit anak dan ibu yang dapat dicegah dengan menghadirkan panduan kesehatan yang terpercaya dan mudah dipahami — dalam bahasa Tetum, Inggris, dan Indonesia — ke tangan setiap keluarga.",
      whyTitle: "Mengapa menggunakan MédLab",
      features: [
        { title: "Dibuat untuk Ibu & Anak", desc: "Analisis sesuai umur untuk anak dan sesuai usia kehamilan untuk ibu — bukan saran umum untuk orang dewasa." },
        { title: "Instan, 24/7", desc: "Tanpa ruang tunggu. Dapatkan panduan awal dalam hitungan detik, siang atau malam, dalam bahasa Anda." },
        { title: "Dari Saran ke Tindakan", desc: "Peringatan tanda bahaya, pencocokan penyedia layanan, pengingat vaksin, dan jalur langsung ke dokter." },
        { title: "Privasi Utama", desc: "Profil keluarga Anda tetap di perangkat Anda. Kami memprioritaskan keamanan data Anda." }
      ]
    },
    faq: {
      title: "Pertanyaan Umum (FAQ)",
      items: [
        {
          q: "Apakah Médiku Labarik pengganti dokter sungguhan?",
          a: "Tidak. MédLab adalah alat informasi untuk membantu Anda memahami kemungkinan penyebab gejala pada anak Anda atau selama kehamilan. Ini tidak dapat memberikan diagnosis medis resmi. Selalu konsultasikan keputusan medis dengan tenaga kesehatan yang berkualifikasi."
        },
        {
          q: "Bagaimana AI menganalisis gejala?",
          a: "Aplikasi ini menggunakan model AI medis. Ia membandingkan gejala yang Anda jelaskan (teks atau foto) dengan pengetahuan medis — termasuk tanda bahaya anak dan tanda bahaya kehamilan — untuk menyarankan kemungkinan kondisi dan langkah berikutnya."
        },
        {
          q: "Apa yang harus saya lakukan jika aplikasi menunjukkan peringatan Darurat merah?",
          a: "Jika Anda melihat peringatan Darurat merah, jangan menunggu. Segera pergi ke fasilitas kesehatan atau rumah sakit terdekat, atau gunakan fitur 'Bicara dengan Dokter' untuk panduan mendesak."
        },
        {
          q: "Apakah data keluarga saya aman?",
          a: "Ya. Profil keluarga dan pemeriksaan kesehatan Anda hanya disimpan di perangkat Anda sendiri. Kami tidak membagikan informasi pribadi Anda."
        },
        {
          q: "Mengapa beberapa nama penyedia layanan dalam bahasa Inggris?",
          a: "Agar cocok dengan direktori penyedia lokal kami, gelar profesional (seperti 'Pediatrician') tetap dalam bahasa Inggris, meskipun bagian lain aplikasi dalam bahasa Tetum atau Indonesia."
        }
      ]
    },
    footer: {
      safety: "Médiku Labarik hanya memberikan saran informatif. Untuk keputusan medis, selalu konsultasikan dengan dokter, bidan, atau fasilitas kesehatan terdekat."
    },
    error: "Ada masalah selama analisis. Pastikan layanan AI berjalan dan coba lagi."
  }
};
