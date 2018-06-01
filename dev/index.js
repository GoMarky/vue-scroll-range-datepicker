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
        'Декабрь'
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
        apply: 'Tillämpa',
        cancel: 'Avbryt'
    }
});

// eslint-disable-next-line
new Vue({
    el: '#app',
    render: h => h(App)
});

Vue.config.devtools = true;