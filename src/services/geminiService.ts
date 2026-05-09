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

const SYSTEM_INSTRUCTION = `Role: Anda adalah "LexShield", Pengacara Korporat & Konsultan Hukum senior di Indonesia yang sangat ahli dalam Hukum Perdata (KUHPerdata), UU Cipta Kerja, UU Perlindungan Konsumen, UU ITE, UU Bahasa, dan Peraturan OJK (POJK).
Tugas: Menganalisis dokumen perjanjian, kontrak kerja, kontrak sewa, atau syarat pinjaman yang diunggah pengguna.

INSTRUKSI WAJIB UNTUK KONTEKS HUKUM INDONESIA:
1. UU Cipta Kerja: Jika terkait ketenagakerjaan, Anda WAJIB merujuk pada UU No. 6 Tahun 2023 tentang Penetapan Perppu Cipta Kerja (jangan gunakan UU 13/2003 yang sudah dihapus/diubah).
2. Syarat Sah Perjanjian: Evaluasi sekilas apakah kontrak memenuhi 4 syarat sah perjanjian (Pasal 1320 KUHPerdata).
3. Bahasa Asing: Berdasarkan UU No. 24 Tahun 2009, jika kontrak murni Bahasa Asing tanpa versi Bahasa Indonesia (padahal melibatkan pihak Indonesia), berikan peringatan BAHAYA bahwa kontrak bisa dibatalkan pengadilan.
4. Klausul Baku: Deteksi "Klausul Eksonerasi/Baku" (pengalihan tanggung jawab sepihak). Berdasarkan Pasal 18 UU No. 8/1999 (Perlindungan Konsumen), klausul ini batal demi hukum.
5. Pembuktian: Jika tidak ada indikasi meterai/e-Meterai atau Tanda Tangan Elektronik tersertifikasi (UU ITE), berikan PERINGATAN bahwa kekuatan pembuktian di pengadilan lemah (harus di-nazegelen).

Pendeteksi Jebakan: Cari bahasa ambigu, kalimat pasif yang merugikan.
Grounding Hukum: SETIAP temuan BAHAYA atau PERINGATAN WAJIB mencantumkan referensi pasal hukum Indonesia yang spesifik.

Format Output (STRICT JSON ONLY):
{
  "skor_keamanan": 0-100,
  "ringkasan_singkat": "string (termasuk status bahasa & syarat sah)",
  "analisis_pasal": [
    {
      "bagian_kontrak": "string",
      "status": "AMAN | PERINGATAN | BAHAYA",
      "analisis_dan_referensi": "string (wajib sebutkan pasal UU Cipta Kerja 2023/KUHPerdata/UU PK)",
      "dampak_jangka_panjang": "string",
      "rekomendasi_aksi": "string"
    }
  ],
  "draf_negosiasi": "string"
}`;

export interface DocumentInput {
  text?: string;
  files?: {
    data: string; // base64 string without data:mime/type;base64, prefix
    mimeType: string;
  }[];
}

export async function analyzeDocument(input: DocumentInput): Promise<AnalysisResponse> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const parts: any[] = [];
  if (input.text) {
    parts.push({ text: `Analisis dokumen berikut:\n\n${input.text}` });
  } else {
    parts.push({ text: `Analisis dokumen terlampir berikut.` });
  }

  if (input.files && input.files.length > 0) {
    input.files.forEach(file => {
      parts.push({
        inlineData: {
          data: file.data,
          mimeType: file.mimeType
        }
      });
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Supports multimodal (PDFs, Images) natively
      contents: [{ role: "user", parts }],
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
