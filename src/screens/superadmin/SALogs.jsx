import { useState } from 'react'
import Pagination from '../../components/Pagination'

const ACTION_CONFIG = {
  user_login:     { label: 'Kirish',       color: 'bg-blue-50 text-blue-600',    icon: '🔑' },
  user_register:  { label: 'Ro\'yxat',     color: 'bg-emerald-50 text-emerald-600', icon: '✨' },
  user_block:     { label: 'Bloklash',     color: 'bg-red-50 text-red-600',      icon: '🚫' },
  user_unblock:   { label: 'Blokdan ochish',color: 'bg-green-50 text-green-600',    icon: '🔓' },
  payment_approve:{ label: 'To\'lov OK',    color: 'bg-teal-50 text-teal-600',     icon: '✅' },
  payment_reject: { label: 'To\'lov RAD',   color: 'bg-rose-50 text-rose-600',     icon: '❌' },
  job_create:     { label: 'Ish yaratish',  color: 'bg-indigo-50 text-indigo-600',  icon: '📝' },
  job_take:       { label: 'Ish olish',     color: 'bg-violet-50 text-violet-600',  icon: '🛠️' },
  chat_create:    { label: 'Chat',         color: 'bg-sky-50 text-sky-600',      icon: '💬' },
}

export default function SALogs({ t, logs, pages, totals, changePage, searchQueries, handleSearch }) {
  return (
    <div className="p-6 lg:p-8 flex flex-col gap-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-black text-[#0F172A]">📋 {t('Loglar')}</h1>
          <p className="text-[13px] text-[#718096]">{t("Tizim harakatlari tarixi")}</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
          <input 
            value={searchQueries.logs} 
            onChange={e => handleSearch('logs', e.target.value)} 
            placeholder={t("Loglardan qidirish...")} 
            className="w-full bg-white border border-[#E8EDF5] rounded-2xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[580px] grid grid-cols-[1.5fr_1fr_3fr_1fr] gap-4 px-5 py-3 bg-[#F8FAFC] border-b border-[#E8EDF5] text-[10px] text-[#94A3B8] font-black uppercase tracking-wider">
            <span>{t("Foydalanuvchi")}</span>
            <span>{t("Harakat")}</span>
            <span>{t("Tafsilot")}</span>
            <span>{t("Vaqt")}</span>
          </div>

          <div className="divide-y divide-[#F1F5F9] min-w-[580px]">
            {logs.length === 0 ? (
              <div className="py-20 text-center">
                 <div className="text-[40px] mb-2 opacity-20">{searchQueries.logs ? '🖎' : '📂'}</div>
                 <div className="text-[#A0AEC0] font-bold text-[15px]">{searchQueries.logs ? t("Natija topilmadi") : t("Loglar topilmadi")}</div>
              </div>
            ) : logs.map(l => {
              const config = ACTION_CONFIG[l.action?.toLowerCase()] || { label: l.action, color: 'bg-slate-100 text-slate-600', icon: '⚙️' }
              return (
                <div key={l.id} className="grid grid-cols-[1.5fr_1.2fr_3fr_1fr] gap-4 items-center px-5 py-4 hover:bg-[#F8FAFC] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[14px] font-bold text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      {l.user?.name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="text-[13px] font-black text-[#1A202C] leading-tight">{l.user?.name || 'Tizim'}</div>
                      <div className="text-[10px] text-[#A0AEC0] font-bold uppercase tracking-wider">{l.user?.role || 'system'}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm ${config.color}`}>
                      <span className="text-[12px]">{config.icon}</span>
                      {t(config.label)}
                    </span>
                  </div>

                  <div className="relative">
                    {l.details ? (
                      <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-[#E8EDF5] font-mono text-[11px] max-h-[72px] overflow-y-auto scrollbar-hide">
                         <div className="flex flex-wrap gap-x-3 gap-y-1">
                           {Object.entries(l.details).map(([key, val]) => (
                             <div key={key} className="flex items-center gap-1">
                                <span className="text-blue-500 font-bold opacity-70">{key}:</span>
                                <span className="text-[#334155] font-semibold">{typeof val === 'object' ? '...' : String(val)}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-[#A0AEC0] italic text-[11px]">
                         {t("Harakat tafsilotlari mavjud emas")}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[13px] font-black text-[#1A202C]">
                      {new Date(l.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] text-[#A0AEC0] font-bold">
                      {new Date(l.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Pagination current={pages.logs} total={totals.logs} onPageChange={p => changePage('logs', p)} />
    </div>
  )
}
