import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, QrCode, AlertCircle, Play, Loader2 } from 'lucide-react';

export default function Scanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Initialize the scanner instance but don't start it yet
    scannerRef.current = new Html5Qrcode('reader');

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner on unmount", err));
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    setError(null);
    setIsInitializing(true);

    try {
      await scannerRef.current.start(
        { facingMode: "environment" }, // Force back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // Success callback
          let guestId = decodedText;
          if (decodedText.includes('/')) {
            const parts = decodedText.split('/');
            guestId = parts[parts.length - 1];
          }
          
          if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
              navigate(`/staff/check-guest/${guestId}`);
            }).catch(err => {
              console.error("Failed to stop scanner after success", err);
              navigate(`/staff/check-guest/${guestId}`);
            });
          }
        },
        (errorMessage) => {
          // This is called for every frame where no QR code is found
          // We don't want to show this as an error to the user
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      // Detailed error message for the user
      let message = "Erreur caméra : ";
      if (err.name === 'NotAllowedError') {
        message += "Accès refusé. Veuillez autoriser la caméra dans les réglages de votre navigateur.";
      } else if (err.name === 'NotFoundError') {
        message += "Aucune caméra trouvée sur cet appareil.";
      } else if (err.name === 'NotReadableError') {
        message += "La caméra est déjà utilisée par une autre application.";
      } else {
        message += err.message || "Une erreur inconnue est survenue.";
      }
      setError(message);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
      <header className="w-full max-w-md flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <QrCode className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Scanner Staff</h1>
        </div>
      </header>

      <main className="w-full max-w-md flex flex-col items-center">
        <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 text-center">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Scanner un QR Code</h2>
            <p className="text-slate-500 text-sm mb-6">Placez le QR code de l'invité devant la caméra</p>
            
            <div className="relative">
              <div 
                id="reader" 
                className={`overflow-hidden rounded-xl border-2 ${isScanning ? 'border-indigo-500' : 'border-dashed border-slate-200'} min-h-[250px] bg-slate-100 flex items-center justify-center`}
              >
                {!isScanning && !isInitializing && (
                  <button
                    onClick={startScanner}
                    className="flex flex-col items-center gap-3 p-8 group transition-transform active:scale-95"
                  >
                    <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
                      <Play className="text-white w-10 h-10 ml-1" />
                    </div>
                    <span className="text-indigo-600 font-bold text-xl uppercase tracking-wider">Lancer le Scanner</span>
                  </button>
                )}
                
                {isInitializing && (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <span className="text-slate-500 font-medium">Initialisation...</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-left">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-red-800 font-bold text-sm uppercase">Problème détecté</h3>
                    <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 text-slate-400">
          <Camera className="w-5 h-5" />
          <span className="text-sm">Accès caméra requis (Caméra arrière forcée)</span>
        </div>
      </main>
    </div>
  );
}
