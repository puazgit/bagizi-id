# 📍 Referensi Koordinat GPS Indonesia

## Format Koordinat
**Format yang diterima**: `latitude,longitude` (tanpa spasi)

### Contoh Format Valid:
- ✅ `-6.2088,106.8456` (Jakarta - format tanpa spasi)
- ✅ `-6.2088, 106.8456` (akan dinormalisasi menjadi tanpa spasi)
- ❌ `106.8456,-6.2088` (terbalik - SALAH!)
- ❌ `-6.2088 106.8456` (tanpa koma - SALAH!)

## Koordinat Kota-Kota di Jawa Barat

### Kabupaten Purwakarta
- **Purwakarta (Pusat Kota)**: `-6.5567,107.4431`
- **Kecamatan Campaka**: `-6.5395,107.4569`
- **Kecamatan Jatiluhur**: `-6.5247,107.3869`
- **Kecamatan Plered**: `-6.7008,107.6308`

### Kota Bandung
- **Bandung (Pusat Kota)**: `-6.9175,107.6191`
- **Dago**: `-6.8700,107.6150`
- **Cihampelas**: `-6.8942,107.5931`

### Kabupaten Bandung
- **Soreang**: `-7.0312,107.5186`
- **Baleendah**: `-7.0058,107.6314`
- **Cicalengka**: `-6.9958,107.7767`

### Kabupaten Bogor
- **Cibinong**: `-6.4817,106.8542`
- **Ciawi**: `-6.6767,106.9000`
- **Cisarua**: `-6.6933,106.9486`

### Kabupaten Karawang
- **Karawang (Pusat)**: `-6.3063,107.3048`
- **Telukjambe**: `-6.2831,107.2411`
- **Purwasari**: `-6.4269,107.4611`

### Kabupaten Bekasi
- **Cikarang**: `-6.2611,107.1528`
- **Tambun**: `-6.2631,107.0564`
- **Setu**: `-6.3058,107.0639`

### Kota Bekasi
- **Bekasi Pusat**: `-6.2383,106.9756`
- **Bekasi Timur**: `-6.2425,107.0089`
- **Bekasi Selatan**: `-6.2742,106.9833`

## Cara Mendapatkan Koordinat

### 1. Google Maps
1. Buka Google Maps: https://maps.google.com
2. Klik kanan pada lokasi yang diinginkan
3. Pilih "What's here?" atau koordinat akan muncul
4. Salin koordinat dalam format: `-6.2088, 106.8456`
5. **Hapus spasi** → `-6.2088,106.8456`

### 2. GPS Smartphone
- Buka aplikasi peta (Google Maps, Apple Maps)
- Aktifkan lokasi/GPS
- Koordinat akan muncul di aplikasi

### 3. Website Geolocation
- https://www.latlong.net/
- https://www.gps-coordinates.net/

## Tips Penting

### ✅ DO (Lakukan):
- Gunakan format: `latitude,longitude` (tanpa spasi)
- Pastikan latitude (garis lintang) dulu, longitude (garis bujur) kedua
- Untuk Indonesia, latitude biasanya **negatif** (-6 sampai -11)
- Untuk Indonesia, longitude biasanya **positif** (95 sampai 141)
- Gunakan minimal 4 digit desimal untuk akurasi (~11 meter)

### ❌ DON'T (Jangan):
- ❌ Menukar posisi (longitude,latitude) - SALAH!
- ❌ Menggunakan spasi berlebihan
- ❌ Lupa tanda minus untuk latitude Indonesia
- ❌ Menggunakan format DMS (Degrees, Minutes, Seconds)

## Validasi Koordinat

### Range Valid untuk Indonesia:
- **Latitude**: -11.0° sampai -6.0° (Jawa, Bali, Nusa Tenggara)
- **Latitude**: -6.0° sampai 6.0° (Sumatera, Kalimantan)  
- **Longitude**: 95.0° sampai 141.0° (Seluruh Indonesia)

### Contoh Validasi di Aplikasi:
```typescript
// Format yang diterima
const validFormats = [
  '-6.2088,106.8456',     // ✅ Perfect
  '-6.2088, 106.8456',    // ✅ Akan dinormalisasi
  ' -6.2088 , 106.8456 ', // ✅ Akan dinormalisasi
]

// Format yang ditolak
const invalidFormats = [
  '106.8456,-6.2088',     // ❌ Terbalik
  '-6.2088 106.8456',     // ❌ Tanpa koma
  'Jakarta',              // ❌ Bukan koordinat
  '-6.2088',              // ❌ Hanya latitude
]
```

## Referensi Tambahan

### Dokumentasi Format Koordinat:
- [Wikipedia: Geographic coordinate system](https://en.wikipedia.org/wiki/Geographic_coordinate_system)
- [Google Maps API: Geocoding](https://developers.google.com/maps/documentation/geocoding)

### Tools Online:
- [LatLong.net](https://www.latlong.net/) - Find coordinates
- [GPS Visualizer](https://www.gpsvisualizer.com/) - Convert formats
- [MapCoordinates.net](https://www.mapcoordinates.net/) - Find & convert

---

**Catatan**: Aplikasi Bagizi-ID akan otomatis menormalisasi format koordinat (menghapus spasi extra) saat penyimpanan.
