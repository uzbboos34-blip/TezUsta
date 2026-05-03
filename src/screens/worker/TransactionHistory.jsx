import { useState, useEffect } from 'react'
import { useApp } from '../../context'
import { fmt } from '../../data'
import { useT } from '../../i18n'
import { usersApi } from '../../api'
import Pagination from '../../components/Pagination'

export default function TransactionHistory() {
  const { state, dispatch } = useApp()
  const t = useT()
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  const fetchHistory = async (p = 1) => {
    try {
      setLoading(true)
      const res = await usersApi.getHistory(p, 100) // fetch more to filter locally for now
      setHistory(res.data.data || [])
      setTotal(res.data.total || 0)
      setPage(p)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory(1) }, [])

  const back = () => dispatch({ type: 'GO', screen: 'worker-profile' })

  const filterTabs = [
    { id: 'all', label: 'Hamma' },
    { id: 'expenses', label: 'Xarajatlar' },
    { id: 'topups', label: "To'ldirish" }
  ]

  const changeMonth = (offset) => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + offset)
    setCurrentDate(d)
  }

  const HistoryItem = ({ h }) => {
    const isIncome = (h.hType === 'request') || (h.hType === 'transaction' && h.type === 'topup')
    const isOk = h.status === 'approved' || h.hType === 'transaction'
    const isRej = h.status === 'rejected'
    const isPending = h.status === 'pending'
    
    const Icon = () => {
      if (isRej) {
        return (
          <div className="w-[46px] h-[46px] rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
             <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#EF4444] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        )
      } else if (isPending) {
        return (
          <div className="w-[46px] h-[46px] rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
             <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#F59E0B] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        )
      } else {
        return (
          <div className="w-[46px] h-[46px] rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
             <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#16A34A] stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round"><line x1="19" y1="5" x2="5" y2="19"/><polyline points="19 14 19 5 10 5"/></svg>
          </div>
        )
      }
    }

    const title = h.hType === 'request' ? (isRej ? "TO'LOV RAD ETILDI" : isPending ? "TO'LOV KUTILMOQDA" : "TO'LOV SO'ROVI") : (isIncome ? "HISOB TO'LDIRILDI" : "XIZMAT HAQI YECHILDI")
    const subtitle = isRej ? "Qabul qilinmadi" : isPending ? "Jarayonda" : (h.desc || "Tashqi operatsiya •7617")
    const amountStr = isIncome ? `+${fmt(h.amount)}` : `-${fmt(h.amount)}`
    const amountColor = isIncome ? 'text-[#16A34A]' : 'text-[#1A202C]'
    
    const time = new Date(h.createdAt).toLocaleTimeString('uz-Latn', { hour: '2-digit', minute: '2-digit' })

    return (
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] bg-white">
        <div className="flex items-center gap-4">
          <Icon />
          <div>
            <div className="text-[14px] font-extrabold text-[#1A202C] mb-0.5 tracking-wide">{title}</div>
            <div className="text-[12px] text-[#718096] font-medium">{subtitle}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-[14px] font-extrabold ${amountColor} mb-0.5`}>
            {amountStr} <span className="text-[11px] font-semibold text-[#A0AEC0]">so'm</span>
          </div>
          <div className="text-[12px] text-[#A0AEC0] font-medium">{time}</div>
        </div>
      </div>
    )
  }

  // Filter Data
  const filteredHistory = history.filter(h => {
    const date = new Date(h.createdAt)
    if (date.getMonth() !== currentDate.getMonth() || date.getFullYear() !== currentDate.getFullYear()) return false
    
    const isIncome = (h.hType === 'request') || (h.hType === 'transaction' && h.type === 'topup')
    if (activeTab === 'expenses' && isIncome) return false
    if (activeTab === 'topups' && !isIncome) return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!h.desc?.toLowerCase().includes(q) && !(h.amount+'').includes(q)) return false
    }

    return true
  })

  // Calculate expenses for the current month from ALL history (ignoring tabs/search)
  const totalExpenses = history.reduce((acc, h) => {
    const date = new Date(h.createdAt)
    if (date.getMonth() !== currentDate.getMonth() || date.getFullYear() !== currentDate.getFullYear()) return acc
    
    const isIncome = (h.hType === 'request') || (h.hType === 'transaction' && h.type === 'topup')
    if (!isIncome && h.status !== 'rejected') {
      return acc + h.amount
    }
    return acc
  }, 0)

  const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"]
  const currentMonthName = monthNames[currentDate.getMonth()]

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB] overflow-hidden text-[#1A202C] w-full h-full">
      <div className="flex-1 overflow-y-auto no-scroll pb-10">
        <div className="w-full lg:max-w-2xl lg:mx-auto lg:px-0">
        
        {/* Top Bar */}
          <div className="flex items-center justify-between px-5 lg:px-6 py-4 mt-2 bg-white border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <button onClick={back} className="w-8 h-8 flex items-center justify-center -ml-2 hover:bg-[#F1F5F9] rounded-full transition-colors">
                <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-[#1A202C] stroke-[2] fill-none stroke-linecap-round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <h1 className="text-[22px] lg:text-[24px] font-black text-[#1A202C] tracking-wide">{t("Tarix")}</h1>
            </div>
            <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 flex items-center justify-center bg-[#F1F5F9] rounded-full active:scale-95 transition-transform hover:bg-[#E8EDF5]">
              {showSearch ? <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#1A202C] stroke-[2] fill-none stroke-linecap-round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> : <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#1A202C] stroke-[2] fill-none stroke-linecap-round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
            </button>
          </div>

          {showSearch && (
            <div className="px-5 lg:px-6 mb-2">
              <div className="flex items-center bg-[#F1F5F9] rounded-2xl px-4 py-2 border border-[#E8EDF5]">
                <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#94A3B8] stroke-[2] fill-none shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tranzaksiyani izlash..." className="bg-transparent border-none outline-none w-full ml-2 text-[14px] font-bold text-[#1A202C]" autoFocus />
              </div>
            </div>
          )}

          {/* Month Selector */}
          <div className="flex items-center justify-between px-5 lg:px-6 py-3">
            <div className="flex items-center gap-4">
              <button onClick={() => changeMonth(-1)} className="p-1 active:scale-90 hover:bg-[#F1F5F9] rounded-full transition-colors"><svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[#94A3B8] stroke-[2.5] fill-none stroke-linecap-round"><polyline points="15 18 9 12 15 6" /></svg></button>
              <span className="text-[16px] font-bold text-[#1A202C] tracking-wide">{currentMonthName} {currentDate.getFullYear() !== new Date().getFullYear() && currentDate.getFullYear()}</span>
              <button onClick={() => changeMonth(1)} className="p-1 active:scale-90 hover:bg-[#F1F5F9] rounded-full transition-colors"><svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[#22C55E] stroke-[2.5] fill-none stroke-linecap-round"><polyline points="9 18 15 12 9 6" /></svg></button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2.5 px-5 lg:px-6 py-3 overflow-x-auto no-scroll">
            <button className="bg-[#F1F5F9] rounded-full w-[38px] h-[38px] flex items-center justify-center shrink-0 hover:bg-[#E8EDF5] transition-colors">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[#64748B] stroke-[2] fill-none stroke-linecap-round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            {filterTabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full text-[13px] font-extrabold shrink-0 transition-colors shadow-sm ${activeTab === tab.id ? 'bg-[#16A34A] text-white' : 'bg-[#F4F7FB] text-[#64748B] hover:bg-[#E8EDF5]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Summary Box */}
          <div className="px-5 lg:px-6 py-3">
            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] border border-[#E8EDF5] rounded-[24px] p-5 lg:p-6 shadow-sm">
              <div className="text-[12px] text-[#64748B] mb-1 font-bold tracking-wide">{currentMonthName} oyidagi xarajatlar</div>
              <div className="text-[26px] lg:text-[32px] font-black text-[#1A202C] tracking-tight">{fmt(totalExpenses)} <span className="text-[14px] font-semibold text-[#94A3B8]">so'm</span></div>
            </div>
          </div>

          {/* Section Header */}
          <div className="bg-[#F4F7FB] border-y border-[#E8EDF5] text-[#64748B] text-[12px] font-extrabold px-5 lg:px-6 py-2.5 tracking-wide mt-2">
            {filteredHistory.length > 0 ? "Barchasi" : "Bo'sh"}
          </div>

          {/* List */}
          <div className="bg-white">
            {loading ? (
              <div className="text-center py-20 text-[#A0AEC0] font-bold animate-pulse">{t('Yuklanmoqda...')}</div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-20 text-[#A0AEC0]">
                <div className="text-[52px] mb-3">💳</div>
                <div className="text-[14px] font-bold">{t("Ushbu oyda harakatlar yo'q")}</div>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredHistory.map((h, i) => <HistoryItem key={i} h={h} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
