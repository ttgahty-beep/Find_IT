'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { validateContactInput, ContactInput } from '@/lib/validation';
import { CAMPUS_DESKS } from '@/lib/seedData';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Send,
  HelpCircle,
  ChevronDown,
  Building2,
  FileQuestion,
  Calendar,
} from 'lucide-react';

const FAQS = [
  {
    q: 'How long does Foundation University retain found items before disposal?',
    a: 'Per FUI Proctorial Board and HEC policy, student smart cards, CNICs, laptops, and calculators are retained in secure storage for 90 days. Course files and apparel are retained for 45 days. Unclaimed items after this period are donated or recycled under Student Affairs supervision.',
  },
  {
    q: 'How do I claim a lost Foundation University Student Smart Card?',
    a: 'Visit the Iqbal Central Library Information Desk or Student Affairs Directorate (Jinnah Block). You must state your full name, department (e.g. CS, SE, BBA), and roll number matching our encrypted record. Verification takes less than 2 minutes.',
  },
  {
    q: 'Can a classmate pick up my laptop or calculator from the desk?',
    a: 'Yes, provided you generate and share your single-use QR pickup token from the FindIt Campus portal. Your friend must also show their valid FUI student smart card, which will be logged on the digital recovery receipt.',
  },
  {
    q: 'Where are the desks located across Islamabad and Rawalpindi campuses?',
    a: 'In Islamabad (DHA Phase 1): Iqbal Central Library Ground Floor, Jinnah Academic Block (Room G-04), and FUSST Lab Wing. In Rawalpindi (New Lalazar): Academic Block A Reception & Proctorial Desk.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactInput>({
    fullName: '',
    email: '',
    topic: 'lost_item_inquiry',
    relatedId: '',
    preferredDesk: 'Central Library Information Desk (FUI Main)',
    subject: '',
    message: '',
    antiSpamAnswer: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<any | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const validation = validateContactInput(formData);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      email: true,
      topic: true,
      relatedId: true,
      preferredDesk: true,
      subject: true,
      message: true,
      antiSpamAnswer: true,
    });

    if (!validation.isValid) {
      setServerError('Please correct highlighted validation errors in the form.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.message || 'Failed to submit inquiry.');
        setIsSubmitting(false);
        return;
      }

      setTicketResult(data.ticket);
    } catch {
      setServerError('Network error submitting contact request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Foundation University Islamabad &middot; Campus Support & Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-1">
            Contact FUI Property Desks & Proctorial Board
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Have questions regarding a lost student smart card, calculator, or laptop? Contact the Proctorial Office (Jinnah Block) or Central Library Desk across Islamabad and Rawalpindi campuses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Form Column (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Mail className="w-5 h-5 text-slate-700" />
                <span>Submit an Official Campus Inquiry</span>
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                All requests receive a tracking ticket code and typical response within 4 hours during business days.
              </p>

              {ticketResult ? (
                /* Success Ticket Screen */
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                      Ticket Generated
                    </span>
                    <h3 className="text-xl font-mono font-bold text-slate-900 mt-1">
                      {ticketResult.id}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Your inquiry has been logged into the property desk queue for{' '}
                    <strong className="text-slate-900">{ticketResult.deskAssigned}</strong>.
                    Estimated response time: <span className="font-semibold text-slate-800">{ticketResult.estimatedResponse}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketResult(null);
                      setFormData({
                        fullName: '',
                        email: '',
                        topic: 'lost_item_inquiry',
                        relatedId: '',
                        preferredDesk: 'William Allen Memorial Library (Main Desk)',
                        subject: '',
                        message: '',
                        antiSpamAnswer: '',
                      });
                      setTouched({});
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                /* Input Form */
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {serverError && (
                    <div
                      role="alert"
                      className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-semibold text-slate-800 mb-1"
                      >
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="fullName"
                        type="text"
                        placeholder="e.g. Maya Chen"
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('fullName')}
                        className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                          touched.fullName && validation.errors.fullName
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                        }`}
                      />
                      {touched.fullName && validation.errors.fullName && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validation.errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-semibold text-slate-800 mb-1"
                      >
                        Campus Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="e.g. m.chen@campus.edu"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                          touched.email && validation.errors.email
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                        }`}
                      />
                      {touched.email && validation.errors.email && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validation.errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Topic & Related ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-topic"
                        className="block text-xs font-semibold text-slate-800 mb-1"
                      >
                        Inquiry Topic <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="contact-topic"
                        name="topic"
                        value={formData.topic}
                        onChange={handleChange}
                        onBlur={() => handleBlur('topic')}
                        className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                      >
                        <option value="lost_item_inquiry">Lost Item Search Inquiry</option>
                        <option value="claim_dispute">Claim Status or Dispute</option>
                        <option value="pickup_appointment">Special Pickup Appointment</option>
                        <option value="report_abuse">Report Suspicious Post / Abuse</option>
                        <option value="system_feedback">General System Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-relatedid"
                        className="block text-xs font-semibold text-slate-800 mb-1"
                      >
                        Report or Claim ID (Optional)
                      </label>
                      <input
                        id="contact-relatedid"
                        name="relatedId"
                        type="text"
                        placeholder="e.g. REP-2026-1049"
                        value={formData.relatedId}
                        onChange={handleChange}
                        onBlur={() => handleBlur('relatedId')}
                        className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                          touched.relatedId && validation.errors.relatedId
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                        }`}
                      />
                      {touched.relatedId && validation.errors.relatedId && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validation.errors.relatedId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Preferred Desk */}
                  <div>
                    <label
                      htmlFor="contact-desk"
                      className="block text-xs font-semibold text-slate-800 mb-1"
                    >
                      Assigned Campus Desk Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="contact-desk"
                      name="preferredDesk"
                      value={formData.preferredDesk}
                      onChange={handleChange}
                      onBlur={() => handleBlur('preferredDesk')}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    >
                      {CAMPUS_DESKS.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.building})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-semibold text-slate-800 mb-1"
                    >
                      Inquiry Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      placeholder="Summary of your question or issue"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={() => handleBlur('subject')}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        touched.subject && validation.errors.subject
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                      }`}
                    />
                    {touched.subject && validation.errors.subject && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validation.errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message with live counter */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="contact-message"
                        className="text-xs font-semibold text-slate-800"
                      >
                        Detailed Message <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {formData.message.length} / 2000 characters
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      placeholder="Please provide details, dates, and relevant context..."
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={() => handleBlur('message')}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        touched.message && validation.errors.message
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                      }`}
                    />
                    {touched.message && validation.errors.message && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validation.errors.message}
                      </p>
                    )}
                  </div>

                  {/* Anti-spam Verification Challenge */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <label
                      htmlFor="contact-antispam"
                      className="block text-xs font-semibold text-slate-800 mb-1"
                    >
                      Human Verification Challenge: What is 7 + 5? <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-antispam"
                      name="antiSpamAnswer"
                      type="text"
                      placeholder="Enter the number"
                      value={formData.antiSpamAnswer}
                      onChange={handleChange}
                      onBlur={() => handleBlur('antiSpamAnswer')}
                      className={`w-36 px-3.5 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                        touched.antiSpamAnswer && validation.errors.antiSpamAnswer
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:ring-slate-900/10 focus:border-slate-900'
                      }`}
                    />
                    {touched.antiSpamAnswer && validation.errors.antiSpamAnswer && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validation.errors.antiSpamAnswer}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Sending to Property Desk...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Ticket to Desk Services</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Directory & FAQs Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Campus Desks Directory */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <span>Physical Lost Property Hubs</span>
              </h3>

              <div className="space-y-4 text-xs">
                {CAMPUS_DESKS.map((desk) => (
                  <div
                    key={desk.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-900">{desk.name}</div>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {desk.activeItemsCount} items logged
                      </span>
                    </div>

                    <div className="text-slate-600 space-y-1">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {desk.building}, {desk.room}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{desk.hours}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{desk.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-700" />
                <span>Frequently Asked Questions</span>
              </h3>

              <div className="divide-y divide-slate-100 text-xs">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between text-left font-semibold text-slate-800 hover:text-slate-950 gap-2"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          openFaq === idx ? 'rotate-180 text-slate-900' : ''
                        }`}
                      />
                    </button>
                    {openFaq === idx && (
                      <p className="mt-2 text-slate-600 leading-relaxed text-[11px]">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
