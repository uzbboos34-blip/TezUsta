import { useState, useEffect } from 'react'
import { useApp } from '../context'
import { fmt, getCatName } from '../data'
import { useT } from '../i18n'
import { adminApi, usersApi } from '../api'
import Pagination from '../components/Pagination'

export default function AdminScreen() {
  const { state, dispatch } = useApp()
  const t = useT()
  const { user } = state
  
  const [tab, setTab] = useState('dashboard') // dashboard, payments, users, cats
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userTab, setUserTab] = useState('worker')
  const [paymentFilter, setPaymentFilter] = useState('all') // all, pending, approved, rejected
  const [paymentSearch, setPaymentSearch] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  
  const [blockModal, setBlockModal] = useState(null)
  const [blockReason, setBlockReason] = useState('')
  const [blockDays, setBlockDays] = useState('7')

  // Profile Tab
  const [profName, setProfName] = useState(state.user?.name || '')
  const [profPhone, setProfPhone] = useState(state.user?.phone || '')
  const [profPass, setProfPass] = useState('')
  const [profSaving, setProfSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [catSearch, setCatSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [categories, setCategories] = useState([])
  const [pages, setPages] = useState({ users: 1, payments: 1 })
  const [totals, setTotals] = useState({ users: 0, payments: 0 })

  const [newCat, setNewCat] = useState('')
  const [newIcon, setNewIcon] = useState('')
  const [editId, setEditId] = useState(null)
  const [showCatModal, setShowCatModal] = useState(false)

  useEffect(() => { 
    fetchData() 
    const timer = setInterval(() => fetchData(true), 15000) // Auto-refresh every 15s
    return () => clearInterval(timer)
  }, [])

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [uRes, pRes, cRes] = await Promise.all([
        adminApi.getUsers(1),
        adminApi.getPayments(1),
        adminApi.getCategories()
      ])
      setUsers(uRes.data.data)
      setPayments(pRes.data.data)
      setCategories(cRes.data)
      setTotals({ users: uRes.data.total, payments: pRes.data.total })
      setPages({ users: 1, payments: 1 })
    } catch (e) { console.error(e) }
    finally { if (!silent) setLoading(false) }
  }

  const changePage = async (type, p) => {
    try {
      let res;
      if (type === 'users') res = await adminApi.getUsers(p)
      if (type === 'payments') res = await adminApi.getPayments(p)

      if (type === 'users') setUsers(res.data.data)
      if (type === 'payments') setPayments(res.data.data)

      setPages({ ...pages, [type]: p })
      setTotals({ ...totals, [type]: res.data.total })
    } catch (e) { console.error(e) }
  }

  const alert = (title, sub) => dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '✅', title, sub } } })

  // User Actions
  const handleBlock = async () => {
    if (!blockReason.trim()) return alert("Xato", "Bloklash sababini yozing");
    try {
      await adminApi.blockUser(blockModal.id, blockReason, parseInt(blockDays))
      alert(t("Bloklandi"), t("Foydalanuvchi muvaffaqiyatli bloklandi"))
      setBlockModal(null)
      setBlockReason('')
      fetchData(true)
    } catch (e) { alert(t("Xato"), t("Xato yuz berdi")) }
  }

  const handleUnblock = async () => {
    try {
      await adminApi.unblockUser(blockModal.id)
      alert(t("Ochildi"), t("Foydalanuvchi blokdan chiqarildi"))
      setBlockModal(null)
      fetchData(true)
    } catch (e) { alert(t("Xato"), t("Xato yuz berdi")) }
  }

  // Profile Actions
  const handleUpdateProfile = async () => {
    setProfSaving(true)
    try {
      const data = { name: profName, phone: profPhone }
      if (profPass.trim()) data.pass = profPass
      const res = await usersApi.updateProfile(data)
      dispatch({ type: 'LOGIN', payload: { user: res.data, token: state.token } })
      alert(t("Muvaffaqiyatli"), t("Profilingiz yangilandi"))
      setProfPass('')
    } catch (e) { alert(t("Xato"), t("Profilni yangilashda xatolik yuz berdi")) }
    finally { setProfSaving(false) }
  }

  // Payment Actions
  const approvePayment = async (id) => {
    try {
      await adminApi.approvePayment(id)
      alert(t("Tasdiqlandi"), t("To'lov muvaffaqiyatli qabul qilindi"))
      fetchData(true)
    } catch (e) { alert(t("Xato"), t("Xato yuz berdi")) }
  }

  const rejectPayment = async (id) => {
    try {
      await adminApi.rejectPayment(id)
      alert(t("Rad etildi"), t("To'lov rad etildi"))
      fetchData(true)
    } catch (e) { alert(t("Xato"), t("Xato yuz berdi")) }
  }

  // Category Actions
  const suggestCat = async () => {
    if (!newCat || !newIcon) return alert(t('Xato'), t('Barcha maydonlarni to`ldiring'));
    try {
      if (editId) {
        await adminApi.updateCategory(editId, { name: newCat, icon: newIcon })
        alert(t('Yangilandi'), t('O`zgarishlar tasdiqlash uchun yuborildi'))
        setEditId(null)
      } else {
        await adminApi.createCategory({ id: newCat.toLowerCase().replace(/\s/g, '_'), name: newCat, icon: newIcon, suggestedBy: user.id.toString() })
        alert(t('Yuborildi'), t('Yangi soha tasdiqlash uchun yuborildi'))
      }
      setNewCat(''); setNewIcon('');
      setShowCatModal(false);
      fetchData(true)
    } catch (e) { alert(t("Xato"), t("Xato yuz berdi")) }
  }

  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length
  const filteredPayments = payments.filter(p => {
    if (paymentFilter !== 'all' && p.status !== paymentFilter) return false;
    if (paymentSearch) {
      const s = paymentSearch.toLowerCase();
      const n = (p.user?.name || '').toLowerCase();
      const ph = (p.user?.phone || '');
      if (!n.includes(s) && !ph.includes(s)) return false;
    }
    return true;
  });
  
  const filteredUsers = users.filter(u => {
    if (u.role !== userTab) return false;
    const searchLower = search.toLowerCase();
    const nameMatch = u.name ? u.name.toLowerCase().includes(searchLower) : false;
    const phoneMatch = u.phone ? u.phone.includes(search) : false;
    return search === '' ? true : (nameMatch || phoneMatch);
  })

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(catSearch.toLowerCase()) ||
    c.proposedName?.toLowerCase().includes(catSearch.toLowerCase())
  )

  if (loading) return <div className="flex h-screen items-center justify-center bg-white font-inter text-[#64748B]">{t("Yuklanmoqda...")}</div>

  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: "Boshqaruv paneli" },
    { id: 'payments',  icon: '💳', label: "To'lovlar", badge: pendingPaymentsCount },
    { id: 'users',     icon: '👥', label: "Foydalanuvchilar" },
    { id: 'cats',      icon: '📦', label: "Sohalar" },
    { id: 'profile',   icon: '👤', label: "Mening profilim" }
  ]

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-inter text-[#0F172A] overflow-hidden">

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Dark Premium */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-[260px] bg-[#1E293B] flex-shrink-0 flex flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Area */}
        <div className="h-[72px] px-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-[16px] shadow-lg">🛡️</div>
          <div>
            <h1 className="text-[15px] font-black text-white leading-tight">Admin Panel</h1>
            <p className="text-[11px] text-[#94A3B8] font-semibold uppercase tracking-wider">Moderatsiya</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto no-scroll">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[14px] font-bold w-full text-left relative group
                ${tab === item.id ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-900/40' : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'}`}>
              <span className={`text-[18px] transition-opacity ${tab === item.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
              <span className="flex-1">{t(item.label)}</span>
              {item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${tab === item.id ? 'bg-white text-blue-600' : 'bg-[#EF4444] text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors cursor-pointer" onClick={() => dispatch({ type: 'LOGOUT' })}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-[14px] shadow-inner">
                {user?.name?.[0]}
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">{user?.name}</div>
                <div className="text-[11px] text-[#94A3B8]">{user?.phone}</div>
              </div>
            </div>
            <button className="text-[#94A3B8] hover:text-red-400 transition-colors text-[14px]">
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top Header */}
        <div className="h-[60px] lg:h-[72px] bg-white border-b border-[#E2E8F0] px-4 lg:px-8 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center text-[20px] text-[#64748B] hover:bg-gray-100 rounded-xl transition-colors">☰</button>
            <h2 className="text-[15px] lg:text-[18px] font-bold text-[#0F172A]">
              {tab === 'dashboard' && 'Boshqaruv paneli'}
              {tab === 'payments' && "To'lov so'rovlari"}
              {tab === 'users' && 'Foydalanuvchilar'}
              {tab === 'cats' && 'Sohalar'}
              {tab === 'profile' && 'Mening profilim'}
            </h2>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative text-[20px] text-[#64748B] hover:text-[#0F172A] transition-colors">
              🔔
              {pendingPaymentsCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
            </button>
            <button onClick={() => dispatch({ type: 'LOGOUT' })} className="flex items-center gap-1.5 lg:gap-2 text-[12px] lg:text-[13px] font-bold text-[#EF4444] bg-[#FEF2F2] px-3 lg:px-4 py-2 rounded-xl hover:bg-[#FEE2E2] transition-colors shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto no-scroll p-4 lg:p-8">
          
          {tab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[13px] text-[#64748B]">{t("Asosiy ko'rsatkichlar va tezkor ma'lumotlar")}</p>
              </div>

              {/* Top Summary Cards with Subtle Gradients */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 p-6 rounded-2xl border border-blue-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center text-[24px] shadow-sm border border-blue-50">👥</div>
                  <div>
                    <div className="text-[13px] font-bold text-blue-600/70 uppercase tracking-wider mb-1">Foydalanuvchilar</div>
                    <div className="text-[28px] font-black text-[#0F172A] leading-none">{totals.users} <span className="text-[14px] text-[#94A3B8] font-normal">ta</span></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/30 p-6 rounded-2xl border border-emerald-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center text-[24px] shadow-sm border border-emerald-50">💳</div>
                  <div>
                    <div className="text-[13px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1">To'lov so'rovlari</div>
                    <div className="text-[28px] font-black text-[#0F172A] leading-none">{totals.payments} <span className="text-[14px] text-[#94A3B8] font-normal">ta</span></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50/30 p-6 rounded-2xl border border-purple-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-14 h-14 bg-white text-purple-600 rounded-2xl flex items-center justify-center text-[24px] shadow-sm border border-purple-50">📦</div>
                  <div>
                    <div className="text-[13px] font-bold text-purple-600/70 uppercase tracking-wider mb-1">Xizmat turlari</div>
                    <div className="text-[28px] font-black text-[#0F172A] leading-none">{categories.length} <span className="text-[14px] text-[#94A3B8] font-normal">ta</span></div>
                  </div>
                </div>
              </div>

              {/* Two Column Layout for Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                
                {/* Recent Payments */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col h-[380px]">
                  <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center shrink-0">
                    <h3 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Oxirgi to'lovlar
                    </h3>
                    <button onClick={() => setTab('payments')} className="text-[12px] font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">Barchasi</button>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scroll p-2">
                    <div className="divide-y divide-[#F1F5F9]">
                      {payments.slice(0, 5).map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[14px] ${p.status === 'pending' ? 'bg-amber-100 text-amber-600' : p.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {p.user?.name?.[0]}
                            </div>
                            <div>
                              <div className="text-[13px] font-bold text-[#0F172A]">{p.user?.name}</div>
                              <div className="text-[11px] text-[#64748B]">{new Date(p.createdAt || Date.now()).toLocaleDateString('uz')}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[14px] font-black text-[#0F172A]">{fmt(p.amount)} <span className="text-[10px] text-[#94A3B8]">UZS</span></div>
                            <div className={`text-[10px] font-bold uppercase ${p.status === 'pending' ? 'text-amber-500' : p.status === 'approved' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {t(p.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {payments.length === 0 && <div className="p-10 text-center text-[#94A3B8] font-bold text-[13px]">To'lovlar yo'q</div>}
                    </div>
                  </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col h-[380px]">
                  <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center shrink-0">
                    <h3 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Yangi qo'shilganlar
                    </h3>
                    <button onClick={() => setTab('users')} className="text-[12px] font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">Barchasi</button>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scroll p-2">
                    <div className="divide-y divide-[#F1F5F9]">
                      {users.slice(0, 5).map(u => (
                        <div key={u.id} className="flex justify-between items-center p-3 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[14px] ${u.role === 'worker' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                              {u.name?.[0]}
                            </div>
                            <div>
                              <div className="text-[13px] font-bold text-[#0F172A]">{u.name}</div>
                              <div className="text-[11px] text-[#64748B]">{u.phone}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'worker' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                              {u.role === 'worker' ? 'Usta' : 'Mijoz'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {users.length === 0 && <div className="p-10 text-center text-[#94A3B8] font-bold text-[13px]">Foydalanuvchilar yo'q</div>}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {tab === 'payments' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between w-full gap-4">
                  <div className="flex bg-white p-1 rounded-lg border border-[#E2E8F0] shadow-sm overflow-x-auto w-full md:w-auto">
                    <button onClick={() => setPaymentFilter('all')} className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-colors whitespace-nowrap ${paymentFilter === 'all' ? 'bg-[#F1F5F9] text-[#0F172A]' : 'text-[#64748B] hover:bg-gray-50'}`}>Barchasi</button>
                    <button onClick={() => setPaymentFilter('pending')} className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${paymentFilter === 'pending' ? 'bg-[#FFFBEB] text-[#D97706]' : 'text-[#64748B] hover:bg-gray-50'}`}>
                      Kutilmoqda {pendingPaymentsCount > 0 && <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded text-[10px] leading-none">{pendingPaymentsCount}</span>}
                    </button>
                    <button onClick={() => setPaymentFilter('approved')} className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-colors whitespace-nowrap ${paymentFilter === 'approved' ? 'bg-[#ECFDF5] text-[#059669]' : 'text-[#64748B] hover:bg-gray-50'}`}>Tasdiqlangan</button>
                    <button onClick={() => setPaymentFilter('rejected')} className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-colors whitespace-nowrap ${paymentFilter === 'rejected' ? 'bg-[#FEF2F2] text-[#DC2626]' : 'text-[#64748B] hover:bg-gray-50'}`}>Bekor qilingan</button>
                  </div>
                  <div className="relative w-full md:w-[300px]">
                    <input value={paymentSearch} onChange={e => setPaymentSearch(e.target.value)} placeholder="Ism yoki telefon orqali izlash..." className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
                    <span className="absolute left-3 top-2.5 text-[#94A3B8] text-[12px]">🔍</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto -webkit-overflow-scrolling-touch">
                  <div className="min-w-[700px] grid grid-cols-[auto_2fr_1.5fr_1fr_1.5fr_1.5fr] gap-4 px-4 lg:px-6 py-3 border-b border-[#E2E8F0] text-[11px] text-[#64748B] font-semibold bg-[#F8FAFC]">
                    <span>ID</span>
                    <span>Foydalanuvchi</span>
                    <span>Telefon</span>
                    <span>Summa</span>
                    <span>Sana va Vaqt</span>
                    <span>Holat & Amallar</span>
                  </div>
                  <div className="divide-y divide-[#E2E8F0] min-w-[700px]">
                    {filteredPayments.length === 0 ? (
                      <div className="p-10 text-center text-[#64748B]">Ma'lumot topilmadi</div>
                    ) : filteredPayments.map(p => (
                      <div key={p.id} className="grid grid-cols-[auto_2fr_1.5fr_1fr_1.5fr_1.5fr] gap-4 items-center px-4 lg:px-6 py-4 text-[13px] text-[#0F172A] hover:bg-[#F8FAFC]">
                        <div className="text-[#64748B] font-medium">#{p.id}</div>
                        <div className="font-semibold flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold ${p.status === 'pending' ? 'bg-amber-50 text-amber-600' : p.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {p.user?.name?.[0]}
                          </div>
                          {p.user?.name}
                        </div>
                        <div className="text-[#64748B]">{p.user?.phone}</div>
                        <div className="font-bold text-[#2563EB]">{fmt(p.amount)} <span className="text-[10px] text-[#94A3B8]">UZS</span></div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#0F172A]">{new Date(p.createdAt || Date.now()).toLocaleDateString('uz-UZ')}</span>
                          <span className="text-[11px] text-[#64748B]">{new Date(p.createdAt || Date.now()).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => p.checkImg ? setSelectedReceipt(p.checkImg) : alert('Chek topilmadi', 'Ushbu to`lov uchun chek yuklanmagan yoki o`chirilgan')} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[14px] transition-colors ${p.checkImg ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-gray-400'}`} title="Chekni ko'rish">
                            📄
                          </button>
                          
                          {p.status === 'approved' && <span className="text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-md text-[11px] font-bold">● Tasdiqlandi</span>}
                          {p.status === 'rejected' && <span className="text-[#EF4444] bg-[#FEF2F2] px-2.5 py-1 rounded-md text-[11px] font-bold">● Rad etildi</span>}
                          
                          {p.status === 'pending' && (
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[#F59E0B] bg-[#FFFBEB] px-2.5 py-1 rounded-md text-[11px] font-bold">Kutilmoqda</span>
                              <div className="flex gap-1.5 ml-auto">
                                <button onClick={() => approvePayment(p.id)} className="w-7 h-7 bg-[#10B981] text-white text-[12px] rounded hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center" title="Tasdiqlash">✓</button>
                                <button onClick={() => rejectPayment(p.id)} className="w-7 h-7 bg-white border border-[#E2E8F0] text-[#EF4444] text-[12px] rounded hover:bg-red-50 transition-colors flex items-center justify-center" title="Rad etish">✕</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Pagination current={pages.payments} total={totals.payments} onPageChange={(p) => changePage('payments', p)} />
            </div>
          )}

          {tab === 'users' && (
            <div className="flex flex-col gap-6">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex bg-white p-1 rounded-lg border border-[#E2E8F0]">
                  <button onClick={() => setUserTab('worker')} className={`px-5 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${userTab === 'worker' ? 'bg-[#F1F5F9] text-[#0F172A]' : 'text-[#64748B]'}`}>Ustalar</button>
                  <button onClick={() => setUserTab('client')} className={`px-5 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${userTab === 'client' ? 'bg-[#F1F5F9] text-[#0F172A]' : 'text-[#64748B]'}`}>Mijozlar</button>
                </div>
                <div className="relative w-full md:w-[300px]">
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidiruv..." className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
                  <span className="absolute left-3 top-2.5 text-[#94A3B8] text-[12px]">🔍</span>
                </div>
              </div>

              {/* Users Light Table */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[640px] grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr] gap-4 px-4 lg:px-6 py-3 border-b border-[#E2E8F0] text-[11px] text-[#64748B] font-semibold">
                    <span>ID</span>
                    <span>Ism familiya</span>
                    <span>Telefon</span>
                    <span>{userTab === 'worker' ? 'Balans' : 'Sarflagan'}</span>
                    <span>Status</span>
                    <span>Amallar</span>
                  </div>
                  <div className="divide-y divide-[#E2E8F0] min-w-[640px]">
                    {filteredUsers.length === 0 ? (
                      <div className="p-10 text-center text-[#64748B]">Ma'lumot topilmadi</div>
                    ) : filteredUsers.map(u => (
                      <div key={u.id} className={`grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr] gap-4 items-center px-4 lg:px-6 py-4 text-[13px] hover:bg-[#F8FAFC] transition-colors ${u.isBlocked ? 'opacity-70' : ''}`}>
                        <div className="text-[#64748B] font-medium">#USR-{u.id.toString().padStart(3, '0')}</div>
                        <div className="font-semibold text-[#0F172A]">{u.name || 'Nomaʼlum'}</div>
                        <div className="text-[#64748B]">{u.phone}</div>
                        <div className="font-semibold text-[#0F172A]">{fmt(userTab === 'worker' ? u.balance : u.totalSpent)} UZS</div>
                        <div>
                          {u.isBlocked ? (
                            <span className="text-[#EF4444] bg-[#FEF2F2] px-2 py-0.5 rounded text-[11px] font-semibold">● Bloklangan</span>
                          ) : (
                            <span className="text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded text-[11px] font-semibold">● Faol</span>
                          )}
                        </div>
                        <div>
                          <button onClick={() => { 
                            setBlockModal(u); 
                            setBlockReason(u.blockReason || '');
                            setBlockDays('7');
                          }} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                            {u.isBlocked ? '🔓 Ochish' : '🔒 Bloklash'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Pagination current={pages.users} total={totals.users} onPageChange={(p) => changePage('users', p)} />
            </div>
          )}

          {tab === 'cats' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="relative w-full md:w-80">
                   <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] text-[16px]">🔍</span>
                   <input value={catSearch} onChange={e => setCatSearch(e.target.value)} placeholder="Sohalardan qidirish..." className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
                 </div>
                 <button onClick={() => { setEditId(null); setNewCat(''); setNewIcon(''); setShowCatModal(true); }} className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm hover:bg-blue-600 transition-all active:scale-95 whitespace-nowrap">
                   + Yangi soha taklif qilish
                 </button>
              </div>

              {/* Categories Table */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden overflow-x-auto">
                <div className="min-w-[480px] grid grid-cols-[1fr_2fr_1.5fr_1fr] gap-4 px-4 lg:px-6 py-3 border-b border-[#E2E8F0] text-[11px] text-[#64748B] font-semibold">
                  <span>Ikonka</span>
                  <span>Soha nomi</span>
                  <span>Status</span>
                  <span>Amallar</span>
                </div>
                <div className="divide-y divide-[#E2E8F0]">
                  {filteredCategories.length === 0 ? (
                    <div className="p-10 text-center text-[#64748B]">Ma'lumot topilmadi</div>
                  ) : filteredCategories.map((c) => (
                    <div key={c.id} className="min-w-[480px] grid grid-cols-[1fr_2fr_1.5fr_1fr] gap-4 items-center px-4 lg:px-6 py-4 text-[13px] hover:bg-[#F8FAFC]">
                      <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[16px]">
                        {c.status === 'pending_update' && c.proposedIcon ? c.proposedIcon : c.icon}
                      </div>
                      <div className="font-semibold text-[#0F172A]">
                        {c.status === 'pending_update' && c.proposedName ? c.proposedName : c.name}
                      </div>
                      <div>
                        {c.status === 'active' && <span className="text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-md text-[11px] font-bold">Faol</span>}
                        {c.status === 'pending' && <span className="text-[#F59E0B] bg-[#FFFBEB] px-2.5 py-1 rounded-md text-[11px] font-bold">Kutilmoqda</span>}
                        {c.status === 'pending_update' && <span className="text-[#3B82F6] bg-[#EFF6FF] px-2.5 py-1 rounded-md text-[11px] font-bold">Tahrir kutilmoqda</span>}
                        {c.status === 'pending_delete' && <span className="text-[#EF4444] bg-[#FEF2F2] px-2.5 py-1 rounded-md text-[11px] font-bold">O'chirish kutilmoqda</span>}
                        {c.status === 'deleted' && <span className="text-[#94A3B8] bg-[#F1F5F9] px-2.5 py-1 rounded-md text-[11px] font-bold">O'chirilgan</span>}
                      </div>
                      <div>
                        {(c.status === 'active' || c.status === 'pending_update') && (
                           <button onClick={() => { setEditId(c.id); setNewCat(c.status === 'pending_update' ? c.proposedName : c.name); setNewIcon(c.status === 'pending_update' ? c.proposedIcon : c.icon); setShowCatModal(true); }} className="text-[#2563EB] font-semibold hover:underline text-[12px]">
                             Tahrirlash
                           </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pt-4">
              {/* Profile Card */}
              <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                {/* Cover Image Area */}
                <div className="h-40 bg-gradient-to-r from-[#1E293B] via-[#334155] to-[#0F172A] relative overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                   <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500 rounded-full blur-[80px] opacity-40"></div>
                </div>

                <div className="px-8 pb-8 pt-0 relative">
                  {/* Avatar & Title */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10 mb-10">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-[48px] font-black shadow-2xl border-4 border-white -mt-14 transform hover:-translate-y-1 transition-transform duration-300">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left mb-2">
                      <h3 className="text-[28px] font-black text-[#0F172A] leading-tight mb-1.5">{user?.name}</h3>
                      <p className="text-[#64748B] font-bold text-[13px] uppercase tracking-widest flex items-center gap-2 justify-center sm:justify-start">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                        Adminstrator
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="flex flex-col gap-5">
                      <div className="group">
                        <label className="block text-[12px] font-black text-[#64748B] uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-600 transition-colors">Telefon raqam (Login)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] opacity-50 group-focus-within:text-blue-600 transition-colors">📱</span>
                          <input value={profPhone} onChange={e => setProfPhone(e.target.value)} placeholder="+998901234567" className="w-full bg-white border border-[#E2E8F0] rounded-2xl pl-12 pr-4 py-3.5 text-[14px] font-bold text-[#0F172A] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-[#CBD5E1]" />
                        </div>
                      </div>
                      
                      <div className="group">
                        <label className="block text-[12px] font-black text-[#64748B] uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-600 transition-colors">To'liq ism-sharif</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] opacity-50 group-focus-within:text-blue-600 transition-colors">👤</span>
                          <input value={profName} onChange={e => setProfName(e.target.value)} placeholder="Ismingizni kiriting" className="w-full bg-white border border-[#E2E8F0] rounded-2xl pl-12 pr-4 py-3.5 text-[14px] font-bold text-[#0F172A] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-[#CBD5E1]" />
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-5">
                      <div className="group h-full flex flex-col justify-end">
                        <label className="block text-[12px] font-black text-[#64748B] uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-600 transition-colors">Yangi parol (ixtiyoriy)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] opacity-50 group-focus-within:text-blue-600 transition-colors">🔒</span>
                          <input type="password" value={profPass} onChange={e => setProfPass(e.target.value)} placeholder="Yangi parol kiriting" className="w-full bg-white border border-[#E2E8F0] rounded-2xl pl-12 pr-4 py-3.5 text-[14px] font-bold text-[#0F172A] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-[#CBD5E1]" />
                        </div>
                        <p className="text-[11px] text-[#94A3B8] mt-2 ml-2 font-medium">Agar parolni o'zgartirmoqchi bo'lmasangiz, bo'sh qoldiring.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-6 border-t border-[#F1F5F9] flex justify-end">
                    <button onClick={handleUpdateProfile} disabled={profSaving || (!profName.trim())} 
                      className="relative overflow-hidden px-8 py-3.5 bg-[#0F172A] text-white rounded-2xl text-[14px] font-black shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        {profSaving ? (
                          <><span className="animate-spin text-[16px]">⏳</span> Saqlanmoqda...</>
                        ) : (
                          <>O'zgarishlarni saqlash <span className="text-[16px]">✨</span></>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
              <h3 className="text-[16px] font-bold text-[#0F172A]">{editId ? "Sohani tahrirlash" : "Yangi soha taklif qilish"}</h3>
              <button onClick={() => setShowCatModal(false)} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors text-[20px] leading-none">&times;</button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] mb-1.5">Soha nomi</label>
                <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Masalan: Santexnik" className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#64748B] mb-1.5">Ikonka</label>
                <input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="Emoji yoki matn" className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all" />
              </div>
              
              <div className="flex items-start gap-2 text-[12px] text-[#D97706] bg-[#FFFBEB] p-3 rounded-xl">
                <span className="text-[16px] leading-none">ℹ️</span>
                <p className="leading-snug">
                  {editId 
                    ? "Sohadagi o'zgarishlar tasdiqlanishi uchun Super Adminga yuboriladi va ruxsat berilgandan so'ng yangilanadi." 
                    : "Yangi soha tasdiqlanishi uchun Super Adminga yuboriladi va ruxsat berilgandan so'ng tizimga qo'shiladi."}
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowCatModal(false)} className="flex-1 border border-[#E2E8F0] text-[#64748B] py-2.5 rounded-xl text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors">Bekor qilish</button>
                <button onClick={suggestCat} className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-xl text-[13px] font-semibold shadow-sm hover:bg-blue-600 transition-colors">
                  {editId ? "Yangilash" : "Taklif yuborish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block & User Profile Modal */}
      {blockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm p-4" onClick={() => setBlockModal(null)}>
          <div className="bg-white rounded-3xl p-0 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-[#E2E8F0]" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
               <h3 className="text-[16px] font-black text-[#0F172A]">Foydalanuvchi profili</h3>
               <button onClick={() => setBlockModal(null)} className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 flex items-center justify-center font-bold transition-all">✕</button>
            </div>

            <div className="p-6">
              {/* Profile Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-[28px] font-bold shadow-inner ${blockModal.isBlocked ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                  {blockModal.name?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="text-[20px] font-black text-[#0F172A] leading-tight">{blockModal.name || 'Nomaʼlum'}</h3>
                  <p className="text-[13px] text-[#64748B] mt-1 font-medium">{blockModal.phone} • <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${blockModal.role === 'worker' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{blockModal.role === 'worker' ? 'Usta' : 'Mijoz'}</span></p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-4 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider mb-1">Balans</p>
                  <p className="text-[18px] font-black text-[#0F172A]">{fmt(blockModal.balance)} <span className="text-[11px] text-[#64748B] font-semibold">UZS</span></p>
                </div>
                <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-4 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider mb-1">Sarflagan</p>
                  <p className="text-[18px] font-black text-[#0F172A]">{fmt(blockModal.totalSpent)} <span className="text-[11px] text-[#64748B] font-semibold">UZS</span></p>
                </div>
              </div>

              {/* Blocking UI */}
              {!blockModal.isBlocked ? (
                 <div className="border-2 border-red-100 bg-[#FEF2F2] p-5 rounded-2xl">
                   <div className="flex items-center gap-2 mb-4">
                     <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-[16px]">⚠️</span>
                     <h4 className="text-[15px] font-black text-red-600">Cheklov o'rnatish</h4>
                   </div>
                   <div className="flex flex-col gap-3">
                     <div>
                       <label className="block text-[12px] font-bold text-red-500 mb-1.5 ml-1">Bloklash sababi</label>
                       <input value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Masalan: Qoidabuzarlik uchun..." className="w-full bg-white border border-red-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all text-[#0F172A]" />
                     </div>
                     <div>
                       <label className="block text-[12px] font-bold text-red-500 mb-1.5 ml-1">Muddat</label>
                       <div className="relative">
                         <select value={blockDays} onChange={e => setBlockDays(e.target.value)} className="w-full bg-white border border-red-200 rounded-xl pl-4 pr-10 py-2.5 text-[13px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all appearance-none font-semibold text-[#0F172A]">
                            <option value="1">1 kun (24 soat)</option>
                            <option value="7">7 kun (1 hafta)</option>
                            <option value="30">30 kun (1 oy)</option>
                            <option value="365">1 yil (365 kun)</option>
                            <option value="3650">Butunlay (Umrbod)</option>
                         </select>
                         <span className="absolute right-4 top-2.5 text-red-400 pointer-events-none text-[12px]">▼</span>
                       </div>
                     </div>
                     <button onClick={handleBlock} className="w-full bg-red-500 text-white py-3 rounded-xl text-[14px] font-bold hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30 mt-1">Bloklashni tasdiqlash</button>
                   </div>
                 </div>
              ) : (
                 <div className="border-2 border-emerald-100 bg-[#ECFDF5] p-5 rounded-2xl flex flex-col gap-4">
                   <div className="flex items-start gap-3">
                     <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[20px] shrink-0">🔒</span>
                     <div>
                       <h4 className="text-[16px] font-black text-emerald-700 leading-tight">Hisob bloklangan</h4>
                       <p className="text-[13px] text-emerald-600/80 mt-1 font-medium"><span className="font-bold text-emerald-700">Sabab:</span> {blockModal.blockReason || 'Kiritilmagan'}</p>
                     </div>
                   </div>
                   <button onClick={handleUnblock} className="w-full bg-emerald-500 text-white py-3 rounded-xl text-[14px] font-bold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/30">Blokdan chiqarish (Ruxsat berish)</button>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt View Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-sm p-4" onClick={() => setSelectedReceipt(null)}>
          <div className="bg-white rounded-2xl p-2 relative max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 mb-2">
              <h3 className="font-bold text-[#0F172A]">To'lov cheki</h3>
              <button onClick={() => setSelectedReceipt(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center font-bold transition-colors">✕</button>
            </div>
            <div className="bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden min-h-[300px]">
              <img src={selectedReceipt.startsWith('http') || selectedReceipt.startsWith('data') ? selectedReceipt : `http://localhost:3000${selectedReceipt}`} alt="Chek" className="w-full h-auto max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
