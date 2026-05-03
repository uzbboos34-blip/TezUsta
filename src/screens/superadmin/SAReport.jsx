const Sparkline = ({ color = '#22c55e', points = [] }) => {
  const w = 120, h = 40, pad = 4
  if (!points.length) points = [5, 8, 6, 11, 9, 14, 10, 16, 13, 18, 15, 20]
  const min = Math.min(...points), max = Math.max(...points)
  const range = max - min || 1
  const pts = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const Pct = ({ val, positive = true }) => (
  <span className={`flex items-center gap-0.5 text-[11px] font-black ${positive ? 'text-emerald-500' : 'text-red-400'}`}>
    <span>{positive ? '▲' : '▼'}</span>{val}%
    <span className="text-[#A0AEC0] font-medium ml-1">o'tgan oyga nisbatan</span>
  </span>
)

export default function SAReport({ t, fmt, report, users = [] }) {
  if (!report) return null

  const topCards = [
    {
      label: 'Platforma foydasi',
      value: fmt(report.platformProfit),
      unit: 'UZS',
      icon: '💎',
      bg: 'bg-[#1A202C]',
      textColor: 'text-white',
      sub: '+8.5%',
      positive: true,
      badge: 'Bugungi foyda',
    },
    {
      label: 'Aktiv ishlar',
      value: report.activeJobs ?? 0,
      unit: '',
      icon: '🛒',
      bg: 'bg-[#1A202C]',
      textColor: 'text-white',
      sub: '+12',
      positive: true,
      badge: 'Aktiv ishlar',
    },
    {
      label: 'Tasdiq kutilmoqda',
      value: report.pendingJobs ?? 0,
      unit: '',
      icon: '⏳',
      bg: 'bg-[#1A202C]',
      textColor: 'text-white',
      sub: '-5',
      positive: false,
      badge: 'Tasdiqlanishi kutyotgan',
    },
    {
      label: 'Yangi foydalanuvchilar',
      value: report.totalUsers ?? 0,
      unit: '',
      icon: '👥',
      bg: 'bg-[#1A202C]',
      textColor: 'text-white',
      sub: '+6',
      positive: true,
      badge: 'Yangi foydalanuvchilar',
    },
  ]

  const miniCards = [
    { label: 'Platforma foydasi', value: fmt(report.platformProfit), unit: 'UZS', pct: 12.5, positive: true,  color: '#22c55e', points: [4,7,5,9,8,12,10,15,12,18,14,20] },
    { label: 'Odamlar soni',       value: report.totalUsers,          unit: 'ta',  pct: 20,   positive: true,  color: '#3b82f6', points: [2,5,4,8,6,10,8,13,10,15,12,17] },
    { label: "E'lonlar soni",       value: report.totalJobs,           unit: 'ta',  pct: 8,    positive: true,  color: '#a855f7', points: [6,8,7,10,9,11,10,13,12,14,13,16] },
    { label: 'Ishlar aylanmasi',   value: fmt(report.totalJobVolume), unit: 'UZS', pct: 15,   positive: true,  color: '#f97316', points: [3,6,5,8,7,10,9,12,11,14,13,16] },
  ]

  const workers = users.filter(u => u.role === 'worker').slice(0, 5)

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">

      {/* Top dark stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.map((c, i) => (
          <div key={i} className="bg-[#1A202C] rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-[18px]">{c.icon}</div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t(c.badge)}</span>
            </div>
            <div className="text-[22px] font-black text-white leading-tight">
              {c.value} <span className="text-[12px] text-white/30 font-bold">{c.unit}</span>
            </div>
            <span className={`text-[11px] font-black ${c.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {c.positive ? '▲' : '▼'} {c.sub} <span className="text-white/30 font-medium">kechagiga nisbatan</span>
            </span>
          </div>
        ))}
      </div>

      {/* Mini white cards with sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {miniCards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-[#E8EDF5] shadow-sm flex flex-col gap-2 overflow-hidden">
            <div className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest">{t(c.label)}</div>
            <div className="text-[22px] font-black" style={{ color: c.color }}>
              {c.value} <span className="text-[11px] text-[#A0AEC0]">{c.unit}</span>
            </div>
            <Pct val={c.pct} positive={c.positive} />
            <div className="mt-1 -mx-1">
              <Sparkline color={c.color} points={c.points} />
            </div>
          </div>
        ))}
      </div>

      {/* Workers quick table */}
      {workers.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
            <h3 className="text-[15px] font-black text-[#1A202C]">👥 {t("Foydalanuvchilar")}</h3>
          </div>

          <div className="overflow-x-auto">
            {/* Table head */}
            <div className="min-w-[600px] grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9] text-[10px] text-[#94A3B8] font-black uppercase tracking-wider">
              <span>{t("Foydalanuvchi")}</span>
              <span>{t("Ma'lumot")}</span>
              <span>{t("Balans")}</span>
              <span>{t("Topdi")}</span>
              <span>{t("Status")}</span>
              <span>{t("Amallar")}</span>
            </div>

            <div className="divide-y divide-[#F8FAFC] min-w-[600px]">
              {workers.map(u => (
                <div key={u.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-[#F8FAFC] transition-colors">
                  {/* User */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center font-black text-blue-600 text-[14px] shrink-0">
                      {u.name?.[0]}
                    </div>
                    <div>
                      <div className="text-[13px] font-black text-[#1A202C]">{u.name}</div>
                      <div className="text-[10px] text-[#A0AEC0]">{u.phone}</div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-0.5">
                    {u.region && (
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <span className="text-[#A0AEC0]">📍</span> {u.region}{u.district ? `, ${u.district}` : ''}
                      </div>
                    )}
                    {u.skills?.length > 0 && (
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <span className="text-[#A0AEC0]">🔧</span> {u.skills.slice(0,3).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Balance */}
                  <div className="text-[13px] font-black text-blue-600">{fmt(u.balance || 0)} <span className="text-[10px] text-[#A0AEC0]">UZS</span></div>

                  {/* Earned */}
                  <div className="text-[13px] font-black text-emerald-600">{fmt(u.totalEarned || 0)} <span className="text-[10px] text-[#A0AEC0]">UZS</span></div>

                  {/* Status */}
                  <div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${u.isBlocked ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                      {u.isBlocked ? '● Faol emas' : '● Aktiv'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <button className="w-8 h-8 rounded-lg bg-[#F4F7FB] text-[#64748B] flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-colors text-[14px]">👁️</button>
                    <button className="w-8 h-8 rounded-lg bg-[#F4F7FB] text-[#64748B] flex items-center justify-center hover:bg-amber-50 hover:text-amber-500 transition-colors text-[14px]">🗂️</button>
                    <button className="w-8 h-8 rounded-lg bg-[#F4F7FB] text-red-300 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors text-[14px]">🚫</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User breakdown */}
      <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm p-6">
        <h3 className="text-[15px] font-black text-[#1A202C] mb-5">📊 {t("Foydalanuvchilar taqsimoti")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {[
            { label: 'Ustalar',  value: report.totalWorkers ?? 0, color: 'bg-blue-500',   pct: Math.round(((report.totalWorkers??0) / (report.totalUsers||1)) * 100) },
            { label: 'Mijozlar', value: report.totalClients ?? 0, color: 'bg-violet-500', pct: Math.round(((report.totalClients??0) / (report.totalUsers||1)) * 100) },
            { label: 'Adminlar', value: report.totalAdmins  ?? 0, color: 'bg-gray-300',   pct: Math.round(((report.totalAdmins??0)  / (report.totalUsers||1)) * 100) },
          ].map((g, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-[#718096]">{t(g.label)}</span>
                <span className="text-[14px] font-black text-[#1A202C]">{g.value}</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${g.color} rounded-full transition-all duration-700`} style={{ width: `${g.pct}%` }} />
              </div>
              <div className="text-[11px] text-[#A0AEC0] font-bold">{g.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
