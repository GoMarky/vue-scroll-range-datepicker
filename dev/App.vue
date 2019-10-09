<template>
  <div class="app" :class="{'align-right': alignRight}">
    <div v-if="showDatepickers">

      <div class="datepicker-container with-input">
        <h3>Range datepicker with input</h3>
        <div class="datepicker-trigger">
          <input
            type="text"
            id="datepicker-input-trigger"
            readonly
            :value="formatDates(inputDateOne, inputDateTwo)"
            placeholder="Select dates"
          >

          <vue-scroll-range-datepicker
            :trigger-element-id="'datepicker-input-trigger'"
            :mode="'range'"
            :date-one="inputDateOne"
            :date-two="inputDateTwo"
            :months-to-show="3"
            :show-action-buttons="true"
            :dateFormat="dateFormat"
            :endYearForRange="new Date()"
            @date-one-selected="val => { inputDateOne = val }"
            @date-two-selected="val => { inputDateTwo = val }"
            @apply="applyMethod"
            @closed="closedMethod"
            ></vue-scroll-range-datepicker>
        </div>
      </div>
    </div>

    <button @click="toggleDatepickers">Hide datepickers</button>
    <button @click="toggleAlign">Toggle alignment</button>
    <button @click="toggleTrigger">Toggle trigger</button>
  </div>
</template>

<script>
import format from 'date-fns/format'
import { reverseDate } from '../src/helpers'

export default {
  data () {
    return {
      dateFormat: 'YYYY.MM.DD',
      inputDateOne: '02.02.2016',
      inputDateTwo: '02.04.2016',
      inputSingleDateOne: '',
      buttonDateOne: '',
      buttonDateTwo: '',
      inlineDateOne: '',
      sundayDateOne: '',
      sundayFirst: false,
      alignRight: false,
      showDatepickers: true,
      trigger: false,
      preventWrite: false,
    }
  },
  methods: {
    formatDates (dateOne, dateTwo) {
      let formattedDates = ''
      if (dateOne) {
        formattedDates = reverseDate(format(dateOne, this.dateFormat))
      }
      if (dateTwo) {
        formattedDates += ' - ' + reverseDate(format(dateTwo, this.dateFormat))
      }
      return formattedDates
    },
    toggleAlign () {
      this.alignRight = !this.alignRight
    },
    toggleDatepickers () {
      this.showDatepickers = !this.showDatepickers
    },
    toggleTrigger () {
      this.trigger = !this.trigger
    },
    applyMethod () {
    },
    openedMethod () {
    },
    closedMethod () {
      this.trigger = false
      this.preventWrite = false
    },
  },
}
</script>

<style lang="scss">
  html,
  body {
    min-height: 200vh;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    line-height: 18px;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    padding: 10px;
  }

  .app {
    &.align-right {
      text-align: right;
    }
  }

  h1 {
    font-size: 1.8em;
    line-height: 1.5em;
  }

  .datepicker-container {
    margin-bottom: 30px;
  }

  #datepicker-button-trigger {
    background: #008489;
    border: 1px solid #008489;
    color: white;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 15px;
    font-weight: bold;
    text-align: center;
    min-width: 200px;
  }

  input {
    padding: 6px 10px;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  .with-input {
    .datepicker-trigger {
      //padding-right: 40px;
    }
  }

  .with-button {
    .datepicker-trigger {
      //padding-left: 10px;
    }
  }

  // .inline-with-input {
  //   width: 600px;
  //   input {
  //     width: 100%;
  //   }
  // }
</style>
