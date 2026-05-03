import { useState, useEffect } from 'react'
import { useApp } from '../../context'
import { fmt } from '../../data'
import RegionSelect from '../../components/RegionSelect'
import { getRegionName } from '../../regions'
import { useT } from '../../i18n'
import { usersApi } from '../../api'

const FormRow = ({ label, children }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-[#F1F5F9] last:border-0">
    <span className="text-[13px] text-[#94A3B8] font-semibold shrink-0 mr-4">{label}</span>
    <div className="text-right">{children}</div>
  </div>
)

export default function ClientProfile() {
  const { state, dispatch } = useApp()
  const t = useT()
  const { user } = state
  const [isEdit, setIsEdit] = useState(false)
  const [name, setName] = useState(user.name)
  const [pass, setPass] = useState('')
  const [editRegion, setEditRegion] = useState(user.region || '')
  const [editDistrict, setEditDistrict] = useState(user.district || '')
  const [loading, setLoading] = useState(false)

  const refreshProfile = async () => {
    try {
      setLoading(true)
      const { data } = await usersApi.getMe()
      dispatch({ type: 'LOGIN', user: data })
      setName(data.name)
      setEditRegion(data.region || '')
      setEditDistrict(data.district || '')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { refreshProfile() }, [])

  const logout = () => dispatch({ type: 'LOGOUT' })
  const totalJobs = user.postedJobs?.length || 0
  const spent = user.totalSpent || 0

  const save = async () => {
    setLoading(true)
    try {
      const dto = { name, region: editRegion, district: editDistrict }
      if (pass) dto.pass = pass
      await usersApi.updateProfile(dto)
      setIsEdit(false)
      refreshProfile()
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '✅', title: t('Saqlandi'), sub: t("Ma'lumotlaringiz muvaffaqiyatli yangilandi") } } })
    } catch (e) { alert(t('Xato yuz berdi')) }
    finally { setLoading(false) }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB] overflow-hidden">

      {/* ── MOBILE ── */}
      <div className="lg:hidden flex flex-col flex-1 overflow-y-auto no-scroll">
        <div className="bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] px-5 pt-4 pb-12 rounded-b-[28px] shrink-0">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[18px] font-extrabold text-white">{t('Profil')}</h2>
            <button onClick={() => setIsEdit(!isEdit)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              {isEdit
                ? <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-white stroke-2 fill-none stroke-linecap-round stroke-linejoin-round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                : <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] stroke-white stroke-2 fill-none stroke-linecap-round stroke-linejoin-round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              }
            </button>
          </div>
          <div className="group relative w-[88px] h-[88px] mx-auto mb-3">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#818CF8] to-[#4F46E5] flex items-center justify-center text-[34px] font-bold text-white border-[3px] border-white/40 shadow-xl overflow-hidden">
              {user?.name?.[0]}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[20px] font-extrabold text-white mb-0.5">{user?.name}</div>
            <div className="text-[13px] text-white/80 font-medium">{user?.phone}</div>
          </div>
        </div>

        <div className="px-[18px] pb-6 -mt-[26px] z-10 flex flex-col gap-3.5">
          <div className="flex gap-2.5">
            <div className="flex-1 px-4 py-3 bg-white rounded-xl shadow-sm border border-[#E8EDF5]">
              <div className="text-[12px] text-[#A0AEC0] font-bold uppercase tracking-tight mb-1">📝 {t('E\'lonlar')}</div>
              <div className="text-[18px] font-black text-[#1A202C]">{totalJobs} {t('ta')}</div>
            </div>
            <div className="flex-1 px-4 py-3 bg-white rounded-xl shadow-sm border border-[#E8EDF5]">
              <div className="text-[12px] text-[#A0AEC0] font-bold uppercase tracking-tight mb-1">💸 {t('Xarajatlar')}</div>
              <div className="text-[18px] font-black text-[#16A34A]">{fmt(spent)} <span className="text-[11px] text-[#A0AEC0]">{t("so'm")}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-[16px] p-4 shadow-sm border border-[#E8EDF5]">
            <h3 className="text-[15px] font-bold text-[#1A202C] mb-3">📝 {t("Mening ma'lumotlarim")}</h3>
            <div className="flex flex-col gap-2">
              <FormRow label={t('F.I.SH')}>
                {isEdit ? <input value={name} onChange={e => setName(e.target.value)} className="text-[14px] font-bold text-[#1A202C] text-right outline-none bg-gray-50 px-2 py-0.5 rounded" /> : <span className="text-[14px] font-bold text-[#1A202C]">{user?.name}</span>}
              </FormRow>
              <FormRow label={t('Parol')}>
                {isEdit ? <input type="text" value={pass} onChange={e => setPass(e.target.value)} className="text-[14px] font-bold text-[#1A202C] text-right outline-none bg-gray-50 px-2 py-0.5 rounded" placeholder={t('Yangi parol')} /> : <span className="text-[14px] font-bold text-[#1A202C]">******</span>}
              </FormRow>
              <FormRow label={t('Telefon')}>
                <span className="text-[14px] font-bold text-[#64748B]">{user?.phone}</span>
              </FormRow>
              {isEdit ? (
                <div className="pt-2">
                  <div className="text-[13px] font-semibold text-[#94A3B8] mb-2">{t('Joylashuv')}</div>
                  <RegionSelect light region={editRegion} district={editDistrict} onRegion={setEditRegion} onDistrict={setEditDistrict} />
                </div>
              ) : (
                <>
                  <FormRow label={t('Viloyat')}>
                    <span className="text-[13px] font-bold text-[#1A202C]">{user.region ? t(getRegionName(user.region)) : <span className="text-[#CBD5E1]">{t("Ko'rsatilmagan")}</span>}</span>
                  </FormRow>
                  <FormRow label={t('Tuman')}>
                    <span className="text-[13px] font-bold text-[#1A202C]">{user.district ? t(user.district) : <span className="text-[#CBD5E1]">{t("Ko'rsatilmagan")}</span>}</span>
                  </FormRow>
                </>
              )}
            </div>
            {isEdit && (
              <button onClick={save} disabled={loading} className="mt-4 w-full bg-[#1E6FD9] text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50">
                {loading ? t('Yuklanmoqda...') : t('💾 Saqlash')}
              </button>
            )}
          </div>
          <button onClick={() => dispatch({ type: 'SHOW_MODAL', modal: { type: 'operator' } })} className="w-full bg-white text-[#1A202C] border border-[#E8EDF5] font-bold py-[15px] rounded-[14px] hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2">
            🎧 {t('Operator')}
          </button>
          <button onClick={logout} className="w-full bg-[#FEE2E2] text-[#DC2626] font-bold py-[15px] rounded-[14px] hover:bg-[#FECACA] transition-colors shadow-sm">
            {t('🚪 Chiqish')}
          </button>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#E8EDF5] shrink-0">
          <div>
            <h1 className="text-[22px] font-extrabold text-[#1A202C]">{t('Profil')}</h1>
            <p className="text-[13px] text-[#718096] mt-0.5">{user?.name} · {t('Mijoz panel')}</p>
          </div>
          <button
            onClick={() => setIsEdit(!isEdit)}
            className={`flex items-center gap-2 text-[13px] font-bold px-4 py-2 rounded-xl transition-colors ${isEdit ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-[#EBF3FF] text-[#1E6FD9] hover:bg-[#DBEAFE]'}`}
          >
            {isEdit ? '✕ Bekor qilish' : '✏️ ' + t("Tahrirlash")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scroll">
          <div className="max-w-5xl mx-auto flex gap-8 p-8">
            {/* Left: Avatar */}
            <div className="w-64 shrink-0 flex flex-col gap-4">
              <div className="bg-white rounded-2xl p-6 border border-[#E8EDF5] shadow-sm flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#818CF8] to-[#4F46E5] flex items-center justify-center text-[38px] font-bold text-white border-4 border-white shadow-xl mb-4">
                  {user?.name?.[0]}
                </div>
                <div className="text-[18px] font-extrabold text-[#1A202C] mb-1">{user?.name}</div>
                <div className="text-[13px] text-[#718096]">{user?.phone}</div>
                <div className="mt-4 w-full pt-4 border-t border-[#F1F5F9] grid grid-cols-2 gap-3 text-center">
                  <div className="border-r border-[#F1F5F9] pr-3">
                    <div className="text-[18px] font-black text-[#1A202C]">📝 {totalJobs}</div>
                    <div className="text-[11px] text-[#A0AEC0] font-bold uppercase tracking-tighter">{t('E\'lonlar')}</div>
                  </div>
                  <div className="pl-3">
                    <div className="text-[18px] font-black text-[#16A34A]">💸 {fmt(spent)}</div>
                    <div className="text-[11px] text-[#A0AEC0] font-bold uppercase tracking-tighter">{t("so'm")}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => dispatch({ type: 'SHOW_MODAL', modal: { type: 'operator' } })}
                className="w-full bg-white text-[#1A202C] border border-[#E8EDF5] font-bold py-3 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 text-[14px]">
                🎧 {t('Operator')}
              </button>
              <button onClick={logout} className="w-full bg-red-50 text-[#DC2626] font-black py-3 rounded-2xl hover:bg-red-100 transition-all shadow-sm text-[14px]">
                {t('🚪 Chiqish')}
              </button>
            </div>

            {/* Right: info */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-white rounded-2xl p-6 border border-[#E8EDF5] shadow-sm">
                <h3 className="text-[15px] font-bold text-[#1A202C] mb-4">📝 {t("Ma'lumotlar")}</h3>
                <div className="flex flex-col">
                  <div className="grid grid-cols-2 gap-x-8">
                    <div>
                      <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">{t('F.I.SH')}</div>
                      {isEdit
                        ? <input value={name} onChange={e => setName(e.target.value)} className="text-[14px] font-bold text-[#1A202C] outline-none bg-[#F4F7FB] border border-[#E8EDF5] px-3 py-2 rounded-xl w-full" />
                        : <div className="text-[15px] font-bold text-[#1A202C]">{user?.name}</div>
                      }
                    </div>
                    <div>
                      <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">{t('Telefon')}</div>
                      <div className="text-[15px] font-bold text-[#64748B]">{user?.phone}</div>
                    </div>
                  </div>

                  {isEdit && (
                    <div className="mt-4">
                      <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-2">{t('Yangi parol')}</div>
                      <input type="text" value={pass} onChange={e => setPass(e.target.value)} className="text-[14px] font-bold text-[#1A202C] outline-none bg-[#F4F7FB] border border-[#E8EDF5] px-3 py-2 rounded-xl w-full max-w-xs" placeholder={t('Yangi parol (ixtiyoriy)')} />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E8EDF5] shadow-sm">
                <h3 className="text-[15px] font-bold text-[#1A202C] mb-4">📍 {t('Joylashuv')}</h3>
                {isEdit ? (
                  <RegionSelect light region={editRegion} district={editDistrict} onRegion={setEditRegion} onDistrict={setEditDistrict} />
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">{t('Viloyat')}</div>
                      <div className="text-[14px] font-bold text-[#1A202C]">{user.region ? t(getRegionName(user.region)) : <span className="text-[#CBD5E1]">{t("Ko'rsatilmagan")}</span>}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">{t('Tuman')}</div>
                      <div className="text-[14px] font-bold text-[#1A202C]">{user.district ? t(user.district) : <span className="text-[#CBD5E1]">{t("Ko'rsatilmagan")}</span>}</div>
                    </div>
                  </div>
                )}
                {isEdit && (
                  <button onClick={save} disabled={loading} className="mt-5 bg-[#1E6FD9] text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-[#1251C5] transition-colors disabled:opacity-50">
                    {loading ? t('Yuklanmoqda...') : t('💾 Saqlash')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
