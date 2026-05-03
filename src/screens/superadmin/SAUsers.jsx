import { useState } from 'react'
import { adminApi } from '../../api'
import Pagination from '../../components/Pagination'

const STATUS_BADGE = {
  active:     'bg-blue-50 text-blue-600',
  worker:     'bg-blue-50 text-blue-600',
  client:     'bg-violet-50 text-violet-600',
  admin:      'bg-amber-50 text-amber-600',
  superadmin: 'bg-rose-50 text-rose-600',
}

export default function SAUsers({ t, fmt, getCatName, users, pages, totals, changePage, blockUser, unblockUser, deleteUser, restoreUser, createAdmin, fetchData, showModal }) {
  const [userTab, setUserTab] = useState('workers')
  const [search, setSearch] = useState('')
  const [selectedUserJobs, setSelectedUserJobs] = useState(null)
  const [ujLoading, setUjLoading] = useState(false)

  const filtered = users.filter(u => {
    const matchRole = userTab === 'workers' ? u.role === 'worker' : userTab === 'clients' ? u.role === 'client' : (u.role === 'admin' || u.role === 'superadmin')
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search)
    return matchRole && matchSearch
  })

  const showUserJobs = async (id) => {
    setUjLoading(true)
    try {
      const res = await adminApi.getUserJobs(id)
      setSelectedUserJobs(res.data.data)
    } catch(e) { console.error(e) }
    finally { setUjLoading(false) }
  }

  const tabs = [
    { id: 'workers', label: 'Ustalar',  icon: '👷' },
    { id: 'clients', label: 'Mijozlar', icon: '🧑' },
    { id: 'admins',  label: 'Adminlar', icon: '🛡️' },
  ]

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-black text-[#0F172A]">👥 {t('Odamlar')}</h1>
          <p className="text-[13px] text-[#718096]">{t("Barcha foydalanuvchilarni boshqarish")}</p>
        </div>
        {userTab === 'admins' && (
          <button onClick={createAdmin} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[13px] font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95">
            + {t("Qo'shish")}
          </button>
        )}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl w-fit">
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => setUserTab(tb.id)}
              className={`px-4 py-2 rounded-lg text-[12px] font-black transition-all ${userTab === tb.id ? 'bg-white text-[#1E6FD9] shadow-sm' : 'text-[#718096] hover:text-[#1A202C]'}`}>
              {tb.icon} {t(tb.label)} {userTab === tb.id && `(${filtered.length})`}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs flex items-center gap-2 bg-white border border-[#E8EDF5] rounded-xl px-4 py-2.5 shadow-sm">
          <span className="text-gray-400">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Qidiruv...")} className="flex-1 bg-transparent outline-none text-[13px] text-[#1A202C] font-bold" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* Table head */}
          <div className="min-w-[600px] grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-[#F8FAFC] border-b border-[#E8EDF5] text-[10px] text-[#94A3B8] font-black uppercase tracking-wider">
            <span>{t("Foydalanuvchi")}</span>
            <span>{t("Telefon")}</span>
            <span>{t("Balans")}</span>
            <span>{t("Daromad/Xarajat")}</span>
            <span>{t("Status")}</span>
            <span>{t("Amallar")}</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#F1F5F9] min-w-[600px]">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-[#A0AEC0] font-bold">{t("Foydalanuvchilar topilmadi")}</div>
            ) : filtered.map(u => (
              <div key={u.id} className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-[#F8FAFC] transition-colors ${u.isDeleted ? 'opacity-50' : ''}`}>
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[15px] font-black text-blue-600 shrink-0">
                    {u.name?.[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-[#1A202C] flex items-center gap-1.5 flex-wrap">
                      {u.name}
                      {u.isDeleted && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[8px] rounded font-black uppercase">O'chirilgan</span>}
                      {!u.isDeleted && u.isBlocked && <span className="px-1.5 py-0.5 bg-red-100 text-red-500 text-[8px] rounded font-black uppercase">Bloklangan</span>}
                    </div>
                    {u.region && <div className="text-[10px] text-[#A0AEC0] font-medium">📍 {u.region}{u.district ? `, ${u.district}` : ''}</div>}
                  </div>
                </div>

                {/* Phone */}
                <div className="text-[12px] font-bold text-[#475569]">{u.phone}</div>

                {/* Balance */}
                <div className="text-[12px] font-black text-[#1A202C]">{fmt(u.balance || 0)}</div>

                {/* Earned/Spent */}
                <button onClick={() => showUserJobs(u.id)} className="text-left hover:underline">
                  <div className="text-[12px] font-black text-emerald-600">{u.role === 'worker' ? `+${fmt(u.totalEarned||0)}` : `-${fmt(u.totalSpent||0)}`}</div>
                </button>

                {/* Status */}
                <div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${STATUS_BADGE[u.role] || 'bg-gray-100 text-gray-500'}`}>
                    {t(u.role)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {u.isDeleted ? (
                    <button onClick={() => restoreUser(u.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all">{t("Tiklash")}</button>
                  ) : (
                    <>
                      <button onClick={() => blockUser(u.id)} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black hover:bg-amber-200 transition-all">
                        {u.isBlocked ? t('Muddat') : t('Blok')}
                      </button>
                      {u.isBlocked && (
                        <button onClick={() => unblockUser(u.id)} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-[10px] font-black hover:bg-green-200 transition-all">{t("Ochish")}</button>
                      )}
                      <button onClick={() => deleteUser(u.id)} className="w-8 h-8 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors text-[14px]">🗑️</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Pagination current={pages.users} total={totals.users} onPageChange={p => changePage('users', p)} />

      {/* User Jobs Modal */}
      {selectedUserJobs && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setSelectedUserJobs(null)}>
          <div className="bg-white w-full max-w-[500px] max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#E8EDF5] flex justify-between items-center">
              <h3 className="font-black text-[16px] text-[#1A202C]">{t("Foydalanuvchi ishlari")}</h3>
              <button onClick={() => setSelectedUserJobs(null)} className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {ujLoading ? (
                <div className="py-10 flex justify-center"><div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : selectedUserJobs.length === 0 ? (
                <div className="py-10 text-center text-[#A0AEC0] font-bold">{t("Ishlar topilmadi")}</div>
              ) : selectedUserJobs.map(j => (
                <div key={j.id} className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E8EDF5] flex justify-between items-center">
                  <div>
                    <div className="text-[13px] font-black text-[#1A202C]">{j.title}</div>
                    <div className="text-[10px] text-[#A0AEC0] mt-0.5">{new Date(j.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${j.status==='done'?'bg-green-100 text-green-600':'bg-blue-100 text-blue-600'}`}>{j.status}</span>
                    <div className="text-[13px] font-black text-blue-600 mt-1">{fmt(j.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
