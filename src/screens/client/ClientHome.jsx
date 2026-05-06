import { useApp } from "../../context";
import { getCat, fmt } from "../../data";
import { useT } from "../../i18n";
import { jobsApi, chatsApi } from "../../api";
import { useState, useEffect } from "react";

export default function ClientHome() {
  const { state, dispatch } = useApp();
  const { user } = state;
  const t = useT();
  const [activeTab, setActiveTab] = useState('open'); // open, active, done
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await jobsApi.getAll(undefined, true);
      setMyJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const timer = setInterval(() => fetchJobs(true), 3000); // Faster polling (3s)
    return () => clearInterval(timer);
  }, []);

  const filteredJobs = myJobs.filter(j => {
    if (activeTab === 'open') return j.status === 'open';
    if (activeTab === 'active') return j.status === 'active' || j.status === 'finishing';
    if (activeTab === 'done') return j.status === 'done';
    return true;
  });

  const viewApps = (jobId) => {
    dispatch({ type: "SET_JOB", id: jobId });
    dispatch({ type: "GO", screen: "applicants" });
  };

  const rate = (jobId) => {
    dispatch({ type: "SET_RATING_JOB", id: jobId });
    dispatch({ type: "SHOW_MODAL", modal: { type: "rate", data: { jobId } } });
  };

  const del = async (id) => {
    if (confirm(t("O'chirishni xohlaysizmi?"))) {
      try {
        await jobsApi.remove(id);
        fetchJobs();
      } catch (e) {
        alert(t("Xato yuz berdi"));
      }
    }
  };

  const confirmDone = (job) => {
    dispatch({ type: "SET_RATING_JOB", id: job.id });
    dispatch({
      type: "SHOW_MODAL",
      modal: { type: "rate", data: { jobId: job.id, job, isConfirmation: true } },
    });
  };

  const openChat = async (jobId, workerId) => {
    try {
      const { data } = await chatsApi.create({ jobId: Number(jobId), userIds: [Number(user.id), Number(workerId)] });
      dispatch({ type: "SET_CHATBACK", screen: "client-home" });
      dispatch({ type: "SET_CHAT", id: data.id });
      dispatch({ type: "GO", screen: "chat" });
    } catch (e) {
      alert(t("Xato yuz berdi"));
    }
  };

  const editJob = (id) => {
    dispatch({ type: "SET_EDIT_JOB", id });
    dispatch({ type: "GO", screen: "post-job" });
  };

  const tabs = [
    { id: 'open', label: t('Ochiq'), icon: '📋' },
    { id: 'active', label: t('Jarayonda'), icon: '⏳' },
    { id: 'done', label: t('Yakunlangan'), icon: '✅' }
  ];

  const timeoutJob = myJobs.find(j => j.status === 'timeout_action_required');

  const handleTimeoutAction = async (jobId, action) => {
    setLoading(true);
    try {
      await jobsApi.timeoutAction(jobId, { action });
      fetchJobs();
    } catch (e) {
      alert(t("Xato yuz berdi"));
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB] relative">
      {timeoutJob && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-3xl mb-4">
              ⏳
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">{t("Vaqt o'tdi!")}</h2>
            <p className="text-gray-600 text-[14px] leading-relaxed mb-6">
              <b>"{timeoutJob.title}"</b> {t("ishi uchun belgilangan muddat o'z nihoyasiga yetdi.")}
              {timeoutJob.applicants?.length > 0 ? (
                <span className="block mt-2 text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100">
                  {t("Hozircha")} <b>{timeoutJob.applicants.length}</b> {t("ta usta murojaat qildi.")}
                </span>
              ) : (
                <span className="block mt-2 text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  {t("Hozircha hech qaysi usta murojaat qilmadi.")}
                </span>
              )}
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              {timeoutJob.applicants?.length > 0 && (
                <button 
                  onClick={() => handleTimeoutAction(timeoutJob.id, 'accept_current')}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200"
                >
                  ✅ {t("Shu usta bilan boshlash")}
                </button>
              )}
              <button 
                onClick={() => handleTimeoutAction(timeoutJob.id, 'extend')}
                className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-200"
              >
                ➕ {t("Vaqtni 24 soatga uzaytirish")}
              </button>
              <button 
                onClick={() => handleTimeoutAction(timeoutJob.id, 'delete')}
                className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors border border-red-200"
              >
                🗑️ {t("Ishni o'chirish")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile header ── */}
      <div className="lg:hidden bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] px-5 pt-4 pb-6 rounded-b-[24px] shrink-0">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-white text-[20px] font-extrabold">
            {t("Mening ishlarim")}
          </h1>
          <div className="flex items-center gap-2">
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
            <button onClick={() => dispatch({ type: 'SHOW_MODAL', modal: { type: 'general', data: { icon: '🔔', title: t("Bildirishnomalar"), sub: t("Hozircha yangi bildirishnomalar yo'q") } } })} className="relative w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-white fill-none stroke-2 stroke-linecap-round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22C55E] rounded-full border border-[#1251C5]"></span>
            </button>
          </div>
        </div>
        <div className="text-[13px] text-white/80 mb-5">{t("Joylagan ishlaringiz holati")}</div>

        {/* Mobile Tabs */}
        <div className="flex bg-white/10 p-1 rounded-2xl gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === tab.id ? 'bg-white text-[#1251C5] shadow-lg' : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="text-[14px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop header ── */}
      <div className="hidden lg:flex items-center justify-between px-8 py-6 bg-white border-b border-[#E8EDF5] shrink-0">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-[24px] font-[900] text-[#1A202C]">{t("Mening ishlarim")}</h1>
            <p className="text-[14px] text-[#718096] mt-1">{t("Barcha e'lon qilgan ishlaringizni boshqaring")}</p>
          </div>
          <div className="flex bg-[#F4F7FB] p-1.5 rounded-2xl gap-2 border border-[#E8EDF5]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id ? 'bg-white text-[#1E6FD9] shadow-sm border border-[#E8EDF5]' : 'text-[#718096] hover:text-[#1A202C]'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
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
          <button 
            onClick={() => dispatch({ type: 'GO', screen: 'post-job' })}
            className="bg-[#1E6FD9] text-white px-6 py-3 rounded-2xl font-extrabold text-[14px] shadow-lg shadow-blue-100 hover:bg-[#1251C5] transition-all active:scale-95 flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[3] stroke-linecap-round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {t("Yangi ish e'lon qilish")}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 lg:p-8 no-scroll">
        {loading && myJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="w-12 h-12 border-4 border-[#1E6FD9] border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-[14px] font-bold">{t('Yuklanmoqda...')}</div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-[64px] mb-4 opacity-20">📭</div>
            <div className="text-[17px] font-bold text-[#1A202C] mb-2">{t("Hech narsa topilmadi")}</div>
            <div className="text-[13px] text-[#718096] max-w-[200px] leading-relaxed mb-6">
              {activeTab === 'open' ? t("Hozircha ochiq ishlaringiz yo'q") : 
               activeTab === 'active' ? t("Hali hech bir ish jarayonda emas") : 
               t("Tugatilgan ishlar mavjud emas")}
            </div>
            <button 
              onClick={() => dispatch({ type: 'GO', screen: 'post-job' })}
              className="bg-white border-2 border-[#1E6FD9] text-[#1E6FD9] px-6 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#F4F7FB] transition-all"
            >
              {t("Yangi ish qo'shish")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {filteredJobs.map((j) => (
              <div
                key={j.id}
                className="group bg-white rounded-[32px] p-6 border border-[#E8EDF5] shadow-[0_4px_20px_rgba(18,81,197,0.06)] hover:shadow-[0_15px_40px_rgba(18,81,197,0.12)] transition-all duration-500 relative flex flex-col"
              >
                {j.status === 'open' && (
                  <button 
                    onClick={() => editJob(j.id)}
                    className="absolute top-5 right-5 w-9 h-9 bg-[#F4F7FB] rounded-full flex items-center justify-center text-[#718096] hover:bg-[#1E6FD9] hover:text-white transition-all shadow-sm z-10"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                )}

                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[24px] shadow-sm shrink-0 bg-[#EBF3FF] text-[#1E6FD9]">
                      {getCat(j.category).icon}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          j.status === 'open' ? 'bg-[#EBF3FF] text-[#1E6FD9]' : 
                          j.status === 'done' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF3C7] text-[#D97706]'
                        }`}>
                          {t(j.status)}
                        </span>
                        {j.requiredWorkers > 1 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-[#F1F5F9] text-[#64748B]">
                            👥 {j.acceptedWorkersCount || 0}/{j.requiredWorkers}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[17px] font-[900] text-[#1A202C] leading-tight truncate">{j.title}</h3>
                    </div>
                  </div>
                </div>

                {j.status === 'finishing' && (
                  <div className="mb-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-3 flex items-center gap-3 animate-pulse">
                    <span className="text-[20px]">🎉</span>
                    <div className="flex-1">
                      <div className="text-[13px] font-extrabold text-[#15803D] leading-none mb-1">{t("Usta ishni topshirdi!")}</div>
                      <div className="text-[11px] text-[#16A34A] font-medium">{t("Ishni tekshiring va quyidagi yashil tugma orqali qabul qiling.")}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5 mb-5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#94A3B8] font-medium">{t('Ish haqi')}:</span>
                    <span className="text-[#16A34A] font-extrabold">{j.price === 0 ? t("Kelishiladi") : `${fmt(j.price)} so'm`}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#94A3B8] font-medium">{t('Manzil')}:</span>
                    <span className="text-[#475569] font-bold truncate max-w-[150px]">{j.address || t('Kiritilmagan')}</span>
                  </div>
                  {j.applicants && j.applicants.length > 0 ? (
                    <div className="flex items-start justify-between text-[13px] pt-2 border-t border-[#F1F5F9]">
                      <span className="text-[#94A3B8] font-medium mt-1">{t('Ustalar')}:</span>
                      <div className="flex flex-wrap items-center gap-1.5 justify-end max-w-[65%]">
                        {j.applicants.map((a, idx) => {
                          const w = a.worker;
                          if (!w || !w.name) return null;
                          return (
                            <div key={idx} className="flex items-center gap-1 bg-[#F8FAFC] px-2 py-1 rounded-lg border border-[#E8EDF5]">
                              <div className="w-4 h-4 rounded-full bg-[#1E6FD9] flex items-center justify-center text-[8px] text-white font-bold">{w.name[0]}</div>
                              <span className="text-[#1A202C] font-bold text-[11px] truncate max-w-[70px]">{w.name.split(' ')[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : j.worker && (
                    <div className="flex items-center justify-between text-[13px] pt-2 border-t border-[#F1F5F9]">
                      <span className="text-[#94A3B8] font-medium">{t('Usta')}:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#1E6FD9] flex items-center justify-center text-[9px] text-white font-bold">{j.worker.name[0]}</div>
                        <span className="text-[#1A202C] font-bold">{j.worker.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  {j.status === "open" && (
                    <div className="flex gap-2">
                      <button onClick={() => viewApps(j.id)} className="flex-1 bg-[#1E6FD9] text-white py-3 rounded-xl text-[13px] font-extrabold shadow-lg shadow-blue-100 hover:bg-[#1251C5] transition-all active:scale-95">
                        {j.requiredWorkers > 1 && j.applicants?.length > 0 
                          ? `${t("Ustalar")} (${j.applicants.length}/${j.requiredWorkers})` 
                          : `${t("Murojaatlar")} ${j.applicants?.length > 0 ? `(${j.applicants.length})` : ''}`}
                      </button>
                      <button onClick={() => del(j.id)} className="w-12 bg-[#FEE2E2] text-[#DC2626] rounded-xl flex items-center justify-center hover:bg-[#FECACA] transition-colors">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-2 stroke-linecap-round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  )}
                  
                  {(j.status === "active" || j.status === "finishing") && (
                    <div className="flex gap-2 mt-2">
                      {j.requiredWorkers > 1 ? (
                        <button onClick={() => viewApps(j.id)} className="flex-1 bg-[#F4F7FB] text-[#1E6FD9] py-3 rounded-xl text-[13px] font-bold hover:bg-[#EBF3FF] transition-all active:scale-95 border border-[#E8EDF5]">
                          👥 {t("Ustalar ro'yxati")}
                        </button>
                      ) : (
                        <div className="flex-1 flex gap-2">
                          <button onClick={() => openChat(j.id, j.worker?.id || j.workerId)} className="flex-1 bg-[#EBF3FF] text-[#1E6FD9] py-3 rounded-xl text-[13px] font-bold hover:bg-[#1E6FD9] hover:text-white transition-all active:scale-95">
                            💬 {t("Chat")}
                          </button>
                          {j.worker?.phone && (
                            <button onClick={() => window.open(`tel:${j.worker.phone}`)} className="flex-1 bg-[#F0FDF4] text-[#15803D] py-3 rounded-xl text-[13px] font-bold hover:bg-[#22C55E] hover:text-white transition-all active:scale-95 border border-[#DCFCE7]">
                              📞 {t("Tel")}
                            </button>
                          )}
                        </div>
                      )}
                      <button onClick={j.status === 'finishing' ? () => confirmDone(j) : () => rate(j.id)} className={`flex-[0.8] text-white py-3 rounded-xl text-[13px] font-extrabold shadow-lg transition-all active:scale-95 ${j.status === 'finishing' ? 'bg-[#22C55E] shadow-green-100 hover:bg-[#16A34A]' : 'bg-[#EAB308] shadow-yellow-100 hover:bg-[#CA8A04]'}`}>
                        {j.status === 'finishing' ? `✓ ${t('Qabul')}` : `⭐ ${t('Baho')}`}
                      </button>
                    </div>
                  )}
                  
                  {j.status === "done" && (
                    <button onClick={() => rate(j.id)} className="w-full bg-[#F4F7FB] text-[#718096] py-3 rounded-xl text-[13px] font-bold hover:bg-[#EBF3FF] transition-all">
                      ⭐ {t('Baholash')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-24 right-6 z-50">
        <button
          onClick={() => dispatch({ type: 'GO', screen: 'post-job' })}
          className="bg-[#1E6FD9] text-white px-6 py-4 rounded-full shadow-[0_8px_25px_rgba(30,111,217,0.4)] active:scale-95 transition-all flex items-center gap-2 border-2 border-white/20"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[3] stroke-linecap-round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span className="font-black text-[15px]">{t("Ish berish")}</span>
        </button>
      </div>
    </div>
  );
}
