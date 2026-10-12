'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { validateLoginInput, LoginInput } from '@/lib/validation';
import { useAuth } from '@/lib/authContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickSwitchAccount } = useAuth();

  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<any | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const validation = validateLoginInput(formData);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    if (!validation.isValid) {
      setServerError('Please provide a valid campus email and password.');
      return;
    }

    if (attemptCount >= 5) {
      setServerError('Too many failed attempts. Rate limit security cooldown in effect for 30 seconds.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAttemptCount((prev) => prev + 1);
        setServerError(data.message || 'Invalid campus credentials.');
        setIsSubmitting(false);
        return;
      }

      login(data.user, data.sessionToken);
      setLoginSuccess(data.user);
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } catch {
      setServerError('Network error connecting to login service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyDemoUser = (
    email: string,
    pass: string,
    role: 'student' | 'finder' | 'desk' | 'admin'
  ) => {
    setFormData({
      email,
      password: pass,
      rememberMe: true,
    });
    setTouched({ email: true, password: true });
    setServerError(null);
    quickSwitchAccount(role);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Foundation University &middot; Student & Staff Gateway
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Sign In to FindIt Campus
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Access your lost/found reports, track claim verifications with the Proctorial Board, and manage pickup receipts.
            </p>
          </div>

          {loginSuccess ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Authentication Verified
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Welcome back, <strong className="text-slate-900">{loginSuccess.name}</strong> ({loginSuccess.role.replace('_', ' ')}).
              </p>
              <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Redirecting to Foundation University inventory...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
              {/* Demo Account Quick Pick bar */}
              <div className="mb-6 p-3 bg-slate-100/80 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    FUI One-Click Test Accounts:
                  </span>
                  <span className="text-[10px] text-slate-500">Pass: Campus#2026!</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      applyDemoUser('ahtesham.student@fui.edu.pk', 'Campus#2026!', 'student')
                    }
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded hover:border-slate-400 text-left truncate transition-colors text-slate-800"
                  >
                    Ahtesham (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyDemoUser('fatima.zahra@fui.edu.pk', 'Campus#2026!', 'finder')
                    }
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded hover:border-slate-400 text-left truncate transition-colors text-slate-800"
                  >
                    Fatima (Finder)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyDemoUser('m.bilal@fui.edu.pk', 'Campus#2026!', 'desk')
                    }
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded hover:border-slate-400 text-left truncate transition-colors text-slate-800"
                  >
                    Dr. Bilal (Proctor)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyDemoUser('dsa@fui.edu.pk', 'Campus#2026!', 'admin')
                    }
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded hover:border-slate-400 text-left truncate transition-colors text-slate-800"
                  >
                    Engr. Usman (DSA Admin)
                  </button>
                </div>
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Campus Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="e.g. student@campus.edu"
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
                  {touched.email && validation.errors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="login-password"
                      className="text-xs font-semibold text-slate-800"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Standard demo: Campus#2026!
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter account password"
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
                  {touched.password && validation.errors.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validation.errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Protection info */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-xs text-slate-600">Remember on this device</span>
                  </label>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Rate-limited</span>
                  </span>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Sign In Securely</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Register link */}
              <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
                Don&apos;t have a campus account yet?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Register (Sign Up)
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
