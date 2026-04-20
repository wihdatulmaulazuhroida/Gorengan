# Golden Bites — Landing Page

Landing page modern (HTML/CSS/JS) untuk usaha gorengan rumahan.

## Cara menjalankan

### Opsi 1 (paling mudah)
- Buka `index.html` langsung di browser.

### Opsi 2 (disarankan, pakai server lokal)
Di folder `c:\webjualan` jalankan:

```bash
python -m http.server 5173
```

Lalu buka `http://localhost:5173`.

## Fitur utama
- Hero section + CTA “Pesan Sekarang”
- Menu interaktif (card) + tombol “Tambah ke Pesanan”
- Cart sederhana (total item terpilih)
- Tombol sticky “Pesan Sekarang”
- Form pesanan (modal) + redirect WhatsApp dengan pesan otomatis
- Animasi fade-in + efek floating ringan pada gambar
- Mobile-friendly

## Edit menu / harga / WA
- Produk ada di `app.js` pada konstanta `PRODUCTS`
- Nomor WhatsApp ada di `BUSINESS.waNumber`

