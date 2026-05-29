import { Text } from '@react-three/drei'
import { MejaModel3D, KursiModel3D } from './Models'

// Dinding tunggal
function Wall({ position, rotation, size, color = '#1a2235' }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  )
}

// Lampu neon di langit-langit
function NeonLight({ position, color = '#ffffff' }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.06, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      <pointLight color={color} intensity={3.0} distance={8} decay={1} />
    </group>
  )
}

// Rak dinding untuk pajangan komponen
function WallShelf({ position }) {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[1.8, 0.04, 0.3]} />
        <meshStandardMaterial color="#1a2530" metalness={0.5} roughness={0.5} />
      </mesh>
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={i} position={[x, -0.1, -0.1]}>
          <boxGeometry args={[0.04, 0.2, 0.3]} />
          <meshStandardMaterial color="#111" metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// Poster edukasi di dinding
function Poster({ position, rotation, title, lines = [] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.9, 1.2, 0.01]} />
        <meshStandardMaterial color="#0a1428" />
      </mesh>
      <mesh position={[0, 0, 0.006]}>
        <boxGeometry args={[0.92, 1.22, 0.005]} />
        <meshStandardMaterial color="#2244aa" wireframe />
      </mesh>
      <Text position={[0, 0.48, 0.015]} fontSize={0.07} color="#7cb9f5"
        anchorX="center" anchorY="middle" maxWidth={0.8} fontWeight="bold">
        {title}
      </Text>
      {lines.map((line, i) => (
        <Text key={i} position={[0, 0.28 - i * 0.18, 0.015]}
          fontSize={0.048} color="#aabbcc" anchorX="center" anchorY="middle" maxWidth={0.78}>
          {line}
        </Text>
      ))}
    </group>
  )
}

// Indikator langkah / panduan di dinding
function StepBoard({ position, rotation }) {
  const steps = [
    '1️⃣  Pasang Motherboard',
    '2️⃣  Pasang CPU',
    '3️⃣  Pasang RAM',
    '4️⃣  Pasang GPU',
    '5️⃣  Pasang PSU',
  ]
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[1.4, 1.6, 0.02]} />
        <meshStandardMaterial color="#071020" />
      </mesh>
      <Text position={[0, 0.65, 0.02]} fontSize={0.09} color="#4fc"
        anchorX="center" anchorY="middle" fontWeight="bold">
        URUTAN RAKIT
      </Text>
      {steps.map((s, i) => (
        <Text key={i} position={[0, 0.42 - i * 0.25, 0.02]}
          fontSize={0.06} color="#ccd" anchorX="center" anchorY="middle" maxWidth={1.2}>
          {s}
        </Text>
      ))}
    </group>
  )
}

export default function LabRoom() {
  return (
    <group>
      {/* ── LANTAI ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#0d1520" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Grid lantai */}
      <gridHelper args={[12, 24, '#1a2a3a', '#131d2a']} position={[0, -1.19, 0]} />

      {/* ── LANGIT-LANGIT ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#080e18" roughness={1} />
      </mesh>

      {/* ── DINDING ── */}
      <Wall position={[0, 1.2, -5]} rotation={[0, 0, 0]} size={[12, 5, 0.15]} color="#111a28" />
      <Wall position={[-6, 1.2, 0]} rotation={[0, Math.PI / 2, 0]} size={[10, 5, 0.15]} color="#0f1822" />
      <Wall position={[6, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]} size={[10, 5, 0.15]} color="#0f1822" />

      {/* ── LAMPU NEON ── */}
      <NeonLight position={[-2.5, 3.3, -2]} color="#c8e8ff" />
      <NeonLight position={[2.5, 3.3, -2]} color="#c8e8ff" />
      <NeonLight position={[0, 3.3, 1]} color="#c8e8ff" />
      <NeonLight position={[-4, 2, -4.8]} color="#0044ff" />
      <NeonLight position={[4, 2, -4.8]} color="#0044ff" />

      {/* ── MEJA UTAMA — pakai GLB ── */}
      {/* position Y disesuaikan agar permukaan meja setinggi -0.54 (diperbesar 50% dari scale 0.9 ke 1.35) */}
      <MejaModel3D
        position={[0, -1.2, -1.8]}
        rotation={[0, -1.6, 0]}
        scale={1.35}
      />

      {/* ── KURSI — pakai GLB ── */}
      {/* Kursi di meja utama */}
      <KursiModel3D
        position={[-0.1, -1.2, -0.2]}
        rotation={[0, Math.PI, 0]}
        scale={0.85}
      />

      {/* ── RAK DINDING ── */}
      <WallShelf position={[4.5, 0.5, -4.8]} />
      <WallShelf position={[4.5, 1.2, -4.8]} />
      <WallShelf position={[-4.5, 0.5, -4.8]} />

      {/* ── POSTER EDUKASI ── */}
      <Poster
        position={[-4, 1.2, -4.85]}
        rotation={[0, 0, 0]}
        title="APA ITU CPU?"
        lines={[
          'Central Processing Unit',
          'Otak utama komputer',
          'Proses semua instruksi',
          'Socket harus cocok MB',
        ]}
      />
      <Poster
        position={[4, 1.2, -4.85]}
        rotation={[0, 0, 0]}
        title="APA ITU GPU?"
        lines={[
          'Graphics Processing Unit',
          'Olah tampilan & grafis',
          'Dipasang di slot PCIe',
          'Butuh daya dari PSU',
        ]}
      />

      {/* ── PAPAN LANGKAH RAKIT ── */}
      <StepBoard position={[0, 1.5, -4.85]} rotation={[0, 0, 0]} />

      {/* ── AKSEN RGB LANTAI ── */}
      {[-3, 0, 3].map((x, i) => (
        <mesh key={i} position={[x, -1.18, -1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, 8]} />
          <meshStandardMaterial
            color="#0044ff"
            emissive="#0044ff"
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}