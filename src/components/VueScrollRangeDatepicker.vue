<template>
    <transition name="asd__fade">
        <div
                :id="wrapperId"
                class="asd__wrapper"
                v-show="showDatepicker"
                :class="wrapperClasses"
                :style="showFullscreen ? undefined : wrapperStyles"
                v-click-outside="handleClickOutside"
        >
            <button type="button" class="asd__close-icon close-icon" @click="closeDatepickerCancel"></button>
            <div class="asd__mobile-header asd__mobile-only" v-if="showFullscreen">
                <div class="asd__mobile-close" @click="closeDatepicker">
                    <div class="asd__mobile-close-icon">X</div>
                </div>
                <h3>{{ mobileHeader }}</h3>
            </div>
            <div class="asd__datepicker-header">
                <div class="asd__time-header">
                    <div class="asd__time-list">
                        <button
                                class="asd__time-button" type="button"
                                v-on:click="setFixedDate('week')">
                            Неделя
                        </button>
                        <button class="asd__time-button"
                                type="button"
                                v-on:click="setFixedDate('month')">
                            Месяц
                        </button>
                        <button class="asd__time-button"
                                type="button"
                                v-on:click="setFixedDate('quarter')">
                            Квартал
                        </button>
                        <button class="asd__time-button"
                                type="button"
                                v-on:click="setFixedDate('year')">
                            Год
                        </button>
                    </div>
                    <div class="asd__time-current-inputs">
                        <div class="asd__time-input-wrapper">
                            <input class="asd__time-input" type="text" name="time" id="start-time" v-model="dateFrom"
                                   v-on:keyup.enter="setDateFromText(dateFrom)" autocomplete="off">
                        </div>
                        <span> - </span>
                        <div class="asd__time-input-wrapper">
                            <input class="asd__time-input" type="text" name="time" id="end-time" v-model="dateTo"
                                   v-on:keyup.enter="setDateFromText(dateTo)" autocomplete="off">
                        </div>
                    </div>
                </div>
                <div class="asd__timebar">
                    <div class="asd__timebar-scroll"
                         v-on:mousedown="toggleScroll"
                         v-bind:style="scrollStyles"
                         ref="timebarScroll"
                    >
                    </div>
                    <div class="asd__timebar-monthes" ref="timebarWrapper">
                        <div class="asd__timebar-progress" v-bind:style="timebarStyles" ref="timebarProgress">
                            <div class="asd__timebar-progress-current" v-bind:style="currentTimebarStyles"
                                 ref="currentProgressBar">
                            </div>
                            <span v-for="(year, index) in currentYears"
                                  :key="index"
                                  v-bind:style="{left: year.posLeft}"
                                  v-on:click="selectDate(year.fullDate, true, year.posLeft)"
                                  v-bind:data-year="year.item"
                            >{{ year.item }}</span>
                        </div>
                    </div>
                </div>
                <div class="asd__change-month-button asd__change-month-button--previous">
                    <button @click="previousMonth" type="button">
                        <svg viewBox="0 0 1000 1000">
                            <path
                                    d="M336.2 274.5l-210.1 210h805.4c13 0 23 10 23 23s-10 23-23 23H126.1l210.1 210.1c11 11 11 21 0 32-5 5-10 7-16 7s-11-2-16-7l-249.1-249c-11-11-11-21 0-32l249.1-249.1c21-21.1 53 10.9 32 32z"/>
                        </svg>
                    </button>
                </div>
                <div class="asd__change-month-button asd__change-month-button--next">
                    <button @click="nextMonth" type="button">
                        <svg viewBox="0 0 1000 1000">
                            <path
                                    d="M694.4 242.4l249.1 249.1c11 11 11 21 0 32L694.4 772.7c-5 5-10 7-16 7s-11-2-16-7c-11-11-11-21 0-32l210.1-210.1H67.1c-13 0-23-10-23-23s10-23 23-23h805.4L662.4 274.5c-21-21.1 11-53.1 32-32.1z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="asd__days-legend-wrapper">
                <div
                        class="asd__days-legend"
                        v-for="(month, index) in showMonths"
                        :key="month"
                        :style="[monthWidthStyles, {left: (width * index) + 'px'}]"
                >
                    <div class="asd__day-title" v-for="day in daysShort" :key="day">{{ day }}</div>
                </div>
            </div>
            <div class="asd__inner-wrapper" :style="innerStyles">
                <div
                        v-for="(month, monthIndex) in months"
                        :key="month.firstDateOfMonth"
                        class="asd__month"
                        :class="{hidden: monthIndex === 0 || monthIndex > showMonths}"
                        :style="monthWidthStyles"
                >
                    <div class="asd__month-name">{{ month.monthName }} {{ month.year }}</div>

                    <table class="asd__month-table" role="presentation">
                        <tbody>
                        <tr class="asd__week" v-for="(week, index) in month.weeks" :key="index">
                            <td
                                    class="asd__day"
                                    v-for="({fullDate, dayNumber}, index) in week"
                                    :key="index + '_' + dayNumber"
                                    :data-date="fullDate"
                                    :class="{
                      'asd__day--enabled': dayNumber !== 0,
                      'asd__day--empty': dayNumber === 0,
                      'asd__day--disabled': isDisabled(fullDate),
                      'asd__day--selected': selectedDate1 === fullDate || selectedDate2 === fullDate,
                      'asd__day--in-range': isInRange(fullDate)
                    }"
                                    :style="getDayStyles(fullDate)"
                                    @mouseover="() => { setHoverDate(fullDate) }"
                            >
                                <button
                                        type="button"
                                        class="asd__day-button"
                                        v-if="dayNumber"
                                        :date="fullDate"
                                        :disabled="isDisabled(fullDate)"
                                        v-on:click="selectDate(fullDate)"
                                        v-bind:class="{ 'asd__day-button_weekend' : isWeekendDay(fullDate, dayNumber) }"
                                >{{ dayNumber }}
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="asd__action-buttons" v-if="mode !== 'single' && showActionButtons">
                <button type="button" @click="apply">{{ texts.apply }}</button>
            </div>
        </div>
    </transition>
</template>

<script>
    import format from 'date-fns/format'
    import subMonths from 'date-fns/sub_months'
    import addMonths from 'date-fns/add_months'
    import getDaysInMonth from 'date-fns/get_days_in_month'
    import isBefore from 'date-fns/is_before'
    import isAfter from 'date-fns/is_after'
    import isValid from 'date-fns/is_valid'
    import {debounce, copyObject, findAncestor, randomString, isWeekend, reverseDate, inRange} from './../helpers'

    export default {
        name: 'vueScrollRangeDatepicker',
        props: {
            triggerElementId: {type: String},
            dateOne: {type: [String, Date], default: format(new Date())},
            dateTwo: {type: [String, Date]},
            minDate: {type: [String, Date]},
            endDate: {type: [String, Date]},
            mode: {type: String, default: 'range'},
            offsetY: {type: Number, default: 0},
            offsetX: {type: Number, default: 0},
            monthsToShow: {type: Number, default: 2},
            startOpen: {type: Boolean},
            fullscreenMobile: {type: Boolean},
            inline: {type: Boolean},
            mobileHeader: {type: String, default: 'Select date'},
            disabledDates: {type: Array, default: () => []},
            showActionButtons: {type: Boolean, default: true},
            isTest: {
                type: Boolean,
                default: () => process.env.NODE_ENV === 'test'
            },
            dateFormat: {
                type: String,
                required: false,
                default: `DD.MM.YYYY`
            }
        },
        data() {
            return {
                dateTo: '',
                dateFrom: '',
                wrapperId: 'airbnb-style-datepicker-wrapper-' + randomString(5),
                showDatepicker: false,
                showMonths: 2,
                colors: {
                    selected: '#00a699',
                    inRange: '#66e2da',
                    selectedText: '#fff',
                    text: '#565a5c',
                    inRangeBorder: '#33dacd',
                    disabled: '#fff'
                },
                sundayFirst: false,
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
                days: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
                ],
                daysShort: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
                texts: {apply: 'Apply', cancel: 'Cancel'},
                startingDate: '',
                months: [],
                width: 250,
                selectedDate1: '',
                selectedDate2: '',
                isSelectingDate1: true,
                hoverDate: '',
                alignRight: false,
                triggerPosition: {},
                triggerWrapperPosition: {},
                viewportWidth: window.innerWidth + 'px',
                isMobile: window.innerWidth < 768,
                isTablet: window.innerWidth >= 768 && window.innerWidth <= 1024,
                triggerElement: undefined,
                currentPointScroll: 0,
                currentTimebarWidth: 0,
                currentTimebarLeftPos: 0,
                currentTimebarStart: 0,
                currentTimebarEnd: 0,
                timebarPosLeft: 0,
                isFirstLoaded: true,
                parentToggleScrollWidth: 0
            }
        },
        computed: {
            currentProgress() {
                return this.currentTimebarEnd - this.currentTimebarStart;
            },
            currentYears() {
                let currentDate = new Date();
                let currentYear = currentDate.getFullYear() + 1;
                let currentYears = [];

                for (let i = 15; i >= 0; i--) {
                    currentYear--;

                    currentYears.push({
                        item: currentYear,
                        fullDate: `${currentYear}.01.01`,
                        posLeft: `${120 * i}px`,
                        leftCoords: 120 * i
                    });
                }

                return currentYears.reverse();
            },
            currentTimebarStyles() {
                return {
                    width: `${this.currentTimebarWidth}px`,
                    left: `${this.currentTimebarLeftPos}px`
                }
            },
            timebarStyles: {
                get() {
                    let timebarWidth = 0;

                    for (let i = 0; i < this.currentYears.length - 1; i++) {
                        timebarWidth += 120;
                    }

                    return {
                        width: `${timebarWidth}px`
                    }
                }
            },
            scrollStyles() {
                return {
                    left: `${this.currentPointScroll}px`
                }
            },
            wrapperClasses() {
                return {
                    'asd__wrapper--datepicker-open': this.showDatepicker,
                    'asd__wrapper--full-screen': this.showFullscreen,
                    'asd__wrapper--inline': this.inline
                }
            },
            wrapperStyles() {
                return {
                    position: this.inline ? 'static' : 'absolute',
                    top: this.inline
                        ? '0'
                        : this.triggerPosition.height + this.offsetY + 'px',
                    left: !this.alignRight
                        ? this.triggerPosition.left -
                        this.triggerWrapperPosition.left +
                        this.offsetX +
                        'px'
                        : '',
                    right: this.alignRight
                        ? this.triggerWrapperPosition.right -
                        this.triggerPosition.right +
                        this.offsetX +
                        'px'
                        : '',
                    width: this.width * this.showMonths + 'px',
                    zIndex: this.inline ? '0' : '100'
                }
            },
            innerStyles() {
                return {
                    'margin-left': this.showFullscreen
                        ? '-' + this.viewportWidth
                        : `-${this.width}px`
                }
            },
            monthWidthStyles() {
                return {
                    width: this.showFullscreen ? this.viewportWidth : this.width + 'px'
                }
            },
            showFullscreen() {
                return this.isMobile && this.fullscreenMobile
            },
            datesSelected() {
                return !!(
                    (this.selectedDate1 && this.selectedDate1 !== '') ||
                    (this.selectedDate2 && this.selectedDate2 !== '')
                )
            },
            allDatesSelected() {
                return !!(
                    this.selectedDate1 &&
                    this.selectedDate1 !== '' &&
                    this.selectedDate2 &&
                    this.selectedDate2 !== ''
                )
            },
            hasMinDate() {
                return !!(this.minDate && this.minDate !== '')
            },
            isRangeMode() {
                return this.mode === 'range'
            },
            isSingleMode() {
                return this.mode === 'single'
            },
            datepickerWidth() {
                return this.width * this.showMonths
            },
            datePropsCompound() {
                return this.dateOne + this.dateTwo
            },
            isDateTwoBeforeDateOne() {
                if (!this.dateTwo) {
                    return false
                }
                return isBefore(this.dateTwo, this.dateOne)
            }
        },
        watch: {
            currentPointScroll(val) {
                const PARENT_WIDTH = 668;
                const TOGGLE_WIDTH = 60;
                let currentWay = 1800;

                if (val > (PARENT_WIDTH - TOGGLE_WIDTH)) {
                    this.currentPointScroll = PARENT_WIDTH - TOGGLE_WIDTH;
                }

                if (val < 0) {
                    this.currentPointScroll = 0;
                }

                if (val > this.parentToggleScrollWidth / 2) {
                    this.$refs.timebarProgress.style.left = `${-Math.abs(val * 2)}px`;

                    if (this.currentPointScroll < this.parentToggleScrollWidth / 2) {
                        this.$refs.timebarProgress.style.left = `${-Math.abs(val * 2)}px`;
                    }
                }

                if (this.currentPointScroll < this.parentToggleScrollWidth / 2) {
                    this.$refs.timebarProgress.style.left = `${-Math.abs(val * 2)}px`;
                }


                let realPassedX = (val * 3);
                for (let i = this.currentYears.length - 1; i > 0; --i) {
                    currentWay = currentWay - 120;
                    let total = currentWay - realPassedX;
                    let month = Math.abs(Math.ceil(total / 10));

                    if (inRange(realPassedX, this.currentYears[i - 1].leftCoords, this.currentYears[i].leftCoords)) {
                        if (realPassedX === 0) {
                            this.startingDate = `${this.currentYears[i - 1].item}-1-${i}`;
                            this.generateMonths();

                            break;
                        }

                        if (month === 0) {
                            month = 1
                        }
                        this.startingDate = `${this.currentYears[i - 1].item}-${month}-${i}`;
                        this.generateMonths();
                    }
                }

            },
            dateFrom(newVal) {
                this.currentTimebarEnd = 0;
                this.currentTimebarWidth = 0;

                let value = newVal;
                const wrapper = document.querySelector(`#${this.wrapperId}`);

                let bars = Array.from(wrapper.querySelectorAll(`.asd__timebar-progress > span`));
                let split = value.split('.');

                let date = {year: +split[2], month: +split[1], day: +split[0]};

                let currentYear = bars.find(it => +it.textContent.trim() === date.year);

                if (!currentYear) {
                    this.currentTimebarStart = 0;
                } else {
                    this.currentTimebarStart = parseInt(currentYear.style.left);
                    this.currentTimebarLeftPos = parseInt(currentYear.style.left);
                    this.currentPointScroll = this.currentTimebarWidth;

                    if (this.isFirstLoaded) {
                        this.currentPointScroll = 0;
                        this.$refs.timebarProgress.style.left = `${-Math.abs(this.currentTimebarStart)}px`;
                    }
                }
            },
            dateTo(newVal) {
                this.currentTimebarEnd = 0;
                this.currentTimebarWidth = 0;

                let value = newVal;
                const wrapper = document.querySelector(`#${this.wrapperId}`);

                let bars = Array.from(wrapper.querySelectorAll(`.asd__timebar-progress > span`));

                let split = value.split('.');

                let date = {year: +split[2], month: +split[1], day: +split[0]};
                let currentYear = bars.find(it => +it.textContent.trim() === date.year);

                if (!currentYear) {
                    this.currentTimebarWidth = 1800;
                } else {
                    this.currentTimebarEnd = parseInt(currentYear.style.left);
                    this.currentTimebarWidth = this.currentProgress;

                    if (!this.isFirstLoaded) {
                        this.currentPointScroll = this.currentTimebarWidth;
                    }
                }

                this.isFirstLoaded = false;
            },
            selectedDate1(newValue, oldValue) {
                let newDate =
                    !newValue || newValue === '' ? '' : format(newValue, this.dateFormat);

                this.$emit('date-one-selected', newDate);
                this.dateFrom = reverseDate(newDate);
            },
            selectedDate2(newValue, oldValue) {
                let newDate =
                    !newValue || newValue === '' ? '' : format(newValue, this.dateFormat);

                this.$emit('date-two-selected', newDate);
                this.dateTo = reverseDate(newDate);
            },
            mode(newValue, oldValue) {
                this.setStartDates()
            },
            datePropsCompound(newValue) {
                if (this.dateOne !== this.selectedDate1) {
                    this.startingDate = this.dateOne;
                    this.setStartDates();
                    this.generateMonths()
                }
            }
        },
        created() {
            this.setupDatepicker();

            if (this.sundayFirst) {
                this.setSundayToFirstDayInWeek();
            }

            this._handleWindowResizeEvent = debounce(() => {
                this.positionDatepicker();
                this.setStartDates()
            }, 200);
            this._handleWindowClickEvent = event => {
                if (event.target.id === this.triggerElementId) {
                    event.stopPropagation();
                    event.preventDefault();
                    this.toggleDatepicker()
                }
            };
            window.addEventListener('resize', this._handleWindowResizeEvent);
            window.addEventListener('click', this._handleWindowClickEvent)
        },
        mounted() {
            this.triggerElement = this.isTest
                ? document.createElement('input')
                : document.getElementById(this.triggerElementId);

            this.setStartDates();
            this.generateMonths();

            if (this.startOpen || this.inline) {
                this.openDatepicker()
            }

            this.triggerElement.addEventListener('keyup', this.handleTriggerInput)
        },
        beforeDestroy() {
            this.isFirstLoaded = true;
        },
        destroyed() {
            window.removeEventListener('resize', this._handleWindowResizeEvent);
            window.removeEventListener('click', this._handleWindowClickEvent);

            this.triggerElement.removeEventListener('keyup', this.handleTriggerInput)
        },
        methods: {
            setFixedDate(type) {
                let currentDate = new Date();
                let startDate;

                switch (type) {
                    case 'week':
                        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
                        break;

                    case 'month':
                        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
                        break;

                    case 'quarter':
                        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, currentDate.getDate());
                        break;

                    case 'year':
                        startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
                        break;
                }


                this.selectedDate1 = startDate;
                this.selectedDate2 = currentDate;
                this.startingDate = startDate;

                this.generateMonths();
            },
            toggleScroll(e) {
                e.preventDefault();
                let currentPointX = e.clientX;

                let onMouseMove = moveEvt => {
                    moveEvt.preventDefault();
                    let pressedX = currentPointX - moveEvt.clientX;
                    currentPointX = moveEvt.clientX;
                    let passedX = e.target.offsetLeft - pressedX;
                    this.timebarPosLeft = -Math.abs(passedX * 2);
                    this.currentPointScroll = passedX;
                };

                let onMouseUp = upEvt => {
                    upEvt.preventDefault();
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            },
            isWeekendDay(date, day) {
                let weekends = isWeekend(date);

                return weekends.sat.some(elem => elem === day) || weekends.sun.some(elem => elem === day);
            },
            getDayStyles(date) {
                const isSelected = this.isSelected(date);
                const isInRange = this.isInRange(date);
                const isDisabled = this.isDisabled(date);

                let styles = {
                    width: (this.width - 30) / 7 + 'px',
                    background: isSelected
                        ? this.colors.selected
                        : isInRange ? this.colors.inRange : '',
                    color: isSelected
                        ? this.colors.selectedText
                        : isInRange ? this.colors.selectedText : this.colors.text,
                };

                if (isDisabled) {
                    styles.background = this.colors.disabled
                }
                return styles
            },
            handleClickOutside(event) {
                if (
                    event.target.id === this.triggerElementId ||
                    !this.showDatepicker ||
                    this.inline
                ) {
                    return
                }
                this.closeDatepicker()
            },
            handleTriggerInput(event) {
                const keys = {
                    arrowDown: 40,
                    arrowUp: 38,
                    arrowRight: 39,
                    arrowLeft: 37
                };
                if (
                    event.keyCode === keys.arrowDown &&
                    !event.shiftKey &&
                    !this.showDatepicker
                ) {
                    this.openDatepicker()
                } else if (
                    event.keyCode === keys.arrowUp &&
                    !event.shiftKey &&
                    this.showDatepicker
                ) {
                    this.closeDatepicker()
                } else if (
                    event.keyCode === keys.arrowRight &&
                    !event.shiftKey &&
                    this.showDatepicker
                ) {
                    this.nextMonth()
                } else if (
                    event.keyCode === keys.arrowLeft &&
                    !event.shiftKey &&
                    this.showDatepicker
                ) {
                    this.previousMonth()
                } else {
                    if (this.mode === 'single') {
                        this.setDateFromText(event.target.value)
                    }
                }
            },
            setDateFromText(value) {
                if (value.length < 10) {
                    return
                }
                // make sure format is either 'YYYY-MM-DD' or 'DD.MM.YYYY'
                const isFormatYearFirst = value.match(
                    /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/
                );
                const isFormatDayFirst = value.match(
                    /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])[.](0[1-9]|1[0-2])[.](\d{4})$/
                );

                if (!isFormatYearFirst && !isFormatDayFirst) {
                    return
                }
                const valueAsDateObject = new Date(value);
                if (!isValid(valueAsDateObject)) {
                    return
                }
                const formattedDate = format(valueAsDateObject, this.dateFormat);
                if (
                    this.isDateDisabled(formattedDate) ||
                    this.isBeforeMinDate(formattedDate) ||
                    this.isAfterEndDate(formattedDate)
                ) {
                    return
                }
                this.startingDate = subMonths(formattedDate, 1);
                this.generateMonths();
                this.selectDate(formattedDate)
            },
            generateMonths() {
                this.months = [];
                for (let i = 0; i < this.showMonths + 3; i++) {
                    this.months.push(this.getMonth(this.startingDate));
                    this.startingDate = this.addMonths(this.startingDate)
                }
            },
            setupDatepicker() {
                if (this.$options.sundayFirst) {
                    this.sundayFirst = copyObject(this.$options.sundayFirst)
                }

                this.$nextTick(function () {
                    this.parentToggleScrollWidth = this.$refs.timebarScroll.parentNode.offsetWidth - this.$refs.timebarScroll.offsetWidth;
                });

                if (this.$options.colors) {
                    const colors = copyObject(this.$options.colors);
                    this.colors.selected = colors.selected || this.colors.selected;
                    this.colors.inRange = colors.inRange || this.colors.inRange;
                    this.colors.selectedText =
                        colors.selectedText || this.colors.selectedText;
                    this.colors.text = colors.text || this.colors.text;
                    this.colors.inRangeBorder =
                        colors.inRangeBorder || this.colors.inRangeBorder;
                    this.colors.disabled = colors.disabled || this.colors.disabled
                }
                if (this.$options.monthNames && this.$options.monthNames.length === 12) {
                    this.monthNames = copyObject(this.$options.monthNames)
                }
                if (this.$options.days && this.$options.days.length === 7) {
                    this.days = copyObject(this.$options.days)
                }
                if (this.$options.daysShort && this.$options.daysShort.length === 7) {
                    this.daysShort = copyObject(this.$options.daysShort)
                }
                if (this.$options.texts) {
                    const texts = copyObject(this.$options.texts);
                    this.texts.apply = texts.apply || this.texts.apply;
                    this.texts.cancel = texts.cancel || this.texts.cancel
                }
            },
            setStartDates(date) {
                let startDate;

                if (date) {
                    startDate = date;
                } else {
                    startDate = this.dateOne || new Date();
                }

                if (this.hasMinDate && isBefore(startDate, this.minDate)) {
                    startDate = this.minDate
                }
                this.startingDate = this.subtractMonths(startDate);
                this.selectedDate1 = this.dateOne;
                this.selectedDate2 = this.dateTwo;
            },
            setSundayToFirstDayInWeek() {
                const lastDay = this.days.pop();
                this.days.unshift(lastDay);
                const lastDayShort = this.daysShort.pop();
                this.daysShort.unshift(lastDayShort)
            },
            getMonth(date) {
                const firstDateOfMonth = format(date, 'YYYY-MM-01');
                const year = format(date, 'YYYY');
                const monthNumber = parseInt(format(date, 'M'));
                const monthName = this.monthNames[monthNumber - 1];

                return {
                    year,
                    firstDateOfMonth,
                    monthName,
                    monthNumber,
                    weeks: this.getWeeks(firstDateOfMonth)
                }
            },
            getWeeks(date) {
                const weekDayNotInMonth = {dayNumber: 0};
                const daysInMonth = getDaysInMonth(date);
                const year = format(date, 'YYYY');
                const month = format(date, 'MM');
                let firstDayInWeek = parseInt(format(date, this.sundayFirst ? 'd' : 'E'));
                if (this.sundayFirst) {
                    firstDayInWeek++
                }
                let weeks = [];
                let week = [];

                // add empty days to get first day in correct position
                for (let s = 1; s < firstDayInWeek; s++) {
                    week.push(weekDayNotInMonth)
                }
                for (let d = 0; d < daysInMonth; d++) {
                    let isLastDayInMonth = d >= daysInMonth - 1;
                    let dayNumber = d + 1;
                    let dayNumberFull = dayNumber < 10 ? '0' + dayNumber : dayNumber;
                    week.push({
                        dayNumber,
                        dayNumberFull: dayNumberFull,
                        fullDate: year + '-' + month + '-' + dayNumberFull
                    });

                    if (week.length === 7) {
                        weeks.push(week);
                        week = []
                    } else if (isLastDayInMonth) {
                        for (let i = 0; i < 7 - week.length; i++) {
                            week.push(weekDayNotInMonth)
                        }
                        weeks.push(week);
                        week = []
                    }
                }
                return weeks
            },
            selectDate(date, isFixed, posLeft) {

                let reversedDate = reverseDate(date);

                if (isFixed) {
                    this.startingDate = reversedDate;
                    this.generateMonths();
                }

                if (
                    this.isBeforeMinDate(reversedDate) ||
                    this.isAfterEndDate(reversedDate) ||
                    this.isDateDisabled(reversedDate)
                ) {
                    return
                }

                if (this.mode === 'single') {
                    this.selectedDate1 = reversedDate;
                    this.closeDatepicker();
                    return
                }

                if (this.isSelectingDate1 || isBefore(reversedDate, this.selectedDate1)) {
                    this.selectedDate1 = reversedDate;
                    this.isSelectingDate1 = false;


                    if (isBefore(this.selectedDate2, reversedDate)) {
                        //this.selectedDate2 = ''
                    }
                } else {
                    this.selectedDate2 = reversedDate;
                    this.isSelectingDate1 = true;

                    if (isAfter(this.selectedDate1, reversedDate)) {
                        //this.selectedDate1 = ''
                    }
                }
            },
            setHoverDate(date) {
                this.hoverDate = date
            },
            isSelected(date) {
                if (!date) {
                    return
                }
                return this.selectedDate1 === date || this.selectedDate2 === date
            },
            isInRange(date) {
                if (!this.allDatesSelected || this.isSingleMode) {
                    return false
                }

                return (
                    (isAfter(date, this.selectedDate1) &&
                        isBefore(date, this.selectedDate2)) ||
                    (isAfter(date, this.selectedDate1) &&
                        isBefore(date, this.hoverDate) &&
                        !this.allDatesSelected)
                )
            },
            isBeforeMinDate(date) {
                if (!this.minDate) {
                    return false
                }
                return isBefore(date, this.minDate)
            },
            isAfterEndDate(date) {
                if (!this.endDate) {
                    return false
                }
                return isAfter(date, this.endDate)
            },
            isDateDisabled(date) {
                const isDisabled = this.disabledDates.indexOf(date) > -1;
                return isDisabled
            },
            isDisabled(date) {
                return (
                    this.isDateDisabled(date) ||
                    this.isBeforeMinDate(date) ||
                    this.isAfterEndDate(date)
                )
            },
            previousMonth() {
                this.startingDate = this.subtractMonths(this.months[0].firstDateOfMonth);

                this.currentPointScroll = this.currentPointScroll - 4;

                this.months.unshift(this.getMonth(this.startingDate));
                this.months.splice(this.months.length - 1, 1)
            },
            nextMonth() {
                this.startingDate = this.addMonths(
                    this.months[this.months.length - 1].firstDateOfMonth
                );
                this.months.push(this.getMonth(this.startingDate));

                this.currentPointScroll = this.currentPointScroll + 4;

                setTimeout(() => {
                    this.months.splice(0, 1)
                }, 100)
            },
            subtractMonths(date) {
                return format(subMonths(date, 1), this.dateFormat)
            },
            addMonths(date) {
                return format(addMonths(date, 1), this.dateFormat)
            },
            toggleDatepicker() {
                if (this.showDatepicker) {
                    this.closeDatepicker()
                } else {
                    this.openDatepicker()
                }
            },
            openDatepicker() {
                this.positionDatepicker();
                this.setStartDates();
                this.triggerElement.classList.add('datepicker-open');
                this.showDatepicker = true;
                this.initialDate1 = this.dateOne;
                this.initialDate2 = this.dateTwo
            },
            closeDatepickerCancel() {
                if (this.showDatepicker) {
                    this.selectedDate1 = this.initialDate1;
                    this.selectedDate2 = this.initialDate2;
                    this.closeDatepicker()
                }
            },
            closeDatepicker() {
                if (this.inline) {
                    return
                }
                this.showDatepicker = false;
                this.triggerElement.classList.remove('datepicker-open');
                this.$emit('closed')
            },
            apply() {
                this.$emit('apply');
                this.closeDatepicker()
            },
            positionDatepicker() {
                const triggerWrapperElement = findAncestor(
                    this.triggerElement,
                    '.datepicker-trigger'
                );
                this.triggerPosition = this.triggerElement.getBoundingClientRect();
                if (triggerWrapperElement) {
                    this.triggerWrapperPosition = triggerWrapperElement.getBoundingClientRect()
                } else {
                    this.triggerWrapperPosition = {left: 0, right: 0}
                }

                const viewportWidth =
                    document.documentElement.clientWidth || window.innerWidth;
                this.viewportWidth = viewportWidth + 'px';
                this.isMobile = viewportWidth < 768;
                this.isTablet = viewportWidth >= 768 && viewportWidth <= 1024;
                this.showMonths = this.isMobile
                    ? 1
                    : this.isTablet && this.monthsToShow > 2 ? 2 : this.monthsToShow;

                this.$nextTick(function () {
                    const datepickerWrapper = document.getElementById(this.wrapperId)
                    if (!this.triggerElement || !datepickerWrapper) {
                        return
                    }

                    const rightPosition =
                        this.triggerElement.getBoundingClientRect().left +
                        datepickerWrapper.getBoundingClientRect().width;
                    this.alignRight = rightPosition > viewportWidth
                })
            }
        }
    }
</script>

<style lang="scss">
    @import './../styles/transitions';

    $tablet: 768px;
    $color-gray: rgba(0, 0, 0, 0.2);
    $border-normal: 1px solid $color-gray;
    $border: 1px solid #e4e7e7;
    $transition-time: 0.3s;

    .close-icon {
        border: none;
        font-size: 0;
        background: none;
        width: 10px;
        top: 5px;
        right: 5px;
        cursor: pointer;
        height: 10px;

        &::before {
            content: "";
            position: absolute;
            height: 10px;
            width: 2px;
            background-color: #24a2b4;
            transform: rotate(45deg);
            top: 0;
            left: 6px;
        }

        &::after {
            content: "";
            position: absolute;
            height: 10px;
            width: 2px;
            background-color: #24a2b4;
            transform: rotate(-45deg);
            top: 0;
            left: 6px;
        }
    }

    *,
    *:after,
    *:before {
        box-sizing: border-box;
    }

    .datepicker-trigger {
        position: relative;
        overflow: visible;
    }

    .asd {

        &__close-icon {
            display: block;
            border: none;
            background: none;
            color: #24a2b4;
            width: 10px;
            height: 10px;
            position: absolute;
            top: 9px;
            z-index: 5;
            right: 8px;
            cursor: pointer;
        }

        &__timebar {
            margin-top: 40px;
            position: relative;
        }

        &__time-input {
            height: 40px;
            width: 120px;
            font-family: inherit;
        }

        &__time-list {
            display: flex;
        }

        &__time-button {
            border: 1px solid #eeeeee;
            border-right: none;
            background: none;
            width: 80px;
            height: 40px;
            margin: 0;
            padding: 10px 0;
            display: block;
            text-align: center;
            cursor: pointer;
            font-size: 14px;

            &:hover {
                background-color: #e2f5f7;
            }

            &:last-child {
                border-right: 1px solid #eeeeee;
            }
        }

        &__datepicker-header {
            padding: 40px
        }

        &__timebar-years {
            display: flex;
            align-items: center;
        }

        &__time-current-inputs {
            display: flex;
            margin-left: auto;
            align-items: center;

            & > span {
                margin-left: 5px;
                margin-right: 5px;
            }
        }

        &__time-header {
            display: flex;
            align-items: center;
        }

        &__days-legend-wrapper {
            display: flex;
            top: 65px;
            position: relative;
            align-items: center;
        }

        &__timebar-monthes {
            width: 100%;
            position: absolute;
            height: 20px;
            overflow: hidden;
            user-select: none;
            border-radius: 3px;
            background: #f4f4f3;
        }

        &__timebar-progress {
            background-color: #f1f2f2;
            height: 20px;
            position: absolute;
            top: 0;
            left: 0;
            padding: 0 15px;

            & > span {
                position: absolute;
                cursor: pointer;
                width: 35px;
                display: block;
                text-align: center
            }
        }

        &__timebar-scroll {
            position: absolute;
            height: 40px;
            width: 60px;
            border: 3px solid #24a2b4;
            display: block;
            background-color: transparent;
            top: -10px;
            right: 0;
            z-index: 1;
            cursor: ew-resize;

            &::after {
                content: '';
                display: block;
                background: rgba(255, 255, 255, .7);
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
            }
        }

        &__timebar-progress-current {
            background-color: #c8ebef;
            position: absolute;
            height: 20px;
        }

        &__wrapper {
            border: $border-normal;
            white-space: nowrap;
            text-align: center;
            overflow: hidden;
            background-color: white;

            &--full-screen {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                border: none;
                z-index: 100;
            }
        }
        &__inner-wrapper {
            transition: all $transition-time ease;
            position: relative;
        }
        &__datepicker-header {
            position: relative;
            padding-left: 40px;
            padding-right: 40px;
        }
        &__change-month-button {
            position: absolute;
            bottom: -40px;
            z-index: 10;
            background: white;

            &--previous {
                left: 0;
                padding-left: 40px;
            }
            &--next {
                right: 0;
                padding-right: 40px;
            }

            > button {
                background-color: white;
                border: $border;
                border-radius: 3px;
                padding: 4px 8px;
                cursor: pointer;

                &:hover {
                    border: 1px solid #c4c4c4;
                }

                > svg {
                    height: 19px;
                    width: 19px;
                    fill: #82888a;
                }
            }
        }

        &__days-legend {
            padding: 0 10px;
        }

        &__day-title {
            display: inline-block;
            width: percentage(1/7);
            text-align: center;
            margin-bottom: 4px;
            color: rgba(0, 0, 0, 0.7);
            font-size: 0.8em;
            margin-left: -1px;
            text-transform: lowercase;

            &:nth-last-child(-n+2) {
                color: #e45f3e;
            }

        }

        &__month-table {
            border-collapse: separate;
            border-spacing: 0 10px;
            background: white;
            width: 100%;
            max-width: 100%;
        }

        &__month {
            transition: all $transition-time ease;
            display: inline-block;
            padding: 15px;

            &--hidden {
                height: 275px;
                visibility: hidden;
            }
        }
        &__month-name {
            font-size: 17px;
            text-align: center;
            margin: 0 0 30px;
            line-height: 1.4em;
            text-transform: lowercase;
            font-weight: normal;

            &:first-letter {
                text-transform: uppercase;
            }

        }

        &__day {
            $size: 15px;
            line-height: $size;
            height: $size;
            padding: 0;
            overflow: hidden;

            &--enabled {
                &:hover {
                    background-color: #e4e7e7;
                }
            }
            &--disabled,
            &--empty {
                opacity: 0.5;

                button {
                    cursor: default;
                }
            }
            &--empty {
                border: none;
            }
            &--disabled {
                &:hover {
                    background-color: transparent;
                }
            }
        }
        &__day-button {
            background: transparent;
            width: 100%;
            height: 100%;
            border: none;
            cursor: pointer;
            color: #222222;
            text-align: center;
            user-select: none;
            font-size: 15px;
            font-weight: inherit;
            padding: 0;
            outline: 0;

            &_weekend {
                color: #e66b4b;
            }
        }

        &__action-buttons {
            min-height: 50px;
            padding-top: 10px;
            margin-bottom: 40px;

            button {
                display: block;
                position: relative;
                border: none;
                font-weight: bold;
                font-size: 15px;
                cursor: pointer;
                margin: 0 auto;
                width: 121px;
                color: #ffffff;
                background-color: #008489;
                padding: 15px 20px;
            }
        }

        &__mobile-header {
            border-bottom: $border-normal;
            position: relative;
            padding: 15px 15px 15px 15px !important;
            text-align: center;
            height: 50px;

            h3 {
                font-size: 20px;
                margin: 0;
            }
        }
        &__mobile-only {
            display: none;
            @media (max-width: 600px) {
                display: block;
            }
        }
        &__mobile-close {
            position: absolute;
            top: 7px;
            right: 5px;
            padding: 5px;
            z-index: 100;
            cursor: pointer;

            &__icon {
                position: relative;
                font-size: 1.6em;
                font-weight: bold;
                padding: 0;
            }
        }
    }
</style>
