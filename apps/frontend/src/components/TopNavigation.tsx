'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './auth/AuthProvider';

export default function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  // Don't show navigation on auth pages
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.some(page => pathname.startsWith(page));
  
  if (isAuthPage) {
    return null;
  }

  // Show different navigation for dashboard vs other pages
  const isDashboard = pathname === '/dashboard';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {!isDashboard ? (
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
            ) : (
              <span className="font-black tracking-wider text-sm">CRYPTO TRADING PLATFORM</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {!isDashboard && (
              <div className="text-xs text-gray-500 font-light hidden sm:block">
                RISK MANAGEMENT
              </div>
            )}
            
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 hidden sm:block">
                      {user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-xs font-black tracking-wide text-gray-600 hover:text-black transition-colors"
                    >
                      SIGN OUT
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-xs font-black tracking-wide text-black hover:text-gray-600 transition-colors"
                  >
                    SIGN IN
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
