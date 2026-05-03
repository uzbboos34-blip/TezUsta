import { useState } from 'react'
import { useApp } from '../context'
import { useT } from '../i18n'

export default function LangScreen() {
  const { dispatch, state } = useApp()
  const t = useT()

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#1251C5] via-[#3B82F6] to-[#E8F0FF]">
      <div className="flex-1 flex flex-col items-center justify-center p-8 pb-7">
        <div className="w-[90px] h-[90px] bg-white/10 rounded-[26px] flex items-center justify-center backdrop-blur-md border-[1.5px] border-white/30 mb-5 shadow-[0_8px_40px_rgba(18,81,197,0.2)]">
          <svg viewBox="0 0 58 58" fill="none" className="w-[58px] h-[58px]">
            <rect x="9" y="16" width="40" height="10" rx="5" fill="url(#paint_lg)"/>
            <rect x="24" y="16" width="10" height="32" rx="5" fill="url(#paint_lg)"/>
            <circle cx="43" cy="18" r="9" fill="url(#paint_lg)"/>
            <circle cx="43" cy="18" r="4" fill="white"/>
            <defs>
              <linearGradient id="paint_lg" x1="0" y1="0" x2="58" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22C55E"/>
                <stop offset="100%" stopColor="#16A34A"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="text-4xl font-extrabold text-white tracking-tight">{t("TezUsta")}</div>
        <div className="text-[13px] text-white/80 mt-1 text-center">{t("Xizmat marketplace — tez, ishonchli, arzon")}</div>
      </div>

      <div className="bg-white/10 rounded-3xl p-7 mx-5 backdrop-blur-xl border border-white/20">
        <div className="text-center text-xs font-semibold text-white/70 tracking-widest uppercase mb-5">{t("Tilni tanlang")}</div>
        
        {[
          { id: 'uz', flag: '🇺🇿', name: t("O'zbekcha (lotin)") },
          { id: 'kir', flag: '🇺🇿', name: t("Ўзбекча (кирил)") },
          { id: 'ru', flag: '🇷🇺', name: t("Русский") },
        ].map(l => (
          <button 
            key={l.id} 
            onClick={() => dispatch({ type: 'SET_LANG', lang: l.id })}
            className={`flex items-center gap-3 w-full bg-white border-2 rounded-xl p-[15px] mb-3 transition-all ${state.lang === l.id ? 'border-[#1E6FD9] bg-[#EBF3FF]' : 'border-transparent shadow-[0_2px_12px_rgba(18,81,197,0.12)]'}`}>
            <span className="text-[24px]">{l.flag}</span>
            <span className="text-[15px] font-semibold text-[#1A202C] flex-1 text-left">{l.name}</span>
            <span className={`w-[22px] h-[22px] rounded-full flex items-center justify-center transition-colors ${state.lang === l.id ? 'bg-[#22C55E]' : 'bg-[#E8EDF5]'}`}>
              <svg viewBox="0 0 14 14" className="w-3 h-3 stroke-white stroke-[2.5px] fill-none">
                <polyline points="2 7 5.5 10.5 12 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        ))}
      </div>

      <div className="p-5 pb-6">
        <button 
          onClick={() => dispatch({ type: 'GO', screen: 'role' })}
          className="w-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white font-bold py-[15px] rounded-[14px] shadow-[0_4px_16px_rgba(34,197,94,0.38)] active:scale-95 transition-transform">
          {t("Davom etish \u2192")}
        </button>
      </div>
    </div>
  )
}
