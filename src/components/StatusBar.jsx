import { useState, useEffect } from 'react'
import { useApp } from '../context'

export default function StatusBar() {
  const { state } = useApp()
  const [time, setTime] = useState('9:41')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
    }
    updateTime()
    const id = setInterval(updateTime, 30000)
    return () => clearInterval(id)
  }, [])

  const isDark = state.screen === 'lang'
  const bg = isDark ? 'bg-transparent' : 'bg-[#1251C5]'

  return (
    <div className={`px-[22px] pt-[13px] pb-[7px] flex justify-between items-center shrink-0 z-50 ${bg}`}>
      <span className="text-white font-bold text-[15px] tracking-wide">{time}</span>
      <div className="flex gap-[5px] items-center">
        <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-white"><rect x="2" y="16" width="3" height="6" rx="1" /><rect x="7" y="12" width="3" height="10" rx="1" /><rect x="12" y="8" width="3" height="14" rx="1" /><rect x="17" y="4" width="3" height="18" rx="1" /></svg>
        <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-white stroke-2 fill-none stroke-linecap-round"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" /></svg>
        <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-white stroke-2 fill-none"><rect x="1" y="7" width="18" height="10" rx="2" /><line x1="23" y1="11" x2="23" y2="13" /><rect x="3" y="9" width="14" height="6" rx="1" className="fill-white stroke-none" /></svg>
      </div>
    </div>
  )
}
