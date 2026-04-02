# Bootstrap -> Tailwind Utility Migration Prompt

Aşağıdaki prompt'u bir sonraki Claude Code oturumunda kullan:

---

## Prompt

BTCPay Server projesinde `Styles/tailwind.css` dosyasındaki `@layer components` bloğu ~5000 satır ve bunun ~%52'si Bootstrap 5 bileşenlerinin yeniden yazımı. Amacımız view dosyalarındaki Bootstrap class'larını Tailwind utility class'larına dönüştürüp, ardından ilgili `@layer components` tanımlarını silmek.

### Kurallar

1. **Kademeli migrasyon** — Her seferde TEK bir Bootstrap bileşeni dönüştür
2. **Tema uyumluluğu** — `--btcpay-*` CSS custom property'lerini koru. Tailwind'de `bg-[var(--btcpay-primary)]` gibi arbitrary value syntax kullan
3. **Dark mode** — Projede `@variant dark (&:where([data-btcpay-theme="dark"], [data-btcpay-theme="dark"] *))` kullanılıyor, buna uyumlu kal
4. **Sıfır görsel değişiklik** — Dönüşüm sonrası her şey piksel piksel aynı görünmeli
5. **Her bileşen ayrı commit** — Her Bootstrap bileşeni kendi commit'inde olsun
6. **Test** — Her dönüşümden sonra CSS build'i çalıştır

### Migrasyon Sırası (ROI'ye göre)

#### Faz 1 — Hızlı Kazanımlar
| Bileşen | Dosya Sayısı | CSS Satır | Zorluk |
|---------|-------------|-----------|--------|
| Progress (.progress, .progress-bar) | 2 | ~29 | Kolay |
| Breadcrumb (.breadcrumb, .breadcrumb-item) | az | ~34 | Kolay |
| Spinner (.spinner-border, .spinner-grow) | az | ~38 | Kolay |

#### Faz 2 — İyi Değer
| Bileşen | Dosya Sayısı | CSS Satır | Zorluk |
|---------|-------------|-----------|--------|
| Accordion | 13 | ~116 | Orta |
| List Group | 20 | ~96 | Kolay |
| Card | 20 | ~87 | Kolay |
| Badge | 29 | ~28 | Kolay |
| Alert | 44 | ~48 | Kolay |

#### Faz 3 — Orta Efor
| Bileşen | Dosya Sayısı | CSS Satır | Zorluk |
|---------|-------------|-----------|--------|
| Dropdown | 14 | ~116 | Orta |
| Toast | az | ~71 | Orta |
| Offcanvas | az | ~65 | Orta |
| Pagination | az | ~82 | Orta |

#### Faz 4 — Büyük İş (En Son)
| Bileşen | Dosya Sayısı | CSS Satır | Zorluk |
|---------|-------------|-----------|--------|
| Nav/Tabs | 97 | ~108 | Orta |
| Button sistemi | 157 | ~247 | Kolay ama yaygın |
| Input Group | 50 | ~66 | Orta |
| Table | 61 | ~58 | Zor |
| Modal | 61 | ~149 | Zor |
| Form Controls | 166 | ~275 | Zor |

### Dönüşüm Örneği

**Alert bileşeni — Önce:**
```html
<div class="alert alert-success alert-dismissible">
  <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  Başarılı!
</div>
```

**Alert bileşeni — Sonra:**
```html
<div class="relative rounded border px-4 py-3 text-sm
            bg-[var(--btcpay-success)] text-[var(--btcpay-success-text)]
            border-[var(--btcpay-success-border)]" role="alert">
  <button type="button" class="absolute top-2 right-2 opacity-50 hover:opacity-75"
          data-bs-dismiss="alert"></button>
  Başarılı!
</div>
```

**Sonra tailwind.css'den sil:** `.alert`, `.alert-success`, `.alert-danger`, `.alert-warning`, `.alert-info`, `.alert-light`, `.alert-dismissible` bloklarının tamamı (~48 satır)

### Her Dönüşüm Adımları

1. İlgili Bootstrap bileşeninin `@layer components` tanımını oku (property'leri not al)
2. O bileşeni kullanan TÜM .cshtml/.razor dosyalarını bul (`grep`)
3. Her dosyada Bootstrap class'larını eşdeğer Tailwind utility'lerine dönüştür
4. `Styles/tailwind.css`'den ilgili `@layer components` bloğunu sil
5. CSS build: `npx @tailwindcss/cli -i Styles/tailwind.css -o wwwroot/main/tailwind-output.css`
6. Commit at

### Kritik Dosyalar
- `BTCPayServer/Styles/tailwind.css` — Ana CSS (components bloğu satır 417-5007)
- `BTCPayServer/wwwroot/main/themes/default.css` — `--btcpay-*` variable tanımları
- `BTCPayServer/wwwroot/main/themes/default-dark.css` — Dark theme override'ları
- `BTCPayServer/wwwroot/js/btcpay-components.js` — Modal, Toast, Tooltip, Collapse JS (class isimleri burada da var!)

### Dikkat Edilecekler
- `btcpay-components.js` içinde `modal-backdrop`, `show`, `fade`, `tooltip`, `collapse`, `collapsing` gibi class'lar JS tarafından dinamik ekleniyor — bu class'ların CSS tanımları JS güncellenene kadar KALDIRILMAMALI
- Tom Select (`ts-*`), Summernote (`note-*`), Chartist (`ct-*`) override'larına DOKUNMA
- Icon tag helper `icon-@Model.Symbol` pattern'i ile class üretiyor
- Vue.js `v-cloak` directive'i CSS'de tanımlı

### İlk Oturumda Faz 1'den başla (Progress, Breadcrumb, Spinner). Bunlar en az dosyayı etkileyen ve en kolay bileşenler.
