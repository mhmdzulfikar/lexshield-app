#  LexShield: Tameng Hukum Digital Rakyat
**Built for #JuaraVibeCoding Hackathon by Google Cloud & DeepMind**

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini_Vision-orange.svg)](https://aistudio.google.com/)

##  Latar Belakang Masalah
Ketimpangan informasi hukum (*information asymmetry*) sering dimanfaatkan oleh pihak yang lebih kuat. Mahasiswa terjebak kontrak magang sepihak, pekerja lepas (*freelancer*) tertipu pasal karet, dan UMKM dirugikan oleh perjanjian sewa yang manipulatif. Orang awam tidak memiliki akses cepat ke konsultan hukum untuk membedah dokumen ini.

##  Solusi: LexShield
LexShield adalah asisten hukum berbasis AI yang berfungsi sebagai "Tameng Hukum Digital". Hanya dengan mengunggah draf kontrak (Teks, Foto, atau PDF), aplikasi ini akan melakukan audit instan untuk mendeteksi pasal jebakan, menganalisis risiko, dan memberikan referensi hukum Indonesia (KUHPerdata, UU Ciptaker, POJK, dll) secara akurat.

##  Fitur "Killer" Hackathon:
- **Multimodal AI (Gemini Vision)**: Tidak perlu capek *copy-paste*. Anda bisa langsung *Drag & Drop* foto kontrak (JPG/PNG) atau pindaian PDF. AI akan membacanya layaknya pengacara manusia!
- **Super-Prompt Hukum Indonesia**: AI dikalibrasi khusus untuk kelemahan hukum RI. Mampu memvalidasi **Syarat Sah Perjanjian (Ps. 1320 KUHPerdata)**, mendeteksi **Klausul Baku (UU PK)**, dan merujuk mutlak pada **UU Cipta Kerja 2023** (anti-halusinasi pasal usang).
- **Auto-Drafter Negotiation**: Otomatis menyusun draf pesan profesional untuk menuntut revisi pasal merugikan ke pihak HRD/Partner.
- **Zero-Cost PDF Report Generator**: Men-generate laporan audit hukum resmi berformat PDF langsung dari *browser* menggunakan trik CSS `@media print`, siap dicetak untuk klien!
- **Zero-Billing Architecture**: Murni menggunakan Google AI Studio API yang 100% gratis (*Free Tier* besar), tanpa takut tagihan bocor di Google Cloud Platform (GCP).

##  Tech Stack
- **AI Model:** Google Gemini (via `@google/genai` AI Studio)
- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **UI/UX:** Framer Motion (Micro-animations) + Lucide Icons

---

##  Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Buat file `.env` di *root directory* dan masukkan API Key AI Studio:
   ```env
   VITE_GEMINI_API_KEY="AIzaSy...your-key-here"
   ```
3. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

> ** Disclaimer:** LexShield adalah teknologi eksperimental. Jangan mengambil keputusan bisnis/hukum berskala besar murni 100% dari hasil analisis AI ini tanpa didampingi advokat profesional.