// frontend/src/components/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext'; // For dark mode toggle

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown menu

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-40 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Site Title */}
        <Link href="/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200">
          MyHealth AI
        </Link>

        {/* Navigation Links (Right Side) */}
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 hidden md:block">
                Dashboard
              </Link>
              <Link href="/mood" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 hidden md:block">
                Mood
              </Link>
              <Link href="/journal" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 hidden md:block">
                Journal
              </Link>
              <Link href="/chat" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 hidden md:block">
                Chat
              </Link>

              {/* Profile & Resources Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 focus:outline-none"
                >
                  {user.email.split('@')[0]} {/* Display part of email as username */}
                  <svg className={`ml-1 h-5 w-5 transform transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => setDropdownOpen(false)}>
                      Profile Settings
                    </Link>
                    <Link href="/resources" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => setDropdownOpen(false)}>
                      Resources
                    </Link>
                    <hr className="border-gray-200 dark:border-gray-600 my-1" />
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm transition-colors duration-300 focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Mobile Menu (Optional: Implement later for smaller screens) */}
        {/* For small screens, you might want a hamburger menu */}
      </nav>
    </header>
  );
}