// Centralized mock data for the doctor module — patients, appointments, prescriptions, notifications.
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  condition: string;
  allergies: string[];
  chronic: string[];
  currentMeds: string[];
  history: { date: string; doctor: string; diagnosis: string; notes: string }[];
  vitals: { date: string; bp: string; pulse: number; temp: number; spo2: number }[];
  reports: { name: string; date: string; type: string }[];
}

export const patients: Patient[] = [
  {
    id: "P-1042",
    name: "Ahmed Ali",
    age: 54, gender: "Male",
    phone: "+92 300 1234567",
    email: "ahmed.ali@example.com",
    bloodGroup: "B+",
    address: "House 12, Street 5, F-7 Islamabad",
    condition: "Hypertension, mild dyslipidemia",
    allergies: ["Penicillin", "Peanuts"],
    chronic: ["Hypertension (since 2019)", "Hyperlipidemia"],
    currentMeds: ["Amlodipine 5mg OD", "Atorvastatin 10mg HS", "Aspirin 75mg OD"],
    history: [
      { date: "2026-05-28", doctor: "Dr. Sarah Khan", diagnosis: "Routine follow-up", notes: "BP 138/92, advised lifestyle changes, continue meds." },
      { date: "2026-03-12", doctor: "Dr. Sarah Khan", diagnosis: "Chest discomfort", notes: "ECG normal sinus. Trop-I negative. Reassured." },
      { date: "2025-11-04", doctor: "Dr. Bilal Iqbal", diagnosis: "Annual check", diagnosis_extra: "", notes: "Lipid profile borderline. Started atorvastatin." } as any,
    ],
    vitals: [
      { date: "2026-06-01", bp: "138/92", pulse: 82, temp: 36.8, spo2: 97 },
      { date: "2026-05-15", bp: "142/94", pulse: 84, temp: 36.7, spo2: 98 },
      { date: "2026-05-01", bp: "136/88", pulse: 78, temp: 36.6, spo2: 98 },
      { date: "2026-04-15", bp: "144/96", pulse: 86, temp: 36.9, spo2: 97 },
    ],
    reports: [
      { name: "Lipid Profile", date: "2026-05-20", type: "Lab" },
      { name: "ECG", date: "2026-03-12", type: "Cardio" },
      { name: "Echo Report", date: "2026-02-08", type: "Cardio" },
      { name: "HbA1c", date: "2025-12-10", type: "Lab" },
    ],
  },
  {
    id: "P-1058",
    name: "Fatima Noor",
    age: 31, gender: "Female",
    phone: "+92 333 9876543",
    email: "fatima.n@example.com",
    bloodGroup: "O+",
    address: "Apt 4B, Garden Towers, Lahore",
    condition: "Anxiety with palpitations",
    allergies: ["None known"],
    chronic: [],
    currentMeds: ["Propranolol 20mg PRN"],
    history: [
      { date: "2026-06-10", doctor: "Dr. Sarah Khan", diagnosis: "Palpitations", notes: "Holter recommended. Reassurance given." },
    ],
    vitals: [
      { date: "2026-06-10", bp: "118/76", pulse: 96, temp: 36.7, spo2: 99 },
    ],
    reports: [
      { name: "TSH", date: "2026-06-08", type: "Lab" },
      { name: "ECG", date: "2026-06-10", type: "Cardio" },
    ],
  },
  {
    id: "P-1071",
    name: "Hassan Raza",
    age: 66, gender: "Male",
    phone: "+92 321 2233445", email: "hassan.r@example.com",
    bloodGroup: "A+", address: "Phase 5, DHA Karachi",
    condition: "Post-MI, on dual antiplatelet",
    allergies: ["Sulfa"],
    chronic: ["CAD", "T2DM", "CKD stage 2"],
    currentMeds: ["Clopidogrel 75mg", "Aspirin 75mg", "Bisoprolol 5mg", "Rosuvastatin 20mg", "Metformin 500mg BD"],
    history: [
      { date: "2026-06-05", doctor: "Dr. Sarah Khan", diagnosis: "Post-MI review", notes: "Stable. EF 45%. Continue meds." },
    ],
    vitals: [
      { date: "2026-06-05", bp: "128/82", pulse: 68, temp: 36.5, spo2: 96 },
    ],
    reports: [
      { name: "Coronary Angio", date: "2026-01-20", type: "Cardio" },
      { name: "Echo", date: "2026-05-30", type: "Cardio" },
    ],
  },
  {
    id: "P-1090", name: "Ayesha Tariq", age: 28, gender: "Female",
    phone: "+92 345 1112223", email: "ayesha.t@example.com",
    bloodGroup: "AB+", address: "Bahria Town, Rawalpindi",
    condition: "First visit — routine check",
    allergies: [], chronic: [], currentMeds: [],
    history: [],
    vitals: [{ date: "2026-06-14", bp: "120/78", pulse: 74, temp: 36.6, spo2: 99 }],
    reports: [],
  },
  {
    id: "P-1102", name: "Bilal Khan", age: 45, gender: "Male",
    phone: "+92 312 5556677", email: "bilal.k@example.com",
    bloodGroup: "B-", address: "Gulberg, Lahore",
    condition: "Post-op gallbladder, recovery",
    allergies: [], chronic: [],
    currentMeds: ["Pantoprazole 40mg", "Paracetamol 500mg PRN"],
    history: [{ date: "2026-06-12", doctor: "Dr. Sarah Khan", diagnosis: "Post-op review", notes: "Wound healing well." }],
    vitals: [{ date: "2026-06-12", bp: "126/80", pulse: 80, temp: 36.7, spo2: 98 }],
    reports: [{ name: "USG Abdomen", date: "2026-06-10", type: "Radiology" }],
  },
];

export const appointments = [
  { id: "A-201", time: "09:00", patientId: "P-1042", patient: "Ahmed Ali", reason: "Follow-up — Hypertension", status: "Confirmed", type: "In-person" },
  { id: "A-202", time: "09:30", patientId: "P-1058", patient: "Fatima Noor", reason: "Chest pain consultation", status: "Confirmed", type: "In-person" },
  { id: "A-203", time: "10:15", patientId: "P-1071", patient: "Hassan Raza", reason: "ECG review", status: "Pending", type: "Tele-consult" },
  { id: "A-204", time: "11:00", patientId: "P-1090", patient: "Ayesha Tariq", reason: "New patient", status: "Confirmed", type: "In-person" },
  { id: "A-205", time: "11:45", patientId: "P-1102", patient: "Bilal Khan", reason: "Post-op review", status: "Completed", type: "In-person" },
  { id: "A-206", time: "14:00", patientId: "P-1042", patient: "Ahmed Ali", reason: "Lab review", status: "Confirmed", type: "Tele-consult" },
  { id: "A-207", time: "15:30", patientId: "P-1058", patient: "Fatima Noor", reason: "Anxiety counselling", status: "Confirmed", type: "In-person" },
];

export const prescriptions = [
  { id: "RX-901", patient: "Ahmed Ali", date: "2026-06-14", items: "Amlodipine 5mg, Atorvastatin 10mg", status: "Issued" },
  { id: "RX-902", patient: "Fatima Noor", date: "2026-06-13", items: "Propranolol 20mg PRN", status: "Issued" },
  { id: "RX-903", patient: "Hassan Raza", date: "2026-06-12", items: "Clopidogrel, Aspirin, Bisoprolol", status: "Issued" },
  { id: "RX-904", patient: "Bilal Khan", date: "2026-06-12", items: "Pantoprazole, Paracetamol", status: "Issued" },
  { id: "RX-905", patient: "Ayesha Tariq", date: "2026-06-11", items: "Multivitamin, Folic acid", status: "Draft" },
];

export const notifications = [
  { id: 1, title: "New appointment booked", body: "Ayesha Tariq booked an 11:00 slot for tomorrow.", time: "2 min ago", type: "appointment", unread: true },
  { id: 2, title: "Lab results ready", body: "Lipid profile for Ahmed Ali is available.", time: "18 min ago", type: "lab", unread: true },
  { id: 3, title: "Leave approved", body: "Your leave for 22-Jun has been approved by admin.", time: "1 hr ago", type: "leave", unread: true },
  { id: 4, title: "Prescription refill request", body: "Hassan Raza requested a refill for Clopidogrel.", time: "3 hrs ago", type: "rx", unread: false },
  { id: 5, title: "New patient assigned", body: "Bilal Khan transferred to your care.", time: "Yesterday", type: "patient", unread: false },
  { id: 6, title: "System maintenance", body: "Scheduled maintenance window 02:00–03:00.", time: "2 days ago", type: "system", unread: false },
];

export const doctorSlides = [
  {
    title: "Clinical Overview & Daily Schedule",
    subtitle: "Today at a glance",
    badge: "Live Monitor",
    body: "You have 8 consultations scheduled today, 3 high-priority lab results, and 2 pending pharmacy refill authorizations.",
    gradient: "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600",
    emoji: "🩺",
    stats: [
      { label: "Appointments", value: "8", change: "+2 today" },
      { label: "Lab Reports", value: "3", change: "Urgent" },
      { label: "Rx Refills", value: "2", change: "Pending" },
    ],
  },
  {
    title: "Critical Patient Vitals Alert",
    subtitle: "Cardiology Unit",
    badge: "Attention Needed",
    body: "Patient Hassan Raza's systolic BP is elevated (146/96 mmHg). Recommended medication titration & follow-up ECG.",
    gradient: "bg-gradient-to-r from-rose-600 via-pink-600 to-red-700",
    emoji: "⚡",
    stats: [
      { label: "Systolic BP", value: "146 mmHg", change: "+12%" },
      { label: "Pulse Rate", value: "88 bpm", change: "Elevated" },
      { label: "SpO2 Level", value: "96%", change: "Stable" },
    ],
  },
  {
    title: "Post-Operative Recovery Insights",
    subtitle: "Surgical Cohort",
    badge: "Recovery 92%",
    body: "Bilal Khan (Post-op Cholecystectomy) wound healing cleanly. Vitals within normal limits, ambulation started.",
    gradient: "bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600",
    emoji: "🌱",
    stats: [
      { label: "Post-op Day", value: "Day 5", change: "On Track" },
      { label: "Pain Scale", value: "2 / 10", change: "Mild" },
      { label: "Recovery", value: "88%", change: "+14%" },
    ],
  },
  {
    title: "Clinical Practice Guidelines 2026",
    subtitle: "Cardiovascular Medicine",
    badge: "CME Credits",
    body: "Updated ESC 2026 Guidelines on Resistant Hypertension & SGLT2i heart failure protocols are now available in your portal.",
    gradient: "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600",
    emoji: "📘",
    stats: [
      { label: "Guidelines", value: "12 New", change: "Updated" },
      { label: "CME Credits", value: "4.5 Hrs", change: "Earned" },
      { label: "Library", value: "Available", change: "Access" },
    ],
  },
];
