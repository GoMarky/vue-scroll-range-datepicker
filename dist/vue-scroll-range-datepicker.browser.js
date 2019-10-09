(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('date-fns/format'), require('date-fns/sub_months'), require('date-fns/add_months'), require('date-fns/get_days_in_month'), require('date-fns/is_before'), require('date-fns/is_equal'), require('date-fns/is_after'), require('date-fns/is_valid')) :
    typeof define === 'function' && define.amd ? define(['exports', 'date-fns/format', 'date-fns/sub_months', 'date-fns/add_months', 'date-fns/get_days_in_month', 'date-fns/is_before', 'date-fns/is_equal', 'date-fns/is_after', 'date-fns/is_valid'], factory) :
    (global = global || self, factory(global['vue-scroll-range-datepicker'] = {}, global.format, global.subMonths, global.addMonths, global.getDaysInMonth, global.isBefore, global.isEqual, global.isAfter, global.isValid));
}(this, function (exports, format, subMonths, addMonths, getDaysInMonth, isBefore, isEqual, isAfter, isValid) { 'use strict';

    format = format && format.hasOwnProperty('default') ? format['default'] : format;
    subMonths = subMonths && subMonths.hasOwnProperty('default') ? subMonths['default'] : subMonths;
    addMonths = addMonths && addMonths.hasOwnProperty('default') ? addMonths['default'] : addMonths;
    getDaysInMonth = getDaysInMonth && getDaysInMonth.hasOwnProperty('default') ? getDaysInMonth['default'] : getDaysInMonth;
    isBefore = isBefore && isBefore.hasOwnProperty('default') ? isBefore['default'] : isBefore;
    isEqual = isEqual && isEqual.hasOwnProperty('default') ? isEqual['default'] : isEqual;
    isAfter = isAfter && isAfter.hasOwnProperty('default') ? isAfter['default'] : isAfter;
    isValid = isValid && isValid.hasOwnProperty('default') ? isValid['default'] : isValid;

    /* eslint-disable */

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    const debounce = (func, wait, immediate) => {
        let timeout;
        return function () {
            let context = this,
                args = arguments;
            let later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        }
    };

    const copyObject = obj => {
        return JSON.parse(JSON.stringify(obj))
    };

    const findAncestor = (element, selector) => {
        if (!element) {
            return null
        }
        if (typeof element.closest === 'function') {
            return element.closest(selector) || null
        }
        while (element) {
            if (element.matches(selector)) {
                return element
            }
            element = element.parentElement;
        }
        return null
    };

    const randomString = length => {
        let text = '';
        let possible =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text
    };

    const isWeekend = date => {

        const d = new Date(date);
        const getTot = daysInMonth(d.getMonth(), d.getFullYear());
        const sat = [];
        const sun = [];

        for (let i = 1; i <= getTot; i++) {
            let newDate = new Date(d.getFullYear(), d.getMonth(), i);
            if (newDate.getDay() === 0) {
                sat.push(i);
            }
            if (newDate.getDay() === 6) {
                sun.push(i);
            }

        }

        return {
            sat,
            sun
        };

        function daysInMonth (month, year) {
            return new Date(year, month, 0).getDate();
        }
    };

    const reverseDate = function (date) {

        if (!date) {
            return;
        }

        let splitDate = date.split(`.`);
        if (splitDate.count === 0) {
            return null;
        }

        let year = splitDate[0];
        let month = splitDate[1];
        let day = splitDate[2];

        return day + `.` + month + `.` + year;
    };

    const inRange = (x, min, max) => {
        if (min > max) {
            return false;
        }
        return ((x - min) * (x - max) <= 0);
    };

    const isValidDate = (val) => {
        if (!val) return true

        return (val instanceof Date && !isNaN(val.valueOf())) || val.match(/\d{4}.\d{2}.\d{2}/) || val.match(/\d{2}.\d{2}.\d{4}/)
    };

    //

    var script = {
      name: 'vueScrollRangeDatepicker',
      props: {
        triggerElementId: { type: String },
        dateOne: {
          type: [String, Date],
          default: format(new Date()),
          validator (val) {
            if (!val) return true
            return isValidDate(val)
          },
        },
        dateTwo: {
          type: [String, Date],
          default: '',
          validator (val) {
            if (!val) return true
            return isValidDate(val)
          },
        },
        minDate: { type: [String, Date] },
        endDate: { type: [String, Date] },
        mode: { type: String, default: 'range' },
        offsetY: { type: Number, default: 0 },
        offsetX: { type: Number, default: 0 },
        monthsToShow: { type: Number, default: 2 },
        startOpen: { type: Boolean },
        fullscreenMobile: { type: Boolean },
        inline: { type: Boolean },
        mobileHeader: { type: String, default: 'Select date' },
        disabledDates: { type: Array, default: () => [] },
        showActionButtons: { type: Boolean, default: true },
        isTest: {
          type: Boolean,
          default: () => process.env.NODE_ENV === 'test',
        },
        dateFormat: {
          type: String,
          required: false,
          default: `DD.MM.YYYY`,
        },
        inBorderMode: {
          type: Boolean,
          require: false,
          default: true,
        },
        endYearForRange: {
          type: Date,
          required: false,
          default () {
            return new Date()
          },
        },
        rangeBarMode: {
          type: Boolean,
          required: false,
          default: true,
        },
        bookingMode: {
          type: Boolean,
          required: false,
          default: false,
        },
      },
      data () {
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
            disabled: '#fff',
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
            'December',
          ],
          days: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          daysShort: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
          texts: { apply: 'Apply', cancel: 'Cancel' },
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
          timebarAllPosLeft: 0,
          isFirstLoaded: true,
          parentToggleScrollWidth: 0,
          currentFixedTime: ``,
        }
      },
      computed: {
        currentProgress () {
          return this.currentTimebarEnd - this.currentTimebarStart
        },
        currentYears () {
          const currentDate = this.endYearForRange;
          let currentYear = currentDate.getFullYear() + 1;
          const currentYears = [];

          for (let i = 15; i >= 0; i--) {
            currentYear--;

            currentYears.push({
              item: currentYear + 1,
              fullDate: `${currentYear + 1}.01.01`,
              posLeft: `${120 * i}px`,
              leftCoords: 120 * i,
            });
          }

          return currentYears.reverse()
        },
        currentTimebarStyles () {
          return {
            width: `${this.currentTimebarWidth}px`,
            left: `${this.currentTimebarLeftPos}px`,
          }
        },
        timebarStyles() {
          let timebarWidth = 0;

          for (let i = 0; i < this.currentYears.length - 1; i++) {
            timebarWidth += 120;
          }

          return {
            width: `${timebarWidth}px`,
            left: `${this.timebarAllPosLeft}px`,
          }
        },
        scrollStyles () {
          return {
            left: `${this.currentPointScroll}px`,
          }
        },
        wrapperClasses () {
          return {
            'asd__wrapper--datepicker-open': this.showDatepicker,
            'asd__wrapper--full-screen': this.showFullscreen,
            'asd__wrapper--inline': this.inline,
          }
        },
        wrapperStyles () {
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
            zIndex: this.inline ? '0' : '100',
          }
        },
        innerStyles () {
          return {
            'margin-left': this.showFullscreen
              ? '-' + this.viewportWidth
              : `-${this.width}px`,
          }
        },
        monthWidthStyles () {
          return {
            width: this.showFullscreen ? this.viewportWidth : this.width + 'px',
          }
        },
        showFullscreen () {
          return this.isMobile && this.fullscreenMobile
        },
        datesSelected () {
          return Boolean(
            (this.selectedDate1 && this.selectedDate1 !== '') ||
            (this.selectedDate2 && this.selectedDate2 !== '')
          )
        },
        allDatesSelected () {
          return Boolean(
            this.selectedDate1 &&
            this.selectedDate1 !== '' &&
            this.selectedDate2 &&
            this.selectedDate2 !== ''
          )
        },
        hasMinDate () {
          return Boolean(this.minDate && this.minDate !== '')
        },
        isRangeMode () {
          return this.mode === 'range'
        },
        isSingleMode () {
          return this.mode === 'single'
        },
        datepickerWidth () {
          return this.width * this.showMonths
        },
        datePropsCompound () {
          return this.dateOne + this.dateTwo
        },
        isDateTwoBeforeDateOne () {
          if (!this.dateTwo) {
            return false
          }
          return isBefore(this.dateTwo, this.dateOne)
        },
      },
      watch: {
        currentPointScroll (val) {
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
            this.timebarAllPosLeft = -Math.abs(val * 2);

            if (val < this.parentToggleScrollWidth / 2) {
              this.timebarAllPosLeft = -Math.abs(val * 2);
            }
          }

          if (val < this.parentToggleScrollWidth / 2) {
            this.timebarAllPosLeft = -Math.abs(val * 2);
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

                break
              }

              if (month === 0) {
                month = 1;
              }

              this.startingDate = `${this.currentYears[i - 1].item}-${month}-${i}`;
              this.generateMonths();
            }
          }
        },
        dateFrom (newVal) {
          if (!isValidDate(newVal)) {
            this.$emit('date-one-selected', '');
            this.$emit('inCorrectDate', 'dateFrom');
          }

          if (newVal) {
            this.setCurrentTimebarWidth({
              from: newVal,
              to: this.dateTo,
            });
          }
        },
        dateTo (newVal) {
          if (!isValidDate(newVal)) {
            this.$emit('date-two-selected', '');
            this.$emit('inCorrectDate', 'dateTo');
          }

          if (newVal) {
            this.setCurrentTimebarWidth({
              from: this.dateFrom,
              to: newVal,
            });
          } else {
            this.currentTimebarWidth = 0;
          }
        },
        selectedDate1 (newValue, oldValue) {
          let newDate =
            !newValue || newValue === '' ? '' : format(newValue, this.dateFormat);

          this.$emit('date-one-selected', newDate);
          this.dateFrom = reverseDate(newDate);
        },
        selectedDate2 (newValue, oldValue) {
          let newDate =
            !newValue || newValue === '' ? '' : format(newValue, this.dateFormat);

          this.$emit('date-two-selected', newDate);
          this.dateTo = reverseDate(newDate);
        },
        mode (newValue, oldValue) {
          this.setStartDates();
        },
        datePropsCompound (newValue) {
          if (this.dateOne !== this.selectedDate1) {
            this.startingDate = this.dateOne;
            this.setStartDates();
            this.generateMonths();
          }

          if (this.bookingMode) {
            if (this.isDateTwoBeforeDateOne) {
              this.selectedDate2 = '';
              this.$emit('date-two-selected', '');
            }
          }
        },
      },
      created () {
        this.setupDatepicker();

        if (this.sundayFirst) {
          this.setSundayToFirstDayInWeek();
        }

        this._handleWindowResizeEvent = debounce(() => {
          this.positionDatepicker();
          this.setStartDates();
        }, 200);
        this._handleWindowClickEvent = event => {
          if (event.target.id === this.triggerElementId) {
            event.stopPropagation();
            event.preventDefault();
            this.toggleDatepicker();
          }
        };
        window.addEventListener('resize', this._handleWindowResizeEvent);
        window.addEventListener('click', this._handleWindowClickEvent);
      },
      mounted () {
        this.triggerElement = this.isTest
          ? document.createElement('input')
          : document.getElementById(this.triggerElementId);

        this.setStartDates();
        this.generateMonths();

        if (this.startOpen || this.inline) {
          this.openDatepicker();
        }

        this.triggerElement.addEventListener('keyup', this.handleTriggerInput);
      },
      beforeDestroy () {
        this.isFirstLoaded = true;
      },
      destroyed () {
        window.removeEventListener('resize', this._handleWindowResizeEvent);
        window.removeEventListener('click', this._handleWindowClickEvent);

        this.triggerElement.removeEventListener('keyup', this.handleTriggerInput);
      },
      methods: {
        setCurrentTimebarWidth (date) {
          const wrapper = document.querySelector(`#${this.wrapperId}`);
          const years = Array.from(wrapper.querySelectorAll(`.asd__timebar-progress > span`));

          function getInt (val) {
            return parseInt(val.style.left)
          }

          if (date.to) {
            const dateFrom = years.find(it => it.textContent.trim() === date.from.split('.')[2]);
            const dateTo = years.find(it => it.textContent.trim() === date.to.split('.')[2]);

            if (dateFrom && dateTo) {
              if (getInt(dateFrom) > getInt(dateTo)) {
                this.currentTimebarWidth = 0;
                return
              }
            }

            if (dateFrom) {
              this.currentTimebarStart = getInt(dateFrom);
              this.currentTimebarLeftPos = getInt(dateFrom);

              this.currentPointScroll = getInt(dateFrom) / 3;
            }

            if (dateTo) {
              this.currentTimebarEnd = getInt(dateTo);
            }

            this.currentTimebarWidth = this.currentProgress;
          } else {
            const dateFrom = years.find(it => it.textContent.trim() === date.from.split('.')[2]);

            this.currentTimebarStart = getInt(dateFrom);
            this.currentTimebarLeftPos = getInt(dateFrom);
            this.currentPointScroll = getInt(dateFrom) / 3;
          }
        },
        touchStart (e) {

        },
        touchMove (e) {

        },
        touchEnd (e) {

        },
        setFixedDate (type) {
          this.currentFixedTime = type;

          let currentDate = new Date();
          let startDate;

          switch (type) {
            case 'week':
              startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
              break

            case 'month':
              startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
              break

            case 'quarter':
              startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, currentDate.getDate());
              break

            case 'year':
              startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
              break
          }

          this.selectedDate1 = startDate;
          this.selectedDate2 = currentDate;
          this.startingDate = startDate;

          this.generateMonths();
        },
        toggleScroll (e) {
          e.preventDefault();
          let currentPointX = e.clientX;

          const onMouseMove = moveEvt => {
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
        isWeekendDay (date, day) {
          let weekends = isWeekend(date);

          return weekends.sat.some(elem => elem === day) || weekends.sun.some(elem => elem === day)
        },
        getDayStyles (date) {
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
            styles.background = this.colors.disabled;
          }
          return styles
        },
        handleClickOutside (event) {
          if (
            event.target.id === this.triggerElementId ||
            !this.showDatepicker ||
            this.inline
          ) {
            return
          }
          this.closeDatepicker();
        },
        handleTriggerInput (event) {
          const keys = {
            arrowDown: 40,
            arrowUp: 38,
            arrowRight: 39,
            arrowLeft: 37,
          };
          if (
            event.keyCode === keys.arrowDown &&
            !event.shiftKey &&
            !this.showDatepicker
          ) {
            this.openDatepicker();
          } else if (
            event.keyCode === keys.arrowUp &&
            !event.shiftKey &&
            this.showDatepicker
          ) {
            this.closeDatepicker();
          } else if (
            event.keyCode === keys.arrowRight &&
            !event.shiftKey &&
            this.showDatepicker
          ) {
            this.nextMonth();
          } else if (
            event.keyCode === keys.arrowLeft &&
            !event.shiftKey &&
            this.showDatepicker
          ) {
            this.previousMonth();
          } else {
            if (this.mode === 'single') {
              this.setDateFromText(event.target.value);
            }
          }
        },
        setDateFromText (value) {
          if (value.length < 10) {
            return
          }
          // make sure format is either 'YYYY-MM-DD' or 'DD.MM.YYYY'
          const isFormatYearFirst = value.match(
            /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/,
          );
          const isFormatDayFirst = value.match(
            /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])[.](0[1-9]|1[0-2])[.](\d{4})$/,
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
          this.selectDate(formattedDate);
        },
        generateMonths () {
          this.months = [];
          for (let i = 0; i < this.showMonths + 3; i++) {
            this.months.push(this.getMonth(this.startingDate));
            this.startingDate = this.addMonths(this.startingDate);
          }
        },
        setupDatepicker () {
          if (this.$options.sundayFirst) {
            this.sundayFirst = copyObject(this.$options.sundayFirst);
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
            this.colors.disabled = colors.disabled || this.colors.disabled;
          }
          if (this.$options.monthNames && this.$options.monthNames.length === 12) {
            this.monthNames = copyObject(this.$options.monthNames);
          }
          if (this.$options.days && this.$options.days.length === 7) {
            this.days = copyObject(this.$options.days);
          }
          if (this.$options.daysShort && this.$options.daysShort.length === 7) {
            this.daysShort = copyObject(this.$options.daysShort);
          }
          if (this.$options.texts) {
            const texts = copyObject(this.$options.texts);
            this.texts.apply = texts.apply || this.texts.apply;
            this.texts.cancel = texts.cancel || this.texts.cancel;
          }
        },
        setStartDates (date) {
          let startDate;

          if (date) {
            startDate = date;
          } else {
            startDate = this.dateOne || new Date();
          }

          if (this.hasMinDate && isBefore(startDate, this.minDate)) {
            startDate = this.minDate;
          }
          this.startingDate = this.subtractMonths(startDate);
          this.selectedDate1 = this.dateOne;
          this.selectedDate2 = this.dateTwo;
        },
        setSundayToFirstDayInWeek () {
          const lastDay = this.days.pop();
          this.days.unshift(lastDay);
          const lastDayShort = this.daysShort.pop();
          this.daysShort.unshift(lastDayShort);
        },
        getMonth (date) {
          const firstDateOfMonth = format(date, 'YYYY-MM-01');
          const year = format(date, 'YYYY');
          const monthNumber = parseInt(format(date, 'M'));
          const monthName = this.monthNames[monthNumber - 1];

          return {
            year,
            firstDateOfMonth,
            monthName,
            monthNumber,
            weeks: this.getWeeks(firstDateOfMonth),
          }
        },
        getWeeks (date) {
          const weekDayNotInMonth = { dayNumber: 0 };
          const daysInMonth = getDaysInMonth(date);
          const year = format(date, 'YYYY');
          const month = format(date, 'MM');
          let firstDayInWeek = parseInt(format(date, this.sundayFirst ? 'd' : 'E'));
          if (this.sundayFirst) {
            firstDayInWeek++;
          }
          let weeks = [];
          let week = [];

          // add empty days to get first day in correct position
          for (let s = 1; s < firstDayInWeek; s++) {
            week.push(weekDayNotInMonth);
          }
          for (let d = 0; d < daysInMonth; d++) {
            let isLastDayInMonth = d >= daysInMonth - 1;
            let dayNumber = d + 1;
            let dayNumberFull = dayNumber < 10 ? '0' + dayNumber : dayNumber;
            week.push({
              dayNumber,
              dayNumberFull: dayNumberFull,
              fullDate: year + '-' + month + '-' + dayNumberFull,
            });

            if (week.length === 7) {
              weeks.push(week);
              week = [];
            } else if (isLastDayInMonth) {
              for (let i = 0; i < 7 - week.length; i++) {
                week.push(weekDayNotInMonth);
              }
              weeks.push(week);
              week = [];
            }
          }
          return weeks
        },
        selectDate (date, isFixed) {
          this.currentFixedTime = ``;
          const reversedDate = reverseDate(date);

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

            if (!this.bookingMode) {
              this.selectedDate2 = ``;
            }

            if (isBefore(this.selectedDate2, reversedDate)) {
              this.selectedDate2 = ``;
            }
          } else {
            this.selectedDate2 = reversedDate;
            this.isSelectingDate1 = true;

            if (isAfter(this.selectedDate1, reversedDate)) {
              this.selectedDate1 = ``;
            }
          }
        },
        setHoverDate (date) {
          if (this.bookingMode) {
            this.hoverDate = date;
          }
        },
        isSelected (date) {
          if (!date) {
            return
          }
          return this.selectedDate1 === date || this.selectedDate2 === date
        },
        isInRange (date) {
          if (this.inBorderMode || !this.allDatesSelected) {
            return isEqual(date, this.selectedDate1) || (
              (isAfter(date, this.selectedDate1) &&
                isBefore(date, this.selectedDate2)) ||
              (isAfter(date, this.selectedDate1) &&
                isBefore(date, this.hoverDate) &&
                !this.allDatesSelected)
            ) || isEqual(date, this.selectedDate2)
          }

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
        isBeforeMinDate (date) {
          if (!this.minDate) {
            return false
          }
          return isBefore(date, this.minDate)
        },
        isAfterEndDate (date) {
          if (!this.endDate) {
            return false
          }
          return isAfter(date, this.endDate)
        },
        isDateDisabled (date) {
          return this.disabledDates.indexOf(date) > -1
        },
        isDisabled (date) {
          return (
            this.isDateDisabled(date) ||
            this.isBeforeMinDate(date) ||
            this.isAfterEndDate(date)
          )
        },
        previousMonth () {
          this.currentPointScroll = this.currentPointScroll - 4;

          this.startingDate = this.subtractMonths(this.months[0].firstDateOfMonth);
          this.months.unshift(this.getMonth(this.startingDate));
          this.months.splice(this.months.length - 1, 1);
        },
        nextMonth () {
          this.currentPointScroll = this.currentPointScroll + 4;

          this.startingDate = this.addMonths(
            this.months[this.months.length - 1].firstDateOfMonth,
          );
          this.months.push(this.getMonth(this.startingDate));
          setTimeout(() => {
            this.months.splice(0, 1);
          }, 100);
        },
        subtractMonths (date) {
          return format(subMonths(date, 1), this.dateFormat)
        },
        addMonths (date) {
          return format(addMonths(date, 1), this.dateFormat)
        },
        toggleDatepicker () {
          if (this.showDatepicker) {
            this.closeDatepicker();
          } else {
            this.openDatepicker();
          }
        },
        openDatepicker () {
          this.positionDatepicker();
          this.setStartDates();
          this.triggerElement.classList.add('datepicker-open');
          this.showDatepicker = true;
          this.initialDate1 = this.dateOne;
          this.initialDate2 = this.dateTwo;
        },
        closeDatepickerCancel () {
          if (this.showDatepicker) {
            this.selectedDate1 = this.initialDate1;
            this.selectedDate2 = this.initialDate2;
            this.closeDatepicker();
          }
        },
        closeDatepicker () {
          if (this.inline) {
            return
          }
          this.showDatepicker = false;
          this.triggerElement.classList.remove('datepicker-open');
          this.$emit('closed');
        },
        apply () {
          if (this.dateTo) {
            this.$emit('date-one-selected', reverseDate(this.dateFrom));
          }

          if (this.dateFrom) {
            this.$emit('date-two-selected', reverseDate(this.dateTo));
          }

          this.$emit('apply');
          this.closeDatepicker();
        },
        positionDatepicker () {
          const triggerWrapperElement = findAncestor(
            this.triggerElement,
            '.datepicker-trigger',
          );
          this.triggerPosition = this.triggerElement.getBoundingClientRect();
          if (triggerWrapperElement) {
            this.triggerWrapperPosition = triggerWrapperElement.getBoundingClientRect();
          } else {
            this.triggerWrapperPosition = { left: 0, right: 0 };
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
            const datepickerWrapper = document.getElementById(this.wrapperId);
            if (!this.triggerElement || !datepickerWrapper) {
              return
            }

            const rightPosition =
              this.triggerElement.getBoundingClientRect().left +
              datepickerWrapper.getBoundingClientRect().width;
            this.alignRight = rightPosition > viewportWidth;
          });
        },
      },
    };

    function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
    /* server only */
    , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
      } // Vue.extend constructor export interop.


      var options = typeof script === 'function' ? script.options : script; // render functions

      if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true; // functional template

        if (isFunctionalTemplate) {
          options.functional = true;
        }
      } // scopedId


      if (scopeId) {
        options._scopeId = scopeId;
      }

      var hook;

      if (moduleIdentifier) {
        // server build
        hook = function hook(context) {
          // 2.3 injection
          context = context || // cached call
          this.$vnode && this.$vnode.ssrContext || // stateful
          this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
          // 2.2 with runInNewContext: true

          if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
            context = __VUE_SSR_CONTEXT__;
          } // inject component styles


          if (style) {
            style.call(this, createInjectorSSR(context));
          } // register component module identifier for async chunk inference


          if (context && context._registeredComponents) {
            context._registeredComponents.add(moduleIdentifier);
          }
        }; // used by ssr in case component is cached and beforeCreate
        // never gets called


        options._ssrRegister = hook;
      } else if (style) {
        hook = shadowMode ? function () {
          style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
        } : function (context) {
          style.call(this, createInjector(context));
        };
      }

      if (hook) {
        if (options.functional) {
          // register for functional component in vue file
          var originalRender = options.render;

          options.render = function renderWithStyleInjection(h, context) {
            hook.call(context);
            return originalRender(h, context);
          };
        } else {
          // inject component registration as beforeCreate hook
          var existing = options.beforeCreate;
          options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
      }

      return script;
    }

    var normalizeComponent_1 = normalizeComponent;

    var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
    function createInjector(context) {
      return function (id, style) {
        return addStyle(id, style);
      };
    }
    var HEAD;
    var styles = {};

    function addStyle(id, css) {
      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = {
        ids: new Set(),
        styles: []
      });

      if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;

        if (css.map) {
          // https://developer.chrome.com/devtools/docs/javascript-debugging
          // this makes source maps inside style tags work properly in Chrome
          code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

          code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
        }

        if (!style.element) {
          style.element = document.createElement('style');
          style.element.type = 'text/css';
          if (css.media) style.element.setAttribute('media', css.media);

          if (HEAD === undefined) {
            HEAD = document.head || document.getElementsByTagName('head')[0];
          }

          HEAD.appendChild(style.element);
        }

        if ('styleSheet' in style.element) {
          style.styles.push(code);
          style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
        } else {
          var index = style.ids.size - 1;
          var textNode = document.createTextNode(code);
          var nodes = style.element.childNodes;
          if (nodes[index]) style.element.removeChild(nodes[index]);
          if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
        }
      }
    }

    var browser = createInjector;

    /* script */
    const __vue_script__ = script;

    /* template */
    var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('transition',{attrs:{"name":"asd__fade"}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.showDatepicker),expression:"showDatepicker"},{name:"click-outside",rawName:"v-click-outside",value:(_vm.handleClickOutside),expression:"handleClickOutside"}],staticClass:"asd__wrapper",class:_vm.wrapperClasses,style:(_vm.showFullscreen ? undefined : _vm.wrapperStyles),attrs:{"id":_vm.wrapperId}},[_c('button',{staticClass:"asd__close-icon",attrs:{"type":"button"},on:{"click":_vm.closeDatepickerCancel}}),_vm._v(" "),(_vm.showFullscreen)?_c('div',{staticClass:"asd__mobile-header asd__mobile-only"},[_c('div',{staticClass:"asd__mobile-close",on:{"click":_vm.closeDatepicker}},[_c('div',{staticClass:"asd__mobile-close-icon"},[_vm._v("X")])]),_vm._v(" "),_c('h3',[_vm._v(_vm._s(_vm.mobileHeader))])]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"asd__datepicker-header"},[_c('div',{staticClass:"asd__time-header"},[_c('div',{staticClass:"asd__time-list"},[_c('button',{staticClass:"asd__time-button",class:{ 'asd__time-button_current' : _vm.currentFixedTime === 'week' },attrs:{"type":"button"},on:{"click":function($event){return _vm.setFixedDate('week')}}},[_vm._v("\n            Неделя\n          ")]),_vm._v(" "),_c('button',{staticClass:"asd__time-button",class:{ 'asd__time-button_current' : _vm.currentFixedTime === 'month' },attrs:{"type":"button"},on:{"click":function($event){return _vm.setFixedDate('month')}}},[_vm._v("\n            Месяц\n          ")]),_vm._v(" "),_c('button',{staticClass:"asd__time-button",class:{ 'asd__time-button_current' : _vm.currentFixedTime === 'quarter' },attrs:{"type":"button"},on:{"click":function($event){return _vm.setFixedDate('quarter')}}},[_vm._v("\n            Квартал\n          ")]),_vm._v(" "),_c('button',{staticClass:"asd__time-button",class:{ 'asd__time-button_current' : _vm.currentFixedTime === 'year' },attrs:{"type":"button"},on:{"click":function($event){return _vm.setFixedDate('year')}}},[_vm._v("\n            Год\n          ")])]),_vm._v(" "),_c('div',{staticClass:"asd__time-current-inputs"},[_c('div',{staticClass:"asd__time-input-wrapper"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.dateFrom),expression:"dateFrom"}],staticClass:"asd__time-input",attrs:{"type":"text","name":"time","id":"start-time","autocomplete":"off"},domProps:{"value":(_vm.dateFrom)},on:{"keyup":function($event){if(!$event.type.indexOf('key')&&_vm._k($event.keyCode,"enter",13,$event.key,"Enter")){ return null; }return _vm.setDateFromText(_vm.dateFrom)},"input":function($event){if($event.target.composing){ return; }_vm.dateFrom=$event.target.value;}}})]),_vm._v(" "),_c('span',[_vm._v(" - ")]),_vm._v(" "),_c('div',{staticClass:"asd__time-input-wrapper"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.dateTo),expression:"dateTo"}],staticClass:"asd__time-input",attrs:{"type":"text","name":"time","id":"end-time","autocomplete":"off"},domProps:{"value":(_vm.dateTo)},on:{"keyup":function($event){if(!$event.type.indexOf('key')&&_vm._k($event.keyCode,"enter",13,$event.key,"Enter")){ return null; }return _vm.setDateFromText(_vm.dateTo)},"input":function($event){if($event.target.composing){ return; }_vm.dateTo=$event.target.value;}}})])])]),_vm._v(" "),_c('div',{staticClass:"asd__timebar"},[_c('div',{ref:"timebarScroll",staticClass:"asd__timebar-scroll",style:(_vm.scrollStyles),on:{"mousedown":_vm.toggleScroll}}),_vm._v(" "),_c('div',{ref:"timebarWrapper",staticClass:"asd__timebar-monthes"},[_c('div',{staticClass:"asd__timebar-progress",style:(_vm.timebarStyles)},[_c('div',{ref:"currentProgressBar",staticClass:"asd__timebar-progress-current",style:(_vm.currentTimebarStyles)}),_vm._v(" "),_vm._l((_vm.currentYears),function(year,index){return _c('span',{key:index,style:({left: year.posLeft}),attrs:{"data-year":year.item},on:{"click":function($event){return _vm.selectDate(year.fullDate, true, year.posLeft)}}},[_vm._v(_vm._s(year.item))])})],2)])]),_vm._v(" "),_c('div',{staticClass:"asd__change-month-button asd__change-month-button--previous"},[_c('button',{attrs:{"type":"button"},on:{"click":_vm.previousMonth}},[_c('svg',{attrs:{"width":"13","height":"12","viewBox":"0 0 13 12","fill":"none","xmlns":"http://www.w3.org/2000/svg"}},[_c('path',{attrs:{"fill-rule":"evenodd","clip-rule":"evenodd","d":"M0 6L6 0V4H13V8H6V12L0 6Z","fill":"#24A2B4"}})])])]),_vm._v(" "),_c('div',{staticClass:"asd__change-month-button asd__change-month-button--next"},[_c('button',{attrs:{"type":"button"},on:{"click":_vm.nextMonth}},[_c('svg',{attrs:{"width":"13","height":"12","viewBox":"0 0 13 12","fill":"none","xmlns":"http://www.w3.org/2000/svg"}},[_c('path',{attrs:{"fill-rule":"evenodd","clip-rule":"evenodd","d":"M13 6L7 12V8H0V4H7V0L13 6Z","fill":"#24A2B4"}})])])])]),_vm._v(" "),_c('div',{staticClass:"asd__days-legend-wrapper"},_vm._l((_vm.showMonths),function(month,index){return _c('div',{key:month,staticClass:"asd__days-legend",style:([_vm.monthWidthStyles, {left: (_vm.width * index) + 'px'}])},_vm._l((_vm.daysShort),function(day){return _c('div',{key:day,staticClass:"asd__day-title"},[_vm._v(_vm._s(day))])}),0)}),0),_vm._v(" "),_c('div',{staticClass:"asd__inner-wrapper",style:(_vm.innerStyles),on:{"touchstart":function($event){return _vm.touchStart($event)},"touchmove":function($event){return _vm.touchMove($event)},"touchend":function($event){return _vm.touchEnd($event)}}},_vm._l((_vm.months),function(month,monthIndex){return _c('div',{key:month.firstDateOfMonth,staticClass:"asd__month",class:{hidden: monthIndex === 0 || monthIndex > _vm.showMonths},style:(_vm.monthWidthStyles)},[_c('div',{staticClass:"asd__month-name"},[_vm._v(_vm._s(month.monthName)+" "+_vm._s(month.year))]),_vm._v(" "),_c('table',{staticClass:"asd__month-table",attrs:{"role":"presentation"}},[_c('tbody',_vm._l((month.weeks),function(week,index){return _c('tr',{key:index,staticClass:"asd__week"},_vm._l((week),function(ref,index){
    var fullDate = ref.fullDate;
    var dayNumber = ref.dayNumber;
    return _c('td',{key:index + '_' + dayNumber,staticClass:"asd__day",class:{
                        'asd__day--enabled': dayNumber !== 0,
                        'asd__day--empty': dayNumber === 0,
                        'asd__day--disabled': _vm.isDisabled(fullDate),
                        'asd__day--selected': _vm.selectedDate1 === fullDate || _vm.selectedDate2 === fullDate,
                        'asd__day--in-range': _vm.isInRange(fullDate)
                      },style:(_vm.getDayStyles(fullDate)),attrs:{"data-date":fullDate},on:{"mouseover":function () { _vm.setHoverDate(fullDate); }}},[(dayNumber)?_c('button',{staticClass:"asd__day-button",class:{ 'asd__day-button_weekend' : _vm.isWeekendDay(fullDate, dayNumber) },attrs:{"type":"button","date":fullDate,"disabled":_vm.isDisabled(fullDate)},on:{"click":function($event){return _vm.selectDate(fullDate)}}},[_vm._v(_vm._s(dayNumber)+"\n              ")]):_vm._e()])}),0)}),0)])])}),0),_vm._v(" "),(_vm.mode !== 'single' && _vm.showActionButtons)?_c('div',{staticClass:"asd__action-buttons"},[_c('button',{attrs:{"type":"button"},on:{"click":_vm.apply}},[_vm._v(_vm._s(_vm.texts.apply)+"\n      ")])]):_vm._e()])])};
    var __vue_staticRenderFns__ = [];

      /* style */
      const __vue_inject_styles__ = function (inject) {
        if (!inject) return
        inject("data-v-406dfb57_0", { source: ".asd__fade-enter-active,.asd__fade-leave-active{transition:all .2s ease}.asd__fade-enter,.asd__fade-leave-active{opacity:0}.asd__list-complete-enter,.asd__list-complete-leave-to{opacity:0;transform:translateY(30px)}.asd__list-complete-leave-active{position:absolute;visibility:hidden}*,:after,:before{box-sizing:border-box}.datepicker-trigger{position:relative;overflow:visible}.asd__close-icon{display:block;border:none;background:0 0;color:#24a2b4;width:10px;height:10px;position:absolute;top:9px;z-index:5;right:8px;cursor:pointer}.asd__close-icon::before{content:\"\";position:absolute;height:10px;width:2px;background-color:#24a2b4;transform:rotate(45deg);top:0;left:6px}.asd__close-icon::after{content:\"\";position:absolute;height:10px;width:2px;background-color:#24a2b4;transform:rotate(-45deg);top:0;left:6px}.asd__timebar{margin-top:40px;position:relative}.asd__time-input{height:40px;width:120px;font-family:inherit}.asd__time-list{display:flex}.asd__time-button{border:1px solid #eee;border-right:none;background:0 0;width:80px;height:40px;margin:0;padding:10px 0;display:block;text-align:center;cursor:pointer;font-size:14px}.asd__time-button:hover{background-color:#e2f5f7}.asd__time-button:last-child{border-right:1px solid #eee}.asd__datepicker-header{padding:40px}.asd__timebar-years{display:flex;align-items:center}.asd__time-current-inputs{display:flex;margin-left:auto;align-items:center}.asd__time-current-inputs>span{margin-left:5px;margin-right:5px}.asd__time-header{display:flex;align-items:center}.asd__days-legend-wrapper{display:flex;top:65px;position:relative;align-items:center}.asd__timebar-monthes{width:100%;position:absolute;height:20px;overflow:hidden;user-select:none;border-radius:3px;background:#f4f4f3}.asd__timebar-progress{background-color:#f1f2f2;height:20px;position:absolute;top:0;left:0;padding:0 15px}.asd__timebar-progress>span{position:absolute;cursor:pointer;width:35px;display:block;text-align:center}.asd__timebar-scroll{position:absolute;height:40px;width:60px;border:3px solid #24a2b4;display:block;background-color:transparent;top:-10px;right:0;z-index:1;cursor:ew-resize}.asd__timebar-scroll::after{content:\"\";display:block;background:rgba(255,255,255,.7);position:absolute;top:0;bottom:0;left:0;right:0}.asd__timebar-progress-current{background-color:#c8ebef;position:absolute;height:20px}.asd__wrapper{border:1px solid rgba(0,0,0,.2);white-space:nowrap;text-align:center;overflow:hidden;background-color:#fff}.asd__wrapper--full-screen{position:fixed;top:0;right:0;bottom:0;left:0;border:none;z-index:100}.asd__inner-wrapper{transition:all .3s ease;position:relative}.asd__datepicker-header{position:relative;padding-left:40px;padding-right:40px}.asd__change-month-button{position:absolute;bottom:-40px;z-index:10;background:#fff}.asd__change-month-button--previous{left:0;padding-left:40px}.asd__change-month-button--next{right:0;padding-right:40px}.asd__change-month-button>button{background-color:#fff;border:none;padding:4px 8px;cursor:pointer}.asd__change-month-button>button:hover{border:1px solid #c4c4c4}.asd__change-month-button>button>svg{height:19px;width:19px;fill:#82888a}.asd__days-legend{padding:0 10px}.asd__day-title{display:inline-block;width:14.2857142857%;text-align:center;margin-bottom:4px;color:rgba(0,0,0,.7);font-size:.8em;margin-left:-1px;text-transform:lowercase}.asd__day-title:nth-last-child(-n+2){color:#e45f3e}.asd__month-table{border-collapse:separate;border-spacing:0 10px;background:#fff;width:100%;max-width:100%}.asd__month{transition:all .3s ease;display:inline-block;padding:15px}.asd__month--hidden{height:275px;visibility:hidden}.asd__month-name{font-size:17px;text-align:center;margin:0 0 30px;line-height:1.4em;text-transform:lowercase;font-weight:400}.asd__month-name:first-letter{text-transform:uppercase}.asd__day{line-height:15px;height:15px;padding:0;overflow:hidden}.asd__day--enabled:hover{background-color:#e4e7e7}.asd__day--disabled,.asd__day--empty{opacity:.5}.asd__day--disabled button,.asd__day--empty button{cursor:default}.asd__day--empty{border:none}.asd__day--disabled:hover{background-color:transparent}.asd__day-button{background:0 0;width:100%;height:100%;border:none;cursor:pointer;color:#222;text-align:center;user-select:none;font-size:15px;font-weight:inherit;padding:0;outline:0}.asd__day-button_weekend{color:#e66b4b}.asd__action-buttons{min-height:50px;padding-top:10px;margin-bottom:40px}.asd__action-buttons button{display:block;position:relative;border:none;font-weight:700;font-size:15px;cursor:pointer;margin:0 auto;width:121px;color:#fff;background-color:#008489;padding:15px 20px}.asd__mobile-header{border-bottom:1px solid rgba(0,0,0,.2);position:relative;padding:15px 15px 15px 15px!important;text-align:center;height:50px}.asd__mobile-header h3{font-size:20px;margin:0}.asd__mobile-only{display:none}@media (max-width:600px){.asd__mobile-only{display:block}}.asd__mobile-close{position:absolute;top:7px;right:5px;padding:5px;z-index:100;cursor:pointer}.asd__mobile-close__icon{position:relative;font-size:1.6em;font-weight:700;padding:0}@media (min-width:320px) and (max-width:1280px){.asd__datepicker-header{padding:25px}.asd__timebar{display:none}.asd__time-list{display:grid;grid-auto-flow:column;margin-bottom:20px;overflow:auto;border-bottom:2px solid #e8e8e8;padding-bottom:2px}.asd__time-header{display:block;overflow:hidden}.asd__time-input{max-width:120px;width:100%}.asd__time-button{border:none;color:#24a2b4;position:relative}.asd__time-button:last-child{border-right:none}.asd__time-button_current{color:#222}.asd__time-button_current::before{content:\"\";position:absolute;width:100%;height:2px;left:0;bottom:-2px;background-color:#222}.asd__time-current-inputs{margin-left:0;justify-content:center}.asd__change-month-button--previous{padding-left:25px}.asd__change-month-button--next{padding-right:25px}.asd__action-buttons{margin-bottom:20px}}", map: undefined, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__ = undefined;
      /* module identifier */
      const __vue_module_identifier__ = undefined;
      /* functional template */
      const __vue_is_functional_template__ = false;
      /* style inject SSR */
      

      
      var vueScrollRangeDatepicker = normalizeComponent_1(
        { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
        __vue_inject_styles__,
        __vue_script__,
        __vue_scope_id__,
        __vue_is_functional_template__,
        __vue_module_identifier__,
        browser,
        undefined
      );

    var ClickOutside = {
      bind: function(el, binding, vnode) {
        el.event = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event);
          }
        };
        document.body.addEventListener('click', el.event);
        document.body.addEventListener('touchstart', el.event);
      },
      unbind: function(el) {
        document.body.removeEventListener('click', el.event);
        document.body.removeEventListener('touchstart', el.event);
      }
    };

    // Install the components
    function install(Vue, options) {
        Vue.directive('click-outside', ClickOutside);
        Vue.component(vueScrollRangeDatepicker.name, {
            ...options,
            ...vueScrollRangeDatepicker
        });
    }

    /* -- Plugin definition & Auto-install -- */
    /* You shouldn't have to modify the code below */

    // Plugin
    const plugin = {
        /* eslint-disable no-undef */
        version: VERSION,
        install,
    };

    // Auto-install
    let GlobalVue = null;
    if (typeof window !== 'undefined') {
        GlobalVue = window.Vue;
    } else if (typeof global !== 'undefined') {
        GlobalVue = global.Vue;
    }
    if (GlobalVue) {
        GlobalVue.use(plugin);
    }

    exports.default = plugin;
    exports.install = install;
    exports.vueScrollRangeDatepicker = vueScrollRangeDatepicker;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
