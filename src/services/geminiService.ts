import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AnalysisResponse {
  skor_keamanan: number;
  ringkasan_singkat: string;
  analisis_pasal: {
    bagian_kontrak: string;
    status: "AMAN" | "PERINGATAN" | "BAHAYA";
    analisis_dan_referensi: string;
    dampak_jangka_panjang: string;
    rekomendasi_aksi: string;
  }[];
  draf_negosiasi: string;
}

const SYSTEM_INSTRUCTION = `Role: Anda adalah "LexShield"... (Isi instruksi lu tetap sama)`;

export async function analyzeDocument(text: string): Promise<AnalysisResponse> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("API Key tidak ditemukan. Pastikan VITE_GEMINI_API_KEY sudah diset.");
  }

  try {
    // 1. Inisialisasi dengan Class yang benar: GoogleGenerativeAI (Bukan GoogleGenAI)
    const genAI = new GoogleGenerativeAI(API_KEY);

    // 2. Ambil model menggunakan getGenerativeModel
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // 3. Jalankan generateContent dengan struktur config yang benar
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Analisis dokumen berikut:\n\n${text}` }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    // 4. Cara ambil teks di SDK terbaru
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(responseText.trim()) as AnalysisResponse;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
}