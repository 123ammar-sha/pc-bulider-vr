# Beta QA Checklist

## Acceptance Criteria

- VR mobile flow dapat masuk sesi VR, menyelesaikan 5 langkah perakitan, lalu keluar VR tanpa freeze.
- Non-XR flow (mobile touch dan desktop) dapat menyelesaikan perakitan end-to-end.
- Build hanya dianggap selesai jika semua komponen terpasang dan tidak ada isu kompatibilitas.
- Warning urutan langkah dan warning kompatibilitas muncul dengan pesan yang mudah dipahami.

## Regression Cases

- Pasang komponen sesuai urutan lalu lepaskan salah satu komponen: progres harus mundur dengan benar.
- Coba pasang komponen di langkah yang salah: warning muncul, state tidak corrupt.
- Coba kombinasi CPU/MB tidak cocok: build tidak boleh valid complete.
- Coba kombinasi RAM/MB tidak cocok: build tidak boleh valid complete.
- Coba PSU di bawah kebutuhan rekomendasi: muncul warning daya dan build tidak valid complete.
- Masuk VR, keluar VR, lalu lanjutkan perakitan di mode non-XR: state sesi tetap konsisten.

## Device Matrix (minimum)

- Android Chrome (WebXR capable): verifikasi VR enter, interaksi gaze/tap, exit VR.
- iOS Safari (umumnya non-WebXR): verifikasi fallback non-XR touch flow.
- Desktop Chrome: verifikasi fallback pointer flow dan rule validation.

## Smoke Commands

- `npm run build`
