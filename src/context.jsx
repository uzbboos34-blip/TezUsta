import { createContext, useContext, useReducer, useEffect } from 'react';
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
  lang: 'uz', // uz, kir, ru
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
      return { ...initial, isAppReady: true };
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
    case 'SET_LANG': return { ...state, lang: action.lang };
    case 'SET_READY': return { ...state, isAppReady: true };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const fetchCats = async () => {
    try {
      const { data } = await usersApi.getCategories();
      dispatch({ type: 'SET_CATS', cats: data.filter(c => c.status === 'active') });
    } catch (e) { }
  };

  useEffect(() => {
    let catTimer;
    const init = async () => {
      // Fetch categories for everyone (needed for registration)
      await fetchCats();
      catTimer = setInterval(fetchCats, 30000);

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
    return () => catTimer && clearInterval(catTimer);
  }, []);

  return (
    <AppCtx.Provider value={{ state, dispatch }}>
      {state.isAppReady ? children : <div className="flex-1 flex items-center justify-center bg-[#F4F7FB] text-[#1E6FD9] font-bold">TezUsta...</div>}
    </AppCtx.Provider>
  );
}

export function useApp() { return useContext(AppCtx); }
