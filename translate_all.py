import re
import json
import codecs

# 1. LATIN TO CYRILLIC MAPPING
lat2cyr = {
    "sh": "ш", "ch": "ч", "o'": "ў", "g'": "ғ",
    "Sh": "Ш", "Ch": "Ч", "O'": "Ў", "G'": "Ғ",
    'a': 'а', 'b': 'б', 'd': 'д', 'e': 'е', 'f': 'ф',
    'g': 'г', 'h': 'ҳ', 'i': 'и', 'j': 'ж', 'k': 'к',
    'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п',
    'q': 'қ', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у',
    'v': 'в', 'x': 'х', 'y': 'й', 'z': 'з', "'": "ъ",
    'A': 'А', 'B': 'Б', 'D': 'Д', 'E': 'Е', 'F': 'Ф',
    'G': 'Г', 'H': 'Ҳ', 'I': 'И', 'J': 'Ж', 'K': 'К',
    'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П',
    'Q': 'Қ', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У',
    'V': 'В', 'X': 'Х', 'Y': 'Й', 'Z': 'З'
}

def to_cyrillic(text):
    for lat, cyr in lat2cyr.items():
        text = text.replace(lat, cyr)
    return text

def to_russian(text):
    text = text.replace(" viloyati", " область")
    text = text.replace(" shahri", " город")
    text = text.replace(" tuman", " район")
    text = text.replace("Respublikasi", "Республика")
    # A bit of manual tuning
    text = text.replace("Toshkent", "Ташкент")
    text = text.replace("Farg'ona", "Фергана")
    text = text.replace("Samarqand", "Самарканд")
    text = text.replace("Buxoro", "Бухара")
    text = text.replace("Xorazm", "Хорезм")
    text = text.replace("Qashqadaryo", "Кашкадарья")
    text = text.replace("Surxondaryo", "Сурхандарья")
    return text

strings_to_add = set()

# Parse regions
with open('src/regions.js', 'r') as f:
    rcontent = f.read()

# find all exact strings in quotes
for match in re.findall(r'name:\s*"([^"]+)"', rcontent):
    strings_to_add.add(match)
for match in re.findall(r'districts:\s*\[(.*?)\]', rcontent):
    dists = [x.strip().strip("'").strip('"') for x in match.split(',')]
    for d in dists:
        if d: strings_to_add.add(d)

# Parse categories from data.js
with open('src/data.js', 'r') as f:
    dcontent = f.read()
# We look for getActiveSkills or categories
cat_block = re.search(r'categories:\s*\[(.*?)\]', dcontent, re.DOTALL)
if cat_block:
    for match in re.findall(r'name:\s*\'([^\']+)\'', cat_block.group(1)):
        strings_to_add.add(match)

# Also parse WorkerHome manual categories
cats = ['🚿 Santexnik', '⚡ Elektrik', '🏗️ Kunlik', '🔧 Usta', '🔥 Gaz']
for c in cats:
    strings_to_add.add(c)

# We also need to add missing auth ones
auth_extra = ["🗺️ Viloyat", "— Viloyat tanlang —", "📍 Tuman / Shahar", "— Tuman tanlang —"]
for c in auth_extra:
    strings_to_add.add(c)

new_dict = {}
for s in strings_to_add:
    # Just basic transliteration for cyrillic and russian (or translated logic)
    ru = to_russian(s)
    kir = to_cyrillic(s)
    
    # some specific adjustments
    if s == "— Viloyat tanlang —": 
        kir = "— Вилоят танланг —"
        ru = "— Выберите регион —"
    elif s == "— Tuman tanlang —":
        kir = "— Туман танланг —"
        ru = "— Выберите район —"
    elif s == "🗺️ Viloyat":
        kir = "🗺️ Вилоят"
        ru = "🗺️ Регион"
    elif s == "📍 Tuman / Shahar":
        kir = "📍 Туман / Шаҳар"
        ru = "📍 Район / Город"
    
    new_dict[s] = {"kir": kir, "ru": ru}

# append to i18n
with open('src/i18n.js', 'r') as f:
    i18n = f.read()

insert_idx = i18n.rfind('export function useT()')
lines = ["  // Auto-generated locations and skills\n"]
for k, v in new_dict.items():
    # escape quotes
    k_esc = k.replace('"', '\\"')
    kir_esc = v["kir"].replace('"', '\\"')
    ru_esc = v["ru"].replace('"', '\\"')
    lines.append(f'  "{k_esc}": {{ kir: "{kir_esc}", ru: "{ru_esc}" }},\n')

new_i18n = i18n[:insert_idx] + "".join(lines) + i18n[insert_idx:]

with open('src/i18n.js', 'w') as f:
    f.write(new_i18n)

print(f"Added {len(new_dict)} entries!")
