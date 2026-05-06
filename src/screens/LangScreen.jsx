import { useState, useEffect } from 'react'
import { useApp } from '../context'

export default function LangScreen() {
  const { dispatch, state } = useApp()
  const [phase, setPhase] = useState('splash')

  useEffect(() => {
    function ease(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
    function animate(el,from,to,dur,delay,prop,unit,cb){
      if(!el) return;
      setTimeout(()=>{
        const start=performance.now();
        function frame(now){
          const p=Math.min((now-start)/dur,1);
          const v=from+(to-from)*ease(p);
          if(prop==='opacity')el.style.opacity=v;
          else if(prop==='translateY')el.style.transform=`translateY(${v}${unit})`;
          else if(prop==='scale')el.style.transform=`scale(${v}) rotate(${(1-p)*-15}deg)`;
          else if(prop==='width')el.style.width=v+unit;
          if(p<1)requestAnimationFrame(frame);
          else if(cb)cb();
        }
        requestAnimationFrame(frame);
      },delay);
    }

    if (phase === 'splash') {
      const iconBox=document.getElementById('iconBox');
      const dot=document.getElementById('dot');
      const tagline=document.getElementById('tagline');
      const prog=document.getElementById('prog');
      const splash=document.getElementById('splash');

      animate(iconBox,0,1,600,300,'opacity','',null);
      animate(iconBox,0.4,1,600,300,'scale','',()=>{animate(dot,0,1,300,0,'opacity','',null);});

      ['l0','l1','l2','l3','l4','l5'].forEach((id,i)=>{
        const el=document.getElementById(id);
        animate(el,0,1,400,600+i*80,'opacity','',null);
        animate(el,30,0,400,600+i*80,'translateY','px',null);
      });

      animate(tagline,0,1,500,1400,'opacity','',null);
      animate(tagline,10,0,500,1400,'translateY','px',null);

      animate(prog,0,100,1800,800,'width','%',()=>{
        setTimeout(()=>{
          if(splash) {
            splash.style.transition='opacity 0.5s';
            splash.style.opacity='0';
          }
          setTimeout(()=>{
            dispatch({ type: 'GO', screen: 'auth' })
          },500);
        },400);
      });
    }
  }, [phase, dispatch])

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full bg-[#f4f6f4]">
      <style>{`
        .splash{width:100%;height:100%;background:#0d1f17;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;position:absolute;top:0;left:0;z-index:50;}
        .bg-circle{position:absolute;border-radius:50%;background:rgba(29,158,117,0.06);}
        .bc1{width:400px;height:400px;top:50%;left:50%;transform:translate(-50%,-50%);}
        .bc2{width:600px;height:600px;top:50%;left:50%;transform:translate(-50%,-50%);}
        .logo-wrap{display:flex;align-items:center;gap:20px;margin-bottom:18px;}
        .icon-box{width:72px;height:72px;background:#1D9E75;border-radius:16px;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0.4) rotate(-15deg);position:relative;}
        .z-letter{position:relative;width:40px;height:40px;}
        .z-top{position:absolute;top:4px;left:4px;width:32px;height:8px;background:white;border-radius:3px;}
        .z-diag{position:absolute;top:0;left:0;width:40px;height:40px;}
        .z-bot{position:absolute;bottom:4px;left:4px;width:32px;height:8px;background:white;border-radius:3px;}
        .letters{display:flex;gap:2px;}
        .letter{font-family:Georgia,serif;font-size:52px;font-weight:700;color:white;opacity:0;transform:translateY(30px);display:inline-block;line-height:1;}
        .tagline{font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;letter-spacing:5px;color:#5DCAA5;opacity:0;transform:translateY(10px);text-align:center;padding:0 20px;}
        .dot{width:6px;height:6px;border-radius:50%;background:#9FE1CB;position:absolute;top:10px;right:10px;opacity:0;}
        .progress-bar{position:absolute;bottom:50px;width:80px;height:2px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;}
        .progress-fill{height:100%;width:0%;background:#1D9E75;border-radius:2px;}

        .home{width:100%;height:100%;background:#f4f6f4;display:flex;flex-direction:column;position:relative;}
        .home-nav{background:white;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid #e0e0e0;}
        .nav-logo{font-family:Georgia,serif;font-size:20px;font-weight:700;color:#0A2E20;}
        .nav-logo span{color:#1D9E75;}
        .lang-switch{display:flex;gap:4px;}
        .lang-btn{border:0.5px solid #ccc;background:white;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;color:#555;transition:all 0.2s;}
        .lang-btn.active{background:#1D9E75;color:white;border-color:#1D9E75;}
        .nav-btn{background:#1D9E75;color:white;border:none;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;font-weight:bold;}
        .home-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;}
        .hero-title{font-family:Georgia,serif;font-size:28px;font-weight:700;color:#0A2E20;text-align:center;opacity:0;transform:translateY(20px);}
        .hero-sub{font-size:14px;color:#666;text-align:center;opacity:0;transform:translateY(15px);}
        .search-bar{background:white;border:1.5px solid #1D9E75;border-radius:12px;padding:11px 18px;width:100%;max-width:400px;font-size:14px;color:#333;outline:none;opacity:0;transform:translateY(15px);}
        .cards{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;opacity:0;transform:translateY(15px);}
        .card{background:white;border-radius:12px;padding:14px 10px;text-align:center;width:100px;border:0.5px solid #e8e8e8;cursor:pointer;}
        .card-icon{width:36px;height:36px;background:#E1F5EE;border-radius:10px;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;}
        .card-icon svg{width:18px;height:18px;}
        .card-label{font-size:11px;color:#444;font-weight:500;line-height:1.3;}
      `}</style>

      {phase === 'splash' && (
        <div className="splash" id="splash">
          <div className="bg-circle bc1"></div>
          <div className="bg-circle bc2"></div>
          <div className="logo-wrap">
            <div className="icon-box" id="iconBox">
              <div className="z-letter">
                <div className="z-top"></div>
                <svg className="z-diag" viewBox="0 0 40 40"><polygon points="33,8 40,8 7,32 0,32" fill="white"/></svg>
                <div className="z-bot"></div>
              </div>
              <div className="dot" id="dot"></div>
            </div>
            <div className="letters">
              <span className="letter" id="l0">Z</span>
              <span className="letter" id="l1">E</span>
              <span className="letter" id="l2">N</span>
              <span className="letter" id="l3">T</span>
              <span className="letter" id="l4">R</span>
              <span className="letter" id="l5">O</span>
            </div>
          </div>
          <div className="tagline" id="tagline">USTA VA XIZMAT PLATFORMASI</div>
          <div className="progress-bar"><div className="progress-fill" id="prog"></div></div>
        </div>
      )}

    </div>
  )
}
