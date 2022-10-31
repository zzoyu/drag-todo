<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'

interface Range {
  start: number
  end: number
  color: string
  objective: string
  isDone: boolean
}

const timeUnit = ref(5)
const colSize = ref(6)
const startTime = ref(9)
const endTime = ref(19)
const timeRanges = ref<Array<Range>>([])
const tooltip = ref<HTMLDivElement>()

const rowsPerHour = computed(() => {
  return (
    ((endTime.value - startTime.value) * 60) /
    (colSize.value * timeUnit.value) /
    (endTime.value - startTime.value)
  )
})

const currentTime = ref<number>(0)

const updateTime = () => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  currentTime.value = hours * 60 + minutes
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000 * 60)
})

const calcIndex = (row: number, col: number): number => {
  return (
    startTime.value * 60 +
    (row - 1) * (timeUnit.value * colSize.value) +
    timeUnit.value * (col - 1)
  )
}

const addHour = () => {
  endTime.value += 1
}

const isMouseDown = ref(false)
const startSelect = ref(0)
const endSelect = ref(0)

const startDrag = (index: number) => {
  if (!isMouseDown.value) {
    isMouseDown.value = true
    startSelect.value = index
  }
}
const doDrag = (index: number) => {
  if (isMouseDown.value) {
    endSelect.value = index
  }
}

const generateRandomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16)
  return '#' + randomColor
}

const endDrag = () => {
  if (isMouseDown.value) {
    isMouseDown.value = false
    timeRanges.value.push({
      start: startSelect.value,
      end: endSelect.value,
      color: generateRandomColor(),
      objective: '어쩌구저쩌구',
      isDone: false,
    })
    startSelect.value = 0
    endSelect.value = 0
  }
}

const isMouseHover = ref(false)
const currentTask = ref<Range | null>(null)

const hoverTask = ($event: MouseEvent, index: number) => {
  const target = timeRanges.value.find(
    (range) => range.start <= index && range.end >= index
  )
  if (target) {
    isMouseHover.value = true
    currentTask.value = target
    console.log(target)

    nextTick(() => {
      tooltip.value!.style.top = $event.clientY + 'px'
      tooltip.value!.style.left = $event.clientX + 'px'
    })
  }
}

const unhoverTask = () => {
  isMouseHover.value = false
  currentTask.value = null
}
</script>

<template>
  <div class="wrapper">
    <!-- tooltip -->
    <div
      v-if="isMouseHover"
      ref="tooltip"
      class="tooltip"
      :class="{ done: currentTask?.isDone }"
    >
      {{ currentTask?.objective }}
    </div>

    <!-- <h2>시간표</h2> -->
    <div class="table">
      <div class="row head">
        <div class="time divider">
          <p>시</p>
          <p>분</p>
        </div>
        <div v-for="i in colSize" :key="`label_${i}`" class="time">
          {{ (i - 1) * timeUnit }}
        </div>
      </div>
      <div class="hour-minute">
        <div class="col-hour">
          <div
            v-for="i in Math.ceil(endTime - startTime)"
            :key="`hour_header_${i}`"
            class="hour"
            :style="{ height: `calc(${2 * rowsPerHour}rem + 0.2rem)` }"
          >
            {{ startTime + i - 1 }}
          </div>
        </div>
        <div class="time-grid">
          <div
            v-for="i in Math.ceil(
              ((endTime - startTime) * 60) / (colSize * timeUnit)
            )"
            :key="`row_${i}`"
            class="row"
          >
            <div
              v-for="j in colSize"
              :key="`row_${i}_col_${j}`"
              class="time cell"
              :class="{
                selected:
                  calcIndex(i, j) <= endSelect &&
                  calcIndex(i, j) >= startSelect,
                active:
                  currentTime >= calcIndex(i, j) &&
                  currentTime < calcIndex(i, j) + timeUnit,
                done: timeRanges.find(
                  (range) =>
                    range.start <= calcIndex(i, j) &&
                    range.end >= calcIndex(i, j)
                )?.isDone,
              }"
              :style="{
                backgroundColor: timeRanges.find((range) => {
                  return (
                    calcIndex(i, j) <= range.end &&
                    calcIndex(i, j) >= range.start
                  )
                })?.color,
              }"
              @mousedown="startDrag(calcIndex(i, j))"
              @mousemove="doDrag(calcIndex(i, j))"
              @mouseup="endDrag()"
              @mouseenter="hoverTask($event, calcIndex(i, j))"
              @mouseleave="unhoverTask()"
            ></div>
          </div>
        </div>
      </div>
      <div class="button-add-hour">
        <button @click="addHour">+ 한시간더</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.table {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
}

.row:nth-of-type(even) .cell:nth-of-type(4n + 1),
.row:nth-of-type(even) .cell:nth-of-type(4n + 2),
.row:nth-of-type(odd) .cell:nth-of-type(4n-1),
.row:nth-of-type(odd) .cell:nth-of-type(4n) {
  background: #eee;
}

.hour-minute {
  display: flex;
}

.tooltip {
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
  border: 1px solid #000;
  padding: 0.5rem;
  z-index: 100;
}

.tooltip .done {
  text-decoration: line-through;
}

.time {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  margin: 0.1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ddd;
  cursor: pointer;
}

.head .time,
.head.time {
  background: #ccc;
}

.divider > p {
  margin: 0;
  padding: 0;
  display: inline-block;
  font-size: 0.8rem;
}

.divider > p:nth-of-type(1) {
  margin-bottom: -0.5rem;
}

.divider > p:nth-of-type(2) {
  margin-top: -0.5rem;
}

.col-hour {
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
}

.hour {
  width: 2rem;
  height: 2rem;
  background: #ccc;
  border-radius: 0.5rem;
  margin: 0.1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-add-hour {
  display: flex;
  align-items: center;
}

.button-add-hour button {
  border: none;
  background: none;
  width: 100%;
  height: 3rem;
}

.button-add-hour button:hover {
  cursor: pointer;
  background: #ccc;
  opacity: 0.8;
  border-radius: 0.5rem;
}

.cell.selected {
  background: lightseagreen !important;
}

.cell.active {
  box-shadow: 0 0 0 0.2rem #00f;
}

.cell.done {
  opacity: 0.4;
}
</style>
