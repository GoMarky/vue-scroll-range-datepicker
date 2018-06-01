# Vue-Scroll-Range-Datepicker beta

# Introduction

This calendar was forked from https://github.com/MikaelEdebro/vue-airbnb-style-datepicker . Thanks Mikael so much for that awesome package. 
IMPORTANT! At the current time, this datepicker can't be used in production. He is tested, and can not be used in your code. You can use it, on your own risk.

# Demo

The demo page is coming soon.

# Requirements

- [Vue.js](https://github.com/yyx990803/vue) `^2.0.0`

# Installation

## npm

```shell
$ npm i vue-scroll-range-datepicker
```

# Usage

```html
<script>

// for Vue 2.0
import VueScrollRangeDatepicker from 'vue-scroll-range-datepicker'
import 'vue-scroll-range-datepicker/dist/styles.css'

// see docs for available options
const datepickerOptions = {
                            sundayFirst: false,
                            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                            daysShort: ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'],
                            monthNames: [
                              'January',
                              'February',
                              'March',
                              'April',
                              'May',
                              'June',
                              'July',
                              'August',
                              'September',
                              'October',
                              'November',
                              'December'
                            ],
                            colors: {
                              selected: '#00a699',
                              inRange: '#66e2da',
                              selectedText: '#fff',
                              text: '#565a5c',
                              inRangeBorder: '#33dacd',
                              disabled: '#fff'
                            },
                            texts: {
                              apply: 'apply',
                              cancel: 'cancel'
                            };

// make sure we can use it in our components
Vue.use(vueScrollRangeDatepicker, datepickerOptions);

</script>
<template>
  <div>
     <div class="datepicker-trigger">
       <input
         type="text"
         id="datepicker-trigger"
         placeholder="Select dates"
         :value="formatDates(dateOne, dateTwo)"
       >
 
       <VueScrollRangeDatepicker
         :trigger-element-id="'datepicker-trigger'"
         :mode="'range'"
         :fullscreen-mobile="true"
         :date-one="dateOne"
         :date-two="dateTwo"
         @date-one-selected="val => { dateOne = val }"
         @date-two-selected="val => { dateTwo = val }"
       />
     </div>
   </div>
</template>
```

# API

# License

[The MIT License](http://opensource.org/licenses/MIT)

