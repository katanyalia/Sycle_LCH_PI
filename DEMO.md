# Menjalankan SYCLE untuk Demo (branch `demo-gabungan`)

Isi branch ini:
- Tampilan baru + Health Tracker + Assessment (dari `sycle-v2-clean`, Revina)
- Tanya SYCLE dengan RAG hybrid BM25 + vektor (folder `backend/`, Ita)
- PWA (service worker, manifest, halaman offline) dan migration/tes RLS Supabase (dari `main`)
- Script ingestion RAG di folder `pipeline/` (dari `feature/rag-document-pipeline`)

## 1. Frontend (Terminal 1)
```bash
cp .env.example .env.local   # lalu isi kuncinya (atau salin .env.local lama)
npm install
npm run dev                  # buka http://localhost:3000
```

## 2. Backend Tanya SYCLE (Terminal 2)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env         # isi SUPABASE_URL, SUPABASE_SECRET_KEY, GEMINI_API_KEY, GEMINI_MODEL
cd src
uvicorn api:app --port 8000
```
Frontend memanggil backend lewat `/api/tanya-sycle` → `FASTAPI_BASE_URL` (default `http://127.0.0.1:8000`).
Kalau backend belum jalan, chat menampilkan "Layanan chatbot belum dapat dihubungi."

## Catatan
- Mode offline PWA hanya aktif di build production (`npm run build && npm start`), tidak di `npm run dev`.
- Belum dipindahkan dari `main`: unduh PDF Riwayat, hapus akun, aturan Personalisasi lama, dan tes Jest.
- Jangan commit `.env.local` atau `backend/.env`.
