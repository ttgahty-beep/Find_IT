'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ShieldCheck, User, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, quickSwitchAccount } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-xs tracking-tighter">
            FUI
          </span>
          <span>FindIt Campus &middot; Foundation University</span>
        </Link>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link
            href="/"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
              pathname === '/' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Home
          </Link>
          <Link
            href="/#inventory"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
          >
            Browse Listings
          </Link>
          <Link
            href="/contact"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
              pathname === '/contact' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Contact Desks
          </Link>
          <Link
            href="/register"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
              pathname === '/register' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Sign Up
          </Link>
        </nav>

        {/* Zone 3: 1 primary action or active session controller */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700 uppercase">
                  {user.name.slice(0, 2)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[110px]">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize leading-tight">
                    {user.role.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 text-xs"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-slate-500 truncate">{user.email}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      ID: {user.studentIdMasked || 'VERIFIED'}
                    </p>
                  </div>

                  <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Foundation Univ Role Switch
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                    <button
                      type="button"
                      onClick={() => {
                        quickSwitchAccount('student');
                        setProfileDropdownOpen(false);
                      }}
                      className="px-2 py-1 text-left rounded hover:bg-slate-100 text-slate-700"
                    >
                      Ahtesham (Student)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        quickSwitchAccount('finder');
                        setProfileDropdownOpen(false);
                      }}
                      className="px-2 py-1 text-left rounded hover:bg-slate-100 text-slate-700"
                    >
                      Fatima (Finder)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        quickSwitchAccount('desk');
                        setProfileDropdownOpen(false);
                      }}
                      className="px-2 py-1 text-left rounded hover:bg-slate-100 text-slate-700"
                    >
                      Dr. Bilal (Proctor)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        quickSwitchAccount('admin');
                        setProfileDropdownOpen(false);
                      }}
                      className="px-2 py-1 text-left rounded hover:bg-slate-100 text-slate-700"
                    >
                      Engr. Usman (Admin)
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
