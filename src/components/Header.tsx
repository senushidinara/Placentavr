import React from 'react';

interface HeaderProps {
  activeTab: 'simulator' | 'code' | 'ui' | 'guide';
  setActiveTab: (tab: 'simulator' | 'code' | 'ui' | 'guide') => void;
  onCopyPrimary: () => void;
  copiedPrimary: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onCopyPrimary,
  copiedPrimary,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <a href="/" className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          PlacentaSync VR
        </a>
        <span className="text-xs font-mono text-rose-400/90 hidden sm:inline">
          Meta XR SDK v81+
        </span>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'simulator' ? 'text-rose-400 font-semibold' : ''
          }`}
        >
          Spatial Simulator
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'code' ? 'text-rose-400 font-semibold' : ''
          }`}
        >
          C# Script
        </button>
        <button
          onClick={() => setActiveTab('ui')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'ui' ? 'text-rose-400 font-semibold' : ''
          }`}
        >
          Maternal UI
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'guide' ? 'text-rose-400 font-semibold' : ''
          }`}
        >
          Architecture Guide
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onCopyPrimary}
          className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm shadow-rose-950/50 transition-colors whitespace-nowrap shrink-0 active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          {copiedPrimary ? (
            <>
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Copied C# Script</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy C# Script</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
