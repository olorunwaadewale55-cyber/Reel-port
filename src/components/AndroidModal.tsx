import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  X,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Package,
  Sparkles,
  QrCode,
  Download,
  FolderArchive,
  GitBranch,
  RefreshCw,
  Camera
} from 'lucide-react';

interface AndroidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidModal: React.FC<AndroidModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'playstore' | 'apk' | 'github'>('scan');
  
  // URL management for QR code
  const initialUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const [qrUrl, setQrUrl] = useState<string>(initialUrl);
  const [urlMode, setUrlMode] = useState<'current' | 'zip' | 'custom'>('current');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleUrlModeChange = (mode: 'current' | 'zip' | 'custom') => {
    setUrlMode(mode);
    if (mode === 'current') {
      setQrUrl(window.location.href.split('#')[0]);
    } else if (mode === 'zip') {
      setQrUrl(`${window.location.origin}/reelport-android-project.zip`);
    }
  };

  const downloadQrSvg = () => {
    const svgElement = document.getElementById('android-build-qr');
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reelport-android-qr.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Reelport on Android
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Ready
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Scan to install directly on your phone or build native packages
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

          {/* Nav Tabs */}
          <div className="flex border-b border-neutral-800 px-5 pt-3 bg-neutral-900/50 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('scan')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'scan'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Scan QR & Install
            </button>
            <button
              onClick={() => setActiveTab('playstore')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'playstore'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Play Store (.AAB)
            </button>
            <button
              onClick={() => setActiveTab('apk')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'apk'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Testing (.APK)
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'github'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              GitHub CI/CD (APK + AAB)
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5 text-sm">
            {/* TAB: SCAN QR CODE TO INSTALL */}
            {activeTab === 'scan' && (
              <div className="space-y-5">
                <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 shadow-inner">
                  {/* QR Code Container */}
                  <div className="flex flex-col items-center gap-2.5 shrink-0">
                    <div className="p-3 bg-white rounded-xl shadow-xl border-2 border-neutral-700/50 flex items-center justify-center">
                      <QRCodeSVG
                        id="android-build-qr"
                        value={qrUrl || window.location.href}
                        size={172}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={downloadQrSvg}
                        className="text-[11px] font-medium text-neutral-400 hover:text-cyan-400 flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 transition-colors"
                        title="Download QR code as SVG file"
                      >
                        <Download className="w-3 h-3" />
                        Save QR
                      </button>
                      <button
                        onClick={() => handleUrlModeChange('current')}
                        className="text-[11px] font-medium text-neutral-400 hover:text-cyan-400 flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 transition-colors"
                        title="Reset to current build URL"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Scan Instructions & Target Picker */}
                  <div className="flex-1 space-y-3.5 text-left w-full">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                          <Camera className="w-3 h-3" />
                        </span>
                        <h4 className="font-semibold text-white text-sm">
                          Scan with your Android camera
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        Point your Android phone camera or Google Lens at this code. Tap the link to open the live build directly in Chrome.
                      </p>
                    </div>

                    {/* Quick Mode Switcher */}
                    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px]">
                      <button
                        onClick={() => handleUrlModeChange('current')}
                        className={`flex-1 py-1 px-2 rounded font-medium transition-all ${
                          urlMode === 'current'
                            ? 'bg-cyan-500 text-neutral-950 shadow-sm font-semibold'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        Latest Build URL
                      </button>
                      <button
                        onClick={() => handleUrlModeChange('zip')}
                        className={`flex-1 py-1 px-2 rounded font-medium transition-all ${
                          urlMode === 'zip'
                            ? 'bg-cyan-500 text-neutral-950 shadow-sm font-semibold'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        ZIP Package Link
                      </button>
                      <button
                        onClick={() => setUrlMode('custom')}
                        className={`flex-1 py-1 px-2 rounded font-medium transition-all ${
                          urlMode === 'custom'
                            ? 'bg-cyan-500 text-neutral-950 shadow-sm font-semibold'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        Custom URL
                      </button>
                    </div>

                    {/* URL Input / Copy bar */}
                    <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1.5 rounded-lg border border-neutral-800">
                      <input
                        type="text"
                        value={qrUrl}
                        onChange={(e) => {
                          setQrUrl(e.target.value);
                          setUrlMode('custom');
                        }}
                        placeholder="https://..."
                        className="bg-transparent flex-1 text-xs font-mono text-cyan-300 outline-none select-all min-w-0"
                      />
                      <button
                        onClick={() => copyToClipboard(qrUrl, 'qr-url')}
                        className="px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-medium transition-colors flex items-center gap-1 shrink-0"
                      >
                        {copiedCmd === 'qr-url' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors shrink-0"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3-Step Install Guide */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] flex items-center justify-center">
                        1
                      </span>
                      Scan with Phone
                    </div>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      Open Camera or Google Lens on Android and tap the popup URL.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] flex items-center justify-center">
                        2
                      </span>
                      Tap Menu (⋮)
                    </div>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      In Chrome, tap the top-right 3 dots and tap <strong>"Install App"</strong>.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] flex items-center justify-center">
                        3
                      </span>
                      Launch Fullscreen
                    </div>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      Runs with zero browser UI, gesture navigation, and mobile storage.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'playstore' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Google Play Store Official Format (AAB)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                      Mandatory for Play Store
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Google Play Console requires <strong>Android App Bundle (.aab)</strong> instead of APK. Google uses the AAB to generate optimized, device-tailored APKs for each user device upon download from the Play Store.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-300">
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">APPLICATION ID</span>
                    com.reelport.app
                  </div>
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">OUTPUT LOCATION</span>
                    app/build/outputs/bundle/
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                    <span>1. Build Play Store AAB with npm command</span>
                    <button
                      onClick={() => copyToClipboard('npm run cap:bundle', 'aab-cmd1')}
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1"
                    >
                      {copiedCmd === 'aab-cmd1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </label>
                  <pre className="p-2.5 rounded-lg bg-black border border-neutral-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                    npm run cap:bundle
                  </pre>
                  <p className="text-[11px] text-neutral-500">
                    Runs <code className="text-neutral-400">vite build</code>, syncs Capacitor assets, and runs <code className="text-neutral-400">./gradlew bundleRelease</code> in the Android project.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                    <span>2. Or Direct Gradle Command</span>
                    <button
                      onClick={() => copyToClipboard('cd android && ./gradlew bundleRelease', 'aab-cmd2')}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                    >
                      {copiedCmd === 'aab-cmd2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </label>
                  <pre className="p-2.5 rounded-lg bg-black border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto">
                    cd android && ./gradlew bundleRelease
                  </pre>
                  <p className="text-[11px] text-neutral-400">
                    Generated bundle: <code className="text-emerald-400 font-mono">android/app/build/outputs/bundle/release/app-release.aab</code>
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 space-y-1.5 text-xs">
                  <span className="font-semibold text-neutral-200">Google Play App Signing:</span>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    When you create your new app in the <strong>Google Play Console</strong>, enable <em>Play App Signing</em>. Upload this generated <code className="text-cyan-300">.aab</code> file directly into an Internal Testing, Closed Testing, or Production release track.
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'apk' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Android Native Configuration
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Capacitor v8
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-300">
                    <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px]">PACKAGE NAME</span>
                      com.reelport.app
                    </div>
                    <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px]">TARGET SDK</span>
                      Android 34 / 35 / 36
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                    <span>1. Build & Sync Web Assets</span>
                    <button
                      onClick={() => copyToClipboard('npm run cap:build', 'cmd1')}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                    >
                      {copiedCmd === 'cmd1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </label>
                  <pre className="p-2.5 rounded-lg bg-black border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto">
                    npm run cap:build
                  </pre>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                    <span>2. Compile APK (Local Terminal / Android Studio)</span>
                    <button
                      onClick={() => copyToClipboard('cd android && ./gradlew assembleDebug', 'cmd2')}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                    >
                      {copiedCmd === 'cmd2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </label>
                  <pre className="p-2.5 rounded-lg bg-black border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto">
                    cd android && ./gradlew assembleDebug
                  </pre>
                  <p className="text-[11px] text-neutral-500">
                    Outputs debug APK directly to <code className="text-neutral-400">android/app/build/outputs/apk/debug/app-debug.apk</code>
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'github' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Automated GitHub Actions APK & Play Store AAB Builder
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    A GitHub Actions workflow is saved at <code className="text-cyan-300 font-mono">.github/workflows/build-apk.yml</code>. Whenever you push commits to your repository or click <strong>"Run workflow"</strong>, GitHub's cloud runners will automatically build both the testing <code className="text-cyan-300 font-mono">.apk</code> and the Google Play Store <code className="text-emerald-400 font-mono">.aab</code> bundle!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3 text-xs">
                  <h5 className="font-semibold text-neutral-200">How to get your APK & AAB from GitHub:</h5>
                  <ol className="list-decimal list-inside space-y-2 text-neutral-400 leading-relaxed">
                    <li>Push your repository to GitHub.</li>
                    <li>Go to the <span className="text-neutral-200 font-medium">Actions</span> tab in your GitHub repository.</li>
                    <li>Select <span className="text-cyan-300 font-mono">Build Android APK and Play Store AAB</span> and click <span className="text-neutral-200 font-medium">Run workflow</span>.</li>
                    <li>When complete (~90 seconds), download either:
                      <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-neutral-300">
                        <li><span className="text-cyan-400 font-medium">Reelport-Android-APK</span> (<code className="text-cyan-300 font-mono">app-debug.apk</code>) to install directly on test devices.</li>
                        <li><span className="text-emerald-400 font-medium">Reelport-PlayStore-AAB</span> (<code className="text-emerald-300 font-mono">app-release.aab</code>) to upload to Google Play Console.</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-neutral-800 bg-neutral-950/80">
            <a
              href="/reelport-android-project.zip"
              download="reelport-android-project.zip"
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Android Project (.ZIP)</span>
            </a>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-[11px] text-neutral-500 hidden sm:inline">
                Native Android + Capacitor in <code className="text-neutral-400">/android</code>
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
