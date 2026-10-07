# Tasvir, shrift va matn manbalari

## Original tasvir

`static/invitation/images/garden-original.png` — built-in imagegen yordamida shu
loyiha uchun yaratilgan original rasm. `garden.jpg` — sayt uchun JPEG nusxa.
Timeless Grace sahifasining iliq oq/oltin ranglari va nafis taklifnoma uslubi
yo‘nalish sifatida o‘rganilgan; uning rasmlari yoki musiqasi ko‘chirilmagan.

Final generation prompt (built-in tool, not CLI):

> Use case: stylized-concept. Asset type: background illustration for an elegant Uzbek Muslim wedding invitation website, portrait 2:3. Create a refined fine-art watercolor and pencil illustration on warm ivory handmade paper (#f6f2e9). A grand ivory Islamic pointed arch with very fine engraved geometric floral decoration, framing a serene distant Samarkand-style domed pavilion and a quiet garden with two slender cypress trees and pale white jasmine flowers, pale sage olive leaves gently framing the bottom corners. The top half and especially upper center should have generous nearly blank ivory negative space for separately rendered wedding typography. Place arch dome near top edge, fine columns at edges, garden and pavilion in bottom third. Beautiful washed watercolor blending into the paper, antique muted brass details, sage green, soft greige, atmospheric sunny haze. Understated expensive stationery aesthetic, airy elegant and spiritual, extremely delicate linework, no harsh colors, no humans, no animals, no text, no calligraphy, no logo, no watermark. Entire scene illustration, not screenshot of website, not UI mockup.

Dekorativ SVG barglar, yulduz va geometrik naqshlar loyiha uchun yozilgan.
`envelope-florals.svg` — konvert uchun qo‘lda yozilgan original SVG gul bezagi.
Konvert qatlamlari va ochilish harakati `envelope.css` ichida yaratilgan;
namunadagi video yoki muhr surati ishlatilmagan.
Bog‘ tasviri badiiy bezak; to‘yxonaning fotosurati deb ko‘rsatilmagan.

## Mahalliy shriftlar

Google Fonts ochiq shriftlari: Cormorant Garamond, Manrope, Amiri.
Original SIL Open Font License matnlari `static/invitation/fonts/licenses/` ichida.

- https://github.com/google/fonts/tree/main/ofl/cormorantgaramond
- https://github.com/google/fonts/tree/main/ofl/manrope
- https://github.com/google/fonts/tree/main/ofl/amiri

## Diniy matnlar

- Qur’on, Rum 30:21: https://quran.com/30/21 — oyatning qisqa parcha mazmuni.
- Nikoh tabrigi duosi: https://sunnah.com/abudawud:2130 — qisqa mazmuniy bayon.
- Salovat matni Payg‘ambarimiz Muhammad ﷺ ga qaratilgan, kelin-kuyov haqqiga
  duo alohida.

## Musiqa

Faol audio: `static/invitation/audio/una-mattina.mp3` — foydalanuvchi taqdim
etgan “Ludovico Einaudi — Una Mattina” fayli. Lokal HTML audio pleeri orqali
ijro etiladi. Faylning manbasi va foydalanish litsenziyasi loyiha tomonidan
tekshirilmagan.

`sokin-ohang.mp3` — `tools/generate_audio.py` yordamida sintez qilingan original
48 soniyalik instrumental kompozitsiya. Zaxira sifatida saqlangan, faol emas.
