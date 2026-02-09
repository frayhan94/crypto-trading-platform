'use client';

import Link from 'next/link';

export default function DashboardNavigation() {
  const tools = [
    {
      title: 'RISK',
      subtitle: 'MANAGEMENT',
      description: 'Analyze trading risk, liquidation prices, and position sizing',
      href: '/risk',
      icon: '🛡️',
      color: 'border-green-200 hover:border-green-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
          CRYPTO
          <br />
          <span className="text-gray-500">TRADING PLATFORM</span>
        </h1>
        <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light tracking-wide">
          ANALYZE. CALCULATE. PROTECT.
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool, index) => (
          <Link key={index} href={tool.href}>
            <div className={`bg-white border-2 ${tool.color} p-8 transition-all duration-300 hover:shadow-lg cursor-pointer group`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-1">
                    {tool.title}
                    <br />
                    <span className="text-gray-500">{tool.subtitle}</span>
                  </h2>
                </div>
                <div className="text-4xl group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
              </div>
              <div className="w-16 h-0.5 bg-black mb-6"></div>
              <p className="text-gray-600 font-light tracking-wide leading-relaxed">
                {tool.description}
              </p>

              <div className="mt-6 flex items-center text-sm font-black tracking-wider text-gray-700 group-hover:text-black transition-colors">
                LAUNCH TOOL
                <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
