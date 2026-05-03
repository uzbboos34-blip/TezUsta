export const REGIONS = [
  {
    id: 'toshkent_shahar', name: "Toshkent shahri",
    districts: ["Bektemir","Chilonzor","Hamza","Mirzo Ulug'bek","Mirobod","Olmazor","Sergeli","Shayxontohur","Uchtepa","Yakkasaroy","Yunusobod","Yashnobod"]
  },
  {
    id: 'toshkent_viloyat', name: "Toshkent viloyati",
    districts: ["Angren","Bekobod","Bo'stonliq","Bo'ka","Chirchiq","Ohangaron","Oqqo'rg'on","Parkent","Piskent","Quyichirchiq","Toshloq","Yangiyo'l","Yuqorichirchiq","Zangiota"]
  },
  {
    id: 'andijon', name: "Andijon viloyati",
    districts: ["Andijon shahri","Asaka","Baliqchi","Bo'z","Buloqboshi","Izboskan","Jalolquduq","Kattaqo'rg'on","Marhamat","Oltinko'l","Paxtaobod","Shahrixon","Ulugnor","Xo'jaobod"]
  },
  {
    id: 'fargona', name: "Farg'ona viloyati",
    districts: ["Farg'ona shahri","Bog'dod","Beshariq","Buvayda","Dang'ara","Furqat","Hamza","Oltiariq","O'zbekiston","Qo'shtepa","Rishton","So'x","Toshloq","Uchko'prik","Yozyovon"]
  },
  {
    id: 'namangan', name: "Namangan viloyati",
    districts: ["Namangan shahri","Chortoq","Chust","Kosonsoy","Mingbuloq","Namangan","Norin","Pop","To'raqo'rg'on","Uchqo'rg'on","Yangiqo'rg'on"]
  },
  {
    id: 'samarqand', name: "Samarqand viloyati",
    districts: ["Samarqand shahri","Bulung'ur","Ishtixon","Jomboy","Kattaqo'rg'on","Narpay","Nurobod","Oqdaryo","Payariq","Pastdarg'om","Qo'shrabot","Toyloq","Urgut"]
  },
  {
    id: 'buxoro', name: "Buxoro viloyati",
    districts: ["Buxoro shahri","Kogon","G'ijduvon","Jondor","Kagan","Olot","Peshku","Qorakul","Qorovulbozor","Romitan","Shofirkon","Vobkent"]
  },
  {
    id: 'navoiy', name: "Navoiy viloyati",
    districts: ["Navoiy shahri","Karmana","Konimex","Navbahor","Nurota","Qiziltepa","Tomdi","Uchquduq","Xatirchi"]
  },
  {
    id: 'xorazm', name: "Xorazm viloyati",
    districts: ["Urganch shahri","Bog'ot","Gurlan","Xazorasp","Xiva","Qo'shko'pir","Shovot","Tuproqqal'a","Urganch","Yangiariq","Yangibozor"]
  },
  {
    id: 'qashqadaryo', name: "Qashqadaryo viloyati",
    districts: ["Qarshi shahri","Chiroqchi","Dehqonobod","G'uzor","Kasbi","Kitob","Koson","Mirishkor","Muborak","Nishon","Qamashi","Shahrisabz","Yakkabog'"]
  },
  {
    id: 'surxondaryo', name: "Surxondaryo viloyati",
    districts: ["Termiz shahri","Angor","Bandixon","Boysun","Denov","Jarqo'rg'on","Muzrabot","Oltinsoy","Qiziriq","Qumqo'rg'on","Sariosiy","Sherobod","Sho'rchi","Uzun"]
  },
  {
    id: 'jizzax', name: "Jizzax viloyati",
    districts: ["Jizzax shahri","Arnasoy","Baxmal","Do'stlik","Forish","G'allaorol","Mirzacho'l","Paxtakor","Sharof Rashidov","Yangiobod","Zomin","Zarbdor"]
  },
  {
    id: 'sirdaryo', name: "Sirdaryo viloyati",
    districts: ["Guliston shahri","Boyovut","Guliston","Mirzaobod","Oqoltin","Sardoba","Sayxunobod","Shirin","Xovos"]
  },
  {
    id: 'qoraqalpogiston', name: "Qoraqalpog'iston Respublikasi",
    districts: ["Nukus shahri","Amudaryo","Beruniy","Bo'zatov","Chimboy","Ellikkala","Kegeyli","Mo'ynoq","Nukus","Qanliko'l","Qo'ng'irot","Qorao'zak","Shumanay","Taxtako'pir","To'rtko'l","Xo'jayli"]
  },
]

export const getRegionName = (id) => REGIONS.find(r => r.id === id)?.name || id
export const getDistricts = (regionId) => REGIONS.find(r => r.id === regionId)?.districts || []
