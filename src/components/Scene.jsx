import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { XR, createXRStore, XROrigin } from '@react-three/xr'
import { useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import LabRoom from './LabRoom'
import ComponentShelf from './ComponentShelf'
import CasingTarget from './CasingTarget'
import InspectView from './InspectView'

export const xrStore = createXRStore()

// ── Gaze Cursor untuk Google Cardboard ───────────────────────────────────────
function GazeCursor() {
  const ringRef = useRef()
  const fillRef = useRef()
  const dotRef = useRef()
  const progress = useRef(0)
  const currentTarget = useRef(null)
  const fired = useRef(false)
  const GAZE_TIME = 80 // frame ~1.3 detik di 60fps

  const { raycaster, camera, scene } = useThree()

  useFrame(() => {
    raycaster.setFromCamera({ x: 0, y: 0 }, camera)
    const hits = raycaster.intersectObjects(scene.children, true)

    // Cari hit dengan gazeTarget
    let foundTarget = null
    let foundAction = null
    for (const h of hits) {
      let obj = h.object
      while (obj) {
        if (obj.userData?.gazeTarget) {
          foundTarget = obj.uuid
          foundAction = obj.userData.onGaze
          break
        }
        obj = obj.parent
      }
      if (foundTarget) break
    }

    if (foundTarget) {
      if (currentTarget.current !== foundTarget) {
        // Pindah target baru — reset
        currentTarget.current = foundTarget
        progress.current = 0
        fired.current = false
      }

      if (!fired.current) {
        progress.current = Math.min(progress.current + 1, GAZE_TIME)
        if (progress.current >= GAZE_TIME) {
          fired.current = true
          foundAction?.()
          progress.current = 0
        }
      }
    } else {
      currentTarget.current = null
      fired.current = false
      progress.current = Math.max(progress.current - 2, 0)
    }

    const t = progress.current / GAZE_TIME

    // Update fill ring (arc progress)
    if (fillRef.current) {
      fillRef.current.material.color.setHSL(0.33 - t * 0.33, 1, 0.55)
      fillRef.current.scale.setScalar(1 + t * 0.4)
      fillRef.current.material.opacity = 0.5 + t * 0.5
    }
    if (ringRef.current) {
      ringRef.current.material.opacity = 0.6 + t * 0.3
    }

    // Billboard cursor — selalu di depan kamera
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const pos = camera.position.clone().add(dir.multiplyScalar(1.8))
    const q = camera.quaternion.clone()

      ;[ringRef, fillRef, dotRef].forEach(r => {
        if (r.current) {
          r.current.position.copy(pos)
          r.current.quaternion.copy(q)
        }
      })
  })

  return (
    <group renderOrder={999}>
      {/* Ring luar statis */}
      <mesh ref={ringRef} renderOrder={999}>
        <ringGeometry args={[0.016, 0.022, 40]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7}
          side={THREE.DoubleSide} depthTest={false} />
      </mesh>
      {/* Ring progress */}
      <mesh ref={fillRef} renderOrder={998}>
        <ringGeometry args={[0.010, 0.016, 40]} />
        <meshBasicMaterial color="#44ffaa" transparent opacity={0.5}
          side={THREE.DoubleSide} depthTest={false} />
      </mesh>
      {/* Dot tengah */}
      <mesh ref={dotRef} renderOrder={1000}>
        <circleGeometry args={[0.004, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={1}
          side={THREE.DoubleSide} depthTest={false} />
      </mesh>
    </group>
  )
}

// ── Intro Screen (3D panel di dalam scene) ────────────────────────────────────
function IntroPanel() {
  const startGame = useStore(s => s.startGame)
  const btnRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Gaze btn
  const setBtnGaze = (ref) => {
    if (ref) {
      ref.userData.gazeTarget = true
      ref.userData.onGaze = startGame
    }
  }

  return (
    <group position={[0, 1.2, -1.5]}>
      {/* Panel bg */}
      <mesh>
        <boxGeometry args={[2.2, 1.4, 0.02]} />
        <meshStandardMaterial color="#050d1a" transparent opacity={0.95} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <boxGeometry args={[2.22, 1.42, 0.005]} />
        <meshBasicMaterial color="#1a4488" wireframe />
      </mesh>

      <Text position={[0, 0.52, 0.02]} fontSize={0.13} color="#7cb9f5"
        anchorX="center" anchorY="middle" fontWeight="bold">
        🖥 RAKIT PC VR
      </Text>
      <Text position={[0, 0.3, 0.02]} fontSize={0.065} color="#ccd"
        anchorX="center" anchorY="middle" maxWidth={1.9}>
        Pelajari cara merakit PC dengan benar
      </Text>
      <Text position={[0, 0.12, 0.02]} fontSize={0.055} color="#889"
        anchorX="center" anchorY="middle" maxWidth={1.9}>
        Ambil komponen dari rak kiri,
      </Text>
      <Text position={[0, 0.0, 0.02]} fontSize={0.055} color="#889"
        anchorX="center" anchorY="middle" maxWidth={1.9}>
        pasang ke casing sesuai urutan.
      </Text>

      {/* Tombol mulai */}
      <group
        ref={(r) => { btnRef.current = r; setBtnGaze(r) }}
        position={[0, -0.38, 0.02]}
        onClick={startGame}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh>
          <boxGeometry args={[0.7, 0.18, 0.02]} />
          <meshStandardMaterial
            color={hovered ? '#2266cc' : '#1144aa'}
            emissive={hovered ? '#1144aa' : '#0a2255'}
            emissiveIntensity={1}
          />
        </mesh>
        <Text position={[0, 0, 0.015]} fontSize={0.07} color="#ffffff"
          anchorX="center" anchorY="middle">
          ▶ MULAI
        </Text>
      </group>

      {/* Invisible hitbox untuk gaze */}
      <mesh
        ref={(r) => setBtnGaze(r)}
        position={[0, -0.38, 0.02]}
        onClick={startGame}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.7, 0.18, 0.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Complete Screen ───────────────────────────────────────────────────────────
function CompletePanel() {
  const reset = useStore(s => s.reset)
  const completedSteps = useStore(s => s.completedSteps)
  const getCompatibilityIssues = useStore(s => s.getCompatibilityIssues)
  const issues = getCompatibilityIssues()
  const perfect = true
  const btnRef = useRef()
  const [hovered, setHovered] = useState(false)

  const setBtnGaze = (ref) => {
    if (ref) {
      ref.userData.gazeTarget = true
      ref.userData.onGaze = reset
    }
  }

  return (
    <group position={[0, 2.4, -0.9]}>
      <mesh>
        <boxGeometry args={[2.2, 1.6, 0.02]} />
        <meshStandardMaterial color="#050d1a" transparent opacity={0.96} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <boxGeometry args={[2.22, 1.62, 0.005]} />
        <meshBasicMaterial color={perfect ? '#1a8844' : '#884411'} wireframe />
      </mesh>

      <Text position={[0, 0.62, 0.02]} fontSize={0.14} color={perfect ? '#4fc' : '#fa8'}
        anchorX="center" anchorY="middle">
        {perfect ? '🎉 PC SELESAI DIRAKIT!' : '⚠ PC Dirakit dengan Masalah'}
      </Text>

      <Text position={[0, 0.42, 0.02]} fontSize={0.058} color="#ccd"
        anchorX="center" anchorY="middle" maxWidth={1.9}>
        {perfect
          ? 'Semua komponen terpasang dengan benar!'
          : 'Komponen terpasang tapi ada ketidakcocokan.'}
      </Text>

      {/* Hasil komponen */}
      {['motherboard', 'cpu', 'cooler', 'ram', 'gpu', 'storage', 'psu'].map((cat, i) => (
        <Text key={cat}
          position={[-0.6, 0.3 - i * 0.09, 0.02]}
          fontSize={0.048} color={completedSteps.includes(cat) ? '#4fc' : '#f66'}
          anchorX="left" anchorY="middle">
          {completedSteps.includes(cat) ? '✓' : '✗'} {cat.toUpperCase()}
        </Text>
      ))}

      {/* Issues */}
      {issues.map((issue, i) => (
        <Text key={i} position={[0, -0.5 + i * -0.12, 0.02]}
          fontSize={0.042} color="#f88" anchorX="center" anchorY="middle" maxWidth={1.8}>
          ⚠ {issue.msg}
        </Text>
      ))}

      {/* Tombol ulangi */}
      <group
        position={[0, -0.62, 0.02]}
        onClick={reset}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh ref={(r) => { btnRef.current = r; setBtnGaze(r) }}>
          <boxGeometry args={[0.8, 0.18, 0.02]} />
          <meshStandardMaterial color={hovered ? '#2a6a2a' : '#1a4a1a'}
            emissive={hovered ? '#1a4a1a' : '#0a2a0a'} emissiveIntensity={1} />
        </mesh>
        <Text position={[0, 0, 0.015]} fontSize={0.07} color="#ffffff"
          anchorX="center" anchorY="middle">
          🔄 ULANGI
        </Text>
      </group>

      {/* Gaze hitbox ulangi */}
      <mesh
        ref={(r) => setBtnGaze(r)}
        position={[0, -0.62, 0.02]}
        onClick={reset}
      >
        <boxGeometry args={[0.8, 0.18, 0.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Step Guide (floating panel di scene) ─────────────────────────────────────
function StepGuidePanel() {
  const currentStep = useStore(s => s.currentStep)
  const completedSteps = useStore(s => s.completedSteps)
  const wrongStepMsg = useStore(s => s.wrongStepMsg)
  const steps = [
    { step: 1, cat: 'motherboard', label: 'Motherboard' },
    { step: 2, cat: 'cpu', label: 'CPU' },
    { step: 3, cat: 'cooler', label: 'Cooler (Kipas)' },
    { step: 4, cat: 'ram', label: 'RAM' },
    { step: 5, cat: 'gpu', label: 'GPU' },
    { step: 6, cat: 'storage', label: 'Storage (HDD)' },
    { step: 7, cat: 'psu', label: 'PSU' },
  ]

  return (
    <group position={[2.0, 1.2, -1.0]}>
      {/* Panel */}
      <mesh>
        <boxGeometry args={[1.1, 1.45, 0.015]} />
        <meshStandardMaterial color="#070f1e" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.009]}>
        <boxGeometry args={[1.11, 1.46, 0.005]} />
        <meshBasicMaterial color="#1a3366" wireframe />
      </mesh>

      <Text position={[0, 0.62, 0.015]} fontSize={0.075} color="#4fc"
        anchorX="center" anchorY="middle" fontWeight="bold">
        URUTAN RAKIT
      </Text>

      {steps.map(({ step, cat, label }) => {
        const done = completedSteps.includes(cat)
        const active = step === currentStep && !done
        return (
          <group key={step} position={[0, 0.48 - step * 0.13, 0.015]}>
            {active && (
              <mesh position={[0, 0, -0.005]}>
                <boxGeometry args={[1.04, 0.115, 0.005]} />
                <meshBasicMaterial color="#1a3a6a" transparent opacity={0.8} />
              </mesh>
            )}
            <Text
              position={[-0.48, 0, 0]}
              fontSize={0.055}
              color={done ? '#4fc' : active ? '#7cb9f5' : '#889'}
              anchorX="left" anchorY="middle"
            >
              {done ? '✓' : active ? '▶' : `${step}.`} {label}
            </Text>
          </group>
        )
      })}

      {/* Wrong step warning */}
      {wrongStepMsg && (
        <Text position={[0, -0.62, 0.015]} fontSize={0.04} color="#f88"
          anchorX="center" anchorY="middle" maxWidth={1.0}>
          {wrongStepMsg}
        </Text>
      )}
    </group>
  )
}

// ── HUD Info Panel — tampil saat komponen disorot ─────────────────────────────
function HUDInfoPanel() {
  const showInfo = useStore(s => s.showInfo)
  if (!showInfo) return null

  return (
    <group position={[-1.6, 1.2, -1.0]}>
      <mesh>
        <boxGeometry args={[0.9, 0.8, 0.015]} />
        <meshStandardMaterial color="#070f1e" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.009]}>
        <boxGeometry args={[0.91, 0.81, 0.005]} />
        <meshBasicMaterial color="#2244aa" wireframe />
      </mesh>

      <Text position={[0, 0.3, 0.015]} fontSize={0.06} color="#7cb9f5"
        anchorX="center" anchorY="middle" fontWeight="bold" maxWidth={0.8}>
        {showInfo.icon} {showInfo.name}
      </Text>

      <Text position={[0, 0.12, 0.015]} fontSize={0.04} color="#ddeeff"
        anchorX="center" anchorY="middle" maxWidth={0.8}>
        {showInfo.fungsi}
      </Text>

      {showInfo.fakta?.slice(0, 2).map((f, i) => (
        <Text key={i} position={[0, -0.06 - i * 0.14, 0.015]} fontSize={0.035}
          color="#99aacc" anchorX="center" anchorY="middle" maxWidth={0.8}>
          • {f}
        </Text>
      ))}
    </group>
  )
}

// ── Scene Content ─────────────────────────────────────────────────────────────
function SceneContent({ isVR }) {
  const gamePhase = useStore(s => s.gamePhase)
  const isLowPowerMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  }, [])

  return (
    <>
      <ambientLight intensity={isLowPowerMobile ? 1.4 : 2.0} color="#ffffff" />
      <directionalLight position={[0, 5, 2]} intensity={isLowPowerMobile ? 1.4 : 1.8} />
      <directionalLight position={[-3, 5, 0]} intensity={isLowPowerMobile ? 0.6 : 0.9} color="#c8e8ff" />
      {!isLowPowerMobile && (
        <pointLight position={[0, 2.5, -0.5]} intensity={2.2} color="#ffffff" distance={8} />
      )}

      <LabRoom />

      {gamePhase === 'intro' && <IntroPanel />}

      {gamePhase === 'playing' && (
        <>
          <ComponentShelf position={[-2.0, 0.65, -0.5]} scale={1.4} />
          {/* posisi casing */}
          <group position={[0.0, 0.9, -1.5]} scale={1.4}>
            <CasingTarget />
          </group>
          <StepGuidePanel />
          {isVR && <HUDInfoPanel />}
          <InspectView />
        </>
      )}

      {gamePhase === 'complete' && (
        <>
          <ComponentShelf position={[-2.0, 0.65, -0.5]} scale={1.4} />
          {/* posisi casing */}
          <group position={[0.0, 0.9, -1.5]} scale={1.4}>
            <CasingTarget />
          </group>
          <CompletePanel />
        </>
      )}

      {/* Gaze cursor — aktif di VR */}
      {isVR && <GazeCursor />}
    </>
  )
}

// ── Main Scene ─────────────────────────────────────────────────────────────────
export default function Scene() {
  const isVRMode = useStore(s => s.isVRMode)
  const isVRPreview = useStore(s => s.isVRPreview)
  const setIsVRMode = useStore(s => s.setIsVRMode)
  const isLowPowerMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  }, [])

  const effectiveVR = isVRMode || isVRPreview

  return (
    <Canvas
      shadows={false}
      camera={{ position: [0, 1.6, 1.5], fov: 75 }}
      style={{ background: '#0a0e1a', height: '100%' }}
      gl={{
        antialias: false,
        powerPreference: 'low-power',
        failIfMajorPerformanceCaveat: false,
        alpha: false,
      }}
      dpr={Math.min(window.devicePixelRatio, isLowPowerMobile ? 1.2 : 1.5)}
    >
      <XR
        store={xrStore}
        onSessionStart={() => { setIsVRMode(true) }}
        onSessionEnd={() => { setIsVRMode(false) }}
      >
        <XROrigin position={[0, 0, 0.8]} />
        <SceneContent isVR={effectiveVR} />
      </XR>

      <OrbitControls
        enabled={!effectiveVR}
        enablePan={false}
        minDistance={1.0}
        maxDistance={4}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0.5, -1]}
      />
    </Canvas>
  )
}