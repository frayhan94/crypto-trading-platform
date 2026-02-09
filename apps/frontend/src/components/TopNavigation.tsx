'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNavigation() {
  const pathname = usePathname();

  // Only show navigation on pages other than dashboard
  const showNavigation = pathname !== '/dashboard';

  if (!showNavigation) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              href="/dashboard"
              className="flex items-center text-black hover:text-gray-600 transition-colors duration-200 group"
            >
              <svg 
                className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              <span className="font-black tracking-wider text-sm">BACK TO DASHBOARD</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="text-xs text-gray-500 font-light">
              RISK MANAGEMENT DASHBOARD
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
