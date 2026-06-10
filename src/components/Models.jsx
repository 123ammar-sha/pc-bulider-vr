import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'

// Import langsung dari src/assets — Vite akan handle path-nya otomatis
import cpuUrl from '../assets/models/amd_ryzen_7_7800x3d.glb'
import gpuUrl from '../assets/models/gpu.glb'
import moboUrl from '../assets/models/mobo.glb'
import ramUrl from '../assets/models/ram.glb'
import psuUrl from '../assets/models/psu.glb'
import ssdUrl from '../assets/models/ssd.glb'
import mejaUrl from '../assets/models/meja.glb'
import kursiUrl from '../assets/models/kursi.glb'
import coolerUrl from '../assets/models/free_amd_wraith_stealth_cpu_cooler.glb'
import storageUrl from '../assets/models/hard_disk.glb'

// Preload model inti untuk flow beta; model dekorasi dibiarkan lazy-load.
useGLTF.preload(cpuUrl)
useGLTF.preload(gpuUrl)
useGLTF.preload(moboUrl)
useGLTF.preload(ramUrl)
useGLTF.preload(psuUrl)
useGLTF.preload(coolerUrl)
useGLTF.preload(storageUrl)

function Model({ path, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, onClick, onPointerOver, onPointerOut }) {
  const { scene } = useGLTF(path)
  const cloned = useMemo(() => scene.clone(true), [scene])
  return (
    <primitive
      object={cloned}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    />
  )
}

export function CPUModel3D(props) { return <Model path={cpuUrl}   {...props} /> }
export function GPUModel3D(props) { return <Model path={gpuUrl}   {...props} /> }
export function MOBOModel3D(props) { return <Model path={moboUrl}  {...props} /> }
export function RAMModel3D(props) { return <Model path={ramUrl}   {...props} /> }
export function PSUModel3D(props) { return <Model path={psuUrl}   {...props} /> }
export function SSDModel3D(props) { return <Model path={ssdUrl}   {...props} /> }
export function MejaModel3D(props) { return <Model path={mejaUrl}  {...props} /> }
export function KursiModel3D(props) { return <Model path={kursiUrl} {...props} /> }
export function CoolerModel3D(props) { return <Model path={coolerUrl} {...props} /> }
export function StorageModel3D(props) { return <Model path={storageUrl} {...props} /> }