'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  CheckCircle2,
  Sprout,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { LanguageSelector } from '@/components/language-selector'
import { toast } from '@/components/toast'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { authService } from '@/services/authService'

const AUTH_STYLES = `
:root {
  --sky-top: #0e2a1f;
  --sky-mid: #3a5e2f;
  --sky-sun: #f6b93b;
  --gold: #e8b923;
  --gold-bright: #ffd166;
  --leaf: #4f8a4a;
  --leaf-dark: #1f3d24;
  --leaf-glow: #7fe08a;
  --card-glass: rgba(12, 26, 18, 0.72);
  --card-border: rgba(255, 255, 255, 0.16);
  --ink: #f6f4ec;
  --ink-dim: rgba(246, 244, 236, 0.72);
  --ink-faint: rgba(246, 244, 236, 0.45);
}

.kd-scene {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.kd-sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 55% at 50% 8%, rgba(255,209,102,0.35) 0%, rgba(255,209,102,0) 60%),
    linear-gradient(180deg, #12261c 0%, #2c4a28 32%, #4b6e34 58%, #7a8a3f 78%, #a68a3f 100%);
}
.kd-sun {
  position: absolute;
  top: 6%;
  left: 50%;
  width: 220px;
  height: 220px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(circle, #fff3d0 0%, #ffd166 35%, rgba(246,185,59,0.15) 70%, transparent 100%);
  filter: blur(1px);
  animation: kdSunPulse 8s ease-in-out infinite;
}
@keyframes kdSunPulse {
  0%, 100% { opacity: 0.85; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.06); }
}
.kd-haze {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(255,214,140,0.10) 55%, rgba(96,72,30,0.18) 100%);
}
.kd-hills {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 38%;
  height: 22%;
}
.kd-hill {
  position: absolute;
  bottom: 0;
  width: 60%;
  height: 100%;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  opacity: 0.55;
  filter: blur(0.5px);
}
.kd-hill.h1 { left: -10%; background: #2c4a2a; height: 70%; }
.kd-hill.h2 { left: 35%; background: #375a33; height: 100%; }
.kd-hill.h3 { left: 70%; background: #2c4a2a; height: 60%; }

.kd-treeline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 36%;
  height: 8%;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  opacity: 0.75;
}
.kd-tree {
  width: 26px;
  height: 100%;
  background: radial-gradient(ellipse at 50% 30%, #294f28, #16311c 80%);
  border-radius: 50% 50% 40% 40%;
}
.kd-tree:nth-child(odd) { height: 80%; }
.kd-tree:nth-child(3n) { height: 60%; }

.kd-ground {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 40%;
  background: linear-gradient(180deg, #6b7a34 0%, #4c5c26 45%, #33421a 100%);
}
.kd-furrows {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(100deg, rgba(0,0,0,0.10) 0 3px, transparent 3px 26px);
  opacity: 0.5;
}

.kd-field {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36%;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.kd-field.far { height: 30%; opacity: 0.85; filter: brightness(0.85) blur(0.3px); }
.kd-field.mid { height: 34%; }
.kd-field.near { height: 44%; }

.sugarcane-field { justify-content: flex-end; padding-right: 2%; }
.kd-cane {
  position: relative;
  width: 7px;
  margin: 0 3px;
  height: 88%;
  background: linear-gradient(180deg, #6fae4f 0%, #3f7a3a 60%, #2c5a2c 100%);
  border-radius: 4px 4px 0 0;
  transform-origin: bottom center;
  animation: kdSwayBig 4.5s ease-in-out infinite;
}
.kd-cane::after {
  content: '';
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 34px;
  background: linear-gradient(180deg, #8fce6a, transparent);
  border-radius: 2px;
}
.kd-cane::before {
  content: '';
  position: absolute;
  top: -14px;
  left: -9px;
  width: 18px;
  height: 26px;
  background: radial-gradient(ellipse at 50% 100%, #9fdc77 0%, rgba(159,220,119,0) 70%);
  border-radius: 50%;
  transform: rotate(-18deg);
}

.corn-field { justify-content: center; gap: 0; }
.kd-corn {
  position: relative;
  width: 10px;
  margin: 0 4px;
  height: 78%;
  background: linear-gradient(180deg, #7fbf4e 0%, #4f9139 65%, #2f5e29 100%);
  border-radius: 5px 5px 0 0;
  transform-origin: bottom center;
  animation: kdSwayMed 3.8s ease-in-out infinite;
}
.kd-corn .leaf {
  position: absolute;
  width: 26px;
  height: 8px;
  background: linear-gradient(90deg, #6fae4a, #3f7a34);
  border-radius: 0 60% 60% 0;
}
.kd-corn .leaf.l1 { top: 18%; left: 2px; transform: rotate(-28deg); }
.kd-corn .leaf.l2 { top: 34%; right: 2px; transform: rotate(28deg) scaleX(-1); }
.kd-corn .cob {
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 16px;
  background: linear-gradient(180deg, #f4d35e, #d9a832);
  border-radius: 3px;
}

.wheat-field { justify-content: flex-start; padding-left: 1%; }
.kd-wheat {
  position: relative;
  width: 4px;
  margin: 0 2.2px;
  height: 66%;
  background: linear-gradient(180deg, #e7c65a 0%, #e8b923 60%, #a97a1e 100%);
  border-radius: 3px;
  transform-origin: bottom center;
  animation: kdSwaySmall 2.6s ease-in-out infinite;
}
.kd-wheat::after {
  content: '';
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 9px;
  height: 20px;
  background: repeating-linear-gradient(180deg, #f6d97a 0 3px, #cf9f2e 3px 6px);
  border-radius: 40% 40% 20% 20%;
}

.cotton-field { justify-content: flex-end; padding-right: 1%; }
.kd-cotton {
  position: relative;
  width: 8px;
  margin: 0 10px;
  height: 52%;
  background: linear-gradient(180deg, #7aa14e, #4c7a34);
  border-radius: 4px 4px 0 0;
  transform-origin: bottom center;
  animation: kdSwayMed 4.2s ease-in-out infinite;
}
.kd-cotton .boll {
  position: absolute;
  width: 15px;
  height: 15px;
  background: radial-gradient(circle at 35% 30%, #ffffff, #f1ece0 55%, #d8d2c2 100%);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25), inset -2px -2px 4px rgba(0,0,0,0.08);
}
.kd-cotton .boll.b1 { top: -6px; left: -4px; }
.kd-cotton .boll.b2 { top: 8px; left: 6px; width: 12px; height: 12px; }
.kd-cotton .leafc {
  position: absolute;
  top: 2px;
  left: -6px;
  width: 14px;
  height: 10px;
  background: #3f6b30;
  border-radius: 0 70% 20% 70%;
  transform: rotate(-20deg);
}

@keyframes kdSwaySmall {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3.5deg); }
}
@keyframes kdSwayMed {
  0%, 100% { transform: rotate(-2.2deg); }
  50% { transform: rotate(2.6deg); }
}
@keyframes kdSwayBig {
  0%, 100% { transform: rotate(-1.6deg); }
  50% { transform: rotate(1.9deg); }
}

.kd-tractor-wrap {
  position: absolute;
  bottom: 10%;
  left: -14%;
  width: 70px;
  height: 40px;
  animation: kdDriveAcross 42s linear infinite;
  opacity: 0.9;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));
}
@keyframes kdDriveAcross {
  0% { left: -14%; }
  100% { left: 112%; }
}
.kd-farmer {
  position: absolute;
  bottom: 16%;
  right: 12%;
  width: 10px;
  height: 28px;
  opacity: 0.85;
}
.kd-farmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2a2016;
}
.kd-farmer::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 0;
  width: 10px;
  height: 20px;
  background: #3d3a2f;
  border-radius: 3px 3px 0 0;
}

.kd-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.kd-mote {
  position: absolute;
  bottom: 0;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff3c8, rgba(255,243,200,0));
  opacity: 0;
  animation-name: kdFloatUp;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes kdFloatUp {
  0% { transform: translate(0, 0); opacity: 0; }
  8% { opacity: 0.8; }
  100% { transform: translate(var(--drift, 20px), -70vh); opacity: 0; }
}

.kd-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 55% 62% at 50% 52%, rgba(6,14,9,0.62) 0%, rgba(6,14,9,0.28) 45%, rgba(6,14,9,0) 72%);
  pointer-events: none;
}
.kd-vignette-edges {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 160px 60px rgba(4,10,6,0.55);
  pointer-events: none;
}

.kd-bg-copy {
  position: fixed;
  left: 5%;
  top: 50%;
  transform: translateY(-50%);
  max-width: 320px;
  z-index: 5;
  display: none;
  pointer-events: none;
}
.kd-bg-copy .line1 {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 2rem;
  line-height: 1.25;
  color: #f6f4ec;
  text-shadow: 0 2px 14px rgba(0,0,0,0.5);
}
.kd-bg-copy .line2 {
  margin-top: 10px;
  font-size: 1rem;
  color: rgba(246,244,236,0.8);
  font-weight: 500;
  line-height: 1.4;
}
@media (min-width: 1240px) {
  .kd-bg-copy { display: block; }
}

.kd-stage {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 14px;
}
.kd-card {
  width: 100%;
  max-width: 410px;
  background: rgba(12, 26, 18, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 20px;
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  box-shadow: 0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
  padding: 22px 24px 18px;
  position: relative;
  overflow: hidden;
  color: #f6f4ec;
}
.kd-card::before {
  content: '';
  position: absolute;
  top: -40%;
  left: -20%;
  width: 70%;
  height: 70%;
  background: radial-gradient(circle, rgba(127,224,138,0.18), transparent 70%);
  pointer-events: none;
}

.kd-brand-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 12px;
  position: relative;
}
.kd-logo {
  width: 40px;
  height: 40px;
  margin-bottom: 6px;
  filter: drop-shadow(0 0 12px rgba(127,224,138,0.45));
}
.kd-kicker {
  font-size: 0.72rem;
  color: rgba(246,244,236,0.55);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.kd-brand-name {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 1.65rem;
  line-height: 1.15;
  margin-top: 1px;
  background: linear-gradient(180deg, #ffffff 0%, #d9edd0 60%, #a9d79a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.kd-subtitle {
  margin-top: 3px;
  font-size: 0.8rem;
  color: rgba(246,244,236,0.7);
  font-weight: 500;
}

.kd-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 12px;
  position: relative;
}
.kd-tab-indicator {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(50% - 3px);
  height: calc(100% - 6px);
  background: linear-gradient(180deg, #3f7a3a, #2c5a2c);
  border-radius: 8px;
  transition: transform 0.32s cubic-bezier(0.65, 0, 0.35, 1);
  box-shadow: 0 3px 10px rgba(47, 110, 45, 0.4);
}
.kd-tab-btn {
  flex: 1;
  position: relative;
  z-index: 1;
  background: none;
  border: none;
  padding: 7px 0;
  font-size: 0.86rem;
  font-weight: 700;
  color: rgba(246, 244, 236, 0.65);
  transition: color 0.3s;
  border-radius: 8px;
  cursor: pointer;
}
.kd-tab-btn.active {
  color: #ffffff;
}

.kd-role-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  padding: 3px;
  margin-bottom: 11px;
}
.kd-role-btn {
  border: none;
  border-radius: 7px;
  padding: 6px 8px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s;
  color: rgba(246,244,236,0.6);
  background: transparent;
}
.kd-role-btn.active-farmer {
  background: #2b7a4d;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(43, 122, 77, 0.4);
}
.kd-role-btn.active-officer {
  background: #1a4d2e;
  color: #ffd166;
  box-shadow: 0 2px 8px rgba(26, 77, 46, 0.4);
}

.kd-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.kd-field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kd-field-group label {
  font-size: 0.74rem;
  font-weight: 600;
  color: rgba(246, 244, 236, 0.75);
}
.kd-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.kd-input-wrap input {
  width: 100%;
  padding: 8px 11px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 9px;
  color: #f6f4ec;
  font-size: 0.86rem;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
}
.kd-input-wrap input::placeholder {
  color: rgba(246, 244, 236, 0.35);
}
.kd-input-wrap input:focus {
  outline: none;
  border-color: #7fe08a;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 2px rgba(127, 224, 138, 0.18);
}
.kd-input-icon {
  position: absolute;
  right: 10px;
  color: rgba(246, 244, 236, 0.45);
  pointer-events: none;
}
.kd-input-icon-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: rgba(246, 244, 236, 0.55);
  cursor: pointer;
  padding: 3px;
  display: grid;
  place-items: center;
}
.kd-input-prefix {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0 6px;
  margin-right: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(246, 244, 236, 0.7);
  border-right: 1px solid rgba(255, 255, 255, 0.15);
}

.kd-row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.76rem;
  margin-top: -2px;
}
.kd-remember {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(246, 244, 236, 0.7);
  cursor: pointer;
}
.kd-remember input {
  accent-color: #4f8a4a;
  width: 13px;
  height: 13px;
}
.kd-link-btn {
  background: none;
  border: none;
  color: #7fe08a;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
}
.kd-link-btn:hover {
  text-decoration: underline;
}

.kd-btn-primary {
  margin-top: 2px;
  padding: 9px 0;
  border: none;
  border-radius: 9px;
  background: linear-gradient(180deg, #5aa84f, #2e6b2b);
  color: #fff;
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.01em;
  box-shadow: 0 8px 18px rgba(46, 107, 43, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}
.kd-btn-primary:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(46, 107, 43, 0.5);
}
.kd-btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
.kd-btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.kd-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 1px;
  color: rgba(246, 244, 236, 0.4);
  font-size: 0.72rem;
}
.kd-divider::before, .kd-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
}

.kd-demo-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 5px;
}
.kd-demo-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 6px 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #f6f4ec;
}
.kd-demo-card:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: #7fe08a;
  transform: translateY(-1px);
}
.kd-demo-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #7fe08a;
}
.kd-demo-sub {
  font-size: 0.67rem;
  color: rgba(246, 244, 236, 0.6);
  margin-top: 1px;
}

.kd-switch-hint {
  text-align: center;
  margin-top: 12px;
  font-size: 0.78rem;
  color: rgba(246, 244, 236, 0.55);
}
.kd-switch-hint button {
  background: none;
  border: none;
  color: #7fe08a;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
}
.kd-switch-hint button:hover {
  text-decoration: underline;
}

.kd-mobile-tagline {
  display: none;
  text-align: center;
  margin-top: 10px;
  color: rgba(246, 244, 236, 0.5);
  font-size: 0.72rem;
  line-height: 1.3;
}
@media (max-width: 1239px) {
  .kd-mobile-tagline { display: block; }
}

.kd-success-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: grid;
  place-items: center;
  background: rgba(10, 24, 16, 0.8);
  backdrop-filter: blur(12px);
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`

interface Props {
  initialTab?: 'signin' | 'signup'
}

export function KrishiDarpanAuth({ initialTab = 'signin' }: Props) {
  const { t } = useI18n()
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab)
  const [activeRole, setActiveRole] = useState<'farmer' | 'officer'>('farmer')

  // Signin fields
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Signup fields
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regFarmName, setRegFarmName] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPassword2, setRegPassword2] = useState('')
  const [showRegPass, setShowRegPass] = useState(false)
  const [regError, setRegError] = useState('')

  const [busy, setBusy] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  // Sync tab and role with URL query parameter or initialTab prop
  useEffect(() => {
    const tabParam = searchParams?.get('tab')
    if (tabParam === 'signup') {
      setActiveTab('signup')
    } else if (tabParam === 'signin' || tabParam === 'login') {
      setActiveTab('signin')
    } else {
      setActiveTab(initialTab)
    }

    const roleParam = searchParams?.get('role')
    if (roleParam === 'officer') {
      setActiveRole('officer')
    } else if (roleParam === 'farmer') {
      setActiveRole('farmer')
    }
  }, [searchParams, initialTab])

  // Mouse Parallax Effect for Scene
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(min-width: 900px)').matches) return

    const scene = document.getElementById('kd-scene')
    if (!scene) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12
      const y = (e.clientY / window.innerHeight - 0.5) * 8
      scene.style.transform = `translate(${x}px, ${y}px) scale(1.02)`
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleRoleSwitch = (role: 'farmer' | 'officer') => {
    setActiveRole(role)
    setLoginError('')
  }

  const completeAuth = async (user: SessionUser, targetRoleOverride?: 'farmer' | 'officer') => {
    // If logging in from Officer Desk or role is officer, guarantee role: 'officer' and route to /officer
    const finalRole: 'farmer' | 'officer' =
      targetRoleOverride || (activeRole === 'officer' || user.role === 'officer' ? 'officer' : 'farmer')
    const finalUser: SessionUser = {
      ...user,
      role: finalRole,
    }

    setSignedIn(true)
    signIn(finalUser)
    await new Promise((r) => setTimeout(r, 600))
    router.replace(finalRole === 'officer' ? '/officer' : '/farmer')
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!loginPhone.trim()) {
      const msg =
        activeRole === 'officer'
          ? 'Please enter your Officer ID, mobile number, or email'
          : 'Please enter your mobile number or email'
      setLoginError(msg)
      toast(msg)
      document.getElementById('login-phone')?.focus()
      return
    }
    if (!loginPassword) {
      const msg = 'Please enter your password'
      setLoginError(msg)
      toast(msg)
      document.getElementById('login-password')?.focus()
      return
    }
    setBusy(true)
    try {
      const user = await authService.login(loginPhone.trim(), loginPassword, activeRole)
      await completeAuth(user, activeRole)
    } catch {
      setLoginError('Authentication failed. Please check your credentials or try Demo Access.')
      toast('Sign in failed. You can explore using Demo Access below.')
    } finally {
      setBusy(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    const cleanPhone = regPhone.trim()
    if (!cleanPhone || cleanPhone.length < 10) {
      const msg = 'Please enter a valid 10-digit mobile number'
      setRegError(msg)
      toast(msg)
      document.getElementById('signup-phone')?.focus()
      return
    }
    if (!regPassword || regPassword.length < 8) {
      const msg = 'Use at least 8 characters with a mix of letters and numbers.'
      setRegError(msg)
      toast(msg)
      document.getElementById('signup-password')?.focus()
      return
    }
    if (regPassword !== regPassword2) {
      const msg = 'Passwords do not match'
      setRegError(msg)
      toast(msg)
      document.getElementById('signup-password-confirm')?.focus()
      return
    }
    setBusy(true)
    try {
      const cleanName = regName.trim() || (activeRole === 'officer' ? 'Extension Officer' : 'Kisan User')
      const firstName = cleanName.split(/\s+/)[0] || cleanName
      const resolvedFarmName = regFarmName.trim() || `${firstName}'s Farm`

      const user = await authService.register(
        cleanName,
        cleanPhone,
        regPassword,
        resolvedFarmName,
        activeRole
      )
      toast(`Welcome, ${user.name}! Account created.`)
      await completeAuth(user, activeRole)
    } catch {
      setRegError('Registration could not be completed. Please try again.')
      toast('Registration failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', position: 'relative', background: '#0e2a1f', overflow: 'hidden' }}>
      <style>{AUTH_STYLES}</style>

      {/* Natural Farm Scene Background */}
      <div className="kd-scene" id="kd-scene">
        <div className="kd-sky" />
        <div className="kd-sun" />
        <div className="kd-haze" />

        <div className="kd-hills">
          <div className="kd-hill h1" />
          <div className="kd-hill h2" />
          <div className="kd-hill h3" />
        </div>

        {/* Tree Line */}
        <div className="kd-treeline">
          {Array.from({ length: 22 }).map((_, i) => (
            <div key={i} className="kd-tree" />
          ))}
        </div>

        {/* Farmland Furrows */}
        <div className="kd-ground">
          <div className="kd-furrows" />
        </div>

        {/* Sugarcane field (far) */}
        <div className="kd-field far sugarcane-field">
          {Array.from({ length: 36 }).map((_, i) => {
            const delay = ((i * 0.12) % 4).toFixed(2)
            const h = 76 + ((i * 7) % 18)
            return (
              <div
                key={i}
                className="kd-cane"
                style={{ height: `${h}%`, animationDelay: `${delay}s` }}
              />
            )
          })}
        </div>

        {/* Corn field (mid) */}
        <div className="kd-field mid corn-field">
          {Array.from({ length: 26 }).map((_, i) => {
            const delay = ((i * 0.15) % 3.8).toFixed(2)
            const h = 66 + ((i * 5) % 18)
            return (
              <div
                key={i}
                className="kd-corn"
                style={{ height: `${h}%`, animationDelay: `${delay}s` }}
              >
                <div className="leaf l1" />
                <div className="leaf l2" />
                <div className="cob" />
              </div>
            )
          })}
        </div>

        {/* Distant Farmer & Tractor */}
        <div className="kd-farmer" />
        <div className="kd-tractor-wrap">
          <svg className="kd-tractor" viewBox="0 0 70 40" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <rect x="6" y="14" width="26" height="12" rx="2" fill="#2f6b2b" />
            <rect x="26" y="4" width="16" height="16" rx="2" fill="#3d8a37" />
            <rect x="30" y="6" width="9" height="7" rx="1" fill="#bfe6c2" />
            <rect x="0" y="18" width="10" height="6" rx="1" fill="#1f4a1f" />
            <circle cx="14" cy="30" r="9" fill="#1a1a1a" />
            <circle cx="14" cy="30" r="3.4" fill="#7a7a7a" />
            <circle cx="40" cy="32" r="6" fill="#1a1a1a" />
            <circle cx="40" cy="32" r="2.2" fill="#7a7a7a" />
          </svg>
        </div>

        {/* Wheat Field (front left) */}
        <div className="kd-field near wheat-field">
          {Array.from({ length: 80 }).map((_, i) => {
            const delay = ((i * 0.08) % 2.6).toFixed(2)
            const h = 55 + ((i * 9) % 22)
            return (
              <div
                key={i}
                className="kd-wheat"
                style={{ height: `${h}%`, animationDelay: `${delay}s` }}
              />
            )
          })}
        </div>

        {/* Cotton Field (front right) */}
        <div className="kd-field near cotton-field">
          {Array.from({ length: 22 }).map((_, i) => {
            const delay = ((i * 0.18) % 3.5).toFixed(2)
            const h = 42 + ((i * 6) % 18)
            return (
              <div
                key={i}
                className="kd-cotton"
                style={{ height: `${h}%`, animationDelay: `${delay}s` }}
              >
                <div className="leafc" />
                <div className="boll b1" />
                <div className="boll b2" />
              </div>
            )
          })}
        </div>

        {/* Ambient floating dust particles */}
        <div className="kd-particles">
          {Array.from({ length: 24 }).map((_, i) => {
            const left = ((i * 4.1 + 7) % 96).toFixed(1)
            const dur = (11 + ((i * 3) % 12)).toFixed(1)
            const delay = ((i * 1.7) % 10).toFixed(1)
            const drift = `${((i % 2 === 0 ? 1 : -1) * (15 + (i * 3) % 35))}px`
            return (
              <div
                key={i}
                className="kd-mote"
                style={{
                  left: `${left}%`,
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                  ['--drift' as string]: drift,
                }}
              />
            )
          })}
        </div>

        <div className="kd-vignette" />
        <div className="kd-vignette-edges" />
      </div>

      {/* Left Brand Copy (Wide Screen) */}
      <div className="kd-bg-copy">
        <div className="line1">Healthy Crops.<br />Brighter Tomorrows.</div>
        <div className="line2">AI-Powered Agricultural Intelligence For a Greener, Stronger India.</div>
      </div>

      {/* Top Floating Controls */}
      <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 30, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            background: 'rgba(10,20,13,0.5)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 100,
            padding: '5px 12px',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.82rem',
            color: 'rgba(246,244,236,0.7)',
          }}
        >
          <span>{activeTab === 'signin' ? 'New here?' : 'Have an account?'}</span>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
            style={{
              background: 'none',
              border: 'none',
              color: '#7fe08a',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {activeTab === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
        <LanguageSelector />
      </div>

      {/* Success Celebration Overlay */}
      {signedIn && (
        <div className="kd-success-overlay">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a7a40, #27c163)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 40px rgba(46,204,113,0.6)',
              }}
            >
              <CheckCircle2 size={46} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              Welcome! Redirecting...
            </div>
          </div>
        </div>
      )}

      {/* Interactive Authentication Stage & Card */}
      <div className="kd-stage">
        <div className="kd-card">
          {/* Brand Row & Logo */}
          <div className="kd-brand-row">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <svg className="kd-logo" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="26" cy="26" r="25" stroke="#7fe08a" strokeOpacity="0.35" strokeWidth="1.5" />
                <path
                  d="M26 40C26 40 14 33.5 14 21.5C14 14 19.5 9 26 9C32.5 9 38 14 38 21.5C38 33.5 26 40 26 40Z"
                  fill="url(#kdLeafGrad)"
                />
                <path d="M26 40V14" stroke="#1f3d24" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M26 22L19 17" stroke="#1f3d24" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M26 29L34 23" stroke="#1f3d24" strokeWidth="1.2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="kdLeafGrad" x1="14" y1="9" x2="38" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9fe088" />
                    <stop offset="1" stopColor="#357a34" />
                  </linearGradient>
                </defs>
              </svg>
            </Link>
            <div className="kd-kicker">Welcome to</div>
            <h1 className="kd-brand-name">Krishi Darpan</h1>
            <p className="kd-subtitle">Smart farming starts here</p>
          </div>

          {/* Seamless Mode Switcher Tabs: Sign In | Sign Up */}
          <div className="kd-tabs">
            <div
              className="kd-tab-indicator"
              style={{
                transform: activeTab === 'signup' ? 'translateX(100%)' : 'translateX(0)',
              }}
            />
            <button
              type="button"
              className={`kd-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`kd-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {/* SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form className="kd-form" onSubmit={handleLoginSubmit} noValidate>
              {/* Portal/Role Selection */}
              <div className="kd-role-switch" role="radiogroup" aria-label="Portal selection">
                <button
                  type="button"
                  role="radio"
                  aria-checked={activeRole === 'farmer'}
                  className={`kd-role-btn ${activeRole === 'farmer' ? 'active-farmer' : ''}`}
                  onClick={() => handleRoleSwitch('farmer')}
                >
                  <Sprout size={14} aria-hidden="true" />
                  <span>Farmer Portal</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={activeRole === 'officer'}
                  className={`kd-role-btn ${activeRole === 'officer' ? 'active-officer' : ''}`}
                  onClick={() => handleRoleSwitch('officer')}
                >
                  <ShieldCheck size={14} aria-hidden="true" />
                  <span>Officer Desk</span>
                </button>
              </div>

              {loginError && (
                <div
                  id="login-error-msg"
                  role="alert"
                  className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-semibold flex items-center gap-2"
                >
                  <span aria-hidden="true">⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Mobile / Identifier */}
              <div className="kd-field-group">
                <label htmlFor="login-phone">
                  {activeRole === 'officer' ? 'Officer Mobile / Email / Govt ID' : 'Mobile Number or Email'}
                </label>
                <div className="kd-input-wrap">
                  <div className="kd-input-prefix" aria-hidden="true">
                    <span>{activeRole === 'officer' ? '🏛️' : '🇮🇳'}</span>
                    <span>{activeRole === 'officer' ? 'GOV' : '+91'}</span>
                  </div>
                  <input
                    id="login-phone"
                    name="identifier"
                    type="text"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder={activeRole === 'officer' ? 'Enter Officer ID, mobile, or email' : 'Enter mobile or email'}
                    aria-required="true"
                    aria-invalid={Boolean(loginError)}
                    aria-describedby={loginError ? 'login-error-msg' : undefined}
                    autoComplete="username"
                    required
                  />
                  <Phone size={16} className="kd-input-icon" aria-hidden="true" />
                </div>
              </div>

              {/* Password */}
              <div className="kd-field-group">
                <label htmlFor="login-password">Password</label>
                <div className="kd-input-wrap">
                  <input
                    id="login-password"
                    name="password"
                    type={showLoginPass ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    aria-required="true"
                    aria-invalid={Boolean(loginError)}
                    aria-describedby={loginError ? 'login-error-msg' : undefined}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="kd-input-icon-btn"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    aria-label={showLoginPass ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPass ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="kd-row-between">
                <label className="kd-remember" htmlFor="login-remember">
                  <input id="login-remember" type="checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="kd-link-btn"
                  onClick={() => toast('OTP reset will be sent to registered mobile')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="kd-btn-primary"
                disabled={busy}
                aria-busy={busy}
              >
                {busy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {activeRole === 'farmer' ? 'Farmer Portal' : 'Officer Desk'}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>

              <div className="kd-divider">or explore with instant demo access</div>

              {/* 1-Tap Demo Access */}
              <div className="kd-demo-row">
                <button
                  type="button"
                  className="kd-demo-card"
                  onClick={async () => {
                    setBusy(true)
                    const u = await authService.demoFarmer()
                    await completeAuth(u, 'farmer')
                    setBusy(false)
                  }}
                >
                  <div className="kd-demo-title">
                    <Sprout size={14} aria-hidden="true" />
                    <span>Farmer Demo Access</span>
                  </div>
                  <div className="kd-demo-sub">Rameshwar Patil (Nashik)</div>
                </button>

                <button
                  type="button"
                  className="kd-demo-card"
                  onClick={async () => {
                    setBusy(true)
                    const u = await authService.demoOfficer()
                    await completeAuth(u, 'officer')
                    setBusy(false)
                  }}
                >
                  <div className="kd-demo-title">
                    <ShieldCheck size={14} aria-hidden="true" />
                    <span>Officer Demo Access</span>
                  </div>
                  <div className="kd-demo-sub">Sanjay Deshmukh (Agri Hub)</div>
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form className="kd-form" onSubmit={handleSignupSubmit} noValidate>
              {regError && (
                <div
                  id="signup-error-msg"
                  role="alert"
                  className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-semibold flex items-center gap-2"
                >
                  <span aria-hidden="true">⚠️</span>
                  <span>{regError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="kd-field-group">
                <label htmlFor="signup-name">Full Name</label>
                <div className="kd-input-wrap">
                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    aria-required="true"
                    autoComplete="name"
                    required
                  />
                  <User size={16} className="kd-input-icon" aria-hidden="true" />
                </div>
              </div>

              {/* Farm Name (Optional) */}
              <div className="kd-field-group">
                <label htmlFor="signup-farm">
                  Farm Name <span style={{ opacity: 0.6, fontSize: 11, fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <div className="kd-input-wrap">
                  <input
                    id="signup-farm"
                    name="farmName"
                    type="text"
                    value={regFarmName}
                    onChange={(e) => setRegFarmName(e.target.value)}
                    placeholder={regName.trim() ? `${regName.trim().split(/\s+/)[0]}'s Farm` : 'e.g. Green Valley Farm'}
                  />
                  <Building2 size={16} className="kd-input-icon" aria-hidden="true" />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="kd-field-group">
                <label htmlFor="signup-phone">Mobile Number</label>
                <div className="kd-input-wrap">
                  <div className="kd-input-prefix" aria-hidden="true">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    id="signup-phone"
                    name="tel"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    inputMode="tel"
                    aria-required="true"
                    autoComplete="tel"
                    required
                  />
                  <Phone size={16} className="kd-input-icon" aria-hidden="true" />
                </div>
              </div>

              {/* Password */}
              <div className="kd-field-group">
                <label htmlFor="signup-password">Password</label>
                <div className="kd-input-wrap">
                  <input
                    id="signup-password"
                    name="new-password"
                    type={showRegPass ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a secure password"
                    aria-describedby="password-policy-hint signup-error-msg"
                    aria-required="true"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="kd-input-icon-btn"
                    onClick={() => setShowRegPass(!showRegPass)}
                    aria-label={showRegPass ? 'Hide password' : 'Show password'}
                  >
                    {showRegPass ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
                <p id="password-policy-hint" className="text-[11px] text-emerald-200/90 mt-1 m-0">
                  Use at least 8 characters with a mix of letters and numbers.
                </p>
              </div>

              {/* Confirm Password */}
              <div className="kd-field-group">
                <label htmlFor="signup-password-confirm">Confirm Password</label>
                <div className="kd-input-wrap">
                  <input
                    id="signup-password-confirm"
                    name="confirm-password"
                    type={showRegPass ? 'text' : 'password'}
                    value={regPassword2}
                    onChange={(e) => setRegPassword2(e.target.value)}
                    placeholder="Re-enter password"
                    aria-required="true"
                    autoComplete="new-password"
                    required
                  />
                  <Lock size={16} className="kd-input-icon" aria-hidden="true" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="kd-btn-primary"
                disabled={busy}
                aria-busy={busy}
              >
                {busy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Farmer Account</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Switch Hint */}
          <div className="kd-switch-hint">
            {activeTab === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setActiveTab('signup')}>
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setActiveTab('signin')}>
                  Sign In
                </button>
              </>
            )}
          </div>

          <div className="kd-mobile-tagline">
            Healthy Crops. Brighter Tomorrows. — For a Greener, Stronger India.
          </div>
        </div>
      </div>
    </main>
  )
}
