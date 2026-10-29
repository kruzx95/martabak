import React from 'react';
import { Wifi, WifiOff, Settings, Clock } from 'lucide-react';

interface HeaderBarProps {
  isOnline: boolean;
  shiftName?: string;
  onSettingsClick: () => void;
}

export default function HeaderBar({ isOnline, shiftName, onSettingsClick }: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-brand-400">🥞</span>
        <div>
          <h1 className="text-lg font-bold text-brand-400 leading-tight">
            Martabak Purnama
          </h1>
          <p className="text-[10px] text-slate-500 leading-none">Idaman Mama Mertua</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {shiftName && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-800 px-2.5 py-1.5 rounded-full text-slate-300">
            <Clock size={12} />
            <span>{shiftName}</span>
          </div>
        )}

        <div
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            isOnline
              ? 'bg-green-900/40 text-green-400'
              : 'bg-yellow-900/40 text-yellow-400'
          }`}
        >
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        <button
          onClick={onSettingsClick}
          className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Pengaturan"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
