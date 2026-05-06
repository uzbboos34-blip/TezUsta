import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context'
import { getCatName, fmt, starsArr } from '../../data'
import { useT } from '../../i18n'
import { jobsApi, usersApi, chatsApi } from '../../api'

export default function JobDetail() {
  const { state, dispatch } = useApp()
  const t = useT()
  const { currentJobId, user } = state
  const [j, setJ] = useState(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null)
  const mapRefDesktop = useRef(null)
  const mapInstanceRef = useRef(null)
  const mapDesktopInstanceRef = useRef(null)
  const workerMarkerRef = useRef(null)
  const workerMarkerDesktopRef = useRef(null)
  const [workerLocation, setWorkerLocation] = useState(null)
  const [distanceKm, setDistanceKm] = useState(null)
  const [locLoading, setLocLoading] = useState(false)

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert(t("Brauzeringiz joylashuvni aniqlashni qo'llab-quvvatlamaydi"))
      return
    }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setWorkerLocation([latitude, longitude])
        if (j && j.lat && j.lng) {
          const dist = calculateDistance(latitude, longitude, j.lat, j.lng)
          setDistanceKm(dist.toFixed(1))
        }
        
        // Fly to location
        if (mapInstanceRef.current) mapInstanceRef.current.flyTo([latitude, longitude], 15)
        if (mapDesktopInstanceRef.current) mapDesktopInstanceRef.current.flyTo([latitude, longitude], 15)
        
        setLocLoading(false)
      },
      (err) => {
        alert(t("Joylashuvni aniqlab bo'lmadi. Ruxsat berilganiga ishonch hosil qiling."))
        setLocLoading(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const fetchJob = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const { data } = await jobsApi.getOne(currentJobId)
      setJ(data)
    } catch (e) {
      if (e.response?.status === 404) {
        dispatch({ type: 'GO', screen: 'worker-home' })
        dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: 'ℹ️', title: t('E\'lon o\'chirildi'), sub: t('Ushbu ish beruvchi tomonidan o\'chirib tashlangan.') } } })
      }
      console.error(e)
    }
    finally { if (showLoading) setLoading(false) }
  }

  useEffect(() => {
    if (currentJobId) {
      fetchJob(true)
      const timer = setInterval(() => fetchJob(false), 5000) // Poll every 5 seconds
      return () => clearInterval(timer)
    }
  }, [currentJobId])

  const initMap = (ref, canSee, isDesktop = false) => {
    if (!j || !ref.current) return
    const L = window.L
    if (!L) return
    const coords = [j.lat || 41.2995, j.lng || 69.2401]
    const fLat = coords[0] + (Math.random() - 0.5) * 0.005
    const fLng = coords[1] + (Math.random() - 0.5) * 0.005
    const center = canSee ? coords : [fLat, fLng]
    
    // Auto-center map between job and worker if worker location is known
    let finalCenter = center;
    let finalZoom = 15;
    if (canSee && workerLocation) {
      finalCenter = [(coords[0] + workerLocation[0]) / 2, (coords[1] + workerLocation[1]) / 2]
      finalZoom = 13 // Zoom out slightly to see both
    }

    const map = L.map(ref.current, { center: finalCenter, zoom: finalZoom, zoomControl: false, attributionControl: false, scrollWheelZoom: false })
    if (isDesktop) mapDesktopInstanceRef.current = map
    else mapInstanceRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)
    
    if (canSee) {
      const icon = L.divIcon({ html: `<div style="background:linear-gradient(135deg,#1E6FD9,#1251C5);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3)"></div>`, iconSize: [32, 32], iconAnchor: [16, 32], className: '' })
      L.marker(coords, { icon }).addTo(map)

      if (workerLocation) {
        const wIcon = L.divIcon({ html: `<div style="background:#22C55E;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px rgba(34,197,94,0.3)"></div>`, iconSize: [16, 16], iconAnchor: [8, 8], className: '' })
        const wMarker = L.marker(workerLocation, { icon: wIcon }).addTo(map)
        if (isDesktop) workerMarkerDesktopRef.current = wMarker
        else workerMarkerRef.current = wMarker
      }
    } else {
      L.circle([fLat, fLng], { radius: 400, color: '#1E6FD9', fillColor: '#1E6FD9', fillOpacity: 0.1, weight: 2, dashArray: '6 4', opacity: 0.5 }).addTo(map)
      const icon = L.divIcon({ html: `<div style="font-size:28px;filter:blur(1.5px)">📍</div>`, iconSize: [30, 30], iconAnchor: [15, 28], className: '' })
      L.marker([fLat, fLng], { icon, interactive: false }).addTo(map)
    }
    setTimeout(() => map.invalidateSize(), 120)
    return () => {
      map.remove()
      if (isDesktop) { mapDesktopInstanceRef.current = null; workerMarkerDesktopRef.current = null }
      else { mapInstanceRef.current = null; workerMarkerRef.current = null }
    }
  }

  const canSeeInfo = (j && user?.id && (j.workerId === user.id || j.hasApplied || j.isMine))
  const [showExact, setShowExact] = useState(false)

  useEffect(() => {
    if (!j) return
    const canSee = (user?.id && (j.workerId === user.id || j.hasApplied || j.isMine))
    setShowExact(canSee)
    return initMap(mapRef, canSee, false)
  }, [j?.id, user?.id, j?.workerId, j?.hasApplied, showExact, workerLocation])

  useEffect(() => {
    if (!j) return
    const canSee = (user?.id && (j.workerId === user.id || j.hasApplied || j.isMine))
    return initMap(mapRefDesktop, canSee, true)
  }, [j?.id, user?.id, j?.workerId, j?.hasApplied, workerLocation])

  if (loading) return <div className="flex-1 flex items-center justify-center bg-[#F4F7FB] text-[#718096]">{t('Yuklanmoqda...')}</div>
  if (!j) return null

  const minBal = j.commission || 30000
  const cantTake = user.balance < minBal && !j.hasApplied

  const takeJob = async () => {
    if (cantTake || j.hasApplied) return
    try {
      await jobsApi.apply(j.id)
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '🎉', title: t('Ish sizniki!'), sub: t('Tabriklaymiz, ish sizga biriktirildi. Endi mijoz bilan bog\'lanib, ishni boshlashingiz mumkin.') } } })
      fetchJob()
      const { data: me } = await usersApi.getMe()
      dispatch({ type: 'LOGIN', user: me })
    } catch (e) {
      alert(e.response?.data?.message || t('Xato yuz berdi'))
    }
  }

  const openNav = () => window.open(`https://yandex.com/maps/?rtext=~${j.lat},${j.lng}&rtt=auto`, '_blank')
  const callClient = () => dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '📞', title: t("Qo'ng'iroq"), sub: `${t("Mijoz raqami:")} ${j.phone}` } } })
  const goBack = () => dispatch({ type: 'GO', screen: 'worker-home' })

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center px-4 py-3 border-b border-[#F1F5F9] last:border-0">
      <span className="text-[13px] font-medium text-[#718096]">{label}</span>
      <span className="text-[13px] font-semibold text-[#1A202C]">{value}</span>
    </div>
  )

  const LockedBadge = () => (
    <span className="bg-[#E8EDF5] rounded-md px-2 py-[3px] text-[11px] text-[#718096]">🔒 {t('Yashirin')}</span>
  )

  const requestFinish = async () => {
    if (j.price === 0) {
      dispatch({
        type: "SHOW_MODAL",
        modal: {
          type: "price_input",
          data: { 
            jobId: j.id,
            onSuccess: () => fetchJob(true)
          },
        },
      });
      return;
    }

    try {
      await jobsApi.requestFinish(j.id)
      dispatch({
        type: "SHOW_MODAL",
        modal: {
          type: "general",
          data: {
            icon: "⏳",
            title: t("Topshirildi"),
            sub: t("Mijoz ishni qabul qilsa, balansga pul tushadi."),
          },
        },
      });
      fetchJob(true)
    } catch (e) {
      alert(t("Xato yuz berdi"))
    }
  }

  const ActionButtons = () => (
    <>
      {!canSeeInfo && (
        <>
          <div className="bg-[#EBF3FF] rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-[13px] font-semibold text-[#1251C5]">💼 {t('Balansningiz:')}</span>
            <span className="text-[15px] font-extrabold text-[#1E6FD9]">{fmt(user.balance)} {t("so'm")}</span>
          </div>
          {cantTake ? (
            <button onClick={() => dispatch({ type: 'GO', screen: 'top-up' })}
              className="w-full font-bold py-[15px] rounded-[14px] bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white shadow-[0_4px_16px_rgba(245,158,11,0.38)] active:scale-95 flex items-center justify-center gap-2">
              💳 {t("Balansni to'ldirish")}
            </button>
          ) : user.isBlocked ? (
            <button disabled
              className="w-full font-bold py-[15px] rounded-[14px] bg-gray-400 text-white cursor-not-allowed flex items-center justify-center gap-2 opacity-60">
              🚫 {t('Ishni olish (Bloklangansiz)')}
            </button>
          ) : (
            <button onClick={takeJob}
              className="w-full font-bold py-[15px] rounded-[14px] bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white shadow-[0_4px_16px_rgba(34,197,94,0.38)] active:scale-95 flex items-center justify-center gap-2">
              {t('Ishni olish')}
            </button>
          )}
          <div className={`text-[12px] text-center ${cantTake || user.isBlocked ? 'text-[#EF4444]' : 'text-[#A0AEC0]'}`}>
            {cantTake ? `⚠️ ${t('Minimal balans')} ${fmt(minBal)} ${t("so'm")}. ${t("Hisobni to'ldiring.")}` : user.isBlocked ? t("Siz bloklangansiz, shuning uchun ish ola olmaysiz") : t("Ishni olish uchun balans yetarli bo'lishi kerak")}
          </div>
        </>
      )}
      {canSeeInfo && j.status !== 'done' && (
        <div className="flex flex-col gap-2.5">
          {j.status === 'active' && (
            <button onClick={requestFinish} className="w-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white font-bold py-[15px] rounded-[14px] shadow-[0_4px_16px_rgba(34,197,94,0.38)] active:scale-95 transition-transform flex items-center justify-center gap-2">
              ✅ {t('Ishni topshirish (Bajarildi)')}
            </button>
          )}
          
          <div className="bg-[#DCFCE7] rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-[#16A34A]">📞 {t('Mijoz telefoni')}</div>
              <div className="text-[16px] font-extrabold text-[#16A34A]">{j.phone}</div>
            </div>
            <button onClick={callClient} className="border-2 border-[#1E6FD9] text-[#1E6FD9] rounded-[10px] px-3.5 py-2 text-[13px] font-bold hover:bg-[#EBF3FF] transition-colors">
              {t("Qo'ng'iroq")}
            </button>
          </div>
          <button onClick={async () => {
            const cid = Number(j.clientId || j.client?.id)
            const uid = Number(user?.id)
            if (!cid || isNaN(cid)) return alert(t('Mijoz ID-si topilmadi'))
            if (!uid || isNaN(uid)) return alert(t('Usta ID-si topilmadi (qayta kiring)'))

            try {
              const { data } = await chatsApi.create({ jobId: Number(j.id), userIds: [uid, cid] })
              dispatch({ type: 'SET_CHAT', id: data.id })
              dispatch({ type: 'GO', screen: 'chat' })
            } catch (e) {
              console.error('Chat error:', e)
              alert(e.response?.data?.message || e.message || t('Xato yuz berdi'))
            }
          }}
            className="w-full bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white font-bold py-[15px] rounded-[14px] shadow-[0_4px_16px_rgba(30,111,217,0.36)] active:scale-95 transition-transform">
            💬 {t('Chat ochish')}
          </button>
        </div>
      )}
    </>
  )

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB] overflow-hidden">

      {/* ── MOBILE ── */}
      <div className="lg:hidden flex flex-col flex-1 overflow-y-auto no-scroll">
        <div className="bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] px-5 pt-4 pb-7 rounded-b-[24px] shrink-0">
          <div className="flex justify-between items-center mb-3.5">
            <button onClick={goBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] stroke-white stroke-2 fill-none stroke-linecap-round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="relative">
              <select value={state.lang} onChange={e => dispatch({ type: 'SET_LANG', lang: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full appearance-none">
                <option value="uz">UZ</option>
                <option value="kir">КР</option>
                <option value="ru">RU</option>
              </select>
              <div className="bg-white/20 text-white font-bold py-1.5 px-3 rounded-lg text-[13px] flex items-center gap-1">
                🌍 {state.lang.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[36px] shrink-0">{j.icon}</div>
            <div>
              <div className="text-[20px] font-extrabold text-white leading-tight">{j.title}</div>
              <div className="flex gap-2 mt-1.5">
                <span className="bg-white/20 text-white px-2.5 py-1 rounded-full text-[11px] font-bold">{getCatName(j.cat)}</span>
                {j.requiredWorkers > 1 && (
                  <span className="bg-white/20 text-white px-2.5 py-1 rounded-full text-[11px] font-bold">
                    👥 {j.acceptedWorkersCount || 0}/{j.requiredWorkers}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-0 pb-5">
          <div className="h-[210px] relative overflow-hidden shrink-0">
            <div ref={mapRef} className="w-full h-full" />
            {showExact && <div className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-[rgba(18,81,197,0.9)] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full z-[800] backdrop-blur-sm whitespace-nowrap">📍 {t('Aniq manzil')}</div>}
            {showExact && <div className="absolute bottom-2.5 left-2.5 bg-[rgba(34,197,94,0.9)] text-white rounded-lg px-2.5 py-1.5 text-[12px] font-bold z-[800] backdrop-blur-sm">📍 {distanceKm ? `${distanceKm} km (Sizdan)` : j.dist || '---'}</div>}
            
            <button onClick={handleMyLocation} className="absolute bottom-14 right-2.5 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#1E6FD9] z-[800] border border-[#E8EDF5] active:scale-95 transition-all">
              <svg viewBox="0 0 24 24" className={`w-5 h-5 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round ${locLoading ? 'animate-spin' : ''}`}>
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            {showExact && <button onClick={openNav} className="absolute bottom-2.5 right-2.5 bg-white rounded-xl px-3 py-2 text-[12px] font-bold text-[#1E6FD9] flex items-center gap-1 shadow-md z-[800] hover:bg-gray-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg> {t("Yo'nalish")}</button>}
            {!showExact && (
              <>
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-[rgba(18,81,197,0.9)] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full z-[800] backdrop-blur-sm whitespace-nowrap">📍 {t('Taxminiy joylashuv')}</div>
                <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center z-[900] backdrop-blur-[6px]">
                  <div className="text-[44px] mb-2.5">🔒</div>
                  <div className="text-white text-[14px] font-semibold text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: t('Manzil faqat ishni<br/>olgandan keyin ko\'rinadi') }} />
                </div>
              </>
            )}
          </div>
          <div className="pt-3.5 px-[18px] flex flex-col gap-3.5">
            <div className="bg-[#DCFCE7] rounded-[14px] px-[18px] py-[14px] flex items-center justify-between">
              <div>
                <div className="text-[12px] font-medium text-[#16A34A]">{t('Ish haqi')}</div>
                <div className="flex items-baseline gap-1">
                  {j.price === 0 ? <span className="text-[20px] font-extrabold text-[#16A34A]">{t('Kelishiladi')}</span> : <><span className="text-[24px] font-extrabold text-[#16A34A]">{fmt(j.price)}</span><span className="text-[13px] font-semibold text-[#16A34A]">{t("so'm")}</span></>}
                </div>
              </div>
              <div className="text-[34px]">💰</div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm p-3.5">
              <div className="text-[13px] font-bold text-[#1A202C] mb-1.5">📄 {t('Tavsif')}</div>
              <div className="text-[13px] text-[#718096] leading-relaxed">{j.desc}</div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm">
              <InfoRow label={t('Manzil')} value={canSeeInfo && j.status !== 'done' ? j.addr : <LockedBadge />} />
              <InfoRow label={t('Telefon')} value={canSeeInfo && j.status !== 'done' ? j.phone : <LockedBadge />} />
              <InfoRow label={t('Masofa')} value={`📍 ${distanceKm ? `${distanceKm} km (Sizdan)` : j.dist || '---'}`} />
              <InfoRow label={t("To'lov")} value={`💵 ${t('Naqd')}`} />
            </div>
            <ActionButtons />
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#E8EDF5] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="w-9 h-9 bg-[#F4F7FB] rounded-xl flex items-center justify-center hover:bg-[#E8EDF5] transition-colors border border-[#E8EDF5]">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[#475569] stroke-2 fill-none stroke-linecap-round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-[30px]">{j.icon}</div>
              <div>
                <h1 className="text-[20px] font-extrabold text-[#1A202C]">{j.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[13px] text-[#718096]">{getCatName(j.cat)} · {j.date}</span>
                  {j.requiredWorkers > 1 && (
                    <span className="bg-[#FEF9C3] text-[#CA8A04] px-2 py-0.5 rounded-full text-[11px] font-bold">
                      👥 {j.acceptedWorkersCount || 0}/{j.requiredWorkers}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <select value={state.lang} onChange={e => dispatch({ type: 'SET_LANG', lang: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full appearance-none">
              <option value="uz">O'zbek</option>
              <option value="kir">Ўзбекча</option>
              <option value="ru">Русский</option>
            </select>
            <div className="bg-[#F4F7FB] border border-[#E8EDF5] text-[#1A202C] font-bold py-2 px-4 rounded-xl text-[13px] flex items-center gap-2 hover:bg-gray-50 transition-colors">
              🌍 {state.lang.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scroll p-8">
          <div className="max-w-5xl mx-auto flex gap-6">
            {/* Left: map + details */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Map */}
              <div className="rounded-2xl overflow-hidden h-[300px] relative border border-[#E8EDF5] shadow-sm">
                <div ref={mapRefDesktop} className="w-full h-full" />
                {canSeeInfo && <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[rgba(18,81,197,0.9)] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full z-[800] backdrop-blur-sm whitespace-nowrap">📍 {t('Aniq manzil')}</div>}
                <button onClick={handleMyLocation} className="absolute bottom-16 right-3 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-[#1E6FD9] z-[800] border border-[#E8EDF5] hover:bg-gray-50 transition-colors">
                  <svg viewBox="0 0 24 24" className={`w-5 h-5 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round ${locLoading ? 'animate-spin' : ''}`}>
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                {canSeeInfo && <button onClick={openNav} className="absolute bottom-3 right-3 bg-white rounded-xl px-3 py-2 text-[12px] font-bold text-[#1E6FD9] flex items-center gap-1 shadow-md z-[800] hover:bg-gray-50 transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg> {t("Yo'nalish")}</button>}
                {!canSeeInfo && (
                  <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center z-[900] backdrop-blur-[6px]">
                    <div className="text-[44px] mb-2">🔒</div>
                    <div className="text-white text-[14px] font-semibold text-center">{t("Manzil faqat ishni olgandan keyin ko'rinadi")}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm p-5">
                <h3 className="text-[14px] font-bold text-[#1A202C] mb-2">📄 {t('Tavsif')}</h3>
                <p className="text-[14px] text-[#718096] leading-relaxed">{j.desc}</p>
              </div>

              {/* Info grid */}
              <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm">
                <div className="grid grid-cols-2">
                  <div className="p-4 border-b border-r border-[#F1F5F9]">
                    <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">{t('Manzil')}</div>
                    <div className="text-[14px] font-semibold text-[#1A202C]">{canSeeInfo && j.status !== 'done' ? j.addr : <LockedBadge />}</div>
                  </div>
                  <div className="p-4 border-b border-[#F1F5F9]">
                    <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">{t('Telefon')}</div>
                    <div className="text-[14px] font-semibold text-[#1A202C]">{canSeeInfo && j.status !== 'done' ? j.phone : <LockedBadge />}</div>
                  </div>
                  <div className="p-4 border-r border-[#F1F5F9]">
                    <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">{t('Masofa')}</div>
                    <div className="text-[14px] font-semibold text-[#1A202C]">📍 {distanceKm ? `${distanceKm} km (Sizdan)` : j.dist || '---'}</div>
                  </div>
                  <div className="p-4">
                    <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">{t("To'lov")}</div>
                    <div className="text-[14px] font-semibold text-[#1A202C]">💵 {t('Naqd')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: price + actions */}
            <div className="w-72 shrink-0 flex flex-col gap-4">
              <div className="bg-[#DCFCE7] rounded-2xl p-5">
                <div className="text-[12px] font-medium text-[#16A34A] mb-1">{t('Ish haqi')}</div>
                <div className="text-[28px] font-extrabold text-[#16A34A]">
                  {j.price === 0 ? t('Kelishiladi') : `${fmt(j.price)}`}
                </div>
                {j.price > 0 && <div className="text-[13px] text-[#16A34A]">{t("so'm")}</div>}
              </div>
              <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm p-4 flex flex-col gap-3">
                <ActionButtons />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
