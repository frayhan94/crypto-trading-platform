'use client';

interface NavigationProps {
  currentPage: 'risk' | 'plans';
}

export default function Navigation({ currentPage }: NavigationProps) {
  return (
    <div className="mb-6">
      <nav className="flex space-x-4">
        <a 
          href="/risk" 
          className={`text-gray-700 hover:text-black px-3 py-2 border font-black tracking-wide text-sm transition-colors cursor-pointer ${
            currentPage === 'risk' 
              ? 'bg-black text-white border-black' 
              : 'border-gray-300'
          }`}
        >
          Analyze Risk
        </a>
        <a 
          href="/plans" 
          className={`text-gray-700 hover:text-black px-3 py-2 border font-black tracking-wide text-sm transition-colors cursor-pointer ${
            currentPage === 'plans' 
              ? 'bg-black text-white border-black' 
              : 'border-gray-300'
          }`}
        >
          My Plans
        </a>
      </nav>
    </div>
  );
}
