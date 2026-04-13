import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, QrCode } from 'lucide-react';

export default function Scanner() {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // Assuming the QR code contains just the ID or a URL with the ID
        // If it's a URL, we might need to extract the ID
        let guestId = decodedText;
        if (decodedText.includes('/')) {
          const parts = decodedText.split('/');
          guestId = parts[parts.length - 1];
        }
        
        scanner.clear().then(() => {
          navigate(`/staff/check-guest/${guestId}`);
        }).catch(err => {
          console.error("Failed to clear scanner", err);
          navigate(`/staff/check-guest/${guestId}`);
        });
      },
      (error) => {
        // console.warn(error);
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
      }
    };
  }, [navigate]);

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
            
            <div id="reader" className="overflow-hidden rounded-xl border-2 border-dashed border-slate-200"></div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 text-slate-400">
          <Camera className="w-5 h-5" />
          <span className="text-sm">Accès caméra requis</span>
        </div>
      </main>
    </div>
  );
}
