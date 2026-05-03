import { useState, useEffect } from 'react'
import { useApp } from '../../context'
import { fmt } from '../../data'
import { useT } from '../../i18n'
import { adminApi, usersApi } from '../../api'

export default function TopUpScreen() {
  const { state, dispatch } = useApp()
  const t = useT()
  const { user } = state

  const [amount, setAmount] = useState('')
  const [step, setStep] = useState(1) // 1=amount, 2=card, 3=check, 4=verifying, 5=done, 6=rejected
  const [checkImg, setCheckImg] = useState(null)
  const [checkNote, setCheckNote] = useState('')
  const [cardSettings, setCardSettings] = useState({ cardNum: '...', cardHolder: '...' })

  useEffect(() => {
    adminApi.getSettings()
      .then(res => setCardSettings(res.data))
      .catch(e => console.error('Settings fetch error:', e))
  }, [])

  // Poll for status update when verifying - ABSOLUTELY BULLETPROOF
  useEffect(() => {
    let interval;
    if (step === 4) {
      console.log('TopUpScreen: Starting polling...');
      interval = setInterval(async () => {
        try {
          // Add timestamp to bypass any browser cache
          const res = await usersApi.getPayments();
          // Find the most recent request for this amount in the last 5 minutes
          const latest = res.data[0]; 
          
          if (latest) {
             console.log('TopUpScreen: Polling Latest Status ->', latest.status);
             if (latest.status === 'approved') {
                const me = await usersApi.getMe();
                dispatch({ type: 'LOGIN', user: me.data });
                setStep(5);
             } else if (latest.status === 'rejected') {
                console.log('TopUpScreen: Detected REJECTED status!');
                setStep(6);
             }
          }
        } catch (err) {
          console.error('TopUpScreen: Polling error:', err);
        }
      }, 2000); 
    }
    return () => clearInterval(interval);
  }, [step, dispatch]);

  const card = cardSettings.cardNum
  const holder = cardSettings.cardHolder

  const back = () => {
    if (step > 1 && step < 4) setStep(step - 1)
    else dispatch({ type: 'GO', screen: 'worker-profile' })
  }

  const copyCard = () => {
    navigator.clipboard?.writeText(card.replace(/\s/g, ''))
    dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '✅', title: t('Nusxalandi!'), sub: t('Karta raqami buferga nusxalandi.') } } })
  }

  const handleCheckUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCheckImg({
        name: file.name,
        type: file.type,
        data: ev.target.result
      })
    }
    reader.readAsDataURL(file)
  }

  const submitRequest = async () => {
    if (!checkImg && !checkNote.trim()) {
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '⚠️', title: t('Chek yuklanmadi'), sub: t('Iltimos, chek rasmini yuklang yoki izoh yozing.') } } })
      return
    }
    try {
      const res = await usersApi.topupRequest({
        amount: Number(amount),
        checkImg: checkImg.data,
        note: checkNote,
      })
      
      if (res.data.status === 'approved') {
         const meRes = await usersApi.getMe()
         dispatch({ type: 'LOGIN', user: meRes.data })
         setStep(5)
      } else if (res.data.status === 'rejected') {
         setStep(6)
      } else {
         setStep(4)
      }
    } catch (e) {
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '❌', title: t('Xato'), sub: t('So`rov yuborishda xatolik yuz berdi') } } })
    }
  }

  const getCardType = (num) => {
    if (num.startsWith('8600')) return 'UZCARD'
    if (num.startsWith('9860')) return 'HUMO'
    return 'PLATINUM'
  }

  const presets = [10000, 20000, 50000, 100000]

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB] overflow-hidden lg:items-center lg:justify-start">
    <div className="w-full lg:max-w-lg lg:h-full lg:overflow-y-auto no-scroll">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] px-5 pt-4 pb-8 rounded-b-[28px] shrink-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={back} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] stroke-white stroke-2 fill-none stroke-linecap-round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 className="text-white text-[20px] font-extrabold">{t("Balans to'ldirish")}</h1>
        </div>
        <div className="bg-white/15 rounded-[24px] px-5 py-4 flex items-center justify-between border border-white/10 backdrop-blur-sm">
          <div>
            <div className="text-white/70 text-[12px] font-bold uppercase tracking-wider mb-0.5">{t("Joriy balans")}</div>
            <div className="text-white text-[24px] font-black">{fmt(user.balance)} {t("so'm")}</div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-[28px] shadow-inner">💰</div>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto pb-10">
        {step < 4 && (
          <div className="flex gap-2 justify-center mb-1">
            {[1,2,3].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? 'bg-[#1E6FD9] w-8' : 'bg-[#E2E8F0] w-4'}`} />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-[32px] p-6 border border-[#E8EDF5] shadow-sm">
              <div className="text-[15px] font-black text-[#1A202C] mb-4">{t("To'ldirish miqdorini tanlang")}</div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {presets.map(p => (
                  <button key={p} onClick={() => setAmount(String(p))}
                    className={`py-4 rounded-2xl text-[14px] font-black border-2 transition-all ${amount === String(p) ? 'bg-[#1E6FD9] text-white border-[#1E6FD9] shadow-lg shadow-blue-100 scale-[1.02]' : 'bg-white border-[#E8EDF5] text-[#64748B] hover:border-blue-200'}`}>
                    {fmt(p)} {t("so'm")}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={t("Yoki miqdor kiriting...")}
                  className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl px-5 py-4 text-[15px] font-black outline-none focus:border-[#1E6FD9] transition-all"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[14px] text-[#94A3B8] font-black uppercase">{t("so'm")}</span>
              </div>
            </div>
            <button
              disabled={!amount || Number(amount) < 1000}
              onClick={() => setStep(2)}
              className={`w-full font-black py-5 rounded-[24px] text-[16px] transition-all ${!amount || Number(amount) < 1000 ? 'bg-[#E2E8F0] text-[#94A3B8]' : 'bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white shadow-xl shadow-blue-100 active:scale-95'}`}>
              {t("Davom etish →")}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-[32px] p-6 border border-[#E8EDF5] shadow-sm">
              <div className="text-[13px] text-gray-500 font-bold mb-4">{t("Platformaga")} <span className="text-[#1E6FD9] font-black">{fmt(Number(amount))} {t("so'm")}</span> {t("o'tkazing:")}</div>
              
              <div className="relative h-[200px] w-full rounded-[32px] bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] p-7 shadow-2xl overflow-hidden mb-6 group">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px'}}></div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="w-12 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg shadow-sm border border-white/20 relative">
                      <div className="absolute inset-0 opacity-20 grid grid-cols-3 grid-rows-2 gap-px border border-black/10"></div>
                   </div>
                   <div className="text-right">
                      <div className="text-white font-black italic text-[20px] tracking-tight">{getCardType(card)}</div>
                      <div className="text-white/40 text-[8px] font-black uppercase tracking-[2px]">TezUsta payment</div>
                   </div>
                </div>
                
                <div className="relative z-10 mb-7">
                   <div className="text-white text-[19px] font-mono tracking-[3px] drop-shadow-md whitespace-nowrap overflow-hidden">
                      {card.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ')}
                   </div>
                </div>

                <div className="flex justify-between items-end relative z-10">
                   <div className="max-w-[65%]">
                      <div className="text-white/50 text-[9px] uppercase font-bold mb-0.5 tracking-widest">{t("Egasi")}</div>
                      <div className="text-white text-[14px] font-black uppercase truncate tracking-wide">{holder}</div>
                   </div>
                   <button onClick={copyCard} className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 backdrop-blur-md transition-all active:scale-90 border border-white/10 shadow-sm">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      {t("Nusxa")}
                   </button>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white font-black py-5 rounded-[24px] text-[16px] shadow-xl shadow-green-100 active:scale-95 transition-all">
              {t("✅ To'lovni amalga oshirdim")}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-[32px] p-6 border border-[#E8EDF5] shadow-sm">
              <div className="text-[15px] font-black text-[#1A202C] mb-1">{t("Chekni yuklang")}</div>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-[24px] p-10 cursor-pointer transition-all ${checkImg ? 'border-[#1E6FD9] bg-blue-50/50' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#1E6FD9] hover:bg-blue-50/20'}`}>
                {checkImg ? (
                  <>
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-3 shadow-lg text-[42px] animate-in zoom-in">
                       {checkImg.type.includes('pdf') ? '📄' : '🖼️'}
                    </div>
                    <span className="text-[14px] font-black text-[#1E6FD9] text-center px-4 truncate w-full">{checkImg.name}</span>
                    <button onClick={(e)=>{e.preventDefault(); setCheckImg(null)}} className="mt-3 text-[12px] font-black text-red-500 hover:underline">{t("Boshqa fayl tanlash")}</button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center mb-4 shadow-inner">
                       <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-[#1E6FD9] fill-none stroke-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
                    </div>
                    <span className="text-[15px] font-black text-[#1A202C]">{t("PDF yoki Rasm tanlang")}</span>
                  </>
                )}
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleCheckUpload} />
              </label>
            </div>
            <button onClick={submitRequest} className="w-full bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white font-black py-5 rounded-[24px] text-[16px] shadow-xl shadow-blue-100 active:scale-95 transition-all">
              {t("📤 So'rovni yuborish")}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center gap-8 py-14 animate-in zoom-in duration-300 text-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center text-[64px] animate-pulse">⏳</div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="px-4">
              <div className="text-[24px] font-black text-[#1A202C] mb-4">{t("Tahlil qilinmoqda...")}</div>
              <p className="text-[14px] text-[#718096] leading-relaxed font-bold">
                {t("AI tizimimiz chekingizni avtomatik tekshirmoqda.")}
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 w-full shadow-sm">
               <div className="flex items-center justify-center gap-2 text-blue-600 font-black uppercase tracking-tighter">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></span>
                  <span className="ml-2">{t("Tekshirilmoqda")}</span>
               </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col items-center gap-8 py-10 animate-in zoom-in duration-500 text-center">
            <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center text-[64px] shadow-2xl shadow-green-200 animate-bounce">✅</div>
            <div className="px-4">
              <div className="text-[28px] font-black text-[#1A202C] mb-4">{t("Muvaffaqiyatli!")}</div>
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[32px] p-6 w-full mb-6">
                <div className="text-[13px] text-[#166534] font-bold mb-1 uppercase tracking-wider">{t("Hisobingizga qo'shildi")}</div>
                <div className="text-[32px] font-black text-[#16A34A]">{fmt(Number(amount))} {t("so'm")}</div>
              </div>
            </div>
            <button onClick={() => dispatch({ type: 'GO', screen: 'worker-home' })} className="w-full bg-[#1A202C] text-white font-black py-5 rounded-[24px] text-[16px] shadow-2xl active:scale-95 transition-all mt-4">
              {t("Bosh sahifaga qaytish")}
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col items-center gap-8 py-10 animate-in zoom-in duration-500 text-center">
            <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center text-[64px] shadow-2xl shadow-red-50">❌</div>
            <div className="px-4">
              <div className="text-[28px] font-black text-[#1A202C] mb-4 text-red-600 uppercase tracking-tighter">{t("To'lov rad etildi")}</div>
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[32px] p-8 w-full mb-6">
                <p className="text-red-700 font-black text-[16px] leading-relaxed mb-4">
                  {t("Siz yuborgan to'lov cheki platforma qoidalari yoki ma'lumotlar mos kelmaganligi sababli admin tomonidan rad etildi.")}
                </p>
                <div className="text-[12px] text-red-400 font-bold uppercase tracking-widest">{t("Iltimos, ma'lumotlarni qayta tekshiring")}</div>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={() => setStep(1)} className="w-full bg-red-600 text-white font-black py-5 rounded-[24px] text-[16px] shadow-xl shadow-red-100 active:scale-95 transition-all">
                {t("Qayta urinish")}
              </button>
              <button onClick={() => dispatch({ type: 'GO', screen: 'worker-profile' })} className="w-full bg-white text-gray-500 font-black py-4 rounded-[24px] text-[14px] active:scale-95 transition-all">
                {t("Profilga qaytish")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
