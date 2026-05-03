import { useState, useEffect } from 'react'
import { useApp } from '../../context'
import { getCatName, fmt, starsArr, getActiveSkills } from '../../data'
import RegionSelect from '../../components/RegionSelect'
import { getRegionName } from '../../regions'
import { useT } from '../../i18n'
import { usersApi } from '../../api'

export default function WorkerProfile() {
  const { state, dispatch } = useApp()
  const t = useT()
  const { user, categories } = state
  const [editRegion, setEditRegion] = useState(user.region || '')
  const [editDistrict, setEditDistrict] = useState(user.district || '')
  const [loading, setLoading] = useState(false)
  const [isEditSkills, setIsEditSkills] = useState(false)
  const [isEditProfile, setIsEditProfile] = useState(false)
  const [tempSkills, setTempSkills] = useState(user.skills || [])
  const [name, setName] = useState(user.name || '')
  const [pass, setPass] = useState('')

  const refreshProfile = async () => {
    try {
      setLoading(true)
      const meRes = await usersApi.getMe()
      dispatch({ type: 'LOGIN', user: meRes.data })
    } catch (e) {
      console.error('Refresh error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refreshProfile() }, [])

  const topUp = () => dispatch({ type: 'GO', screen: 'top-up' })
  const logout = () => dispatch({ type: 'LOGOUT' })
  const toggleSkill = (key) => setTempSkills(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const saveSkills = async () => {
    setLoading(true)
    try {
      await usersApi.updateProfile({ skills: JSON.stringify(tempSkills) })
      setIsEditSkills(false)
      refreshProfile()
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '🛠️', title: t('Yangilandi'), sub: t('Kasblaringiz muvaffaqiyatli saqlandi') } } })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setLoading(true)
    try {
      const dto = { name, region: editRegion, district: editDistrict }
      if (pass) dto.pass = pass
      await usersApi.updateProfile(dto)
      setIsEditProfile(false)
      refreshProfile()
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '✅', title: t('Saqlandi'), sub: t("Ma'lumotlaringiz muvaffaqiyatli yangilandi") } } })
    } catch (e) {
      alert(t('Xato yuz berdi'))
    } finally {
      setLoading(false)
    }
  }

  const InfoCard = ({ children }) => (
    <div className="bg-white rounded-2xl p-5 border border-[#E8EDF5] shadow-sm">
      {children}
    </div>
  )

  const content = (
    <div className="flex flex-col gap-3">
      {/* Balance card */}
      <InfoCard>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-[12px] text-[#A0AEC0] font-black uppercase tracking-wider mb-1">💼 {t('Balans')}</div>
            <div className="text-[26px] font-black text-[#1A202C]">{fmt(user?.balance || 0)} {t("so'm")}</div>
          </div>
          <button onClick={topUp} className="bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white px-5 py-3 rounded-[16px] text-[14px] font-black flex items-center gap-1.5 shadow-lg shadow-blue-100 active:scale-95 transition-all">
            <span className="text-[18px] leading-none">+</span> {t("To'ldirish")}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F1F5F9]">
          <div>
            <div className="text-[11px] text-[#A0AEC0] font-black uppercase tracking-wider mb-1">💰 {t('Daromad')}</div>
            <div className="text-[16px] font-black text-[#16A34A]">{fmt(user?.totalEarned || 0)} {t("so'm")}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#A0AEC0] font-black uppercase tracking-wider mb-1">✅ {t('Bajarilgan')}</div>
            <div className="text-[16px] font-black text-[#1A202C]">{user?.totalJobs || 0} {t('ta ish')}</div>
          </div>
        </div>
      </InfoCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Post job */}
        <button onClick={() => { dispatch({ type: 'SET_EDIT_JOB', id: null }); dispatch({ type: 'GO', screen: 'post-job' }) }}
          className="bg-white rounded-2xl p-5 border border-[#E8EDF5] shadow-sm flex justify-between items-center group hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[22px]">🚀</div>
            <div>
              <div className="text-[15px] font-black text-[#1A202C]">{t('Ish joylashtirish')}</div>
              <div className="text-[12px] text-[#A0AEC0] font-bold">{t("Mijoz sifatida e'lon bering")}</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#A0AEC0] stroke-2 fill-none group-hover:stroke-green-500 transition-colors"><path d="M9 18l6-6-6-6" /></svg>
        </button>

        {/* Transaction history */}
        <button onClick={() => dispatch({ type: 'GO', screen: 'transaction-history' })}
          className="bg-white rounded-2xl p-5 border border-[#E8EDF5] shadow-sm flex justify-between items-center group hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[22px]">💳</div>
            <div>
              <div className="text-[16px] font-black text-[#1A202C]">{t("To'lovlar tarixi")}</div>
              <div className="text-[12px] text-gray-400 font-bold">{t("Mablag'lar harakatini ko'rish")}</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#A0AEC0] stroke-2 fill-none group-hover:stroke-blue-500 transition-colors"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* Location */}
      <InfoCard>
        <h3 className="text-[15px] font-black text-[#1A202C] mb-4">📍 {t('Joylashuv')}</h3>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
            <span className="text-[13px] text-[#94A3B8] font-bold">{t('Viloyat')}</span>
            <span className="text-[13px] font-black text-[#1A202C]">{user.region ? t(getRegionName(user.region)) : t("Ko'rsatilmagan")}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[13px] text-[#94A3B8] font-bold">{t('Tuman')}</span>
            <span className="text-[13px] font-black text-[#1A202C]">{user.district ? t(user.district) : t("Ko'rsatilmagan")}</span>
          </div>
        </div>
      </InfoCard>

      {/* Skills */}
      <InfoCard>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[15px] font-black text-[#1A202C]">🛠️ {t('Mening kasblarim')}</h3>
          <button onClick={() => { setTempSkills(user.skills || []); setIsEditSkills(true) }}
            className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-all uppercase tracking-tighter">
            {t("O'zgartirish")}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {user.skills?.length > 0 ? user.skills.map(s => (
            <span key={s} className="px-3 py-1.5 bg-[#F4F7FB] text-[#1E6FD9] rounded-xl text-[11px] font-black">{getCatName(s)}</span>
          )) : <span className="text-[12px] text-gray-400 font-bold">{t('Kasblar belgilanmagan')}</span>}
        </div>
      </InfoCard>

      <button onClick={logout} className="w-full bg-red-50 text-[#DC2626] font-black py-4 rounded-2xl hover:bg-red-100 transition-all shadow-sm active:scale-95">
        {t('🚪 Chiqish')}
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB] overflow-hidden">

      {/* ── MOBILE layout ── */}
      <div className="lg:hidden flex flex-col flex-1 overflow-y-auto no-scroll">
        <div className="bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] px-5 pt-4 pb-12 rounded-b-[28px] shrink-0 shadow-lg">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[18px] font-extrabold text-white">{t('Profil')}</h2>
            <button onClick={refreshProfile} className={`w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors ${loading ? 'animate-spin' : ''}`}>
              <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] stroke-white stroke-2 fill-none stroke-linecap-round stroke-linejoin-round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
            </button>
          </div>
          <div className="w-[88px] h-[88px] rounded-full mx-auto bg-gradient-to-br from-[#A78BFA] to-[#6366F1] flex items-center justify-center text-[34px] font-bold text-white border-[3px] border-white/40 shadow-2xl relative mb-3">
            {user?.name[0]}
            <div onClick={() => setIsEditProfile(true)} className="absolute bottom-0 right-0 w-7 h-7 bg-[#22C55E] rounded-full border-2 border-white flex items-center justify-center text-[12px] shadow-lg cursor-pointer hover:bg-green-600 transition-colors">✏️</div>
          </div>
          <div className="text-center text-[20px] font-extrabold text-white mb-1">{user?.name}</div>
          <div className="flex justify-center items-center gap-1.5 text-[13px] text-white/80 font-bold">
            <span dangerouslySetInnerHTML={{ __html: starsArr(user?.rating, 16) }} className="flex gap-[2px]" />
            {(user?.rating || 0).toFixed(1)} {t('reyting')}
          </div>
        </div>
        <div className="px-4 pb-6 -mt-[26px] z-10">
          {content}
        </div>
      </div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        {/* Desktop top bar */}
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#E8EDF5] shrink-0">
          <div>
            <h1 className="text-[22px] font-extrabold text-[#1A202C]">{t('Profil')}</h1>
            <p className="text-[13px] text-[#718096] mt-0.5">{user?.name} · {t('Ishchi panel')}</p>
          </div>
          <button onClick={refreshProfile} className={`flex items-center gap-2 text-[13px] font-bold text-[#1E6FD9] bg-[#EBF3FF] px-4 py-2 rounded-xl hover:bg-[#DBEAFE] transition-colors ${loading ? 'opacity-60' : ''}`}>
            <svg viewBox="0 0 24 24" className={`w-4 h-4 stroke-[#1E6FD9] stroke-2 fill-none ${loading ? 'animate-spin' : ''}`}><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
            {t('Yangilash')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scroll">
          <div className="max-w-5xl mx-auto flex gap-8 p-8">
            {/* Left: Avatar card */}
            <div className="w-64 shrink-0 flex flex-col gap-4">
              <div className="bg-white rounded-2xl p-6 border border-[#E8EDF5] shadow-sm flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#6366F1] flex items-center justify-center text-[38px] font-bold text-white border-4 border-white shadow-xl mb-4 relative group">
                  {user?.name[0]}
                  <div onClick={() => setIsEditProfile(true)} className="absolute bottom-0 right-0 w-8 h-8 bg-[#22C55E] rounded-full border-[3px] border-white flex items-center justify-center text-[13px] shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:scale-110">✏️</div>
                </div>
                <div className="text-[18px] font-extrabold text-[#1A202C] mb-1">{user?.name}</div>
                <div className="text-[13px] text-[#718096] mb-3">{user?.phone}</div>
                <div className="flex items-center gap-1.5 text-[13px] text-[#718096] font-bold">
                  <span dangerouslySetInnerHTML={{ __html: starsArr(user?.rating, 14) }} className="flex gap-[2px]" />
                  {(user?.rating || 0).toFixed(1)}
                </div>
                <div className="mt-4 w-full pt-4 border-t border-[#F1F5F9]">
                  <div className="text-[11px] text-[#A0AEC0] font-bold uppercase tracking-wider mb-1">{t('Balans')}</div>
                  <div className="text-[22px] font-black text-[#1A202C]">{fmt(user?.balance || 0)}</div>
                  <div className="text-[11px] text-[#718096]">{t("so'm")}</div>
                </div>
              </div>
              <button onClick={logout} className="w-full bg-red-50 text-[#DC2626] font-black py-3 rounded-2xl hover:bg-red-100 transition-all shadow-sm text-[14px]">
                {t('🚪 Chiqish')}
              </button>
            </div>

            {/* Right: content */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Balance action */}
              <div className="bg-white rounded-2xl p-5 border border-[#E8EDF5] shadow-sm flex justify-between items-center">
                <div>
                  <div className="text-[12px] text-[#A0AEC0] font-black uppercase tracking-wider mb-1">💼 {t('Balans')}</div>
                  <div className="text-[26px] font-black text-[#1A202C]">{fmt(user?.balance || 0)} {t("so'm")}</div>
                </div>
                <button onClick={topUp} className="bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white px-5 py-3 rounded-[16px] text-[14px] font-black flex items-center gap-1.5 shadow-lg hover:shadow-xl transition-all active:scale-95">
                  <span className="text-[18px] leading-none">+</span> {t("To'ldirish")}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { dispatch({ type: 'SET_EDIT_JOB', id: null }); dispatch({ type: 'GO', screen: 'post-job' }) }}
                  className="bg-white rounded-2xl p-5 border border-[#E8EDF5] shadow-sm flex items-center gap-4 group hover:shadow-md transition-all text-left">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[22px]">🚀</div>
                  <div>
                    <div className="text-[14px] font-black text-[#1A202C]">{t('Ish joylashtirish')}</div>
                    <div className="text-[11px] text-[#A0AEC0] font-bold">{t("Mijoz sifatida e'lon bering")}</div>
                  </div>
                </button>
                <button onClick={() => dispatch({ type: 'GO', screen: 'transaction-history' })}
                  className="bg-white rounded-2xl p-5 border border-[#E8EDF5] shadow-sm flex items-center gap-4 group hover:shadow-md transition-all text-left">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[22px]">💳</div>
                  <div>
                    <div className="text-[14px] font-black text-[#1A202C]">{t("To'lovlar tarixi")}</div>
                    <div className="text-[11px] text-gray-400 font-bold">{t("Harakatni ko'rish")}</div>
                  </div>
                </button>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl p-5 border border-[#E8EDF5] shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[15px] font-black text-[#1A202C]">📍 {t('Joylashuv')}</h3>
                  <button onClick={() => setIsEditProfile(true)} className="text-[12px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">
                    {t("O'zgartirish")}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">{t('Viloyat')}</div>
                    <div className="text-[14px] font-black text-[#1A202C]">{user.region ? t(getRegionName(user.region)) : <span className="text-[#CBD5E1]">{t("Ko'rsatilmagan")}</span>}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">{t('Tuman')}</div>
                    <div className="text-[14px] font-black text-[#1A202C]">{user.district ? t(user.district) : <span className="text-[#CBD5E1]">{t("Ko'rsatilmagan")}</span>}</div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-2xl p-5 border border-[#E8EDF5] shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[15px] font-black text-[#1A202C]">🛠️ {t('Mening kasblarim')}</h3>
                  <button onClick={() => { setTempSkills(user.skills || []); setIsEditSkills(true) }}
                    className="text-[12px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">
                    {t("O'zgartirish")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.skills?.length > 0 ? user.skills.map(s => {
                    const cat = categories.find(c => c.id === s);
                    return (
                      <span key={s} className="px-4 py-2 bg-[#EBF3FF] text-[#1E6FD9] rounded-xl text-[13px] font-black">
                        {cat ? `${cat.icon} ${t(cat.name)}` : getCatName(s)}
                      </span>
                    );
                  }) : <span className="text-[13px] text-gray-400 font-bold">{t('Kasblar belgilanmagan')}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Edit Modal (shared) */}
      {isEditSkills && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md" onClick={() => setIsEditSkills(false)}>
          <div className="bg-white w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[85%]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-[15px] text-[#1A202C] uppercase tracking-tight">{t('Kasblarni tanlang')}</h3>
              <button onClick={() => setIsEditSkills(false)} className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 font-bold">✕</button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto no-scroll flex flex-col gap-4">
              <div className="text-[12px] text-gray-400 font-bold leading-relaxed">{t("O'zingiz tajribaga ega bo'lgan yo'nalishlarni belgilang.")}</div>
              <div className="flex flex-wrap gap-2">
                {categories.length > 0 ? (
                  categories.map(s => (
                    <span key={s.id} onClick={() => toggleSkill(s.id)}
                      className={`px-4 py-2 rounded-xl text-[13px] font-black cursor-pointer border-2 transition-all select-none ${tempSkills.includes(s.id) ? 'bg-[#1E6FD9] text-white border-[#1E6FD9] shadow-lg scale-105' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                      {s.icon} {t(s.name)}
                    </span>
                  ))
                ) : (
                  <div className="w-full py-10 text-center text-gray-400 font-bold">
                    {t("Hozircha faol sohalar mavjud emas.")}
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 bg-gray-50 border-t border-gray-100">
              <button onClick={saveSkills} disabled={loading} className="w-full bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all uppercase text-[14px]">
                {loading ? t('Yuklanmoqda...') : t('Saqlash')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isEditProfile && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md" onClick={() => setIsEditProfile(false)}>
          <div className="bg-white w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[85%]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-[15px] text-[#1A202C] uppercase tracking-tight">{t("Profilni tahrirlash")}</h3>
              <button onClick={() => setIsEditProfile(false)} className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 font-bold">✕</button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto no-scroll flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#718096]">{t('F.I.SH')}</label>
                <input value={name} onChange={e => setName(e.target.value)} className="bg-white border-[1.5px] border-[#E8EDF5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9] font-bold text-[#1A202C]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#718096]">{t('Yangi parol (ixtiyoriy)')}</label>
                <input type="text" value={pass} onChange={e => setPass(e.target.value)} placeholder="******" className="bg-white border-[1.5px] border-[#E8EDF5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9] font-bold text-[#1A202C]" />
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[13px] font-bold text-[#718096]">{t('Joylashuv')}</label>
                <RegionSelect light region={editRegion} district={editDistrict} onRegion={setEditRegion} onDistrict={setEditDistrict} />
              </div>
            </div>
            <div className="p-5 bg-gray-50 border-t border-gray-100">
              <button onClick={saveProfile} disabled={loading} className="w-full bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all uppercase text-[14px]">
                {loading ? t('Yuklanmoqda...') : t('Saqlash')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
