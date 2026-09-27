import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  Camera,
  CameraOff,
  RefreshCw,
  Zap,
  QrCode,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  SwitchCamera,
  Power,
} from 'lucide-react';
import type { UsherProfile, SundayService } from '../types';
import { playScanChime } from '../utils/feedback';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeService: SundayService;
  profiles: UsherProfile[];
  onRecordAttendance: (qrIdentifier: string) => {
    success: boolean;
    member?: UsherProfile;
    isDuplicate?: boolean;
    message: string;
  };
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  activeService,
  profiles,
  onRecordAttendance,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySecondsLeft, setVerifySecondsLeft] = useState(3);
  const [pendingQrCode, setPendingQrCode] = useState<string | null>(null);
  const [pendingMember, setPendingMember] = useState<UsherProfile | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [lastScanResult, setLastScanResult] = useState<{
    member: UsherProfile;
    isDuplicate: boolean;
    message: string;
    timestamp: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const activeTracksRef = useRef<MediaStreamTrack[]>([]);
  const isLockedRef = useRef(false);
  const verifyTimeoutRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const killAllCameraTracks = () => {
    // 1. Stop all tracks stored in activeTracksRef
    if (activeTracksRef.current && activeTracksRef.current.length > 0) {
      activeTracksRef.current.forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
      activeTracksRef.current = [];
    }

    // 2. Stop any active video elements across the entire document
    try {
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach((v) => {
        const stream = (v as HTMLVideoElement).srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch (_) {}
          });
          (v as HTMLVideoElement).srcObject = null;
        }
      });
    } catch (_) {}
  };

  const stopScannerInstance = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.warn('Html5Qrcode stop error:', e);
      }
      try {
        await scannerRef.current.clear();
      } catch (_) {}
      scannerRef.current = null;
    }
    killAllCameraTracks();
  };

  useEffect(() => {
    if (isOpen) {
      isLockedRef.current = false;
      setIsVerifying(false);
      setLastScanResult(null);
      setIsCameraActive(true);
      // Small delay to ensure #qr-reader DOM element is fully mounted
      const timer = setTimeout(() => {
        startCamera(facingMode);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      stopScannerInstance();
      clearVerificationTimers();
      setIsVerifying(false);
      setLastScanResult(null);
      isLockedRef.current = false;
    }
    return () => {
      stopScannerInstance();
      clearVerificationTimers();
    };
  }, [isOpen]);

  const clearVerificationTimers = () => {
    if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const startCamera = async (modeToUse = facingMode) => {
    setCameraError(null);
    try {
      await stopScannerInstance();

      const container = document.getElementById('qr-reader');
      if (!container) return;

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: modeToUse },
        {
          fps: 10,
          qrbox: { width: 170, height: 170 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScannedData(decodedText);
        },
        (_) => {}
      );

      // Track all newly created video streams so we can kill them instantly when turned off
      const videoEl = document.querySelector('#qr-reader video') as HTMLVideoElement;
      if (videoEl && videoEl.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        activeTracksRef.current = stream.getTracks();
      }

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(err?.message || 'Camera inactive or permission denied');
      setIsCameraActive(false);
    }
  };

  const handleToggleCameraPower = async () => {
    if (isCameraActive) {
      await stopScannerInstance();
      setIsCameraActive(false);
    } else {
      await startCamera(facingMode);
    }
  };

  const handleFlipCamera = async () => {
    const nextMode: 'environment' | 'user' = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      await startCamera(nextMode);
    }
  };

  const handleClose = async () => {
    await stopScannerInstance();
    setIsCameraActive(false);
    onClose();
  };

  const handleScannedData = (qrIdentifier: string) => {
    const cleanCode = qrIdentifier.trim();
    if (!cleanCode) return;

    // Strict Lock: Prevent multiple scans when QR code is in camera view
    if (isLockedRef.current) return;
    isLockedRef.current = true;

    const matched = profiles.find(
      (p) => p.qr_identifier.toLowerCase() === cleanCode.toLowerCase()
    ) || null;

    setPendingMember(matched);
    setPendingQrCode(cleanCode);
    setIsVerifying(true);
    setVerifySecondsLeft(3);
    setLastScanResult(null);

    clearVerificationTimers();

    // 1-second countdown ticker
    let seconds = 3;
    countdownIntervalRef.current = setInterval(() => {
      seconds -= 1;
      if (seconds >= 1) {
        setVerifySecondsLeft(seconds);
      } else {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    // Complete exactly after 3.0 seconds
    verifyTimeoutRef.current = setTimeout(() => {
      finishVerification(cleanCode);
    }, 3000);
  };

  const finishVerification = (qrCode: string) => {
    clearVerificationTimers();
    setIsVerifying(false);
    const result = onRecordAttendance(qrCode);

    if (result.member) {
      if (!result.isDuplicate) {
        playScanChime('success');
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0f172a', '#10b981', '#3b82f6'],
        });
      } else {
        playScanChime('warning');
      }

      setLastScanResult({
        member: result.member,
        isDuplicate: !!result.isDuplicate,
        message: result.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } else {
      playScanChime('error');
      alert(result.message);
      isLockedRef.current = false;
    }
  };

  // Reset to allow scanning the next QR
  const handleScanNext = () => {
    clearVerificationTimers();
    setLastScanResult(null);
    setIsVerifying(false);
    setPendingQrCode(null);
    setPendingMember(null);
    isLockedRef.current = false;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || isLockedRef.current) return;
    handleScannedData(manualCode.trim());
    setManualCode('');
  };

  const RADIUS = 32;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sunday QR Check-in</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  TODAY
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[280px]">{activeService.service_title}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Light Mode Camera Viewfinder Box */}
          <div className="bg-slate-50 rounded-xl p-3.5 flex flex-col items-center justify-center text-center relative border border-slate-200">
            <div className="w-52 h-52 relative flex items-center justify-center overflow-hidden rounded-lg bg-white border border-slate-300 shadow-2xs">
              <div id="qr-reader" className="w-full h-full flex items-center justify-center" />

              {/* Camera Turned Off Screen */}
              {!isCameraActive && !isVerifying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-100/98 text-slate-700 z-10">
                  <CameraOff className="h-7 w-7 text-slate-400 mb-1.5" />
                  <p className="text-xs font-bold text-slate-800">Camera is Off</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 max-w-[160px]">
                    Turn camera on to scan QR codes or use manual simulation below
                  </p>
                  <button
                    onClick={handleToggleCameraPower}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>Turn On Camera</span>
                  </button>
                </div>
              )}

              {/* 3-Second Keyframe Animated Radial Verification Overlay */}
              {isVerifying && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center animate-in fade-in duration-150 z-20 overflow-hidden">
                  {/* Laser Scan Sweep Effect */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-slate-900 to-transparent anim-laser pointer-events-none" />

                  {/* Radial Ring with smooth CSS keyframe fill */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 76 76">
                      {/* Track Ring */}
                      <circle
                        cx="38"
                        cy="38"
                        r={RADIUS}
                        stroke="#e2e8f0"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      {/* Animated Continuous Progress Ring */}
                      <circle
                        cx="38"
                        cy="38"
                        r={RADIUS}
                        stroke="#0f172a"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="transparent"
                        className="anim-fill-ring"
                      />
                    </svg>

                    {/* Centered Avatar / Icon with gentle pulse */}
                    <div className="absolute inset-0 flex items-center justify-center anim-pulse-glow rounded-full">
                      {pendingMember ? (
                        <img
                          src={pendingMember.avatar_url}
                          alt={pendingMember.full_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <ShieldCheck className="h-6 w-6 text-slate-700" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification Status & Countdown */}
                  <p className="text-xs font-bold text-slate-900 mt-2.5">
                    {pendingMember ? `Verifying ${pendingMember.full_name.split(' ')[0]}...` : 'Authenticating Usher...'}
                  </p>
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {pendingQrCode}
                    </span>
                    <span className="text-[10px] font-bold text-slate-900 bg-slate-200/90 px-1.5 py-0.5 rounded">
                      {verifySecondsLeft}s
                    </span>
                  </div>
                </div>
              )}

              {/* Camera Error State */}
              {cameraError && isCameraActive && !isVerifying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-50/98 text-slate-800 z-10">
                  <Camera className="h-6 w-6 text-slate-400 mb-1.5" />
                  <p className="text-xs font-semibold text-slate-800">Camera Inactive</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 max-w-[170px]">{cameraError}</p>
                  <button
                    onClick={() => startCamera(facingMode)}
                    className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-[11px] text-slate-700 font-medium rounded-md border border-slate-200 shadow-2xs transition cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                </div>
              )}
            </div>

            {/* Quick Camera Action Controls: Flip Camera & Power Toggle */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleFlipCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs transition cursor-pointer"
                title="Switch between front and back camera"
              >
                <SwitchCamera className="h-3.5 w-3.5 text-slate-600" />
                <span>Flip ({facingMode === 'environment' ? 'Back' : 'Front'})</span>
              </button>

              <button
                type="button"
                onClick={handleToggleCameraPower}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium shadow-2xs transition cursor-pointer ${
                  isCameraActive
                    ? 'bg-white hover:bg-rose-50 border-slate-200 text-slate-700 hover:text-rose-700'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                }`}
                title={isCameraActive ? 'Turn camera off to save power' : 'Turn camera on to scan'}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="h-3.5 w-3.5 text-rose-500" />
                    <span>Turn Off</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Turn On</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              {isLockedRef.current ? 'Scan locked to prevent duplicates' : 'Align the Usher QR code within the square'}
            </p>
          </div>

          {/* Instant Verification Result Card */}
          {lastScanResult && (
            <div
              className={`p-3.5 rounded-xl border transition animate-in fade-in zoom-in duration-150 ${
                lastScanResult.isDuplicate
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={lastScanResult.member.avatar_url}
                  alt={lastScanResult.member.full_name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        lastScanResult.isDuplicate
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      {lastScanResult.isDuplicate ? 'Already Checked-in' : 'Present ✓'}
                    </span>
                    <span className="text-[10px] text-slate-500">{lastScanResult.timestamp}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {lastScanResult.member.full_name}
                  </h3>
                  <p className="text-[11px] text-slate-600 truncate">
                    {lastScanResult.member.team_name} •{' '}
                    <span className="capitalize">{lastScanResult.member.role.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>

              {/* Ready to scan next button */}
              <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between">
                <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Verified successfully
                </span>
                <button
                  onClick={handleScanNext}
                  className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <span>Scan Next Usher</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* One-Click Simulator Buttons */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-slate-900" />
                <span>Simulate Badge Scan</span>
              </div>
              <span className="text-[10px] text-slate-400">Triggers 3s verification</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  disabled={isVerifying}
                  onClick={() => handleScannedData(p.qr_identifier)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left border text-xs font-medium transition cursor-pointer bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/60 text-slate-800 shadow-2xs active:scale-98 ${
                    isVerifying ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <img src={p.avatar_url} alt={p.full_name} className="w-5 h-5 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-slate-900 leading-tight">
                      {p.full_name.split(' ')[0]}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">{p.team_name.split(' ')[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Code */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              disabled={isVerifying}
              placeholder="Or enter identifier (e.g. USHER-RM-004-DAVID)..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
