import { SEED_USERS, SEED_REPORTS, UserRecord, ReportRecord, CAMPUS_DESKS } from './seedData';
import { hashPassword, encryptData, generateSecureToken } from './crypto';

export interface ContactTicketRecord {
  id: string;
  fullName: string;
  email: string;
  topic: string;
  relatedId?: string;
  preferredDesk: string;
  subject: string;
  message: string;
  status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface ClaimRecord {
  id: string;
  reportId: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  encryptedEvidence: { ciphertext: string; iv: string; authTag: string; version: string };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HANDOVER_COMPLETE';
  reviewedBy?: string;
  reviewReason?: string;
  pickupToken?: string;
  pickupTokenExpiresAt?: string;
  createdAt: string;
}

// In-memory singletons for demo runtime
class FindItCampusStore {
  private users: UserRecord[] = [...SEED_USERS];
  private reports: ReportRecord[] = [...SEED_REPORTS];
  private tickets: ContactTicketRecord[] = [
    {
      id: 'TKT-2026-0812',
      fullName: 'Jordan Miller',
      email: 'jordan.m@campus.edu',
      topic: 'lost_item_inquiry',
      relatedId: 'REP-2026-1049',
      preferredDesk: 'William Allen Memorial Library',
      subject: 'Inquiring regarding MacBook Pro pickup window',
      message: 'Hello, I submitted my ownership verification for the MacBook Pro. Can I come by before 6pm today?',
      status: 'IN_PROGRESS',
      createdAt: '2026-10-11T14:20:00Z',
    },
  ];
  private claims: ClaimRecord[] = [];

  // Users
  findUserByEmail(email: string): UserRecord | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): UserRecord | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(params: {
    name: string;
    email: string;
    role: 'student' | 'staff' | 'desk_officer';
    studentId: string;
    phone: string;
    passwordPlain: string;
  }): UserRecord {
    const passHash = hashPassword(params.passwordPlain);
    const maskedId =
      params.studentId.length > 4
        ? `${params.studentId.slice(0, 2)}****${params.studentId.slice(-2)}`
        : '****';

    const newUser: UserRecord = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: params.name,
      email: params.email.toLowerCase(),
      role: params.role,
      studentIdMasked: maskedId,
      encryptedStudentId: encryptData(params.studentId),
      encryptedPhone: encryptData(params.phone),
      passwordHash: passHash.hash,
      passwordSalt: passHash.salt,
      passwordIterations: passHash.iterations,
      createdAt: new Date().toISOString(),
    };

    this.users.unshift(newUser);
    return newUser;
  }

  // Reports
  getAllReports(): ReportRecord[] {
    return [...this.reports];
  }

  getReportById(id: string): ReportRecord | undefined {
    return this.reports.find((r) => r.id === id);
  }

  createReport(params: {
    userId: string;
    reporterName: string;
    type: 'LOST' | 'FOUND';
    title: string;
    category: string;
    campusLocation: string;
    eventDate: string;
    publicDescription: string;
    privateClues?: string;
    photoUrl?: string;
  }): ReportRecord {
    const reportId = `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const hasPrivateClues = Boolean(params.privateClues && params.privateClues.trim().length > 0);
    const encryptedPrivateClues = hasPrivateClues
      ? encryptData(params.privateClues!.trim())
      : undefined;

    // Default image if none provided
    let fallbackPhoto = '/images/item_macbook_pro_1791824624893.jpg';
    if (params.category.toLowerCase().includes('audio')) {
      fallbackPhoto = '/images/item_airpods_case_1791824636482.jpg';
    } else if (params.category.toLowerCase().includes('bag') || params.category.toLowerCase().includes('backpack')) {
      fallbackPhoto = '/images/item_student_backpack_1791824649724.jpg';
    }

    const newReport: ReportRecord = {
      id: reportId,
      userId: params.userId,
      reporterName: params.reporterName,
      type: params.type,
      title: params.title,
      category: params.category,
      campusLocation: params.campusLocation,
      eventDate: params.eventDate,
      status: 'OPEN',
      publicDescription: params.publicDescription,
      hasPrivateClues,
      encryptedPrivateClues,
      photoUrl: params.photoUrl || fallbackPhoto,
      createdAt: new Date().toISOString(),
    };

    // Calculate match score with existing opposite items
    const oppositeType = params.type === 'LOST' ? 'FOUND' : 'LOST';
    const candidate = this.reports.find(
      (r) => r.type === oppositeType && (r.category === params.category || r.status === 'OPEN')
    );

    if (candidate) {
      const matchCalc = this.calculateMatch(newReport, candidate);
      newReport.matchScore = matchCalc.score;
      newReport.matchFactors = matchCalc.factors;
      if (matchCalc.score >= 70) {
        newReport.status = 'MATCH_SUGGESTED';
      }
    }

    this.reports.unshift(newReport);
    return newReport;
  }

  /**
   * CCP Core Matching Engine: PRD Section 7.3
   * M = 100 * (0.30C + 0.25D + 0.20L + 0.15T + 0.10K)
   */
  calculateMatch(reportA: ReportRecord, reportB: ReportRecord) {
    // C - Category compatibility (0.30)
    const categoryCompat = reportA.category === reportB.category ? 1.0 : 0.2;

    // D - Description token overlap (0.25)
    const wordsA = new Set(reportA.publicDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    const wordsB = new Set(reportB.publicDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    let intersectCount = 0;
    wordsA.forEach((w) => {
      if (wordsB.has(w)) intersectCount++;
    });
    const totalWords = Math.max(1, wordsA.size + wordsB.size - intersectCount);
    const descriptionSim = Math.min(1.0, (intersectCount / totalWords) * 2.5);

    // L - Location proximity (0.20)
    const locA = reportA.campusLocation.toLowerCase();
    const locB = reportB.campusLocation.toLowerCase();
    let locationProx = 0.3;
    if (locA === locB) {
      locationProx = 1.0;
    } else if (
      (locA.includes('library') && locB.includes('library')) ||
      (locA.includes('commons') && locB.includes('commons')) ||
      (locA.includes('science') && locB.includes('science'))
    ) {
      locationProx = 0.85;
    }

    // T - Time proximity (0.15)
    const timeA = new Date(reportA.eventDate).getTime();
    const timeB = new Date(reportB.eventDate).getTime();
    const diffDays = Math.abs(timeA - timeB) / (1000 * 60 * 60 * 24);
    const timeProx = Math.max(0, 1 - diffDays / 14); // decayed over 14 days

    // K - Keyword overlap in title (0.10)
    const titleA = new Set(reportA.title.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    const titleB = new Set(reportB.title.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
    let titleOverlap = 0;
    titleA.forEach((w) => {
      if (titleB.has(w)) titleOverlap++;
    });
    const keywordOverlap = Math.min(1.0, titleOverlap / Math.max(1, titleA.size));

    // Weighted formula:
    const scoreVal =
      100 *
      (0.3 * categoryCompat +
        0.25 * descriptionSim +
        0.2 * locationProx +
        0.15 * timeProx +
        0.1 * keywordOverlap);
    const finalScore = Math.min(99, Math.max(15, Math.round(scoreVal)));

    return {
      score: finalScore,
      factors: {
        categoryCompat: Math.round(categoryCompat * 100) / 100,
        descriptionSim: Math.round(descriptionSim * 100) / 100,
        locationProx: Math.round(locationProx * 100) / 100,
        timeProx: Math.round(timeProx * 100) / 100,
        keywordOverlap: Math.round(keywordOverlap * 100) / 100,
        summary: `Algorithm Score ${finalScore}%: C=${Math.round(categoryCompat * 100)}%, D=${Math.round(
          descriptionSim * 100
        )}%, L=${Math.round(locationProx * 100)}%, T=${Math.round(timeProx * 100)}%, K=${Math.round(
          keywordOverlap * 100
        )}%`,
      },
    };
  }

  // Claims
  submitClaim(params: {
    reportId: string;
    claimantId: string;
    claimantName: string;
    claimantEmail: string;
    privateEvidence: string;
  }): ClaimRecord {
    const claim: ClaimRecord = {
      id: `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      reportId: params.reportId,
      claimantId: params.claimantId,
      claimantName: params.claimantName,
      claimantEmail: params.claimantEmail,
      encryptedEvidence: encryptData(params.privateEvidence),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.claims.unshift(claim);

    // Update report status
    const rep = this.getReportById(params.reportId);
    if (rep) {
      rep.status = 'CLAIM_PENDING';
    }
    return claim;
  }

  getClaimsForReport(reportId: string): ClaimRecord[] {
    return this.claims.filter((c) => c.reportId === reportId);
  }

  // Contact Tickets
  createContactTicket(params: {
    fullName: string;
    email: string;
    topic: string;
    relatedId?: string;
    preferredDesk: string;
    subject: string;
    message: string;
  }): ContactTicketRecord {
    const ticketId = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket: ContactTicketRecord = {
      id: ticketId,
      fullName: params.fullName,
      email: params.email,
      topic: params.topic,
      relatedId: params.relatedId,
      preferredDesk: params.preferredDesk,
      subject: params.subject,
      message: params.message,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
    };
    this.tickets.unshift(ticket);
    return ticket;
  }

  getTickets(): ContactTicketRecord[] {
    return [...this.tickets];
  }
}

// Global singleton across hot-reloads / serverless invocations
const globalForStore = globalThis as unknown as { findItCampusStore?: FindItCampusStore };
export const campusStore = globalForStore.findItCampusStore || new FindItCampusStore();
if (process.env.NODE_ENV !== 'production') {
  globalForStore.findItCampusStore = campusStore;
}
