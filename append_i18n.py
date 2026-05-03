import json

new_strings = {
  "Foydalanuvchini o'chirishni tasdiqlaysizmi?": { "kir": "Фойдаланувчини ўчиришни тасдиқлайсизми?", "ru": "Вы подтверждаете удаление пользователя?" },
  "Foydalanuvchini o'chirdi:": { "kir": "Фойдаланувчини ўчирди:", "ru": "Удалил пользователя:" },
  "Admin Panel": { "kir": "Админ Панел", "ru": "Админ Панель" },
  "Chiqish": { "kir": "Чиқиш", "ru": "Выход" },
  "Salom,": { "kir": "Салом,", "ru": "Привет," },
  "To'lovlar": { "kir": "Тўловлар", "ru": "Счета" },
  "Odamlar": { "kir": "Одамлар", "ru": "Люди" },
  "Sohalar": { "kir": "Соҳалар", "ru": "Сферы" },
  "To'lov kartasi": { "kir": "Тўлов картаси", "ru": "Карта оплаты" },
  "Hali so'rovlar yo'q": { "kir": "Ҳали сўровлар йўқ", "ru": "Пока нет запросов" },
  "Balans to'ldirish tasdiqlandi:": { "kir": "Баланс тўлдириш тасдиқланди:", "ru": "Пополнение баланса подтверждено:" },
  "So'ralgan miqdor:": { "kir": "Сўралган миқдор:", "ru": "Запрошенная сумма:" },
  "Rad etish": { "kir": "Рад этиш", "ru": "Отклонить" },
  "Tasdiqlandi": { "kir": "Тасдиқланди", "ru": "Подтверждено" },
  "Rad etildi": { "kir": "Рад этилди", "ru": "Отклонено" },
  "Kutilmoqda": { "kir": "Кутилмоқда", "ru": "Ожидается" },
  "Yangi soha taklif qilish": { "kir": "Янги соҳа таклиф қилиш", "ru": "Предложить новую сферу" },
  "Ikonka (misol: 🔧)": { "kir": "Иконка (мисол: 🔧)", "ru": "Иконка (пример: 🔧)" },
  "Soha nomi": { "kir": "Соҳа номи", "ru": "Название сферы" },
  "Barcha maydonlarni to'ldiring": { "kir": "Барча майдонларни тўлдиринг", "ru": "Заполните все поля" },
  "Yangi soha taklif qildi:": { "kir": "Янги соҳа таклиф қилди:", "ru": "Предложил новую сферу:" },
  "Yuborildi": { "kir": "Юборилди", "ru": "Отправлено" },
  "Yangi soha Super Adminga tasdiqlash uchun yuborildi": { "kir": "Янги соҳа Супер Админга тасдиқлаш учун юборилди", "ru": "Новая сфера отправлена на утверждение" },
  "Super Adminga yuborish": { "kir": "Супер Админга юбориш", "ru": "Отправить Супер Админу" },
  "Barcha sohalar": { "kir": "Барча соҳалар", "ru": "Все сферы" },
  "Ism yoki telefon raqam...": { "kir": "Исм ёки телефон рақам...", "ru": "Имя или телефон..." },
  "Ustalar": { "kir": "Усталар", "ru": "Мастера" },
  "Mijozlar": { "kir": "Мижозлар", "ru": "Клиенты" },
  "Qidiruvga mos usta yo'q": { "kir": "Қидирувга мос уста йўқ", "ru": "Нет подходящих мастеров" },
  "Topgan puli": { "kir": "Топган пули", "ru": "Заработок" },
  "Hisobi(balans)": { "kir": "Ҳисоби(баланс)", "ru": "Счет (баланс)" },
  "Reyting": { "kir": "Рейтинг", "ru": "Рейтинг" },
  "Ishlar": { "kir": "Ишлар", "ru": "Заказы" },
  "Qidiruvga mos mijoz yo'q": { "kir": "Қидирувга мос мижоз йўқ", "ru": "Нет подходящих клиентов" },
  "Xarajatlari": { "kir": "Харажатлари", "ru": "Расходы" },
  "E'lon qilgan ishlari": { "kir": "Эълон қилган ишлари", "ru": "Опубликованные заказы" },
  "Adminni o'chirmoqchimisiz?": { "kir": "Админни ўчирмоқчимисиз?", "ru": "Удалить админа?" },
  "Ushbu e'lonni o'chirmoqchimisiz?": { "kir": "Ушбу эълонни ўчирмоқчимисиз?", "ru": "Удалить это объявление?" },
  "Saqlandi": { "kir": "Сақланди", "ru": "Сохранено" },
  "Global sozlamalar muvaffaqiyatli saqlandi": { "kir": "Глобал созламалар муваффақиятли сақланди", "ru": "Глобальные настройки сохранены" },
  "Yangi soha qo'shildi!": { "kir": "Янги соҳа қўшилди!", "ru": "Новая сфера добавлена!" },
  "Hisobot": { "kir": "Ҳисобот", "ru": "Отчёт" },
  "Adminlar": { "kir": "Админлар", "ru": "Админы" },
  "Loglar": { "kir": "Логлар", "ru": "Логи" },
  "Sozlamalar": { "kir": "Созламалар", "ru": "Настройки" },
  "To'liq boshqaruv markazi": { "kir": "Тўлиқ бошқарув маркази", "ru": "Полный центр управления" },
  "Nom, telefon yoki holat bo'yicha qidiruv...": { "kir": "Ном, телефон ёки ҳолат бўйича қидирув...", "ru": "Поиск по имени, тел. или статусу..." },
  "Jami aylanma": { "kir": "Жами айланма", "ru": "Общий оборот" },
  "Platforma sof foydasi": { "kir": "Платформа соф фойдаси", "ru": "Чистая прибыль платформы" },
  "E'lonlar soni": { "kir": "Эълонлар сони", "ru": "Количество объявлений" },
  "Jami ishlar:": { "kir": "Жами ишлар:", "ru": "Всего заказов:" },
  "Yangi admin qo'shish": { "kir": "Янги админ қўшиш", "ru": "Добавить админа" },
  "Ism": { "kir": "Исм", "ru": "Имя" },
  "Telefon": { "kir": "Телефон", "ru": "Телефон" },
  "Qo'shish": { "kir": "Қўшиш", "ru": "Добавить" },
  "Joriy adminlar": { "kir": "Жорий админлар", "ru": "Текущие админы" },
  "Ustalar mavjud emas": { "kir": "Усталар мавжуд эмас", "ru": "Мастеров нет" },
  "Qo'shildi": { "kir": "Қўшилди", "ru": "Добавлено" },
  "Yangi admin muvaffaqiyatli qo'shildi": { "kir": "Янги админ муваффақиятли қўшилди", "ru": "Новый админ успешно добавлен" },
  "Yangi admin qo'shdi:": { "kir": "Янги админ қўшди:", "ru": "Добавил нового админа:" },
  "Yangi soha qoshish": { "kir": "Янги соҳа қошиш", "ru": "Добавить новую сферу" },
  "Mijozlar mavjud emas": { "kir": "Мижозлар мавжуд эмас", "ru": "Клиентов нет" },
  "Mos ishlar topilmadi": { "kir": "Мос ишлар топилмади", "ru": "Подходящих заказов не найдено" },
  "Narx:": { "kir": "Нарх:", "ru": "Цена:" },
  "Holat:": { "kir": "Ҳолат:", "ru": "Статус:" },
  "Hali loglar yo'q yoki qidiruvga mos kelmadi": { "kir": "Ҳали логлар йўқ ёки қидирувга мос келмади", "ru": "Еще нет логов или не найдено по поиску" },
  "Moliya sozlamalari": { "kir": "Молия созламалари", "ru": "Финансовые настройки" },
  "Platforma komissiyasi (%)": { "kir": "Платформа комиссияси (%)", "ru": "Комиссия платформы (%)" },
  "Har bir bajarilgan ishdan tizim foydasi": { "kir": "Ҳар бир бажарилган ишдан тизим фойдаси", "ru": "Прибыль системы с каждого выполненного заказа" },
  "Minimal balans (so'm)": { "kir": "Минимал баланс (сўм)", "ru": "Минимальный баланс (сум)" },
  "Ishchi buyurtma olishdan oldin balansi kamida shuncha bo'lishi shart": { "kir": "Ишчи буюртма олишдан олдин баланси камида шунча бўлиши шарт", "ru": "Баланс мастера перед взятием заказа должен быть не менее этой суммы" },
  "Barcha sozlamalarni saqlash": { "kir": "Барча созламаларни сақлаш", "ru": "Сохранить все настройки" },
  "Faol qilish": { "kir": "Фаол қилиш", "ru": "Активировать" },
  "Kirituvchi:": { "kir": "Киритувчи:", "ru": "Добавил:" },
  "Adminni o'chirdi:": { "kir": "Админни ўчирди:", "ru": "Удалил админа:" },
  "Sohani tasdiqladi:": { "kir": "Соҳани тасдиқлади:", "ru": "Подтвердил сферу:" },
  "Sohani rad etdi:": { "kir": "Соҳани рад этди:", "ru": "Отклонил сферу:" },
  "Tasdiqlash ✓": { "kir": "Тасдиқлаш ✓", "ru": "Подтвердить ✓" },
  "O'chirish ✕": { "kir": "Ўчириш ✕", "ru": "Удалить ✕" }
}

with open('src/i18n.js', 'r') as f:
    text = f.read()

# We need to insert this before `export function useT()`
insert_idx = text.rfind('export function useT()')

lines = ["  // Super/Admin screens\n"]
for k, v in new_strings.items():
    s = f'  "{k}": {{ kir: "{v["kir"]}", ru: "{v["ru"]}" }},\n'
    lines.append(s)

new_text = text[:insert_idx] + "".join(lines) + "}\n\n" + text[insert_idx:]
with open('src/i18n.js', 'w') as f:
    f.write(new_text)

print("Appended!")
