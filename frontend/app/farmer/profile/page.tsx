'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CountUp } from '@/components/count-up'
import { LanguageSelector } from '@/components/language-selector'
import { localeLabels, useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { scans } from '@/data/mock'
import { toast } from '@/components/toast'
import { UserCheck, Phone, MapPin, Award, Sprout, Activity, ShieldAlert, Sparkles, Droplets } from 'lucide-react'

export default function ProfilePage() {
  const { t } = useI18n()
  const { farmer, setFarmer, signOut } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(farmer)
  const latest = scans[0]
  const healthy = scans.filter((s) => s.status === 'Healthy').length
  const issues = scans.length - healthy

  return (
    <div>
      {/* Full-Width Hero Banner */}
      <section className="profile-hero-card">
        <div className="profile-ava-wrap">
          <div className="ava xl">{farmer.initials}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 32px)', color: '#ffffff' }}>{farmer.name}</h1>
              <span className="chip" style={{ background: 'rgba(232,200,104,0.25)', color: '#f0d57e', border: '1px solid rgba(232,200,104,0.4)', fontSize: 11 }}>
                {t('verifiedFarmer')}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: '#c0d6be', fontSize: 13 }}>
              {farmer.farmName} · 📍 {farmer.location}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#a0bfa0' }}>
              {t('farmerId')}: KR-FARM-9942 · {t('activeMemberSince')}
            </p>
          </div>
        </div>

        {/* Quick Badges & Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px 14px', borderRadius: 14, textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
            <b style={{ display: 'block', fontSize: 18, color: '#ffffff' }}>{farmer.farmArea}</b>
            <span style={{ fontSize: 10, color: '#a8c2a4', textTransform: 'uppercase' }}>{t('acresLabel')}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px 14px', borderRadius: 14, textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
            <b style={{ display: 'block', fontSize: 18, color: '#ffffff' }}>{farmer.experience}y</b>
            <span style={{ fontSize: 10, color: '#a8c2a4', textTransform: 'uppercase' }}>{t('experienceLabel')}</span>
          </div>
          {editing ? (
            <button
              className="btn btn-gold"
              style={{ padding: '10px 20px', borderRadius: 999, fontWeight: 750 }}
              onClick={() => {
                setFarmer(draft)
                setEditing(false)
                toast(t('save'))
              }}
            >
              {t('save')}
            </button>
          ) : (
            <button
              className="btn btn-gold"
              style={{ padding: '10px 20px', borderRadius: 999, fontWeight: 750 }}
              onClick={() => setEditing(true)}
            >
              {t('editProfile')}
            </button>
          )}
        </div>
      </section>

      {/* 3-Column Expansive Grid spanning the screen */}
      <div className="profile-grid-3">
        {/* Column 1: Personal & Account Information */}
        <section className="profile-full-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <UserCheck size={18} style={{ color: 'var(--leaf)' }} />
            <h3 style={{ margin: 0, fontSize: 16 }}>{t('personal')}</h3>
          </div>

          {editing ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="field">
                <label>{t('fullName')}</label>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, firstName: e.target.value.split(' ')[0] })} />
              </div>
              <div className="field">
                <label>{t('phone')}</label>
                <input value={draft.mobile} onChange={(e) => setDraft({ ...draft, mobile: e.target.value })} />
              </div>
              <div className="field">
                <label>{t('location')}</label>
                <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 4 }}>
              <div className="profile-metric-row">
                <span className="muted">{t('fullName')}</span>
                <strong>{farmer.name}</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('phone')}</span>
                <strong>{farmer.mobile}</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('location')}</span>
                <strong>{farmer.location}</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('talukaDistrict')}</span>
                <strong>Niphad, Nashik</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('preferredLang')}</span>
                <strong>{localeLabels[farmer.language]}</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('kisanPortalStatus')}</span>
                <span className="chip low" style={{ fontSize: 10, padding: '2px 8px' }}>{t('activeStatus')}</span>
              </div>
            </div>
          )}
        </section>

        {/* Column 2: Farm & Soil Profile */}
        <section className="profile-full-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sprout size={18} style={{ color: 'var(--gold)' }} />
            <h3 style={{ margin: 0, fontSize: 16 }}>{t('farmInfo')}</h3>
          </div>

          {editing ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="field">
                <label>{t('farmName')}</label>
                <input value={draft.farmName} onChange={(e) => setDraft({ ...draft, farmName: e.target.value })} />
              </div>
              <div className="field">
                <label>{t('farmArea')}</label>
                <input type="number" value={draft.farmArea} onChange={(e) => setDraft({ ...draft, farmArea: Number(e.target.value) })} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 4 }}>
              <div className="profile-metric-row">
                <span className="muted">{t('holdingName')}</span>
                <strong>{farmer.farmName}</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('farmArea')}</span>
                <strong>{farmer.farmArea} {t('acres')} (1.82 ha)</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('primaryCrop')}</span>
                <strong style={{ color: 'var(--forest)' }}>{farmer.primaryCrop} (Lokwan)</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('otherCrops')}</span>
                <strong>{farmer.otherCrops.join(', ')}</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('soil')}</span>
                <strong>{farmer.soilType}</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('irrigationType')}</span>
                <strong>{t('automatedMicroDrip')}</strong>
              </div>
            </div>
          )}
        </section>

        {/* Column 3: Crop Health Analytics & Scans */}
        <section className="profile-full-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Activity size={18} style={{ color: '#3d7a4a' }} />
            <h3 style={{ margin: 0, fontSize: 16 }}>{t('fieldHealthDiagnostics')}</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '8px 0 4px' }}>
            <div className="big" style={{ fontSize: 32, margin: 0 }}>
              <CountUp value={farmer.cropHealth} /> / 100
            </div>
            <span className="chip low" style={{ fontSize: 11 }}>{t('goodCondition')}</span>
          </div>

          <div style={{ height: 6, width: '100%', background: '#ede6d6', borderRadius: 99, margin: '8px 0 12px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${farmer.cropHealth}%`, background: 'linear-gradient(90deg, #3d7a4a, #d4a017)', borderRadius: 99 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, textAlign: 'center' }}>
            <div style={{ background: '#f7f3ea', padding: '10px 6px', borderRadius: 12 }}>
              <b style={{ fontSize: 18, display: 'block', color: 'var(--forest)' }}>{scans.length}</b>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{t('totalScansLabel')}</span>
            </div>
            <div style={{ background: '#dcebd8', padding: '10px 6px', borderRadius: 12 }}>
              <b style={{ fontSize: 18, display: 'block', color: '#347044' }}>{healthy}</b>
              <span style={{ fontSize: 10, color: '#347044' }}>{t('healthyLabel')}</span>
            </div>
            <div style={{ background: '#f7dfd4', padding: '10px 6px', borderRadius: 12 }}>
              <b style={{ fontSize: 18, display: 'block', color: '#a4462f' }}>{issues}</b>
              <span style={{ fontSize: 10, color: '#a4462f' }}>{t('underCareLabel')}</span>
            </div>
          </div>

          <p className="muted" style={{ fontSize: 11, marginTop: 14, lineHeight: 1.4 }}>
            {t('latestInspection')}: {latest.crop} ({latest.disease}) on 02 Sep 2026. {t('recommendedOrganicTreatment')}
          </p>
        </section>
      </div>

      {/* Full-Width Soil Health & Nutrients Status Card */}
      <section className="profile-full-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div>
            <p className="kicker" style={{ margin: 0 }}>{t('officialSoilTestingCard')}</p>
            <h3 style={{ margin: '2px 0 0', fontSize: 17 }}>{t('soilFertilityTitle')}</h3>
          </div>
          <span style={{ fontSize: 11, color: 'var(--leaf)', background: '#dcebd8', padding: '4px 10px', borderRadius: 999, fontWeight: 700 }}>
            {t('testedAug2026')}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ background: '#fbf8f1', border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}>
            <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>{t('nitrogenN')}</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--forest)', margin: '4px 0 2px' }}>{t('nitrogenVal')}</div>
            <span style={{ fontSize: 11, color: '#8a6410', fontWeight: 650 }}>{t('nitrogenStatus')}</span>
          </div>
          <div style={{ background: '#fbf8f1', border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}>
            <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>{t('phosphorusP')}</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--forest)', margin: '4px 0 2px' }}>{t('phosphorusVal')}</div>
            <span style={{ fontSize: 11, color: '#347044', fontWeight: 650 }}>{t('phosphorusStatus')}</span>
          </div>
          <div style={{ background: '#fbf8f1', border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}>
            <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>{t('potassiumK')}</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--forest)', margin: '4px 0 2px' }}>{t('potassiumVal')}</div>
            <span style={{ fontSize: 11, color: '#347044', fontWeight: 650 }}>{t('potassiumStatus')}</span>
          </div>
          <div style={{ background: '#fbf8f1', border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}>
            <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>{t('phLevel')}</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--forest)', margin: '4px 0 2px' }}>{t('phVal')}</div>
            <span style={{ fontSize: 11, color: '#347044', fontWeight: 650 }}>{t('phStatus')}</span>
          </div>
        </div>
      </section>

      {/* Profile Actions */}
      <div className="actions" style={{ marginTop: 20 }}>
        {editing ? (
          <>
            <button
              className="btn btn-primary"
              style={{ width: 'auto' }}
              onClick={() => {
                setFarmer(draft)
                setEditing(false)
                toast(t('save'))
              }}
            >
              {t('save')}
            </button>
            <button className="btn btn-ghost" onClick={() => { setDraft(farmer); setEditing(false) }}>
              {t('cancel')}
            </button>
          </>
        ) : (
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setEditing(true)}>
            {t('editProfile')}
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => toast(t('soilReportDownloaded'))}>
          {t('downloadSoilCard')}
        </button>
        <button className="btn btn-ghost" onClick={() => toast(t('notifications'))}>
          {t('notifications')}
        </button>
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="btn"
            style={{ background: '#f7dfd4', color: '#a4462f', border: '1px solid #f2c4b4' }}
            onClick={() => {
              signOut()
              router.push('/login')
            }}
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
