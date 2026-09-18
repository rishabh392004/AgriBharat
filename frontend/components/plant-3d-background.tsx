'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export const Plant3DBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // 1. Scene & Camera
    const scene = new THREE.Scene()
    
    // Subtle fog to blend distant leaves into the deep emerald background
    scene.fog = new THREE.FogExp2(0x133a25, 0.038)

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 0.5, 6.5)

    // 2. Renderer with smooth anti-aliasing and transparent clear
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)

    // 3. Realistic Agricultural Lighting Setup
    // Golden early morning key light
    const sunLight = new THREE.DirectionalLight(0xf5df95, 2.4)
    sunLight.position.set(4, 6, 4)
    scene.add(sunLight)

    // Soft sky ambient light (mint emerald)
    const ambientLight = new THREE.AmbientLight(0x235336, 1.3)
    scene.add(ambientLight)

    // Subtle golden back-light for subsurface rim glow on leaf edges
    const rimLight = new THREE.PointLight(0xe8c868, 2.8, 12)
    rimLight.position.set(-3, 3, -2)
    scene.add(rimLight)

    // Fill light from bottom
    const bounceLight = new THREE.DirectionalLight(0x1a452d, 1.0)
    bounceLight.position.set(0, -4, 2)
    scene.add(bounceLight)

    // 4. Create Organic Double-Curved Leaf Geometry
    function createLeafGeometry(length = 1.8, width = 0.44, curve = 0.35): THREE.BufferGeometry {
      const segmentsX = 9
      const segmentsY = 22
      const geometry = new THREE.PlaneGeometry(width, length, segmentsX, segmentsY)
      const pos = geometry.attributes.position as THREE.BufferAttribute

      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i)
        let y = pos.getY(i)
        let z = pos.getZ(i)

        // Normalize y from 0 (stem attachment) to 1 (leaf tip)
        const t = (y + length / 2) / length

        // Taper: wider at 35% height, pinched at base and sharp tip
        const widthFactor = Math.sin(t * Math.PI) * Math.pow(1 - t * 0.45, 0.8)
        x *= widthFactor * 2.1

        // Center spine V-fold (midrib groove)
        const distFromCenter = Math.abs(x) / (width * 0.5 + 0.001)
        z -= Math.pow(distFromCenter, 1.6) * 0.09

        // Longitudinal graceful arch: leaves bend outward and downward
        z += Math.sin(t * Math.PI * 0.85) * curve - Math.pow(t, 2.2) * (curve * 1.35)

        // Shift origin so (0,0,0) is the base of the leaf attached to the stem
        y += length * 0.48

        pos.setXYZ(i, x, y, z)
      }

      geometry.computeVertexNormals()
      return geometry
    }

    // High quality organic materials
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e7d4a,
      roughness: 0.38,
      metalness: 0.08,
      side: THREE.DoubleSide,
      flatShading: false,
    })

    const leafMaterialGold = new THREE.MeshStandardMaterial({
      color: 0x489659,
      roughness: 0.32,
      metalness: 0.12,
      side: THREE.DoubleSide,
      flatShading: false,
    })

    const stemMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f5c35,
      roughness: 0.45,
      metalness: 0.05,
    })

    const grainMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfb758,
      roughness: 0.4,
      metalness: 0.2,
    })

    // Group for all plant objects
    const plantGroup = new THREE.Group()
    scene.add(plantGroup)

    interface AnimatedLeaf {
      mesh: THREE.Mesh
      baseRotX: number
      baseRotY: number
      baseRotZ: number
      speed: number
      amplitude: number
      phase: number
    }

    interface AnimatedStem {
      group: THREE.Group
      baseRotZ: number
      baseRotX: number
      speed: number
      phase: number
    }

    const animatedLeaves: AnimatedLeaf[] = []
    const animatedStems: AnimatedStem[] = []

    // 5. Procedural Stalk Generator (Wheat / Healthy Crop shoot)
    function createCropStalk(
      stalkHeight = 4.2,
      stemSegments = 16,
      leafCount = 7,
      isGolden = false
    ): THREE.Group {
      const stalk = new THREE.Group()

      // Curve path for stem
      const points: THREE.Vector3[] = []
      const curveAmount = (Math.random() - 0.5) * 0.35
      for (let i = 0; i <= stemSegments; i++) {
        const t = i / stemSegments
        const y = t * stalkHeight
        const x = Math.sin(t * Math.PI * 0.6) * curveAmount
        const z = Math.cos(t * Math.PI * 0.4) * (curveAmount * 0.5)
        points.push(new THREE.Vector3(x, y, z))
      }

      const stemCurve = new THREE.CatmullRomCurve3(points)
      const stemGeom = new THREE.TubeGeometry(stemCurve, 28, 0.045, 8, false)
      const stemMesh = new THREE.Mesh(stemGeom, stemMaterial)
      stalk.add(stemMesh)

      // Add alternating graceful leaves along the stalk
      for (let i = 0; i < leafCount; i++) {
        const t = 0.2 + (i / leafCount) * 0.7
        const posOnStem = stemCurve.getPoint(t)
        const tangent = stemCurve.getTangent(t)

        const leafLength = (1.6 + Math.random() * 0.6) * (1.1 - t * 0.35)
        const leafWidth = 0.36 * (1.1 - t * 0.3)
        const leafGeom = createLeafGeometry(leafLength, leafWidth, 0.42 + Math.random() * 0.15)

        const mat = isGolden || Math.random() > 0.6 ? leafMaterialGold : leafMaterial
        const leafMesh = new THREE.Mesh(leafGeom, mat)

        leafMesh.position.copy(posOnStem)

        // Alternate leaf sides with golden phyllotaxis
        const sideAngle = i % 2 === 0 ? 0.75 : -0.75
        const rotY = sideAngle + (Math.random() - 0.5) * 0.3
        const rotX = 0.65 + Math.random() * 0.35
        const rotZ = (Math.random() - 0.5) * 0.2

        leafMesh.rotation.set(rotX, rotY, rotZ)

        stalk.add(leafMesh)

        animatedLeaves.push({
          mesh: leafMesh,
          baseRotX: rotX,
          baseRotY: rotY,
          baseRotZ: rotZ,
          speed: 1.1 + Math.random() * 0.8,
          amplitude: 0.065 + t * 0.045,
          phase: i * 0.85 + Math.random(),
        })
      }

      // Add golden grain spikelet head at top of stalk
      const tipPos = stemCurve.getPoint(1.0)
      const headGroup = new THREE.Group()
      headGroup.position.copy(tipPos)

      const spikeCount = 14
      const grainGeom = new THREE.ConeGeometry(0.04, 0.24, 5)
      grainGeom.rotateX(Math.PI / 2)

      for (let s = 0; s < spikeCount; s++) {
        const grain = new THREE.Mesh(grainGeom, grainMaterial)
        const ht = (s / spikeCount) * 0.75
        const angle = s * 2.39996 // Golden angle radians
        const radius = 0.06 * (1 - s / spikeCount)

        grain.position.set(Math.cos(angle) * radius, ht, Math.sin(angle) * radius)
        grain.rotation.set(-0.35, angle, 0.2)
        headGroup.add(grain)
      }

      stalk.add(headGroup)

      return stalk
    }

    // 6. Build the Botanical Garden Framing
    // Left graceful prominent stalk
    const stalkLeft = createCropStalk(4.6, 20, 9, false)
    stalkLeft.position.set(-2.8, -2.4, -0.4)
    stalkLeft.rotation.set(0.12, 0.45, 0.28)
    plantGroup.add(stalkLeft)
    animatedStems.push({ group: stalkLeft, baseRotZ: 0.28, baseRotX: 0.12, speed: 0.95, phase: 0.2 })

    // Right lush prominent stalk
    const stalkRight = createCropStalk(4.4, 20, 8, true)
    stalkRight.position.set(2.9, -2.5, -0.3)
    stalkRight.rotation.set(0.1, -0.5, -0.32)
    plantGroup.add(stalkRight)
    animatedStems.push({ group: stalkRight, baseRotZ: -0.32, baseRotX: 0.1, speed: 0.85, phase: 1.6 })

    // Mid-left background arching wheat stalk
    const stalkMidLeft = createCropStalk(3.8, 16, 6, false)
    stalkMidLeft.position.set(-1.8, -2.3, -1.6)
    stalkMidLeft.rotation.set(0.05, 0.2, 0.18)
    plantGroup.add(stalkMidLeft)
    animatedStems.push({ group: stalkMidLeft, baseRotZ: 0.18, baseRotX: 0.05, speed: 1.1, phase: 3.1 })

    // Mid-right background wheat stalk
    const stalkMidRight = createCropStalk(4.0, 16, 7, false)
    stalkMidRight.position.set(1.9, -2.4, -1.8)
    stalkMidRight.rotation.set(0.08, -0.3, -0.22)
    plantGroup.add(stalkMidRight)
    animatedStems.push({ group: stalkMidRight, baseRotZ: -0.22, baseRotX: 0.08, speed: 1.05, phase: 2.2 })

    // Deep background center accents (subtle, soft)
    const stalkFarCenter = createCropStalk(3.5, 14, 5, true)
    stalkFarCenter.position.set(0.3, -2.2, -2.6)
    stalkFarCenter.rotation.set(0.04, 0.1, -0.06)
    plantGroup.add(stalkFarCenter)
    animatedStems.push({ group: stalkFarCenter, baseRotZ: -0.06, baseRotX: 0.04, speed: 0.9, phase: 0.8 })

    // 7. Ambient Bioluminescent Pollen / Spore Particles
    const particleCount = 48
    const particleGeom = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSpeeds = new Float32Array(particleCount)
    const particleDrift = new Float32Array(particleCount)

    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 8.5
      particlePositions[p * 3 + 1] = -2.5 + Math.random() * 6.0
      particlePositions[p * 3 + 2] = -3.0 + Math.random() * 4.5

      particleSpeeds[p] = 0.25 + Math.random() * 0.45
      particleDrift[p] = Math.random() * Math.PI * 2
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

    // Canvas circular soft glowing particle texture
    const particleCanvas = document.createElement('canvas')
    particleCanvas.width = 32
    particleCanvas.height = 32
    const pCtx = particleCanvas.getContext('2d')
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16)
      grad.addColorStop(0, 'rgba(240, 215, 130, 0.95)')
      grad.addColorStop(0.35, 'rgba(212, 160, 23, 0.55)')
      grad.addColorStop(1, 'rgba(212, 160, 23, 0)')
      pCtx.fillStyle = grad
      pCtx.fillRect(0, 0, 32, 32)
    }

    const particleTexture = new THREE.CanvasTexture(particleCanvas)
    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particles = new THREE.Points(particleGeom, particleMat)
    scene.add(particles)

    // 8. Mouse Interactive Parallax
    let mouseX = 0
    let mouseY = 0
    let targetCameraX = 0
    let targetCameraY = 0.5

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

      targetCameraX = mouseX * 0.45
      targetCameraY = 0.5 + mouseY * 0.25
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // 10. Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Smooth camera interpolation for natural organic feel
      camera.position.x += (targetCameraX - camera.position.x) * 0.045
      camera.position.y += (targetCameraY - camera.position.y) * 0.045
      camera.lookAt(0, 0.5, 0)

      // Animate stems swaying gently in the morning agricultural breeze
      for (let i = 0; i < animatedStems.length; i++) {
        const s = animatedStems[i]
        const sway = Math.sin(elapsedTime * s.speed + s.phase) * 0.048
        const flutter = Math.cos(elapsedTime * s.speed * 1.4 + s.phase) * 0.022

        s.group.rotation.z = s.baseRotZ + sway
        s.group.rotation.x = s.baseRotX + flutter
      }

      // Animate each leaf with compound harmonic flutter
      for (let i = 0; i < animatedLeaves.length; i++) {
        const l = animatedLeaves[i]
        const mainWave = Math.sin(elapsedTime * l.speed + l.phase) * l.amplitude
        const subWave = Math.cos(elapsedTime * l.speed * 1.8 + l.phase) * (l.amplitude * 0.4)

        l.mesh.rotation.x = l.baseRotX + mainWave
        l.mesh.rotation.z = l.baseRotZ + subWave
      }

      // Animate rising spores / golden pollen particles
      const posAttr = particleGeom.attributes.position as THREE.BufferAttribute
      for (let p = 0; p < particleCount; p++) {
        let py = posAttr.getY(p)
        let px = posAttr.getX(p)

        py += particleSpeeds[p] * 0.008
        px += Math.sin(elapsedTime * 0.75 + particleDrift[p]) * 0.003

        if (py > 3.6) {
          py = -2.5
          px = (Math.random() - 0.5) * 8.5
        }

        posAttr.setY(p, py)
        posAttr.setX(p, px)
      }
      posAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // 11. Cleanup on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }

      renderer.dispose()
      scene.clear()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  )
}
