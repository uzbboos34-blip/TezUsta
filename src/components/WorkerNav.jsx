import { useApp } from "../context";
import { useT } from "../i18n";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const ITEMS = [
  {
    id: "worker-home",
    labelKey: "Bosh sahifa",
    icon: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },
  {
    id: "worker-myjobs",
    labelKey: "Ishlarim",
    icon: (
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </>
    ),
  },
  {
    id: "transaction-history",
    labelKey: "To'lovlar",
    icon: (
      <>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
  },
  {
    id: "lucky-wheel",
    labelKey: "Omadli g'ildirak",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="2" x2="12" y2="12" />
        <line x1="12" y1="12" x2="19" y2="5" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
  },
  {
    id: "worker-profile",
    labelKey: "Profil",
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
];

// Items shown in mobile bottom nav (subset)
const MOBILE_ITEMS = ITEMS.filter((i) =>
  ["worker-home", "worker-myjobs", "worker-profile"].includes(i.id),
);

function SvgIcon({ paths, active }) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{
        width: 20,
        height: 20,
        fill: "none",
        stroke: active ? "#1E6FD9" : "#94A3B8",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        flexShrink: 0,
        transition: "stroke .15s",
      }}
    >
      {paths}
    </svg>
  );
}

export default function WorkerNav({ sidebar = false }) {
  const { state, dispatch } = useApp();
  const t = useT();
  const screen = state.screen;
  const user = state.user;
  const go = (id) => dispatch({ type: "GO", screen: id });

  /* ── DESKTOP SIDEBAR ── */
  if (sidebar) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            px: 2.5,
            py: 2.5,
            borderBottom: "1px solid #E8EDF5",
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
              color: "#1A202C",
              lineHeight: 1.1,
              fontFamily: "inherit",
            }}
          >
            zen<span style={{ color: "#22C55E" }}>tro</span>
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              color: "#A0AEC0",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mt: 0.5,
              fontFamily: "inherit",
            }}
          >
            {t("Ishchi panel")}
          </Typography>
        </Box>

        {/* Nav list */}
        <List
          disablePadding
          sx={{ flex: 1, px: 1.5, py: 2, overflowY: "auto" }}
        >
          {ITEMS.map((item) => {
            const active = screen === item.id;
            return (
              <ListItemButton
                key={item.id}
                onClick={() => go(item.id)}
                selected={active}
                sx={{
                  borderRadius: "12px",
                  mb: "2px",
                  px: 1.5,
                  py: 1,
                  "&.Mui-selected": {
                    bgcolor: "#EBF3FF",
                    "&:hover": { bgcolor: "#DBEAFE" },
                  },
                  "&:hover:not(.Mui-selected)": { bgcolor: "#F8FAFC" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <SvgIcon paths={item.icon} active={active} />
                </ListItemIcon>
                <ListItemText
                  primary={t(item.labelKey)}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                      color: active ? "#1E6FD9" : "#64748B",
                      fontFamily: "inherit",
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        {/* User chip */}
        <Divider />
        <ListItemButton
          onClick={() => go("worker-profile")}
          sx={{
            px: 2,
            py: 1.5,
            flexShrink: 0,
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 44 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "#6366F1",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                noWrap
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1A202C",
                  fontFamily: "inherit",
                }}
              >
                {user?.name ?? "—"}
              </Typography>
            }
            secondary={
              <Typography
                sx={{ fontSize: 11, color: "#A0AEC0", fontFamily: "inherit" }}
              >
                {t("Ishchi")}
              </Typography>
            }
          />
        </ListItemButton>
      </Box>
    );
  }

  /* ── MOBILE BOTTOM NAV ── */
  return (
    <div className="lg:hidden flex bg-white border-t border-[#E8EDF5] pt-[10px] pb-[18px] shrink-0 z-10 select-none">
      {MOBILE_ITEMS.map((item) => {
        const active = screen === item.id;
        return (
          <div
            key={item.id}
            onClick={() => go(item.id)}
            className="flex-1 flex flex-col items-center gap-1 cursor-pointer py-1 active:opacity-70 transition-opacity"
          >
            <svg
              viewBox="0 0 24 24"
              style={{
                width: 22,
                height: 22,
                fill: "none",
                stroke: active ? "#1E6FD9" : "#A0AEC0",
                strokeWidth: 2,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                transition: "stroke .15s",
              }}
            >
              {item.icon}
            </svg>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: active ? "#1E6FD9" : "#A0AEC0",
                transition: "color .15s",
              }}
            >
              {t(item.labelKey)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
