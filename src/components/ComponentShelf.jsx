import { useState } from 'react'
import { Text } from '@react-three/drei'
import { useStore } from '../store/useStore'
import { pcComponents } from '../data/components'
import {
  CPUModel3D,
  GPUModel3D,
  MOBOModel3D,
  RAMModel3D,
  PSUModel3D,
  CoolerModel3D,
  StorageModel3D,
} from './Models'

// Konfigurasi scale dan offset per-model supaya pas di slot rak
const shelfModelConfig = {
  cpu: { Component: CPUModel3D, scale: 0.08, position: [0, 0.07, 0.13], rotation: [Math.PI / 2, 0, 0] },
  cooler: { Component: CoolerModel3D, scale: 0.015, position: [0, 0.04, 0.15], rotation: [0, 0, 0] },
  motherboard: { Component: MOBOModel3D, scale: 0.08, position: [0, -0.01, 0.2], rotation: [0, 0, 0] },
  ram: { Component: RAMModel3D, scale: 2.8, position: [0, 0.08, 0.14], rotation: [0, 0, 0] },
  gpu: { Component: GPUModel3D, scale: 0.05, position: [-0.2, 0.03, 0.42], rotation: [0, 0, 0] },
  storage: { Component: StorageModel3D, scale: 0.0758, position: [-0.075, 0.12, 0.15], rotation: [0, Math.PI * 1.32, 0] },
  psu: { Component: PSUModel3D, scale: 1.70, position: [0, 0.02, 0.15], rotation: [0, 0, 0] },
}

// Satu item komponen di rak yang bisa di-grab
function ShelfItem({ component, category, position }) {
  const selected = useStore(s => s.selected)
  const grabComponent = useStore(s => s.grabComponent)
  const inspecting = useStore(s => s.inspecting)
  const [hovered, setHovered] = useState(false)
  const isPlaced = selected[category]?.id === component.id
  const isBeingInspected = inspecting?.component?.id === component.id

  const config = shelfModelConfig[category]
  const ModelComponent = config?.Component

  const handleGrab = () => {
    if (!isPlaced && !isBeingInspected) {
      grabComponent(category, component)
    }
  }

  return (
    <group position={position}>
      {/* Alas slot */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[0.32, 0.02, 0.6]} />
        <meshStandardMaterial
          color={isPlaced ? '#0a2a0a' : '#1a2a3a'}
          emissive={isPlaced ? '#003300' : '#000'}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Model komponen — klik / gaze untuk grab */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          handleGrab()
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered && !isPlaced ? 1.15 : 1.0}
        userData={{
          gazeTarget: !isPlaced && !isBeingInspected,
          onGaze: handleGrab,
        }}
      >
        {/* Invisible hitbox mesh to guarantee 100% reliable raycasting and gaze actions */}
        <mesh position={[0, 0.05, 0.2]}>
          <boxGeometry args={[0.34, 0.32, 0.55]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {ModelComponent ? (
          <ModelComponent
            scale={config.scale}
            position={config.position}
            rotation={config.rotation}
          />
        ) : (
          /* Fallback box jika model belum tersedia */
          <mesh>
            <boxGeometry args={[0.2, 0.15, 0.2]} />
            <meshStandardMaterial color={component.color || '#555'} />
          </mesh>
        )}
      </group>

      {/* Label status */}
      <Text position={[0, 0.26, 0]} fontSize={0.042}
        color={isPlaced ? '#4fc' : isBeingInspected ? '#ffaa00' : hovered ? '#fff' : '#aab'}
        anchorX="center" anchorY="middle" maxWidth={0.4}>
        {isPlaced ? '✓ Terpasang' : isBeingInspected ? '👁 Inspeksi...' : component.name}
      </Text>

      {/* Glow hover */}
      {hovered && !isPlaced && (
        <mesh>
          <boxGeometry args={[0.34, 0.34, 0.62]} />
          <meshBasicMaterial color="#4488ff" wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// Seluruh rak komponen
export default function ComponentShelf({ position = [0, 0, 0], scale = 1.0 }) {
  const selected = useStore(s => s.selected)
  const categories = ['motherboard', 'cpu', 'cooler', 'ram', 'gpu', 'storage', 'psu']

  return (
    <group position={position} scale={scale}>
      {/* Papan rak vertikal */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.45, 2.8, 0.35]} />
        <meshStandardMaterial color="#0d1a2a" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Label rak */}
      <Text
        position={[0, 1.5, 0.2]}
        fontSize={0.07}
        color="#7cb9f5"
        anchorX="center"
      >
        📦 KOMPONEN
      </Text>

      {/* Item komponen berjejer vertikal */}
      {categories.map((cat, i) => {
        const item = selected[cat] || pcComponents[cat][0]
        return (
          <ShelfItem
            key={cat}
            component={item}
            category={cat}
            position={[0, 1.15 - i * 0.38, 0.2]}
          />
        )
      })}
    </group>
  )
}