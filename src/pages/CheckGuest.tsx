import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Guest {
  id: string;
  full_name: string;
  checked_in: boolean;
}

export default function CheckGuest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGuest() {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setGuest(data);
      } catch (err: any) {
        console.error('Error fetching guest:', err);
        setError(err.message || 'Invité non trouvé');
      } finally {
        setLoading(false);
      }
    }

    fetchGuest();
  }, [id]);

  const handleCheckIn = async () => {
    if (!id || !guest) return;

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('guests')
        .update({ checked_in: true })
        .eq('id', id);

      if (error) throw error;
      
      setGuest({ ...guest, checked_in: true });
    } catch (err: any) {
      console.error('Error updating guest:', err);
      alert('Erreur lors de la validation: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <XCircle className="w-20 h-20 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Erreur</h1>
        <p className="text-slate-600 mb-8">{error || 'Impossible de charger les données de l\'invité'}</p>
        <button 
          onClick={() => navigate('/staff/scanner')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au scanner
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4">
      <header className="w-full max-w-2xl mx-auto flex items-center mb-8 pt-4">
        <button 
          onClick={() => navigate('/staff/scanner')}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="ml-4 text-xl font-bold text-slate-900">Vérification Invité</h1>
      </header>

      <main className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex-1 flex flex-col"
        >
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="mb-6 relative">
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-indigo-600" />
              </div>
              {guest.checked_in && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-white">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 break-words w-full">
              {guest.full_name}
            </h2>

            <div className="mb-12">
              <span className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-2xl font-bold ${
                guest.checked_in 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {guest.checked_in ? (
                  <>
                    <CheckCircle2 className="w-8 h-8" />
                    DÉJÀ ENTRÉ
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8" />
                    NON ENTRÉ
                  </>
                )}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!guest.checked_in ? (
                <motion.button
                  key="check-in-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleCheckIn}
                  disabled={updating}
                  className="w-full py-10 bg-indigo-600 text-white rounded-2xl text-4xl font-black shadow-indigo-200 shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                >
                  {updating ? (
                    <Loader2 className="w-12 h-12 animate-spin" />
                  ) : (
                    "VALIDER L'ENTRÉE"
                  )}
                </motion.button>
              ) : (
                <motion.div
                  key="success-msg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full py-10 bg-green-500 text-white rounded-2xl text-4xl font-black shadow-green-200 shadow-2xl flex items-center justify-center gap-4"
                >
                  <CheckCircle2 className="w-12 h-12" />
                  ENTRÉE VALIDÉE
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="bg-slate-50 p-6 border-t border-slate-100">
            <button 
              onClick={() => navigate('/staff/scanner')}
              className="w-full py-4 text-slate-500 font-semibold hover:text-slate-800 transition-colors"
            >
              Scanner le prochain invité
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
