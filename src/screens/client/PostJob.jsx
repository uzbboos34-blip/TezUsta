import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context'
import { getActiveSkills } from '../../data'
import { useT } from '../../i18n'
import { jobsApi } from '../../api'

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">{label && <label className="text-[13px] font-bold text-[#718096]">{label}</label>}{children}</div>
)

export default function PostJob() {
  const { state, dispatch } = useApp()
  const t = useT()
  const { editJobId, categories } = state

  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState('')
  const [addr, setAddr] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [budget, setBudget] = useState('')
  const [requiredWorkers, setRequiredWorkers] = useState(1)
  const [showMap, setShowMap] = useState(false)
  const [lat, setLat] = useState(41.2995)
  const [lng, setLng] = useState(69.2401)
  const [tempAddr, setTempAddr] = useState('')
  const [loadingAddr, setLoadingAddr] = useState(false)
  const [loading, setLoading] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const fetchAddress = async (la, ln) => {
    setLoadingAddr(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${la}&lon=${ln}&zoom=18&addressdetails=1`)
      const data = await res.json()
      if (data && data.display_name) {
        const parts = data.display_name.split(', ')
        setTempAddr(parts.slice(0, 3).join(', '))
      } else {
        setTempAddr(t('Tanlangan nuqta'))
      }
    } catch (e) {
      setTempAddr(t('Manzilni yuklashda xato'))
    } finally {
      setLoadingAddr(false)
    }
  }

  useEffect(() => { if (showMap) fetchAddress(lat, lng) }, [showMap])

  useEffect(() => {
    if (!showMap || !mapRef.current) return
    const L = window.L
    if (!L) return
    const map = L.map(mapRef.current, { center: [lat, lng], zoom: 13, zoomControl: false, attributionControl: false })
    mapInstanceRef.current = map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map)
    const icon = L.divIcon({ html: `<div style="font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">📍</div>`, iconSize: [32, 32], iconAnchor: [16, 28], className: '' })
    const marker = L.marker([lat, lng], { icon, draggable: false }).addTo(map)
    markerRef.current = marker
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      setLat(lat); setLng(lng)
      marker.setLatLng([lat, lng])
      fetchAddress(lat, lng)
    })
    setTimeout(() => map.invalidateSize(), 150)
    return () => {
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [showMap])

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert(t("Brauzeringiz joylashuvni aniqlashni qo'llab-quvvatlamaydi"))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLat(latitude)
        setLng(longitude)
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1 })
          markerRef.current.setLatLng([latitude, longitude])
        }
        fetchAddress(latitude, longitude)
      },
      (err) => {
        alert(t("Joylashuvni aniqlab bo'lmadi. Ruxsat berilganiga ishonch hosil qiling."))
      },
      { enableHighAccuracy: true }
    )
  }

  useEffect(() => { if (editJobId) fetchEditJob() }, [editJobId])

  const fetchEditJob = async () => {
    try {
      const { data: j } = await jobsApi.getOne(editJobId)
      setName(j.title); setDesc(j.desc && j.desc !== '—' ? j.desc : '')
      setCat(j.cat); setAddr(j.addr); setPhone(j.phone)
      setBudget(j.price === 0 ? '' : j.price.toString())
      setRequiredWorkers(j.requiredWorkers || 1)
      setLat(j.lat || 41.2995); setLng(j.lng || 69.2401)
      if (j.dueDate) {
        const d = new Date(j.dueDate);
        // format to YYYY-MM-DDThh:mm
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        setDate(`${y}-${m}-${day}T${h}:${min}`);
      }
    } catch (e) { console.error(e) }
  }

  const handlePhone = (v) => {
    let val = v.replace(/[^\d+]/g, '')
    if (val.length > 0 && !val.startsWith('+998')) val = '+998' + val.replace(/^\+?998?/, '')
    if (val.length > 13) val = val.slice(0, 13)
    setPhone(val)
  }

  const post = async () => {
    if (!name || !cat || !addr) {
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '⚠️', title: t("To'ldiring"), sub: t('Ish nomi, kasb va manzilni kiritish shart') } } })
      return
    }
    setLoading(true)
    try {
      const priceVal = parseInt(budget) || 0
      let formattedDate = t('Vaqti kelishiladi');
      let isoDate = undefined;
      
      if (date) {
        const d = new Date(date);
        isoDate = d.toISOString();
        const m = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'][d.getMonth()];
        const day = d.getDate();
        const h = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        formattedDate = `${day}-${m}, ${h}:${min}`;
      }

      const jobData = {
        title: name, cat, price: priceVal, addr,
        phone: phone || state.user.phone,
        date: formattedDate,
        desc: desc || '—', lat, lng,
        requiredWorkers,
        ...(isoDate && { dueDate: isoDate })
      }
      if (editJobId) {
        await jobsApi.update(editJobId, jobData)
        dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '✅', title: t("Saqlandi!"), sub: t("O'zgarishlar muvaffaqiyatli saqlandi.") } } })
        dispatch({ type: 'SET_EDIT_JOB', id: null })
      } else {
        await jobsApi.create(jobData)
        dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '🚀', title: t("E'lon joylandi!"), sub: `"${name}" ${t("ishi joylashtirildi. Ustalar tez orada murojaat qiladi.")}` } } })
      }
      if (state.user?.role === 'worker') {
        dispatch({ type: 'GO', screen: 'worker-profile' })
      } else {
        dispatch({ type: 'GO', screen: 'client-home' })
      }
    } catch (e) {
      alert(t('Xato yuz berdi'))
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (state.user?.role === 'worker') {
      dispatch({ type: 'GO', screen: 'worker-profile' })
    } else {
      dispatch({ type: 'GO', screen: 'client-home' })
    }
  }

  // MAP view (shared mobile/desktop)
  if (showMap) {
    return (
      <div className="flex-1 flex flex-col bg-[#F4F7FB]">
        <div className="bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] px-5 pt-4 pb-4 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowMap(false)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] stroke-white stroke-2 fill-none stroke-linecap-round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <h1 className="text-white text-[18px] font-extrabold">{t('Manzilni tanlang')}</h1>
          </div>
          <button onClick={() => { if (tempAddr) setAddr(tempAddr); setShowMap(false) }}
            disabled={loadingAddr}
            className={`bg-white text-[#1251C5] px-4 py-2 rounded-xl font-bold text-[13px] shadow-lg transition-opacity ${loadingAddr ? 'opacity-50' : ''}`}>
            {t('Tasdiqlash')}
          </button>
        </div>
        <div className="flex-1 relative bg-[#E2E8F0]">
          <div ref={mapRef} className="absolute inset-0 z-0" />
          <div className="absolute top-4 inset-x-6 z-[1000]">
            <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-[#E2E8F0] flex items-start gap-3">
              <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[20px] shrink-0">📍</div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">{t('Tanlangan manzil:')}</div>
                <div className="text-[13px] font-bold text-[#1E293B] truncate leading-tight">
                  {loadingAddr ? t('Aniqlanmoqda...') : tempAddr || t('Nuqtani belgilang')}
                </div>
              </div>
            </div>
          </div>
          <button onClick={handleMyLocation} className="absolute bottom-20 right-4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#1E6FD9] z-[1000] border border-[#E8EDF5] active:scale-95 transition-all">
            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1E293B]/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-white/10 text-white font-bold text-[11px] z-[1000] pointer-events-none">
            {t('Nuqtani belgilash uchun xaritani bosing')}
          </div>
        </div>
      </div>
    )
  }

  const inputCls = "bg-white border-[1.5px] border-[#E8EDF5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9] transition-colors"

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB] overflow-hidden">

      {/* ── MOBILE ── */}
      <div className="lg:hidden flex flex-col flex-1 overflow-y-auto no-scroll">
        <div className="bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] px-5 pt-4 pb-6 rounded-b-[24px] shrink-0">
          <div className="flex items-center gap-3 mb-1.5">
            <button onClick={goBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] stroke-white stroke-2 fill-none stroke-linecap-round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <h1 className="text-white text-[20px] font-extrabold flex-1">{editJobId ? t("E'lonni tahrirlash") : t('Ish joylashtirish')}</h1>
          </div>
          <div className="text-[13px] text-white/80 ml-12">{t("Tafsilotlarni to'ldiring, ustalar topiladi")}</div>
        </div>
        <div className="p-5 flex flex-col gap-[14px]">
          <Field label={t('Ish nomi *')}><input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder={t('Masalan: Rakovina o\'rnatish')} /></Field>
          <Field label={t('Tavsif')}><textarea value={desc} onChange={e => setDesc(e.target.value)} className={`${inputCls} resize-none h-[88px]`} placeholder={t('Ish haqida batafsil yozing...')} /></Field>
          <Field label={t('Kasb turi *')}>
            <div className="relative">
              <select value={cat} onChange={e => setCat(e.target.value)} className={`${inputCls} w-full pl-4 pr-10 appearance-none cursor-pointer`}>
                <option value="" disabled>{t('Kasb turini tanlang')}</option>
                {categories.map(s => <option key={s.id} value={s.id}>{t(s.name)}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#A0AEC0] pointer-events-none" />
            </div>
          </Field>
          <Field label={t('Manzil *')}>
            <div className="flex gap-2">
              <input value={addr} onChange={e => setAddr(e.target.value)} className={`${inputCls} flex-1`} placeholder={t("Ko'cha, uy raqami")} />
              <button onClick={() => setShowMap(true)} className="bg-[#EBF3FF] border border-[#BFDBFE] text-[#1E6FD9] px-4 rounded-xl font-bold flex items-center justify-center shrink-0">📍 {t('Xarita')}</button>
            </div>
          </Field>
          <Field label={t('Telefon raqam')}>
            <input 
              value={phone} 
              onChange={e => handlePhone(e.target.value)}
              onClick={() => { if (!phone) handlePhone('+998') }}
              className={inputCls} 
              type="tel" 
              placeholder="+998901234567" 
            />
          </Field>
          <Field label={t('Sana va vaqt')}>
            <input value={date} onChange={e => setDate(e.target.value)} className={inputCls} type="datetime-local" />
            <div className="text-[11px] text-[#A0AEC0] ml-1">{t('Belgilamasangiz "Vaqti kelishiladi" bo\'lib qoladi')}</div>
          </Field>
          <Field label={t('Byudjet (so\'m)')}>
            <div className="relative">
              <input value={budget} onChange={e => setBudget(e.target.value)} className={`${inputCls} w-full pl-4 pr-16`} type="number" placeholder={t('Kelishiladi')} />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#718096] pointer-events-none">{t("so'm")}</span>
            </div>
            <div className="bg-[#EBF3FF] border border-[#BFDBFE] rounded-lg p-2.5 mt-0.5">
              <div className="text-[11px] text-[#1E6FD9] leading-tight font-medium">💡 {t('Bo\'sh qoldirsangiz "Kelishiladi" deb ko\'rinadi.')}</div>
            </div>
          </Field>
          <Field label={t('Kerakli ustalar soni')}>
            <div className="flex items-center gap-3">
              <button onClick={() => setRequiredWorkers(Math.max(1, requiredWorkers - 1))} className="w-12 h-12 rounded-xl bg-white border border-[#E8EDF5] text-[#1E6FD9] flex items-center justify-center font-bold text-xl active:scale-95 transition-transform shadow-sm">-</button>
              <div className="flex-1 h-12 flex items-center justify-center font-black text-[#1A202C] text-lg bg-[#F8FAFC] border border-[#E8EDF5] rounded-xl">{requiredWorkers} {t('ta usta')}</div>
              <button onClick={() => setRequiredWorkers(Math.min(10, requiredWorkers + 1))} className="w-12 h-12 rounded-xl bg-white border border-[#E8EDF5] text-[#1E6FD9] flex items-center justify-center font-bold text-xl active:scale-95 transition-transform shadow-sm">+</button>
            </div>
          </Field>
          <button disabled={loading} onClick={post} className="mt-2 w-full bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white font-bold py-[15px] rounded-[14px] shadow-[0_4px_16px_rgba(30,111,217,0.36)] active:scale-95 transition-transform disabled:opacity-50">
            {loading ? t('Yuklanmoqda...') : editJobId ? t('💾 Saqlash') : `🚀 ${t("E'lon berish")}`}
          </button>
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
            <h1 className="text-[22px] font-extrabold text-[#1A202C]">{editJobId ? t("E'lonni tahrirlash") : t('Ish joylashtirish')}</h1>
            <p className="text-[13px] text-[#718096] mt-0.5">{t("Tafsilotlarni to'ldiring, ustalar topiladi")}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scroll p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <Field label={t('Ish nomi *')}><input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder={t("Masalan: Rakovina o'rnatish")} /></Field>
                </div>
                <div className="col-span-2">
                  <Field label={t('Tavsif')}><textarea value={desc} onChange={e => setDesc(e.target.value)} className={`${inputCls} resize-none h-[100px]`} placeholder={t('Ish haqida batafsil yozing...')} /></Field>
                </div>
                <Field label={t('Kasb turi *')}>
                  <div className="relative">
                    <select value={cat} onChange={e => setCat(e.target.value)} className={`${inputCls} w-full pl-4 pr-10 appearance-none cursor-pointer`}>
                      <option value="" disabled>{t('Kasb turini tanlang')}</option>
                      {categories.map(s => <option key={s.id} value={s.id}>{t(s.name)}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#A0AEC0] pointer-events-none" />
                  </div>
                </Field>
                <Field label={t('Telefon raqam')}>
                  <input 
                    value={phone} 
                    onChange={e => handlePhone(e.target.value)}
                    onClick={() => { if (!phone) handlePhone('+998') }}
                    className={inputCls} 
                    type="tel" 
                    placeholder="+998901234567" 
                  />
                </Field>
                <div className="col-span-2">
                  <Field label={t('Manzil *')}>
                    <div className="flex gap-2">
                      <input value={addr} onChange={e => setAddr(e.target.value)} className={`${inputCls} flex-1`} placeholder={t("Ko'cha, uy raqami")} />
                      <button onClick={() => setShowMap(true)} className="bg-[#EBF3FF] border border-[#BFDBFE] text-[#1E6FD9] px-5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap hover:bg-[#DBEAFE] transition-colors">📍 {t('Xaritadan tanlash')}</button>
                    </div>
                  </Field>
                </div>
                <Field label={t('Sana va vaqt')}>
                  <input value={date} onChange={e => setDate(e.target.value)} className={inputCls} type="datetime-local" />
                  <div className="text-[11px] text-[#A0AEC0] ml-1">{t('Ixtiyoriy')}</div>
                </Field>
                <Field label={t("Byudjet (so'm)")}>
                  <div className="relative">
                    <input value={budget} onChange={e => setBudget(e.target.value)} className={`${inputCls} w-full pl-4 pr-16`} type="number" placeholder={t('Kelishiladi')} />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#718096] pointer-events-none">{t("so'm")}</span>
                  </div>
                </Field>
                <div className="col-span-2">
                  <Field label={t('Kerakli ustalar soni')}>
                    <div className="flex items-center gap-3 max-w-[200px]">
                      <button onClick={() => setRequiredWorkers(Math.max(1, requiredWorkers - 1))} className="w-12 h-12 rounded-xl bg-white border border-[#E8EDF5] text-[#1E6FD9] flex items-center justify-center font-bold text-xl hover:bg-[#F8FAFC] active:scale-95 transition-all shadow-sm">-</button>
                      <div className="flex-1 h-12 flex items-center justify-center font-black text-[#1A202C] text-lg bg-[#F8FAFC] border border-[#E8EDF5] rounded-xl">{requiredWorkers} {t('ta usta')}</div>
                      <button onClick={() => setRequiredWorkers(Math.min(10, requiredWorkers + 1))} className="w-12 h-12 rounded-xl bg-white border border-[#E8EDF5] text-[#1E6FD9] flex items-center justify-center font-bold text-xl hover:bg-[#F8FAFC] active:scale-95 transition-all shadow-sm">+</button>
                    </div>
                  </Field>
                </div>
              </div>
              <div className="mt-8 bg-[#EBF3FF] border border-[#BFDBFE] rounded-xl p-4">
                <div className="text-[12px] text-[#1E6FD9] font-medium leading-relaxed">💡 {t('Byudjetni bo\'sh qoldirsangiz "Kelishiladi" deb ko\'rinadi. Keyinchalik usta bilan aniq narxni o\'zaro gaplashib olishingiz mumkin.')}</div>
              </div>
              <div className="mt-6 flex justify-end">
                <button disabled={loading} onClick={post}
                  className="bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white font-bold px-10 py-3.5 rounded-xl shadow-[0_4px_16px_rgba(30,111,217,0.36)] hover:shadow-xl transition-all disabled:opacity-50 text-[15px]">
                  {loading ? t('Yuklanmoqda...') : editJobId ? t('💾 Saqlash') : `🚀 ${t("E'lon berish")}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
