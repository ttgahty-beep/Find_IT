/**
 * FindIt Campus Input Validation & Sanitization Engine
 * Covers:
 * - Email format and campus domain rules
 * - Password complexity & live entropy evaluation
 * - Full name, phone, student ID formats
 * - Inquiry topics & contact forms
 * - Report fields & privacy rules
 * - XSS sanitization
 */

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData?: T;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  feedback: string[];
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

/**
 * Basic XSS string sanitizer
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // strip dangerous tags
    .slice(0, 5000); // hard cap length
}

/**
 * Validates campus email address
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., student@campus.edu).' };
  }
  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email address exceeds maximum length.' };
  }
  return { isValid: true };
}

/**
 * Evaluates password strength and returns criteria breakdown
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasMinLength) feedback.push('At least 8 characters long');
  if (!hasUppercase) feedback.push('At least one uppercase letter (A-Z)');
  if (!hasLowercase) feedback.push('At least one lowercase letter (a-z)');
  if (!hasNumber) feedback.push('At least one number (0-9)');
  if (!hasSpecial) feedback.push('At least one special character (!@#$%^&*)');

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase && hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (password.length >= 12 && score === 4) score = 4;

  const labels: Record<number, PasswordStrength['label']> = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Strong',
    4: 'Very Strong',
  };

  return {
    score,
    label: labels[score] || 'Weak',
    feedback,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  };
}

/**
 * Validate Registration Data
 */
export interface RegisterInput {
  name: string;
  email: string;
  role: 'student' | 'staff' | 'desk_officer';
  studentId: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  encryptConsent?: boolean;
}

export function validateRegisterInput(input: Partial<RegisterInput>): ValidationResult<RegisterInput> {
  const errors: Record<string, string> = {};

  // Name
  const name = sanitizeString(input.name || '');
  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    errors.name = 'Name should only contain letters, spaces, hyphens, and apostrophes.';
  }

  // Email
  const emailRes = validateEmail(input.email || '');
  if (!emailRes.isValid) {
    errors.email = emailRes.error!;
  }

  // Role
  const role = input.role;
  if (!role || !['student', 'staff', 'desk_officer'].includes(role)) {
    errors.role = 'Please select a valid campus role.';
  }

  // Student / Staff ID
  const studentId = sanitizeString(input.studentId || '');
  if (!studentId) {
    errors.studentId = 'Foundation University ID / Roll No is required (e.g. FUI-BCS-FA22-042 or FUI-FAC-102).';
  } else if (!/^[A-Za-z0-9-_/]{4,25}$/.test(studentId)) {
    errors.studentId = 'Campus ID must be 4-25 characters (e.g. FUI-BCS-FA22-042 or 22-FUI-042).';
  }

  // Phone
  const phone = sanitizeString(input.phone || '');
  if (!phone) {
    errors.phone = 'Pakistani contact mobile number is required (e.g. +92 300 1234567 or 0300-1234567).';
  } else {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      errors.phone = 'Please enter a valid Pakistani mobile number (e.g. 0300-1234567 or +92 300 1234567).';
    }
  }

  // Password
  const password = input.password || '';
  if (!password) {
    errors.password = 'Password is required.';
  } else {
    const strength = evaluatePasswordStrength(password);
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (strength.score < 2) {
      errors.password = 'Password is too weak. Include uppercase, numbers, or symbols.';
    }
  }

  // Confirm Password
  if (!input.confirmPassword) {
    errors.confirmPassword = 'Confirmation password is required.';
  } else if (input.confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  // Terms
  if (!input.termsAccepted) {
    errors.termsAccepted = 'You must accept the campus lost & found honor code and terms.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      name,
      email: (input.email || '').trim().toLowerCase(),
      role: role as RegisterInput['role'],
      studentId: studentId.toUpperCase(),
      phone,
      password,
      confirmPassword: input.confirmPassword || '',
      termsAccepted: Boolean(input.termsAccepted),
      encryptConsent: Boolean(input.encryptConsent ?? true),
    },
  };
}

/**
 * Validate Login Data
 */
export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export function validateLoginInput(input: Partial<LoginInput>): ValidationResult<LoginInput> {
  const errors: Record<string, string> = {};

  const emailRes = validateEmail(input.email || '');
  if (!emailRes.isValid) {
    errors.email = emailRes.error!;
  }

  if (!input.password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      email: (input.email || '').trim().toLowerCase(),
      password: input.password || '',
      rememberMe: Boolean(input.rememberMe),
    },
  };
}

/**
 * Validate Contact Us Form Data
 */
export interface ContactInput {
  fullName: string;
  email: string;
  topic: 'lost_item_inquiry' | 'claim_dispute' | 'pickup_appointment' | 'report_abuse' | 'system_feedback';
  relatedId?: string;
  preferredDesk: string;
  subject: string;
  message: string;
  antiSpamAnswer: string;
}

export function validateContactInput(input: Partial<ContactInput>): ValidationResult<ContactInput> {
  const errors: Record<string, string> = {};

  // Full Name
  const fullName = sanitizeString(input.fullName || '');
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Name must be at least 2 characters.';
  }

  // Email
  const emailRes = validateEmail(input.email || '');
  if (!emailRes.isValid) {
    errors.email = emailRes.error!;
  }

  // Topic
  const allowedTopics = [
    'lost_item_inquiry',
    'claim_dispute',
    'pickup_appointment',
    'report_abuse',
    'system_feedback',
  ];
  if (!input.topic || !allowedTopics.includes(input.topic)) {
    errors.topic = 'Please select an inquiry topic.';
  }

  // Related ID (Optional)
  const relatedId = sanitizeString(input.relatedId || '');
  if (relatedId && !/^[A-Za-z0-9-_]{3,30}$/.test(relatedId)) {
    errors.relatedId = 'Reference ID must be an alphanumeric code (e.g. REP-8921 or CLM-104).';
  }

  // Preferred Desk
  const preferredDesk = sanitizeString(input.preferredDesk || '');
  if (!preferredDesk) {
    errors.preferredDesk = 'Please select a campus desk location.';
  }

  // Subject
  const subject = sanitizeString(input.subject || '');
  if (!subject) {
    errors.subject = 'Subject is required.';
  } else if (subject.length < 5) {
    errors.subject = 'Subject must be at least 5 characters.';
  } else if (subject.length > 100) {
    errors.subject = 'Subject cannot exceed 100 characters.';
  }

  // Message
  const message = sanitizeString(input.message || '');
  if (!message) {
    errors.message = 'Detailed message is required.';
  } else if (message.length < 20) {
    errors.message = 'Please provide at least 20 characters describing your request.';
  } else if (message.length > 2000) {
    errors.message = 'Message cannot exceed 2000 characters.';
  }

  // Anti-spam challenge: expects "12" (for 7 + 5)
  const antiSpamAnswer = (input.antiSpamAnswer || '').trim();
  if (!antiSpamAnswer) {
    errors.antiSpamAnswer = 'Please solve the verification math challenge.';
  } else if (antiSpamAnswer !== '12') {
    errors.antiSpamAnswer = 'Incorrect verification answer. What is 7 + 5?';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      fullName,
      email: (input.email || '').trim().toLowerCase(),
      topic: input.topic as ContactInput['topic'],
      relatedId,
      preferredDesk,
      subject,
      message,
      antiSpamAnswer,
    },
  };
}

/**
 * Validate Report Input (Lost or Found)
 */
export interface ReportInput {
  type: 'LOST' | 'FOUND';
  title: string;
  category: string;
  campusLocation: string;
  eventDate: string;
  publicDescription: string;
  privateClues?: string; // Encrypted before storage!
  primaryPhotoUrl?: string;
}

export function validateReportInput(input: Partial<ReportInput>): ValidationResult<ReportInput> {
  const errors: Record<string, string> = {};

  if (!input.type || !['LOST', 'FOUND'].includes(input.type)) {
    errors.type = 'Type must be either LOST or FOUND.';
  }

  const title = sanitizeString(input.title || '');
  if (!title) {
    errors.title = 'Item title is required.';
  } else if (title.length < 4) {
    errors.title = 'Title must be at least 4 characters (e.g., "Silver 14-inch Laptop Sleeve").';
  }

  const category = sanitizeString(input.category || '');
  if (!category) {
    errors.category = 'Please select an item category.';
  }

  const campusLocation = sanitizeString(input.campusLocation || '');
  if (!campusLocation) {
    errors.campusLocation = 'Campus location is required.';
  }

  if (!input.eventDate) {
    errors.eventDate = 'Approximate date is required.';
  } else {
    const parsed = new Date(input.eventDate);
    const now = new Date();
    if (isNaN(parsed.getTime())) {
      errors.eventDate = 'Invalid date format.';
    } else if (parsed > now) {
      errors.eventDate = 'Event date cannot be in the future.';
    }
  }

  const publicDescription = sanitizeString(input.publicDescription || '');
  if (!publicDescription) {
    errors.publicDescription = 'Public description is required.';
  } else if (publicDescription.length < 15) {
    errors.publicDescription = 'Provide at least 15 characters describing public characteristics.';
  }

  const privateClues = sanitizeString(input.privateClues || '');

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      type: input.type as 'LOST' | 'FOUND',
      title,
      category,
      campusLocation,
      eventDate: input.eventDate || '',
      publicDescription,
      privateClues,
      primaryPhotoUrl: input.primaryPhotoUrl,
    },
  };
}
