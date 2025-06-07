import { defineStore } from 'pinia'

export const sidebar_state = defineStore('sidebar_state', {
  state: () => ({
    state: false,
  }),
  actions: {
    setSidebar(state: boolean) {
      this.state = state
    },
  },
})
