import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

/**
 * PWA Install Prompt Component
 * Shows a smart install banner on Android (Chrome) and instructions for iOS (Safari).
 * Remembers if user dismissed it.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('tapgo_install_dismissed');
    if (dismissed) return;

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.navigator.standalone;
    setIsIOS(ios);

    // iOS: show banner if not already installed
    if (ios && !standalone) {
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    // Android / Chrome: listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowBanner(false);
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('tapgo_install_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="fixed top-0 inset-x-0 z-50 bg-emerald-700 text-white px-4 py-3 shadow-lg flex items-center gap-3 animate-slide-down"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
        <div className="bg-white/20 rounded-xl p-2 shrink-0">
          <Smartphone size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm leading-tight">Install TapGo App</p>
          <p className="text-[11px] text-emerald-100 font-medium">
            {isIOS ? 'Tap Share → Add to Home Screen' : 'Add to your home screen — works offline!'}
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-white text-emerald-700 font-black text-xs px-3 py-1.5 rounded-xl shrink-0 active:scale-95 transition-all"
        >
          {isIOS ? 'How?' : 'Install'}
        </button>
        <button onClick={handleDismiss} className="p-1 text-emerald-200 active:scale-90 shrink-0">
          <X size={18} />
        </button>
      </div>

      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowIOSGuide(false)} />
          <div className="relative bg-white rounded-t-3xl w-full p-6 pb-10 shadow-2xl space-y-4 animate-slide-up">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-2" />
            <h3 className="font-black text-slate-800 text-lg text-center">Add to Home Screen</h3>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Tap the Share button (📤) at the bottom of Safari' },
                { step: '2', text: 'Scroll down and tap "Add to Home Screen"' },
                { step: '3', text: 'Tap "Add" — TapGo will appear on your home screen!' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3 bg-emerald-50 rounded-2xl p-3">
                  <span className="bg-emerald-600 text-white font-black w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">{step}</span>
                  <p className="text-sm font-medium text-slate-700">{text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
