import { Text } from '@react-three/drei'

export default function VRInfoPanel({ component }) {
  if (!component) return null
  return (
    <group position={[1.8, 0.6, -1.0]}>
      <mesh>
        <boxGeometry args={[1.4, 1.0, 0.01]} />
        <meshStandardMaterial color="#0a1428" transparent opacity={0.92} />
      </mesh>
      <mesh>
        <boxGeometry args={[1.42, 1.02, 0.005]} />
        <meshStandardMaterial color="#2244aa" wireframe />
      </mesh>
      <Text position={[0, 0.38, 0.02]} fontSize={0.07} color="#7cb9f5" anchorX="center" anchorY="middle">
        {component.icon} {component.name}
      </Text>
      <Text position={[0, 0.2, 0.02]} fontSize={0.042} color="#ccddee" anchorX="center" anchorY="middle" maxWidth={1.2}>
        {component.fungsi}
      </Text>
      <Text position={[0, 0.02, 0.02]} fontSize={0.036} color="#8899aa" anchorX="center" anchorY="middle" maxWidth={1.2}>
        {'• ' + component.fakta?.[0]}
      </Text>
      <Text position={[0, -0.14, 0.02]} fontSize={0.036} color="#8899aa" anchorX="center" anchorY="middle" maxWidth={1.2}>
        {'• ' + component.fakta?.[1]}
      </Text>
      <Text position={[0, -0.3, 0.02]} fontSize={0.036} color="#8899aa" anchorX="center" anchorY="middle" maxWidth={1.2}>
        {'• ' + component.fakta?.[2]}
      </Text>
    </group>
  )
}