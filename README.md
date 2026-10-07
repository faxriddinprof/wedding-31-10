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

Mehmonlar javoblarini ko‘rish:

```sh
python manage.py createsuperuser
```

So‘ng `/admin/` sahifasiga kiring. Ishtirok holati bo‘yicha filtr va ism bo‘yicha
qidiruv bor. Telefon yoki email yig‘ilmaydi. Mehmon javoblari faqat admin uchun
ochiq. Bir brauzer sessiyasida qayta yuborish avvalgi javobni yangilaydi.

## Nimalar ishlaydi

- Ustiga bosib ochiladigan gulli konvert: muhr ajralishi, 3D qopqoq, ichidan
  taklifnoma chiqishi va asosiy sahifaga yumshoq o‘tish. Sahifa oxirida qayta
  ochish mumkin. Klaviatura, Escape va kamaytirilgan animatsiya rejimi ishlaydi.
- Original Samarqand uslubidagi akvarel, mahalliy shriftlar, responsive dizayn.
- Taklif matni, oyat mazmuni, salovat, kelin-kuyovga duo va mahalliy eslab qolish.
- Toshkent vaqtida hisoblangan jonli sanoq va haqiqiy `.ics` kalendar fayli.
- Foydalanuvchi bergan Google Maps havolasi.
- Asl instrumental fon musiqasi, ovozni yoqish/o‘chirish, sahifa yashirilganda pauza.
- SQLite’da saqlanadigan RSVP; server validatsiyasi, CSRF, honeypot, sessiya bo‘yicha
  8 soniyalik qayta yuborish cheklovi. JavaScript bo‘lmasa ham forma ishlaydi.
- Ovoz foydalanuvchi bosgandan keyin boshlanadi. Ochilish oynasida ovozsiz ochish
  tanlovi bor. Brauzer avtomatik ovozni taqiqlasa, suzuvchi musiqa tugmasi ishlaydi.
- `prefers-reduced-motion`, semantik sarlavhalar, ko‘rinadigan fokus va no-JS mazmun.

## O‘zgartirish

- Matn va bo‘limlar: `templates/invitation/home.html`.
- Rang, shrift, joylashuv: `static/invitation/style.css`.
- Interaktivlik: `static/invitation/app.js`.
- Sana va xarita: `invitation/views.py`; matndagi sana va kalendar ham mos o‘zgartirilsin.
- Musiqa: `static/invitation/audio/sokin-ohang.mp3`.

Bu ohang loyiha uchun kod yordamida sintezlangan original sokin instrumental
kompozitsiya; salovat yoki Qur’on tilovati sifatida taqdim etilmaydi. Istalgan,
foydalanish huquqi mavjud nashid yoki boshqa audio bilan almashtirish mumkin.
Qayta yaratish:

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

Hozir loyiha mahalliy ishga tushirish uchun tayyor. `.env.example` dagi o‘zgaruvchilar
hosting muhitida eksport qilinadi; `.env` avtomatik o‘qilmaydi. `DJANGO_DEBUG=0`,
tasodifiy `DJANGO_SECRET_KEY`, haqiqiy domen va HTTPS zarur. Production WSGI server
(masalan, Gunicorn) va `/static/` uchun web-server sozlang. `runserver` production
uchun mo‘ljallanmagan. `python manage.py collectstatic --noinput` bajariladi.

SQLite fayli uchun doimiy disk va zaxira nusxa kerak. Ko‘p serverli hostingda
PostgreSQL’ga o‘tiladi. Ommaviy tarqatishdan oldin hostingda IP bo‘yicha so‘rov
cheklovi sozlanishi tavsiya etiladi: sessiya cheklovi yangi cookie bilan chetlab
o‘tilishi mumkin. To‘y tugagach, mehmonlar ma’lumotlarini kerak bo‘lmaganida o‘chiring.

Manbalar va tasvir generatsiyasi: [ASSETS.md](ASSETS.md).
