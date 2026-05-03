import { AppProvider, useApp } from "./context";
import Modal from "./components/Modal";
import WorkerNav from "./components/WorkerNav";
import ClientNav from "./components/ClientNav";
import { useT } from "./i18n";
import BlockedTimer from "./components/BlockedTimer";

import LangScreen from "./screens/LangScreen";
import RoleScreen from "./screens/RoleScreen";
import AuthScreen from "./screens/AuthScreen";
import WorkerHome from "./screens/worker/WorkerHome";
import JobDetail from "./screens/worker/JobDetail";
import WorkerMyJobs from "./screens/worker/WorkerMyJobs";
import WorkerProfile from "./screens/worker/WorkerProfile";
import TopUpScreen from "./screens/worker/TopUpScreen";
import TransactionHistory from "./screens/worker/TransactionHistory";
import LuckyWheel from "./screens/worker/LuckyWheel";
import ClientHome from "./screens/client/ClientHome";
import PostJob from "./screens/client/PostJob";
import Applicants from "./screens/client/Applicants";
import ClientProfile from "./screens/client/ClientProfile";
import ChatScreen from "./screens/ChatScreen";
import AdminScreen from "./screens/AdminScreen";
import SuperAdminScreen from "./screens/SuperAdminScreen";

const SCREENS = {
  lang: { comp: LangScreen, nav: null },
  role: { comp: RoleScreen, nav: null },
  auth: { comp: AuthScreen, nav: null },
  "worker-home": { comp: WorkerHome, nav: "worker" },
  "job-detail": { comp: JobDetail, nav: null },
  "worker-myjobs": { comp: WorkerMyJobs, nav: "worker" },
  "worker-profile": { comp: WorkerProfile, nav: "worker" },
  "top-up": { comp: TopUpScreen, nav: null },
  "transaction-history": { comp: TransactionHistory, nav: "worker" },
  "lucky-wheel": { comp: LuckyWheel, nav: "worker" },
  "client-home": { comp: ClientHome, nav: "client" },
  "post-job": { comp: PostJob, nav: null },
  applicants: { comp: Applicants, nav: null },
  "client-profile": { comp: ClientProfile, nav: "client" },
  chat: { comp: ChatScreen, nav: null },
  admin: { comp: AdminScreen, nav: null },
  superadmin: { comp: SuperAdminScreen, nav: null },
};

function Shell() {
  const { state, dispatch } = useApp();
  const t = useT();
  const entry = SCREENS[state.screen] || SCREENS["lang"];
  const Comp = entry.comp;
  const navType = entry.nav;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F7FB]">
      {/* Desktop sidebar — hidden on mobile */}
      {navType === "worker" && (
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 bg-white border-r border-[#E8EDF5]">
          <WorkerNav sidebar />
        </aside>
      )}
      {navType === "client" && (
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 bg-white border-r border-[#E8EDF5]">
          <ClientNav sidebar />
        </aside>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {state.user?.isBlocked && (
          <div className="bg-red-500 text-white px-5 py-3 flex items-center justify-between animate-in slide-in-from-top duration-300 shadow-lg relative z-[50]">
            <div className="flex items-center gap-3">
              <span className="text-[20px]">🚫</span>
              <div className="flex flex-col">
                <span className="text-[13px] font-black uppercase tracking-wider leading-none">{t("Siz bloklangansiz!")}</span>
                <span className="text-[11px] font-bold opacity-90 mt-1">{t("Sabab")}: {state.user.blockReason || t("Qoidabuzarlik")}</span>
              </div>
            </div>
            {state.user.blockedUntil && (
              <BlockedTimer until={state.user.blockedUntil} />
            )}
          </div>
        )}

        {/* Screen content */}
        <div
          key={state.screen}
          className="screen-enter flex-1 flex flex-col overflow-y-auto no-scroll min-h-0"
        >
          <Comp />
        </div>

        {/* Mobile bottom nav — hidden on desktop */}
        {navType === "worker" && <WorkerNav />}
        {navType === "client" && <ClientNav />}
      </div>

      <Modal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
