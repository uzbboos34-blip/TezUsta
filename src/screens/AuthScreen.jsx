import { useState } from 'react'
import { useApp } from '../context'
import { getActiveSkills } from '../data'
import RegionSelect from '../components/RegionSelect'
import { useT } from '../i18n'
import { authApi } from '../api'

export default function AuthScreen() {
  const { state, dispatch } = useApp()
  const t = useT()
  const role = state.selectedRole
  const [tab, setTab] = useState('login')
  const [skills, setSkills] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(false)

  // Registration Form
  const [rName, setRName] = useState('')
  const [rPhone, setRPhone] = useState('')
  const [rPass, setRPass] = useState('')
  const [rRegion, setRRegion] = useState('')
  const [rDistrict, setRDistrict] = useState('')

  // Login Form
  const [lPhone, setLPhone] = useState('+998')
  const [lPass, setLPass] = useState('')

  const handlePhone = (v, setter) => {
    let val = v.replace(/[^\d+]/g, '')
    if (!val.startsWith('+998')) val = '+998'
    if (val.length > 13) val = val.slice(0, 13)
    setter(val)
  }

  const labels = { worker: t('Ishchi uchun'), client: t('Ish beruvchi uchun'), admin: t('Admin kirishi'), superadmin: t('Super Admin kirishi') }
  const isAdmin = role === 'admin' || role === 'superadmin'

  const alert = (icon, title, sub) => dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon, title, sub } } })

  const toggleSkill = (key) => setSkills(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  const toggleCat = (key) => setCats(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const loginUser = (data) => {
    localStorage.setItem('token', data.access_token)
    dispatch({ type: 'LOGIN', user: data.user })
    const u = data.user
    if (u.role === 'worker') dispatch({ type: 'GO', screen: 'worker-home' })
    else if (u.role === 'client') dispatch({ type: 'GO', screen: 'client-home' })
    else if (u.role === 'admin') dispatch({ type: 'GO', screen: 'admin' })
    else if (u.role === 'superadmin') dispatch({ type: 'GO', screen: 'superadmin' })
  }

  const doRegister = async () => {
    if (!rName || !rPhone || rPass.length < 6) return alert('⚠️', t('Xato'), t("Barcha maydonlarni to'ldiring (parol kamida 6 belgi)"))
    if (!rRegion || !rDistrict) return alert('⚠️', t('Joylashuv'), t("Viloyat va tuman tanlang"))
    if (role === 'worker' && skills.length === 0) return alert('⚠️', t('Kasb tanlang'), t('Kamida bitta kasb tanlang'))

    setLoading(true)
    try {
      const { data } = await authApi.register({
        name: rName,
        phone: rPhone,
        pass: rPass,
        role,
        region: rRegion,
        district: rDistrict,
        skills: role === 'worker' ? skills : undefined,
        cats: role === 'client' ? cats : undefined
      })
      loginUser(data)
    } catch (e) {
      alert('❌', t('Xato'), e.response?.data?.message || t("Ro'yxatdan o'tishda xato yuz berdi"))
    } finally {
      setLoading(false)
    }
  }

  const doLogin = async () => {
    if (!lPhone || !lPass) return alert('⚠️', t('Xato'), t("Telefon va parolni kiriting"))

    setLoading(true)
    try {
      const { data } = await authApi.login({ phone: lPhone, pass: lPass })
      if (data.user.role !== role) {
        throw new Error(t("Bu rol uchun ushbu foydalanuvchi mos kelmaydi"))
      }
      loginUser(data)
    } catch (e) {
      alert('❌', t('Xato'), e.response?.data?.message || e.message || t("Telefon yoki parol noto'g'ri"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB] overflow-hidden lg:flex-row">
      {/* Desktop left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="text-[52px] font-extrabold text-white mb-2">Tez<span className="text-[#22C55E]">Usta</span></div>
          <div className="text-white/70 text-[16px] font-medium mb-8">{labels[role]}</div>
          <div className="flex flex-col gap-4 text-left max-w-xs">
            {['🔒 Xavfsiz tizim', '⚡ Tez ishga tushish', '📱 Istalgan qurilmadan'].map(item => (
              <div key={item} className="flex items-center gap-3 text-white/80 text-[14px] font-medium">
                <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center text-[16px]">{item[0]}</div>
                {item.slice(2)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scroll">
        <div className="lg:hidden bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] pt-10 px-6 pb-12 rounded-b-[32px] text-center shrink-0">
          <div className="text-[28px] font-extrabold text-white mb-1">Tez<span className="text-[#22C55E]">Usta</span></div>
          <div className="text-[13px] text-white/75">{labels[role]}</div>
          {!isAdmin && (
            <div className="flex bg-white/15 rounded-xl p-1 mx-5 mt-5">
              <div onClick={() => setTab('login')} className={`flex-1 py-2.5 text-center rounded-lg text-[14px] font-semibold cursor-pointer transition-colors ${tab === 'login' ? 'bg-white text-[#1E6FD9]' : 'text-white/70'}`}>{t('Kirish')}</div>
              <div onClick={() => setTab('register')} className={`flex-1 py-2.5 text-center rounded-lg text-[14px] font-semibold cursor-pointer transition-colors ${tab === 'register' ? 'bg-white text-[#1E6FD9]' : 'text-white/70'}`}>{t("Ro'yxatdan o'tish")}</div>
            </div>
          )}
        </div>

        <div className="p-5 lg:p-10 flex flex-col gap-3 -mt-6 lg:mt-0 lg:max-w-md lg:mx-auto lg:w-full lg:justify-center lg:flex-1">
          {/* Desktop tab switcher */}
          {!isAdmin && (
            <div className="hidden lg:flex bg-[#F4F7FB] rounded-xl p-1 mb-2 border border-[#E8EDF5]">
              <div onClick={() => setTab('login')} className={`flex-1 py-2.5 text-center rounded-lg text-[14px] font-semibold cursor-pointer transition-colors ${tab === 'login' ? 'bg-white text-[#1E6FD9] shadow-sm' : 'text-[#718096]'}`}>{t('Kirish')}</div>
              <div onClick={() => setTab('register')} className={`flex-1 py-2.5 text-center rounded-lg text-[14px] font-semibold cursor-pointer transition-colors ${tab === 'register' ? 'bg-white text-[#1E6FD9] shadow-sm' : 'text-[#718096]'}`}>{t("Ro'yxatdan o'tish")}</div>
            </div>
          )}

          {tab === 'login' || isAdmin ? (
            <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_24px_rgba(18,81,197,0.16)] border border-[#E8EDF5]">
              <div className="text-[16px] font-bold text-[#1A202C] mb-4">{t('🔐 Tizimga kirish')}</div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold text-[#718096]">{t('Telefon raqam')}</label><input value={lPhone} onChange={e => handlePhone(e.target.value, setLPhone)} maxLength={13} className="bg-white border-[1.5px] border-[#E8EDF5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9]" type="tel" placeholder="+998901234567" /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold text-[#718096]">{t('Parol')}</label><input value={lPass} onChange={e => setLPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} className="bg-white border-[1.5px] border-[#E8EDF5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9]" type="password" placeholder={t('Parolni kiriting')} /></div>
                <button disabled={loading} onClick={doLogin} className="w-full mt-1 bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white font-bold py-3.5 rounded-[14px] shadow-[0_4px_16px_rgba(30,111,217,0.36)] active:scale-95 transition-transform disabled:opacity-50">
                  {loading ? t('Yuklanmoqda...') : t('Kirish')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_24px_rgba(18,81,197,0.16)] border border-[#E8EDF5]">
              <div className="text-[16px] font-bold text-[#1A202C] mb-4">{t("📝 Ro'yxatdan o'tish")}</div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold text-[#718096]">{t('Ism Familiya')}</label><input value={rName} onChange={e => setRName(e.target.value)} className="bg-white border-[1.5px] border-[#E8EDF5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9]" placeholder={t('Masalan: Abdulloh Karimov')} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold text-[#718096]">{t('Telefon raqam')}</label><input value={rPhone} onChange={e => handlePhone(e.target.value, setRPhone)} maxLength={13} className="bg-white border-[1.5px] border-[#E8EDF5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9]" type="tel" placeholder="+998901234567" onClick={e => { if (!rPhone) setRPhone('+998') }} /></div>
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold text-[#718096]">{t('Parol')}</label><input value={rPass} onChange={e => setRPass(e.target.value)} className="bg-white border-[1.5px] border-[#E8EDF5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9]" type="password" placeholder={t('Kamida 6 ta belgi')} /></div>
                <RegionSelect light region={rRegion} district={rDistrict} onRegion={setRRegion} onDistrict={setRDistrict} />
                {role === 'worker' && (
                  <div className="bg-[#F4F7FB] rounded-xl p-3.5 mt-1">
                    <div className="text-[13px] font-bold text-[#1A202C] mb-2.5">{t('🛠️ Qanday ishlarda tajribangiz bor?')}</div>
                    <div className="flex flex-wrap gap-2">
                      {(state.categories || []).filter(c => c.status === 'active').map(s => (
                        <span key={s.id} onClick={() => toggleSkill(s.id)}
                          className={`px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer border-[1.5px] transition-all select-none ${skills.includes(s.id) ? 'bg-[#1E6FD9] text-white border-[#1E6FD9] shadow-md' : 'bg-white border-[#E8EDF5] text-[#718096]'}`}>
                          {s.icon} {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {role === 'client' && (
                  <div className="bg-[#F4F7FB] rounded-xl p-3.5 mt-1">
                    <div className="text-[13px] font-bold text-[#1A202C] mb-2.5">{t('🔍 Sizga qanday ustalar kerak bo\'ladi?')}</div>
                    <div className="flex flex-wrap gap-2">
                      {(state.categories || []).filter(c => c.status === 'active').map(s => (
                        <span key={s.id} onClick={() => toggleCat(s.id)}
                          className={`px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer border-[1.5px] transition-all select-none ${cats.includes(s.id) ? 'bg-[#22C55E] text-white border-[#22C55E] shadow-md' : 'bg-white border-[#E8EDF5] text-[#718096]'}`}>
                          {s.icon} {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button disabled={loading} onClick={doRegister} className="w-full mt-1 bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white font-bold py-3.5 rounded-[14px] shadow-[0_4px_16px_rgba(34,197,94,0.38)] active:scale-95 transition-transform disabled:opacity-50">
                  {loading ? t('Yuklanmoqda...') : t("Ro'yxatdan o'tish ✓")}
                </button>
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="text-center text-[13px] text-[#718096] pt-1 pb-2">
              {tab === 'login' ? (
                <>{t("Akkountingiz yo'qmi?")} <span onClick={() => setTab('register')} className="text-[#1E6FD9] font-semibold cursor-pointer">{t("Ro'yxatdan o'ting")}</span></>
              ) : (
                <>{t('Akkountingiz bormi?')} <span onClick={() => setTab('login')} className="text-[#1E6FD9] font-semibold cursor-pointer">{t('Kirish')}</span></>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
