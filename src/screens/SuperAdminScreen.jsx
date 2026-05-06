import { useState, useEffect } from 'react'
import { useApp } from '../context'
import { fmt, getCatName } from '../data'
import { useT } from '../i18n'
import { adminApi } from '../api'
import Pagination from '../components/Pagination'
import SAReport from './superadmin/SAReport'
import SAUsers from './superadmin/SAUsers'
import SAJobs from './superadmin/SAJobs'
import SATransactions from './superadmin/SATransactions'
import SALogs from './superadmin/SALogs'
import SACats from './superadmin/SACats'
import SASettings from './superadmin/SASettings'
import SAWheel from './superadmin/SAWheel'

const NAV = [
  { id: 'report',       icon: '📊', label: 'Hisobot' },
  { id: 'users',        icon: '👥', label: 'Odamlar' },
  { id: 'jobs',         icon: '💼', label: 'Ishlar' },
  { id: 'transactions', icon: '💳', label: 'Tranzaksiyalar' },
  { id: 'logs',         icon: '📋', label: 'Loglar' },
  { id: 'cats',         icon: '🗂️', label: 'Sohalar' },
  { id: 'wheel',        icon: '🎡', label: 'Baraban' },
  { id: 'settings',     icon: '⚙️', label: 'Sozlamalar' },
]

export default function SuperAdminScreen() {
  const { state, dispatch } = useApp()
  const t = useT()
  const { user } = state
  const [tab, setTab] = useState('report')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [logs, setLogs] = useState([])
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [settings, setSettings] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState({ users:1, jobs:1, logs:1, transactions:1 })
  const [totals, setTotals] = useState({ users:0, jobs:0, logs:0, transactions:0 })
  const [searchQueries, setSearchQueries] = useState({ users: '', jobs: '', logs: '', transactions: '' })

  // Admin Modal State
  const [adminModal, setAdminModal] = useState(null) // { name, phone, password }
  const [blockModal, setBlockModal] = useState(null) // { id, reason, days }

  useEffect(() => { 
    fetchData() 
    const timer = setInterval(() => fetchData(true), 15000) // Auto-refresh every 15s
    return () => clearInterval(timer)
  }, [])

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [uR, jR, lR, tR, cR, sR, rR] = await Promise.all([
        adminApi.getUsers(1, searchQueries.users), 
        adminApi.getJobs(1, searchQueries.jobs), 
        adminApi.getLogs(1, searchQueries.logs),
        adminApi.getTransactions(1, searchQueries.transactions), 
        adminApi.getCategories(),
        adminApi.getSettings(), 
        adminApi.getReport()
      ])
      setUsers(uR.data.data); setJobs(jR.data.data)
      setLogs(lR.data.data); setTransactions(tR.data.data)
      setCategories(cR.data); setSettings(sR.data); setReport(rR.data)
      setPages({ users:1, jobs:1, logs:1, transactions:1 })
      setTotals({ users: uR.data.total, jobs: jR.data.total, logs: lR.data.total, transactions: tR.data.total })
    } catch(e) { console.error(e) }
    finally { if (!silent) setLoading(false) }
  }

  const changePage = async (type, newPage) => {
    try {
      let res
      const q = searchQueries[type]
      if (type==='users')        res = await adminApi.getUsers(newPage, q)
      if (type==='jobs')         res = await adminApi.getJobs(newPage, q)
      if (type==='logs')         res = await adminApi.getLogs(newPage, q)
      if (type==='transactions') res = await adminApi.getTransactions(newPage, q)
      if (!res) return
      if (type==='users')        setUsers(res.data.data)
      if (type==='jobs')         setJobs(res.data.data)
      if (type==='logs')         setLogs(res.data.data)
      if (type==='transactions') setTransactions(res.data.data)
      setPages(prev => ({ ...prev, [type]: newPage }))
      setTotals(prev => ({ ...prev, [type]: res.data.total }))
    } catch(e) { console.error(e) }
  }

  const handleSearch = async (type, q) => {
    setSearchQueries(prev => ({ ...prev, [type]: q }))
    try {
      let res
      if (type==='users')        res = await adminApi.getUsers(1, q)
      if (type==='jobs')         res = await adminApi.getJobs(1, q)
      if (type==='logs')         res = await adminApi.getLogs(1, q)
      if (type==='transactions') res = await adminApi.getTransactions(1, q)
      if (!res) return
      if (type==='users')        setUsers(res.data.data)
      if (type==='jobs')         setJobs(res.data.data)
      if (type==='logs')         setLogs(res.data.data)
      if (type==='transactions') setTransactions(res.data.data)
      setPages(prev => ({ ...prev, [type]: 1 }))
      setTotals(prev => ({ ...prev, [type]: res.data.total }))
    } catch(e) { console.error(e) }
  }

  const showModal = (icon, title, sub) => dispatch({ type:'SHOW_MODAL', modal:{ type:'general', data:{ icon, title, sub } } })

  const handleBlock = async () => {
    if (!blockModal.reason || !blockModal.days) return
    try { 
      await adminApi.blockUser(blockModal.id, blockModal.reason, parseInt(blockModal.days)); 
      showModal('🔒', t('Bloklandi'), ''); 
      setBlockModal(null);
      fetchData(true) 
    }
    catch(e) { showModal('❌', t('Xato'), '') }
  }

  const blockUser = (id) => {
    const u = users.find(x => x.id === id);
    setBlockModal({ id, reason: u?.blockReason || '', days: '3', isBlocked: u?.isBlocked })
  }
  
  const unblockUser = async (id) => {
    try { await adminApi.unblockUser(id); showModal('✅', t('Ochildi'), ''); fetchData(true) }
    catch(e) {}
  }
  const deleteUser = async (id) => {
    if (!window.confirm(t("O'chirmoqchimisiz?"))) return
    try { await adminApi.deleteUser(id); showModal('🗑️', t("O'chirildi"), ''); fetchData(true) }
    catch(e) {}
  }
  const restoreUser = async (id) => {
    try { await adminApi.restoreUser(id); showModal('✅', t('Tiklandi'), ''); fetchData(true) }
    catch(e) {}
  }
  const approveCat = async (id) => {
    try { await adminApi.approveCategory(id); showModal('✅', t('Tasdiqlandi'), ''); fetchData(true) }
    catch(e) {}
  }
  const deleteCat = async (id) => {
    if (!window.confirm(t("O'chirilsinmi?"))) return
    try { await adminApi.deleteCategory(id); showModal('🗑️', t("O'chirildi"), ''); fetchData(true) }
    catch(e) {}
  }

  const handleCreateAdmin = async () => {
    if (!adminModal.name || !adminModal.phone || !adminModal.password) return
    try { 
      await adminApi.createAdmin(adminModal); 
      showModal('✅', t('Yaratildi'), ''); 
      setAdminModal(null);
      fetchData(true) 
    }
    catch(e) { showModal('❌', t('Xato'), t('Telefon band yoki xato')) }
  }

  const createAdmin = () => setAdminModal({ name: '', phone: '', password: '' })

  const sharedProps = {
    t, fmt, getCatName, dispatch, fetchData,
    users, jobs, logs, transactions, categories, settings, report,
    pages, totals, changePage, searchQueries, handleSearch,
    blockUser, unblockUser, deleteUser, restoreUser,
    approveCat, deleteCat, createAdmin, showModal,
    adminApi,
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#0F172A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-white/60 font-black text-[13px] uppercase tracking-widest animate-pulse">Yuklanmoqda...</div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0F172A]">

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-[220px] shrink-0 flex flex-col bg-[#0F172A] border-r border-white/5 py-6 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-[18px]">👑</div>
            <div>
              <div className="text-white font-black text-[14px]">Super Admin</div>
              <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Boshqaruv markazi</div>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 flex-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all text-left w-full ${
                tab === n.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}>
              <span className="text-[16px]">{n.icon}</span>
              {t(n.label)}
            </button>
          ))}
        </nav>

        <div className="px-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[13px]">
              {user?.name?.[0]}
            </div>
            <div>
              <div className="text-white text-[12px] font-black truncate max-w-[120px]">{user?.name}</div>
              <div className="text-white/30 text-[10px]">{user?.phone}</div>
            </div>
          </div>
          <button onClick={() => dispatch({ type:'LOGOUT' })}
            className="w-full text-red-400 bg-red-500/10 border border-red-500/20 py-2 rounded-xl text-[11px] font-black hover:bg-red-500/20 transition-all">
            🚪 {t('Chiqish')}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F7FB]">
        <div className="lg:hidden bg-[#0F172A] px-4 pt-3 pb-4 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white text-[18px]">☰</button>
              <div className="text-white font-black text-[16px]">👑 Super Admin</div>
            </div>
            <button onClick={() => dispatch({ type:'LOGOUT' })} className="text-red-300 bg-red-500/10 px-3 py-1.5 rounded-xl text-[11px] font-black border border-red-500/20">
              {t('Chiqish')}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scroll pb-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`px-4 py-2 rounded-xl text-[11px] font-black whitespace-nowrap transition-all ${
                  tab === n.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50'
                }`}>
                {n.icon} {t(n.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scroll">
          {tab === 'report'       && <SAReport       {...sharedProps} users={users} />}
          {tab === 'users'        && <SAUsers         {...sharedProps} />}
          {tab === 'jobs'         && <SAJobs          {...sharedProps} />}
          {tab === 'transactions' && <SATransactions  {...sharedProps} />}
          {tab === 'logs'         && <SALogs          {...sharedProps} />}
          {tab === 'cats'         && <SACats          {...sharedProps} />}
          {tab === 'wheel'        && <SAWheel         {...sharedProps} />}
          {tab === 'settings'     && <SASettings      {...sharedProps} />}
        </div>
      </div>

      {/* ── ADMIN CREATE MODAL ── */}
      {adminModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#0F172A]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setAdminModal(null)}>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
               <div>
                 <h3 className="text-[18px] font-black text-slate-800">🛡️ Yangi Admin</h3>
                 <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tizim boshqaruvchisi qo'shish</p>
               </div>
               <button onClick={() => setAdminModal(null)} className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all">✕</button>
            </div>
            <div className="p-8 flex flex-col gap-6">
               <div className="group">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 group-focus-within:text-blue-600 transition-colors">Admin Ismi</label>
                  <input value={adminModal.name} onChange={e => setAdminModal({...adminModal, name: e.target.value})} placeholder="Ism familiyani kiriting..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-[14px] font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all" />
               </div>
               <div className="group">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 group-focus-within:text-blue-600 transition-colors">Telefon raqami</label>
                  <input value={adminModal.phone} onChange={e => setAdminModal({...adminModal, phone: e.target.value})} placeholder="+998901234567" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-[14px] font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all" />
               </div>
               <div className="group">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1 group-focus-within:text-blue-600 transition-colors">Tizim paroli</label>
                  <input type="password" value={adminModal.password} onChange={e => setAdminModal({...adminModal, password: e.target.value})} placeholder="Kamida 6 ta belgi..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-[14px] font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all" />
               </div>
               <button onClick={handleCreateAdmin} className="w-full bg-[#0F172A] text-white py-4 rounded-2xl text-[14px] font-black uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all mt-2">
                 Adminni yaratish
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BLOCK USER MODAL ── */}
      {blockModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#0F172A]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setBlockModal(null)}>
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="p-8 flex flex-col items-center text-center">
                 <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-[40px] mb-6 shadow-inner ${blockModal.isBlocked ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                   {blockModal.isBlocked ? '⏳' : '🔒'}
                 </div>
                 <h3 className="text-[20px] font-black text-slate-800 mb-2">
                   {blockModal.isBlocked ? t('Blok muddatini o\'zgartirish') : t('Foydalanuvchini bloklash')}
                 </h3>
                 <p className="text-[13px] text-slate-400 font-medium mb-8">
                   {blockModal.isBlocked ? t('Ushbu foydalanuvchi bloklangan. Muddatni yangilashingiz mumkin.') : t('Ushbu foydalanuvchiga tizimdan foydalanishni vaqtincha taqiqlash.')}
                 </p>
                 
                 <div className="w-full flex flex-col gap-5 text-left">
                    <div>
                       <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Bloklash sababi</label>
                       <input value={blockModal.reason} onChange={e => setBlockModal({...blockModal, reason: e.target.value})} placeholder="Qoidabuzarlik uchun..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13px] font-bold outline-none focus:border-red-400 transition-all" />
                    </div>
                    <div>
                       <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Muddat</label>
                       <select value={blockModal.days} onChange={e => setBlockModal({...blockModal, days: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13px] font-bold outline-none focus:border-red-400 transition-all appearance-none">
                          <option value="1">1 kun</option>
                          <option value="3">3 kun</option>
                          <option value="7">7 kun (1 hafta)</option>
                          <option value="30">30 kun (1 oy)</option>
                          <option value="365">1 yil</option>
                          <option value="3650">Butunlay (10 yil)</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 w-full mt-8">
                    <button onClick={() => setBlockModal(null)} className="py-4 rounded-2xl bg-slate-50 text-slate-400 text-[13px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Bekor qilish</button>
                    <button onClick={handleBlock} className="py-4 rounded-2xl bg-red-500 text-white text-[13px] font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-600 transition-all">Tasdiqlash</button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}
