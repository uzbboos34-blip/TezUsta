import { useState } from 'react'
import { useApp } from '../context'
import { getActiveSkills } from '../data'
import RegionSelect from '../components/RegionSelect'
import { useT } from '../i18n'
import { authApi } from '../api'

export default function AuthScreen() {
  const { state, dispatch } = useApp()
  const t = useT()
  const [role, setRole] = useState('client')
  const [tab, setTab] = useState('register')
  const [skills, setSkills] = useState([])
  const [cats, setCats] = useState([])
  const allCats = (state.categories?.length > 0) ? state.categories : getActiveSkills().map(s => ({ id: s.key, name: s.name, icon: s.icon, status: 'active' }))
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showLPass, setShowLPass] = useState(false)
  const [showRPass, setShowRPass] = useState(false)
  const [consent, setConsent] = useState(false)

  // Phone Mask: +998 (__) ___-__-__
  const handlePhone = (v, setter) => {
    let val = v.replace(/\D/g, '')
    if (val.startsWith('998')) val = val.substring(3)
    
    let res = '+998'
    if (val.length > 0) res += ' (' + val.substring(0, 2)
    if (val.length > 2) res += ') ' + val.substring(2, 5)
    if (val.length > 5) res += '-' + val.substring(5, 7)
    if (val.length > 7) res += '-' + val.substring(7, 9)
    setter(res)
  }
  const rawPhone = (p) => '+' + p.replace(/\D/g, '')

  // Password strength meter
  const getPassStrength = (p) => {
    if (!p) return 0
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return Math.min(s, 4)
  }
  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  // Registration Form
  const [rName, setRName] = useState('')
  const [rPhone, setRPhone] = useState('')
  const [rPass, setRPass] = useState('')
  const [rRegion, setRRegion] = useState('')
  const [rDistrict, setRDistrict] = useState('')

  const [lPhone, setLPhone] = useState('+998')
  const [lPass, setLPass] = useState('')

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
    const errs = {}
    if (!rName || rName.length < 3 || !/^[A-Za-z\u0400-\u04FF\s'ʻ]+$/.test(rName)) errs.rName = t("Iltimos, to'g'ri ism-familiya kiriting (raqamlarsiz)")
    const rPhoneRaw = rawPhone(rPhone)
    if (rPhoneRaw.length < 13 || !/^\+998(9[012345789]|33|50|55|77|88)\d{7}$/.test(rPhoneRaw)) errs.rPhone = t("O'zbekiston operatori raqamini kiriting")
    if (rPass.length < 6) errs.rPass = t("Parol kamida 6 ta belgi bo'lishi kerak")
    if (!rRegion || !rDistrict) errs.rLocation = t("Viloyat va tuman tanlang")
    if (role === 'worker' && skills.length === 0) errs.skills = t("Kamida bitta kasb tanlang")
    if (!consent) errs.consent = t("Foydalanish shartlariga rozi bo'lishingiz kerak")

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})

    setLoading(true)
    try {
      const { data } = await authApi.register({
        name: rName,
        phone: rawPhone(rPhone),
        pass: rPass,
        role,
        region: rRegion,
        district: rDistrict,
        skills: role === 'worker' ? skills : undefined,
        cats: role === 'client' ? cats : undefined
      })
      loginUser(data)
    } catch (e) {
      setErrors({ global: e.response?.data?.message || t("Ro'yxatdan o'tishda xato yuz berdi") })
    } finally {
      setLoading(false)
    }
  }

  const doLogin = async () => {
    const errs = {}
    const lPhoneRaw = rawPhone(lPhone)
    if (lPhoneRaw.length < 13 || !/^\+998(9[012345789]|33|50|55|77|88)\d{7}$/.test(lPhoneRaw)) errs.lPhone = t("O'zbekiston operatori raqamini kiriting")
    if (!lPass) errs.lPass = t("Parolni kiriting")
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})

    setLoading(true)
    try {
      const { data } = await authApi.login({ phone: rawPhone(lPhone), pass: lPass })
      loginUser(data)
    } catch (e) {
      setErrors({ global: e.response?.data?.message || e.message || t("Telefon yoki parol noto'g'ri") })
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
          <div className="text-[52px] font-extrabold text-white mb-2">zen<span className="text-[#22C55E]">tro</span></div>
          <div className="text-white/70 text-[16px] font-medium mb-8">{t('Usta va xizmat platformasi')}</div>
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
      <div className="flex-1 flex flex-col overflow-y-auto no-scroll lg:justify-center relative min-h-screen lg:min-h-0">
        
        {/* Desktop Language Selector (Absolute Top Right) */}
        <div className="hidden lg:block absolute top-6 right-8 z-10">
          <select value={state.lang} onChange={e => dispatch({ type: 'SET_LANG', lang: e.target.value })} className="bg-white border border-[#E8EDF5] text-[#1A202C] font-bold py-2 px-4 rounded-xl text-[13px] outline-none cursor-pointer shadow-sm hover:border-[#1E6FD9] transition-colors appearance-none pr-8 relative">
            <option value="uz">O'zbek</option>
            <option value="kir">Ўзбекча</option>
            <option value="ru">Русский</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#718096]">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>

        <div className="lg:hidden bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] pt-10 px-6 pb-12 rounded-b-[32px] text-center shrink-0 relative">
          <div className="absolute top-5 right-5">
            <select value={state.lang} onChange={e => dispatch({ type: 'SET_LANG', lang: e.target.value })} className="bg-white/20 text-white font-bold py-1.5 px-3 rounded-lg text-[13px] outline-none appearance-none cursor-pointer">
              <option value="uz">UZB</option>
              <option value="kir">ЎЗБ</option>
              <option value="ru">РУС</option>
            </select>
          </div>
          <div className="text-[28px] font-extrabold text-white mb-1">zen<span className="text-[#22C55E]">tro</span></div>
          <div className="text-[13px] text-white/75">{t('Usta va xizmat platformasi')}</div>
          <div className="flex bg-white/15 rounded-xl p-1 mx-3 mt-5">
            <div onClick={() => setTab('login')} className={`flex-1 py-2.5 text-center rounded-lg text-[13px] sm:text-[14px] font-semibold cursor-pointer transition-colors ${tab === 'login' ? 'bg-white text-[#1E6FD9]' : 'text-white/70'}`}>{t('Kirish')}</div>
            <div onClick={() => setTab('register')} className={`flex-1 py-2.5 text-center rounded-lg text-[13px] sm:text-[14px] font-semibold cursor-pointer transition-colors ${tab === 'register' ? 'bg-white text-[#1E6FD9]' : 'text-white/70'}`}>{t("Ro'yxatdan o'tish")}</div>
          </div>
        </div>

        <div className="p-5 lg:p-10 flex flex-col gap-3 -mt-6 lg:mt-0 lg:max-w-md lg:mx-auto lg:w-full lg:justify-center lg:flex-1">
          {/* Desktop tab switcher */}
          <div className="hidden lg:flex justify-center mb-4">
            <div className="w-full max-w-[320px] bg-[#F4F7FB] rounded-xl p-1 border border-[#E8EDF5] flex">
              <div onClick={() => setTab('login')} className={`flex-1 py-2.5 text-center rounded-lg text-[14px] font-semibold cursor-pointer transition-colors ${tab === 'login' ? 'bg-white text-[#1E6FD9] shadow-sm' : 'text-[#718096]'}`}>{t('Kirish')}</div>
              <div onClick={() => setTab('register')} className={`flex-1 py-2.5 text-center rounded-lg text-[14px] font-semibold cursor-pointer transition-colors ${tab === 'register' ? 'bg-white text-[#1E6FD9] shadow-sm' : 'text-[#718096]'}`}>{t("Ro'yxatdan o'tish")}</div>
            </div>
          </div>

          {tab === 'login' ? (
            <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_24px_rgba(18,81,197,0.16)] border border-[#E8EDF5]">
              <div className="text-[16px] font-bold text-[#1A202C] mb-4">{t('🔐 Tizimga kirish')}</div>
              <div className="flex flex-col gap-3">
                {errors.global && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-[13px] font-medium border border-red-100">{errors.global}</div>}
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold text-[#718096]">{t('Telefon raqam')}</label><input autoComplete="tel" value={lPhone} onChange={e => handlePhone(e.target.value, setLPhone)} maxLength={19} className={`bg-white border-[1.5px] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9] ${errors.lPhone ? 'border-red-500' : 'border-[#E8EDF5]'}`} type="tel" placeholder="+998 (__) ___-__-__" />{errors.lPhone && <span className="text-red-500 text-[12px] mt-0.5">{errors.lPhone}</span>}</div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#718096]">{t('Parol')}</label>
                  <div className="relative">
                    <input autoComplete="current-password" value={lPass} onChange={e => setLPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} className={`w-full bg-white border-[1.5px] rounded-xl px-4 py-3 pr-10 text-[14px] outline-none focus:border-[#1E6FD9] ${errors.lPass ? 'border-red-500' : 'border-[#E8EDF5]'}`} type={showLPass ? "text" : "password"} placeholder={t('Parolni kiriting')} />
                    <button type="button" onClick={() => setShowLPass(!showLPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                      {showLPass ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.lPass && <span className="text-red-500 text-[12px] mt-0.5">{errors.lPass}</span>}
                </div>
                <button disabled={loading || !lPhone || !lPass} onClick={doLogin} className="w-full mt-1 flex items-center justify-center gap-2 bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white font-bold py-3.5 rounded-[14px] shadow-[0_4px_16px_rgba(30,111,217,0.36)] active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed">
                  {loading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  {loading ? t('Yuklanmoqda...') : t('Kirish')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_24px_rgba(18,81,197,0.16)] border border-[#E8EDF5]">
              <div className="text-[16px] font-bold text-[#1A202C] mb-4">{t("📝 Ro'yxatdan o'tish")}</div>
              
              {/* Role Selection inside Form */}
              <div className="mb-4">
                <label className="text-[13px] font-semibold text-[#718096] mb-2 block">{t('Sizga kim kerak?')}</label>
                <div className="flex gap-2">
                  <div onClick={() => setRole('client')} className={`flex-1 p-3 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${role === 'client' ? 'border-[#1E6FD9] bg-[#F4F7FB]' : 'border-[#E8EDF5] bg-white'}`}>
                    <span className="text-[20px]">🏗️</span>
                    <span className={`text-[13px] font-bold ${role === 'client' ? 'text-[#1E6FD9]' : 'text-[#1A202C]'}`}>{t('Usta kerak')}</span>
                  </div>
                  <div onClick={() => setRole('worker')} className={`flex-1 p-3 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${role === 'worker' ? 'border-[#22C55E] bg-[#F0FDF4]' : 'border-[#E8EDF5] bg-white'}`}>
                    <span className="text-[20px]">👷</span>
                    <span className={`text-[13px] font-bold ${role === 'worker' ? 'text-[#22C55E]' : 'text-[#1A202C]'}`}>{t('Ish qidiryapman')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {errors.global && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-[13px] font-medium border border-red-100">{errors.global}</div>}
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold text-[#718096]">{t('Ism Familiya')}</label><input autoComplete="name" value={rName} onChange={e => setRName(e.target.value)} className={`bg-white border-[1.5px] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9] ${errors.rName ? 'border-red-500' : 'border-[#E8EDF5]'}`} placeholder={t('Masalan: Abdulloh Karimov')} />{errors.rName && <span className="text-red-500 text-[12px] mt-0.5">{errors.rName}</span>}</div>
                <div className="flex flex-col gap-1.5"><label className="text-[13px] font-semibold text-[#718096]">{t('Telefon raqam')}</label><input autoComplete="tel" value={rPhone} onChange={e => handlePhone(e.target.value, setRPhone)} maxLength={19} className={`bg-white border-[1.5px] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9] ${errors.rPhone ? 'border-red-500' : 'border-[#E8EDF5]'}`} type="tel" placeholder="+998 (__) ___-__-__" onClick={e => { if (!rPhone || rPhone === '+998') setRPhone('+998 (') }} />{errors.rPhone && <span className="text-red-500 text-[12px] mt-0.5">{errors.rPhone}</span>}</div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#718096]">{t('Parol')}</label>
                  <div className="relative">
                    <input autoComplete="new-password" value={rPass} onChange={e => setRPass(e.target.value)} className={`w-full bg-white border-[1.5px] rounded-xl px-4 py-3 pr-10 text-[14px] outline-none focus:border-[#1E6FD9] ${errors.rPass ? 'border-red-500' : 'border-[#E8EDF5]'}`} type={showRPass ? "text" : "password"} placeholder={t('Kamida 6 ta belgi')} />
                    <button type="button" onClick={() => setShowRPass(!showRPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                      {showRPass ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {rPass.length > 0 && (
                    <div className="flex gap-1 mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`flex-1 ${i < getPassStrength(rPass) ? strengthColors[getPassStrength(rPass)] : 'bg-transparent'}`}></div>
                      ))}
                    </div>
                  )}
                  {errors.rPass && <span className="text-red-500 text-[12px] mt-0.5">{errors.rPass}</span>}
                </div>
                <div>
                  <RegionSelect light region={rRegion} district={rDistrict} onRegion={setRRegion} onDistrict={setRDistrict} />
                  {errors.rLocation && <span className="text-red-500 text-[12px] mt-1 block">{errors.rLocation}</span>}
                </div>
                {role === 'worker' && (
                  <div className="bg-[#F4F7FB] rounded-xl p-3.5 mt-1">
                    <div className="text-[13px] font-bold text-[#1A202C] mb-2.5">{t('🛠️ Qanday ishlarda tajribangiz bor?')}</div>
                    {allCats.length === 0 ? (
                      <div className="flex gap-2 flex-wrap animate-pulse">
                        <div className="h-8 bg-gray-200 rounded-full w-24"></div><div className="h-8 bg-gray-200 rounded-full w-20"></div><div className="h-8 bg-gray-200 rounded-full w-28"></div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {allCats.map(s => (
                          <span key={s.id} onClick={() => toggleSkill(s.id)}
                            className={`px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer border-[1.5px] transition-all select-none ${skills.includes(s.id) ? 'bg-[#1E6FD9] text-white border-[#1E6FD9] shadow-md' : 'bg-white border-[#E8EDF5] text-[#718096]'}`}>
                            {s.icon} {t(s.name)}
                          </span>
                        ))}
                      </div>
                    )}
                    {errors.skills && <span className="text-red-500 text-[12px] mt-2 block">{errors.skills}</span>}
                  </div>
                )}

                <div className="mt-2 flex items-start gap-2">
                  <input type="checkbox" id="consent" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded text-[#1E6FD9] focus:ring-[#1E6FD9] border-gray-300 cursor-pointer" />
                  <label htmlFor="consent" className="text-[12px] text-[#718096] leading-tight select-none cursor-pointer">
                    {t('Men')} <span className="text-[#1E6FD9] font-semibold hover:underline" onClick={e => {e.preventDefault(); alert('📄', t('Maxfiylik Siyosati'), t('Bu yerda maxfiylik siyosati matni bo\'ladi'))}}>{t('Maxfiylik siyosati')}</span> {t('va')} <span className="text-[#1E6FD9] font-semibold hover:underline" onClick={e => {e.preventDefault(); alert('📜', t('Foydalanish shartlari'), t('Bu yerda foydalanish shartlari matni bo\'ladi'))}}>{t('Foydalanish shartlariga')}</span> {t('roziman')}
                  </label>
                </div>
                {errors.consent && <span className="text-red-500 text-[12px] -mt-1 block">{errors.consent}</span>}

                <button disabled={loading || !rName || !rPhone || !rPass || !rRegion || !consent || (role === 'worker' && skills.length === 0)} onClick={doRegister} className="w-full mt-1 flex items-center justify-center gap-2 bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white font-bold py-3.5 rounded-[14px] shadow-[0_4px_16px_rgba(34,197,94,0.38)] active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed">
                  {loading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  {loading ? t('Yuklanmoqda...') : t("Ro'yxatdan o'tish ✓")}
                </button>
              </div>
            </div>
          )}

          <div className="text-center text-[13px] text-[#718096] pt-1 pb-2">
            {tab === 'login' ? (
              <>{t("Akkountingiz yo'qmi?")} <span onClick={() => setTab('register')} className="text-[#1E6FD9] font-semibold cursor-pointer">{t("Ro'yxatdan o'ting")}</span></>
            ) : (
              <>{t('Akkountingiz bormi?')} <span onClick={() => setTab('login')} className="text-[#1E6FD9] font-semibold cursor-pointer">{t('Kirish')}</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
