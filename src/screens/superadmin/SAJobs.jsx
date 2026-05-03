import { useState } from 'react'
import Pagination from '../../components/Pagination'

const STATUS = {
  open:       { label: 'Ochiq',     cls: 'bg-amber-50 text-amber-600' },
  active:     { label: 'Faol',      cls: 'bg-blue-50 text-blue-600' },
  finishing:  { label: 'Tugayapti', cls: 'bg-violet-50 text-violet-600' },
  done:       { label: 'Bajarildi', cls: 'bg-green-50 text-green-600' },
  cancelled:  { label: 'Bekor',     cls: 'bg-red-50 text-red-500' },
}

export default function SAJobs({ t, fmt, getCatName, jobs, pages, totals, changePage }) {
  const [search, setSearch] = useState('')

  const filteredJobs = jobs.filter(j => 
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    getCatName(j.cat)?.toLowerCase().includes(search.toLowerCase()) ||
    j.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    j.worker?.name?.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="p-6 lg:p-8 flex flex-col gap-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-black text-[#0F172A]">💼 {t('Ishlar')}</h1>
          <p className="text-[13px] text-[#718096]">{t("Barcha e'lon qilingan ishlar")}</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder={t("Ishlardan qidirish...")} 
            className="w-full bg-white border border-[#E8EDF5] rounded-2xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* Head */}
          <div className="min-w-[600px] grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 bg-[#F8FAFC] border-b border-[#E8EDF5] text-[10px] text-[#94A3B8] font-black uppercase tracking-wider">
            <span>{t("Ish nomi")}</span>
            <span>{t("Kategoriya")}</span>
            <span>{t("Mijoz")}</span>
            <span>{t("Usta")}</span>
            <span>{t("Narx")}</span>
            <span>{t("Status")}</span>
          </div>

          <div className="divide-y divide-[#F1F5F9] min-w-[600px]">
            {filteredJobs.length === 0 ? (
              <div className="py-20 text-center">
                 <div className="text-[40px] mb-2 opacity-20">{search ? '🖎' : '💼'}</div>
                 <div className="text-[#A0AEC0] font-bold text-[15px]">{search ? t("Natija topilmadi") : t("Ishlar topilmadi")}</div>
              </div>
            ) : filteredJobs.map(j => {
              const st = STATUS[j.status] || { label: j.status, cls: 'bg-gray-100 text-gray-500' }
              return (
                <div key={j.id} className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] gap-4 items-center px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                  <div>
                    <div className="text-[13px] font-black text-[#1A202C] truncate">{j.title}</div>
                    <div className="text-[10px] text-[#A0AEC0] mt-0.5">{new Date(j.createdAt).toLocaleDateString('uz')}</div>
                  </div>
                  <div className="text-[11px] font-bold text-[#64748B]">{getCatName(j.cat)}</div>
                  <div className="text-[12px] font-bold text-[#1A202C]">{j.client?.name || '—'}</div>
                  <div className="text-[12px] font-bold text-[#1A202C]">{j.worker?.name || <span className="text-[#A0AEC0]">Topilmadi</span>}</div>
                  <div className="text-[13px] font-black text-blue-600">{j.price === 0 ? t('Kelishiladi') : fmt(j.price)}</div>
                  <div><span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${st.cls}`}>{t(st.label)}</span></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Pagination current={pages.jobs} total={totals.jobs} onPageChange={p => changePage('jobs', p)} />
    </div>
  )
}
