import { useState, useEffect } from "react";
import { useApp } from "../../context";
import { getCatName, fmt, getActiveSkills } from "../../data";
import { REGIONS, getDistricts } from "../../regions";
import { useT } from "../../i18n";
import { jobsApi } from "../../api";

export default function WorkerHome() {
  const { state, dispatch } = useApp();
  const t = useT();
  const { user, filterCat, searchQ, categories } = state;
  const [filterRegion, setFilterRegion] = useState(user?.region || "");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const mySkills = categories.filter((c) =>
    (user?.skills || []).includes(c.id),
  );
  const cats = [
    { key: "all", label: t("Barchasi") },
    ...mySkills.map((s) => ({ key: s.id, label: `${s.icon} ${t(s.name)}` })),
  ];

  useEffect(() => {
    fetchJobs();
    const timer = setInterval(() => fetchJobs(true), 2000); // Faster polling (2s), silent update
    return () => clearInterval(timer);
  }, [filterCat, searchQ, filterRegion, filterDistrict]);

  const fetchJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await jobsApi.getAll({
        cat: filterCat === "all" ? undefined : filterCat,
        q: searchQ || undefined,
        region: filterRegion || undefined,
        district: filterDistrict || undefined,
      });
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const catColors = {
    santexnik: "bg-[#EBF3FF]",
    elektrik: "bg-[#FFF7ED]",
    kunlik: "bg-[#DCFCE7]",
    usta: "bg-[#EBF3FF]",
    quruvchi: "bg-[#DCFCE7]",
    gaz: "bg-[#FFF7ED]",
    konditsioner: "bg-[#F3E8FF]",
  };

  const isBlocked =
    user?.isBlocked &&
    user?.blockedUntil &&
    new Date(user.blockedUntil) > new Date();
  const remainingDays = isBlocked
    ? Math.ceil(
      (new Date(user.blockedUntil).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
    )
    : 0;

  return (
    <div className="flex-1 flex flex-col bg-[#F4F7FB]">
      {isBlocked && (
        <div className="bg-red-600 text-white px-4 py-2 text-[12px] font-bold text-center sticky top-0 z-50 shadow-md">
          🚩 {t("Siz vaqtincha bloklangansiz!")} {t("Blok tugashiga")}{" "}
          {remainingDays} {t("kun qoldi.")}
          <br />
          <span className="text-[11px] font-medium opacity-90">
            {t("Sabab")}: {user.blockReason}
          </span>
        </div>
      )}
      {/* ── Mobile header ── */}
      <div className="lg:hidden bg-gradient-to-br from-[#1251C5] to-[#1E6FD9] px-5 pt-4 pb-6 rounded-b-[24px] shrink-0">
        <div className="flex justify-between items-center">
          <div className="text-[22px] font-extrabold text-white">
            zen<span className="text-[#22C55E]">tro</span>
          </div>
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
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 stroke-white fill-none stroke-2 stroke-linecap-round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22C55E] rounded-full border border-[#1251C5]"></span>
            </button>
          </div>
        </div>
        <div className="text-[13px] text-white/85 mt-0.5">
          {t("Salom")}, {user?.name?.split(" ")[0]} 👋
        </div>

        <div onClick={() => dispatch({ type: 'GO', screen: 'lucky-wheel' })} className="mt-4 bg-white/20 rounded-2xl px-4 py-3 flex items-center justify-between border border-white/10 active:scale-95 transition-all cursor-pointer">
           <div className="flex items-center gap-2.5">
             <span className="text-[20px] animate-pulse">🪙</span>
             <span className="text-white text-[15px] font-black">{user?.coins || 0} <span className="text-white/60 font-bold ml-1 uppercase text-[11px] tracking-wider">{t("coin")}</span></span>
           </div>
           <span className="text-white/70 text-[12px] font-bold flex items-center gap-1">{t("G'ildirak")} <span className="text-[14px]">→</span></span>
        </div>

        <div className="flex gap-2 mt-3.5">
          <div className="flex-1 bg-white/20 rounded-xl flex items-center gap-2 px-3 border border-white/20">
            <svg
              viewBox="0 0 24 24"
              className="w-[17px] h-[17px] stroke-white/70 fill-none stroke-linecap-round shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={searchQ}
              onChange={(e) =>
                dispatch({ type: "SET_SEARCH", q: e.target.value })
              }
              placeholder={t("Ish qidiring...")}
              className="bg-transparent border-none outline-none text-white text-[14px] flex-1 py-2.5 placeholder-white/60"
            />
          </div>
          <button className="w-11 h-11 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="w-[19px] h-[19px] stroke-white fill-none stroke-linecap-round stroke-2"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-0 pt-3 pb-1 flex gap-2 shrink-0 w-full">
          <div className="flex-1 min-w-0">
            <select
              value={filterRegion}
              onChange={(e) => {
                setFilterRegion(e.target.value);
                setFilterDistrict("");
              }}
              className="w-full bg-white border border-[#E8EDF5] rounded-xl px-2.5 py-2 text-[12px] text-[#1A202C] outline-none shadow-sm truncate"
            >
              <option value="">{t("Barcha viloyatlar")}</option>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(r.name)}
                </option>
              ))}
            </select>
          </div>
          {filterRegion && (
            <div className="flex-1 min-w-0">
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full bg-white border border-[#E8EDF5] rounded-xl px-2.5 py-2 text-[12px] text-[#1A202C] outline-none shadow-sm truncate"
              >
                <option value="">{t("Barcha tumanlar")}</option>
                {getDistricts(filterRegion).map((d) => (
                  <option key={d} value={d}>
                    {t(d)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop header ── */}
      <div className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b border-[#E8EDF5] shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-[22px] font-extrabold text-[#1A202C]">
              {t("Ish topish")}
            </h1>
            <p className="text-[13px] text-[#718096] mt-0.5">
              {t("Salom")}, {user?.name?.split(" ")[0]} 👋 —{" "}
              {t("Kasbingizga mos ishlar")}
            </p>
          </div>
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
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F4F7FB] border border-[#E8EDF5] rounded-xl px-4 py-2.5 w-72">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 stroke-[#94A3B8] fill-none stroke-2 shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={searchQ}
              onChange={(e) =>
                dispatch({ type: "SET_SEARCH", q: e.target.value })
              }
              placeholder={t("Ish qidiring...")}
              className="bg-transparent outline-none text-[14px] text-[#1A202C] flex-1 placeholder-[#94A3B8]"
            />
          </div>
          <select
            value={filterRegion}
            onChange={(e) => {
              setFilterRegion(e.target.value);
              setFilterDistrict("");
            }}
            className="bg-white border border-[#E8EDF5] rounded-xl px-3 py-2.5 text-[13px] text-[#1A202C] outline-none"
          >
            <option value="">{t("Barcha viloyatlar")}</option>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {t(r.name)}
              </option>
            ))}
          </select>
          {filterRegion && (
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="bg-white border border-[#E8EDF5] rounded-xl px-3 py-2.5 text-[13px] text-[#1A202C] outline-none"
            >
              <option value="">{t("Barcha tumanlar")}</option>
              {getDistricts(filterRegion).map((d) => (
                <option key={d} value={d}>
                  {t(d)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Mobile category pills ── */}
      <div className="lg:hidden flex gap-2 overflow-x-auto px-5 pt-3.5 pb-1 no-scroll shrink-0">
        {cats.map((c) => {
          const on = filterCat === c.key;
          return (
            <span
              key={c.key}
              onClick={() => dispatch({ type: "SET_FILTER", cat: c.key })}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer border-[1.5px] transition-all whitespace-nowrap select-none ${on ? "bg-[#1E6FD9] text-white border-[#1E6FD9] shadow-md" : "bg-white border-[#E8EDF5] text-[#718096]"}`}
            >
              {c.label}
            </span>
          );
        })}
      </div>

      {/* ── Desktop category pills ── */}
      <div className="hidden lg:flex gap-2 px-8 py-3 bg-white border-b border-[#F1F5F9] shrink-0">
        {cats.map((c) => {
          const on = filterCat === c.key;
          return (
            <span
              key={c.key}
              onClick={() => dispatch({ type: "SET_FILTER", cat: c.key })}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer border-[1.5px] transition-all whitespace-nowrap select-none ${on ? "bg-[#1E6FD9] text-white border-[#1E6FD9] shadow-md" : "bg-white border-[#E8EDF5] text-[#718096]"}`}
            >
              {c.label}
            </span>
          );
        })}
      </div>

      {/* ── Content grid ── */}
      <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10 text-[#718096]">
            {t("Yuklanmoqda...")}
          </div>
        ) : jobs.length === 0 ? (
          <div className="col-span-full text-center py-12 px-5 text-[#A0AEC0]">
            <div className="text-[52px] mb-3">🔍</div>
            <div className="text-[16px] font-bold text-[#718096] mb-1.5">
              {t("Mos ish topilmadi")}
            </div>
            <div className="text-[13px] leading-relaxed">
              Kasbingizga mos ish yo'q. Profilda kasblarni yangilang yoki
              keyinroq tekshiring.
            </div>
          </div>
        ) : (
          jobs.map((j) => (
            <div
              key={j.id}
              onClick={() => {
                dispatch({ type: 'SET_JOB', id: j.id });
                dispatch({ type: 'GO', screen: 'job-detail' });
              }}
              className="bg-white rounded-2xl p-3.5 lg:p-4 border border-[#E8EDF5] shadow-[0_2px_12px_rgba(18,81,197,0.12)] cursor-pointer transition-all hover:-translate-y-1 hover:border-[#93C5FD] hover:shadow-[0_4px_24px_rgba(18,81,197,0.16)] lg:hover:shadow-lg lg:transition-shadow"
            >
              <div className="flex gap-3 items-start mb-2.5">
                <div
                  className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center text-[22px] shrink-0 ${catColors[j.cat] || "bg-[#EBF3FF]"}`}
                >
                  {j.icon}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] lg:text-[16px] font-bold text-[#1A202C] mb-0.5">
                    {j.title}
                  </div>
                  <div className="text-[12px] font-medium text-[#A0AEC0]">
                    {categories.find(c => c.id === j.cat)?.name || getCatName(j.cat)}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-[14px] font-extrabold text-[#16A34A]">
                  {j.price === 0 ? t("Kelishiladi") : `${fmt(j.price)} so'm`}
                </div>
                <div className="flex items-center gap-2">
                  {j.requiredWorkers > 1 && (
                    <span className="bg-[#FEF9C3] text-[#CA8A04] px-2.5 py-1 rounded-full text-[11px] font-bold">
                      👥 {j.acceptedWorkersCount || 0}/{j.requiredWorkers}
                    </span>
                  )}
                  <span className="bg-[#EBF3FF] text-[#1E6FD9] px-2.5 py-1 rounded-full text-[11px] font-bold">
                    {categories.find(c => c.id === j.cat)?.name || getCatName(j.cat)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3.5 items-center">
                <div className="flex items-center gap-1 text-[12px] text-[#718096]">
                  <svg
                    className="w-[13px] h-[13px] stroke-current fill-none stroke-linecap-round"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {j.date}
                </div>
                <div className="flex items-center gap-1 text-[12px] text-[#718096]">
                  <svg
                    className="w-[13px] h-[13px] stroke-current fill-none stroke-linecap-round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {j.dist || "---"}
                </div>
                <div className="flex items-center gap-1 text-[12px] font-semibold text-[#718096]">
                  <svg
                    className="w-[13px] h-[13px] fill-[#F59E0B]"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {j.clientRating || 0}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
