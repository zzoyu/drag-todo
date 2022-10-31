import { defineStore } from "nuxt";

export const useStore = defineStore("tasks", {
  state: () => ({
    tasks: [],
  }),
  actions: {
    addTask(task) {
      this.tasks.push(task);
    },
  },
});
