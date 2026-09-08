'use client'

import React, { useEffect, useRef } from 'react'

export const SplashBgAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize, { passive: true })

    // Mouse tracking for gentle draft
    let mouseX = width / 2
    let mouseY = height / 2
    let targetMouseX = width / 2
    let targetMouseY = height / 2

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX
      targetMouseY = e.clientY
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Create subtle, organic pollen / micro-spores
    const particleCount = 28
    interface PollenParticle {
      x: number
      y: number
      radius: number
      speedY: number
      swaySpeed: number
      swayRange: number
      phase: number
      alpha: number
      baseAlpha: number
      fadeSpeed: number
      color: string
    }

    const colors = [
      'rgba(245, 223, 149, ', // Warm sun gold
      'rgba(232, 200, 104, ', // Golden wheat
      'rgba(110, 231, 183, ', // Mint dew green
      'rgba(52, 211, 153, ',  // Fresh emerald
    ]

    const particles: PollenParticle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.2 + Math.random() * 2.0,
        speedY: 0.25 + Math.random() * 0.45,
        swaySpeed: 0.001 + Math.random() * 0.002,
        swayRange: 15 + Math.random() * 25,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.1 + Math.random() * 0.5,
        baseAlpha: 0.2 + Math.random() * 0.45,
        fadeSpeed: 0.004 + Math.random() * 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    // Two soft, ambient breathing auroral light clouds
    let time = 0

    const render = () => {
      time += 0.015

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.03
      mouseY += (targetMouseY - mouseY) * 0.03

      ctx.clearRect(0, 0, width, height)

      // 1. Soft Ambient Sunbeam Cloud (Top center-right, warm gold)
      const sunX = width * 0.52 + Math.sin(time * 0.4) * 50 + (mouseX - width / 2) * 0.04
      const sunY = height * 0.22 + Math.cos(time * 0.3) * 35 + (mouseY - height / 2) * 0.03
      const sunRadius = Math.min(width, height) * 0.55

      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius)
      sunGrad.addColorStop(0, 'rgba(232, 200, 104, 0.12)')
      sunGrad.addColorStop(0.45, 'rgba(212, 160, 23, 0.05)')
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = sunGrad
      ctx.beginPath()
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2)
      ctx.fill()

      // 2. Soft Field Mist Cloud (Bottom center-left, soft mint emerald)
      const mistX = width * 0.35 + Math.cos(time * 0.35) * 45 - (mouseX - width / 2) * 0.03
      const mistY = height * 0.78 + Math.sin(time * 0.28) * 30 - (mouseY - height / 2) * 0.02
      const mistRadius = Math.min(width, height) * 0.6

      const mistGrad = ctx.createRadialGradient(mistX, mistY, 0, mistX, mistY, mistRadius)
      mistGrad.addColorStop(0, 'rgba(52, 211, 153, 0.09)')
      mistGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.03)')
      mistGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = mistGrad
      ctx.beginPath()
      ctx.arc(mistX, mistY, mistRadius, 0, Math.PI * 2)
      ctx.fill()

      // 3. Render Subtle Floating Pollen Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Upward gentle drift
        p.y -= p.speedY
        p.x += Math.sin(time * 1.2 + p.phase) * (p.swayRange * 0.02)

        // Mouse subtle draft
        const dx = p.x - mouseX
        const dy = p.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 180 && dist > 0) {
          const force = (1 - dist / 180) * 0.6
          p.x += (dx / dist) * force
          p.y += (dy / dist) * force
        }

        // Alpha breathing pulse
        p.alpha = p.baseAlpha + Math.sin(time * 1.5 + p.phase) * 0.18
        if (p.alpha < 0.05) p.alpha = 0.05
        if (p.alpha > 0.75) p.alpha = 0.75

        // Wrap around smoothly
        if (p.y < -20) {
          p.y = height + 20
          p.x = Math.random() * width
        }
        if (p.x < -20) p.x = width + 20
        if (p.x > width + 20) p.x = -20

        // Draw soft glowing particle
        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.8)
        pGrad.addColorStop(0, `${p.color}${p.alpha})`)
        pGrad.addColorStop(0.4, `${p.color}${p.alpha * 0.6})`)
        pGrad.addColorStop(1, `${p.color}0)`)

        ctx.fillStyle = pGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2)
        ctx.fill()

        // Tiny crisp center core
        ctx.fillStyle = `${p.color}${Math.min(1, p.alpha * 1.4)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  )
}
