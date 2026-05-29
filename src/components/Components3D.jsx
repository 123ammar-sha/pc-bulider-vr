import {
  CPUModel3D,
  GPUModel3D,
  MOBOModel3D,
  RAMModel3D,
  PSUModel3D,
} from './Models'

function PartMesh({ position, scale, children }) {
  return (
    <group position={position} scale={scale}>
      {children}
    </group>
  )
}

export function CPUModel({ onClick, onPointerOver, onPointerOut }) {
  return (
    <PartMesh position={[-0.3, 0.6, 0.1]} scale={0.18}>
      <CPUModel3D
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    </PartMesh>
  )
}

export function MotherboardModel({ onClick, onPointerOver, onPointerOut }) {
  return (
    <PartMesh position={[-0.45, 0, 0]} scale={0.22}>
      <MOBOModel3D
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    </PartMesh>
  )
}

export function RAMModel({ onClick, onPointerOver, onPointerOut }) {
  return (
    <PartMesh position={[0.15, 0.35, 0.12]} scale={0.18}>
      <RAMModel3D
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    </PartMesh>
  )
}

export function GPUModel({ onClick, onPointerOver, onPointerOut }) {
  return (
    <PartMesh position={[-0.3, -0.2, 0.15]} scale={0.22}>
      <GPUModel3D
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    </PartMesh>
  )
}

export function PSUModel({ onClick, onPointerOver, onPointerOut }) {
  return (
    <PartMesh position={[-0.3, -0.75, 0]} scale={0.2}>
      <PSUModel3D
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    </PartMesh>
  )
}