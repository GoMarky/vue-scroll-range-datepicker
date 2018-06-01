<template>
    <div class="app" :class="{'align-right': alignRight}">
        <div v-if="showDatepickers">

            <div class="datepicker-container with-input">
                <h3>Range datepicker with input</h3>
                <div class="datepicker-trigger">
                    <input
                            type="text"
                            id="datepicker-input-trigger"
                            :value="formatDates(inputDateOne, inputDateTwo)"
                            placeholder="Select dates"
                    >

                    <vue-scroll-range-datepicker
                            v-bind:trigger-element-id="'datepicker-input-trigger'"
                            v-bind:mode="'range'"
                            v-bind:date-one="inputDateOne"
                            v-bind:date-two="inputDateTwo"
                            v-bind:months-to-show="3"
                            v-bind:show-action-buttons="true"
                            v-on:date-one-selected="val => { inputDateOne = val }"
                            v-on:date-two-selected="val => { inputDateTwo = val }"
                            v-on:apply="applyMethod"
                            v-on:closed="closedMethod"
                    />
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

    export default {
        data() {
            return {
                dateFormat: 'YYYY-MM-DD', //'D MMM',
                inputDateOne: '',
                inputDateTwo: '',
                inputSingleDateOne: '',
                buttonDateOne: '',
                buttonDateTwo: '',
                inlineDateOne: '',
                sundayDateOne: '',
                sundayFirst: false,
                alignRight: false,
                showDatepickers: true,
                trigger: false
            }
        },
        computed: {},
        created() {
            // setTimeout(() => {
            //   this.inputDateOne = '2019-01-12'
            //   this.inputDateTwo = '2019-01-15'
            // }, 5000)
        },
        methods: {
            formatDates(dateOne, dateTwo) {
                let formattedDates = ''
                if (dateOne) {
                    formattedDates = format(dateOne, this.dateFormat)
                }
                if (dateTwo) {
                    formattedDates += ' - ' + format(dateTwo, this.dateFormat)
                }
                return formattedDates
            },
            toggleAlign() {
                this.alignRight = !this.alignRight
            },
            toggleDatepickers() {
                this.showDatepickers = !this.showDatepickers
            },
            toggleTrigger() {
                this.trigger = !this.trigger
            },
            applyMethod() {
                console.log('apply')
            },
            openedMethod() {
                console.log('opened')
            },
            closedMethod() {
                console.log('closed')
                this.trigger = false
            }
        }
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