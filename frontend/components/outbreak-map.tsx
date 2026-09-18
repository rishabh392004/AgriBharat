'use client'

import React, { useState } from 'react'
import {
  MapPin,
  Flame,
  AlertTriangle,
  ShieldCheck,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Info,
} from 'lucide-react'
import { MOCK_HOTSPOTS } from '@/data/mock'
import type { HotspotCluster, Severity } from '@/types'

export const OutbreakMap: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<string>('All')
  const [selectedCluster, setSelectedCluster] = useState<HotspotCluster | null>(MOCK_HOTSPOTS[0])

  const crops = ['All', 'Grape', 'Tomato', 'Cotton', 'Potato', 'Wheat']

  const filteredClusters = MOCK_HOTSPOTS.filter(
    (c) => selectedCrop === 'All' || c.crop.toLowerCase() === selectedCrop.toLowerCase()
  )

  return (
    <div className="card space-y-4" style={{ padding: '20px 24px', background: '#ffffff' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: '1px solid #eef2eb',
          paddingBottom: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={16} className="text-red-500" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#b91c1c',
                letterSpacing: 0.5,
              }}
            >
              Geospatial Outbreak Intelligence
            </span>
          </div>
          <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
            Regional Disease Hotspots & Active Clusters
          </h2>
        </div>

        {/* Crop Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {crops.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCrop(c)}
              style={{
                border: '1px solid',
                borderColor: selectedCrop === c ? '#2b7a4d' : '#dbe5d8',
                background: selectedCrop === c ? '#2b7a4d' : 'transparent',
                color: selectedCrop === c ? '#ffffff' : '#334155',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 11,
                fontWeight: selectedCrop === c ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Map Visual + Cluster Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Left Simulated Radar / Spatial View */}
        <div
          style={{
            background: '#132317',
            borderRadius: 16,
            padding: 20,
            color: '#ffffff',
            position: 'relative',
            minHeight: 280,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Map Grid Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.12,
              backgroundImage:
                'linear-gradient(#2b7a4d 1px, transparent 1px), linear-gradient(90deg, #2b7a4d 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <span
              style={{
                fontSize: 10,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#a7f3d0',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Surveillance Grid Active
            </span>
            <h3 style={{ margin: '8px 0 2px', fontSize: 16, fontWeight: 800 }}>
              {selectedCluster ? `${selectedCluster.district}, ${selectedCluster.state}` : 'Select a Hotspot'}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
              {selectedCluster
                ? `Focal pathogen: ${selectedCluster.disease} on ${selectedCluster.crop}`
                : 'Click any cluster on the right to inspect cluster telemetry.'}
            </p>
          </div>

          {/* Interactive Cluster Nodes Display */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 120,
              gap: 16,
            }}
          >
            {filteredClusters.map((cluster) => {
              const isSelected = selectedCluster?.id === cluster.id
              const isHigh = cluster.severity === 'High' || cluster.severity === 'Severe'
              return (
                <button
                  key={cluster.id}
                  type="button"
                  onClick={() => setSelectedCluster(cluster)}
                  style={{
                    width: isSelected ? 48 : 36,
                    height: isSelected ? 48 : 36,
                    borderRadius: '50%',
                    background: isHigh ? '#ef4444' : '#f59e0b',
                    border: isSelected ? '3px solid #ffffff' : '1.5px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: isSelected
                      ? `0 0 20px ${isHigh ? '#ef4444' : '#f59e0b'}`
                      : 'none',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 12,
                    transition: 'all 200ms ease',
                  }}
                  title={`${cluster.district} - ${cluster.disease}`}
                >
                  <MapPin size={isSelected ? 20 : 16} />
                </button>
              )
            })}
          </div>

          {selectedCluster && (
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 11,
              }}
            >
              <span>Spread Radius: ~{(selectedCluster.radiusMeters / 1000).toFixed(1)} km</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>
                {selectedCluster.officerValidatedCount} / {selectedCluster.reportedCasesCount} Validated
              </span>
            </div>
          )}
        </div>

        {/* Right Hotspot Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
          {filteredClusters.map((cluster) => {
            const isSelected = selectedCluster?.id === cluster.id
            const isHigh = cluster.severity === 'High' || cluster.severity === 'Severe'
            return (
              <div
                key={cluster.id}
                onClick={() => setSelectedCluster(cluster)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1.5px solid',
                  borderColor: isSelected ? '#2b7a4d' : '#e2ebd0',
                  background: isSelected ? '#f5faf3' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: '#1e293b' }}>
                    {cluster.district} ({cluster.crop})
                  </strong>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: isHigh ? '#fee2e2' : '#fef3c7',
                      color: isHigh ? '#b91c1c' : '#92400e',
                    }}
                  >
                    {cluster.disease}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--muted)' }}>
                  <span>{cluster.reportedCasesCount} reported cases</span>
                  <span>Updated {cluster.lastReportedTime}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
