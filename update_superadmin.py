import re

with open('src/screens/SuperAdminScreen.jsx', 'r') as f:
    text = f.read()

# Make sure useT is imported
if 'import { useT }' not in text:
    text = text.replace("import { DB, fmt } from '../data'", "import { DB, fmt } from '../data'\nimport { useT } from '../i18n'")
    text = text.replace('const { state, dispatch } = useApp()', 'const { state, dispatch } = useApp()\n  const t = useT()')

# Replacement dictionary mapping exact old strings to new templates
replacements = {
    '"Adminni o\'chirmoqchimisiz?"': 't("Adminni o\'chirmoqchimisiz?")',
    '"Ushbu e\'lonni o\'chirmoqchimisiz?"': 't("Ushbu e\'lonni o\'chirmoqchimisiz?")',
    '"Foydalanuvchini o\'chirishni tasdiqlaysizmi?"': 't("Foydalanuvchini o\'chirishni tasdiqlaysizmi?")',
    '"Saqlandi"': 't("Saqlandi")',
    '"Global sozlamalar muvaffaqiyatli saqlandi"': 't("Global sozlamalar muvaffaqiyatli saqlandi")',
    '"Xato", "Barcha maydonlarni to\'ldiring"': 't("Xato"), t("Barcha maydonlarni to\'ldiring")',
    "'Xato', \"Barcha maydonlarni to'ldiring\"": "t('Xato'), t(\"Barcha maydonlarni to'ldiring\")",
    '"Qo\'shildi", "Yangi admin muvaffaqiyatli qo\'shildi"': 't("Qo\'shildi"), t("Yangi admin muvaffaqiyatli qo\'shildi")',
    "'Bajarildi', \"Yangi soha qo'shildi!\"": "t('Bajarildi'), t(\"Yangi soha qo'shildi!\")",
    'action: `Yangi admin qo\'shdi: ${nName}`': 'action: `${t("Yangi admin qo\'shdi:")} ${nName}`',
    'action: `Adminni o\'chirdi: ${DB.admins[i1].name}`': 'action: `${t("Adminni o\'chirdi:")} ${DB.admins[i1].name}`',
    'action: `Foydalanuvchini o\'chirdi: ${DB.users[idx].name}`': 'action: `${t("Foydalanuvchini o\'chirdi:")} ${DB.users[idx].name}`',
    'action: `E\'lonni o\'chirdi: ${DB.jobs[idx].title}`': 'action: `${t("E\'lonni o\'chirdi:")} ${DB.jobs[idx].title}`',
    'action: "Sozlamalarni yangiladi"': 'action: t("Sozlamalarni yangiladi")',
    'action: `Yangi soha qo\'shdi: ${nName}`': 'action: `${t("Yangi soha qo\'shdi:")} ${nName}`',
    'action: `Sohani tasdiqladi: ${c.name}`': 'action: `${t("Sohani tasdiqladi:")} ${c.name}`',
    'action: `Sohani rad etdi: ${DB.categories[i].name}`': 'action: `${t("Sohani rad etdi:")} ${DB.categories[i].name}`',
    '>👑 Super Admin<': '>{t("👑 Super Admin")}<',
    '>Chiqish<': '>{t("Chiqish")}<',
    ">To'liq boshqaruv markazi<": '>{t("To\'liq boshqaruv markazi")}<',
    "name: 'Hisobot'": "name: t('Hisobot')",
    "name: 'Adminlar'": "name: t('Adminlar')",
    "name: 'Odamlar'": "name: t('Odamlar')",
    "name: 'Ishlar'": "name: t('Ishlar')",
    "name: 'Sohalar'": "name: t('Sohalar')",
    "name: 'Loglar'": "name: t('Loglar')",
    "name: 'Sozlamalar'": "name: t('Sozlamalar')",
    'placeholder="Nom, telefon yoki holat bo\'yicha qidiruv..."': 'placeholder={t("Nom, telefon yoki holat bo\'yicha qidiruv...")}',
    '>Mijozlar<': '>{t("Mijozlar")}<',
    '>Ustalar<': '>{t("Ustalar")}<',
    '>Jami aylanma<': '>{t("Jami aylanma")}<',
    "so'm<": "{t(\"so'm\")}<",
    '>Platforma sof foydasi (': '>{t("Platforma sof foydasi (")}',
    '>E\'lonlar soni<': '>{t("E\'lonlar soni")}<',
    '>Jami ishlar: {': '>{t("Jami ishlar:")} {',
    ">+ Yangi admin qo'shish<": '>{t("+ Yangi admin qo\'shish")}<',
    'placeholder="Ism"': 'placeholder={t("Ism")}',
    'placeholder="Telefon"': 'placeholder={t("Telefon")}',
    'placeholder="Parol"': 'placeholder={t("Parol")}',
    '>Qo\'shish<': '>{t("Qo\'shish")}<',
    '>Joriy adminlar (': '>{t("Joriy adminlar")} (',
    '>Telefon: {': '>{t("Telefon:")} {',
    '>👷 Ustalar (': '>{t("👷 Ustalar")} (',
    '>🏗️ Mijozlar (': '>{t("🏗️ Mijozlar")} (',
    '>Ustalar mavjud emas<': '>{t("Ustalar mavjud emas")}<',
    '>Topgan puli<': '>{t("Topgan puli")}<',
    '>Hisobi(balans)<': '>{t("Hisobi(balans)")}<',
    '>Reyting<': '>{t("Reyting")}<',
    '>Mijozlar mavjud emas<': '>{t("Mijozlar mavjud emas")}<',
    '>Xarajatlari<': '>{t("Xarajatlari")}<',
    ">E'lon qilgan ishlari<": '>{t("E\'lon qilgan ishlari")}<',
    ">+ Yangi soha qoshish<": '>{t("+ Yangi soha qoshish")}<',
    'placeholder="Ikonka (misol: 🔧)"': 'placeholder={t("Ikonka (misol: 🔧)")}',
    'placeholder="Soha nomi"': 'placeholder={t("Soha nomi")}',
    '>Faol qilish<': '>{t("Faol qilish")}<',
    '>Kirituvchi: {': '>{t("Kirituvchi:")} {',
    '>Tasdiqlash ✓<': '>{t("Tasdiqlash ✓")}<',
    ">O'chirish ✕<": '>{t("O\'chirish ✕")}<',
    '>Mos ishlar topilmadi<': '>{t("Mos ishlar topilmadi")}<',
    '>Narx: {': '>{t("Narx:")} {',
    'so\'m • Holat: {': '{t("so\'m")} • {t("Holat:")} {',
    ">Hali loglar yo'q yoki qidiruvga mos kelmadi<": '>{t("Hali loglar yo\'q yoki qidiruvga mos kelmadi")}<',
    '>Moliya sozlamalari<': '>{t("Moliya sozlamalari")}<',
    '>Platforma komissiyasi (%)<': '>{t("Platforma komissiyasi (%)")}<',
    '>Har bir bajarilgan ishdan tizim foydasi<': '>{t("Har bir bajarilgan ishdan tizim foydasi")}<',
    ">Minimal balans (so'm)<": '>{t("Minimal balans (so\'m)")}<',
    ">Ishchi buyurtma olishdan oldin balansi kamida shuncha bo'lishi shart<": '>{t("Ishchi buyurtma olishdan oldin balansi kamida shuncha bo\'lishi shart")}<',
    '>⚙️ Barcha sozlamalarni saqlash<': '>{t("⚙️ Barcha sozlamalarni saqlash")}<'
}

for old, new in replacements.items():
    text = text.replace(old, new)

with open('src/screens/SuperAdminScreen.jsx', 'w') as f:
    f.write(text)

