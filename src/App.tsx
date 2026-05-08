import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion, 
  Scale, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  RefreshCw,
  Search,
  Gavel,
  Clock,
  MessageSquareQuote
} from "lucide-react";
import { analyzeDocument, type AnalysisResponse } from "./services/geminiService";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await analyzeDocument(inputText);
      setResult(response);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError("Gagal menganalisis dokumen. Pastikan kunci API Gemini sudah terpasang.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const getStatusLabelBg = (status: string) => {
    switch (status) {
      case "AMAN": return "bg-emerald-100 text-emerald-700";
      case "PERINGATAN": return "bg-amber-100 text-amber-700";
      case "BAHAYA": return "bg-rose-100 text-rose-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case "AMAN": return "border-l-emerald-500";
      case "PERINGATAN": return "border-l-amber-500";
      case "BAHAYA": return "border-l-rose-500";
      default: return "border-l-slate-500";
    }
  };

  // Circular progress calculation
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = circumference - ((result?.skor_keamanan || 0) / 100) * circumference;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Top Header Navigation */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-8 border-b border-slate-700 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">L</div>
          <h1 className="text-xl font-bold tracking-tight">LEX<span className="text-blue-400">SHIELD</span></h1>
          <span className="ml-4 px-3 py-1 bg-slate-800 rounded-full text-[10px] text-slate-400 font-mono tracking-widest uppercase hidden sm:inline-block border border-slate-700">
            SYSTEM ID: ID-2941-KONTRAK
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-2 items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Analyst Mode: Senior Corporate</span>
          </div>
          <button 
            onClick={() => { setInputText(""); setResult(null); }}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold uppercase tracking-wider rounded transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            New Analysis
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden">
        {!result ? (
          <div className="h-full flex items-center justify-center p-8 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-3xl space-y-8 py-12"
            >
              <div className="text-center space-y-3">
                <h2 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Pelindung Praktik Hukum Anda</h2>
                <p className="text-slate-500 text-lg">Menganalisis draf kontrak secara instan dengan kecerdasan LexShield AI.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Input Dokumen Perjanjian</h2>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  </div>
                </div>
                <div className="p-8">
                  <textarea
                    autoFocus
                    className="w-full h-80 p-6 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none resize-none text-slate-700 leading-relaxed font-medium placeholder:text-slate-300"
                    placeholder="Tempelkan isi kontrak (Sewa, Kerja, Pinjaman, dsb) di sini..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  
                  <div className="mt-8 flex flex-col sm:flex-row gap-6 items-center justify-between">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[3]" />
                        KUHPerdata
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[3]" />
                        UU Cipta Kerja
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[3]" />
                        OJK Rules
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[3]" />
                        UU ITE
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !inputText.trim()}
                      className={cn(
                        "px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95",
                        isAnalyzing || !inputText.trim() 
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                          : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-slate-400/20"
                      )}
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                      )}
                      {isAnalyzing ? "Menganalisis..." : "Mulai Analisis Hukum"}
                    </button>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-md">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                  <p className="text-sm font-bold uppercase tracking-wide">{error}</p>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="h-full grid grid-cols-12 gap-0 overflow-hidden">
            {/* Left Panel: Summary & Metrics */}
            <section className="col-span-12 lg:col-span-4 bg-white border-r border-slate-200 p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-12"
                >
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 text-center lg:text-left">
                    Security Assessment
                  </h2>
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                      <motion.circle 
                        cx="96" cy="96" r="88" 
                        stroke="currentColor" 
                        strokeWidth="12" 
                        fill="transparent" 
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: scoreOffset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={getScoreColorClass(result.skor_keamanan)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-slate-800 leading-none">{result.skor_keamanan}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Risk Score</span>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:opacity-10 transition-opacity">
                      <FileText className="w-24 h-24 text-blue-900" />
                    </div>
                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Executive Summary
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                      "{result.ringkasan_singkat}"
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="block text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Pasal Temuan</span>
                      <span className="text-2xl font-black text-slate-800">{result.analisis_pasal.length}</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="block text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Draf Status</span>
                      <span className="text-xs font-black text-emerald-600 uppercase">Generated</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {["KUHPerdata", "UU ITE", "UU CIpta Kerja", "POJK"].map((law) => (
                    <span key={law} className="px-2 py-1 bg-slate-100 text-slate-400 rounded text-[9px] font-bold uppercase tracking-wider border border-slate-200">
                      {law}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-mono italic">
                  *Disclaimer: Analisis ini bersifat informatif berdasar AI dan bukan merupakan nasihat hukum resmi.
                </p>
              </div>
            </section>

            {/* Right Panel: Clause Analysis List */}
            <section className="col-span-12 lg:col-span-8 p-8 bg-slate-50 flex flex-col overflow-hidden">
              <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 font-serif lowercase italic underline decoration-blue-500 underline-offset-8">
                    critical clauses.
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Menampilkan {result.analisis_pasal.length} temuan analisis</p>
                </div>
                <button 
                  onClick={() => setResult(null)}
                  className="text-xs font-bold uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Re-analyze
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-4">
                {result.analisis_pasal.map((pasal, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "group bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300",
                      getStatusBorder(pasal.status)
                    )}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-widest",
                            getStatusLabelBg(pasal.status)
                          )}>
                            {pasal.status}
                          </span>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{pasal.bagian_kontrak}</h4>
                        </div>
                        <div className="bg-slate-50 px-2 py-1 rounded text-[10px] font-mono text-slate-400 italic font-bold">
                          REF: PASAL HUKUM RI
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        <div className="md:col-span-8 space-y-4">
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {pasal.analisis_dan_referensi}
                          </p>
                          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex gap-3">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Dampak Jangka Panjang</span>
                              <p className="text-xs text-slate-600 italic leading-relaxed">{pasal.dampak_jangka_panjang}</p>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-4 bg-slate-900 rounded-xl p-5 text-white shadow-inner relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/5 rounded-full blur-xl"></div>
                          <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Gavel className="w-3 h-3" />
                            Rekomendasi
                          </h5>
                          <p className="text-xs font-bold leading-relaxed">
                            {pasal.rekomendasi_aksi}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Negotiation Footer (Only visible when result exists) */}
      <AnimatePresence>
        {result && (
          <motion.footer 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="h-28 bg-white border-t border-slate-200 p-6 flex gap-8 items-center shrink-0 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]"
          >
            <div className="flex-1 flex flex-col overflow-hidden max-w-4xl">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                Draf Negosiasi (Auto-Generated)
              </span>
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 italic leading-relaxed overflow-hidden whitespace-nowrap text-ellipsis relative font-medium">
                "{result.draf_negosiasi}"
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent"></div>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-52 shrink-0">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result.draf_negosiasi);
                  alert("Draf negosiasi disalin!");
                }}
                className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin Pesan
              </button>
              <button 
                className="w-full py-2 border-2 border-slate-200 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all font-sans"
                onClick={() => alert(result.draf_negosiasi)}
              >
                View Full Message
              </button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}

