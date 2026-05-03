import { useState, useEffect } from 'react'
import { useApp } from '../../context'
import { getCatName } from '../../data'
import { useT } from '../../i18n'
import { jobsApi, chatsApi, usersApi } from '../../api'

export default function Applicants() {
  const { state, dispatch } = useApp()
  const t = useT()
  const { currentJobId } = state

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentJobId) fetchJob()
  }, [currentJobId])

  const fetchJob = async () => {
    try {
      const { data } = await jobsApi.getOne(currentJobId)
      setJob(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  let sorted = (job?.applicants || [])
    .map(a => ({ ...a, user: a.worker }))
    .filter(a => a.user)
  
  if (job?.worker && !sorted.find(a => a.workerId === job.workerId)) {
    sorted.unshift({ workerId: job.workerId, user: job.worker })
  }

  sorted = sorted.sort((a, b) => (b.user.rating || 0) - (a.user.rating || 0))

  const accept = async (workerId) => {
    try {
      await jobsApi.acceptWorker(currentJobId, workerId)
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '✅', title: t('Qabul qilindi'), sub: t('Usta ish uchun qabul qilindi. Endi u bilan chatda gaplashishingiz mumkin.') } } })
      fetchJob()
    } catch (e) {
      alert(t('Xato yuz berdi'))
    }
  }

  const chat = async (workerId) => {
    try {
      const { data } = await chatsApi.create({ jobId: Number(currentJobId), userIds: [Number(state.user.id), Number(workerId)] })
      dispatch({ type: 'SET_CHATBACK', screen: 'applicants' })
      dispatch({ type: 'SET_CHAT', id: data.id })
      dispatch({ type: 'GO', screen: 'chat' })
    } catch (e) {
      alert(e.response?.data?.message || t('Xato yuz berdi'))
    }
  }

  const report = async (workerId) => {
    const reason = prompt(t('Shikoyat sababini yozing:'))
    if (!reason) return
    try {
      await usersApi.report(workerId, reason)
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '🚩', title: t('Shikoyat yuborildi'), sub: t("Sizning shikoyatingiz adminlar tomonidan ko'rib chiqiladi.") } } })
    } catch (e) {
      alert(t('Xato yuz berdi'))
    }
  }

  const goBack = () => dispatch({ type: 'GO', screen: 'client-home' })

  if (loading) return <div className="p-10 text-center text-gray-500">{t('Yuklanmoqda...')}</div>

  const ApplicantCard = ({ a }) => (
    <div className="bg-white rounded-2xl p-4 border border-[#E8EDF5] shadow-sm flex gap-3 items-start hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#818CF8] to-[#4F46E5] flex items-center justify-center text-white text-[18px] font-bold shrink-0">
        {a.user.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold text-[#1A202C]">{a.user.name}</div>
        <div className="text-[12px] text-[#A0AEC0] mt-0.5">{(a.user.skills || []).map(s => getCatName(s)).join(', ')}</div>
        <div className="flex items-center gap-1 mt-1 text-[12px] font-bold text-[#718096]">
          <svg className="w-[13px] h-[13px] fill-[#F59E0B]" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          <span>{(a.user.rating || 0).toFixed(1)}</span>
          <span className="text-[11px] font-medium text-[#A0AEC0] ml-0.5">({a.user.totalRatings || 0} {t('ta baho')})</span>
        </div>
        {job.workerId === a.workerId && job.status !== 'done' && (
          <div className="mt-2 bg-[#F0FDF4] border border-[#DCFCE7] rounded-lg px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-[12px] font-extrabold text-[#15803D]">📞 {a.user.phone}</span>
            <button onClick={() => window.open(`tel:${a.user.phone}`)} className="text-[11px] font-bold text-[#1E6FD9]">{t('Tel')}</button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0 items-end">
        <span className={`font-bold text-[11px] px-2 py-1 rounded-md text-center ${job.status === 'done' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF9C3] text-[#B45309]'}`}>
          {job.status === 'done' ? t('Bajarildi') : t('Faol')}
        </span>
        {job.status !== 'done' && (
          <button onClick={() => chat(a.workerId)} className="bg-[#F4F7FB] text-[#1E6FD9] px-3 py-1.5 rounded-[10px] text-[12px] font-bold hover:bg-[#EBF3FF] transition-colors whitespace-nowrap">💬 {t('Chat')}</button>
        )}
        <button onClick={() => report(a.workerId)} className="text-[11px] text-red-500 font-medium hover:underline mt-1">{t('Shikoyat')}</button>
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="text-center py-20 px-5 text-[#A0AEC0]">
      <div className="text-[52px] mb-3">👷</div>
      <div className="text-[16px] font-bold text-[#718096] mb-1.5">{t("Hali murojaat yo'q")}</div>
      <div className="text-[13px] leading-relaxed">{t("Ustalar ish e'loningizni ko'rib murojaat qilishadi")}</div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB] overflow-hidden">

      {/* ── MOBILE ── */}
      <div className="lg:hidden flex flex-col flex-1 overflow-y-auto no-scroll">
        <div className="bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] px-5 pt-4 pb-6 rounded-b-[24px] shrink-0">
          <div className="flex items-center gap-3 mb-1.5">
            <button onClick={goBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] stroke-white stroke-2 fill-none stroke-linecap-round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <h2 className="text-white text-[20px] font-extrabold flex-1">{t("Ustalar ro'yxati")}</h2>
          </div>
          <div className="text-[13px] text-white/80 ml-12">{job?.title}</div>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {sorted.length === 0 ? <EmptyState /> : sorted.map(a => <ApplicantCard key={a.workerId} a={a} />)}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-8 py-5 bg-white border-b border-[#E8EDF5] shrink-0">
          <button onClick={goBack} className="w-9 h-9 bg-[#F4F7FB] rounded-xl flex items-center justify-center hover:bg-[#E8EDF5] transition-colors border border-[#E8EDF5]">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[#475569] stroke-2 fill-none stroke-linecap-round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <h1 className="text-[22px] font-extrabold text-[#1A202C]">{t("Ustalar ro'yxati")}</h1>
            <p className="text-[13px] text-[#718096] mt-0.5">{job?.title} · {sorted.length} {t("ta usta")}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scroll p-8">
          {sorted.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-w-4xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-4">
              {sorted.map(a => <ApplicantCard key={a.workerId} a={a} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
