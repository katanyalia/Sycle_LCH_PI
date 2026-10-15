// Keputusan K-01: konten kesehatan yang belum disetujui boleh tampil hanya sebagai draf berlabel,
// dan harus bisa dimatikan. Set NEXT_PUBLIC_SHOW_DRAFT_CONTENT=false untuk menyembunyikannya.
export const SHOW_DRAFT_CONTENT = process.env.NEXT_PUBLIC_SHOW_DRAFT_CONTENT !== "false";
