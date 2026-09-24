import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  X,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Laptop,
  Maximize2,
  Minimize2,
  Tv,
  Keyboard,
  ShieldCheck,
  Sparkles,
  Download,
  AppWindow,
  Play
} from 'lucide-react';

interface WindowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchWindowed?: () => void;
}

export const WindowsModal: React.FC<WindowsModalProps> = ({
  isOpen,
  onClose,
  onLaunchWindowed,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'install' | 'pip' | 'shortcuts' | 'build'>('install');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const appUrl = window.location.origin;

  const handleOpenStandaloneWindow = () => {
    // Open a popup window with minimal browser chrome
    window.open(
      appUrl,
      'ReelportWindow',
      'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
    );
    if (onLaunchWindowed) onLaunchWindowed();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/30">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Reelport on Windows
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Desktop & Window
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Run as a standalone desktop app, floating PiP window, or full-window cinema
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-800 px-5 pt-3 bg-neutral-900/50 gap-2">
            <button
              onClick={() => setActiveTab('install')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'install'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <AppWindow className="w-3.5 h-3.5" />
              Windows Desktop App
            </button>
            <button
              onClick={() => setActiveTab('pip')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'pip'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Floating Pop-out Window
            </button>
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'shortcuts'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              Windows Shortcuts
            </button>
            <button
              onClick={() => setActiveTab('build')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'build'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Electron / Native Build
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5 text-sm">
            {/* Install Tab */}
            {activeTab === 'install' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-blue-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        1-Click Windows App Installation (Edge & Chrome)
                      </h4>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Reelport runs as an official standalone desktop application on Windows 10 & Windows 11. It installs directly to your Start Menu, Taskbar, and Desktop with zero download size and hardware video acceleration!
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      onClick={handleOpenStandaloneWindow}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                      <AppWindow className="w-4 h-4" />
                      Launch in Standalone Desktop Window
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <span className="font-semibold text-blue-400 block">Step 1: Open in Edge/Chrome</span>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      Look at the top right of your address bar for the <span className="text-neutral-200 font-mono">App Available</span> or <span className="text-neutral-200 font-mono">Install</span> icon (⊕).
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <span className="font-semibold text-cyan-400 block">Step 2: Click "Install"</span>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      Click <strong>"Install Reelport"</strong>. Windows registers it as an installed app in <code className="text-neutral-300">Settings &gt; Apps</code>.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <span className="font-semibold text-emerald-400 block">Step 3: Pin to Taskbar</span>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      Right click the Reelport window on your Windows taskbar and choose <strong>"Pin to taskbar"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PiP Tab */}
            {activeTab === 'pip' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    Always-On-Top Floating Picture-in-Picture Window
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Watch coding sessions, tutorials, or music while working in Visual Studio Code, Excel, Word, or browsing the web. The video detaches into a floating window that stays on top of all other open Windows applications.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2 text-xs">
                  <h5 className="font-semibold text-neutral-200">How to trigger the Pop-out Window:</h5>
                  <ul className="list-disc list-inside space-y-1.5 text-neutral-400">
                    <li>Click on any video to enter the Video Cinema player.</li>
                    <li>Hover over the video controls and click the <strong className="text-cyan-300">Pop-out Window (PiP)</strong> icon.</li>
                    <li>Or press the keyboard shortcut <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-[10px]">P</kbd> while watching.</li>
                    <li>You can drag and resize the floating window anywhere on your Windows desktop monitors!</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Shortcuts Tab */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-3">
                <div className="text-xs text-neutral-400">
                  Standard Windows media control shortcuts enabled in the Reelport Cinema Window:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <span className="text-neutral-400">Play / Pause</span>
                    <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">Space / K</kbd>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <span className="text-neutral-400">Toggle Fullscreen</span>
                    <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">F</kbd>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <span className="text-neutral-400">Pop-out PiP Window</span>
                    <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">P</kbd>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <span className="text-neutral-400">Mute / Unmute</span>
                    <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">M</kbd>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <span className="text-neutral-400">Seek 5s Back / Forward</span>
                    <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">&larr; / &rarr;</kbd>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <span className="text-neutral-400">Volume Up / Down</span>
                    <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">&uarr; / &darr;</kbd>
                  </div>
                </div>
              </div>
            )}

            {/* Build Tab */}
            {activeTab === 'build' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Electron / MSIX Windows Packaging
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      Windows 10/11 x64 / ARM64
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    To compile a standalone offline <code className="text-neutral-300 font-mono">Reelport-Setup.exe</code> with native Windows notifications and media key integration:
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                    <span>Build Windows Executable Command</span>
                    <button
                      onClick={() => copyToClipboard('npx electron-packager . Reelport --platform=win32 --arch=x64', 'win1')}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                    >
                      {copiedCmd === 'win1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </label>
                  <pre className="p-2.5 rounded-lg bg-black border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto">
                    npx electron-packager . Reelport --platform=win32 --arch=x64 --out=dist-win
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-950/80">
            <button
              onClick={handleOpenStandaloneWindow}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open In Dedicated Desktop Window
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
