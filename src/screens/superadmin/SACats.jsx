import { useState } from 'react'
import { adminApi } from '../../api'

export default function SACats({ t, categories, fetchData, showModal }) {
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filteredCats = categories.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.proposedName?.toLowerCase().includes(search.toLowerCase())
  )

  const approveCat = async (id) => {
    try { await adminApi.approveCategory(id); showModal('✅', t('Tasdiqlandi'), ''); fetchData(true) }
    catch(e) {}
  }
  const deleteCat = async (id) => {
    if (!window.confirm(t("O'chirilsinmi?"))) return
    try { await adminApi.deleteCategory(id); showModal('🗑️', t("O'chirildi"), ''); fetchData(true) }
    catch(e) {}
  }
  const saveCat = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await adminApi.createCategory({ name: newName, icon: newIcon || '🔧' })
      showModal('✅', t('Yaratildi'), '')
      setNewName(''); setNewIcon('')
      fetchData(true)
    } catch(e) { showModal('❌', t('Xato'), '') }
    finally { setSaving(false) }
  }

  const STATUS_INFO = {
    active:         { label: 'Faol',     cls: 'bg-green-50 text-green-600' },
    pending:        { label: 'Kutilmoqda', cls: 'bg-amber-50 text-amber-600' },
    pending_update: { label: 'Tahrir kutilmoqda', cls: 'bg-blue-50 text-blue-500' },
    pending_delete: { label: 'O\'chirish kutilmoqda', cls: 'bg-red-50 text-red-500' },
    deleted:        { label: 'O\'chirilgan', cls: 'bg-gray-100 text-gray-400' },
  }

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-black text-[#0F172A]">🗂️ {t('Sohalar')}</h1>
          <p className="text-[13px] text-[#718096]">{t("Xizmat kategoriyalarini boshqarish")}</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder={t("Sohalardan qidirish...")} 
            className="w-full bg-white border border-[#E8EDF5] rounded-2xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
          />
        </div>
      </div>

      {/* Add new */}
      <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm p-5">
        <h3 className="text-[14px] font-black text-[#1A202C] mb-4">✨ {t("Yangi soha qo'shish")}</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="🔧" maxLength={2}
            className="w-14 shrink-0 bg-[#F8FAFC] border border-[#E8EDF5] rounded-xl text-center text-[20px] py-3 outline-none focus:border-blue-400 transition-colors" />
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t("Soha nomi")}
            className="flex-1 bg-[#F8FAFC] border border-[#E8EDF5] rounded-xl px-4 py-3 text-[13px] font-bold outline-none focus:border-blue-400 transition-colors" />
          <button onClick={saveCat} disabled={saving || !newName.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[13px] shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
            {saving ? '...' : t("+ Qo'shish")}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[560px] grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-[#F8FAFC] border-b border-[#E8EDF5] text-[10px] text-[#94A3B8] font-black uppercase tracking-wider">
            <span>{t("Ikonka")}</span>
            <span>{t("Nomi")}</span>
            <span>{t("Holat")}</span>
            <span>{t("Ustalar")}</span>
            <span>{t("E'lonlar")}</span>
            <span>{t("Amallar")}</span>
          </div>

          <div className="divide-y divide-[#F1F5F9] min-w-[560px]">
            {filteredCats.length === 0 ? (
              <div className="py-20 text-center">
                 <div className="text-[40px] mb-2 opacity-20">{search ? '🖎' : '📂'}</div>
                 <div className="text-[#A0AEC0] font-bold text-[15px]">{search ? t("Natija topilmadi") : t("Sohalar topilmadi")}</div>
              </div>
            ) : filteredCats.map(c => {
              const si = STATUS_INFO[c.status] || { label: c.status, cls: 'bg-gray-100 text-gray-500' }
              return (
                <div key={c.id} className={`grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-[#F8FAFC] transition-colors ${c.status === 'deleted' ? 'opacity-40' : ''}`}>
                  <div className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center text-[22px] border border-[#E8EDF5]">
                    {c.status === 'pending_update' && c.proposedIcon && c.proposedIcon !== c.icon ? (
                       <div className="flex flex-col items-center leading-none">
                         <span className="line-through text-gray-300 text-[12px]">{c.icon}</span>
                         <span className="text-blue-500 text-[18px] mt-1">{c.proposedIcon}</span>
                       </div>
                    ) : c.icon}
                  </div>
                  <div className="text-[13px] font-black text-[#1A202C]">
                    {c.status === 'pending_update' && c.proposedName && c.proposedName !== c.name ? (
                       <div className="flex flex-col leading-tight">
                         <span className="line-through text-gray-400 text-[11px] font-semibold">{c.name}</span>
                         <span className="text-blue-600">{c.proposedName}</span>
                       </div>
                    ) : c.name}
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase w-fit ${si.cls}`}>{t(si.label)}</span>
                  <div className="text-[12px] font-bold text-[#64748B]">{c.workerCount ?? 0} {t('ta')}</div>
                  <div className="text-[12px] font-bold text-[#64748B]">{c.jobCount ?? 0} {t('ta')}</div>
                  <div className="flex gap-2">
                    {(c.status === 'pending' || c.status === 'pending_delete' || c.status === 'pending_update') && (
                      <button onClick={() => approveCat(c.id)} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-[10px] font-black hover:bg-green-600 transition-all active:scale-95">{t("Tasdiqlash")}</button>
                    )}
                    {c.status !== 'deleted' && (
                      <button onClick={() => deleteCat(c.id)} className="w-8 h-8 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors text-[14px]">
                        {c.status.startsWith('pending') ? '✕' : '🗑️'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
