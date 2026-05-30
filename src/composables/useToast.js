import { reactive } from 'vue'

const toasts = reactive([])
let nextId = 0

export function useToast() {
  function addToast(message, type = 'success', duration = 3000) {
    const id = ++nextId
    toasts.push({ id, message, type })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }

  return { toasts, addToast, removeToast }
}
