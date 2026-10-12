'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  evaluatePasswordStrength,
  validateRegisterInput,
  RegisterInput,
} from '@/lib/validation';
import { useAuth } from '@/lib/authContext';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
  User,
  Mail,
  Phone,
  CreditCard,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState<RegisterInput>({
    name: '',
    email: '',
    role: 'student',
    studentId: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    encryptConsent: true,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<any | null>(null);
  const [showCryptoInspector, setShowCryptoInspector] = useState(false);

  // Live password strength
  const passStrength = evaluatePasswordStrength(formData.password);

  // Live validation
  const validation = validateRegisterInput(formData);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const value =
      target.type === 'checkbox'
        ? (target as HTMLInputElement).checked
        : target.value;
    const name = target.name;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched: Record<string, boolean> = {
      name: true,
      email: true,
      role: true,
      studentId: true,
      phone: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    };
    setTouched(allTouched);

    if (!validation.isValid) {
      setServerError('Please fix highlighted form errors before proceeding.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(
          data.message || 'Registration failed. Please check your information.'
        );
        setIsSubmitting(false);
        return;
      }

      // Update auth context
      login(data.user, data.sessionToken);
      setRegisteredSuccess(data);
    } catch (err: any) {
      setServerError(
        'Network error connecting to the server. Please check your connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Foundation University &middot; Campus Identity Portal
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Create Your FUI Student / Staff Account
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Report lost belongings, claim discovered items, and authorize verified desk pickups across Foundation University Islamabad and Rawalpindi campuses.
            </p>
          </div>

          {registeredSuccess ? (
            /* Success confirmation card */
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Registration Successful!
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Welcome to FindIt Campus,{' '}
                <strong className="text-slate-900">{registeredSuccess.user.name}</strong>. Your campus email{' '}
                <span className="font-mono text-xs">{registeredSuccess.user.email}</span> has been securely registered.
              </p>

              {/* Security confirmation badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left text-xs mb-6 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cryptographic Protection Confirmed</span>
                </div>
                <div className="text-slate-600 space-y-1 font-mono text-[11px]">
                  <p>&bull; Password Hashing: PBKDF2-HMAC-SHA512 (100,000 rounds, 32-byte salt)</p>
                  <p>&bull; Sensitive PII Storage: AES-256-GCM with 96-bit randomized IV</p>
                  <p>&bull; Public ID Mask: {registeredSuccess.user.studentIdMasked}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Go to Campus Home
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/#inventory"
                  className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Browse Lost & Found
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
              {serverError && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="reg-name"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Full Name (As per University Card / CNIC) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Ahtesham Arian"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('name')}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        touched.name && validation.errors.name
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                      }`}
                    />
                    <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {touched.name && validation.errors.name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.name}
                    </p>
                  )}
                </div>

                {/* Campus Email */}
                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Campus / University Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="e.g. ahtesham.student@fui.edu.pk or personal email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        touched.email && validation.errors.email
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                      }`}
                    />
                    <Mail className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {touched.email && validation.errors.email ? (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.email}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Supports @fui.edu.pk, @student.fui.edu.pk, and standard student emails.
                    </p>
                  )}
                </div>

                {/* Campus Role & ID Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="reg-role"
                      className="block text-xs font-semibold text-slate-800 mb-1"
                    >
                      Campus Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="reg-role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      onBlur={() => handleBlur('role')}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    >
                      <option value="student">Foundation University Student</option>
                      <option value="staff">FUI Faculty / University Staff</option>
                      <option value="desk_officer">Proctorial Board / Desk Officer</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-studentid"
                      className="block text-xs font-semibold text-slate-800 mb-1"
                    >
                      FUI Roll No / Reg ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-studentid"
                        name="studentId"
                        type="text"
                        placeholder="e.g. FUI-BCS-FA22-042"
                        value={formData.studentId}
                        onChange={handleChange}
                        onBlur={() => handleBlur('studentId')}
                        className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                          touched.studentId && validation.errors.studentId
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                        }`}
                      />
                      <CreditCard className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {touched.studentId && validation.errors.studentId && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validation.errors.studentId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="reg-phone"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Pakistani Contact Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="e.g. +92 300 1234567 or 0300-1234567"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur('phone')}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        touched.phone && validation.errors.phone
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                      }`}
                    />
                    <Phone className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {touched.phone && validation.errors.phone && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.phone}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-500">
                    Used strictly for emergency pickup SMS/calls. Phone details are stored encrypted with AES-256-GCM.
                  </p>
                </div>

                {/* Password with live meter */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="reg-password"
                      className="text-xs font-semibold text-slate-800"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Strength:{' '}
                      <strong
                        className={`font-semibold ${
                          passStrength.score >= 3
                            ? 'text-emerald-600'
                            : passStrength.score === 2
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {passStrength.label}
                      </strong>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Enter secure password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password')}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        touched.password && validation.errors.password
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Progress Bar */}
                  <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passStrength.score >= 1
                          ? passStrength.score >= 3
                            ? 'bg-emerald-500 w-1/4'
                            : 'bg-amber-500 w-1/4'
                          : 'bg-slate-200 w-1/4'
                      }`}
                    />
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passStrength.score >= 2
                          ? passStrength.score >= 3
                            ? 'bg-emerald-500 w-1/4'
                            : 'bg-amber-500 w-1/4'
                          : 'bg-slate-200 w-1/4'
                      }`}
                    />
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passStrength.score >= 3 ? 'bg-emerald-500 w-1/4' : 'bg-slate-200 w-1/4'
                      }`}
                    />
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        passStrength.score === 4 ? 'bg-emerald-600 w-1/4' : 'bg-slate-200 w-1/4'
                      }`}
                    />
                  </div>

                  {/* Criteria Checklist */}
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      {passStrength.hasMinLength ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>8+ characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passStrength.hasUppercase && passStrength.hasLowercase ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>Upper & lowercase</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passStrength.hasNumber ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>At least one number</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passStrength.hasSpecial ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>Special symbol (!@#$)</span>
                    </div>
                  </div>

                  {touched.password && validation.errors.password && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="reg-confirmpass"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirmpass"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        touched.confirmPassword && validation.errors.confirmPassword
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.confirmPassword && validation.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Encryption & Consent Checkboxes */}
                <div className="pt-2 space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="encryptConsent"
                      checked={formData.encryptConsent}
                      onChange={handleChange}
                      className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-xs text-slate-700 leading-snug">
                      <strong className="text-slate-900">Enable Authenticated PII Encryption:</strong> Apply AES-256-GCM encryption with 96-bit random IV to my Student ID and phone number before storing in system database.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      onBlur={() => handleBlur('termsAccepted')}
                      className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-xs text-slate-700 leading-snug">
                      I agree to the <span className="font-semibold text-slate-900">FindIt Campus Honor Code</span> and understand that fraudulent claims or falsification of ownership evidence are subject to campus disciplinary proceedings.
                    </span>
                  </label>
                  {touched.termsAccepted && validation.errors.termsAccepted && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.termsAccepted}
                    </p>
                  )}
                </div>

                {/* Live Cryptographic Inspector toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCryptoInspector(!showCryptoInspector)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1.5 underline decoration-slate-300"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>{showCryptoInspector ? 'Hide' : 'Inspect'} Real-Time Cryptographic Engine Pipeline</span>
                  </button>

                  {showCryptoInspector && (
                    <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono space-y-2 border border-slate-800">
                      <div className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Security Invariants & Algorithms</span>
                      </div>
                      <p>&bull; KDF Algorithm: PBKDF2-HMAC-SHA512</p>
                      <p>&bull; Salt generation: crypto.randomBytes(32)</p>
                      <p>&bull; KDF Iterations: 100,000 rounds</p>
                      <p>&bull; Symmetric Cipher: AES-256-GCM (12-byte IV + 16-byte Auth Tag)</p>
                      <p>&bull; Password length currently: {formData.password.length} chars</p>
                      <p>&bull; Verification check: timingSafeEqual comparison</p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Hashing Credentials & Encrypting...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Create Account with Secure Encryption</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Login link */}
              <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
                Already registered with FindIt Campus?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign In to Your Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
