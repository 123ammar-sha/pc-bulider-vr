import { useStore } from '../store/useStore'
import { pcComponents, assemblySteps } from '../data/components'
import { xrStore } from './Scene'

const labels = {
  cpu: 'CPU', motherboard: 'Motherboard', cooler: 'Cooler', ram: 'RAM', gpu: 'GPU', storage: 'Storage', psu: 'PSU'
}

export default function UI({ vrSupported = false }) {
  const activeCategory = useStore(s => s.activeCategory)
  const selected = useStore(s => s.selected)
  const currentStep = useStore(s => s.currentStep)
  const completedSteps = useStore(s => s.completedSteps)
  const isVRMode = useStore(s => s.isVRMode)
  const gamePhase = useStore(s => s.gamePhase)
  const wrongStepMsg = useStore(s => s.wrongStepMsg)

  const setCategory = useStore(s => s.setCategory)
  const pickComponent = useStore(s => s.pickComponent)
  const removeComponent = useStore(s => s.removeComponent)
  const getCompatibilityIssues = useStore(s => s.getCompatibilityIssues)
  const reset = useStore(s => s.reset)

  const issues = getCompatibilityIssues()
  const items  = pcComponents[activeCategory] || []

  if (isVRMode) {
    return (
      <button
        onClick={() => xrStore.exitVR?.()}
        style={{
          position: 'absolute', bottom: 16, left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 22px',
          background: 'rgba(10,20,50,0.85)',
          border: '1px solid #2244aa',
          borderRadius: 8, color: '#7cb9f5',
          fontSize: 12, cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          zIndex: 100,
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        Keluar VR
      </button>
    )
  }

  if (gamePhase === 'intro') {
    return (
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(8,12,22,0.92)',
        borderTop: '1px solid #1a2a4a',
        padding: '14px 16px calc(14px + env(safe-area-inset-bottom))',
        fontFamily: 'system-ui, sans-serif',
        color: '#7cb9f5',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 1.45,
      }}>
        {vrSupported ? (
          <>🥽 Pakai headset Google Cardboard lalu tekan <strong>Masuk VR</strong> di kanan atas. Anda juga bisa lanjut di mode layar sentuh/desktop.</>
        ) : (
          <>🖥️ Perangkat ini belum mendukung WebXR VR. Lanjutkan simulasi penuh di mode layar sentuh/desktop.</>
        )}
      </div>
    )
  }

  return (
    <>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(8,12,22,0.97)',
        borderTop: '1px solid #1a2a4a',
        fontFamily: 'system-ui, sans-serif',
        color: '#fff',
        maxHeight: '52vh',
        overflowY: 'auto',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>

        {/* Wrong step warning */}
        {wrongStepMsg && (
          <div style={{
            margin: '6px 12px 0', padding: '8px 12px',
            background: '#2a1008', borderRadius: 8,
            border: '1px solid #a43', fontSize: 11, color: '#f88',
          }}>
            {wrongStepMsg}
          </div>
        )}

        {/* Progress steps */}
        <div style={{ padding: '8px 12px 4px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {assemblySteps.map((s) => {
            const done   = completedSteps.includes(s.category)
            const active = s.step === currentStep
            return (
              <div key={s.step} onClick={() => setCategory(s.category)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  minWidth: 62, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                  background: done ? '#0a2a1a' : active ? '#0e1e3a' : '#0d1220',
                  border: done ? '1px solid #2a8' : active ? '1px solid #4488ff' : '1px solid #222',
                  flexShrink: 0,
                }}>
                <div style={{ fontSize: 15 }}>{done ? '✅' : active ? '▶' : '○'}</div>
                <div style={{ fontSize: 9, color: done ? '#4fc' : active ? '#7cb9f5' : '#556', marginTop: 2, textAlign: 'center' }}>
                  {labels[s.category]}
                </div>
              </div>
            )
          })}
        </div>

        {/* Step guide */}
        {gamePhase === 'playing' && currentStep <= 7 && (
          <div style={{ margin: '4px 12px 0', padding: '8px 12px', background: '#070f1e', borderRadius: 8, fontSize: 11, color: '#7cb9f5' }}>
            📋 <strong>Step {currentStep}:</strong> {assemblySteps.find(s => s.step === currentStep)?.desc}
          </div>
        )}

        {/* Complete */}
        {gamePhase === 'complete' && (
          <div style={{ margin: '4px 12px', padding: '10px 14px', background: '#0a2a0a', borderRadius: 8, border: '1px solid #2a8' }}>
            <div style={{ fontSize: 13, color: '#4fc', fontWeight: 700 }}>🎉 PC berhasil dirakit!</div>
            <button onClick={reset} style={{
              marginTop: 8, padding: '6px 16px', borderRadius: 6, border: 'none',
              background: '#1a5', color: '#fff', fontSize: 12, cursor: 'pointer',
            }}>🔄 Ulangi</button>
          </div>
        )}

        {/* Compatibility issues */}
        {issues.map((issue, i) => (
          <div key={i} style={{ margin: '4px 12px', padding: '8px 12px', background: '#2a0a0a', borderRadius: 8, border: '1px solid #a22' }}>
            <div style={{ fontSize: 11, color: '#f76' }}>⚠ {issue.msg}</div>
            <div style={{ fontSize: 10, color: '#a88', marginTop: 4 }}>💡 {issue.edukasi}</div>
          </div>
        ))}

        {/* Tab kategori */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1a2a3a', marginTop: 6 }}>
          {assemblySteps.map(({ category }) => (
            <button key={category} onClick={() => setCategory(category)} style={{
              flex: 1, padding: '10px 2px', fontSize: 11, border: 'none',
              background: activeCategory === category ? '#0e1e3a' : 'transparent',
              color: activeCategory === category ? '#7cb9f5' : '#556',
              borderBottom: activeCategory === category ? '2px solid #4488ff' : '2px solid transparent',
              cursor: 'pointer',
            }}>
              {labels[category]}
              {selected[category] && <span style={{ color: '#4fc', marginLeft: 2 }}>✓</span>}
            </button>
          ))}
        </div>

        {/* List komponen */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 12px', overflowX: 'auto' }}>
          {items.map((item) => {
            const isSelected = selected[activeCategory]?.id === item.id
            return (
              <div key={item.id}
                onClick={() => isSelected ? removeComponent(activeCategory) : pickComponent(activeCategory, item)}
                style={{
                  minWidth: 140, padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  border: isSelected ? '1.5px solid #4488ff' : '1px solid #1a2a3a',
                  background: isSelected ? '#0e1e3a' : '#0a1220',
                  flexShrink: 0,
                }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#7cb9f5' : '#ccd' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 10, color: '#778', marginTop: 4, lineHeight: 1.4 }}>
                  {item.fungsi.slice(0, 55)}...
                </div>
                <div style={{ fontSize: 10, color: '#4fc', marginTop: 6 }}>
                  {isSelected ? '✓ Terpasang — tap untuk lepas' : 'Tap untuk pasang'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}