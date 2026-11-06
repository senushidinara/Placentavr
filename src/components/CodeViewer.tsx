import React, { useState } from 'react';
import { PRIMARY_CSHARP_SCRIPT, COMPANION_SCRIPTS, ScriptFile } from '../data/csharpScript';

interface CodeViewerProps {
  onLog: (channel: 'Sanctuary' | 'StateSwap' | 'Ergonomics' | 'Input' | 'Haptics', level: 'info' | 'warn' | 'success', message: string) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ onLog }) => {
  const allScripts: ScriptFile[] = [PRIMARY_CSHARP_SCRIPT, ...COMPANION_SCRIPTS];
  const [selectedScriptId, setSelectedScriptId] = useState<string>(PRIMARY_CSHARP_SCRIPT.id);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentScript = allScripts.find((s) => s.id === selectedScriptId) || PRIMARY_CSHARP_SCRIPT;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentScript.code);
    setCopied(true);
    onLog('Sanctuary', 'success', `Copied ${currentScript.filename} to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentScript.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentScript.filename;
    link.click();
    URL.revokeObjectURL(url);
    onLog('Sanctuary', 'info', `Downloaded ${currentScript.filename} asset.`);
  };

  // Simple token highlighter for C#
  const renderHighlightedCode = (rawCode: string) => {
    const lines = rawCode.split('\n');

    return lines.map((line, idx) => {
      const lineNum = idx + 1;
      const isMatch = searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        <div
          key={idx}
          className={`table-row leading-5 hover:bg-slate-900/60 ${
            isMatch ? 'bg-rose-950/40 text-rose-200' : ''
          }`}
        >
          <span className="table-cell select-none pr-4 text-right font-mono text-xs text-slate-600 border-r border-slate-800/80 w-12 pl-2">
            {lineNum}
          </span>
          <span className="table-cell pl-4 font-mono text-xs whitespace-pre text-slate-300">
            {highlightLineTokens(line)}
          </span>
        </div>
      );
    });
  };

  const highlightLineTokens = (line: string) => {
    // Comments
    if (line.trim().startsWith('//')) {
      return <span className="text-slate-500 italic">{line}</span>;
    }
    if (line.trim().startsWith('///')) {
      return <span className="text-emerald-500/80 italic">{line}</span>;
    }

    // Directives
    if (line.trim().startsWith('#')) {
      return <span className="text-purple-400 font-semibold">{line}</span>;
    }

    // Simple keyword coloring
    const words = line.split(/(\s+|[(),;.<>{}[\]=+\-*/&|!":])/);
    const keywords = new Set([
      'using', 'namespace', 'public', 'private', 'protected', 'class', 'enum',
      'struct', 'static', 'readonly', 'const', 'void', 'bool', 'int', 'float',
      'string', 'if', 'else', 'while', 'for', 'foreach', 'return', 'new', 'this',
      'base', 'typeof', 'null', 'true', 'false', 'yield', 'override', 'virtual',
      'async', 'await', 'get', 'set', 'out', 'ref'
    ]);

    const unityTypes = new Set([
      'MonoBehaviour', 'Transform', 'GameObject', 'Vector3', 'Quaternion',
      'Color', 'Time', 'Mathf', 'Coroutine', 'AudioSource', 'AudioClip',
      'LineRenderer', 'Material', 'Renderer', 'CanvasGroup', 'Button',
      'TextMeshProUGUI', 'OVRInput', 'RaycastHit', 'Physics', 'Gizmos', 'Debug',
      'LogType', 'UnityEvent', 'IEnumerator'
    ]);

    return words.map((token, i) => {
      if (keywords.has(token)) {
        return <span key={i} className="text-sky-400 font-medium">{token}</span>;
      }
      if (unityTypes.has(token)) {
        return <span key={i} className="text-emerald-300">{token}</span>;
      }
      if (token.startsWith('"') && token.endsWith('"')) {
        return <span key={i} className="text-amber-300">{token}</span>;
      }
      if (/^\d+(\.\d+)?f?$/.test(token)) {
        return <span key={i} className="text-orange-400">{token}</span>;
      }
      return token;
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl">
      {/* Script Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/70 p-3 gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {allScripts.map((script) => (
            <button
              key={script.id}
              onClick={() => setSelectedScriptId(script.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedScriptId === script.id
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <span>{script.filename}</span>
              {script.isPrimary && (
                <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 border border-rose-500/50">
                  Primary
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 w-32 md:w-44"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1 text-slate-400 hover:text-slate-200 text-xs"
              >
                ×
              </button>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy C# Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 shadow-md shadow-rose-950/50"
            title="Download .cs File"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download .cs</span>
          </button>
        </div>
      </div>

      {/* Script Description Banner */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 text-xs flex items-center justify-between text-slate-400">
        <div>
          <span className="font-semibold text-slate-200">{currentScript.title}:</span>{' '}
          <span>{currentScript.description}</span>
        </div>
        <span className="text-slate-500 font-mono text-[11px] shrink-0 ml-4">
          Meta XR SDK v81+ · Zero 3P Dependencies
        </span>
      </div>

      {/* Code Text Area */}
      <div className="flex-1 overflow-auto p-3 bg-slate-950 text-slate-300 font-mono text-xs max-h-[580px]">
        <div className="table w-full">{renderHighlightedCode(currentScript.code)}</div>
      </div>
    </div>
  );
};
