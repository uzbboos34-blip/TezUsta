import { useApp } from '../context'
import { useState, useEffect } from 'react'
import { DB, fmt } from '../data'
import { useT } from '../i18n'
import { jobsApi } from '../api'

export default function Modal() {
  const { state, dispatch } = useApp()
  const [rating, setRating] = useState(0)
  const [tempPrice, setTempPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const t = useT()

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  if (!state.modal) return null

  const close = () => {
    dispatch({ type: 'CLOSE_MODAL' })
    setTempPrice('')
    setRating(0)
  }
  const { type, data } = state.modal

  if (type === 'price_input') {
    const submit = async () => {
      const price = parseInt(tempPrice.replace(/\D/g, ''))
      if (!price || price <= 0) {
        alert(t("Iltimos, to'g'ri narx kiriting"))
        return
      }
      setLoading(true)
      try {
        await jobsApi.requestFinish(data.jobId, price)
        dispatch({
          type: 'SHOW_MODAL',
          modal: {
            type: 'general',
            data: {
              icon: '⏳',
              title: t('Topshirildi'),
              sub: t('Mijoz ishni qabul qilsa, balansga pul tushadi.'),
            },
          },
        })
        if (data.onSuccess) data.onSuccess()
      } catch (e) {
        alert(t("Xato yuz berdi"))
      } finally {
        setLoading(false)
      }
    }

    return (
      <div onClick={close} className="fixed inset-0 bg-[#0F172A]/40 z-[9999] backdrop-blur-[8px] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[40px] p-8 w-full max-w-[360px] text-center shadow-[0_25px_60px_rgba(0,0,0,0.25)] modal-pop border border-white/20">
          <div className="text-[64px] mb-4 drop-shadow-sm">💰</div>
          <div className="text-[22px] font-[900] text-[#1A202C] mb-2 tracking-tight">{t('Yakuniy narx')}</div>
          <div className="text-[14px] text-[#64748B] leading-relaxed mb-6 font-medium px-2">
            {t("Ushbu ish uchun qancha so'mga kelishdingiz?")}
          </div>

          <div className="relative mb-8">
            <input 
              type="text"
              autoFocus
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl px-6 py-4 text-[24px] font-black text-[#1A202C] text-center focus:border-[#1E6FD9] focus:bg-white outline-none transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-[#94A3B8]">{t("so'm")}</div>
          </div>

          <button 
            disabled={loading || !tempPrice}
            className={`w-full bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white font-[800] py-4 rounded-2xl mb-3 shadow-[0_12px_24px_rgba(30,111,217,0.3)] ${loading || !tempPrice ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.96] hover:brightness-110'} transition-all`} 
            onClick={submit}
          >
            {loading ? t("Yuklanmoqda...") : t('Ishni topshirish')}
          </button>
          <button className="w-full bg-transparent text-[#64748B] font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors" onClick={close}>
            {t("Bekor qilish")}
          </button>
        </div>
      </div>
    )
  }

  if (type === 'general') {
    return (
      <div onClick={close} className="fixed inset-0 bg-[#0F172A]/40 z-[9999] backdrop-blur-[8px] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[32px] p-8 w-full max-w-[340px] text-center shadow-[0_20px_50px_rgba(0,0,0,0.2)] modal-pop border border-white/20">
          <div className="text-[64px] mb-4 drop-shadow-sm">{data.icon}</div>
          <div className="text-[24px] font-[900] text-[#1A202C] mb-3 tracking-tight leading-tight">{data.title}</div>
          <div className="text-[15px] text-[#64748B] leading-relaxed mb-8 font-medium px-2">{data.sub}</div>
          <button 
            className="w-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white font-extrabold py-4 rounded-2xl shadow-[0_10px_20px_rgba(15,23,42,0.25)] active:scale-[0.96] transition-all" 
            onClick={close}
          >
            {t("Tushunarli")}
          </button>
        </div>
      </div>
    )
  }

  if (type === 'rate') {
    const submit = async () => {
      if (!rating) {
        dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '⚠️', title: t('Yulduz tanlang'), sub: t('Kamida 1 yulduz bering') } }})
        return
      }
      
      setLoading(true)
      try {
        if (data.isConfirmation) {
          await jobsApi.confirmDone(data.jobId)
        }
        dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '⭐', title: t('Rahmat!'), sub: t("Ish qabul qilindi va usta baholandi. Bizni tanlaganingiz uchun rahmat!") } }})
      } catch (e) {
        alert(t("Xato yuz berdi"))
      } finally {
        setLoading(false)
      }
    }

    return (
      <div onClick={close} className="fixed inset-0 bg-[#0F172A]/40 z-[9999] backdrop-blur-[8px] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[40px] p-8 w-full max-w-[360px] text-center shadow-[0_25px_60px_rgba(0,0,0,0.25)] modal-pop border border-white/20">
          <div className="text-[64px] mb-4 drop-shadow-sm">{data.isConfirmation ? '👷' : '⭐'}</div>
          <div className="text-[22px] font-[900] text-[#1A202C] mb-2 tracking-tight">{data.isConfirmation ? t('Ishni qabul qiling') : t('Ustani baholang')}</div>
          
          {data.isConfirmation && data.job && (
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-4 mb-6">
              <div className="text-[12px] text-[#16A34A] font-bold uppercase mb-1">{t('To\'lanadigan summa')}</div>
              <div className="text-[24px] font-black text-[#16A34A]">{fmt(data.job.price)} {t("so'm")}</div>
            </div>
          )}

          <div className="text-[14px] text-[#64748B] leading-relaxed mb-6 font-medium px-2">
            {data.isConfirmation ? t('Usta ishni topshirdi. Ishini baholab, qabul qiling:') : t('Ish tugagandan keyin ustaga reyting bering.')}
          </div>
          
          <div className="flex gap-2 justify-center mb-8">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} onClick={() => setRating(i)} className={`text-[42px] cursor-pointer transition-all duration-300 hover:scale-125 ${i <= rating ? 'text-[#F59E0B] drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-[#E2E8F0]'}`}>
                ★
              </span>
            ))}
          </div>

          <button 
            disabled={loading}
            className={`w-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white font-[800] py-4 rounded-2xl mb-3 shadow-[0_12px_24px_rgba(34,197,94,0.3)] ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.96] hover:brightness-110'} transition-all`} 
            onClick={submit}
          >
            {loading ? t("Yuklanmoqda...") : (data.isConfirmation ? t('Tasdiqlash va baholash') : t('Reyting berish'))}
          </button>
          <button className="w-full bg-transparent text-[#64748B] font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors" onClick={close}>
            {t("Keyinroq")}
          </button>
        </div>
      </div>
    )
  }

  if (type === 'operator') {
    const openSupportChat = () => {
      let sc = DB.chats.find(c => c.isSupport && c.users.includes(state.user.id))
      if (!sc) {
        sc = {
          id: 'chat-support-' + state.user.id,
          users: [state.user.id, 6],
          jobId: null,
          isSupport: true,
          messages: [{
            from: 6,
            text: t("Assalomu alaykum, qanday yordam bera olaman?"),
            time: new Date().toLocaleTimeString('uz-Latn', { hour: '2-digit', minute: '2-digit' })
          }]
        }
        DB.chats.push(sc)
      }
      close()
      dispatch({ type: 'SET_CHAT', id: sc.id })
      dispatch({ type: 'GO', screen: 'chat' })
    }

    return (
      <div onClick={close} className="absolute inset-0 bg-black/50 z-[200] backdrop-blur-sm flex items-end justify-center sm:items-center">
        <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-[32px] sm:rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl modal-pop pb-10 sm:pb-6 relative animate-slide-up">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
          <div className="text-[48px] mb-2 leading-none">🎧</div>
          <div className="text-[20px] font-extrabold text-[#1A202C] mb-6">{t("Operator bilan aloqa")}</div>
          
          <div className="flex flex-col gap-3 mb-4">
            <button onClick={openSupportChat} className="flex items-center justify-center gap-2.5 w-full bg-[#EEF2FF] text-[#4F46E5] font-bold py-[16px] rounded-2xl active:scale-[0.98] transition-transform text-[16px]">
              💬 {t("Chat orqali yozish")}
            </button>
            <a href="tel:+998901000000" className="flex items-center justify-center gap-2.5 w-full bg-[#F0FDF4] text-[#16A34A] font-bold py-[16px] rounded-2xl active:scale-[0.98] transition-transform text-[16px]">
              📞 {t("Qo'ng'iroq qilish")}
            </a>
          </div>

          <button className="w-full bg-transparent text-[#64748B] font-bold py-[14px] rounded-xl active:scale-[0.98] transition-transform text-[15px]" onClick={close}>
            {t("Bekor qilish")}
          </button>
        </div>
      </div>
    )
  }

  return null
}
