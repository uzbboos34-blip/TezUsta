import { useState, useEffect } from "react";
import { useApp } from "../../context";
import { DB, fmt } from "../../data";
import { useT } from "../../i18n";
import { jobsApi, usersApi, chatsApi } from "../../api";

export default function WorkerMyJobs() {
  const { state, dispatch } = useApp();
  const t = useT();
  const { user, myJobTab } = state;
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const allJobsMap = new Map();
  (user?.acceptedJobs || []).forEach(j => allJobsMap.set(j.id, j));
  (user?.applicants || []).forEach(a => {
    if (!allJobsMap.has(a.job.id)) {
      allJobsMap.set(a.job.id, a.job);
    }
  });

  let items = Array.from(allJobsMap.values());
  if (myJobTab === "active")
    items = items.filter((j) => {
      if (j.status === "open") return true;
      if (j.status === "active" || j.status === "finishing") return true;
      return false;
    });
  if (myJobTab === "done") items = items.filter((j) => j.status === "done");

  const fetchPostedJobs = async () => {
    setLoading(true);
    try {
      const { data } = await jobsApi.getAll(null, true);
      setPostedJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const { data } = await usersApi.getMe();
      dispatch({ type: "LOGIN", user: data });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMyProfile();
    const timer = setInterval(() => {
      fetchMyProfile();
      if (myJobTab === "posted") fetchPostedJobs();
    }, 3000); // Polling every 3 seconds for real-time updates
    return () => clearInterval(timer);
  }, [myJobTab]);

  const viewApps = (jobId) => {
    dispatch({ type: "SET_JOB", id: jobId });
    dispatch({ type: "GO", screen: "applicants" });
  };

  const editJob = (id) => {
    dispatch({ type: "SET_EDIT_JOB", id });
    dispatch({ type: "GO", screen: "post-job" });
  };

  const delJob = async (id) => {
    if (!confirm(t("O'chirishni xohlaysizmi?"))) return;
    try {
      await jobsApi.remove(id);
      fetchPostedJobs();
    } catch (e) {
      alert(t("Xato yuz berdi"));
    }
  };

  const openChat = async (jobId, clientId) => {
    try {
      const { data } = await chatsApi.create({ jobId: Number(jobId), userIds: [Number(user.id), Number(clientId)] });
      dispatch({ type: 'SET_CHATBACK', screen: 'worker-myjobs' })
      dispatch({ type: 'SET_CHAT', id: data.id })
      dispatch({ type: 'GO', screen: 'chat' })
    } catch (e) {
      alert(t('Xato yuz berdi'))
    }
  }

  const requestFinish = async (jobId, currentPrice) => {
    if (currentPrice === 0) {
      dispatch({
        type: "SHOW_MODAL",
        modal: {
          type: "price_input",
          data: { 
            jobId,
            onSuccess: () => fetchMyProfile()
          },
        },
      });
      return;
    }

    try {
      await jobsApi.requestFinish(jobId)
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
      fetchMyProfile()
    } catch (e) {
      alert(t("Xato yuz berdi"))
    }
  };

  const tabs = [
    { key: "all", label: t("Barchasi") },
    { key: "active", label: t("Faol") },
    { key: "done", label: t("Bajarilgan") },
    { key: "posted", label: t("Joylaganlarim") },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB]">
      {/* ── Mobile header ── */}
      <div className="lg:hidden bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] px-5 pt-4 pb-5 rounded-b-[24px] shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-white text-[20px] font-extrabold mb-1">
              {t("Mening ishlarim")}
            </h1>
            <div className="text-[13px] text-white/75">
              {t("Qabul qilgan va bajargan ishlaringiz")}
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop header ── */}
      <div className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b border-[#E8EDF5] shrink-0">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#1A202C]">
            {t("Mening ishlarim")}
          </h1>
          <p className="text-[13px] text-[#718096] mt-0.5">
            {t("Qabul qilgan va bajargan ishlaringiz")}
          </p>
        </div>
      </div>

      {/* ── Mobile tabs ── */}
      <div className="lg:hidden flex gap-2 px-5 py-3.5 shrink-0 overflow-x-auto no-scroll">
        {tabs.map(({ key, label }) => (
          <span
            key={key}
            onClick={() => dispatch({ type: "SET_MYTAB", tab: key })}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer border-[1.5px] transition-all whitespace-nowrap select-none ${
              myJobTab === key
                ? "bg-[#1E6FD9] text-white border-[#1E6FD9] shadow-md"
                : "bg-white border-[#E8EDF5] text-[#718096]"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* ── Desktop tabs ── */}
      <div className="hidden lg:flex gap-2 px-8 py-4 bg-white border-b border-[#F1F5F9] shrink-0">
        {tabs.map(({ key, label }) => (
          <span
            key={key}
            onClick={() => dispatch({ type: "SET_MYTAB", tab: key })}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer border-[1.5px] transition-all whitespace-nowrap select-none ${
              myJobTab === key
                ? "bg-[#1E6FD9] text-white border-[#1E6FD9] shadow-md"
                : "bg-white border-[#E8EDF5] text-[#718096]"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* ── Content grid ── */}
      <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4">
        {myJobTab === "posted" ? (
          loading ? (
            <div className="col-span-full text-center py-20 text-gray-400 font-bold">
              {t("Yuklanmoqda...")}
            </div>
          ) : postedJobs.length === 0 ? (
            <div className="col-span-full text-center py-12 px-5 text-[#A0AEC0]">
              <div className="text-[52px] mb-3">📋</div>
              <div className="text-[16px] font-bold text-[#718096] mb-1.5">
                {t("Hali ish joylamadingiz.")}
              </div>
              <div className="text-[13px] leading-relaxed">
                {t("Profil orqali ish joylashtirishingiz mumkin")}
              </div>
            </div>
          ) : (
            postedJobs.map((j) => (
              <div
                key={j.id}
                className="bg-white rounded-2xl p-4 border border-[#E8EDF5] shadow-[0_2px_12px_rgba(18,81,197,0.12)] lg:hover:shadow-lg lg:transition-shadow"
              >
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <div className="text-[15px] font-bold text-[#1A202C] mb-1">
                      {j.title}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          j.status === "open"
                            ? "bg-[#EBF3FF] text-[#1E6FD9]"
                            : j.status === "done"
                              ? "bg-[#DCFCE7] text-[#16A34A]"
                              : "bg-[#FEF3C7] text-[#D97706]"
                        }`}
                      >
                        {j.status === "open"
                          ? t("Ochiq")
                          : j.status === "done"
                            ? t("Bajarildi")
                            : j.status === "finishing"
                              ? t("Tasdiq kutilmoqda")
                              : t("Faol")}
                      </span>
                    </div>
                  </div>
                  <div className="text-[14px] font-extrabold text-[#16A34A]">
                    {j.price === 0 ? t("Kelishiladi") : `${fmt(j.price)} so'm`}
                  </div>
                </div>
                <div className="flex gap-2">
                  {j.status === "open" && (
                    <>
                      <button
                        onClick={() => viewApps(j.id)}
                        className="flex-1 bg-[#EBF3FF] text-[#1E6FD9] py-2 rounded-xl text-[13px] font-bold"
                      >
                        {t("Murojaatlar")} ({j.applicants?.length || 0})
                      </button>
                      <button
                        onClick={() => editJob(j.id)}
                        className="flex-[0.5] py-2 rounded-xl text-[13px] font-bold border border-[#E8EDF5] text-[#475569]"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => delJob(j.id)}
                        className="flex-[0.3] py-2 rounded-xl text-[13px] font-bold bg-[#FEE2E2] text-[#DC2626]"
                      >
                        ✕
                      </button>
                    </>
                  )}
                  {j.status !== "open" && (
                    <button
                      onClick={() => viewApps(j.id)}
                      className="flex-1 bg-[#F4F7FB] text-[#1A202C] py-2 rounded-xl text-[13px] font-bold"
                    >
                      {t("Batafsil")}
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-12 px-5 text-[#A0AEC0]">
            <div className="text-[52px] mb-3">📋</div>
            <div className="text-[16px] font-bold text-[#718096] mb-1.5">
              {t("Hali ish yo'q")}
            </div>
            <div className="text-[13px] leading-relaxed">
              {t("Biror ish qabul qiling")}
            </div>
          </div>
        ) : (
          items
            .map((i) => (
              <div
                key={i.id}
                className="bg-white rounded-[16px] p-3.5 border border-[#E8EDF5] shadow-[0_2px_12px_rgba(18,81,197,0.12)] lg:hover:shadow-lg lg:transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[15px] font-bold text-[#1A202C]">
                    {i.title}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      i.status === "done"
                        ? "bg-[#DCFCE7] text-[#16A34A]"
                        : i.status === "finishing"
                          ? "bg-[#EBF3FF] text-[#1E6FD9]"
                          : "bg-[#FEF9C3] text-[#B45309]"
                    }`}
                  >
                    {i.status === "done"
                      ? t("✓ Bajarildi")
                      : i.status === "finishing"
                        ? t("⏳ Tasdiq kutilmoqda")
                        : i.status === "open"
                          ? t("⏳ Kutilmoqda")
                          : t("⏳ Faol")}
                  </span>
                </div>
                <div className="flex gap-3 text-[12px] text-[#718096] font-medium mb-1">
                  <span>
                    💵{" "}
                    {i.price === 0 ? t("Kelishiladi") : `${fmt(i.price)} so'm`}
                  </span>
                  <span>📅 {i.date}</span>
                </div>
                {i.status === 'active' && new Date(i.updatedAt) < new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                  <div className="mb-2 px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-xl text-[11px] text-yellow-700 font-bold leading-relaxed">
                    🔔 {t("Ushbu ishni tugatdingizmi? 'Bajarildi' tugmasini bosishni unutmang!")}
                  </div>
                )}
                {(i.status === "active" || i.status === "finishing" || i.status === "open") && (
                  <div className="flex gap-2 mt-2.5">
                    <button
                      onClick={() => {
                        dispatch({ type: "SET_JOB", id: i.id });
                        dispatch({ type: "GO", screen: "job-detail" });
                      }}
                      className="flex-1 bg-[#EBF3FF] text-[#1E6FD9] px-3 py-2 rounded-[10px] text-[13px] font-semibold hover:bg-[#1E6FD9] hover:text-white transition-colors"
                    >
                      {t("Ko'rish")}
                    </button>
                    {i.status === "active" && (
                      <>
                        <button
                          onClick={() => openChat(i.id, i.clientId)}
                          className="flex-[0.7] bg-[#EBF3FF] text-[#1251C5] px-3 py-2 rounded-[10px] text-[12px] font-semibold hover:bg-[#1E6FD9] hover:text-white transition-colors"
                        >
                          💬 {t("Chat")}
                        </button>
                        <button
                          onClick={() => requestFinish(i.id, i.price)}
                          className="flex-1 bg-[#F4F7FB] text-[#1A202C] px-3 py-2 rounded-[10px] text-[13px] font-semibold hover:bg-[#E8EDF5]"
                        >
                          {t("✓ Bajarildi")}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
            .reverse()
        )}
      </div>
    </div>
  );
}
