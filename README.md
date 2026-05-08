⚖️ LexShield: Tameng Hukum Digital Rakyat
Built for #JuaraVibeCoding Hackathon by Google Cloud & DeepMind

📌 Latar Belakang Masalah
Ketimpangan informasi hukum (information asymmetry) sering dimanfaatkan oleh pihak yang lebih kuat. Mahasiswa terjebak kontrak magang sepihak, pekerja lepas (freelancer) tertipu pasal karet, dan UMKM dirugikan oleh perjanjian sewa yang manipulatif. Orang awam tidak memiliki akses cepat ke konsultan hukum untuk membedah dokumen ini.

💡 Solusi: LexShield
LexShield adalah asisten hukum berbasis AI yang berfungsi sebagai "Tameng Hukum Digital". Hanya dengan mengunggah draf kontrak atau syarat ketentuan (T&C), aplikasi ini akan melakukan audit instan untuk mendeteksi pasal jebakan, menganalisis risiko jangka panjang, dan memberikan referensi hukum Indonesia (KUHPerdata, POJK, dll) secara akurat.

✨ Fitur Utama:
Manipulative Language Detector: Mendeteksi kalimat pasif atau frasa ambigu (misal: "pelepasan hak gugat").

Time-Travel Risk Analysis: Memprediksi dampak jangka pendek (biaya tersembunyi/denda harian) dan jangka panjang (inflasi/eskalasi sewa).

Legal Grounding: Setiap peringatan dilengkapi dengan landasan referensi hukum yang berlaku di Indonesia.

Auto-Drafter Negotiation: Membuat draf pesan profesional untuk menuntut revisi pasal yang merugikan.

🛠️ Tech Stack
AI Model: Google Gemini 1.5 Pro (via Google AI Studio)

Frontend: React + Vite + Tailwind CSS

Deployment: Google Cloud Run (Serverless)

---

🚀 Run Locally (AI Studio Setup)
This contains everything you need to run your app locally.
View the app logic in AI Studio: LexShield VibeCoding App

Prerequisites: Node.js (v18+)

Install dependencies:

Bash
npm install
Set your environment variables:
Create a .env file in the root directory and add your Gemini API Key:

Cuplikan kode
VITE_GEMINI_API_KEY="VITE_GEMINI_API_KEY"

APP_URL="https://lexshield-app-473068843669.asia-southeast2.run.app"
Run the development server:

Bash
npm run dev