'use client';

interface ProtocolItem {
  icon: string;
  title: string;
  description: string;
}

const RISK_PROTOCOLS: ProtocolItem[] = [
  {
    icon: '🎯',
    title: '1-2% RULE',
    description: 'Never risk more than 1-2% of your total account balance on a single trade.'
  },
  {
    icon: '⚖️',
    title: 'R:R RATIO',
    description: 'Aim for minimum 1:1.5 risk/reward ratio. Higher ratios are better.'
  },
  {
    icon: '🛡️',
    title: 'POSITION SIZE',
    description: 'Calculate position size based on your stop loss distance and risk percentage.'
  },
  {
    icon: '📊',
    title: 'LEVERAGE',
    description: 'Lower leverage = lower liquidation risk. Start with 2-5x leverage.'
  },
  {
    icon: '📍',
    title: 'STOP LOSS',
    description: 'Always use stop losses. Place them at logical support/resistance levels.'
  },
  {
    icon: '💰',
    title: 'TAKE PROFIT',
    description: 'Set realistic take profits. Don\'t be greedy - secure profits regularly.'
  }
];

export default function RiskProtocol() {
  return (
    <section className="mt-16 border-t border-gray-300 pt-12">
      <header className="text-center mb-12">
        <h2 className="text-3xl font-black tracking-tight mb-4">
          RISK <span className="text-gray-500">PROTOCOL</span>
        </h2>
        <p className="text-gray-600 font-light max-w-2xl mx-auto">
          Essential risk management principles every trader should follow to protect their capital and maximize profits.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {RISK_PROTOCOLS.map((protocol, index) => (
          <article 
            key={`${protocol.title}-${index}`}
            className="text-center group p-6 rounded-lg border border-gray-200 hover:border-black transition-all duration-300 hover:shadow-lg"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {protocol.icon}
            </div>
            <h3 className="font-black text-lg mb-3 tracking-tight">
              {protocol.title}
            </h3>
            <p className="text-sm text-gray-600 font-light leading-relaxed">
              {protocol.description}
            </p>
          </article>
        ))}
      </div>

      <footer className="mt-12 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-black text-white font-black tracking-wider text-sm">
          <span className="mr-2">⚡</span>
          PROFESSIONAL RISK MANAGEMENT
        </div>
      </footer>
    </section>
  );
}
