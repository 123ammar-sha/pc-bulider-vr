import { create } from 'zustand'
import { assemblySteps } from '../data/components'

const orderedCategories = assemblySteps.map((s) => s.category)

function calcCompletedSteps(selected) {
  return orderedCategories.filter((category) => Boolean(selected[category]))
}

function calcCurrentStep(selected) {
  const firstMissingIndex = orderedCategories.findIndex((category) => !selected[category])
  if (firstMissingIndex === -1) {
    return orderedCategories.length + 1
  }
  return firstMissingIndex + 1
}

function estimateSystemWatt(selected) {
  const cpuWatt = selected.cpu?.tdpWatt ?? 0
  const gpuWatt = selected.gpu?.powerDrawWatt ?? 0
  const ramWatt = selected.ram?.powerDrawWatt ?? 0
  const motherboardWatt = selected.motherboard ? 70 : 0
  const baseHeadroom = 80
  return cpuWatt + gpuWatt + ramWatt + motherboardWatt + baseHeadroom
}

function getCompatibilityIssuesFromSelected(selected) {
  const issues = []

  if (selected.cpu && selected.motherboard && selected.cpu.socket !== selected.motherboard.socket) {
    issues.push({
      msg: `Socket tidak cocok! CPU: ${selected.cpu.socket} vs MB: ${selected.motherboard.socket}`,
      edukasi: 'Socket adalah konektor fisik antara CPU dan motherboard. Keduanya harus sama persis.',
    })
  }

  if (selected.ram && selected.motherboard && selected.ram.ramType && selected.motherboard.ramType) {
    if (selected.ram.ramType !== selected.motherboard.ramType) {
      issues.push({
        msg: `RAM tidak cocok! RAM: ${selected.ram.ramType} vs MB: ${selected.motherboard.ramType}`,
        edukasi: 'Generasi RAM harus didukung motherboard. DDR4 dan DDR5 tidak dapat dipasang silang.',
      })
    }
  }

  if (selected.psu?.wattage) {
    const estimatedNeed = estimateSystemWatt(selected)
    const recommendedMin = Math.ceil(estimatedNeed * 1.2)
    if (selected.psu.wattage < recommendedMin) {
      issues.push({
        msg: `Daya PSU kurang! PSU: ${selected.psu.wattage}W, kebutuhan rekomendasi: ${recommendedMin}W`,
        edukasi: 'Sisakan headroom daya agar sistem stabil saat beban puncak.',
      })
    }
  }

  return issues
}

function deriveProgress(selected) {
  const completedSteps = calcCompletedSteps(selected)
  const currentStep = calcCurrentStep(selected)
  const hasAllCoreParts = orderedCategories.every((category) => Boolean(selected[category]))
  const hasIssues = getCompatibilityIssuesFromSelected(selected).length > 0

  return {
    completedSteps,
    currentStep,
    gamePhase: hasAllCoreParts && !hasIssues ? 'complete' : 'playing',
  }
}

const useStore = create((set, get) => ({
  // ── Game State ──────────────────────────────────────────────────────────────
  gamePhase: 'intro',   // 'intro' | 'playing' | 'complete'
  isVRMode: false,
  isVRPreview: false,

  // ── Component Selection ─────────────────────────────────────────────────────
  selected: {
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    psu: null,
  },
  activeCategory: 'motherboard',
  currentStep: 1,
  completedSteps: [],
  showInfo: null,
  wrongStepMsg: null,
  wrongStepTimeoutId: null,

  // ── Inspect Mode ────────────────────────────────────────────────────────────
  inspecting: null,  // { category, component } or null

  // ── Actions ─────────────────────────────────────────────────────────────────

  startGame: () => set({ gamePhase: 'playing' }),

  setIsVRMode: (isVR) => set({ isVRMode: isVR }),
  setIsVRPreview: (value) => set({ isVRPreview: value }),

  setCategory: (cat) => set({ activeCategory: cat }),

  setShowInfo: (comp) => set({ showInfo: comp }),

  // Ambil komponen dari rak → masuk mode inspecting
  grabComponent: (category, component) => {
    set({
      inspecting: { category, component },
      showInfo: component,
    })
  },

  // Pasang komponen dari inspecting → ke casing
  placeComponent: () => {
    const { inspecting, currentStep, wrongStepTimeoutId } = get()
    if (!inspecting) return

    const { category, component } = inspecting
    const stepForCat = assemblySteps.find(s => s.category === category)
    const isCorrectOrder = stepForCat?.step === currentStep

    if (!isCorrectOrder) {
      const correctStep = assemblySteps.find(s => s.step === currentStep)
      if (wrongStepTimeoutId) {
        clearTimeout(wrongStepTimeoutId)
      }
      const timeoutId = setTimeout(() => set({ wrongStepMsg: null, wrongStepTimeoutId: null }), 3000)
      set({
        wrongStepMsg: `⚠ Urutan salah! Pasang ${correctStep?.label || ''} dulu (Step ${currentStep}).`,
        wrongStepTimeoutId: timeoutId,
      })
      return
    }

    set((state) => {
      const nextSelected = { ...state.selected, [category]: component }
      const progress = deriveProgress(nextSelected)
      return {
        selected: nextSelected,
        inspecting: null,
        showInfo: null,
        wrongStepMsg: null,
        completedSteps: progress.completedSteps,
        currentStep: progress.currentStep,
        gamePhase: progress.gamePhase,
      }
    })
  },

  // Untuk mode desktop: langsung pick dari UI panel
  pickComponent: (category, component) => {
    const { currentStep, wrongStepTimeoutId } = get()
    const stepForCat = assemblySteps.find(s => s.category === category)
    const isCorrectOrder = stepForCat?.step === currentStep

    if (!isCorrectOrder) {
      const correctStep = assemblySteps.find(s => s.step === currentStep)
      if (wrongStepTimeoutId) {
        clearTimeout(wrongStepTimeoutId)
      }
      const timeoutId = setTimeout(() => set({ wrongStepMsg: null, wrongStepTimeoutId: null }), 3000)
      set({
        wrongStepMsg: `⚠ Urutan salah! Pasang ${correctStep?.label || ''} dulu (Step ${currentStep}).`,
        wrongStepTimeoutId: timeoutId,
      })
      return
    }

    set((state) => {
      const nextSelected = { ...state.selected, [category]: component }
      const progress = deriveProgress(nextSelected)
      return {
        selected: nextSelected,
        showInfo: component,
        wrongStepMsg: null,
        completedSteps: progress.completedSteps,
        currentStep: progress.currentStep,
        gamePhase: progress.gamePhase,
      }
    })
  },

  // Batalkan inspect → kembalikan ke rak
  cancelInspect: () => set({ inspecting: null, showInfo: null }),

  removeComponent: (category) => {
    set((state) => {
      const nextSelected = { ...state.selected, [category]: null }
      const progress = deriveProgress(nextSelected)
      return {
        selected: nextSelected,
        completedSteps: progress.completedSteps,
        currentStep: progress.currentStep,
        gamePhase: progress.gamePhase,
      }
    })
  },

  getCompatibilityIssues: () => {
    const { selected } = get()
    return getCompatibilityIssuesFromSelected(selected)
  },

  isComplete: () => {
    const { selected } = get()
    return Object.values(selected).every(Boolean)
  },

  reset: () => {
    const { wrongStepTimeoutId } = get()
    if (wrongStepTimeoutId) {
      clearTimeout(wrongStepTimeoutId)
    }
    set({
      selected: { cpu: null, motherboard: null, ram: null, gpu: null, psu: null },
      activeCategory: 'motherboard',
      currentStep: 1,
      completedSteps: [],
      showInfo: null,
      inspecting: null,
      wrongStepMsg: null,
      wrongStepTimeoutId: null,
      gamePhase: 'intro',
      isVRPreview: false,
    })
  },
}))

// Re-export agar kompatibel dengan komponen yang pakai useStore
export { useStore }
export default useStore