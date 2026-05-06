import { useState } from 'react'
import Pagination from '../../components/Pagination'

export default function SATransactions({ t, fmt, transactions, pages, totals, changePage, searchQueries, handleSearch }) {
  return (
    <div className="p-6 lg:p-8 flex flex-col gap-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-black text-[#0F172A]">💳 {t('Tranzaksiyalar')}</h1>
          <p className="text-[13px] text-[#718096]">{t("Barcha moliyaviy operatsiyalar")}</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
          <input 
            value={searchQueries.transactions} 
            onChange={e => handleSearch('transactions', e.target.value)} 
            placeholder={t("Tranzaksiyalardan qidirish...")} 
            className="w-full bg-white border border-[#E8EDF5] rounded-2xl pl-12 pr-4 py-3 text-[13px] font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* Head */}
          <div className="min-w-[580px] grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-[#F8FAFC] border-b border-[#E8EDF5] text-[10px] text-[#94A3B8] font-black uppercase tracking-wider">
            <span>ID</span>
            <span>{t("Foydalanuvchi")}</span>
            <span>{t("Tavsif")}</span>
            <span>{t("Turi")}</span>
            <span>{t("Summa")}</span>
            <span>{t("Sana")}</span>
          </div>

          <div className="divide-y divide-[#F1F5F9] min-w-[580px]">
            {transactions.length === 0 ? (
              <div className="py-20 text-center">
                 <div className="text-[40px] mb-2 opacity-20">{searchQueries.transactions ? '🖎' : '💳'}</div>
                 <div className="text-[#A0AEC0] font-bold text-[15px]">{searchQueries.transactions ? t("Natija topilmadi") : t("Tranzaksiyalar topilmadi")}</div>
              </div>
            ) : transactions.map(tr => (
              <div key={tr.id} className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_1fr] gap-4 items-center px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="text-[11px] font-black text-[#A0AEC0]">#{tr.id}</div>

                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[18px] shrink-0 ${tr.type === 'topup' ? 'bg-green-50' : 'bg-orange-50'}`}>
                    {tr.type === 'topup' ? '💰' : '📉'}
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-[#1A202C]">{tr.user?.name || '—'}</div>
                    <div className="text-[10px] text-[#A0AEC0]">{tr.user?.phone}</div>
                  </div>
                </div>

                <div className="text-[12px] text-[#64748B] font-medium truncate">{tr.desc || '—'}</div>

                <div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${tr.type === 'topup' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {t(tr.type)}
                  </span>
                </div>

                <div className={`text-[14px] font-black ${tr.type === 'topup' ? 'text-green-600' : 'text-orange-600'}`}>
                  {tr.type === 'topup' ? '+' : '-'}{fmt(tr.amount)}
                </div>

                <div className="text-[11px] text-[#A0AEC0] font-bold">
                  {new Date(tr.createdAt).toLocaleDateString('uz')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Pagination current={pages.transactions} total={totals.transactions} onPageChange={p => changePage('transactions', p)} />
    </div>
  )
}
