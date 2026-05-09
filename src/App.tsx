import { useState, useRef, useEffect } from "react";
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
  MessageSquareQuote,
  Printer,
  Upload,
  Image as ImageIcon,
  X,
  Send,
  Bot,
  Sparkles,
  Check
} from "lucide-react";
import { analyzeDocument, chatWithLexShield, type AnalysisResponse, type DocumentInput, type ChatMessage } from "./services/geminiService";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("Menganalisis...");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dynamic loading text effect
  useEffect(() => {
    if (!isAnalyzing) return;
    
    const texts = [
      "Membaca dokumen kontrak...",
      "Mencari jebakan hukum yang tersembunyi...",
      "Mencocokkan dengan UU Cipta Kerja & KUHPerdata...",
      "Menyusun strategi negosiasi..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const encoded = reader.result?.toString() || "";
        const base64Str = encoded.split(",")[1];
        resolve(base64Str);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const processedFiles = await Promise.all(
        selectedFiles.map(async (f) => ({
          mimeType: f.type,
          data: await fileToBase64(f)
        }))
      );

      const response = await analyzeDocument({
        text: inputText,
        files: processedFiles
      });
      setResult(response);
      setChatHistory([]); // Reset chat history on new analysis
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setError(`Error: ${err.message || "Terjadi kesalahan yang tidak diketahui."}`);
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !result) return;
    
    const newMessage = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", text: newMessage }]);
    setIsChatting(true);

    try {
      const response = await chatWithLexShield(result, chatHistory, newMessage);
      setChatHistory(prev => [...prev, { role: "model", text: response }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "model", text: "Maaf, terjadi kesalahan jaringan. Coba lagi." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleCopyChat = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderMarkdown = (text: string) => {
    if (!text) return { __html: "" };
    let html = text
      // Escape HTML first
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Headers
      .replace(/^### (.*$)/gim, '<strong class="block mt-2 mb-1 text-slate-800">$1</strong>')
      .replace(/^## (.*$)/gim, '<strong class="block mt-2 mb-1 text-[1.1em] text-slate-900">$1</strong>')
      .replace(/^# (.*$)/gim, '<strong class="block mt-3 mb-2 text-[1.2em] text-black">$1</strong>')
      // Italic (after headers to avoid conflicts)
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');

    return { __html: html };
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
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mr-4">Enterprise Edition</span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mode: Legal Audit</span>
          </div>
          <button 
            onClick={() => { setInputText(""); setSelectedFiles([]); setResult(null); setChatHistory([]); }}
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
              <div className="text-center space-y-3 relative">
                <h2 className="text-4xl font-serif font-bold text-slate-900 tracking-tight flex items-center justify-center gap-3">
                  Pelindung Praktik Hukum Anda
                </h2>
                <p className="text-slate-500 text-lg">Menganalisis draf kontrak secara instan dengan kecerdasan LexShield AI.</p>
                <div className="pt-2">
                  <button 
                    onClick={() => setShowFeatures(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow border border-slate-200 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Apa Saja Fitur LexShield?
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden input-section">
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
                  <div className="relative group">
                    <textarea
                      autoFocus
                      className="w-full h-80 p-6 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none resize-none text-slate-700 leading-relaxed font-medium placeholder:text-slate-300 pb-28"
                      placeholder="Tempelkan isi kontrak di sini, ATAU upload file PDF/Foto Kontrak Anda di bawah..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    
                    {/* Multimodal File Upload Zone */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white border border-slate-200 rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <label className="cursor-pointer flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md border border-blue-200 shadow-sm active:scale-95">
                          <Upload className="w-4 h-4" />
                          Upload PDF / Foto Kontrak
                          <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept=".pdf,image/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                              }
                            }}
                          />
                        </label>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          Gemini Vision Enabled
                        </span>
                      </div>
                      
                      {selectedFiles.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2 pt-2 border-t border-slate-100">
                          {selectedFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded text-[10px] font-bold text-slate-600 border border-slate-200 shadow-sm">
                              {f.type.includes("pdf") ? <FileText className="w-3.5 h-3.5 text-rose-500" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />}
                              <span className="truncate max-w-[120px]">{f.name}</span>
                              <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded p-0.5 transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
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
                      disabled={isAnalyzing || (!inputText.trim() && selectedFiles.length === 0)}
                      className={cn(
                        "px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 max-w-full sm:max-w-sm overflow-hidden",
                        isAnalyzing || (!inputText.trim() && selectedFiles.length === 0) 
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                          : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-slate-400/20"
                      )}
                    >
                      {isAnalyzing ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                      )}
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isAnalyzing ? loadingText : "Mulai Analisis Hukum"}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="truncate"
                        >
                          {isAnalyzing ? loadingText : "Mulai Analisis Hukum"}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5 flex-wrap">
                LexShield AI dapat melakukan kesalahan.
                <button 
                  onClick={() => setShowDisclaimer(true)}
                  className="text-amber-500 hover:text-amber-600 underline underline-offset-2 transition-colors inline-flex items-center gap-1 font-bold"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Lihat Batasan & Disclaimer Hukum
                </button>
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
                      <span className="text-2xl font-black text-slate-800">{result.analisis_pasal?.length || 0}</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center flex flex-col justify-center items-center">
                      <span className="block text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">AI Chat</span>
                      <span className="text-xs font-black text-blue-600 uppercase flex items-center gap-1"><Bot className="w-3 h-3"/> Active</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 relative overflow-hidden group">
                    <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <MessageSquareQuote className="w-4 h-4 text-amber-600" />
                      Draf Email Negosiasi
                    </h3>
                    <div className="bg-white p-3.5 rounded-xl border border-amber-100/50 text-xs text-slate-600 italic leading-relaxed max-h-36 overflow-y-auto mb-3 shadow-inner whitespace-pre-wrap">
                      {result.draf_negosiasi}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(result.draf_negosiasi);
                        // Optional: Could use a toast here instead of alert for better UX, but alert works for now
                        alert("Draf email berhasil disalin!");
                      }}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-md transition-colors flex justify-center items-center gap-2 active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Salin Teks
                    </button>
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
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Menampilkan {result.analisis_pasal?.length || 0} temuan analisis</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => window.print()}
                    className="text-xs font-bold uppercase text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors no-print px-3 py-1.5 bg-slate-200 rounded"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak PDF
                  </button>
                  <button 
                    onClick={() => setResult(null)}
                    className="text-xs font-bold uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors no-print"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Re-analyze
                  </button>
                </div>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-4">
                {(result.analisis_pasal || []).map((pasal, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "clause-card group bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300",
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
                          <div 
                            className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={renderMarkdown(pasal.analisis_dan_referensi)}
                          />
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

              {/* Chat Co-Counsel UI */}
              <div className="mt-6 pt-6 border-t border-slate-200 shrink-0 no-print">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  Tanya LexShield Co-Counsel
                </h3>
                
                {chatHistory.length > 0 && (
                  <div className="bg-white rounded-xl p-4 mb-4 shadow-inner border border-slate-100 h-48 overflow-y-auto space-y-4 text-sm flex flex-col">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={cn("max-w-[85%] rounded-2xl px-4 py-3 relative group", msg.role === "user" ? "bg-slate-900 text-white self-end rounded-br-sm" : "bg-blue-50 text-slate-800 border border-blue-100 self-start rounded-bl-sm")}>
                        <div 
                          className="whitespace-pre-wrap leading-relaxed [&>li]:mt-1" 
                          dangerouslySetInnerHTML={renderMarkdown(msg.text)} 
                        />
                        {msg.role === "model" && (
                          <button
                            onClick={() => handleCopyChat(msg.text, i)}
                            className="absolute -right-10 top-2 p-1.5 bg-white text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            title="Salin Teks"
                          >
                            {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    ))}
                    {isChatting && (
                      <div className="bg-blue-50 text-slate-500 border border-blue-100 self-start rounded-2xl rounded-bl-sm px-4 py-3 text-xs font-bold italic flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Sedang mengetik...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChat()}
                    placeholder="Tanya soal pasal tertentu, minta revisi bahasa, dsb..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                  <button 
                    onClick={handleChat}
                    disabled={isChatting || !chatInput.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors shadow-sm"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowDisclaimer(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Disclaimer & Keterbatasan AI</h3>
                </div>
                <button onClick={() => setShowDisclaimer(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-600 space-y-4 leading-relaxed">
                <p><strong>PENTING:</strong> LexShield adalah AI asisten dan <strong>BUKAN</strong> pengganti nasihat hukum profesional dari Advokat/Konsultan Hukum berlisensi. Harap perhatikan keterbatasan berikut terkait Hukum di Indonesia:</p>
                <ul className="space-y-3 list-none mt-4">
                  <li className="flex gap-3 items-start"><span className="text-amber-500 mt-0.5">⚠️</span> <span><strong>Hukum Dinamis:</strong> AI mungkin tidak selalu <em>up-to-date</em> dengan revisi UU terbaru (seperti putusan MK terbaru atau PP pelaksana UU Cipta Kerja).</span></li>
                  <li className="flex gap-3 items-start"><span className="text-amber-500 mt-0.5">⚠️</span> <span><strong>Syarat Sah Perjanjian:</strong> AI menganalisis teks, namun pengadilan dapat membatalkan kontrak jika syarat objektif (Pasal 1320 KUHPerdata) tidak terpenuhi di dunia nyata.</span></li>
                  <li className="flex gap-3 items-start"><span className="text-amber-500 mt-0.5">⚠️</span> <span><strong>Bahasa Asing:</strong> Kontrak antar entitas Indonesia wajib berbahasa Indonesia (UU 24/2009). AI bisa menganalisis bahasa Inggris, tapi kontrak tersebut berisiko batal demi hukum.</span></li>
                  <li className="flex gap-3 items-start"><span className="text-amber-500 mt-0.5">⚠️</span> <span><strong>Pembuktian Hukum:</strong> AI tidak dapat memverifikasi keabsahan e-Meterai atau Tanda Tangan Elektronik tersertifikasi sesuai UU ITE.</span></li>
                </ul>
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 italic">
                  Selalu konsultasikan keputusan final Anda dengan praktisi hukum yang berkualifikasi. Jangan mengambil keputusan bisnis berskala besar murni 100% dari hasil analisis AI ini.
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <button 
                  onClick={() => setShowDisclaimer(false)}
                  className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Saya Mengerti
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Modal */}
      <AnimatePresence>
        {showFeatures && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowFeatures(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 bg-blue-50/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Fitur Unggulan LexShield</h3>
                </div>
                <button onClick={() => setShowFeatures(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-600 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-blue-700">
                      <ImageIcon className="w-4 h-4" />
                      Multimodal Document Upload
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">Tidak perlu repot <em>copy-paste</em> teks. Cukup unggah file kontrak Anda berformat <strong>PDF</strong> atau <strong>Foto pindaian (JPG/PNG)</strong>. AI LexShield akan membacanya secara otomatis layaknya pengacara sungguhan.</p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-blue-700">
                      <Gavel className="w-4 h-4" />
                      Super-Prompt Hukum RI
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">Keakuratan tinggi. AI dikalibrasi untuk memahami <strong>Pasal 1320 KUHPerdata</strong> (Syarat Sah Perjanjian), <strong>UU Cipta Kerja 2023</strong>, dan <strong>UU Perlindungan Konsumen</strong> (mendeteksi klausul baku/pelepasan tanggung jawab).</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-blue-700">
                      <Bot className="w-4 h-4" />
                      LexShield Co-Counsel Chat
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">Setelah hasil audit keluar, Anda dapat <em>chatting</em> dan bertanya langsung tentang poin-poin yang membingungkan. AI memiliki memori kontekstual yang kuat dari kontrak yang sedang dibedah.</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-blue-700">
                      <Printer className="w-4 h-4" />
                      Zero-Cost PDF Export
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">Klik "Cetak PDF" pada laporan untuk mengekspor <em>Legal Audit Report</em> yang sangat rapi. UI akan menyesuaikan layout A4 secara otomatis via <em>media print hack</em> tanpa biaya server tambahan.</p>
                  </div>
                </div>

              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <button 
                  onClick={() => setShowFeatures(false)}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  Cobain Sekarang
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

