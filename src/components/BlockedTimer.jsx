import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { usersApi } from '../api';
import { useT } from '../i18n';

const BlockedTimer = ({ until }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const { dispatch } = useApp();
  const t = useT();

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(until).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        // Refresh profile to unblock
        usersApi.getMe().then(({ data }) => {
          dispatch({ type: 'LOGIN', user: data });
        });
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const display = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      setTimeLeft(display);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [until, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
      <span className="text-[9px] font-black uppercase tracking-[0.1em] opacity-80 mb-0.5">{t("Qolgan vaqt")}</span>
      <span className="text-[14px] font-black font-mono leading-none">{timeLeft}</span>
    </div>
  );
};

export default BlockedTimer;
