import { useState } from 'react'
import { adminApi } from '../../api'

export default function SASettings({ t, fmt, settings, fetchData, showModal }) {
  const [editing, setEditing] = useState(false)
  const [card,    setCard]    = useState(settings?.cardNum     || '')
  const [holder,  setHolder]  = useState(settings?.cardHolder  || '')
  const [comm,    setComm]    = useState(settings?.commission  || 30000)
  const [saving,  setSaving]  = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await adminApi.updateSettings({ cardNum: card, cardHolder: holder, commission: parseInt(comm) })
      showModal('✅', t('Saqlandi'), t('Sozlamalar yangilandi'))
      setEditing(false)
      fetchData(true)
    } catch(e) { showModal('❌', t('Xato'), '') }
    finally { setSaving(false) }
  }

  const cancel = () => {
    setCard(settings?.cardNum || '')
    setHolder(settings?.cardHolder || '')
    setComm(settings?.commission || 30000)
    setEditing(false)
  }

  const Field = ({ label, icon, value, onChange, type = 'text', unit, hint }) => (
    <div>
      <label className="text-[10px] text-[#94A3B8] font-black uppercase tracking-wider mb-2 block">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-4 text-[18px]">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={!editing}
          className={`w-full pl-12 ${unit ? 'pr-14' : 'pr-4'} py-4 rounded-2xl text-[14px] font-black border-2 transition-all outline-none
            ${editing ? 'bg-white border-blue-400 text-[#1A202C] shadow-lg shadow-blue-50' : 'bg-[#F8FAFC] border-transparent text-[#64748B]'}`}
        />
        {unit && <span className="absolute right-4 text-[11px] font-black text-[#A0AEC0] uppercase">{unit}</span>}
      </div>
      {hint && <p className="mt-1.5 text-[10px] text-[#A0AEC0] font-medium ml-1">{hint}</p>}
    </div>
  )

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-black text-[#0F172A]">⚙️ {t('Sozlamalar')}</h1>
        <p className="text-[13px] text-[#718096]">{t("Tizim va moliya sozlamalari")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance settings card */}
        <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-[20px]">⚙️</div>
              <h3 className="text-[15px] font-black text-[#1A202C]">{t("Moliya sozlamalari")}</h3>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="w-9 h-9 bg-[#F8FAFC] border border-[#E8EDF5] rounded-xl flex items-center justify-center hover:bg-[#EBF3FF] hover:border-blue-200 transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-[#64748B] stroke-2 fill-none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            ) : (
              <button onClick={cancel} className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 transition-all font-bold">✕</button>
            )}
          </div>

          <Field label={t("Karta raqami")} icon="💳" value={card} onChange={setCard} />
          <Field label={t("Karta egasi")} icon="👤" value={holder} onChange={setHolder} />
          <Field label={t("Minimal balans")} icon="💰" value={comm} onChange={setComm} type="number" unit="UZS"
            hint={t("Ustalar yangi ish olish uchun shu miqdordan ko'p balansga ega bo'lishi shart")} />

          {editing && (
            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving}
                className="flex-1 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-black py-3.5 rounded-xl shadow-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-50">
                {saving ? t("Saqlanmoqda...") : t("💾 Saqlash")}
              </button>
              <button onClick={cancel} className="px-6 bg-[#F1F5F9] text-[#64748B] font-black py-3.5 rounded-xl hover:bg-gray-200 transition-all">
                {t("Bekor")}
              </button>
            </div>
          )}
        </div>

        {/* Current values card */}
        <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[20px]">📊</div>
            <h3 className="text-[15px] font-black text-[#1A202C]">{t("Joriy ma'lumotlar")}</h3>
          </div>

          {[
            { label: t("To'lov karta"), value: settings?.cardNum || '—', icon: '💳' },
            { label: t("Karta egasi"),  value: settings?.cardHolder || '—', icon: '👤' },
            { label: t("Minimal balans"), value: `${fmt(settings?.commission || 0)} UZS`, icon: '💰' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[#F8FAFC] last:border-0">
              <div className="flex items-center gap-2 text-[13px] text-[#718096] font-medium">
                <span>{row.icon}</span>
                {row.label}
              </div>
              <span className="text-[13px] font-black text-[#1A202C]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
