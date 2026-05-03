import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context'
import { useT } from '../i18n'
import { chatsApi, jobsApi } from '../api'

export default function ChatScreen() {
  const { state, dispatch } = useApp()
  const t = useT()
  const { user, chatBack, activeChatId } = state
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [inp, setInp] = useState('')
  const scrollRef = useRef(null)

  const fetchChats = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await chatsApi.getAll()
      setChats(data)
    } catch (e) { console.error(e) }
    finally { if (!silent) setLoading(false) }
  }

  const fetchActiveChat = async (id, silent = false) => {
    try {
      const { data } = await chatsApi.getOne(id)
      setActiveChat(data)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchChats()
    const timer = setInterval(() => fetchChats(true), 10000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (activeChatId) {
      fetchActiveChat(activeChatId)
      const timer = setInterval(() => fetchActiveChat(activeChatId, true), 3000)
      return () => clearInterval(timer)
    } else {
      setActiveChat(null)
    }
  }, [activeChatId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeChat?.messages])

  const send = async () => {
    if (!inp.trim() || !activeChatId) return
    const text = inp
    setInp('')
    try {
      await chatsApi.sendMessage(activeChatId, text)
      fetchActiveChat(activeChatId, true)
    } catch (e) {
      alert(e.response?.data?.message || t('Xato yuz berdi'))
      setInp(text)
    }
  }

  const goBack = () => {
    if (activeChatId) {
      dispatch({ type: 'SET_CHAT', id: null })
    } else {
      let target = chatBack || (user?.role === 'client' ? 'client-home' : 'worker-home')
      if (user?.role === 'client' && (target === 'worker-home' || target === 'worker-myjobs')) target = 'client-home'
      if (user?.role === 'worker' && (target === 'client-home' || target === 'applicants')) target = 'worker-home'
      dispatch({ type: 'GO', screen: target })
    }
  }

  useEffect(() => {
    if (!activeChatId) {
      let target = chatBack || (user?.role === 'client' ? 'client-home' : 'worker-home')
      if (user?.role === 'client' && (target === 'worker-home' || target === 'worker-myjobs')) target = 'client-home'
      if (user?.role === 'worker' && (target === 'client-home' || target === 'applicants')) target = 'worker-home'
      dispatch({ type: 'GO', screen: target })
    }
  }, [activeChatId, user?.role])

  if (!activeChatId) return null

  const otherUser = activeChat?.users.find(u => u.user.id !== user.id)?.user

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB] overflow-hidden">
      <div className="bg-white px-5 pt-3 pb-3 shrink-0 shadow-sm z-10 flex items-center justify-between border-b border-[#E8EDF5]">
        <div className="flex items-center gap-3">
          <button onClick={() => dispatch({ type: 'SET_CHAT', id: null })} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E8EDF5] transition-colors">
            <svg viewBox="0 0 24 24" className="w-[19px] h-[19px] stroke-[#1A202C] stroke-2 fill-none stroke-linecap-round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] flex items-center justify-center text-white font-bold relative">
              {otherUser?.name?.[0]}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#1A202C] leading-none mb-1">{otherUser?.name}</div>
              <div className="text-[12px] font-medium text-[#16A34A] leading-none">{t('Online')}</div>
            </div>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 no-scroll">
        {!activeChat ? (
          <div className="text-center py-10 opacity-40">{t('Yuklanmoqda...')}</div>
        ) : activeChat.messages.length === 0 ? (
          <div className="text-center py-10 opacity-40 text-[13px]">{t('Suhbatni boshlang')}</div>
        ) : activeChat.messages.map((m, i) => (
          <div key={i} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-[18px] text-[14px] shadow-sm ${m.senderId === user.id ? 'bg-[#1E6FD9] text-white rounded-br-sm' : 'bg-white border border-[#E8EDF5] text-[#1A202C] rounded-bl-sm'}`}>
              <div>{m.text}</div>
              <div className={`text-[10px] mt-1 text-right ${m.senderId === user.id ? 'text-white/70' : 'text-[#A0AEC0]'}`}>
                {new Date(m.createdAt).toLocaleTimeString('uz-Latn', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-3.5 shrink-0 border-t border-[#E8EDF5]">
        <div className="flex gap-2 bg-[#F4F7FB] rounded-[18px] p-1.5 pr-2 items-center">
          <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={t('Xabar yozing...')} className="flex-1 bg-transparent px-3 py-2 outline-none text-[14px]" />
          <button onClick={send} className={`w-[38px] h-[38px] rounded-full flex items-center justify-center transition-colors ${inp.trim() ? 'bg-[#1E6FD9]' : 'bg-[#CBD5E1]'}`}>
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-white stroke-[2.5px] fill-none stroke-linecap-round stroke-linejoin-round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
