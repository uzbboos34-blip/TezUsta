import { useApp } from '../context'
import { useT } from '../i18n'

export default function RoleScreen() {
  const { state, dispatch } = useApp()
  const t = useT()
  const r = state.selectedRole

  const roles = [
    { id: 'worker', icon: '👷', bg: 'bg-[#DCFCE7]', name: t('Ishchi (Usta)'), desc: t("Ish qidiryapman, xizmat ko'rsataman") },
    { id: 'client', icon: '🏗️', bg: 'bg-[#FFF7ED]', name: t('Ish beruvchi (Mijoz)'), desc: t("Usta kerak, ish joylashtiraman") },
    { id: 'admin', icon: '🔑', bg: 'bg-[#EDE9FE]', name: t('Admin'), desc: t("Platformani boshqarish: foydalanuvchilar, ishlar, moliya") },
    { id: 'superadmin', icon: '👑', bg: 'bg-[#FEF3C7]', name: t('Super Admin'), desc: t("Adminlarni boshqarish, tizim sozlamalari, global nazorat") },
  ]

  const select = (id) => dispatch({ type: 'SET_ROLE', role: id })

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB]">
      <div className="pt-8 px-6 pb-6 text-center">
        <h2 className="text-[22px] font-extrabold text-[#1A202C] mb-2">{t("Sizga kim kerak?")}</h2>
        <p className="text-[14px] text-[#718096] leading-relaxed">{t("Eng yaxshi ustalarni toping yoki o'zingiz xizmat ko'rsating")}</p>
      </div>

      <div className="px-5 flex flex-col gap-[14px] flex-1">
        {roles.map(role => {
          const on = r === role.id
          return (
            <div key={role.id} onClick={() => select(role.id)}
                 className={`bg-white rounded-[20px] p-6 border-[2.5px] cursor-pointer flex items-center gap-4 transition-all shadow-[0_2px_12px_rgba(18,81,197,0.12)] ${on ? 'border-[#1E6FD9] bg-[#EBF3FF]' : 'border-[#E8EDF5]'}`}>
              <div className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-[30px] shrink-0 ${role.bg}`}>
                {role.icon}
              </div>
              <div className="flex-1">
                <div className="text-[17px] font-bold text-[#1A202C] mb-1">{role.name}</div>
                <div className="text-[13px] text-[#718096] leading-relaxed">{role.desc}</div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${on ? 'bg-[#1E6FD9] border-[#1E6FD9]' : 'bg-white border-[#E8EDF5]'}`}>
                <svg viewBox="0 0 14 14" className="w-[13px] h-[13px] stroke-white stroke-[2.5px] fill-none">
                  <polyline points="2 7 5.5 10.5 12 4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-5">
        <button 
          onClick={() => r && dispatch({ type: 'GO', screen: 'auth' })}
          disabled={!r}
          className={`w-full font-bold py-[15px] rounded-[14px] transition-all ${r ? 'bg-gradient-to-br from-[#1E6FD9] to-[#1251C5] text-white shadow-[0_4px_16px_rgba(30,111,217,0.36)] active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
          {t("Davom etish \u2192")}
        </button>
      </div>
    </div>
  )
}
