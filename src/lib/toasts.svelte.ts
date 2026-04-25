export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  action?: { label: string; fn: () => void }
  duration: number
}

function createToastStore() {
  let toasts = $state<Toast[]>([])

  return {
    get toasts() { return toasts },
    add(t: Omit<Toast, 'id'>) {
      toasts = [...toasts, { ...t, id: crypto.randomUUID() }]
    },
    remove(id: string) {
      toasts = toasts.filter(t => t.id !== id)
    },
  }
}

export const toastStore = createToastStore()

export const notify = {
  info(title: string, message: string, action?: Toast['action'], duration = 5000) {
    toastStore.add({ type: 'info', title, message, action, duration })
  },
  success(title: string, message: string, action?: Toast['action'], duration = 5000) {
    toastStore.add({ type: 'success', title, message, action, duration })
  },
  warning(title: string, message: string, action?: Toast['action'], duration = 5000) {
    toastStore.add({ type: 'warning', title, message, action, duration })
  },
  error(title: string, message: string, action?: Toast['action'], duration = 5000) {
    toastStore.add({ type: 'error', title, message, action, duration })
  },
}
