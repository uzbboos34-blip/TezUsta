import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { usersApi } from './api';

const AppCtx = createContext(null);

const initial = {
  screen: 'lang',       // current screen
  prevScreen: null,
  user: null,           // logged-in user object
  selectedRole: null,
  currentJobId: null,
  chatBack: 'worker-home',
  currentRating: 0,
  currentRatingJobId: null,
  filterCat: 'all',
  myJobTab: 'all',
  searchQ: '',
  modal: null,          // { type, data }
  editJobId: null,
  activeChatId: null,
  lang: localStorage.getItem('lang') || 'uz', // uz, kir, ru
  isAppReady: false,
  categories: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'GO': return { ...state, prevScreen: state.screen, screen: action.screen };
    case 'SET_ROLE': return { ...state, selectedRole: action.role };
    case 'LOGIN': return { ...state, user: action.user };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...initial, lang: state.lang, isAppReady: true };
    case 'SET_CATS': return { ...state, categories: action.cats };
    case 'SET_JOB': return { ...state, currentJobId: action.id };
    case 'SET_EDIT_JOB': return { ...state, editJobId: action.id };
    case 'SET_CHAT': return { ...state, activeChatId: action.id };
    case 'SET_FILTER': return { ...state, filterCat: action.cat };
    case 'SET_SEARCH': return { ...state, searchQ: action.q };
    case 'SET_MYTAB': return { ...state, myJobTab: action.tab };
    case 'SET_CHATBACK': return { ...state, chatBack: action.screen };
    case 'SET_RATING': return { ...state, currentRating: action.r };
    case 'SET_RATING_JOB': return { ...state, currentRatingJobId: action.id, currentRating: 0 };
    case 'SHOW_MODAL': return { ...state, modal: action.modal };
    case 'CLOSE_MODAL': return { ...state, modal: null };
    case 'SET_LANG':
      localStorage.setItem('lang', action.lang);
      return { ...state, lang: action.lang };
    case 'SET_READY': return { ...state, isAppReady: true };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [isWarmingUp, setIsWarmingUp] = useState(false);

  const fetchCats = async () => {
    try {
      const { data } = await usersApi.getCategories();
      dispatch({ type: 'SET_CATS', cats: data.filter(c => c.status === 'active') });
    } catch (e) { }
  };

  useEffect(() => {
    let catTimer;

    // Listen for graceful logout triggered by 401 interceptor
    const handleLogout = () => {
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'GO', screen: 'lang' });
    };
    window.addEventListener('app:logout', handleLogout);

    const init = async () => {
      // Detect slow server (cold start) — show warning after 3s
      const warmTimer = setTimeout(() => setIsWarmingUp(true), 3000);

      // Fetch categories for everyone (needed for registration)
      await fetchCats();
      clearTimeout(warmTimer);
      setIsWarmingUp(false);

      // Refresh categories every 5 minutes (not 30s)
      catTimer = setInterval(fetchCats, 5 * 60 * 1000);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await usersApi.getMe();
          dispatch({ type: 'LOGIN', user: data });

          // Navigate based on role if logged in
          if (data.role === 'worker') dispatch({ type: 'GO', screen: 'worker-home' });
          else if (data.role === 'client') dispatch({ type: 'GO', screen: 'client-home' });
          else if (data.role === 'admin') dispatch({ type: 'GO', screen: 'admin' });
          else if (data.role === 'superadmin') dispatch({ type: 'GO', screen: 'superadmin' });
        } catch (e) {
          localStorage.removeItem('token');
        }
      }
      dispatch({ type: 'SET_READY' });
    };
    init();
    return () => {
      catTimer && clearInterval(catTimer);
      window.removeEventListener('app:logout', handleLogout);
    };
  }, []);

  if (!state.isAppReady) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#0d1f17',
        gap: '16px'
      }}>
        <div style={{
          fontSize: '32px', fontWeight: 900, color: '#fff',
          letterSpacing: '-1px'
        }}>
          zen<span style={{ color: '#1D9E75' }}>tro</span>
        </div>
        <div style={{
          width: '48px', height: '4px', background: '#1a3a2a',
          borderRadius: '2px', overflow: 'hidden'
        }}>
          <div style={{
            width: '40%', height: '100%', background: '#1D9E75',
            borderRadius: '2px',
            animation: 'slideLoader 1.2s ease-in-out infinite alternate'
          }} />
        </div>
        {isWarmingUp && (
          <div style={{
            fontSize: '13px', color: '#4ade80', opacity: 0.75,
            textAlign: 'center', maxWidth: '200px', lineHeight: 1.5
          }}>
            Server uyg'onmoqda...<br />
            <span style={{ opacity: 0.6, fontSize: '11px' }}>Bir necha soniya kuting</span>
          </div>
        )}
        <style>{`
          @keyframes slideLoader {
            from { transform: translateX(0); }
            to { transform: translateX(72px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <AppCtx.Provider value={{ state, dispatch }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() { return useContext(AppCtx); }
