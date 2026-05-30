import { ref } from 'vue'

const isDark = ref(false)

export function useTheme() {
  function init() {
    const saved = localStorage.getItem('coverWaveTheme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    apply()
  }

  function toggle() {
    isDark.value = !isDark.value
    apply()
    localStorage.setItem('coverWaveTheme', isDark.value ? 'dark' : 'light')
  }

  function apply() {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  return { isDark, init, toggle }
}
