import Vue from 'vue'
import App from './App.vue'
import VueScrollRangeDatepicker from './../src/index'

Vue.use(VueScrollRangeDatepicker, {
  sundayFirst: false,
  days: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
  daysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  monthNames: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  colors: {
    selected: '#e2f5f7',
    inRange: '#e2f5f7',
    selectedText: '#fff',
    text: '#565a5c',
    inRangeBorder: 'e2f5f7',
    disabled: '#fff',
  },
  texts: {
    apply: 'Применить',
    cancel: 'Отменить',
  },
})

// eslint-disable-next-line
new Vue({
  el: '#app',
  render: h => h(App),
})

Vue.config.devtools = true
