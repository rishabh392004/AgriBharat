'use client'

import { useEffect, useState } from 'react'

const CSS = `
@keyframes cottonFloat {
  0%   { transform: translateY(0px)   rotate(0deg)  scale(1); }
  30%  { transform: translateY(-20px) rotate(8deg)  scale(1.04); }
  60%  { transform: translateY(-8px)  rotate(-5deg) scale(0.97); }
  100% { transform: translateY(0px)   rotate(0deg)  scale(1); }
}
@keyframes cottonDrift {
  0%   { margin-left: 0px; }
  40%  { margin-left: 16px; }
  70%  { margin-left: -10px; }
  100% { margin-left: 0px; }
}
.cotton-wrap{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.cotton{
  position:absolute;
  border-radius:50%;
  background:radial-gradient(circle at 34% 28%, #45d96b, #1a7a3f 55%, #0e4826 100%);
  box-shadow:inset -5px -5px 12px rgba(0,0,0,.28),inset 3px 3px 8px rgba(255,255,255,.14),0 5px 20px rgba(0,0,0,.22);
  animation:cottonFloat var(--dur) ease-in-out infinite var(--delay),
            cottonDrift calc(var(--dur) * 1.4) ease-in-out infinite var(--delay);
  will-change:transform;
}
.cotton::before,.cotton::after{content:'';position:absolute;background:inherit;border-radius:50%;opacity:.65;}
.cotton::before{width:60%;height:60%;top:-22%;left:20%;background:radial-gradient(circle at 38% 28%,#52e87a,#1e8c47);}
.cotton::after{width:55%;height:55%;bottom:-18%;right:12%;background:radial-gradient(circle at 60% 42%,#2ed466,#165e34);}
`

export function CottonBg() {
  const [bolls, setBolls] = useState<{id:number;s:number;t:string;l:string;dur:string;delay:string;op:number}[]>([])

  useEffect(() => {
    setBolls(Array.from({length:22},(_,i)=>{
      const d=Math.random()
      return {
        id:i,
        s:Math.round(14+d*24+Math.random()*8),
        t:`${6+Math.random()*86}%`,
        l:`${2+Math.random()*95}%`,
        dur:`${7+Math.random()*8}s`,
        delay:`${-(Math.random()*10)}s`,
        op:0.1+d*0.2,
      }
    }))
  },[])

  if (!bolls.length) return null

  return (
    <>
      <style>{CSS}</style>
      <div className="cotton-wrap" aria-hidden="true">
        {bolls.map(b=>(
          <div key={b.id} className="cotton" style={{
            width:b.s, height:b.s, top:b.t, left:b.l, opacity:b.op,
            '--dur':b.dur,'--delay':b.delay,
          } as React.CSSProperties}/>
        ))}
      </div>
    </>
  )
}