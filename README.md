# Dashboard PHIMart

Dashboard PHIMart adalah aplikasi dashboard visualisasi data penjualan produk PHIMart berbasis web dengan tampilan modern dan minimalis.

## Fitur
- Visualisasi tren penjualan bulanan
- Pie chart distribusi kategori produk
- Bar chart produk terlaris dan pendapatan tertinggi
- Boxplot penjualan per cluster
- Scatter plot hubungan penjualan dan pendapatan
- Statistik total penjualan, jumlah produk, kategori dominan, dan jumlah transaksi
- Mode terang/gelap (light/dark mode)

## Struktur Folder
```
public/
  index.html        # Halaman utama dashboard
  style.css         # Style dan layout dashboard
  chart.js          # Script visualisasi Chart.js dan logika dashboard

data/
  data_phimart.csv      # Data penjualan produk
  cluster_phimart.csv   # Data cluster produk

server.js           # Server Express untuk API data
package.json        # Konfigurasi project dan dependensi
```

## Cara Menjalankan
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Jalankan server**
   ```bash
   npm start
   ```
3. **Akses dashboard**
   Buka browser ke [http://localhost:3999](http://localhost:3999)

## Teknologi
- Node.js + Express (backend/API)
- Chart.js (visualisasi chart)
- HTML, CSS, JavaScript (frontend)

## Kustomisasi
- Data dapat diubah pada file CSV di folder `data/`
- Tampilan dan layout dapat diubah pada file `style.css` dan `index.html`

## Author
Anas Wicaksono

## Visit Dashboard 
https://nasswcksn.github.io/dashboard_phimart/

---
Dashboard ini dibuat untuk kebutuhan tugas Data Warehouse PHIMart.
