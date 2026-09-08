'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { CountUp } from '@/components/count-up'
import { LanguageSelector } from '@/components/language-selector'
import { localeLabels, useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { scans } from '@/data/mock'
import { toast } from '@/components/toast'
import { detectLiveLocation } from '@/lib/location'
import {
  UserCheck,
  Phone,
  MapPin,
  Award,
  Sprout,
  Activity,
  ShieldAlert,
  Sparkles,
  Droplets,
  Navigation,
  Loader2,
} from 'lucide-react'

export default function ProfilePage() {
  const { t } = useI18n()
  const { farmer, setFarmer, signOut } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(farmer)
  const [locating, setLocating] = useState(false)

  // Keep draft in sync whenever farmer loads from localStorage or auth updates
  useEffect(() => {
    setDraft(farmer)
  }, [farmer])

  const handleDetectLocation = async () => {
    setLocating(true)
    try {
      const res = await detectLiveLocation()
      const updatedData = {
        location: res.locationName,
        latitude: res.latitude,
        longitude: res.longitude,
      }
      setDraft((prev) => ({ ...prev, ...updatedData }))

      // Update farmer directly so hero and state update in real-time
      setFarmer((prev) => ({ ...prev, ...updatedData }))
      toast(`📍 Live GPS detected: ${res.locationName}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to retrieve live location'
      toast(msg)
    } finally {
      setLocating(false)
    }
  }

  const handleSave = () => {
    setFarmer(draft)
    setEditing(false)
    toast('Profile updated successfully!')
  }

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
              <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 32px)', color: '#ffffff' }}>
                {farmer.name}
              </h1>
              <span
                className="chip"
                style={{
                  background: 'rgba(232,200,104,0.25)',
                  color: '#f0d57e',
                  border: '1px solid rgba(232,200,104,0.4)',
                  fontSize: 11,
                }}
              >
                {t('verifiedFarmer')}
              </span>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                color: '#c0d6be',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span>{farmer.farmName}</span>
              <span>·</span>
              <span>📍 {farmer.location}</span>
              {farmer.latitude && farmer.longitude ? (
                <span style={{ fontSize: 11, color: '#a0cfa0' }}>
                  ({farmer.latitude.toFixed(4)}° N, {farmer.longitude.toFixed(4)}° E)
                </span>
              ) : null}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#ffffff',
                  borderRadius: 999,
                  padding: '2px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: locating ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Detect your device GPS live location"
              >
                {locating ? (
                  <>
                    <Loader2 size={10} className="spin" />
                    Detecting GPS...
                  </>
                ) : (
                  <>
                    <Navigation size={10} />
                    📍 Live GPS
                  </>
                )}
              </button>
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#a0bfa0' }}>
              {t('farmerId')}: KR-FARM-9942 · {t('activeMemberSince')}
            </p>
          </div>
        </div>

        {/* Quick Badges & Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              padding: '8px 14px',
              borderRadius: 14,
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <b style={{ display: 'block', fontSize: 18, color: '#ffffff' }}>{farmer.farmArea}</b>
            <span style={{ fontSize: 10, color: '#a8c2a4', textTransform: 'uppercase' }}>
              {t('acresLabel')}
            </span>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              padding: '8px 14px',
              borderRadius: 14,
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <b style={{ display: 'block', fontSize: 18, color: '#ffffff' }}>{farmer.experience}y</b>
            <span style={{ fontSize: 10, color: '#a8c2a4', textTransform: 'uppercase' }}>
              {t('experienceLabel')}
            </span>
          </div>
          {editing ? (
            <button
              className="btn btn-gold"
              style={{ padding: '10px 20px', borderRadius: 999, fontWeight: 750 }}
              onClick={handleSave}
            >
              {t('save')}
            </button>
          ) : (
            <button
              className="btn btn-gold"
              style={{ padding: '10px 20px', borderRadius: 999, fontWeight: 750 }}
              onClick={() => {
                setDraft(farmer)
                setEditing(true)
              }}
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
                <input
                  value={draft.name}
                  onChange={(e) => {
                    const val = e.target.value
                    const parts = val.trim().split(/\s+/)
                    const inits = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'KB'
                    setDraft({
                      ...draft,
                      name: val,
                      firstName: parts[0] || val,
                      initials: inits,
                    })
                  }}
                  placeholder="e.g. Ramesh Patel"
                />
              </div>
              <div className="field">
                <label>{t('phone')}</label>
                <input
                  value={draft.mobile}
                  onChange={(e) => setDraft({ ...draft, mobile: e.target.value })}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="field">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ margin: 0 }}>{t('location')}</label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locating}
                    style={{
                      background: 'rgba(46, 125, 50, 0.12)',
                      border: '1px solid rgba(46, 125, 50, 0.3)',
                      color: 'var(--leaf)',
                      borderRadius: 999,
                      padding: '3px 9px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: locating ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {locating ? (
                      <>
                        <Loader2 size={11} className="spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Navigation size={11} />
                        📍 Detect Live GPS
                      </>
                    )}
                  </button>
                </div>
                <input
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  placeholder="e.g. Niphad, Nashik"
                />
                {draft.latitude && draft.longitude ? (
                  <small style={{ color: 'var(--leaf)', fontSize: 11, display: 'block', marginTop: 3 }}>
                    Live GPS: {draft.latitude.toFixed(4)}° N, {draft.longitude.toFixed(4)}° E
                  </small>
                ) : null}
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
              <div className="profile-metric-row" style={{ alignItems: 'flex-start' }}>
                <span className="muted">{t('location')}</span>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block' }}>{farmer.location}</strong>
                  {farmer.latitude && farmer.longitude ? (
                    <small style={{ color: 'var(--leaf)', fontSize: 11, display: 'block' }}>
                      ({farmer.latitude.toFixed(4)}° N, {farmer.longitude.toFixed(4)}° E)
                    </small>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locating}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--leaf)',
                      cursor: locating ? 'wait' : 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 0 0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    {locating ? (
                      <>
                        <Loader2 size={10} className="spin" /> Locating...
                      </>
                    ) : (
                      <>
                        <Navigation size={10} /> 📍 Detect Live Location
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('talukaDistrict')}</span>
                <strong>{farmer.location.includes(',') ? farmer.location : `${farmer.location}, Nashik`}</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('preferredLang')}</span>
                <strong>{localeLabels[farmer.language]}</strong>
              </div>
              <div className="profile-metric-row">
                <span className="muted">{t('kisanPortalStatus')}</span>
                <span className="chip low" style={{ fontSize: 10, padding: '2px 8px' }}>
                  {t('activeStatus')}
                </span>
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
