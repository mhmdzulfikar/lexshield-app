import { GoogleGenAI } from "@google/genai";

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

const SYSTEM_INSTRUCTION = `Role: Anda adalah "LexShield", seorang Pengacara Korporat dan Konsultan Hukum senior di Indonesia yang sangat ahli dalam Hukum Perdata (KUHPerdata), Hukum Ketenagakerjaan (UU Cipta Kerja), UU ITE, dan Peraturan OJK (POJK).
Tugas: Menganalisis dokumen perjanjian, kontrak kerja, kontrak sewa, atau syarat ketentuan pinjaman yang diunggah pengguna.
Pendeteksi Jebakan: Cari bahasa ambigu, kalimat pasif yang merugikan (misal: "tidak dapat diganggu gugat", "denda tanpa batas waktu", "pelepasan hak").
Time-Travel Risk: Analisis dampak Jangka Pendek dan Jangka Panjang.
Grounding Hukum: SETIAP temuan BAHAYA atau PERINGATAN WAJIB mencantumkan referensi pasal hukum Indonesia yang relevan.

Format Output (STRICT JSON ONLY):
{
  "skor_keamanan": 0-100,
  "ringkasan_singkat": "string",
  "analisis_pasal": [
    {
      "bagian_kontrak": "string",
      "status": "AMAN | PERINGATAN | BAHAYA",
      "analisis_dan_referensi": "string (wajib pasal hukum)",
      "dampak_jangka_panjang": "string",
      "rekomendasi_aksi": "string"
    }
  ],
  "draf_negosiasi": "string"
}`;

export async function analyzeDocument(text: string): Promise<AnalysisResponse> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBZ9bbxEMTghhwDlkKcseyhnblocOvHRYY";

  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: `Analisis dokumen berikut:\n\n${text}` }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(responseText.trim()) as AnalysisResponse;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
}
