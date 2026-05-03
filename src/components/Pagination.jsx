import { useT } from '../i18n'

export default function Pagination({ current, total, limit = 8, onPageChange }) {
  const t = useT()
  const totalPages = Math.ceil(total / limit)
  
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6 mb-10 overflow-x-auto no-scroll py-2">
      <button 
        onClick={() => current > 1 && onPageChange(current - 1)}
        disabled={current === 1}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${current === 1 ? 'opacity-30 cursor-not-allowed grayscale' : 'bg-white text-[#1A202C] shadow-sm hover:bg-gray-50 active:scale-90'}`}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`min-w-[40px] h-10 rounded-xl font-black text-[14px] transition-all ${current === p ? 'bg-[#1E6FD9] text-white shadow-lg shadow-blue-100 scale-110' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
        >
          {p}
        </button>
      ))}

      <button 
        onClick={() => current < totalPages && onPageChange(current + 1)}
        disabled={current === totalPages}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${current === totalPages ? 'opacity-30 cursor-not-allowed grayscale' : 'bg-white text-[#1A202C] shadow-sm hover:bg-gray-50 active:scale-90'}`}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2"><path d="M9 18l6-6 6-6"/></svg>
      </button>
    </div>
  )
}
