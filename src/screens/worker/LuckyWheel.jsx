import { useState, useEffect } from 'react'
import { useApp } from '../../context'
import { useT } from '../../i18n'
import { usersApi } from '../../api'

export default function LuckyWheel() {
  const { state, dispatch } = useApp()
  const t = useT()
  const [spinning, setSpinning] = useState(false)
  const [prize, setPrize] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const colors = [
    ['#FFD700', '#B8860B'], ['#4F46E5', '#312E81'], ['#DB2777', '#831843'], ['#059669', '#064E3B'],
    ['#E11D48', '#881337'], ['#0891B2', '#164E63'], ['#7C3AED', '#4C1D95'], ['#EA580C', '#7C2D12'],
  ]

  const getSticker = (amount) => {
    if (amount >= 10000) return '💎'
    if (amount >= 5000) return '💰'
    if (amount >= 1000) return '💵'
    if (amount > 0) return '🪙'
    return '🎁'
  }

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await usersApi.getWheelSettings()
      setSettings(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const spin = async () => {
    if (spinning || !settings) return
    const cost = settings.spinCost ?? 50
    if ((state.user?.coins || 0) < cost) {
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '🪙', title: t('Coinlar yetarli emas'), sub: `${t('Har bir aylantirish')} ${cost} coin ${t('turadi')}` } } })
      return
    }
    
    setSpinning(true); setPrize(null)
    try {
      const res = await usersApi.spinWheel()
      
      // Update coins immediately so user sees the deduction
      usersApi.getMe().then(r => dispatch({ type: 'LOGIN', user: r.data }))

      const prizes = settings.prizes
      const wonPrize = res.data.prize
      const prizeIndex = prizes.findIndex(p => p.label === wonPrize.label && p.amount === wonPrize.amount)
      const segmentAngle = 360 / (prizes.length || 1)
      const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2)
      const extraRotation = 3600 + targetAngle - (rotation % 360)
      setRotation(rotation + extraRotation)
      
      setTimeout(() => {
        setSpinning(false); setPrize(wonPrize)
        // Refresh again in case prize was a coin prize
        usersApi.getMe().then(r => dispatch({ type: 'LOGIN', user: r.data }))
      }, 5000)
    } catch (e) {
      setSpinning(false); alert(e.response?.data?.message || 'Xato yuz berdi')
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#070B14]">
       <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const segments = settings?.prizes || []
  const segmentAngle = 360 / (segments.length || 1)

  return (
    <div className="flex-1 flex flex-col bg-[#070B14] h-full overflow-hidden relative selection:bg-amber-500/30">
      
      {/* ── Background Glow ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="px-5 py-4 flex items-center justify-between bg-white/5 backdrop-blur-2xl border-b border-white/5 shrink-0 z-50">
        <button onClick={() => dispatch({ type: 'GO', screen: 'worker-home' })} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
           <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[2.5]"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex items-center gap-3 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
           <span className="text-[16px]">🪙</span>
           <span className="text-[14px] font-black text-amber-500 tracking-tight">{state.user?.coins || 0}</span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg">👑</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between py-4 px-6 overflow-hidden relative z-10">
        
        {/* ── Wheel Section (More compact) ── */}
        <div className="w-full flex-1 flex items-center justify-center min-h-0">
          <div className="relative scale-[0.75] sm:scale-75 transition-transform origin-center">
            
            <div className="relative p-6 rounded-full bg-slate-900 shadow-[0_0_80px_rgba(0,0,0,1)] border-[10px] border-slate-800 ring-4 ring-white/5">
              
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 drop-shadow-2xl">
                 <div className="w-8 h-10 bg-amber-500" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
              </div>

              {[...Array(12)].map((_, i) => (
                <div key={i} className={`absolute w-3 h-3 rounded-full z-30 transition-all ${spinning ? 'scale-150 shadow-[0_0_15px_#FBBF24]' : ''}`}
                  style={{ top: '50%', left: '50%', transform: `rotate(${i * 30}deg) translate(138px)`, backgroundColor: i % 2 === 0 ? '#FBBF24' : '#FFF' }}
                />
              ))}

              <svg viewBox="0 0 100 100" className="w-[260px] h-[260px] rounded-full transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0, 1) relative z-10" style={{ transform: `rotate(${rotation}deg)` }}>
                <defs>
                  {segments.map((_, i) => (
                    <linearGradient key={i} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={colors[i % colors.length][0]} /><stop offset="100%" stopColor={colors[i % colors.length][1]} />
                    </linearGradient>
                  ))}
                </defs>
                {segments.map((s, i) => {
                  const startAngle = i * segmentAngle; const endAngle = (i + 1) * segmentAngle;
                  const x1 = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y2 = 50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);
                  const midAngle = startAngle + segmentAngle / 2;
                  const rSticker = 38;
                  const sx = 50 + rSticker * Math.cos((midAngle - 90) * Math.PI / 180);
                  const sy = 50 + rSticker * Math.sin((midAngle - 90) * Math.PI / 180);

                  return (
                    <g key={i}>
                      <path d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} fill={`url(#grad-${i})`} stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
                      <text x="50" y="24" transform={`rotate(${midAngle} 50 50)`} fill="white" fontSize="3.5" fontWeight="900" textAnchor="middle" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{s.label}</text>
                      <g transform={`translate(${sx}, ${sy})`}>
                         <text x="0" y="0" fontSize="9" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${-midAngle - rotation})`}>
                           {getSticker(s.amount)}
                         </text>
                      </g>
                    </g>
                  );
                })}
                <circle cx="50" cy="50" r="10" fill="#0F172A" /><circle cx="50" cy="50" r="7" fill="white" /><text x="50" y="52.5" textAnchor="middle" fontSize="8" fill="#0F172A" fontWeight="900">★</text>
              </svg>
            </div>
          </div>
        </div>

        {/* ── Actions (Push further down and smaller) ── */}
        <div className="w-full flex flex-col items-center gap-6 shrink-0 pb-6">
           
           {/* Compact Spin Button */}
           <button 
             onClick={spin} 
             disabled={spinning} 
             className={`h-14 w-full max-w-[240px] rounded-2xl relative overflow-hidden transition-all active:scale-95 shadow-xl
               ${spinning ? 'opacity-50 cursor-not-allowed grayscale' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}
           >
              <div className="relative z-10 flex items-center justify-between px-6">
                 <span className="text-white font-black text-[15px] uppercase tracking-wider">{spinning ? t("Spin...") : t("Aylantirish")}</span>
                 <div className="bg-black/20 px-3 py-1 rounded-xl border border-white/10 text-white font-black text-[13px]">{settings?.spinCost ?? 50} 🪙</div>
              </div>
              {!spinning && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shine_3s_infinite]" style={{ transform: 'skewX(-25deg)' }} />}
           </button>

           {/* Small Recommendation */}
           <div className="w-full max-w-[280px]">
             <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl">
                <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center text-[18px]">💡</div>
                <p className="text-white/20 text-[9px] leading-tight font-black uppercase tracking-widest">
                  {t("Ko'proq ish bajaring va coinlar yig'ing!")}
                </p>
             </div>
           </div>

        </div>

      </div>

      {/* ── Result Modal ── */}
      {prize && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-[#111827] border border-white/10 p-10 rounded-[3rem] w-full max-w-xs flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2rem] flex items-center justify-center text-[40px] mb-6 shadow-2xl animate-bounce border-4 border-white/10">{getSticker(prize.amount)}</div>
              <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mb-1">{t("WINNER")}</h3>
              <div className="text-[30px] font-black text-white leading-tight mb-8 tracking-tighter uppercase">{prize.label}</div>
              <button onClick={() => setPrize(null)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[12px] shadow-lg">{t("COLLECT")}</button>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-25deg); }
          50% { transform: translateX(150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }
      `}} />
    </div>
  )
}
