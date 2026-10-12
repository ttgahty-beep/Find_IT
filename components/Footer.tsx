'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, MapPin, Clock, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: System info & Vision */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-6 h-6 rounded bg-emerald-800 text-white flex items-center justify-center font-black text-xs">
                FUI
              </span>
              <span>FindIt Campus &middot; FUI</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Smart Lost & Found Management System for Foundation University Islamabad & Rawalpindi campuses. Combining explainable match scoring with cryptographic privacy and staff-verified handover.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>AES-256-GCM & PBKDF2 Encrypted</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Registration (Sign Up)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In (Login)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us & Campus Desks
                </Link>
              </li>
              <li>
                <Link href="/#inventory" className="hover:text-white transition-colors">
                  Active Listings Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Central Desk Hours */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide">FUI Campus Desks</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-300 shrink-0" />
                <span>Iqbal Central Library (DHA Phase 1) &middot; 08:30 – 21:00</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-300 shrink-0" />
                <span>Student Affairs & Proctorial (Jinnah Block G-04)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-300 shrink-0" />
                <span>FURC Rawalpindi (New Lalazar Block A)</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 mt-0.5 text-slate-300 shrink-0" />
                <span>Pickup QR Tokens Valid: 48 Hours</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency Assistance */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide">Proctorial Inquiries</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-mono tabular-nums">+92 (51) 5151437</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-300" />
                <span>lostfound@fui.edu.pk</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2">
                To prevent fraud, physical release of property requires verified Foundation University Smart Card and matching single-use QR token.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; 2026 FindIt Campus. Software Construction and Design (SCD) & Complex Computing Problem (CCP) Architecture.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Privacy-First Data Policy</span>
            <span>&middot;</span>
            <span className="hover:text-slate-400">Zero IDOR Verification</span>
            <span>&middot;</span>
            <span className="hover:text-slate-400">Audit Trail Enabled</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
