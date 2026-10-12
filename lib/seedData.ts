import { hashPassword, encryptData } from './crypto';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'desk_officer' | 'admin';
  studentIdMasked: string;
  encryptedStudentId: { ciphertext: string; iv: string; authTag: string; version: string };
  encryptedPhone: { ciphertext: string; iv: string; authTag: string; version: string };
  passwordHash: string;
  passwordSalt: string;
  passwordIterations: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  userId: string;
  reporterName: string;
  type: 'LOST' | 'FOUND';
  title: string;
  category: string;
  campusLocation: string;
  eventDate: string;
  status: 'OPEN' | 'MATCH_SUGGESTED' | 'CLAIM_PENDING' | 'VERIFIED_RETURNED' | 'CLOSED';
  publicDescription: string;
  hasPrivateClues: boolean;
  encryptedPrivateClues?: { ciphertext: string; iv: string; authTag: string; version: string };
  photoUrl: string;
  matchScore?: number;
  matchFactors?: {
    categoryCompat: number;
    descriptionSim: number;
    locationProx: number;
    timeProx: number;
    keywordOverlap: number;
    summary: string;
  };
  pickupTokenHash?: string;
  verifiedPickupCode?: string;
  createdAt: string;
}

export interface DeskLocation {
  id: string;
  name: string;
  campusBranch: string;
  building: string;
  room: string;
  hours: string;
  phone: string;
  email: string;
  coordinator: string;
  activeItemsCount: number;
}

export const CAMPUS_DESKS: DeskLocation[] = [
  {
    id: 'desk-lib-fui',
    name: 'Central Library Information Desk (FUI Main)',
    campusBranch: 'Islamabad Campus (DHA Phase 1)',
    building: 'Iqbal Central Library',
    room: 'Level 1, Circulation & Help Counter',
    hours: 'Mon – Fri: 08:30 – 21:00 | Sat: 09:00 – 17:00',
    phone: '+92 (51) 5151437 Ext 210',
    email: 'library@fui.edu.pk',
    coordinator: 'Dr. Muhammad Bilal (Chief Proctor)',
    activeItemsCount: 38,
  },
  {
    id: 'desk-dsa-fui',
    name: 'Directorate of Student Affairs & Proctorial Office',
    campusBranch: 'Islamabad Campus (Defence Avenue)',
    building: 'Jinnah Academic Block',
    room: 'Room G-04, Ground Floor',
    hours: 'Mon – Fri: 08:30 – 16:30',
    phone: '+92 (51) 5151438',
    email: 'dsa@fui.edu.pk',
    coordinator: 'Engr. Usman Khalid (Director Student Affairs)',
    activeItemsCount: 24,
  },
  {
    id: 'desk-furc-rwp',
    name: 'FURC Rawalpindi Campus Property Desk',
    campusBranch: 'Rawalpindi Campus (New Lalazar)',
    building: 'Academic Block A',
    room: 'Reception & Proctorial Desk',
    hours: 'Mon – Fri: 08:30 – 17:00 | Sat: 09:00 – 14:00',
    phone: '+92 (51) 5790361 Ext 105',
    email: 'furc.lostfound@fui.edu.pk',
    coordinator: 'Prof. Tariq Mehmood',
    activeItemsCount: 31,
  },
  {
    id: 'desk-fusst-cs',
    name: 'FUSST Computing & IT Lab Support Desk',
    campusBranch: 'Islamabad Campus',
    building: 'School of Science & Technology (FUSST)',
    room: 'Computing Lab Wing, 2nd Floor',
    hours: 'Mon – Fri: 08:30 – 18:00',
    phone: '+92 (51) 5151439 Ext 314',
    email: 'fusst.helpdesk@fui.edu.pk',
    coordinator: 'Engr. Asadullah Khan',
    activeItemsCount: 16,
  },
];

export const CATEGORIES = [
  'Student Smart ID & RFID Cards',
  'Laptops & Chargers',
  'Calculators & Engineering Tools',
  'Audio & Wireless Earbuds',
  'Backpacks & Course Files',
  'Bike & Car Keys',
  'Wallets, CNIC & ATM Cards',
  'Watches & Wearables',
  'Spectacles & Sunglasses',
  'Outerwear & University Hoodies',
];

// Pre-computed seed password hash for standard demo password: "Campus#2026!"
const defaultPass = hashPassword('Campus#2026!');

export const SEED_USERS: UserRecord[] = [
  {
    id: 'usr-student-01',
    name: 'Ahtesham Arian',
    email: 'ahtesham.student@fui.edu.pk',
    role: 'student',
    studentIdMasked: 'FU****42',
    encryptedStudentId: encryptData('FUI-BCS-FA22-042'),
    encryptedPhone: encryptData('+92 301 5489201'),
    passwordHash: defaultPass.hash,
    passwordSalt: defaultPass.salt,
    passwordIterations: defaultPass.iterations,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'usr-finder-02',
    name: 'Fatima Zahra',
    email: 'fatima.zahra@fui.edu.pk',
    role: 'student',
    studentIdMasked: 'FU****18',
    encryptedStudentId: encryptData('FUI-BSE-SP23-018'),
    encryptedPhone: encryptData('+92 333 4920182'),
    passwordHash: defaultPass.hash,
    passwordSalt: defaultPass.salt,
    passwordIterations: defaultPass.iterations,
    createdAt: '2026-09-15T09:30:00Z',
  },
  {
    id: 'usr-desk-03',
    name: 'Dr. Muhammad Bilal',
    email: 'm.bilal@fui.edu.pk',
    role: 'desk_officer',
    studentIdMasked: 'FA****02',
    encryptedStudentId: encryptData('FUI-FAC-0402'),
    encryptedPhone: encryptData('+92 51 5151437'),
    passwordHash: defaultPass.hash,
    passwordSalt: defaultPass.salt,
    passwordIterations: defaultPass.iterations,
    avatarUrl: '/images/avatar_proctor_officer_1791825924417.jpg',
    createdAt: '2026-08-10T11:00:00Z',
  },
  {
    id: 'usr-admin-04',
    name: 'Engr. Usman Khalid',
    email: 'dsa@fui.edu.pk',
    role: 'admin',
    studentIdMasked: 'AD****01',
    encryptedStudentId: encryptData('FUI-ADM-001'),
    encryptedPhone: encryptData('+92 51 5151438'),
    passwordHash: defaultPass.hash,
    passwordSalt: defaultPass.salt,
    passwordIterations: defaultPass.iterations,
    createdAt: '2026-08-01T08:00:00Z',
  },
];

export const SEED_REPORTS: ReportRecord[] = [
  {
    id: 'REP-FUI-1049',
    userId: 'usr-student-01',
    reporterName: 'Ahtesham Arian',
    type: 'LOST',
    title: 'Foundation University RFID Smart Student Card with Blue Lanyard',
    category: 'Student Smart ID & RFID Cards',
    campusLocation: 'Foundation University Islamabad, Iqbal Central Library 2nd Floor',
    eventDate: '2026-10-10',
    status: 'MATCH_SUGGESTED',
    publicDescription: 'Foundation University student RFID identity card with official blue fabric lanyard. Left on the study cubicle desk in the reference section.',
    hasPrivateClues: true,
    encryptedPrivateClues: encryptData('Card has Department of Computer Science sticker and registration roll number ending in 042.'),
    photoUrl: '/images/item_fui_smart_card_1791825901033.jpg',
    matchScore: 94,
    matchFactors: {
      categoryCompat: 1.0,
      descriptionSim: 0.92,
      locationProx: 0.95,
      timeProx: 0.92,
      keywordOverlap: 0.88,
      summary: 'High match: identical university ID category, same central library reading hall, 3-hour timestamp proximity.',
    },
    createdAt: '2026-10-10T15:30:00Z',
  },
  {
    id: 'REP-FUI-1050',
    userId: 'usr-finder-02',
    reporterName: 'Fatima Zahra',
    type: 'FOUND',
    title: 'University Student Smart Card Found on Study Table',
    category: 'Student Smart ID & RFID Cards',
    campusLocation: 'Foundation University Islamabad, Central Library Help Desk Area',
    eventDate: '2026-10-10',
    status: 'OPEN',
    publicDescription: 'Turned in official FUI Student Card with dark blue university neck lanyard. Handed over to library circulation in-charge.',
    hasPrivateClues: true,
    encryptedPrivateClues: encryptData('Roll number starts with FUI-BCS; holder name initial is A.'),
    photoUrl: '/images/item_fui_smart_card_1791825901033.jpg',
    matchScore: 94,
    matchFactors: {
      categoryCompat: 1.0,
      descriptionSim: 0.92,
      locationProx: 0.95,
      timeProx: 0.92,
      keywordOverlap: 0.88,
      summary: 'Matches LOST report REP-FUI-1049 with 94% algorithm confidence.',
    },
    createdAt: '2026-10-10T16:15:00Z',
  },
  {
    id: 'REP-FUI-1033',
    userId: 'usr-finder-02',
    reporterName: 'Fatima Zahra',
    type: 'FOUND',
    title: 'Casio fx-991ES PLUS Scientific Calculator with Engineering Notes',
    category: 'Calculators & Engineering Tools',
    campusLocation: 'FUSST Computing Lab 3, Department of Computer Science',
    eventDate: '2026-10-11',
    status: 'OPEN',
    publicDescription: 'Dark grey Casio natural display scientific calculator fx-991ES PLUS with slide-on protective hard cover. Found beside spiral engineering notes.',
    hasPrivateClues: true,
    encryptedPrivateClues: encryptData('Back of calculator has small Urdu initials etched with needle and battery door secured with white tape.'),
    photoUrl: '/images/item_casio_calculator_1791825912580.jpg',
    matchScore: 82,
    matchFactors: {
      categoryCompat: 1.0,
      descriptionSim: 0.8,
      locationProx: 0.85,
      timeProx: 0.88,
      keywordOverlap: 0.72,
      summary: 'Engineering tools category compatibility, FUSST Lab 3 proximity, recent date overlap.',
    },
    createdAt: '2026-10-11T12:40:00Z',
  },
  {
    id: 'REP-FUI-1025',
    userId: 'usr-student-01',
    reporterName: 'Ahtesham Arian',
    type: 'LOST',
    title: 'Apple MacBook Pro 14" in Charcoal Wool Sleeve',
    category: 'Laptops & Chargers',
    campusLocation: 'Foundation University Islamabad, Central Lawn / Cafeteria Benches',
    eventDate: '2026-10-10',
    status: 'OPEN',
    publicDescription: 'Silver 14-inch MacBook Pro inside a dark charcoal wool-felt protective sleeve. Left near campus cafeteria lawn benches after afternoon lecture.',
    hasPrivateClues: true,
    encryptedPrivateClues: encryptData('Device lock screen displays custom sticker "A. Arian / CompSci FUI" and serial ending in 8X39.'),
    photoUrl: '/images/item_macbook_pro_1791824624893.jpg',
    matchScore: 68,
    matchFactors: {
      categoryCompat: 1.0,
      descriptionSim: 0.65,
      locationProx: 0.7,
      timeProx: 0.8,
      keywordOverlap: 0.55,
      summary: 'High value computing asset in DHA campus vicinity.',
    },
    createdAt: '2026-10-10T17:00:00Z',
  },
  {
    id: 'REP-FUI-1018',
    userId: 'usr-finder-02',
    reporterName: 'Fatima Zahra',
    type: 'LOST',
    title: 'Navy University Student Backpack with Semester Files',
    category: 'Backpacks & Course Files',
    campusLocation: 'Foundation University Rawalpindi Campus (FURC), Block A Lawn',
    eventDate: '2026-10-09',
    status: 'VERIFIED_RETURNED',
    publicDescription: 'Navy blue canvas student backpack with tan leather base patch. Contained Software Engineering semester files and university water bottle.',
    hasPrivateClues: true,
    encryptedPrivateClues: encryptData('Front zip pocket has student ID card for F. Zahra and university library borrower booklet.'),
    photoUrl: '/images/item_student_backpack_1791824649724.jpg',
    pickupTokenHash: '8e20f92a1884b2e8',
    verifiedPickupCode: 'RCPT-FUI-2026-0819',
    createdAt: '2026-10-09T11:00:00Z',
  },
];
