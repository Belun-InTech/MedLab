
import { Specialist } from "../types";

export const MOCK_SPECIALISTS: Specialist[] = [
  { 
    id: 1, 
    name: "Dr. Sarah Silva", 
    specialty: "General Practitioner", 
    hospital: "Dili Medical Center", 
    phone: "+670 7777-1111",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["09:00", "09:30", "10:00", "14:00", "14:30", "18:00"]
  },
  { 
    id: 2, 
    name: "Dr. Antonio Guterres", 
    specialty: "Cardiologist", 
    hospital: "HNGV Hospital", 
    phone: "+670 7777-2222",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Next Available: Tomorrow",
    availabilitySlots: ["10:30", "11:00", "15:00", "15:30"]
  },
  { 
    id: 3, 
    name: "Dr. Maria Santos", 
    specialty: "Dermatologist", 
    hospital: "Stamford Medical", 
    phone: "+670 7777-3333",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["09:00", "09:30", "14:00", "14:30", "15:00"]
  },
  { 
    id: 4, 
    name: "Dr. John Smith", 
    specialty: "Neurologist", 
    hospital: "International SOS", 
    phone: "+670 7777-4444",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Next Available: Monday",
    availabilitySlots: ["10:00", "10:30", "11:00", "14:00"]
  },
  { 
    id: 5, 
    name: "Dr. Budi Santoso", 
    specialty: "Pediatrician", 
    hospital: "Klinik Bairro Pite", 
    phone: "+670 7777-5555",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["08:30", "09:00", "09:30", "10:00", "10:30"]
  },
  { 
    id: 6, 
    name: "Dr. Linda Chen", 
    specialty: "ENT Specialist", 
    hospital: "Dili Medical Center", 
    phone: "+670 7777-6666",
    image: "https://images.unsplash.com/photo-1651008325506-71d345a90e3d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Next Available: Wednesday",
    availabilitySlots: ["14:00", "14:30", "15:00", "15:30", "16:00"]
  },
  { 
    id: 7, 
    name: "Dr. Robert Costa", 
    specialty: "General Practitioner", 
    hospital: "HNGV Hospital", 
    phone: "+670 7777-7777",
    image: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["09:00", "10:00", "11:00", "14:00", "15:00"]
  },
  { 
    id: 8, 
    name: "Dr. Elena Rodriguez", 
    specialty: "Internal Medicine", 
    hospital: "International SOS", 
    phone: "+670 7777-8888",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Next Available: Tomorrow",
    availabilitySlots: ["09:30", "10:00", "14:30", "15:00"]
  },
  { 
    id: 9, 
    name: "Dr. Michael Chang", 
    specialty: "Cardiologist", 
    hospital: "Stamford Medical", 
    phone: "+670 7777-9999",
    image: "https://images.unsplash.com/photo-1582750433449-d22b1c74caf8?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["09:00", "10:00", "14:00", "18:00", "18:30"]
  },
  { 
    id: 10, 
    name: "Dr. Fatimah Zahra", 
    specialty: "Dermatologist", 
    hospital: "Klinik Fatumeta", 
    phone: "+670 7777-0000",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Next Available: Thursday",
    availabilitySlots: ["09:00", "09:30", "10:00", "10:30"]
  },
  { 
    id: 11, 
    name: "Dr. Sofia Martins", 
    specialty: "Ophthalmologist", 
    hospital: "Vision Care Timor", 
    phone: "+670 7777-1234",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["10:00", "11:00", "15:00", "16:00"]
  },
  { 
    id: 12, 
    name: "Dr. James O'Connor", 
    specialty: "Orthopedic Surgeon", 
    hospital: "Baucau Regional Hospital", 
    phone: "+670 7777-5678",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Next Available: Tomorrow",
    availabilitySlots: ["09:00", "10:00", "14:00", "15:00"]
  },
  { 
    id: 13, 
    name: "Dr. Anita Ximenes", 
    specialty: "Obstetrician-Gynecologist", 
    hospital: "Marie Stopes Timor-Leste", 
    phone: "+670 7777-9012",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["09:00", "09:30", "10:00", "10:30", "11:00"]
  },
  { 
    id: 14, 
    name: "Dr. Paulo Freitas", 
    specialty: "Dentist", 
    hospital: "Dili Dental Clinic", 
    phone: "+670 7777-3456",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Next Available: Monday",
    availabilitySlots: ["09:00", "10:00", "14:00", "15:00", "16:00"]
  },
  { 
    id: 15, 
    name: "Dr. Lucia Fernandez", 
    specialty: "Psychiatrist", 
    hospital: "PRADET Mental Health", 
    phone: "+670 7777-7890",
    image: "https://images.unsplash.com/photo-1651008325506-71d345a90e3d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
  },
  { 
    id: 16, 
    name: "Dr. Kenjiro Tanaka", 
    specialty: "Endocrinologist", 
    hospital: "Maliana Referral Hospital", 
    phone: "+670 7777-1122",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Next Available: Tomorrow",
    availabilitySlots: ["09:00", "10:00", "11:00", "14:00"]
  },
  { 
    id: 17, 
    name: "Dr. Maria Gusmão", 
    specialty: "Urologist", 
    hospital: "Maubisse Referral Hospital", 
    phone: "+670 7777-3344",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["09:00", "10:00", "14:00", "15:00"]
  },
  { 
    id: 18, 
    name: "Dr. Li Wei", 
    specialty: "Rheumatologist", 
    hospital: "Chinese Medical Team Clinic", 
    phone: "+670 7777-5566",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30"]
  },
  { 
    id: 19, 
    name: "Dr. Jose Ramos", 
    specialty: "Pulmonologist", 
    hospital: "Suai Referral Hospital", 
    phone: "+670 7777-7788",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Next Available: Friday",
    availabilitySlots: ["10:00", "11:00", "15:00", "16:00"]
  },
  { 
    id: 20, 
    name: "Dr. Ana Tilman", 
    specialty: "Gastroenterologist", 
    hospital: "Oecusse Referral Hospital", 
    phone: "+670 7777-9900",
    image: "https://images.unsplash.com/photo-1651008325506-71d345a90e3d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Available Today",
    availabilitySlots: ["09:00", "10:00", "14:00", "15:00"]
  }
];

export const MOCK_CLINICS = [];
