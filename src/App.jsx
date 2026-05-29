import { Suspense, useEffect, useState } from 'react'
import Scene, { xrStore } from './components/Scene'
import UI from './components/UI'
import { useStore } from './store/useStore'

const ENABLE_AR_BETA = false

function XRButtons() {
  const [vrSupported, setVrSupported] = useState(false)
  const [xrChecked, setXrChecked] = useState(false)
  const isVRPreview = useStore((s) => s.isVRPreview)
  const setIsVRPreview = useStore((s) => s.setIsVRPreview)

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr')
        .then(supported => setVrSupported(supported))
        .catch(() => setVrSupported(false))
        .finally(() => setXrChecked(true))
    } else {
      setXrChecked(true)
    }
  }, [])

  const btnStyle = (color, borderColor) => ({
    padding: '10px 16px',
    background: 'rgba(8,14,30,0.92)',
    color,
    border: `1px solid ${borderColor}`,
    borderRadius: 10,
    fontSize: 13,
    fontFamily: 'system-ui',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    opacity: 1,
  })

  return (
    <div style={{
      position: 'absolute', top: 16, right: 16,
      zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8,
      paddingTop: 'env(safe-area-inset-top)',
      paddingRight: 'env(safe-area-inset-right)',
    }}>
      <div style={{
        fontSize: 10, color: '#556', textAlign: 'right',
        fontFamily: 'system-ui', marginBottom: 2
      }}>
        WebXR: {!xrChecked ? 'Mengecek...' : vrSupported ? '✅ VR siap' : '❌ Tidak didukung'}
      </div>

      {vrSupported && (
        <button style={btnStyle('#7cb9f5', '#2244aa')} onClick={() => xrStore.enterVR()}>
          🥽 Masuk VR
        </button>
      )}

      {!vrSupported && (
        <button
          style={btnStyle(isVRPreview ? '#4fc' : '#ccd', '#2f6a8a')}
          onClick={() => setIsVRPreview(!isVRPreview)}
        >
          {isVRPreview ? '👁 Keluar Preview VR' : '👁 Preview VR (PC)'}
        </button>
      )}

      {ENABLE_AR_BETA && (
        <button style={btnStyle('#4fc', '#1a5a3a')} onClick={() => xrStore.enterAR()}>
          📷 Masuk AR
        </button>
      )}

      {xrChecked && !vrSupported && (
        <div style={{
          padding: '8px 12px', background: 'rgba(8,14,30,0.92)',
          border: '1px solid #333', borderRadius: 10,
          fontSize: 11, color: '#778', fontFamily: 'system-ui', maxWidth: 180,
          textAlign: 'center', lineHeight: 1.5,
        }}>
          🖥️ Mode Desktop<br/>
          <span style={{ color: '#556', fontSize: 10 }}>
            WebXR belum aktif.<br/>Lihat panduan di bawah.
          </span>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [vrSupported, setVrSupported] = useState(false)

  useEffect(() => {
    if (!navigator.xr) return
    navigator.xr.isSessionSupported('immersive-vr')
      .then(supported => setVrSupported(supported))
      .catch(() => setVrSupported(false))
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Suspense fallback={
        <div style={{
          color: '#7cb9f5', background: '#0a0e1a',
          height: '100vh', display: 'grid', placeItems: 'center',
          fontSize: 14, fontFamily: 'system-ui'
        }}>
          ⏳ Memuat scene 3D...
        </div>
      }>
        <Scene />
      </Suspense>
      <XRButtons />
      <UI vrSupported={vrSupported} />
    </div>
  )
}