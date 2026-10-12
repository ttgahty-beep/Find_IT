'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/authContext';
import {
  CATEGORIES,
  CAMPUS_DESKS,
  SEED_REPORTS,
  ReportRecord,
} from '@/lib/seedData';
import { validateReportInput, ReportInput } from '@/lib/validation';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  Lock,
  QrCode,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  X,
  FileCheck,
  AlertCircle,
  Cpu,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  // State for inventory search & filtering
  const [reports, setReports] = useState<ReportRecord[]>(SEED_REPORTS);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<ReportRecord | null>(null);
  const [claimEvidence, setClaimEvidence] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState<string | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [newReport, setNewReport] = useState<ReportInput>({
    type: 'LOST',
    title: '',
    category: CATEGORIES[0],
    campusLocation: 'Foundation University Islamabad, Iqbal Central Library',
    eventDate: '2026-10-12',
    publicDescription: '',
    privateClues: '',
  });
  const [reportTouched, setReportTouched] = useState<Record<string, boolean>>({});
  const [reportSuccess, setReportSuccess] = useState<any | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Match factor explanation modal
  const [factorModalItem, setFactorModalItem] = useState<ReportRecord | null>(null);

  // Fetch reports on mount or filter change
  useEffect(() => {
    async function loadReports() {
      try {
        const queryParams = new URLSearchParams();
        if (typeFilter !== 'ALL') queryParams.set('type', typeFilter);
        if (categoryFilter !== 'All') queryParams.set('category', categoryFilter);
        if (searchQuery) queryParams.set('q', searchQuery);

        const res = await fetch(`/api/reports?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success && data.reports) {
          setReports(data.reports);
        }
      } catch {
        // Fallback to local filter
        let filtered = SEED_REPORTS;
        if (typeFilter !== 'ALL') filtered = filtered.filter((r) => r.type === typeFilter);
        if (categoryFilter !== 'All') filtered = filtered.filter((r) => r.category === categoryFilter);
        if (searchQuery) {
          filtered = filtered.filter(
            (r) =>
              r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.publicDescription.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setReports(filtered);
      }
    }
    loadReports();
  }, [typeFilter, categoryFilter, searchQuery]);

  const reportValidation = validateReportInput(newReport);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportTouched({
      type: true,
      title: true,
      category: true,
      campusLocation: true,
      eventDate: true,
      publicDescription: true,
    });

    if (!reportValidation.isValid) return;

    setIsSubmittingReport(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReport,
          userId: user?.id || 'usr-student-01',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReportSuccess(data.report);
        // Refresh listings
        const updated = await fetch('/api/reports');
        const updatedData = await updated.json();
        if (updatedData.reports) setReports(updatedData.reports);
      }
    } catch {
      alert('Error submitting report.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimEvidence.trim() || claimEvidence.trim().length < 10) {
      alert('Please provide at least 10 characters of private verification evidence.');
      return;
    }
    setClaimSubmitted(selectedItemForClaim?.id || 'SUBMITTED');
    setTimeout(() => {
      setSelectedItemForClaim(null);
      setClaimEvidence('');
      setClaimSubmitted(null);
    }, 2400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative bg-white border-b border-slate-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Headlines & Actions */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    Foundation University Islamabad &middot; Lost Property Directorate
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mt-2 leading-[1.15] text-balance">
                    Smart Lost & Found Portal for Foundation University
                  </h1>
                  <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">
                    Dedicated system for FUI students, faculty, and proctorial staff across Islamabad and Rawalpindi campuses. Recover student smart cards, calculators, laptops, and files with transparent algorithm scoring and staff-verified QR collection.
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReportSuccess(null);
                      setIsReportModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Lost or Found Item</span>
                  </button>
                  <Link
                    href="#inventory"
                    className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Browse FUI Listings
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
                  >
                    Register Student Account &rarr;
                  </Link>
                </div>

                {/* Privacy Invariant Banner */}
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Encrypted Roll Numbers & PII</span>
                  </div>
                  <span>&middot;</span>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-600" />
                    <span>Private Clues Shielded</span>
                  </div>
                  <span>&middot;</span>
                  <div className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-slate-600" />
                    <span>Proctor Verified Tokens</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Image with Measured Scrim */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-16/10">
                  <Image
                    src="/images/hero_foundation_university_1791825889224.jpg"
                    alt="Foundation University Islamabad Campus and Students"
                    fill
                    className="object-cover"
                    priority
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-mono">
                      Foundation University Islamabad Campus
                    </div>
                    <div className="text-sm font-semibold mt-0.5">
                      Main Academic Block & Central Lawns (DHA Phase 1)
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Desk Hours: Mon – Fri 08:30 – 16:30 (Iqbal Library Desk open till 21:00)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS STRIP (Tabular Numerals) */}
        <section className="bg-slate-900 text-white py-6 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">
                  894
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Items Verified & Returned
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400">
                  94.2%
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Recovery Success Rate
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">
                  2.4 <span className="text-sm font-normal text-slate-400">hrs</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Median Pickup Turnaround
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">
                  4 Hubs
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Managed Campus Desks
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INVENTORY CATALOG & SEARCH */}
        <section id="inventory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Live Inventory Catalog
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Browse Lost & Found Property
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                All records display public-safe characteristics. Private clues remain shielded until verified by desk staff.
              </p>
            </div>

            {/* Report Button shortcut */}
            <button
              type="button"
              onClick={() => {
                setReportSuccess(null);
                setIsReportModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Item</span>
            </button>
          </div>

          {/* Search Bar & Filter Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search text input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by keywords (e.g. MacBook, AirPods, Backpack, Library)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Type segmented control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTypeFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    typeFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({reports.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('LOST')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    typeFilter === 'LOST'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lost
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('FOUND')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    typeFilter === 'FOUND'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Found
                </button>
              </div>

              {/* Category selector */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {reports.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">
                No matching reports found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your search terms, changing the category filter, or registering a new lost/found report.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('ALL');
                  setCategoryFilter('All');
                }}
                className="mt-4 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 bg-slate-100">
                    <Image
                      src={item.photoUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded tracking-wider uppercase ${
                          item.type === 'LOST'
                            ? 'bg-rose-900 text-white'
                            : 'bg-emerald-900 text-white'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>

                    {item.matchScore && (
                      <div className="absolute top-3 right-3">
                        <button
                          type="button"
                          onClick={() => setFactorModalItem(item)}
                          className="text-[11px] font-mono tabular-nums font-semibold px-2 py-0.5 rounded bg-slate-900/90 text-white hover:bg-slate-900 backdrop-blur-sm transition-colors flex items-center gap-1"
                        >
                          <Cpu className="w-3 h-3 text-amber-400" />
                          <span>{item.matchScore}% Match</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Zero-Pill Unboxed Metadata */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <span>{item.category}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span className="font-mono tabular-nums">{item.eventDate}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {item.publicDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-start gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item.campusLocation}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.id}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.matchFactors && (
                            <button
                              type="button"
                              onClick={() => setFactorModalItem(item)}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline decoration-slate-300"
                            >
                              Inspect Match
                            </button>
                          )}

                          {item.status !== 'VERIFIED_RETURNED' ? (
                            <button
                              type="button"
                              onClick={() => setSelectedItemForClaim(item)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              Claim Item
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Handover Complete
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CCP MATCHING ENGINE ALGORITHM SECTION */}
        <section className="bg-white border-y border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Complex Computing Problem (CCP) Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Explainable Privacy-Preserving Recovery Algorithm
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Rather than relying on unverified black-box claims, FindIt Campus evaluates candidate pairs using the multi-variable weighted model defined in PRD Section 7.3:
              </p>
              <div className="mt-3 p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto">
                M = 100 &times; (0.30C + 0.25D + 0.20L + 0.15T + 0.10K)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 font-mono">0.30 &middot; Category (C)</div>
                <div className="text-slate-600 mt-1">
                  Taxonomy compatibility matching identical subcategories.
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 font-mono">0.25 &middot; Description (D)</div>
                <div className="text-slate-600 mt-1">
                  Token overlap and TF-IDF similarity on public safe descriptions.
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 font-mono">0.20 &middot; Location (L)</div>
                <div className="text-slate-600 mt-1">
                  Campus building and zone proximity matrix.
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 font-mono">0.15 &middot; Time (T)</div>
                <div className="text-slate-600 mt-1">
                  Decay function penalizing large gaps between loss and find dates.
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 font-mono">0.10 &middot; Keywords (K)</div>
                <div className="text-slate-600 mt-1">
                  Normalized noun overlap in item titles without exposing serials.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VERIFIED HANDOVER WORKFLOW (4-Step Process) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verification Protocol
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              How Verified Handover Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              From report to physical return: structured, audited, and strictly validated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-900 font-mono">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Submit Public Report</h3>
              <p className="text-slate-600 leading-relaxed">
                Describe the item without leaking private clues. Store sensitive details in encrypted fields.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-900 font-mono">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Engine Suggests Matches</h3>
              <p className="text-slate-600 leading-relaxed">
                The ranking engine scores candidate pairs and alerts the reporter with transparent factors.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-900 font-mono">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Private Evidence Claim</h3>
              <p className="text-slate-600 leading-relaxed">
                Claimant provides proof (device unlock, custom markings). Authorized Desk Staff reviews privately.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-900 font-mono">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Single-Use QR Pickup</h3>
              <p className="text-slate-600 leading-relaxed">
                Approved claim issues an expiring token. Physical handover verified at desk with immutable receipt.
              </p>
            </div>
          </div>
        </section>

        {/* CAMPUS DESK DIRECTORY STRIP */}
        <section className="bg-slate-100 border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Campus Lost Property Service Desks
                </h3>
                <p className="text-xs text-slate-600">
                  Staffed locations ready to accept found items and verify claims.
                </p>
              </div>
              <Link
                href="/contact"
                className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1"
              >
                <span>View Full Desk Directory & Hours</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {CAMPUS_DESKS.map((d) => (
                <div key={d.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <div className="font-semibold text-slate-900 line-clamp-1">{d.name}</div>
                  <div className="text-slate-600 text-[11px]">{d.room}</div>
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">{d.hours.split('|')[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* REPORT ITEM MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-slate-700" />
                <span>Report Lost or Found Campus Property</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Report Registered: {reportSuccess.id}
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your report for <strong className="text-slate-900">{reportSuccess.title}</strong> has been saved.
                  Candidate matches will be evaluated by the CCP matching engine.
                </p>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Close & View Catalog
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateReport} noValidate className="space-y-4 text-xs">
                {/* Type Selection */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Report Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewReport({ ...newReport, type: 'LOST' })}
                      className={`py-2 px-3 rounded-lg border font-semibold text-center transition-colors ${
                        newReport.type === 'LOST'
                          ? 'bg-rose-50 border-rose-400 text-rose-800'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      I LOST An Item
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewReport({ ...newReport, type: 'FOUND' })}
                      className={`py-2 px-3 rounded-lg border font-semibold text-center transition-colors ${
                        newReport.type === 'FOUND'
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      I FOUND An Item
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Item Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Silver Laptop in Charcoal Wool Sleeve"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                  {reportTouched.title && reportValidation.errors.title && (
                    <p className="mt-1 text-red-600 text-[11px]">{reportValidation.errors.title}</p>
                  )}
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newReport.category}
                      onChange={(e) => setNewReport({ ...newReport, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Campus Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Library 2nd Floor Study Stalls"
                      value={newReport.campusLocation}
                      onChange={(e) => setNewReport({ ...newReport, campusLocation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                    {reportTouched.campusLocation && reportValidation.errors.campusLocation && (
                      <p className="mt-1 text-red-600 text-[11px]">{reportValidation.errors.campusLocation}</p>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newReport.eventDate}
                    onChange={(e) => setNewReport({ ...newReport, eventDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                  {reportTouched.eventDate && reportValidation.errors.eventDate && (
                    <p className="mt-1 text-red-600 text-[11px]">{reportValidation.errors.eventDate}</p>
                  )}
                </div>

                {/* Public Description */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Public Description (Safe Details Only) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="General appearance, color, brand, approximate time. Do NOT include unique serial numbers or private identifiers."
                    value={newReport.publicDescription}
                    onChange={(e) => setNewReport({ ...newReport, publicDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                  {reportTouched.publicDescription && reportValidation.errors.publicDescription && (
                    <p className="mt-1 text-red-600 text-[11px]">{reportValidation.errors.publicDescription}</p>
                  )}
                </div>

                {/* Private Ownership Clues (AES-256-GCM Encrypted) */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold mb-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Private Ownership Clues (Shielded & Encrypted)</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Lock screen message, hidden stickers, unique scratch, or exact serial number. Only authorized desk staff will see this during claim verification."
                    value={newReport.privateClues}
                    onChange={(e) => setNewReport({ ...newReport, privateClues: e.target.value })}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Encrypted with AES-256-GCM before storage. Excluded from public APIs.
                  </p>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmittingReport ? (
                      <span>Saving Encrypted Report...</span>
                    ) : (
                      <span>Submit {newReport.type} Report</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CLAIM ITEM MODAL */}
      {selectedItemForClaim && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Submit Ownership Verification Claim</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItemForClaim(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {claimSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Claim Submitted for Review
                </h4>
                <p className="text-xs text-slate-600">
                  Your encrypted private evidence has been securely routed to the Lost Property Desk.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500">Claiming Item:</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedItemForClaim.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: {selectedItemForClaim.id} &middot; {selectedItemForClaim.campusLocation}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Private Verification Evidence <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide unique evidence proving you own this item (e.g. lock screen PIN, specific internal markings, contents of back pocket, exact purchase receipt details)."
                    value={claimEvidence}
                    onChange={(e) => setClaimEvidence(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your evidence is encrypted with AES-256-GCM. Desk staff will compare it with physical property records.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                  >
                    Submit Private Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedItemForClaim(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CCP FACTOR BREAKDOWN MODAL */}
      {factorModalItem && factorModalItem.matchFactors && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-700" />
                <span>Algorithm Score Breakdown (PRD Section 7.3)</span>
              </h3>
              <button
                type="button"
                onClick={() => setFactorModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-lg">
                <div>
                  <div className="text-[11px] text-slate-400 font-mono">Algorithm Version: CCP-v1.0</div>
                  <div className="font-semibold text-sm mt-0.5">{factorModalItem.title}</div>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {factorModalItem.matchScore}%
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Category Compatibility (30% weight):</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {Math.round(factorModalItem.matchFactors.categoryCompat * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Description Token Overlap (25% weight):</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {Math.round(factorModalItem.matchFactors.descriptionSim * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Location Proximity (20% weight):</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {Math.round(factorModalItem.matchFactors.locationProx * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Time Window Proximity (15% weight):</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {Math.round(factorModalItem.matchFactors.timeProx * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Keyword Overlap (10% weight):</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {Math.round(factorModalItem.matchFactors.keywordOverlap * 100)}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-slate-600 text-[11px] border border-slate-200">
                <strong>Academic Notice:</strong> A match score is a ranking aid, not proof of ownership. Final handover requires physical verification at the campus lost property desk.
              </div>

              <button
                type="button"
                onClick={() => setFactorModalItem(null)}
                className="w-full py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
