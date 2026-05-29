import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useStore } from '../store/useStore'
import {
  CPUModel3D, GPUModel3D, MOBOModel3D,
  RAMModel3D, PSUModel3D
} from './Models'

const modelScales = {
  cpu: 0.055,
  motherboard: 0.112,
  ram: 5.9,
  gpu: 0.1,
  psu: 1.65,
}

const modelComponents = {
  cpu: (s) => <CPUModel3D scale={s} rotation={[0, 0, 0]} position={[0, 0, 0]} />,
  motherboard: (s) => <MOBOModel3D scale={s} rotation={[0, 0, 0]} position={[0, 0, 0]} />,
  ram: (s) => <RAMModel3D scale={s} rotation={[0, 0, 0]} position={[0, 0, 0]} />,
  gpu: (s) => <GPUModel3D scale={s} rotation={[Math.PI / 2, 0, 0]} position={[0.0, -0.6, 0]} />, // Menggeser GPU agar lebih ke bawah
  psu: (s) => <PSUModel3D scale={s} rotation={[0, 0, 0]} position={[0, 0, 0]} />,
}

export default function InspectView() {
  const inspecting = useStore(s => s.inspecting)
  const placeComponent = useStore(s => s.placeComponent)
  const cancelInspect = useStore(s => s.cancelInspect)

  const groupRef = useRef()
  const rotYRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const lastXRef = useRef(0)

  useFrame((state, delta) => {
    if (!groupRef.current || !inspecting) return

    groupRef.current.position.y =
      0.1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.015

    if (!isDragging) {
      rotYRef.current += delta * 0.4
    }
    groupRef.current.rotation.y = rotYRef.current
  })

  if (!inspecting) return null

  const { category, component } = inspecting
  const scale = modelScales[category] || 0.015

  return (
    // Posisi tepat di depan user, seperti memegang di tangan
    <group position={[0, 1.4, -0.6]}>

      {/* Background panel info */}
      <group position={[0.7, 0.1, 0]}>
        <mesh>
          <boxGeometry args={[1.1, 0.9, 0.01]} />
          <meshStandardMaterial
            color="#060e1c"
            transparent opacity={0.88}
          />
        </mesh>
        {/* Border biru */}
        <mesh>
          <boxGeometry args={[1.12, 0.92, 0.005]} />
          <meshStandardMaterial color="#2255cc" wireframe />
        </mesh>

        {/* Judul */}
        <Text position={[0, 0.34, 0.02]} fontSize={0.072}
          color="#7cb9f5" anchorX="center" anchorY="middle" fontWeight="bold">
          {component.icon} {component.name}
        </Text>

        {/* Fungsi */}
        <Text position={[0, 0.16, 0.02]} fontSize={0.044}
          color="#ddeeff" anchorX="center" anchorY="middle" maxWidth={1.0}>
          {component.fungsi}
        </Text>

        {/* Fakta */}
        {component.fakta?.map((f, i) => (
          <Text key={i} position={[0, -0.02 - i * 0.14, 0.02]} fontSize={0.036}
            color="#99aacc" anchorX="center" anchorY="middle" maxWidth={1.0}>
            • {f}
          </Text>
        ))}
      </group>

      {/* Model 3D komponen — bisa diputar */}
      <group
        ref={groupRef}
        position={[-0.3, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation()
          setIsDragging(true)
          lastXRef.current = e.clientX || e.touches?.[0]?.clientX || 0
        }}
        onPointerMove={(e) => {
          if (!isDragging) return
          const x = e.clientX || e.touches?.[0]?.clientX || 0
          rotYRef.current += (x - lastXRef.current) * 0.01
          lastXRef.current = x
        }}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={() => setIsDragging(false)}
        onPointerCancel={() => setIsDragging(false)}
      >
        {modelComponents[category]?.(scale)}

        {/* Hint putar */}
        <Text position={[0, -0.28, 0]} fontSize={0.04}
          color="#556677" anchorX="center" anchorY="middle">
          ↔ drag untuk putar
        </Text>
      </group>

      {/* Tombol Pasang — gaze-target juga */}
      <group position={[-0.3, -0.42, 0]}>
        <mesh
          onClick={(e) => { e.stopPropagation(); placeComponent() }}
          onPointerOver={(e) => e.object.material.color.set('#1a5a1a')}
          onPointerOut={(e) => e.object.material.color.set('#0a3a0a')}
          userData={{ gazeTarget: true, onGaze: placeComponent }}
        >
          <boxGeometry args={[0.38, 0.1, 0.02]} />
          <meshStandardMaterial color="#0a3a0a" />
        </mesh>
        <Text position={[0, 0, 0.015]} fontSize={0.048}
          color="#4fc" anchorX="center" anchorY="middle">
          ✓ Pasang ke Casing
        </Text>
      </group>

      {/* Tombol Batal — gaze-target juga */}
      <group position={[0.22, -0.42, 0]}>
        <mesh
          onClick={(e) => { e.stopPropagation(); cancelInspect() }}
          onPointerOver={(e) => e.object.material.color.set('#5a1a1a')}
          onPointerOut={(e) => e.object.material.color.set('#3a0a0a')}
          userData={{ gazeTarget: true, onGaze: cancelInspect }}
        >
          <boxGeometry args={[0.28, 0.1, 0.02]} />
          <meshStandardMaterial color="#3a0a0a" />
        </mesh>
        <Text position={[0, 0, 0.015]} fontSize={0.048}
          color="#f76" anchorX="center" anchorY="middle">
          ✕ Batal
        </Text>
      </group>
    </group>
  )
}