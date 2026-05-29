import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useStore } from '../store/useStore'
import { assemblySteps } from '../data/components'
import {
  CPUModel3D, GPUModel3D, MOBOModel3D,
  RAMModel3D, PSUModel3D
} from './Models'

// Mengubah nilai rotasi pada sumbu X agar motherboard berdiri tegak
const moboMount = {
  pos: [-0.2, -0.05, -0.16],
  rot: [Math.PI / 2, 2 * Math.PI, 0], // Diputar 90 derajat ke kiri dari posisi sebelumnya
  scale: 0.159,
}

const slotConfig = {
  motherboard: {
    pos: moboMount.pos,
    rot: moboMount.rot,
    scale: moboMount.scale,
    slotSize: [0.42, 0.58, 0.06],
  },
  cpu: {
    pos: [moboMount.pos[0] - -0.047, moboMount.pos[1] - -0.13, moboMount.pos[2] + 0.04],
    rot: moboMount.rot,
    scale: 0.0215,
    slotSize: [0.16, 0.16, 0.05],
  },
  ram: {
    pos: [moboMount.pos[0] - -0.215, moboMount.pos[1] - -0.125, moboMount.pos[2] + 0.08],
    rot: moboMount.rot,
    scale: 3.1925,
    slotSize: [0.22, 0.12, 0.05],
  },
  gpu: {
    pos: [0.01, -0.25, 0.27],
    rot: [Math.PI / 2, 0, 0],
    scale: 0.058,
    slotSize: [0.34, 0.10, 0.08],
  },
  psu: {
    pos: [-0.3, 0.45, 0.00],
    rot: [0, Math.PI / 2, 0],
    scale: 2.8775,
    slotSize: [0.30, 0.16, 0.14],
  },
}

const modelMap = {
  cpu: (s, r) => <CPUModel3D scale={s} rotation={[r[0] - Math.PI / 2, r[1], r[2]]} />,

  motherboard: (s, r) => <MOBOModel3D scale={s} rotation={r} />,
  ram: (s, r) => <RAMModel3D scale={s} rotation={[r[0] + Math.PI / 2, r[1], r[2] + Math.PI / 2]} />,

  gpu: (s, r) => <GPUModel3D scale={s} rotation={[r[0] + Math.PI / 2, r[1] + Math.PI, r[2]]} />,

  psu: (s, r) => <PSUModel3D scale={s} rotation={[r[0] + Math.PI, r[1] + Math.PI, r[2]]} />,
}

function AnimatedPlacedComponent({ category, config }) {
  const groupRef = useRef()
  const settledRef = useRef(false)
  const pulseRef = useRef(0)

  useEffect(() => {
    settledRef.current = false
    pulseRef.current = 1
    if (!groupRef.current) return
    groupRef.current.position.set(config.pos[0] + 0.35, config.pos[1] + 0.28, config.pos[2] + 0.26)
    groupRef.current.rotation.set(config.rot[0], config.rot[1] + 0.38, config.rot[2] + 0.22)
    groupRef.current.scale.setScalar(config.scale * 0.45)
  }, [config.pos, config.rot, config.scale, category])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    pulseRef.current = Math.max(0, pulseRef.current - delta * 1.8)

    if (settledRef.current) return
    const t = Math.min(1, delta * 8.5)
    groupRef.current.position.x += (config.pos[0] - groupRef.current.position.x) * t
    groupRef.current.position.y += (config.pos[1] - groupRef.current.position.y) * t
    groupRef.current.position.z += (config.pos[2] - groupRef.current.position.z) * t

    groupRef.current.rotation.x += (config.rot[0] - groupRef.current.rotation.x) * t
    groupRef.current.rotation.y += (config.rot[1] - groupRef.current.rotation.y) * t
    groupRef.current.rotation.z += (config.rot[2] - groupRef.current.rotation.z) * t

    const currentScale = groupRef.current.scale.x
    const nextScale = currentScale + (config.scale - currentScale) * t
    groupRef.current.scale.setScalar(nextScale)

    const donePos =
      Math.abs(groupRef.current.position.x - config.pos[0]) < 0.005 &&
      Math.abs(groupRef.current.position.y - config.pos[1]) < 0.005 &&
      Math.abs(groupRef.current.position.z - config.pos[2]) < 0.005
    const doneRot = Math.abs(groupRef.current.rotation.y - config.rot[1]) < 0.02
    const doneScale = Math.abs(nextScale - config.scale) < 0.001

    if (donePos && doneRot && doneScale) {
      groupRef.current.position.set(config.pos[0], config.pos[1], config.pos[2])
      groupRef.current.rotation.set(config.rot[0], config.rot[1], config.rot[2])
      groupRef.current.scale.setScalar(config.scale)
      settledRef.current = true
    }
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.16, 0.16, 0.02]} />
        <meshBasicMaterial color="#4fc3ff" transparent opacity={pulseRef.current * 0.45} />
      </mesh>
      {modelMap[category]?.(1, [0, 0, 0])}
    </group>
  )
}

function SlotTarget({ category, config }) {
  const currentStep = useStore(s => s.currentStep)
  const inspecting = useStore(s => s.inspecting)
  const placeComponent = useStore(s => s.placeComponent)
  const [hovered, setHovered] = useState(false)
  const stepInfo = assemblySteps.find(s => s.category === category)
  const isNextSlot = stepInfo?.step === currentStep
  const isInspectingThis = inspecting?.category === category

  // Warna slot:
  // hijau = sedang inspecting komponen ini, siap dipasang
  // kuning = ini slot berikutnya
  // merah = belum waktunya
  const slotColor = isInspectingThis
    ? '#00ff88'
    : isNextSlot
      ? '#ffaa00'
      : '#cc2222'

  const handlePlace = () => {
    if (isInspectingThis) placeComponent()
  }

  return (
    <group position={config.pos}>
      {/* Outline slot — gaze target jika bisa dipasang */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handlePlace}
        userData={{
          gazeTarget: isInspectingThis,
          onGaze: handlePlace,
        }}
      >
        <boxGeometry args={config.slotSize || [0.24, 0.24, 0.24]} />
        <meshBasicMaterial
          color={slotColor}
          wireframe
          transparent
          opacity={hovered ? 1.0 : 0.7}
        />
      </mesh>

      {/* Glow di tengah slot */}
      <mesh>
        <boxGeometry args={config.slotSize || [0.20, 0.20, 0.20]} />
        <meshBasicMaterial
          color={slotColor}
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.22, 0]}
        fontSize={0.038}
        color={slotColor}
        anchorX="center"
        anchorY="middle"
      >
        {isInspectingThis
          ? '▼ Tap untuk pasang'
          : isNextSlot
            ? `→ ${category.toUpperCase()}`
            : category.toUpperCase()
        }
      </Text>
    </group>
  )
}

export default function CasingTarget() {
  const selected = useStore(s => s.selected)

  return (
    <group>
      {/* Frame casing terbuka agar interior terlihat jelas */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.12, 0.04, 0.58]} />
        <meshStandardMaterial color="#6f7480" metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[1.12, 0.04, 0.58]} />
        <meshStandardMaterial color="#6f7480" metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh position={[-0.54, 0.05, 0]}>
        <boxGeometry args={[0.04, 1.1, 0.58]} />
        <meshStandardMaterial color="#6f7480" metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh position={[0.54, 0.05, 0]}>
        <boxGeometry args={[0.04, 1.1, 0.58]} />
        <meshStandardMaterial color="#6f7480" metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.05, -0.27]}>
        <boxGeometry args={[1.12, 1.1, 0.04]} />
        <meshStandardMaterial color="#727886" metalness={0.58} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.05, -0.23]}>
        <boxGeometry args={[1.04, 1.02, 0.01]} />
        <meshStandardMaterial color="#252b36" metalness={0.18} roughness={0.82} />
      </mesh>

      {/* Panel kaca samping transparan */}
      <mesh position={[0, 0.05, 0.285]}>
        <boxGeometry args={[1.12, 1.12, 0.02]} />
        <meshStandardMaterial color="#66a6ff" transparent opacity={0.08} />
      </mesh>

      {/* RGB strip bawah */}
      <mesh position={[0, -0.45, 0.2]}>
        <boxGeometry args={[0.8, 0.04, 0.1]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Motherboard tray visual supaya peletakan lebih masuk akal */}
      <mesh position={[moboMount.pos[0], moboMount.pos[1], -0.19]}>
        <boxGeometry args={[0.68, 0.84, 0.02]} />
        <meshStandardMaterial color="#353b47" metalness={0.3} roughness={0.72} />
      </mesh>
      <mesh position={[moboMount.pos[0], 0.52, -0.18]}>
        <boxGeometry args={[0.68, 0.02, 0.10]} />
        <meshStandardMaterial color="#464d5d" metalness={0.42} roughness={0.52} />
      </mesh>
      <mesh position={[0.26, 0.1, -0.19]}>
        <boxGeometry args={[0.28, 0.84, 0.02]} />
        <meshStandardMaterial color="#3b4250" metalness={0.35} roughness={0.67} />
      </mesh>

      {/* PSU shroud bay visual (dihapus atas permintaan pengguna) */}

      {/* Fan mount belakang */}
      <mesh position={[0.48, 0.35, -0.2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.03, 24]} />
        <meshStandardMaterial color="#2f3643" metalness={0.55} roughness={0.42} />
      </mesh>
      <mesh position={[0.48, 0.35, -0.18]}>
        <ringGeometry args={[0.07, 0.11, 24]} />
        <meshBasicMaterial color="#5f6f88" />
      </mesh>

      {/* Visual socket CPU di atas motherboard */}
      <mesh position={[slotConfig.cpu.pos[0], slotConfig.cpu.pos[1] - 0.01, slotConfig.cpu.pos[2] - 0.03]}>
        <boxGeometry args={[0.13, 0.13, 0.01]} />
        <meshStandardMaterial color="#9aa3b3" metalness={0.55} roughness={0.35} />
      </mesh>

      {/* Visual slot RAM di samping CPU (dihapus/dikomentari agar tidak memotong RAM yang sudah terpasang) */}
      {/*
      <mesh position={[slotConfig.ram.pos[0], slotConfig.ram.pos[1] - 0.01, slotConfig.ram.pos[2] - 0.03]}>
        <boxGeometry args={[0.18, 0.035, 0.01]} />
        <meshStandardMaterial color="#6c7588" metalness={0.42} roughness={0.45} />
      </mesh>
      */}

      {/* Slot target atau model terpasang */}
      {assemblySteps.map(({ category }) => {
        const config = slotConfig[category]
        if (!config) return null

        if (selected[category]) {
          // Sudah terpasang — tampilkan model dengan animasi masuk casing
          return (
            <AnimatedPlacedComponent key={category} category={category} config={config} />
          )
        }

        // Belum terpasang — tampilkan slot target
        return (
          <SlotTarget
            key={category}
            category={category}
            config={config}
          />
        )
      })}
    </group>
  )
}