import { useState, useEffect } from 'react'
import { adminApi } from '../../api'
import { useApp } from '../../context'

export default function SAWheel() {
  const { dispatch } = useApp()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      const res = await adminApi.getWheelSettings()
      setSettings(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await adminApi.updateWheelSettings(settings)
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '✅', title: 'Saqlandi', sub: "Baraban sozlamalari muvaffaqiyatli yangilandi!" } } })
    } catch (e) {
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '❌', title: 'Xato', sub: "O'zgarishlarni saqlashda xatolik yuz berdi" } } })
    } finally {
      setSaving(false)
    }
  }

  const updatePrize = (index, field, value) => {
    const newPrizes = [...settings.prizes]
    newPrizes[index][field] = (field === 'amount' || field === 'chance') ? +value : value
    setSettings({ ...settings, prizes: newPrizes })
  }

  const addPrize = () => {
    const newPrizes = [...settings.prizes, { label: 'Yangi sovg\'a', amount: 0, chance: 0 }]
    setSettings({ ...settings, prizes: newPrizes })
  }

  const removePrize = (index) => {
    if (settings.prizes.length <= 2) {
      dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '⚠️', title: 'Taqiq', sub: "Barabanda kamida 2 ta sovg'a bo'lishi shart!" } } })
      return
    }
    const newPrizes = settings.prizes.filter((_, i) => i !== index)
    setSettings({ ...settings, prizes: newPrizes })
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Yuklanmoqda...</div>

  const totalChance = settings?.prizes?.reduce((acc, p) => acc + (p.chance || 0), 0) || 0

  return (
    <div className="p-6 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shadow-sm">🎡</span>
            Baraban sozlamalari
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sovg'alar miqdori va yutish ehtimolligini boshqarish</p>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={saving || totalChance !== 100}
          className="bg-[#2563EB] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Aylantirish narxi (Coin)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🪙</span>
            <input 
              type="number" 
              value={settings.spinCost} 
              onChange={e => setSettings({ ...settings, spinCost: +e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Umumiy ehtimollik</label>
          <div className="flex items-center gap-3">
            <div className={`text-2xl font-black ${totalChance === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
              {totalChance}%
            </div>
            {totalChance === 100 ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold uppercase tracking-wider">To'g'ri</span>
            ) : (
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Xato</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8">
        <div className="flex items-center justify-between px-8 py-5 bg-slate-50 border-b border-slate-200">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Sovg'alar ro'yxati</span>
          <button 
            onClick={addPrize}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 flex items-center gap-2"
          >
            <span>➕</span> Qat'or qo'shish
          </button>
        </div>
        <div className="grid grid-cols-[1.5fr_1fr_1fr_60px] gap-4 px-8 py-4 bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <span>Sovg'a nomi (Barabanda ko'rinadi)</span>
          <span>Yutuq summasi (UZS)</span>
          <span>Chiqish ehtimoli (%)</span>
          <span>Amal</span>
        </div>
        <div className="divide-y divide-slate-100">
          {settings.prizes.map((p, i) => (
            <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_60px] gap-4 px-8 py-5 items-center hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">{i+1}</span>
                <input 
                  type="text" 
                  value={p.label} 
                  onChange={e => updatePrize(i, 'label', e.target.value)}
                  className="bg-transparent border-b border-transparent focus:border-blue-400 outline-none font-bold text-slate-700 flex-1 py-1"
                />
              </div>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[14px]">sum</span>
                <input 
                  type="number" 
                  value={p.amount} 
                  onChange={e => updatePrize(i, 'amount', e.target.value)}
                  className="bg-transparent border-b border-transparent focus:border-blue-400 outline-none font-black text-slate-900 pl-8 w-full py-1"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-20">
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500 font-bold">%</span>
                  <input 
                    type="number" 
                    value={p.chance} 
                    onChange={e => updatePrize(i, 'chance', e.target.value)}
                    className="bg-transparent border-b border-transparent focus:border-blue-400 outline-none font-black text-blue-600 w-full py-1"
                  />
                </div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className={`h-full transition-all duration-500 ${p.chance > 20 ? 'bg-blue-500' : p.chance > 5 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${p.chance}%` }} />
                </div>
              </div>
              <div className="flex justify-center">
                 <button 
                   onClick={() => removePrize(i)}
                   className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                 >
                   ✕
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-start gap-5 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm shrink-0">💡</div>
        <div className="text-[13px] text-blue-900/80 leading-relaxed">
          <p className="font-black text-blue-900 mb-2 uppercase tracking-wider text-[11px]">Professional maslahat:</p>
          <p>Matematik aniqlikni saqlash uchun barcha ehtimolliklar yig'indisi **100%** bo'lishini ta'minlang. Agar usta yutuq yutsa, uning balansi avtomatik ravishda to'ldiriladi va tranzaksiyalar tarixida "Omadli g'ildirak yutug'i" deb ko'rinadi.</p>
        </div>
      </div>
    </div>
  )
}
