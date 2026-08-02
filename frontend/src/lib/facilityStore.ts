export interface HospitalFacility {
  id: string;
  name: string;
  category: "VIP & Comfort" | "Advanced Diagnostics" | "Surgical & ICU" | "Rehab & Therapy" | "Emergency Transport";
  description: string;
  status: "Available" | "Maintenance" | "Fully Booked";
  accessFee: number;
  location: string;
  operatingHours: string;
  amenities: string[];
  image: string;
}

const INITIAL_FACILITIES: HospitalFacility[] = [
  {
    id: "fac-1",
    name: "Executive VIP Health Lounge & Private Suites",
    category: "VIP & Comfort",
    description: "Ultra-luxury inpatient suites featuring private butler service, en-suite dining, and 24/7 dedicated nursing staff.",
    status: "Available",
    accessFee: 25000,
    location: "Floor 4, West Wing",
    operatingHours: "24/7 Open",
    amenities: ["Private Wifi", "55' Smart TV", "Guest Lounge", "Gourmet Meal Plan"],
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fac-2",
    name: "3.0 Tesla Silent MRI & 128-Slice Cardiac CT Center",
    category: "Advanced Diagnostics",
    description: "Next-gen zero-noise magnetic resonance scanner with ultra-fast cardiac angiography capabilities.",
    status: "Available",
    accessFee: 18000,
    location: "Basement 1, Diagnostic Wing",
    operatingHours: "07:00 AM – 11:00 PM",
    amenities: ["3D Reconstruction", "Zero Noise Bore", "Contrast Suite", "Immediate Digital Report"],
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fac-3",
    name: "Robotic Minimally Invasive Surgical Suite",
    category: "Surgical & ICU",
    description: "DaVinci robotic surgical system providing sub-millimeter precision for urology, gynecology, and cardiac procedures.",
    status: "Available",
    accessFee: 45000,
    location: "Floor 2, Operating Pavilion",
    operatingHours: "Scheduled & Emergency Ops",
    amenities: ["3D HD Vision", "Articulated Instruments", "ICU Recovery Pod"],
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fac-4",
    name: "Hydrotherapy & Neuro-Rehabilitation Center",
    category: "Rehab & Therapy",
    description: "Climate-controlled aquatic therapy pool equipped with underwater treadmills and motor rehab systems.",
    status: "Maintenance",
    accessFee: 8000,
    location: "Ground Floor, Rehab Block",
    operatingHours: "08:00 AM – 06:00 PM",
    amenities: ["Underwater Motion Sensors", "Warm Water Jet Pools", "Physiotherapist One-on-One"],
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fac-5",
    name: "Air Ambulance Helipad & Trauma Emergency Dock",
    category: "Emergency Transport",
    description: "Rooftop trauma helipad with direct elevator link to ICU for rapid air evacuations.",
    status: "Available",
    accessFee: 60000,
    location: "Rooftop Helipad, Tower A",
    operatingHours: "24/7 Emergency Dispatch",
    amenities: ["Air-Evac Paramedics", "Direct ICU Transfer", "Night Landing Guidance"],
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80"
  }
];

const STORAGE_KEY = "medicore_hospital_facilities";

export function getFacilities(): HospitalFacility[] {
  if (typeof window === "undefined") return INITIAL_FACILITIES;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FACILITIES));
    return INITIAL_FACILITIES;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_FACILITIES;
  }
}

export function saveFacilities(facilities: HospitalFacility[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(facilities));
    window.dispatchEvent(new Event("medicore_facilities_updated"));
  }
}

export function updateFacilityStatus(id: string, status: HospitalFacility["status"]) {
  const all = getFacilities();
  const updated = all.map((f) => (f.id === id ? { ...f, status } : f));
  saveFacilities(updated);
}

export function addFacility(facility: Omit<HospitalFacility, "id">): HospitalFacility {
  const newFac: HospitalFacility = {
    ...facility,
    id: `fac-${Date.now()}`
  };
  const all = getFacilities();
  const updated = [newFac, ...all];
  saveFacilities(updated);
  return newFac;
}
