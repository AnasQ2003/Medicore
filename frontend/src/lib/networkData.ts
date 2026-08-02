export interface DoctorDetail {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  status: "On Duty" | "On Leave" | "In Surgery";
  patientsCount: number;
}

export interface PatientDetail {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  assignedDoctor: string;
  bedNo: string;
  status: "Admitted" | "ICU" | "Discharged Soon";
}

export interface AccessoryItem {
  id: string;
  name: string;
  category: "Medical Device" | "Furniture" | "Emergency" | "Consumables";
  quantity: number;
  status: "In Stock" | "Low Stock" | "Critical";
  unit: string;
}

export interface UtilityBill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  category: "Electricity" | "Water" | "Gas" | "Internet" | "Waste Disposal" | "Generator Fuel";
  consumption: string;
}

export interface BranchDetailData {
  id: string;
  name: string;
  code: string;
  cityId: string;
  cityName: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  manager: string;
  status: "Active" | "Maintenance" | "High Load";
  
  // High level metrics
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  totalDoctors: number;
  totalNurses: number;
  totalPatients: number;

  // Medical Vitals & Stats (Monthly / Cumulative)
  livesSaved: number;
  birthsCount: number;
  deathsCount: number;
  surgeriesTotal: number;
  emergencyOps: number;
  successfulDischarges: number;

  // Detailed lists
  doctors: DoctorDetail[];
  patients: PatientDetail[];
  accessories: AccessoryItem[];
  utilityBills: UtilityBill[];
}

export interface CityData {
  id: string;
  name: string;
  province: string;
  totalBranches: number;
  totalBeds: number;
  totalDoctors: number;
  totalPatients: number;
  image: string;
  branches: BranchDetailData[];
}

export const INITIAL_CITIES_DATA: CityData[] = [
  {
    id: "isb",
    name: "Islamabad",
    province: "Federal Capital",
    totalBranches: 2,
    totalBeds: 240,
    totalDoctors: 70,
    totalPatients: 920,
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80",
    branches: [
      {
        id: "isb-hq",
        name: "MediCore HQ & Central Medical Complex",
        code: "ISB-01",
        cityId: "isb",
        cityName: "Islamabad",
        address: "Sector F-7/2, Main Avenue, Islamabad",
        phone: "+92 51 111 222 333",
        emergencyPhone: "+92 51 111 911 001",
        manager: "Dr. Arshad Mahmood",
        status: "Active",
        totalBeds: 150,
        occupiedBeds: 118,
        availableBeds: 32,
        totalDoctors: 45,
        totalNurses: 85,
        totalPatients: 580,
        livesSaved: 1420,
        birthsCount: 310,
        deathsCount: 14,
        surgeriesTotal: 480,
        emergencyOps: 195,
        successfulDischarges: 540,
        doctors: [
          { id: "d1", name: "Dr. Arshad Mahmood", specialty: "Cardiology", experience: "18 Yrs", status: "On Duty", patientsCount: 24 },
          { id: "d2", name: "Dr. Ayesha Malik", specialty: "Neurology", experience: "12 Yrs", status: "In Surgery", patientsCount: 18 },
          { id: "d3", name: "Dr. Bilal Khan", specialty: "Orthopedics", experience: "15 Yrs", status: "On Duty", patientsCount: 31 },
          { id: "d4", name: "Dr. Zainab Tariq", specialty: "Pediatrics", experience: "9 Yrs", status: "On Leave", patientsCount: 15 }
        ],
        patients: [
          { id: "p1", name: "Muhammad Usama", age: 45, gender: "Male", condition: "Acute Myocardial Infarction", assignedDoctor: "Dr. Arshad Mahmood", bedNo: "ICU-04", status: "ICU" },
          { id: "p2", name: "Sara Ahmed", age: 29, gender: "Female", condition: "Post-op Recovery", assignedDoctor: "Dr. Ayesha Malik", bedNo: "302-A", status: "Admitted" },
          { id: "p3", name: "Hamza Riaz", age: 62, gender: "Male", condition: "Femur Fracture Repair", assignedDoctor: "Dr. Bilal Khan", bedNo: "114-B", status: "Discharged Soon" }
        ],
        accessories: [
          { id: "acc-1", name: "ICU Ventilators", category: "Medical Device", quantity: 18, status: "In Stock", unit: "Units" },
          { id: "acc-2", name: "Electric Patient Beds", category: "Furniture", quantity: 150, status: "In Stock", unit: "Beds" },
          { id: "acc-3", name: "Oxygen Cylinders (Large)", category: "Emergency", quantity: 65, status: "Low Stock", unit: "Cylinders" },
          { id: "acc-4", name: "Cardiac Monitors", category: "Medical Device", quantity: 42, status: "In Stock", unit: "Monitors" },
          { id: "acc-5", name: "Wheelchairs", category: "Furniture", quantity: 35, status: "In Stock", unit: "Units" },
          { id: "acc-6", name: "Infusion Pumps", category: "Consumables", quantity: 80, status: "In Stock", unit: "Pumps" }
        ],
        utilityBills: [
          { id: "b1", title: "IESCO Main Power Grid", amount: 485000, dueDate: "2026-08-15", status: "Paid", category: "Electricity", consumption: "42,500 kWh" },
          { id: "b2", title: "CDA Municipal Water", amount: 62000, dueDate: "2026-08-18", status: "Pending", category: "Water", consumption: "120,000 Liters" },
          { id: "b3", title: "SNGPL Gas Connection", amount: 115000, dueDate: "2026-08-20", status: "Pending", category: "Gas", consumption: "3,400 MMBtu" },
          { id: "b4", title: "Dedicated Fiber Internet (1Gbps)", amount: 85000, dueDate: "2026-08-10", status: "Paid", category: "Internet", consumption: "Unlimited Dedicated" },
          { id: "b5", title: "Hazardous Bio-Medical Waste Service", amount: 95000, dueDate: "2026-08-25", status: "Pending", category: "Waste Disposal", consumption: "850 kg" },
          { id: "b6", title: "Backup Diesel Generator Fuel", amount: 320000, dueDate: "2026-08-05", status: "Paid", category: "Generator Fuel", consumption: "1,200 Liters" }
        ]
      },
      {
        id: "isb-g11",
        name: "MediCore G-11 Emergency Unit",
        code: "ISB-02",
        cityId: "isb",
        cityName: "Islamabad",
        address: "Sector G-11 Markaz, Islamabad",
        phone: "+92 51 444 555 666",
        emergencyPhone: "+92 51 444 911 002",
        manager: "Dr. Maria Qureshi",
        status: "Active",
        totalBeds: 90,
        occupiedBeds: 62,
        availableBeds: 28,
        totalDoctors: 25,
        totalNurses: 45,
        totalPatients: 340,
        livesSaved: 890,
        birthsCount: 140,
        deathsCount: 8,
        surgeriesTotal: 210,
        emergencyOps: 115,
        successfulDischarges: 310,
        doctors: [
          { id: "d5", name: "Dr. Maria Qureshi", specialty: "Emergency Medicine", experience: "14 Yrs", status: "On Duty", patientsCount: 30 },
          { id: "d6", name: "Dr. Kamran Akmal", specialty: "General Surgery", experience: "10 Yrs", status: "On Duty", patientsCount: 22 }
        ],
        patients: [
          { id: "p4", name: "Kashif Mahmood", age: 38, gender: "Male", condition: "Trauma Recovery", assignedDoctor: "Dr. Maria Qureshi", bedNo: "ER-02", status: "Admitted" }
        ],
        accessories: [
          { id: "acc-7", name: "Portable Defibrillators", category: "Emergency", quantity: 12, status: "In Stock", unit: "Units" },
          { id: "acc-8", name: "Standard Hospital Beds", category: "Furniture", quantity: 90, status: "In Stock", unit: "Beds" },
          { id: "acc-9", name: "Oxygen Cylinders", category: "Emergency", quantity: 40, status: "In Stock", unit: "Cylinders" }
        ],
        utilityBills: [
          { id: "b7", title: "IESCO Sub-Grid Electric", amount: 240000, dueDate: "2026-08-15", status: "Paid", category: "Electricity", consumption: "21,000 kWh" },
          { id: "b8", title: "Commercial Gas", amount: 54000, dueDate: "2026-08-22", status: "Pending", category: "Gas", consumption: "1,500 MMBtu" }
        ]
      }
    ]
  },
  {
    id: "lhr",
    name: "Lahore",
    province: "Punjab",
    totalBranches: 2,
    totalBeds: 280,
    totalDoctors: 82,
    totalPatients: 1150,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
    branches: [
      {
        id: "lhr-gulberg",
        name: "MediCore Gulberg Specialty Hospital",
        code: "LHR-01",
        cityId: "lhr",
        cityName: "Lahore",
        address: "88-C, Main Boulevard, Gulberg III, Lahore",
        phone: "+92 42 111 222 333",
        emergencyPhone: "+92 42 111 911 001",
        manager: "Dr. Fatima Zahra",
        status: "Active",
        totalBeds: 180,
        occupiedBeds: 145,
        availableBeds: 35,
        totalDoctors: 52,
        totalNurses: 98,
        totalPatients: 720,
        livesSaved: 2150,
        birthsCount: 480,
        deathsCount: 19,
        surgeriesTotal: 690,
        emergencyOps: 240,
        successfulDischarges: 680,
        doctors: [
          { id: "dl1", name: "Dr. Fatima Zahra", specialty: "Gynecology & Obstetrics", experience: "16 Yrs", status: "On Duty", patientsCount: 35 },
          { id: "dl2", name: "Dr. Usman Gondal", specialty: "Oncology", experience: "20 Yrs", status: "On Duty", patientsCount: 28 }
        ],
        patients: [
          { id: "pl1", name: "Zubair Shah", age: 54, gender: "Male", condition: "Chemotherapy Observation", assignedDoctor: "Dr. Usman Gondal", bedNo: "ONC-12", status: "Admitted" }
        ],
        accessories: [
          { id: "acc-l1", name: "Advanced Ultrasound Scanners", category: "Medical Device", quantity: 8, status: "In Stock", unit: "Machines" },
          { id: "acc-l2", name: "ICU Beds", category: "Furniture", quantity: 45, status: "Low Stock", unit: "Beds" }
        ],
        utilityBills: [
          { id: "bl1", title: "LESCO Commercial Electric", amount: 620000, dueDate: "2026-08-16", status: "Pending", category: "Electricity", consumption: "56,000 kWh" },
          { id: "bl2", title: "WASA Water Supply", amount: 88000, dueDate: "2026-08-19", status: "Paid", category: "Water", consumption: "180,000 Liters" }
        ]
      },
      {
        id: "lhr-dha",
        name: "MediCore DHA Phase 5 Complex",
        code: "LHR-02",
        cityId: "lhr",
        cityName: "Lahore",
        address: "Sector CCA, Phase 5 DHA, Lahore",
        phone: "+92 42 357 888 99",
        emergencyPhone: "+92 42 357 911 00",
        manager: "Dr. Salman Raza",
        status: "High Load",
        totalBeds: 100,
        occupiedBeds: 92,
        availableBeds: 8,
        totalDoctors: 30,
        totalNurses: 60,
        totalPatients: 430,
        livesSaved: 1100,
        birthsCount: 210,
        deathsCount: 9,
        surgeriesTotal: 340,
        emergencyOps: 150,
        successfulDischarges: 390,
        doctors: [
          { id: "dl3", name: "Dr. Salman Raza", specialty: "Cardiothoracic Surgery", experience: "17 Yrs", status: "In Surgery", patientsCount: 20 }
        ],
        patients: [
          { id: "pl2", name: "Noreen Imran", age: 31, gender: "Female", condition: "Maternity Ward", assignedDoctor: "Dr. Fatima Zahra", bedNo: "MAT-05", status: "Admitted" }
        ],
        accessories: [
          { id: "acc-l3", name: "Dialysis Machines", category: "Medical Device", quantity: 15, status: "Critical", unit: "Units" }
        ],
        utilityBills: [
          { id: "bl3", title: "LESCO DHA Distribution", amount: 390000, dueDate: "2026-08-14", status: "Paid", category: "Electricity", consumption: "34,000 kWh" }
        ]
      }
    ]
  },
  {
    id: "khi",
    name: "Karachi",
    province: "Sindh",
    totalBranches: 2,
    totalBeds: 350,
    totalDoctors: 95,
    totalPatients: 1480,
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80",
    branches: [
      {
        id: "khi-pechs",
        name: "MediCore PECHS Tertiary Hospital",
        code: "KHI-01",
        cityId: "khi",
        cityName: "Karachi",
        address: "Plot 42, Block 6 PECHS, Shahrah-e-Faisal, Karachi",
        phone: "+92 21 111 222 333",
        emergencyPhone: "+92 21 111 911 001",
        manager: "Dr. Tariq Jameel",
        status: "Active",
        totalBeds: 200,
        occupiedBeds: 165,
        availableBeds: 35,
        totalDoctors: 60,
        totalNurses: 110,
        totalPatients: 910,
        livesSaved: 3200,
        birthsCount: 650,
        deathsCount: 22,
        surgeriesTotal: 890,
        emergencyOps: 380,
        successfulDischarges: 870,
        doctors: [
          { id: "dk1", name: "Dr. Tariq Jameel", specialty: "Nephrology", experience: "22 Yrs", status: "On Duty", patientsCount: 40 },
          { id: "dk2", name: "Dr. Nida Yasir", specialty: "Dermatology & Burn Care", experience: "11 Yrs", status: "On Duty", patientsCount: 26 }
        ],
        patients: [
          { id: "pk1", name: "Farhan Saeed", age: 50, gender: "Male", condition: "Renal Failure Dialysis", assignedDoctor: "Dr. Tariq Jameel", bedNo: "NEP-08", status: "Admitted" }
        ],
        accessories: [
          { id: "acc-k1", name: "Surgical Lights & Tables", category: "Medical Device", quantity: 14, status: "In Stock", unit: "Sets" },
          { id: "acc-k2", name: "Patient Stretchers", category: "Furniture", quantity: 40, status: "In Stock", unit: "Units" }
        ],
        utilityBills: [
          { id: "bk1", title: "K-Electric Main Feeder", amount: 780000, dueDate: "2026-08-17", status: "Overdue", category: "Electricity", consumption: "72,000 kWh" },
          { id: "bk2", title: "KWSC Tanker & Pipeline Water", amount: 140000, dueDate: "2026-08-12", status: "Paid", category: "Water", consumption: "250,000 Liters" }
        ]
      },
      {
        id: "khi-clifton",
        name: "MediCore Clifton Super Specialty Center",
        code: "KHI-02",
        cityId: "khi",
        cityName: "Karachi",
        address: "Block 4, Clifton, Near Teen Talwar, Karachi",
        phone: "+92 21 358 111 22",
        emergencyPhone: "+92 21 358 911 00",
        manager: "Dr. Shehryar Khan",
        status: "Active",
        totalBeds: 150,
        occupiedBeds: 110,
        availableBeds: 40,
        totalDoctors: 35,
        totalNurses: 75,
        totalPatients: 570,
        livesSaved: 1650,
        birthsCount: 380,
        deathsCount: 11,
        surgeriesTotal: 510,
        emergencyOps: 190,
        successfulDischarges: 520,
        doctors: [
          { id: "dk3", name: "Dr. Shehryar Khan", specialty: "Pediatric Surgery", experience: "15 Yrs", status: "On Duty", patientsCount: 22 }
        ],
        patients: [
          { id: "pk2", name: "Anum Fawad", age: 8, gender: "Female", condition: "Appendectomy Recovery", assignedDoctor: "Dr. Shehryar Khan", bedNo: "PED-03", status: "Admitted" }
        ],
        accessories: [
          { id: "acc-k3", name: "Nebulizer Machines", category: "Consumables", quantity: 50, status: "In Stock", unit: "Units" }
        ],
        utilityBills: [
          { id: "bk3", title: "K-Electric Clifton Grid", amount: 490000, dueDate: "2026-08-18", status: "Pending", category: "Electricity", consumption: "45,000 kWh" }
        ]
      }
    ]
  }
];
