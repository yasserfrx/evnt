import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, QrCode, AlertCircle, Loader2 } from 'lucide-react';

export default function Scanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // We'll initialize the scanner instance when needed to be safer
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner on unmount", err));
      }
    };
  }, []);

  const handleScan = async () => {
    if (isScanning || isInitializing) {
      console.log("Scanner already scanning or initializing");
      return;
    }

    console.log("Starting scan process...");
    try {
      const element = document.getElementById('reader');
      if (!element) {
        throw new Error("L'élément 'reader' est introuvable dans le DOM.");
      }

      // Re-initialize if needed
      if (!scannerRef.current) {
        console.log("Initializing new Html5Qrcode instance");
        scannerRef.current = new Html5Qrcode('reader');
      }

      setError(null);
      setIsInitializing(true);

      console.log("Calling scanner.start()...");
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        async (decodedText) => {
          console.log("QR Code detected:", decodedText);
          let guestId = decodedText;
          if (decodedText.includes('/')) {
            const parts = decodedText.split('/');
            guestId = parts[parts.length - 1];
          }
          
          if (scannerRef.current && scannerRef.current.isScanning) {
            try {
              console.log("Stopping scanner...");
              await scannerRef.current.stop();
              setIsScanning(false);
              console.log("Navigating to guest page...");
              navigate(`/staff/check-guest/${guestId}`);
            } catch (stopErr) {
              console.error("Error stopping scanner:", stopErr);
              setIsScanning(false);
              navigate(`/staff/check-guest/${guestId}`);
            }
          }
        },
        (errorMessage) => {
          // This is normal, called when no QR is in frame
        }
      );
      
      console.log("Scanner started successfully");
      setIsScanning(true);
    } catch (err: any) {
      console.error("CRITICAL SCANNER ERROR:", err);
      let message = "Erreur : ";
      if (err && typeof err === 'object') {
        if (err.name === 'NotAllowedError') {
          message += "Accès caméra refusé. Vérifiez les permissions de votre navigateur.";
        } else if (err.name === 'NotFoundError') {
          message += "Caméra introuvable.";
        } else {
          message += err.message || JSON.stringify(err);
        }
      } else {
        message += String(err);
      }
      setError(message);
      setIsScanning(false);
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
            <p className="text-slate-500 text-sm mb-6">Placez le QR code devant la caméra</p>
            
            <div className="relative">
              {/* The reader element must always be present in the DOM for Html5Qrcode to find it */}
              <div 
                id="reader" 
                className={`overflow-hidden rounded-xl border-2 ${isScanning ? 'border-indigo-500' : 'border-dashed border-slate-200'} min-h-[250px] bg-slate-100 flex items-center justify-center`}
              >
                {!isScanning && !isInitializing && (
                  <button
                    onClick={() => handleScan && handleScan()}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-indigo-700 active:bg-indigo-800"
                  >
                    Lancer le Scanner
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
                    <h3 className="text-red-800 font-bold text-sm uppercase">Erreur</h3>
                    <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 text-slate-400">
          <Camera className="w-5 h-5" />
          <span className="text-sm">Caméra arrière requise</span>
        </div>
      </main>
    </div>
  );
}
