# Asliddin & Guzal · Nikoh to‘yiga taklifnoma

Django 6, server-rendered HTML, CSS va vanilla JavaScript. 31-oktyabr 2026-yil,
18:00, Asia/Tashkent. ODILBEK 555, Mirbozor, Samarqand viloyati.

## Ishga tushirish

Python 3.12 yoki yangirog‘i kerak:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Brauzer: http://127.0.0.1:8000

Admin panelga kirish:

```sh
python manage.py createsuperuser
```

So‘ng `/admin/` sahifasiga kiring. Avval saqlangan mehmon javoblari mavjud bo‘lsa,
shu yerda ko‘rinadi. Saytda mehmon javoblarini yig‘ish bo‘limi olib tashlangan.

## Nimalar ishlaydi

- Ustiga bosib ochiladigan gulli konvert: muhr ajralishi, 3D qopqoq, ichidan
  taklifnoma chiqishi va asosiy sahifaga yumshoq o‘tish. Sahifa oxirida qayta
  ochish mumkin. Klaviatura, Escape va kamaytirilgan animatsiya rejimi ishlaydi.
- Original Samarqand uslubidagi akvarel, mahalliy shriftlar, responsive dizayn.
- Taklif matni, oyat mazmuni, salovat va kelin-kuyovga duo.
- Toshkent vaqtida hisoblangan jonli sanoq va haqiqiy `.ics` kalendar fayli.
- Foydalanuvchi bergan Google Maps havolasi.
- Lokal “Una Mattina” fon musiqasi, ovozni yoqish/o‘chirish, sahifa yashirilganda pauza.
- Ovoz foydalanuvchi bosgandan keyin boshlanadi. Ochilish oynasida ovozsiz ochish
  tanlovi bor. Brauzer avtomatik ovozni taqiqlasa, suzuvchi musiqa tugmasi ishlaydi.
- `prefers-reduced-motion`, semantik sarlavhalar, ko‘rinadigan fokus va no-JS mazmun.

## O‘zgartirish

- Matn va bo‘limlar: `templates/invitation/home.html`.
- Rang, shrift, joylashuv: `static/invitation/style.css`.
- Interaktivlik: `static/invitation/app.js`.
- Sana va xarita: `invitation/views.py`; matndagi sana va kalendar ham mos o‘zgartirilsin.
- Musiqa: `static/invitation/audio/una-mattina.mp3`.

Hozir foydalanuvchi taqdim etgan “Ludovico Einaudi — Una Mattina” MP3 fayli
loyiha ichidan ijro etiladi; YouTube yoki tashqi pleer ishlatilmaydi.
Avvalgi original instrumental fayllar zaxira sifatida saqlangan, lekin pleerga
ulanmagan. Avvalgi kompozitsiyani qayta yaratish:

```sh
python3 tools/generate_audio.py
ffmpeg -i static/invitation/audio/sokin-ohang.wav -codec:a libmp3lame -b:a 96k static/invitation/audio/sokin-ohang.mp3
```

## Tekshirish

```sh
python manage.py check
python manage.py test
```

## Internetga joylash

### Telegram havola preview’i

Sahifa serverdan Open Graph metama’lumotlarini chiqaradi. Preview rasmi:
`static/invitation/images/invitation-preview.jpg` (1200×630). Mavjud CSS
konvertidan tayyorlangan; ismlar, sana va vaqt ham rasmda ko‘rinadi.
Uni qayta yaratish: `node tools/generate_share_preview.cjs` (Playwright va
Chrome talab qilinadi; zarur bo‘lsa `PLAYWRIGHT_MODULE` yo‘lini belgilang).

Telegram preview’ni olishi uchun sayt va `/static/` rasmlari internetdan
ochilishi kerak; localhost havolasi ishlamaydi. Reverse proxy ishlatilsa,
Django haqiqiy HTTPS protokolini ko‘rishi ta’minlansin. Telegramdagi yakuniy
preview ommaviy URL bilan tekshiriladi; ko‘rinishi klient sozlamalari va
keshiga ham bog‘liq. Kartochka rasmi statik, animatsiya sayt ochilganda ishlaydi.

### Production sozlamalari

Hozir loyiha mahalliy ishga tushirish uchun tayyor. `.env.example` dagi o‘zgaruvchilar
hosting muhitida eksport qilinadi; `.env` avtomatik o‘qilmaydi. `DJANGO_DEBUG=0`,
tasodifiy `DJANGO_SECRET_KEY`, haqiqiy domen va HTTPS zarur. Production WSGI server
(masalan, Gunicorn) va `/static/` uchun web-server sozlang. `runserver` production
uchun mo‘ljallanmagan. `python manage.py collectstatic --noinput` bajariladi.

SQLite fayli uchun doimiy disk va zaxira nusxa kerak. Ko‘p serverli hostingda
PostgreSQL’ga o‘tiladi.

Manbalar va tasvir generatsiyasi: [ASSETS.md](ASSETS.md).
