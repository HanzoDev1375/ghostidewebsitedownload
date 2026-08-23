# Ghost IDE — Download Site

سایت دانلود اپ Ghost IDE. لیست ریلیزها و دکمه‌ی دانلود مستقیم از **GitHub API** خوانده می‌شود؛ هر ریلیز جدیدی که منتشر شود، سایت بدون هیچ تغییری خودش نشان می‌دهد و آخرین APK را می‌دهد.

## امکانات

- **دانلود خودکار آخرین نسخه** — `GET /repos/HanzoDev1375/GhostIdes/releases` هر ۱۰ دقیقه کش می‌شود (localStorage) و در خطا به کش قبلی برمی‌گردد
- **نمایش SHA-256** فایل APK با کپی یک‌کلیکی
- **آمار زنده** — ستاره، فورک، کل دانلودها، حجم نصب (با شمارنده‌ی متحرک GSAP)
- **تایم‌لاین ریلیزها** — تاریخ شمسی برای فارسی / میلادی برای انگلیسی (`Intl` بومی مرورگر)، یادداشت‌های انتشار، فایل‌های jar/aar توسعه‌دهنده‌ها
- **پس‌زمینه‌ی سه‌بعدی** — Three.js با شیدر سفارشی GLSL (نویز سیمپلکس + فرنل) روی هسته و میدان ذرات additive؛ پارالاکس موس و واکنش به اسکرول
- **دوزبانه FA/EN** با جهت RTL/LTR کامل و ارقام فارسی
- ریسپانسیو، `prefers-reduced-motion`، fallback وقتی WebGL در دسترس نیست

## ساختار

```
index.html                     پوسته + importmap سه‌جی‌اس
assets/css/styles.css          کل استایل
assets/js/app.js               GitHub API + i18n + رندر + GSAP
assets/js/three-bg.js          صحنه‌ی Three.js (شیدرهای GLSL)
assets/img/                    آیکون اپ
server.js                      سرور استاتیک Node بدون وابستگی
.github/workflows/deploy.yml   دیپلوی خودکار Pages
```

## اجرا

```bash
npm start        # http://localhost:8080
```

هیچ build یا npm install ای لازم نیست؛ سایت کاملاً استاتیک است.

## دیپلوی

1. این پوشه را به‌عنوان یک ریپوی جدید (مثلاً `ghost-ide-download`) پوش کن.
2. `Settings → Pages → Source: GitHub Actions` را انتخاب کن.
3. ورک‌فلو با هر پوش به `main` دیپلوی می‌کند.

## کتابخانه‌ها

| کتابخانه | نقش | بارگذاری |
|---|---|---|
| [Three.js](https://github.com/mrdoob/three.js) r170 | پس‌زمینه‌ی سه‌بعدی | importmap از jsDelivr |
| [GSAP](https://gsap.com) 3.13 + ScrollTrigger | انیمیشن ورود، شمارنده‌ها | cdnjs |
| Vazirmatn + JetBrains Mono | تایپوگرافی | Google Fonts |

اگر CDN در دسترس نباشد سایت بدون انیمیشن/سه‌بعدی همچنان کار می‌کند (fallback تدریجی).
