// zentro – App State / Database (in-memory demo)

export const DB = {
  users: [
    { id:1, name:'Abdulloh Karimov', phone:'+998901234567', pass:'123456', role:'worker', region:'toshkent_shahar', district:'Yunusobod', skills:['santexnik','elektrik'], balance:0, rating:4.7, totalRatings:56, totalJobs:32, totalEarned:4800000, history:[], acceptedJobs:[] },
    { id:2, name:'Sarvar Xoliqov',   phone:'+998912345678', pass:'123456', role:'worker', region:'toshkent_shahar', district:'Chilonzor', skills:['kunlik','quruvchi'],    balance:30000, rating:4.2, totalRatings:18, totalJobs:14, totalEarned:1950000, history:[], acceptedJobs:[] },
    { id:3, name:'Dilshod Tursunov', phone:'+998901111111', pass:'123456', role:'worker', region:'toshkent_shahar', district:'Sergeli',   skills:['elektrik','konditsioner'], balance:55000, rating:3.9, totalRatings:9, totalJobs:9, totalEarned:1200000, history:[], acceptedJobs:[] },
    { id:4, name:'Lola Mirzayeva',   phone:'+998901112222', pass:'123456', role:'client', region:'toshkent_shahar', district:'Yunusobod', cats:['santexnik','elektrik'], postedJobs:[], totalSpent:0 },
    { id:5, name:'Jasur Rahimov',    phone:'+998901113333', pass:'123456', role:'client', region:'toshkent_shahar', district:'Sergeli',   cats:['kunlik'], postedJobs:[], totalSpent:0 },
    { id:6, name:'Admin Adminov',    phone:'+998901000000', pass:'admin123', role:'admin' },
    { id:7, name:'Super Admin',      phone:'+998900000000', pass:'super123', role:'superadmin' },
  ],
  jobs: [
    { id:1, title:"Rakovina o'rnatish",    cat:'santexnik',    icon:'🚿', price:150000, addr:'Yunusobod, 14-uy',     phone:'+998901234567', date:'Bugun, 10:00', dist:'2.4 km', desc:"Rakovina o'rnatish va suv chiqarish tizimini ulash. Jihozlar bor.", clientId:4, status:'open', applicants:[], acceptedWorker:null, clientRating:4.8, clientReviews:23, lat:41.2995, lng:69.2401 },
    { id:2, title:'Elektr sim tortish',    cat:'elektrik',     icon:'⚡', price:200000, addr:'Chilonzor, 22-uy',     phone:'+998912233445', date:'Bugun, 14:00', dist:'3.1 km', desc:'Yangi xonada elektr simlari. 3 xona, 2 rozetka.',              clientId:4, status:'open', applicants:[], acceptedWorker:null, clientRating:4.5, clientReviews:11, lat:41.3112, lng:69.265  },
    { id:3, title:'Devor suvoq qilish',    cat:'kunlik',       icon:'🏗️', price:120000, addr:'Sergeli, 5-uy',        phone:'+998901113333', date:'Ertaga, 09:00', dist:'4.7 km', desc:'2 xona devorini suvoq qilish. Material bor.',                clientId:5, status:'open', applicants:[], acceptedWorker:null, clientRating:4.9, clientReviews:34, lat:41.2876, lng:69.2198 },
    { id:4, title:"Hojatxona ta'mirlash",  cat:'santexnik',    icon:'🔧', price:180000, addr:'Mirzo Ulugbek, 10-uy',  phone:'+998909876543', date:'12 May, 11:00', dist:'1.8 km', desc:'Quvur va bortik ta\'mirlash.',                               clientId:4, status:'open', applicants:[], acceptedWorker:null, clientRating:4.7, clientReviews:8,  lat:41.3055, lng:69.2732 },
    { id:5, title:"Konditsioner o'rnatish", cat:'konditsioner', icon:'❄️', price:250000, addr:'Uchtepa, 30-uy',       phone:'+998901234500', date:'13 May, 10:00', dist:'5.2 km', desc:'2 ta konditsioner o\'rnatish.',                              clientId:5, status:'open', applicants:[], acceptedWorker:null, clientRating:4.6, clientReviews:5,  lat:41.2934, lng:69.2087 },
    { id:6, title:'Pol yotqizish',          cat:'quruvchi',     icon:'🪵', price:300000, addr:"Shayxontohur, 7-uy",   phone:'+998901112200', date:'14 May, 08:00', dist:'2.8 km', desc:'Laminat pol, 45 kv.m. Material bor.',                        clientId:5, status:'open', applicants:[], acceptedWorker:null, clientRating:4.8, clientReviews:19, lat:41.3188, lng:69.2534 },
  ],
  admins: [
    { id:6, name:'Admin Adminov', phone:'+998901000000', addedBy:'superadmin' }
  ],
  settings: { commission:5, minBalance:5000, paymentCard:'8600 1234 5678 9012', cardHolder:'zentro LLC' },
  logs: [
    { id: 1, date: 'Bugun, 10:15', by: 'Admin Adminov', action: "Yangi usta qo'shildi" }
  ],
  categories: [
    { id: 'santexnik', name: 'Santexnik', icon: '🚿', status: 'active' },
    { id: 'elektrik', name: 'Elektrik', icon: '⚡', status: 'active' },
    { id: 'kunlik', name: 'Kunlik ish', icon: '🏗️', status: 'active' },
    { id: 'usta', name: 'Usta', icon: '🔧', status: 'active' },
    { id: 'quruvchi', name: 'Quruvchi', icon: '🏠', status: 'active' },
    { id: 'gaz', name: 'Gaz ustasi', icon: '🔥', status: 'active' },
    { id: 'konditsioner', name: 'Konditsioner', icon: '❄️', status: 'active' },
    { id: 'boyoq', name: 'Bo\'yoqchi', icon: '🎨', status: 'active' }
  ],
  nextId: 8,
  paymentRequests: [],
  chats: [
    { 
      id: 1, 
      users: [1, 4], 
      jobId: 1,
      messages: [
        { text: 'Assalomu alaykum!', from: 1, time: '10:41' },
        { text: 'Va alaykum assalom. Rakovina bo\'yicha savollar bormi?', from: 4, time: '10:42' },
        { text: 'Ha, manzilni aniqlashtirib olmoqchiman.', from: 1, time: '10:45' }
      ]
    },
    {
      id: 2,
      users: [2, 4],
      jobId: 2,
      messages: [
        { text: 'Sarvarman, elektr bo\'yicha yozayotgandim.', from: 2, time: '09:12' },
        { text: 'Salom, keling.', from: 4, time: '09:15' }
      ]
    }
  ],
};

export const getCat = (id) => DB.categories.find(c => c.id === id) || { name: id, icon: '💼' };
export const getCatName = (id) => getCat(id)?.name || id;
export const getCatIcon = (id) => getCat(id)?.icon || '💼';
export const getActiveSkills = () => DB.categories.filter(c=>c.status==='active').map(c => ({ key: c.id, name: c.name, icon: c.icon }));

export const JOB_COORDS = {
  1:[41.2995,69.2401], 2:[41.3112,69.265],  3:[41.2876,69.2198],
  4:[41.3055,69.2732], 5:[41.2934,69.2087], 6:[41.3188,69.2534],
};

export function fmt(n) { return Number(n).toLocaleString('ru'); }

export function starsArr(r, size = 14) {
  return Array.from({length:5}, (_,i) => (
    `<span style="color:${i < Math.round(r) ? '#F59E0B' : '#D1D5DB'};font-size:${size}px">★</span>`
  )).join('');
}
