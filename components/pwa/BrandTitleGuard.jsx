"use client";

import { useEffect } from "react";

// Terjemahan otomatis browser (mis. Google Translate) bisa mengubah judul tab "Sycle" menjadi "Cycle".
// Judul tidak bisa diberi translate="no" sebagian, jadi nama merek dikembalikan setiap kali judul berubah.
// Isi halaman lain tetap boleh diterjemahkan.
// Hanya posisi merek yang diperbaiki: awal judul ("Sycle — …") dan akhir judul ("… | Sycle"),
// supaya kata "cycle" yang memang hasil terjemahan (mis. "Menstrual Cycle") tidak ikut diubah.
const BRAND = { Cycle: "Sycle", CYCLE: "SYCLE" };

function restoreBrand(title) {
  return title
    .replace(/^(Cycle|CYCLE)(?=\s|$)/, (word) => BRAND[word])
    .replace(/(\|\s*)(Cycle|CYCLE)\s*$/, (_, sep, word) => `${sep}${BRAND[word]}`);
}

export function BrandTitleGuard() {
  useEffect(() => {
    const fixTitle = () => {
      const fixed = restoreBrand(document.title);
      if (fixed !== document.title) document.title = fixed;
    };

    fixTitle();
    const observer = new MutationObserver(fixTitle);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
