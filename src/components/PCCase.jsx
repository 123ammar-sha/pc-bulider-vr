import React from 'react'

// Komponen casing PC sederhana — digunakan sebagai dekorasi tambahan
export const PCCase = ({ position = [0, 0, 0], scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      {/* Case body */}
      <mesh>
        <boxGeometry args={[2, 4, 1.5]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Case front panel */}
      <mesh position={[0, 0, 0.75]}>
        <boxGeometry args={[1.8, 3.8, 0.1]} />
        <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}
