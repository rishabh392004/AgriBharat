'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState, useEffect } from 'react'
import {
  ArrowLeft, ImagePlus, Mic, MicOff, Send, Sparkles,
  Volume2, VolumeX, Copy, Check, Globe, AlertCircle,
  X, ChevronDown, Leaf, Zap, Bot, User, Bug, FlaskConical,
  Droplets, Sprout, Landmark, Search, ShieldAlert,
} from 'lucide-react'
import { replyToChat, sendChatMessage } from '@/services/chatbotService'
import { useI18n, Locale, localeLabels } from '@/lib/i18n'
import type { ChatMessage } from '@/types'

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function detectLangFromText(text: string, fallback: string): string {
  if (/[\u0900-\u097F]/.test(text)) {
    if (/\u0906\u0939\u0947|\u0928\u093E\u0939\u0940|\u0936\u0947\u0924\u0915\u0930\u0940|\u0915\u0930\u093E\u0935\u0947|\u0938\u093E\u0902\u0917\u093E|\u0906\u0939\u093E\u0924|\u0928\u093E\u0939\u0940\u0924|\u092E\u0930\u093E\u0920\u0940/.test(text)) return 'mr'
    return 'hi'
  }
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'
  return fallback
}

const BCP47: Record<Locale, string> = {
  en:'en-IN', hi:'hi-IN', mr:'mr-IN', gu:'gu-IN',
  bn:'bn-IN', ta:'ta-IN', te:'te-IN', pa:'pa-IN',
  kn:'kn-IN', ml:'ml-IN', as:'as-IN',
}

const TOPICS = [
  { id:'disease', Icon: Bug, en:'Disease Diagnosis', hi:'रोग पहचान', mr:'रोग ओळख', q:'What disease could affect my crop?' },
  { id:'fertilizer', Icon: FlaskConical, en:'NPK & Fertilizer', hi:'खाद व पोषण', mr:'खत व NPK', q:'What fertilizer and NPK dosage should I use?' },
  { id:'water', Icon: Droplets, en:'Irrigation Timing', hi:'सिंचाई समय', mr:'पाणी व फवारणी', q:'When should I water and spray my crop?' },
  { id:'organic', Icon: Sprout, en:'Organic Control', hi:'जैविक कीटनाशक', mr:'सेंद्रिय नियंत्रण', q:'How can I prevent crop disease with organic neem spray?' },
  { id:'schemes', Icon: Landmark, en:'Kisan Schemes', hi:'सरकारी योजना', mr:'शासकीय योजना', q:'Tell me about PM Kisan and nearby Krishi Kendra support.' },
]

const CSS = `
@keyframes typingBounce {
  0%,60%,100%{transform:translateY(0);opacity:0.4}
  30%{transform:translateY(-6px);opacity:1}
}
@keyframes bubbleIn {
  from{opacity:0;transform:translateY(10px) scale(0.97)}
  to{opacity:1;transform:translateY(0) scale(1)}
}
@keyframes slideDown {
  from{opacity:0;transform:translateY(-8px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes glowPulse {
  0%,100%{box-shadow:0 0 0 0 rgba(46,204,113,0.45)}
  50%{box-shadow:0 0 0 9px rgba(46,204,113,0)}
}
@keyframes listenAnim {
  0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(220,38,38,0.5)}
  50%{transform:scale(1.1);box-shadow:0 0 0 10px rgba(220,38,38,0)}
}
.cpw{display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:920px;min-height:480px;background:#fff;border:1.5px solid var(--line,#e5ede8);border-radius:24px;overflow:hidden;box-shadow:0 10px 50px rgba(43,122,77,0.1);animation:slideDown .3s ease both}
.cph{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:linear-gradient(135deg,#17412a,#0b2217);flex-shrink:0;gap:12px;flex-wrap:wrap}
.cave{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#27c163,#178040);display:grid;place-items:center;color:#fff;flex-shrink:0;animation:glowPulse 3s ease-in-out infinite}
.cma{flex:1;overflow-y:auto;padding:18px 16px 10px;display:flex;flex-direction:column;gap:14px;background:linear-gradient(180deg,#f3f9f5,#fff);scroll-behavior:smooth}
.cma::-webkit-scrollbar{width:4px}
.cma::-webkit-scrollbar-thumb{background:rgba(43,122,77,.2);border-radius:99px}
.mai{display:flex;align-items:flex-start;gap:10;animation:bubbleIn .28s cubic-bezier(.16,1,.3,1) both}
.mau{display:flex;align-items:flex-end;gap:10;flex-direction:row-reverse;animation:bubbleIn .22s cubic-bezier(.16,1,.3,1) both}
.bai{background:#fff;border:1px solid rgba(43,122,77,.13);border-radius:4px 18px 18px 18px;padding:12px 16px;box-shadow:0 2px 14px rgba(43,122,77,.07);max-width:76%}
.bau{background:linear-gradient(135deg,#1a7a40,#2ecc71);color:#fff;border-radius:18px 4px 18px 18px;padding:12px 16px;box-shadow:0 4px 18px rgba(30,122,65,.28);max-width:73%}
.ama{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#27c163,#178040);display:grid;place-items:center;color:#fff;font-size:13px;flex-shrink:0;margin-top:2px}
.ccw{padding:12px 16px 14px;background:#fff;border-top:1px solid rgba(43,122,77,.1);flex-shrink:0}
.cin{display:flex;align-items:flex-end;gap:8px;background:#f2f9f5;border:1.5px solid rgba(43,122,77,.18);border-radius:18px;padding:8px 10px;transition:border-color .15s,box-shadow .15s}
.cin:focus-within{border-color:rgba(43,122,77,.5);box-shadow:0 0 0 3px rgba(43,122,77,.08)}
.cta{flex:1;border:none;background:transparent;resize:none;font-size:14px;font-family:inherit;line-height:1.5;outline:none;color:var(--ink,#1a2e22);min-height:24px;max-height:120px;overflow-y:auto}
.cta::placeholder{color:#8aac98}
.ib{width:36px;height:36px;border-radius:50%;border:none;background:rgba(43,122,77,.09);color:#2b7a4d;display:grid;place-items:center;cursor:pointer;flex-shrink:0;transition:all .15s}
.ib:hover{background:rgba(43,122,77,.18);transform:scale(1.07)}
.sb{width:40px;height:40px;border-radius:50%;border:none;background:linear-gradient(135deg,#1a7a40,#27c163);color:#fff;display:grid;place-items:center;cursor:pointer;flex-shrink:0;box-shadow:0 4px 14px rgba(26,122,64,.32);transition:all .15s}
.sb:hover{transform:scale(1.09);box-shadow:0 6px 20px rgba(26,122,64,.42)}
.sb:disabled{opacity:.45;cursor:not-allowed;transform:none}
.tps{display:flex;gap:7px;overflow-x:auto;padding:0 16px;scrollbar-width:none}
.tps::-webkit-scrollbar{display:none}
.tp{border:1px solid rgba(43,122,77,.2);background:#eef8f2;border-radius:99px;padding:6px 13px;font-size:12px;font-weight:650;color:#1b5e35;white-space:nowrap;cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:all .15s;flex-shrink:0}
.tp:hover{background:#d9f2e5;border-color:rgba(43,122,77,.38);transform:translateY(-1px)}
.lp{border-radius:99px;padding:4px 11px;font-size:11.5px;font-weight:650;cursor:pointer;white-space:nowrap;transition:all .14s;border:1.5px solid transparent}
.sc{border:1px solid rgba(43,122,77,.26);background:#fff;border-radius:99px;padding:7px 15px;font-size:12px;font-weight:650;color:#1b5e35;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(43,122,77,.07);transition:all .15s;animation:bubbleIn .24s ease both;display:inline-flex;align-items:center;gap:5px}
.sc:hover{background:#eef8f2;transform:translateY(-1px)}
.mab{background:none;border:none;cursor:pointer;padding:3px 7px;border-radius:7px;font-size:11px;font-weight:650;display:inline-flex;align-items:center;gap:3px;color:#6b9e7a;transition:all .12s}
.mab:hover{background:rgba(43,122,77,.09);color:#1b5e35}
`

function RenderText({ text }: { text: string }) {
  return (
    <div style={{ lineHeight: 1.7, fontSize: 14 }}>
      {text.split('\n').map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g)
        return (
          <p key={li} style={{ margin: li === 0 ? 0 : '5px 0 0' }}>
            {parts.map((p, pi) =>
              p.startsWith('**') && p.endsWith('**')
                ? <strong key={pi}>{p.slice(2,-2)}</strong>
                : <span key={pi}>{p}</span>
            )}
          </p>
        )
      })}
    </div>
  )
}

function Dots() {
  return (
    <div style={{ display:'flex', gap:5, padding:'4px 2px' }}>
      {[0,1,2].map(i=>(
        <span key={i} style={{
          width:8, height:8, borderRadius:'50%',
          background:'linear-gradient(135deg,#2b7a4d,#4caf7d)',
          display:'inline-block',
          animation:'typingBounce 1.2s ease-in-out infinite',
          animationDelay:`${i*0.2}s`,
        }}/>
      ))}
    </div>
  )
}

function ChatInner() {
  const { t, locale, setLocale } = useI18n()
  const params = useSearchParams()
  const disease = params.get('disease') || undefined
  const confidence = params.get('confidence')
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const wasVoice = useRef(false)

  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [copiedId, setCopiedId] = useState<string|null>(null)
  const [speakingId, setSpeakingId] = useState<string|null>(null)
  const [online, setOnline] = useState(true)
  const [voiceOn, setVoiceOn] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [notice, setNotice] = useState<string|null>(null)
  const [langOpen, setLangOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('speechSynthesis' in window) {
      const upd = () => { const v = window.speechSynthesis.getVoices(); if (v?.length) setVoices(v) }
      upd(); window.speechSynthesis.onvoiceschanged = upd
    }
  }, [])

  useEffect(() => {
    fetch('/api/backend-status')
      .then(r=>r.json())
      .then(d=>setOnline(d?.nodeBackend?.status==='connected'||d?.chatbotAi?.status==='connected'))
      .catch(()=>setOnline(false))
  }, [])

  const greeting = () => {
    if (disease && confidence) {
      const m: Record<Locale,string> = {
        mr:`🌾 **पीक स्कॅन निदान:** **${disease}** (${confidence}% खात्री) आढळले.\n\nफवारणी, सेंद्रिय उपाय मराठीत सांगतो.`,
        hi:`🌾 **फसल स्कैन:** **${disease}** (${confidence}% सटीकता) मिला।\n\nदवा, खुराक और उपाय बताता हूँ।`,
        en:`🌾 **Crop Diagnostic Alert:** Possible **${disease}** detected (${confidence}% confidence).\n\nI'll guide you with spray dosages, organic remedies & weather-safe windows.`,
        gu:`🌾 **પાક સ્કેન:** **${disease}** (${confidence}%) મળ્યો.`,
        bn:`🌾 **পাক স্ক্যান:** **${disease}** (${confidence}%) পাওয়া গেছে।`,
        ta:`🌾 **பயிர் நோய்:** **${disease}** (${confidence}%) கண்டறியப்பட்டது.`,
        te:`🌾 **పంట నిదానం:** **${disease}** (${confidence}%) కనుగొనబడింది.`,
        pa:`🌾 **ਫ਼ਸਲ ਸਕੈਨ:** **${disease}** (${confidence}%) ਮਿਲੇ।`,
        kn:`🌾 **ಬೆಳೆ ಸ್ಕ್ಯಾನ್:** **${disease}** (${confidence}%) ಪತ್ತೆ.`,
        ml:`🌾 **വിള:** **${disease}** (${confidence}%) കണ്ടെത്തി.`,
        as:`🌾 **শস্য:** **${disease}** (${confidence}%) পোৱা গৈছে।`,
      }
      return m[locale]||m.en
    }
    const g: Record<Locale,string> = {
      mr:'🌾 **नमस्कार!** मी तुमचा **AI कृषी सल्लागार** आहे.\n\nरोग, फवारणी, खते, पाणी नियोजनाबद्दल मराठीत विचारा.',
      hi:'🌾 **नमस्ते किसान भाई!** मैं आपका **AI कृषि सलाहकार** हूँ।\n\nफसल रोग, दवा, खाद और मौसम के सवाल पूछें।',
      en:"🌾 **Welcome to Kisan Salahkar!**\n\nI'm your AI agronomy assistant. Ask about crop diseases, spray dosages, irrigation timing, or government schemes.",
      gu:'🌾 **નમસ્તે!** પાકના રોગ, ખાતર, સિંચાઈ વિશે ગુજરાતીમાં પૂછો.',
      bn:'🌾 **নমস্কার!** ফসলের রোগ ও সার সম্পর্কে বাংলায় জিজ্ঞাসা করুন।',
      ta:'🌾 **வணக்கம்!** பயிர் நோய்கள் பற்றி தமிழில் கேளுங்கள்.',
      te:'🌾 **నమస్కారం!** పంట తెగుళ్లు గురించి తెలుగులో అడగండి.',
      pa:'🌾 **ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ!** ਫ਼ਸਲ ਬਾਰੇ ਪੰਜਾਬੀ ਵਿੱਚ ਪੁੱਛੋ।',
      kn:'🌾 **ನಮಸ್ಕಾರ!** ಬೆಳೆ ರೋಗಗಳ ಬಗ್ಗೆ ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ.',
      ml:'🌾 **സ്വാഗതം!** വിള രോഗങ്ങൾ ചോദിക്കുക.',
      as:'🌾 **নমস্কাৰ!** শস্যৰ ৰোগ অসমীয়াত সোধক।',
    }
    return g[locale]||g.en
  }

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id:'hello', from:'ai', time:now(), text:greeting() }
  ])

  useEffect(() => {
    setMessages(prev => {
      if (!prev.some(m=>m.from==='user'))
        return [{ id:'hello', from:'ai', time:now(), text:greeting() }]
      return prev
    })
  }, [locale, disease, confidence])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, typing])

  const bestVoice = (loc: Locale, vlist: SpeechSynthesisVoice[]) => {
    if (!vlist?.length) return null
    const b = BCP47[loc]||'hi-IN', pfx = b.split('-')[0].toLowerCase()
    return (
      vlist.find(v=>v.lang.toLowerCase()===b.toLowerCase()) ||
      vlist.find(v=>v.lang.toLowerCase().startsWith(pfx)) ||
      ['india','hindi','heera','ravi','kalpana','google'].reduce<SpeechSynthesisVoice|null>((a,kw)=>
        a||vlist.find(v=>v.name.toLowerCase().includes(kw)||v.lang.toLowerCase().includes(kw))||null, null) ||
      vlist.find(v=>v.default)||vlist[0]
    )
  }

  const speak = (id: string, text: string, loc?: Locale) => {
    const tl = loc||locale
    if (!window.speechSynthesis) { setNotice('Speech synthesis not supported.'); return }
    setNotice(null)
    if (speakingId===id) { window.speechSynthesis.cancel(); setSpeakingId(null); return }
    window.speechSynthesis.cancel(); window.speechSynthesis.resume()
    const clean = text.replace(/[*#•_`~\[\]\(\)]/g,' ').replace(/https?:\/\/\S+/g,' ').replace(/\s+/g,' ').trim()
    if (!clean) return
    const utt = new SpeechSynthesisUtterance(clean)
    const vlist = voices.length>0?voices:window.speechSynthesis.getVoices()
    const bv = bestVoice(tl, vlist)
    if (bv) { utt.voice=bv; utt.lang=bv.lang } else { utt.lang=BCP47[tl]||'hi-IN' }
    utt.rate=0.92; utt.pitch=1
    utt.onstart=()=>setSpeakingId(id)
    utt.onend=()=>setSpeakingId(null)
    utt.onerror=e=>{ setSpeakingId(null); if(e.error!=='interrupted'&&e.error!=='canceled') console.warn(e) }
    setTimeout(()=>window.speechSynthesis.speak(utt), 50)
  }

  const send = async (text: string, image?: string) => {
    if (!text.trim()&&!image) return
    const ut = text||'📷 Crop Image Attached'
    setMessages(m=>[...m,{ id:crypto.randomUUID(), from:'user', text:ut, time:now(), image }])
    setInput(''); setSuggestions([]); setTyping(true)
    const dl = detectLangFromText(ut, locale)
    const hist = messages.map(m=>({ role:(m.from==='user'?'user':'model') as 'user'|'model', content:m.text }))
    try {
      const r = await sendChatMessage(ut, disease, dl, hist)
      setTyping(false)
      const mid = crypto.randomUUID()
      setMessages(m=>[...m,{ id:mid, from:'ai', text:r.text, time:now() }])
      if (r.suggestions?.length) setSuggestions(r.suggestions)
      const sl = (dl as any) in BCP47?(dl as Locale):locale
      if (voiceOn||wasVoice.current) { wasVoice.current=false; speak(mid,r.text,sl) }
    } catch {
      setTyping(false)
      const fb = replyToChat(ut, disease, dl)
      const mid = crypto.randomUUID()
      setMessages(m=>[...m,{ id:mid, from:'ai', text:fb.text, time:now() }])
      const sl = (dl as any) in BCP47?(dl as Locale):locale
      if (voiceOn||wasVoice.current) { wasVoice.current=false; speak(mid,fb.text,sl) }
    }
  }

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id); setTimeout(()=>setCopiedId(null),1800)
  }

  const startVoice = () => {
    const w=window as any, SR=w.SpeechRecognition||w.webkitSpeechRecognition
    if (!SR) { setNotice('Voice recognition works in Chrome or Edge.'); return }
    setNotice(null)
    if (listening) { w.__activeRecognition?.stop(); setListening(false); return }
    try {
      const r=new SR(); w.__activeRecognition=r
      r.continuous=false; r.interimResults=false
      r.lang=locale==='en'?'hi-IN':(BCP47[locale]||'hi-IN')
      setListening(true)
      r.onstart=()=>setListening(true); r.onend=()=>setListening(false)
      r.onerror=(ev:any)=>{
        setListening(false)
        if (ev.error==='not-allowed'||ev.error==='permission-denied') setNotice('⚠️ Mic blocked. Click 🔒 in browser address bar.')
        else if (ev.error==='no-speech') setNotice('No speech detected. Try again.')
        else if (ev.error==='network') setNotice('Speech recognition needs internet.')
      }
      r.onresult=(ev:any)=>{
        setListening(false)
        const t=ev.results?.[0]?.[0]?.transcript
        if (t) { wasVoice.current=true; send(t) }
      }
      r.start()
    } catch { setListening(false); setNotice('Could not start microphone.') }
  }

  const resize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height='auto'
    e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'
  }

  const qCount = messages.filter(m=>m.from==='user').length

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }} className="animate-fadeIn">

        {/* Back row */}
        <Link href="/farmer" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:'var(--forest,#1b5e35)', textDecoration:'none', padding:'6px 13px', background:'var(--card)', border:'1px solid var(--line)', borderRadius:99, alignSelf:'flex-start', transition:'all .15s' }}>
          <ArrowLeft size={13}/> Dashboard
        </Link>

        {/* Chat frame */}
        <div className="cpw">

          {/* Header */}
          <div className="cph">
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div className="cave"><Leaf size={20}/></div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <h1 style={{ margin:0, fontSize:15, fontWeight:800, color:'#fff' }}>Kisan Salahkar</h1>
                  <span style={{ fontSize:9.5, fontWeight:750, padding:'2px 8px', borderRadius:99, background:online?'rgba(46,204,113,.2)':'rgba(245,158,11,.2)', color:online?'#6ee7b7':'#fcd34d', border:`1px solid ${online?'rgba(46,204,113,.4)':'rgba(245,158,11,.4)'}`, display:'inline-flex', alignItems:'center', gap:4 }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:online?'#34d399':'#fbbf24', display:'inline-block' }}/>
                    {online?'AI Online':'Local Mode'}
                  </span>
                </div>
                <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,.55)' }}>Multilingual Agronomy AI · {localeLabels[locale]}</p>
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {/* Voice toggle */}
              <button type="button" onClick={()=>{ const n=!voiceOn; setVoiceOn(n); if(!n&&window.speechSynthesis){window.speechSynthesis.cancel();setSpeakingId(null)} }} style={{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:99, padding:'6px 12px', fontSize:11.5, fontWeight:750, border:voiceOn?'1.5px solid rgba(46,204,113,.7)':'1px solid rgba(255,255,255,.2)', background:voiceOn?'rgba(46,204,113,.18)':'rgba(255,255,255,.08)', color:voiceOn?'#6ee7b7':'rgba(255,255,255,.7)', cursor:'pointer', transition:'all .2s' }} title="Auto-speak replies">
                {voiceOn?<Volume2 size={13}/>:<VolumeX size={13}/>}
                {voiceOn?'Voice ON':'Voice OFF'}
              </button>

              {/* Lang picker */}
              <div style={{ position:'relative' }}>
                <button type="button" onClick={()=>setLangOpen(p=>!p)} style={{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:99, padding:'6px 12px', fontSize:11.5, fontWeight:750, border:'1px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.82)', cursor:'pointer' }}>
                  <Globe size={12}/>{localeLabels[locale]}<ChevronDown size={10} style={{ opacity:.7, transform:langOpen?'rotate(180deg)':'none', transition:'transform .2s' }}/>
                </button>
                {langOpen&&(
                  <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, zIndex:200, background:'#fff', border:'1px solid var(--line)', borderRadius:16, boxShadow:'0 8px 34px rgba(0,0,0,.14)', padding:10, display:'flex', flexWrap:'wrap', gap:5, width:240, animation:'slideDown .18s ease both' }}>
                    {(Object.keys(localeLabels) as Locale[]).map(loc=>(
                      <button key={loc} type="button" className="lp" onClick={()=>{setLocale(loc);setLangOpen(false)}} style={{ background:loc===locale?'#1a7a40':'#f2f9f5', color:loc===locale?'#fff':'#1b5e35', border:`1.5px solid ${loc===locale?'#1a7a40':'transparent'}`, fontWeight:loc===locale?750:550 }}>
                        {localeLabels[loc]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear */}
              <button type="button" onClick={()=>{setMessages([{id:'hello',from:'ai',time:now(),text:greeting()}]);setSuggestions([])}} style={{ display:'grid', placeItems:'center', width:30, height:30, borderRadius:'50%', border:'1px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.7)', cursor:'pointer', transition:'all .15s' }} title="Clear chat">
                <X size={13}/>
              </button>
            </div>
          </div>

          {/* Topic strip */}
          <div style={{ paddingTop:11, paddingBottom:9, background:'#f2f9f5', borderBottom:'1px solid rgba(43,122,77,.08)', flexShrink:0 }}>
            <div className="tps">
              {disease&&<>
                <button className="tp" onClick={()=>send(t('symptoms'))} style={{ background:'#fff0f0', borderColor:'rgba(220,38,38,.25)', color:'#991b1b', display:'inline-flex', alignItems:'center', gap:5 }}>
                  <Search size={13}/> {t('symptoms')}
                </button>
                <button className="tp" onClick={()=>send(t('precautions'))} style={{ background:'#fff7ed', borderColor:'rgba(245,158,11,.25)', color:'#92400e', display:'inline-flex', alignItems:'center', gap:5 }}>
                  <ShieldAlert size={13}/> {t('precautions')}
                </button>
              </>}
              {TOPICS.map(tp=>(
                <button key={tp.id} className="tp" onClick={()=>send(tp.q)} style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                  <tp.Icon size={14} style={{ color:'#1a7a40' }}/>
                  <span>{locale==='mr'?tp.mr:locale==='hi'?tp.hi:tp.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notice */}
          {notice&&(
            <div style={{ margin:'8px 16px 0', borderRadius:11, padding:'9px 13px', background:'#fef2f2', border:'1px solid #fca5a5', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, color:'#991b1b', fontSize:12, fontWeight:600, animation:'slideDown .2s ease both', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}><AlertCircle size={14}/><span>{notice}</span></div>
              <button type="button" onClick={()=>setNotice(null)} style={{ background:'none', border:0, cursor:'pointer', color:'#991b1b', fontWeight:800, fontSize:16, lineHeight:1, padding:'0 2px' }}>×</button>
            </div>
          )}

          {/* Listening banner */}
          {listening&&(
            <div style={{ margin:'8px 16px 0', borderRadius:13, padding:'9px 14px', background:'linear-gradient(135deg,#fff7ed,#fef3c7)', border:'1.5px solid #fbbf24', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexShrink:0, animation:'slideDown .2s ease both' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:33, height:33, borderRadius:'50%', background:'#dc2626', color:'#fff', display:'grid', placeItems:'center', animation:'listenAnim 1s ease-in-out infinite' }}><Mic size={16}/></div>
                <div>
                  <strong style={{ fontSize:12.5, color:'#92400e', display:'block' }}>{locale==='hi'?'बोलिए... सुन रहा हूँ':locale==='mr'?'बोला... ऐकत आहे':`Listening in ${localeLabels[locale]}...`}</strong>
                  <span style={{ fontSize:11, color:'#b45309' }}>Speak your farming question clearly</span>
                </div>
              </div>
              <button type="button" onClick={()=>{const w=window as any;w.__activeRecognition?.stop();setListening(false)}} style={{ background:'#fff', border:'1px solid #fbbf24', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:700, color:'#b45309', cursor:'pointer' }}>Cancel</button>
            </div>
          )}

          {/* Messages */}
          <div className="cma" role="log" aria-live="polite" aria-label="Agronomist consultation dialogue">
            {qCount>0&&(
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, fontSize:11, color:'#8aac98', fontWeight:600 }}>
                <Sparkles size={10}/><span>{qCount} question{qCount!==1?'s':''} this session</span>
              </div>
            )}

            {messages.map(msg=>{
              const ai=msg.from==='ai', sp=speakingId===msg.id
              return ai?(
                <div key={msg.id} className="mai">
                  <div className="ama"><Bot size={15} color="#fff"/></div>
                  <div className="bai" style={sp?{ border:'1.5px solid #10b981' }:undefined}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, paddingBottom:7, borderBottom:'1px solid #f0ece4' }}>
                      <span style={{ fontSize:10.5, fontWeight:750, color:'#1a7a40', display:'flex', alignItems:'center', gap:4 }}>
                        <Zap size={10} style={{ color:'#f59e0b' }}/>Kisan Salahkar · {localeLabels[locale]}
                      </span>
                      <div style={{ display:'flex', gap:2 }}>
                        <button type="button" className="mab" onClick={()=>speak(msg.id,msg.text)}>{sp?<><VolumeX size={12}/><span>Stop</span></>:<><Volume2 size={12}/><span>Listen</span></>}</button>
                        <button type="button" className="mab" onClick={()=>copyText(msg.id,msg.text)}>{copiedId===msg.id?<Check size={12} style={{color:'#1a7a40'}}/>:<Copy size={12}/>}</button>
                      </div>
                    </div>
                    {msg.image&&<img src={msg.image} alt="Crop" style={{ borderRadius:10, marginBottom:10, maxHeight:200, objectFit:'cover', width:'100%' }}/>}
                    <RenderText text={msg.text}/>
                    <small style={{ display:'block', textAlign:'right', marginTop:8, fontSize:10, color:'#8aac98' }}>{msg.time}</small>
                  </div>
                </div>
              ):(
                <div key={msg.id} className="mau">
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#1a7a40,#27c163)', display:'grid', placeItems:'center', color:'#fff', flexShrink:0 }}><User size={15} color="#fff"/></div>
                  <div className="bau">
                    {msg.image&&<img src={msg.image} alt="Crop" style={{ borderRadius:10, marginBottom:8, maxHeight:180, objectFit:'cover', width:'100%' }}/>}
                    <p style={{ margin:0, lineHeight:1.65, fontSize:14, whiteSpace:'pre-line' }}>{msg.text}</p>
                    <small style={{ display:'block', textAlign:'right', marginTop:6, fontSize:10, opacity:.75 }}>{msg.time}</small>
                  </div>
                </div>
              )
            })}

            {typing&&(
              <div className="mai" role="status" aria-live="polite">
                <div className="ama"><Bot size={15} color="#fff"/></div>
                <div className="bai">
                  <span className="sr-only">Agronomist consultant is thinking...</span>
                  <Dots/>
                </div>
              </div>
            )}

            {suggestions.length>0&&!typing&&(
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, paddingLeft:38 }}>
                {suggestions.map((s,i)=>(
                  <button key={i} className="sc" onClick={()=>send(s)} style={{ animationDelay:`${i*0.06}s` }}>💬 {s}</button>
                ))}
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Composer */}
          <div className="ccw">
            <form onSubmit={e=>{e.preventDefault();if(typing||!input.trim())return;send(input)}}>
              <div className="cin">
                <label htmlFor="crop-photo-input" className="sr-only">Attach crop leaf photo</label>
                <button type="button" className="ib" onClick={()=>fileRef.current?.click()} title="Attach crop photo" aria-label="Attach crop photo"><ImagePlus size={17}/></button>
                <input id="crop-photo-input" ref={fileRef} hidden type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(!f)return;send('📷 Please analyze this crop leaf photo.',URL.createObjectURL(f))}}/>
                <label htmlFor="chat-message-input" className="sr-only">Type agronomy question</label>
                <textarea id="chat-message-input" ref={inputRef} className="cta" value={input} onChange={resize} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(!typing&&input.trim())send(input)}}} placeholder={locale==='mr'?'मराठीत प्रश्न विचारा किंवा माइक दाबून बोला...':locale==='hi'?'हिन्दी में सवाल पूछें या माइक दबाकर बोलें...':`Ask in ${localeLabels[locale]} or press mic...`} rows={1}/>
                <button type="button" className="ib" onClick={startVoice} title={listening?'Stop voice input':'Speak query'} aria-label={listening?'Stop voice input':'Speak query'} style={listening?{background:'#fef2f2',color:'#dc2626',border:'1.5px solid rgba(220,38,38,.4)',animation:'listenAnim 1s ease-in-out infinite'}:undefined}>
                  {listening?<MicOff size={17}/>:<Mic size={17}/>}
                </button>
                <button
                  type="submit"
                  className="sb"
                  disabled={!input.trim() || typing}
                  aria-busy={typing}
                  aria-label={typing ? "Agronomist consultant is thinking..." : "Send consultation question"}
                  title={typing ? "Consultant is thinking..." : "Send question"}
                >
                  <Send size={15}/>
                </button>
              </div>
              <p style={{ margin:'8px 0 0', textAlign:'center', fontSize:10.5, color:'#8aac98', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                <Sparkles size={10}/>Kisan Salahkar · {localeLabels[locale]} ({BCP47[locale]}) · Enter to send · Shift+Enter for new line
              </p>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}

export default function ChatPage() {
  return <Suspense><ChatInner/></Suspense>
}