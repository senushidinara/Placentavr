import React, { useState } from 'react';
import { StructuredLog } from '../types/placentaSync';

interface StructuredLogViewerProps {
  logs: StructuredLog[];
  onClearLogs: () => void;
}

export const StructuredLogViewer: React.FC<StructuredLogViewerProps> = ({ logs, onClearLogs }) => {
  const [filterChannel, setFilterChannel] = useState<string>('All');
  const [copied, setCopied] = useState<boolean>(false);

  const channels = ['All', 'Sanctuary', 'StateSwap', 'Ergonomics', 'Input', 'Haptics'];

  const filteredLogs = filterChannel === 'All'
    ? logs
    : logs.filter((log) => log.channel === filterChannel);

  const handleCopyLogs = () => {
    const raw = filteredLogs
      .map((l) => `[PlacentaSync.VR][${l.channel}][${l.timestamp}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-950/80 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Structured Diagnostic Console
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            ({filteredLogs.length} events)
          </span>
        </div>

        {/* Channels */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {channels.map((chan) => (
            <button
              key={chan}
              onClick={() => setFilterChannel(chan)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                filterChannel === chan
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {chan}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="text-[11px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Logs'}
          </button>
          <button
            onClick={onClearLogs}
            className="text-[11px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded border border-slate-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Logs stream */}
      <div className="p-3 font-mono text-xs overflow-y-auto max-h-56 min-h-[140px] space-y-1.5 bg-slate-950">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 text-center py-6 text-xs italic">
            No diagnostic events registered for channel "{filterChannel}".
          </div>
        ) : (
          filteredLogs.map((log) => {
            const levelStyle =
              log.level === 'warn'
                ? 'text-amber-400 bg-amber-950/20 border-l-2 border-amber-500'
                : log.level === 'success'
                ? 'text-emerald-300 bg-emerald-950/10'
                : 'text-slate-300';

            const tagColor =
              log.channel === 'Sanctuary'
                ? 'text-sky-400'
                : log.channel === 'StateSwap'
                ? 'text-purple-400'
                : log.channel === 'Ergonomics'
                ? 'text-amber-400'
                : log.channel === 'Input'
                ? 'text-rose-400'
                : 'text-pink-400';

            return (
              <div
                key={log.id}
                className={`py-1 px-2 rounded font-mono text-[11px] leading-relaxed flex items-start gap-2 hover:bg-slate-900/50 ${levelStyle}`}
              >
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`font-semibold shrink-0 ${tagColor}`}>[{log.channel}]</span>
                <span className="flex-1 break-words">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
