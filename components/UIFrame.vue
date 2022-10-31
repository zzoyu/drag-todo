<script setup lang="ts">
import TimeTable from './TimeTable.vue'
import TodoListWrapper from './TodoListWrapper.vue'
</script>

<template>
  <div>
    <TimeTable />
    <TodoListWrapper />
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: row;
}
</style>
