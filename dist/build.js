(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('date-fns/format'), require('date-fns/sub_months'), require('date-fns/add_months'), require('date-fns/get_days_in_month'), require('date-fns/is_before'), require('date-fns/is_equal'), require('date-fns/is_after'), require('date-fns/is_valid')) :
    typeof define === 'function' && define.amd ? define(['exports', 'date-fns/format', 'date-fns/sub_months', 'date-fns/add_months', 'date-fns/get_days_in_month', 'date-fns/is_before', 'date-fns/is_equal', 'date-fns/is_after', 'date-fns/is_valid'], factory) :
    (global = global || self, factory(global.test = {}, global.format, global.subMonths, global.addMonths, global.getDaysInMonth, global.isBefore, global.isEqual, global.isAfter, global.isValid));
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
    var __vue_render__ = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c("transition", { attrs: { name: "asd__fade" } }, [
        _c(
          "div",
          {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.showDatepicker,
                expression: "showDatepicker"
              },
              {
                name: "click-outside",
                rawName: "v-click-outside",
                value: _vm.handleClickOutside,
                expression: "handleClickOutside"
              }
            ],
            staticClass: "asd__wrapper",
            class: _vm.wrapperClasses,
            style: _vm.showFullscreen ? undefined : _vm.wrapperStyles,
            attrs: { id: _vm.wrapperId }
          },
          [
            _c("button", {
              staticClass: "asd__close-icon",
              attrs: { type: "button" },
              on: { click: _vm.closeDatepickerCancel }
            }),
            _vm._v(" "),
            _vm.showFullscreen
              ? _c("div", { staticClass: "asd__mobile-header asd__mobile-only" }, [
                  _c(
                    "div",
                    {
                      staticClass: "asd__mobile-close",
                      on: { click: _vm.closeDatepicker }
                    },
                    [
                      _c("div", { staticClass: "asd__mobile-close-icon" }, [
                        _vm._v("X")
                      ])
                    ]
                  ),
                  _vm._v(" "),
                  _c("h3", [_vm._v(_vm._s(_vm.mobileHeader))])
                ])
              : _vm._e(),
            _vm._v(" "),
            _c("div", { staticClass: "asd__datepicker-header" }, [
              _c("div", { staticClass: "asd__time-header" }, [
                _c("div", { staticClass: "asd__time-list" }, [
                  _c(
                    "button",
                    {
                      staticClass: "asd__time-button",
                      class: {
                        "asd__time-button_current": _vm.currentFixedTime === "week"
                      },
                      attrs: { type: "button" },
                      on: {
                        click: function($event) {
                          return _vm.setFixedDate("week")
                        }
                      }
                    },
                    [_vm._v("\n            Неделя\n          ")]
                  ),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "asd__time-button",
                      class: {
                        "asd__time-button_current": _vm.currentFixedTime === "month"
                      },
                      attrs: { type: "button" },
                      on: {
                        click: function($event) {
                          return _vm.setFixedDate("month")
                        }
                      }
                    },
                    [_vm._v("\n            Месяц\n          ")]
                  ),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "asd__time-button",
                      class: {
                        "asd__time-button_current":
                          _vm.currentFixedTime === "quarter"
                      },
                      attrs: { type: "button" },
                      on: {
                        click: function($event) {
                          return _vm.setFixedDate("quarter")
                        }
                      }
                    },
                    [_vm._v("\n            Квартал\n          ")]
                  ),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "asd__time-button",
                      class: {
                        "asd__time-button_current": _vm.currentFixedTime === "year"
                      },
                      attrs: { type: "button" },
                      on: {
                        click: function($event) {
                          return _vm.setFixedDate("year")
                        }
                      }
                    },
                    [_vm._v("\n            Год\n          ")]
                  )
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "asd__time-current-inputs" }, [
                  _c("div", { staticClass: "asd__time-input-wrapper" }, [
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.dateFrom,
                          expression: "dateFrom"
                        }
                      ],
                      staticClass: "asd__time-input",
                      attrs: {
                        type: "text",
                        name: "time",
                        id: "start-time",
                        autocomplete: "off"
                      },
                      domProps: { value: _vm.dateFrom },
                      on: {
                        keyup: function($event) {
                          if (
                            !$event.type.indexOf("key") &&
                            _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                          ) {
                            return null
                          }
                          return _vm.setDateFromText(_vm.dateFrom)
                        },
                        input: function($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.dateFrom = $event.target.value;
                        }
                      }
                    })
                  ]),
                  _vm._v(" "),
                  _c("span", [_vm._v(" - ")]),
                  _vm._v(" "),
                  _c("div", { staticClass: "asd__time-input-wrapper" }, [
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.dateTo,
                          expression: "dateTo"
                        }
                      ],
                      staticClass: "asd__time-input",
                      attrs: {
                        type: "text",
                        name: "time",
                        id: "end-time",
                        autocomplete: "off"
                      },
                      domProps: { value: _vm.dateTo },
                      on: {
                        keyup: function($event) {
                          if (
                            !$event.type.indexOf("key") &&
                            _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                          ) {
                            return null
                          }
                          return _vm.setDateFromText(_vm.dateTo)
                        },
                        input: function($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.dateTo = $event.target.value;
                        }
                      }
                    })
                  ])
                ])
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "asd__timebar" }, [
                _c("div", {
                  ref: "timebarScroll",
                  staticClass: "asd__timebar-scroll",
                  style: _vm.scrollStyles,
                  on: { mousedown: _vm.toggleScroll }
                }),
                _vm._v(" "),
                _c(
                  "div",
                  { ref: "timebarWrapper", staticClass: "asd__timebar-monthes" },
                  [
                    _c(
                      "div",
                      {
                        staticClass: "asd__timebar-progress",
                        style: _vm.timebarStyles
                      },
                      [
                        _c("div", {
                          ref: "currentProgressBar",
                          staticClass: "asd__timebar-progress-current",
                          style: _vm.currentTimebarStyles
                        }),
                        _vm._v(" "),
                        _vm._l(_vm.currentYears, function(year, index) {
                          return _c(
                            "span",
                            {
                              key: index,
                              style: { left: year.posLeft },
                              attrs: { "data-year": year.item },
                              on: {
                                click: function($event) {
                                  return _vm.selectDate(
                                    year.fullDate,
                                    true,
                                    year.posLeft
                                  )
                                }
                              }
                            },
                            [_vm._v(_vm._s(year.item))]
                          )
                        })
                      ],
                      2
                    )
                  ]
                )
              ]),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass:
                    "asd__change-month-button asd__change-month-button--previous"
                },
                [
                  _c(
                    "button",
                    { attrs: { type: "button" }, on: { click: _vm.previousMonth } },
                    [
                      _c(
                        "svg",
                        {
                          attrs: {
                            width: "13",
                            height: "12",
                            viewBox: "0 0 13 12",
                            fill: "none",
                            xmlns: "http://www.w3.org/2000/svg"
                          }
                        },
                        [
                          _c("path", {
                            attrs: {
                              "fill-rule": "evenodd",
                              "clip-rule": "evenodd",
                              d: "M0 6L6 0V4H13V8H6V12L0 6Z",
                              fill: "#24A2B4"
                            }
                          })
                        ]
                      )
                    ]
                  )
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                {
                  staticClass:
                    "asd__change-month-button asd__change-month-button--next"
                },
                [
                  _c(
                    "button",
                    { attrs: { type: "button" }, on: { click: _vm.nextMonth } },
                    [
                      _c(
                        "svg",
                        {
                          attrs: {
                            width: "13",
                            height: "12",
                            viewBox: "0 0 13 12",
                            fill: "none",
                            xmlns: "http://www.w3.org/2000/svg"
                          }
                        },
                        [
                          _c("path", {
                            attrs: {
                              "fill-rule": "evenodd",
                              "clip-rule": "evenodd",
                              d: "M13 6L7 12V8H0V4H7V0L13 6Z",
                              fill: "#24A2B4"
                            }
                          })
                        ]
                      )
                    ]
                  )
                ]
              )
            ]),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "asd__days-legend-wrapper" },
              _vm._l(_vm.showMonths, function(month, index) {
                return _c(
                  "div",
                  {
                    key: month,
                    staticClass: "asd__days-legend",
                    style: [
                      _vm.monthWidthStyles,
                      { left: _vm.width * index + "px" }
                    ]
                  },
                  _vm._l(_vm.daysShort, function(day) {
                    return _c("div", { key: day, staticClass: "asd__day-title" }, [
                      _vm._v(_vm._s(day))
                    ])
                  }),
                  0
                )
              }),
              0
            ),
            _vm._v(" "),
            _c(
              "div",
              {
                staticClass: "asd__inner-wrapper",
                style: _vm.innerStyles,
                on: {
                  touchstart: function($event) {
                    return _vm.touchStart($event)
                  },
                  touchmove: function($event) {
                    return _vm.touchMove($event)
                  },
                  touchend: function($event) {
                    return _vm.touchEnd($event)
                  }
                }
              },
              _vm._l(_vm.months, function(month, monthIndex) {
                return _c(
                  "div",
                  {
                    key: month.firstDateOfMonth,
                    staticClass: "asd__month",
                    class: {
                      hidden: monthIndex === 0 || monthIndex > _vm.showMonths
                    },
                    style: _vm.monthWidthStyles
                  },
                  [
                    _c("div", { staticClass: "asd__month-name" }, [
                      _vm._v(_vm._s(month.monthName) + " " + _vm._s(month.year))
                    ]),
                    _vm._v(" "),
                    _c(
                      "table",
                      {
                        staticClass: "asd__month-table",
                        attrs: { role: "presentation" }
                      },
                      [
                        _c(
                          "tbody",
                          _vm._l(month.weeks, function(week, index) {
                            return _c(
                              "tr",
                              { key: index, staticClass: "asd__week" },
                              _vm._l(week, function(ref, index) {
                                var fullDate = ref.fullDate;
                                var dayNumber = ref.dayNumber;
                                return _c(
                                  "td",
                                  {
                                    key: index + "_" + dayNumber,
                                    staticClass: "asd__day",
                                    class: {
                                      "asd__day--enabled": dayNumber !== 0,
                                      "asd__day--empty": dayNumber === 0,
                                      "asd__day--disabled": _vm.isDisabled(
                                        fullDate
                                      ),
                                      "asd__day--selected":
                                        _vm.selectedDate1 === fullDate ||
                                        _vm.selectedDate2 === fullDate,
                                      "asd__day--in-range": _vm.isInRange(fullDate)
                                    },
                                    style: _vm.getDayStyles(fullDate),
                                    attrs: { "data-date": fullDate },
                                    on: {
                                      mouseover: function() {
                                        _vm.setHoverDate(fullDate);
                                      }
                                    }
                                  },
                                  [
                                    dayNumber
                                      ? _c(
                                          "button",
                                          {
                                            staticClass: "asd__day-button",
                                            class: {
                                              "asd__day-button_weekend": _vm.isWeekendDay(
                                                fullDate,
                                                dayNumber
                                              )
                                            },
                                            attrs: {
                                              type: "button",
                                              date: fullDate,
                                              disabled: _vm.isDisabled(fullDate)
                                            },
                                            on: {
                                              click: function($event) {
                                                return _vm.selectDate(fullDate)
                                              }
                                            }
                                          },
                                          [
                                            _vm._v(
                                              _vm._s(dayNumber) + "\n              "
                                            )
                                          ]
                                        )
                                      : _vm._e()
                                  ]
                                )
                              }),
                              0
                            )
                          }),
                          0
                        )
                      ]
                    )
                  ]
                )
              }),
              0
            ),
            _vm._v(" "),
            _vm.mode !== "single" && _vm.showActionButtons
              ? _c("div", { staticClass: "asd__action-buttons" }, [
                  _c(
                    "button",
                    { attrs: { type: "button" }, on: { click: _vm.apply } },
                    [_vm._v(_vm._s(_vm.texts.apply) + "\n      ")]
                  )
                ])
              : _vm._e()
          ]
        )
      ])
    };
    var __vue_staticRenderFns__ = [];
    __vue_render__._withStripped = true;

      /* style */
      const __vue_inject_styles__ = function (inject) {
        if (!inject) return
        inject("data-v-7dc6fde4_0", { source: ".asd__fade-enter-active,\n.asd__fade-leave-active {\n  transition: all 0.2s ease;\n}\n.asd__fade-enter,\n.asd__fade-leave-active {\n  opacity: 0;\n}\n.asd__list-complete-enter,\n.asd__list-complete-leave-to {\n  opacity: 0;\n  transform: translateY(30px);\n}\n.asd__list-complete-leave-active {\n  position: absolute;\n  visibility: hidden;\n}\n*,\n*:after,\n*:before {\n  box-sizing: border-box;\n}\n.datepicker-trigger {\n  position: relative;\n  overflow: visible;\n}\n.asd__close-icon {\n  display: block;\n  border: none;\n  background: none;\n  color: #24a2b4;\n  width: 10px;\n  height: 10px;\n  position: absolute;\n  top: 9px;\n  z-index: 5;\n  right: 8px;\n  cursor: pointer;\n}\n.asd__close-icon::before {\n  content: \"\";\n  position: absolute;\n  height: 10px;\n  width: 2px;\n  background-color: #24a2b4;\n  transform: rotate(45deg);\n  top: 0;\n  left: 6px;\n}\n.asd__close-icon::after {\n  content: \"\";\n  position: absolute;\n  height: 10px;\n  width: 2px;\n  background-color: #24a2b4;\n  transform: rotate(-45deg);\n  top: 0;\n  left: 6px;\n}\n.asd__timebar {\n  margin-top: 40px;\n  position: relative;\n}\n.asd__time-input {\n  height: 40px;\n  width: 120px;\n  font-family: inherit;\n}\n.asd__time-list {\n  display: flex;\n}\n.asd__time-button {\n  border: 1px solid #eeeeee;\n  border-right: none;\n  background: none;\n  width: 80px;\n  height: 40px;\n  margin: 0;\n  padding: 10px 0;\n  display: block;\n  text-align: center;\n  cursor: pointer;\n  font-size: 14px;\n}\n.asd__time-button:hover {\n  background-color: #e2f5f7;\n}\n.asd__time-button:last-child {\n  border-right: 1px solid #eeeeee;\n}\n.asd__datepicker-header {\n  padding: 40px;\n}\n.asd__timebar-years {\n  display: flex;\n  align-items: center;\n}\n.asd__time-current-inputs {\n  display: flex;\n  margin-left: auto;\n  align-items: center;\n}\n.asd__time-current-inputs > span {\n  margin-left: 5px;\n  margin-right: 5px;\n}\n.asd__time-header {\n  display: flex;\n  align-items: center;\n}\n.asd__days-legend-wrapper {\n  display: flex;\n  top: 65px;\n  position: relative;\n  align-items: center;\n}\n.asd__timebar-monthes {\n  width: 100%;\n  position: absolute;\n  height: 20px;\n  overflow: hidden;\n  user-select: none;\n  border-radius: 3px;\n  background: #f4f4f3;\n}\n.asd__timebar-progress {\n  background-color: #f1f2f2;\n  height: 20px;\n  position: absolute;\n  top: 0;\n  left: 0;\n  padding: 0 15px;\n}\n.asd__timebar-progress > span {\n  position: absolute;\n  cursor: pointer;\n  width: 35px;\n  display: block;\n  text-align: center;\n}\n.asd__timebar-scroll {\n  position: absolute;\n  height: 40px;\n  width: 60px;\n  border: 3px solid #24a2b4;\n  display: block;\n  background-color: transparent;\n  top: -10px;\n  right: 0;\n  z-index: 1;\n  cursor: ew-resize;\n}\n.asd__timebar-scroll::after {\n  content: \"\";\n  display: block;\n  background: rgba(255, 255, 255, 0.7);\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n.asd__timebar-progress-current {\n  background-color: #c8ebef;\n  position: absolute;\n  height: 20px;\n}\n.asd__wrapper {\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  white-space: nowrap;\n  text-align: center;\n  overflow: hidden;\n  background-color: white;\n}\n.asd__wrapper--full-screen {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  border: none;\n  z-index: 100;\n}\n.asd__inner-wrapper {\n  transition: all 0.3s ease;\n  position: relative;\n}\n.asd__datepicker-header {\n  position: relative;\n  padding-left: 40px;\n  padding-right: 40px;\n}\n.asd__change-month-button {\n  position: absolute;\n  bottom: -40px;\n  z-index: 10;\n  background: white;\n}\n.asd__change-month-button--previous {\n  left: 0;\n  padding-left: 40px;\n}\n.asd__change-month-button--next {\n  right: 0;\n  padding-right: 40px;\n}\n.asd__change-month-button > button {\n  background-color: white;\n  border: none;\n  padding: 4px 8px;\n  cursor: pointer;\n}\n.asd__change-month-button > button:hover {\n  border: 1px solid #c4c4c4;\n}\n.asd__change-month-button > button > svg {\n  height: 19px;\n  width: 19px;\n  fill: #82888a;\n}\n.asd__days-legend {\n  padding: 0 10px;\n}\n.asd__day-title {\n  display: inline-block;\n  width: 14.2857142857%;\n  text-align: center;\n  margin-bottom: 4px;\n  color: rgba(0, 0, 0, 0.7);\n  font-size: 0.8em;\n  margin-left: -1px;\n  text-transform: lowercase;\n}\n.asd__day-title:nth-last-child(-n+2) {\n  color: #e45f3e;\n}\n.asd__month-table {\n  border-collapse: separate;\n  border-spacing: 0 10px;\n  background: white;\n  width: 100%;\n  max-width: 100%;\n}\n.asd__month {\n  transition: all 0.3s ease;\n  display: inline-block;\n  padding: 15px;\n}\n.asd__month--hidden {\n  height: 275px;\n  visibility: hidden;\n}\n.asd__month-name {\n  font-size: 17px;\n  text-align: center;\n  margin: 0 0 30px;\n  line-height: 1.4em;\n  text-transform: lowercase;\n  font-weight: normal;\n}\n.asd__month-name:first-letter {\n  text-transform: uppercase;\n}\n.asd__day {\n  line-height: 15px;\n  height: 15px;\n  padding: 0;\n  overflow: hidden;\n}\n.asd__day--enabled:hover {\n  background-color: #e4e7e7;\n}\n.asd__day--disabled, .asd__day--empty {\n  opacity: 0.5;\n}\n.asd__day--disabled button, .asd__day--empty button {\n  cursor: default;\n}\n.asd__day--empty {\n  border: none;\n}\n.asd__day--disabled:hover {\n  background-color: transparent;\n}\n.asd__day-button {\n  background: transparent;\n  width: 100%;\n  height: 100%;\n  border: none;\n  cursor: pointer;\n  color: #222222;\n  text-align: center;\n  user-select: none;\n  font-size: 15px;\n  font-weight: inherit;\n  padding: 0;\n  outline: 0;\n}\n.asd__day-button_weekend {\n  color: #e66b4b;\n}\n.asd__action-buttons {\n  min-height: 50px;\n  padding-top: 10px;\n  margin-bottom: 40px;\n}\n.asd__action-buttons button {\n  display: block;\n  position: relative;\n  border: none;\n  font-weight: bold;\n  font-size: 15px;\n  cursor: pointer;\n  margin: 0 auto;\n  width: 121px;\n  color: #ffffff;\n  background-color: #008489;\n  padding: 15px 20px;\n}\n.asd__mobile-header {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.2);\n  position: relative;\n  padding: 15px 15px 15px 15px !important;\n  text-align: center;\n  height: 50px;\n}\n.asd__mobile-header h3 {\n  font-size: 20px;\n  margin: 0;\n}\n.asd__mobile-only {\n  display: none;\n}\n@media (max-width: 600px) {\n.asd__mobile-only {\n    display: block;\n}\n}\n.asd__mobile-close {\n  position: absolute;\n  top: 7px;\n  right: 5px;\n  padding: 5px;\n  z-index: 100;\n  cursor: pointer;\n}\n.asd__mobile-close__icon {\n  position: relative;\n  font-size: 1.6em;\n  font-weight: bold;\n  padding: 0;\n}\n@media (min-width: 320px) and (max-width: 1280px) {\n.asd__datepicker-header {\n    padding: 25px;\n}\n.asd__timebar {\n    display: none;\n}\n.asd__time-list {\n    display: grid;\n    grid-auto-flow: column;\n    margin-bottom: 20px;\n    overflow: auto;\n    border-bottom: 2px solid #E8E8E8;\n    padding-bottom: 2px;\n}\n.asd__time-header {\n    display: block;\n    overflow: hidden;\n}\n.asd__time-input {\n    max-width: 120px;\n    width: 100%;\n}\n.asd__time-button {\n    border: none;\n    color: #24A2B4;\n    position: relative;\n}\n.asd__time-button:last-child {\n    border-right: none;\n}\n.asd__time-button_current {\n    color: #222222;\n}\n.asd__time-button_current::before {\n    content: \"\";\n    position: absolute;\n    width: 100%;\n    height: 2px;\n    left: 0;\n    bottom: -2px;\n    background-color: #222;\n}\n.asd__time-current-inputs {\n    margin-left: 0;\n    justify-content: center;\n}\n.asd__change-month-button--previous {\n    padding-left: 25px;\n}\n.asd__change-month-button--next {\n    padding-right: 25px;\n}\n.asd__action-buttons {\n    margin-bottom: 20px;\n}\n}\n\n/*# sourceMappingURL=VueScrollRangeDatepicker.vue.map */", map: {"version":3,"sources":["VueScrollRangeDatepicker.vue","/Users/teodordre/Documents/reps/JavaScript/vue-scroll-range-datepicker/src/components/VueScrollRangeDatepicker.vue"],"names":[],"mappings":"AAAA;;EAEE,yBAAyB;AAC3B;AAEA;;EAEE,UAAU;AACZ;AAEA;;EAEE,UAAU;EACV,2BAA2B;AAC7B;AAEA;EACE,kBAAkB;EAClB,kBAAkB;AACpB;AC0mCA;;;EAGA,sBAAA;ADvmCA;AC0mCA;EACA,kBAAA;EACA,iBAAA;ADvmCA;AC4mCA;EACA,cAAA;EACA,YAAA;EACA,gBAAA;EACA,cAAA;EACA,WAAA;EACA,YAAA;EACA,kBAAA;EACA,QAAA;EACA,UAAA;EACA,UAAA;EACA,eAAA;ADzmCA;AC2mCA;EACA,WAAA;EACA,kBAAA;EACA,YAAA;EACA,UAAA;EACA,yBAAA;EACA,wBAAA;EACA,MAAA;EACA,SAAA;ADzmCA;AC4mCA;EACA,WAAA;EACA,kBAAA;EACA,YAAA;EACA,UAAA;EACA,yBAAA;EACA,yBAAA;EACA,MAAA;EACA,SAAA;AD1mCA;AC8mCA;EACA,gBAAA;EACA,kBAAA;AD5mCA;AC+mCA;EACA,YAAA;EACA,YAAA;EACA,oBAAA;AD7mCA;ACgnCA;EACA,aAAA;AD9mCA;ACinCA;EACA,yBAAA;EACA,kBAAA;EACA,gBAAA;EACA,WAAA;EACA,YAAA;EACA,SAAA;EACA,eAAA;EACA,cAAA;EACA,kBAAA;EACA,eAAA;EACA,eAAA;AD/mCA;ACinCA;EACA,yBAAA;AD/mCA;ACknCA;EACA,+BAAA;ADhnCA;AConCA;EACA,aAAA;ADlnCA;ACqnCA;EACA,aAAA;EACA,mBAAA;ADnnCA;ACsnCA;EACA,aAAA;EACA,iBAAA;EACA,mBAAA;ADpnCA;ACsnCA;EACA,gBAAA;EACA,iBAAA;ADpnCA;ACwnCA;EACA,aAAA;EACA,mBAAA;ADtnCA;ACynCA;EACA,aAAA;EACA,SAAA;EACA,kBAAA;EACA,mBAAA;ADvnCA;AC0nCA;EACA,WAAA;EACA,kBAAA;EACA,YAAA;EACA,gBAAA;EACA,iBAAA;EACA,kBAAA;EACA,mBAAA;ADxnCA;AC2nCA;EACA,yBAAA;EACA,YAAA;EACA,kBAAA;EACA,MAAA;EACA,OAAA;EACA,eAAA;ADznCA;AC2nCA;EACA,kBAAA;EACA,eAAA;EACA,WAAA;EACA,cAAA;EACA,kBAAA;ADznCA;AC6nCA;EACA,kBAAA;EACA,YAAA;EACA,WAAA;EACA,yBAAA;EACA,cAAA;EACA,6BAAA;EACA,UAAA;EACA,QAAA;EACA,UAAA;EACA,iBAAA;AD3nCA;AC6nCA;EACA,WAAA;EACA,cAAA;EACA,oCAAA;EACA,kBAAA;EACA,MAAA;EACA,SAAA;EACA,OAAA;EACA,QAAA;AD3nCA;AC+nCA;EACA,yBAAA;EACA,kBAAA;EACA,YAAA;AD7nCA;ACgoCA;EACA,oCApLA;EAqLA,mBAAA;EACA,kBAAA;EACA,gBAAA;EACA,uBAAA;AD9nCA;ACgoCA;EACA,eAAA;EACA,MAAA;EACA,QAAA;EACA,SAAA;EACA,OAAA;EACA,YAAA;EACA,YAAA;AD9nCA;ACkoCA;EACA,yBAAA;EACA,kBAAA;ADhoCA;ACmoCA;EACA,kBAAA;EACA,kBAAA;EACA,mBAAA;ADjoCA;ACooCA;EACA,kBAAA;EACA,aAAA;EACA,WAAA;EACA,iBAAA;ADloCA;ACooCA;EACA,OAAA;EACA,kBAAA;ADloCA;ACqoCA;EACA,QAAA;EACA,mBAAA;ADnoCA;ACsoCA;EACA,uBAAA;EACA,YAAA;EACA,gBAAA;EACA,eAAA;ADpoCA;ACsoCA;EACA,yBAAA;ADpoCA;ACuoCA;EACA,YAAA;EACA,WAAA;EACA,aAAA;ADroCA;AC0oCA;EACA,eAAA;ADxoCA;AC2oCA;EACA,qBAAA;EACA,qBAAA;EACA,kBAAA;EACA,kBAAA;EACA,yBAAA;EACA,gBAAA;EACA,iBAAA;EACA,yBAAA;ADzoCA;AC2oCA;EACA,cAAA;ADzoCA;AC8oCA;EACA,yBAAA;EACA,sBAAA;EACA,iBAAA;EACA,WAAA;EACA,eAAA;AD5oCA;AC+oCA;EACA,yBAAA;EACA,qBAAA;EACA,aAAA;AD7oCA;AC+oCA;EACA,aAAA;EACA,kBAAA;AD7oCA;ACipCA;EACA,eAAA;EACA,kBAAA;EACA,gBAAA;EACA,kBAAA;EACA,yBAAA;EACA,mBAAA;AD/oCA;ACipCA;EACA,yBAAA;AD/oCA;ACopCA;EAEA,iBADA;EAEA,YAFA;EAGA,UAAA;EACA,gBAAA;ADnpCA;ACspCA;EACA,yBAAA;ADppCA;ACwpCA;EAEA,YAAA;ADvpCA;ACypCA;EACA,eAAA;ADvpCA;AC2pCA;EACA,YAAA;ADzpCA;AC6pCA;EACA,6BAAA;AD3pCA;ACgqCA;EACA,uBAAA;EACA,WAAA;EACA,YAAA;EACA,YAAA;EACA,eAAA;EACA,cAAA;EACA,kBAAA;EACA,iBAAA;EACA,eAAA;EACA,oBAAA;EACA,UAAA;EACA,UAAA;AD9pCA;ACgqCA;EACA,cAAA;AD9pCA;ACkqCA;EACA,gBAAA;EACA,iBAAA;EACA,mBAAA;ADhqCA;ACkqCA;EACA,cAAA;EACA,kBAAA;EACA,YAAA;EACA,iBAAA;EACA,eAAA;EACA,eAAA;EACA,cAAA;EACA,YAAA;EACA,cAAA;EACA,yBAAA;EACA,kBAAA;ADhqCA;ACoqCA;EACA,2CAhXA;EAiXA,kBAAA;EACA,uCAAA;EACA,kBAAA;EACA,YAAA;ADlqCA;ACoqCA;EACA,eAAA;EACA,SAAA;ADlqCA;ACsqCA;EACA,aAAA;ADpqCA;ACqqCA;AAFA;IAGA,cAAA;ADlqCE;AACF;ACqqCA;EACA,kBAAA;EACA,QAAA;EACA,UAAA;EACA,YAAA;EACA,YAAA;EACA,eAAA;ADnqCA;ACqqCA;EACA,kBAAA;EACA,gBAAA;EACA,iBAAA;EACA,UAAA;ADnqCA;ACwqCA;AAEA;IACA,aAAA;ADtqCE;ACyqCF;IACA,aAAA;ADtqCE;ACyqCF;IACA,aAAA;IACA,sBAAA;IACA,mBAAA;IACA,cAAA;IACA,gCAAA;IACA,mBAAA;ADtqCE;ACyqCF;IACA,cAAA;IACA,gBAAA;ADtqCE;ACyqCF;IACA,gBAAA;IACA,WAAA;ADtqCE;ACyqCF;IACA,YAAA;IACA,cAAA;IACA,kBAAA;ADtqCE;ACwqCF;IACA,kBAAA;ADtqCE;ACyqCF;IACA,cAAA;ADvqCE;ACyqCF;IACA,WAAA;IACA,kBAAA;IACA,WAAA;IACA,WAAA;IACA,OAAA;IACA,YAAA;IACA,sBAAA;ADvqCE;AC4qCF;IACA,cAAA;IACA,uBAAA;ADzqCE;AC8qCF;IACA,kBAAA;AD3qCE;AC8qCF;IACA,mBAAA;AD5qCE;ACirCF;IACA,mBAAA;AD9qCE;AACF;;AAEA,uDAAuD","file":"VueScrollRangeDatepicker.vue","sourcesContent":[".asd__fade-enter-active,\n.asd__fade-leave-active {\n  transition: all 0.2s ease;\n}\n\n.asd__fade-enter,\n.asd__fade-leave-active {\n  opacity: 0;\n}\n\n.asd__list-complete-enter,\n.asd__list-complete-leave-to {\n  opacity: 0;\n  transform: translateY(30px);\n}\n\n.asd__list-complete-leave-active {\n  position: absolute;\n  visibility: hidden;\n}\n\n*,\n*:after,\n*:before {\n  box-sizing: border-box;\n}\n\n.datepicker-trigger {\n  position: relative;\n  overflow: visible;\n}\n\n.asd__close-icon {\n  display: block;\n  border: none;\n  background: none;\n  color: #24a2b4;\n  width: 10px;\n  height: 10px;\n  position: absolute;\n  top: 9px;\n  z-index: 5;\n  right: 8px;\n  cursor: pointer;\n}\n.asd__close-icon::before {\n  content: \"\";\n  position: absolute;\n  height: 10px;\n  width: 2px;\n  background-color: #24a2b4;\n  transform: rotate(45deg);\n  top: 0;\n  left: 6px;\n}\n.asd__close-icon::after {\n  content: \"\";\n  position: absolute;\n  height: 10px;\n  width: 2px;\n  background-color: #24a2b4;\n  transform: rotate(-45deg);\n  top: 0;\n  left: 6px;\n}\n.asd__timebar {\n  margin-top: 40px;\n  position: relative;\n}\n.asd__time-input {\n  height: 40px;\n  width: 120px;\n  font-family: inherit;\n}\n.asd__time-list {\n  display: flex;\n}\n.asd__time-button {\n  border: 1px solid #eeeeee;\n  border-right: none;\n  background: none;\n  width: 80px;\n  height: 40px;\n  margin: 0;\n  padding: 10px 0;\n  display: block;\n  text-align: center;\n  cursor: pointer;\n  font-size: 14px;\n}\n.asd__time-button:hover {\n  background-color: #e2f5f7;\n}\n.asd__time-button:last-child {\n  border-right: 1px solid #eeeeee;\n}\n.asd__datepicker-header {\n  padding: 40px;\n}\n.asd__timebar-years {\n  display: flex;\n  align-items: center;\n}\n.asd__time-current-inputs {\n  display: flex;\n  margin-left: auto;\n  align-items: center;\n}\n.asd__time-current-inputs > span {\n  margin-left: 5px;\n  margin-right: 5px;\n}\n.asd__time-header {\n  display: flex;\n  align-items: center;\n}\n.asd__days-legend-wrapper {\n  display: flex;\n  top: 65px;\n  position: relative;\n  align-items: center;\n}\n.asd__timebar-monthes {\n  width: 100%;\n  position: absolute;\n  height: 20px;\n  overflow: hidden;\n  user-select: none;\n  border-radius: 3px;\n  background: #f4f4f3;\n}\n.asd__timebar-progress {\n  background-color: #f1f2f2;\n  height: 20px;\n  position: absolute;\n  top: 0;\n  left: 0;\n  padding: 0 15px;\n}\n.asd__timebar-progress > span {\n  position: absolute;\n  cursor: pointer;\n  width: 35px;\n  display: block;\n  text-align: center;\n}\n.asd__timebar-scroll {\n  position: absolute;\n  height: 40px;\n  width: 60px;\n  border: 3px solid #24a2b4;\n  display: block;\n  background-color: transparent;\n  top: -10px;\n  right: 0;\n  z-index: 1;\n  cursor: ew-resize;\n}\n.asd__timebar-scroll::after {\n  content: \"\";\n  display: block;\n  background: rgba(255, 255, 255, 0.7);\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n.asd__timebar-progress-current {\n  background-color: #c8ebef;\n  position: absolute;\n  height: 20px;\n}\n.asd__wrapper {\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  white-space: nowrap;\n  text-align: center;\n  overflow: hidden;\n  background-color: white;\n}\n.asd__wrapper--full-screen {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  border: none;\n  z-index: 100;\n}\n.asd__inner-wrapper {\n  transition: all 0.3s ease;\n  position: relative;\n}\n.asd__datepicker-header {\n  position: relative;\n  padding-left: 40px;\n  padding-right: 40px;\n}\n.asd__change-month-button {\n  position: absolute;\n  bottom: -40px;\n  z-index: 10;\n  background: white;\n}\n.asd__change-month-button--previous {\n  left: 0;\n  padding-left: 40px;\n}\n.asd__change-month-button--next {\n  right: 0;\n  padding-right: 40px;\n}\n.asd__change-month-button > button {\n  background-color: white;\n  border: none;\n  padding: 4px 8px;\n  cursor: pointer;\n}\n.asd__change-month-button > button:hover {\n  border: 1px solid #c4c4c4;\n}\n.asd__change-month-button > button > svg {\n  height: 19px;\n  width: 19px;\n  fill: #82888a;\n}\n.asd__days-legend {\n  padding: 0 10px;\n}\n.asd__day-title {\n  display: inline-block;\n  width: 14.2857142857%;\n  text-align: center;\n  margin-bottom: 4px;\n  color: rgba(0, 0, 0, 0.7);\n  font-size: 0.8em;\n  margin-left: -1px;\n  text-transform: lowercase;\n}\n.asd__day-title:nth-last-child(-n+2) {\n  color: #e45f3e;\n}\n.asd__month-table {\n  border-collapse: separate;\n  border-spacing: 0 10px;\n  background: white;\n  width: 100%;\n  max-width: 100%;\n}\n.asd__month {\n  transition: all 0.3s ease;\n  display: inline-block;\n  padding: 15px;\n}\n.asd__month--hidden {\n  height: 275px;\n  visibility: hidden;\n}\n.asd__month-name {\n  font-size: 17px;\n  text-align: center;\n  margin: 0 0 30px;\n  line-height: 1.4em;\n  text-transform: lowercase;\n  font-weight: normal;\n}\n.asd__month-name:first-letter {\n  text-transform: uppercase;\n}\n.asd__day {\n  line-height: 15px;\n  height: 15px;\n  padding: 0;\n  overflow: hidden;\n}\n.asd__day--enabled:hover {\n  background-color: #e4e7e7;\n}\n.asd__day--disabled, .asd__day--empty {\n  opacity: 0.5;\n}\n.asd__day--disabled button, .asd__day--empty button {\n  cursor: default;\n}\n.asd__day--empty {\n  border: none;\n}\n.asd__day--disabled:hover {\n  background-color: transparent;\n}\n.asd__day-button {\n  background: transparent;\n  width: 100%;\n  height: 100%;\n  border: none;\n  cursor: pointer;\n  color: #222222;\n  text-align: center;\n  user-select: none;\n  font-size: 15px;\n  font-weight: inherit;\n  padding: 0;\n  outline: 0;\n}\n.asd__day-button_weekend {\n  color: #e66b4b;\n}\n.asd__action-buttons {\n  min-height: 50px;\n  padding-top: 10px;\n  margin-bottom: 40px;\n}\n.asd__action-buttons button {\n  display: block;\n  position: relative;\n  border: none;\n  font-weight: bold;\n  font-size: 15px;\n  cursor: pointer;\n  margin: 0 auto;\n  width: 121px;\n  color: #ffffff;\n  background-color: #008489;\n  padding: 15px 20px;\n}\n.asd__mobile-header {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.2);\n  position: relative;\n  padding: 15px 15px 15px 15px !important;\n  text-align: center;\n  height: 50px;\n}\n.asd__mobile-header h3 {\n  font-size: 20px;\n  margin: 0;\n}\n.asd__mobile-only {\n  display: none;\n}\n@media (max-width: 600px) {\n  .asd__mobile-only {\n    display: block;\n  }\n}\n.asd__mobile-close {\n  position: absolute;\n  top: 7px;\n  right: 5px;\n  padding: 5px;\n  z-index: 100;\n  cursor: pointer;\n}\n.asd__mobile-close__icon {\n  position: relative;\n  font-size: 1.6em;\n  font-weight: bold;\n  padding: 0;\n}\n\n@media (min-width: 320px) and (max-width: 1280px) {\n  .asd__datepicker-header {\n    padding: 25px;\n  }\n\n  .asd__timebar {\n    display: none;\n  }\n\n  .asd__time-list {\n    display: grid;\n    grid-auto-flow: column;\n    margin-bottom: 20px;\n    overflow: auto;\n    border-bottom: 2px solid #E8E8E8;\n    padding-bottom: 2px;\n  }\n\n  .asd__time-header {\n    display: block;\n    overflow: hidden;\n  }\n\n  .asd__time-input {\n    max-width: 120px;\n    width: 100%;\n  }\n\n  .asd__time-button {\n    border: none;\n    color: #24A2B4;\n    position: relative;\n  }\n  .asd__time-button:last-child {\n    border-right: none;\n  }\n  .asd__time-button_current {\n    color: #222222;\n  }\n  .asd__time-button_current::before {\n    content: \"\";\n    position: absolute;\n    width: 100%;\n    height: 2px;\n    left: 0;\n    bottom: -2px;\n    background-color: #222;\n  }\n\n  .asd__time-current-inputs {\n    margin-left: 0;\n    justify-content: center;\n  }\n\n  .asd__change-month-button--previous {\n    padding-left: 25px;\n  }\n  .asd__change-month-button--next {\n    padding-right: 25px;\n  }\n\n  .asd__action-buttons {\n    margin-bottom: 20px;\n  }\n}\n\n/*# sourceMappingURL=VueScrollRangeDatepicker.vue.map */","<template>\n  <transition name=\"asd__fade\">\n    <div\n      :id=\"wrapperId\"\n      class=\"asd__wrapper\"\n      v-show=\"showDatepicker\"\n      :class=\"wrapperClasses\"\n      :style=\"showFullscreen ? undefined : wrapperStyles\"\n      v-click-outside=\"handleClickOutside\"\n    >\n      <button type=\"button\" class=\"asd__close-icon\" @click=\"closeDatepickerCancel\"></button>\n      <div class=\"asd__mobile-header asd__mobile-only\" v-if=\"showFullscreen\">\n        <div class=\"asd__mobile-close\" @click=\"closeDatepicker\">\n          <div class=\"asd__mobile-close-icon\">X</div>\n        </div>\n        <h3>{{ mobileHeader }}</h3>\n      </div>\n      <div class=\"asd__datepicker-header\">\n        <div class=\"asd__time-header\">\n          <div class=\"asd__time-list\">\n            <button\n              class=\"asd__time-button\" type=\"button\"\n              @click=\"setFixedDate('week')\"\n              :class=\"{ 'asd__time-button_current' : currentFixedTime === 'week' }\">\n              Неделя\n            </button>\n            <button\n              class=\"asd__time-button\"\n              type=\"button\"\n              @click=\"setFixedDate('month')\"\n              :class=\"{ 'asd__time-button_current' : currentFixedTime === 'month' }\">\n              Месяц\n            </button>\n            <button\n              class=\"asd__time-button\"\n              type=\"button\"\n              @click=\"setFixedDate('quarter')\"\n              :class=\"{ 'asd__time-button_current' : currentFixedTime === 'quarter' }\">\n              Квартал\n            </button>\n            <button\n              class=\"asd__time-button\"\n              type=\"button\"\n              @click=\"setFixedDate('year')\"\n              :class=\"{ 'asd__time-button_current' : currentFixedTime === 'year' }\">\n              Год\n            </button>\n          </div>\n          <div class=\"asd__time-current-inputs\">\n            <div class=\"asd__time-input-wrapper\">\n              <input\n                class=\"asd__time-input\"\n                type=\"text\"\n                name=\"time\"\n                id=\"start-time\"\n                v-model=\"dateFrom\"\n                @keyup.enter=\"setDateFromText(dateFrom)\"\n                autocomplete=\"off\">\n            </div>\n            <span> - </span>\n            <div class=\"asd__time-input-wrapper\">\n              <input\n                class=\"asd__time-input\"\n                type=\"text\"\n                name=\"time\"\n                id=\"end-time\"\n                v-model=\"dateTo\"\n                @keyup.enter=\"setDateFromText(dateTo)\"\n                autocomplete=\"off\">\n            </div>\n          </div>\n        </div>\n        <div class=\"asd__timebar\">\n          <div\n            class=\"asd__timebar-scroll\"\n            @mousedown=\"toggleScroll\"\n            :style=\"scrollStyles\"\n            ref=\"timebarScroll\"\n          >\n          </div>\n          <div\n            class=\"asd__timebar-monthes\"\n            ref=\"timebarWrapper\">\n            <div\n              class=\"asd__timebar-progress\"\n              :style=\"timebarStyles\">\n              <div\n                class=\"asd__timebar-progress-current\"\n                :style=\"currentTimebarStyles\"\n                ref=\"currentProgressBar\">\n              </div>\n              <span\n                v-for=\"(year, index) in currentYears\"\n                :key=\"index\"\n                :style=\"{left: year.posLeft}\"\n                @click=\"selectDate(year.fullDate, true, year.posLeft)\"\n                :data-year=\"year.item\"\n              >{{ year.item }}</span>\n            </div>\n          </div>\n        </div>\n        <div class=\"asd__change-month-button asd__change-month-button--previous\">\n          <button\n            @click=\"previousMonth\"\n            type=\"button\">\n            <svg width=\"13\" height=\"12\" viewBox=\"0 0 13 12\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n              <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M0 6L6 0V4H13V8H6V12L0 6Z\" fill=\"#24A2B4\"/>\n            </svg>\n          </button>\n        </div>\n        <div class=\"asd__change-month-button asd__change-month-button--next\">\n          <button\n            @click=\"nextMonth\"\n            type=\"button\">\n            <svg width=\"13\" height=\"12\" viewBox=\"0 0 13 12\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n              <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M13 6L7 12V8H0V4H7V0L13 6Z\"\n                    fill=\"#24A2B4\"/>\n            </svg>\n          </button>\n        </div>\n      </div>\n      <div class=\"asd__days-legend-wrapper\">\n        <div\n          class=\"asd__days-legend\"\n          v-for=\"(month, index) in showMonths\"\n          :key=\"month\"\n          :style=\"[monthWidthStyles, {left: (width * index) + 'px'}]\">\n          <div class=\"asd__day-title\" v-for=\"day in daysShort\" :key=\"day\">{{ day }}</div>\n        </div>\n      </div>\n      <div class=\"asd__inner-wrapper\" :style=\"innerStyles\"\n           @touchstart=\"touchStart($event)\"\n           @touchmove=\"touchMove($event)\"\n           @touchend=\"touchEnd($event)\">\n        <div\n          v-for=\"(month, monthIndex) in months\"\n          :key=\"month.firstDateOfMonth\"\n          class=\"asd__month\"\n          :class=\"{hidden: monthIndex === 0 || monthIndex > showMonths}\"\n          :style=\"monthWidthStyles\"\n        >\n          <div class=\"asd__month-name\">{{ month.monthName }} {{ month.year }}</div>\n\n          <table class=\"asd__month-table\" role=\"presentation\">\n            <tbody>\n            <tr class=\"asd__week\" v-for=\"(week, index) in month.weeks\" :key=\"index\">\n              <td\n                class=\"asd__day\"\n                v-for=\"({ fullDate, dayNumber }, index) in week\"\n                :key=\"index + '_' + dayNumber\"\n                :data-date=\"fullDate\"\n                :class=\"{\n                      'asd__day--enabled': dayNumber !== 0,\n                      'asd__day--empty': dayNumber === 0,\n                      'asd__day--disabled': isDisabled(fullDate),\n                      'asd__day--selected': selectedDate1 === fullDate || selectedDate2 === fullDate,\n                      'asd__day--in-range': isInRange(fullDate)\n                    }\"\n                :style=\"getDayStyles(fullDate)\"\n                @mouseover=\"() => { setHoverDate(fullDate) }\"\n              >\n                <button\n                  type=\"button\"\n                  class=\"asd__day-button\"\n                  v-if=\"dayNumber\"\n                  :date=\"fullDate\"\n                  :disabled=\"isDisabled(fullDate)\"\n                  @click=\"selectDate(fullDate)\"\n                  :class=\"{ 'asd__day-button_weekend' : isWeekendDay(fullDate, dayNumber) }\"\n                >{{ dayNumber }}\n                </button>\n              </td>\n            </tr>\n            </tbody>\n          </table>\n        </div>\n      </div>\n      <div\n        class=\"asd__action-buttons\"\n        v-if=\"mode !== 'single' && showActionButtons\">\n        <button\n          type=\"button\"\n          @click=\"apply\">{{ texts.apply }}\n        </button>\n      </div>\n    </div>\n  </transition>\n</template>\n\n<script>\nimport format from 'date-fns/format'\nimport subMonths from 'date-fns/sub_months'\nimport addMonths from 'date-fns/add_months'\nimport getDaysInMonth from 'date-fns/get_days_in_month'\nimport isBefore from 'date-fns/is_before'\nimport isEqual from 'date-fns/is_equal'\nimport isAfter from 'date-fns/is_after'\nimport isValid from 'date-fns/is_valid'\nimport {\n  debounce,\n  copyObject,\n  findAncestor,\n  randomString,\n  isWeekend,\n  reverseDate,\n  inRange,\n  isValidDate,\n} from './../helpers'\n\nexport default {\n  name: 'vueScrollRangeDatepicker',\n  props: {\n    triggerElementId: { type: String },\n    dateOne: {\n      type: [String, Date],\n      default: format(new Date()),\n      validator (val) {\n        if (!val) return true\n        return isValidDate(val)\n      },\n    },\n    dateTwo: {\n      type: [String, Date],\n      default: '',\n      validator (val) {\n        if (!val) return true\n        return isValidDate(val)\n      },\n    },\n    minDate: { type: [String, Date] },\n    endDate: { type: [String, Date] },\n    mode: { type: String, default: 'range' },\n    offsetY: { type: Number, default: 0 },\n    offsetX: { type: Number, default: 0 },\n    monthsToShow: { type: Number, default: 2 },\n    startOpen: { type: Boolean },\n    fullscreenMobile: { type: Boolean },\n    inline: { type: Boolean },\n    mobileHeader: { type: String, default: 'Select date' },\n    disabledDates: { type: Array, default: () => [] },\n    showActionButtons: { type: Boolean, default: true },\n    isTest: {\n      type: Boolean,\n      default: () => process.env.NODE_ENV === 'test',\n    },\n    dateFormat: {\n      type: String,\n      required: false,\n      default: `DD.MM.YYYY`,\n    },\n    inBorderMode: {\n      type: Boolean,\n      require: false,\n      default: true,\n    },\n    endYearForRange: {\n      type: Date,\n      required: false,\n      default () {\n        return new Date()\n      },\n    },\n    rangeBarMode: {\n      type: Boolean,\n      required: false,\n      default: true,\n    },\n    bookingMode: {\n      type: Boolean,\n      required: false,\n      default: false,\n    },\n  },\n  data () {\n    return {\n      dateTo: '',\n      dateFrom: '',\n      wrapperId: 'airbnb-style-datepicker-wrapper-' + randomString(5),\n      showDatepicker: false,\n      showMonths: 2,\n      colors: {\n        selected: '#00a699',\n        inRange: '#66e2da',\n        selectedText: '#fff',\n        text: '#565a5c',\n        inRangeBorder: '#33dacd',\n        disabled: '#fff',\n      },\n      sundayFirst: false,\n      monthNames: [\n        'January',\n        'February',\n        'March',\n        'April',\n        'May',\n        'June',\n        'July',\n        'August',\n        'September',\n        'October',\n        'November',\n        'December',\n      ],\n      days: [\n        'Monday',\n        'Tuesday',\n        'Wednesday',\n        'Thursday',\n        'Friday',\n        'Saturday',\n        'Sunday',\n      ],\n      daysShort: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],\n      texts: { apply: 'Apply', cancel: 'Cancel' },\n      startingDate: '',\n      months: [],\n      width: 250,\n      selectedDate1: '',\n      selectedDate2: '',\n      isSelectingDate1: true,\n      hoverDate: '',\n      alignRight: false,\n      triggerPosition: {},\n      triggerWrapperPosition: {},\n      viewportWidth: window.innerWidth + 'px',\n      isMobile: window.innerWidth < 768,\n      isTablet: window.innerWidth >= 768 && window.innerWidth <= 1024,\n      triggerElement: undefined,\n      currentPointScroll: 0,\n      currentTimebarWidth: 0,\n      currentTimebarLeftPos: 0,\n      currentTimebarStart: 0,\n      currentTimebarEnd: 0,\n      timebarPosLeft: 0,\n      timebarAllPosLeft: 0,\n      isFirstLoaded: true,\n      parentToggleScrollWidth: 0,\n      currentFixedTime: ``,\n    }\n  },\n  computed: {\n    currentProgress () {\n      return this.currentTimebarEnd - this.currentTimebarStart\n    },\n    currentYears () {\n      const currentDate = this.endYearForRange\n      let currentYear = currentDate.getFullYear() + 1\n      const currentYears = []\n\n      for (let i = 15; i >= 0; i--) {\n        currentYear--\n\n        currentYears.push({\n          item: currentYear + 1,\n          fullDate: `${currentYear + 1}.01.01`,\n          posLeft: `${120 * i}px`,\n          leftCoords: 120 * i,\n        })\n      }\n\n      return currentYears.reverse()\n    },\n    currentTimebarStyles () {\n      return {\n        width: `${this.currentTimebarWidth}px`,\n        left: `${this.currentTimebarLeftPos}px`,\n      }\n    },\n    timebarStyles() {\n      let timebarWidth = 0\n\n      for (let i = 0; i < this.currentYears.length - 1; i++) {\n        timebarWidth += 120\n      }\n\n      return {\n        width: `${timebarWidth}px`,\n        left: `${this.timebarAllPosLeft}px`,\n      }\n    },\n    scrollStyles () {\n      return {\n        left: `${this.currentPointScroll}px`,\n      }\n    },\n    wrapperClasses () {\n      return {\n        'asd__wrapper--datepicker-open': this.showDatepicker,\n        'asd__wrapper--full-screen': this.showFullscreen,\n        'asd__wrapper--inline': this.inline,\n      }\n    },\n    wrapperStyles () {\n      return {\n        position: this.inline ? 'static' : 'absolute',\n        top: this.inline\n          ? '0'\n          : this.triggerPosition.height + this.offsetY + 'px',\n        left: !this.alignRight\n          ? this.triggerPosition.left -\n          this.triggerWrapperPosition.left +\n          this.offsetX +\n          'px'\n          : '',\n        right: this.alignRight\n          ? this.triggerWrapperPosition.right -\n          this.triggerPosition.right +\n          this.offsetX +\n          'px'\n          : '',\n        width: this.width * this.showMonths + 'px',\n        zIndex: this.inline ? '0' : '100',\n      }\n    },\n    innerStyles () {\n      return {\n        'margin-left': this.showFullscreen\n          ? '-' + this.viewportWidth\n          : `-${this.width}px`,\n      }\n    },\n    monthWidthStyles () {\n      return {\n        width: this.showFullscreen ? this.viewportWidth : this.width + 'px',\n      }\n    },\n    showFullscreen () {\n      return this.isMobile && this.fullscreenMobile\n    },\n    datesSelected () {\n      return Boolean(\n        (this.selectedDate1 && this.selectedDate1 !== '') ||\n        (this.selectedDate2 && this.selectedDate2 !== '')\n      )\n    },\n    allDatesSelected () {\n      return Boolean(\n        this.selectedDate1 &&\n        this.selectedDate1 !== '' &&\n        this.selectedDate2 &&\n        this.selectedDate2 !== ''\n      )\n    },\n    hasMinDate () {\n      return Boolean(this.minDate && this.minDate !== '')\n    },\n    isRangeMode () {\n      return this.mode === 'range'\n    },\n    isSingleMode () {\n      return this.mode === 'single'\n    },\n    datepickerWidth () {\n      return this.width * this.showMonths\n    },\n    datePropsCompound () {\n      return this.dateOne + this.dateTwo\n    },\n    isDateTwoBeforeDateOne () {\n      if (!this.dateTwo) {\n        return false\n      }\n      return isBefore(this.dateTwo, this.dateOne)\n    },\n  },\n  watch: {\n    currentPointScroll (val) {\n      const PARENT_WIDTH = 668\n      const TOGGLE_WIDTH = 60\n      let currentWay = 1800\n\n      if (val > (PARENT_WIDTH - TOGGLE_WIDTH)) {\n        this.currentPointScroll = PARENT_WIDTH - TOGGLE_WIDTH\n      }\n\n      if (val < 0) {\n        this.currentPointScroll = 0\n      }\n\n      if (val > this.parentToggleScrollWidth / 2) {\n        this.timebarAllPosLeft = -Math.abs(val * 2)\n\n        if (val < this.parentToggleScrollWidth / 2) {\n          this.timebarAllPosLeft = -Math.abs(val * 2)\n        }\n      }\n\n      if (val < this.parentToggleScrollWidth / 2) {\n        this.timebarAllPosLeft = -Math.abs(val * 2)\n      }\n\n      let realPassedX = (val * 3)\n      for (let i = this.currentYears.length - 1; i > 0; --i) {\n        currentWay = currentWay - 120\n        let total = currentWay - realPassedX\n        let month = Math.abs(Math.ceil(total / 10))\n\n        if (inRange(realPassedX, this.currentYears[i - 1].leftCoords, this.currentYears[i].leftCoords)) {\n          if (realPassedX === 0) {\n            this.startingDate = `${this.currentYears[i - 1].item}-1-${i}`\n            this.generateMonths()\n\n            break\n          }\n\n          if (month === 0) {\n            month = 1\n          }\n\n          this.startingDate = `${this.currentYears[i - 1].item}-${month}-${i}`\n          this.generateMonths()\n        }\n      }\n    },\n    dateFrom (newVal) {\n      if (!isValidDate(newVal)) {\n        this.$emit('date-one-selected', '')\n        this.$emit('inCorrectDate', 'dateFrom')\n      }\n\n      if (newVal) {\n        this.setCurrentTimebarWidth({\n          from: newVal,\n          to: this.dateTo,\n        })\n      }\n    },\n    dateTo (newVal) {\n      if (!isValidDate(newVal)) {\n        this.$emit('date-two-selected', '')\n        this.$emit('inCorrectDate', 'dateTo')\n      }\n\n      if (newVal) {\n        this.setCurrentTimebarWidth({\n          from: this.dateFrom,\n          to: newVal,\n        })\n      } else {\n        this.currentTimebarWidth = 0\n      }\n    },\n    selectedDate1 (newValue, oldValue) {\n      let newDate =\n        !newValue || newValue === '' ? '' : format(newValue, this.dateFormat)\n\n      this.$emit('date-one-selected', newDate)\n      this.dateFrom = reverseDate(newDate)\n    },\n    selectedDate2 (newValue, oldValue) {\n      let newDate =\n        !newValue || newValue === '' ? '' : format(newValue, this.dateFormat)\n\n      this.$emit('date-two-selected', newDate)\n      this.dateTo = reverseDate(newDate)\n    },\n    mode (newValue, oldValue) {\n      this.setStartDates()\n    },\n    datePropsCompound (newValue) {\n      if (this.dateOne !== this.selectedDate1) {\n        this.startingDate = this.dateOne\n        this.setStartDates()\n        this.generateMonths()\n      }\n\n      if (this.bookingMode) {\n        if (this.isDateTwoBeforeDateOne) {\n          this.selectedDate2 = ''\n          this.$emit('date-two-selected', '')\n        }\n      }\n    },\n  },\n  created () {\n    this.setupDatepicker()\n\n    if (this.sundayFirst) {\n      this.setSundayToFirstDayInWeek()\n    }\n\n    this._handleWindowResizeEvent = debounce(() => {\n      this.positionDatepicker()\n      this.setStartDates()\n    }, 200)\n    this._handleWindowClickEvent = event => {\n      if (event.target.id === this.triggerElementId) {\n        event.stopPropagation()\n        event.preventDefault()\n        this.toggleDatepicker()\n      }\n    }\n    window.addEventListener('resize', this._handleWindowResizeEvent)\n    window.addEventListener('click', this._handleWindowClickEvent)\n  },\n  mounted () {\n    this.triggerElement = this.isTest\n      ? document.createElement('input')\n      : document.getElementById(this.triggerElementId)\n\n    this.setStartDates()\n    this.generateMonths()\n\n    if (this.startOpen || this.inline) {\n      this.openDatepicker()\n    }\n\n    this.triggerElement.addEventListener('keyup', this.handleTriggerInput)\n  },\n  beforeDestroy () {\n    this.isFirstLoaded = true\n  },\n  destroyed () {\n    window.removeEventListener('resize', this._handleWindowResizeEvent)\n    window.removeEventListener('click', this._handleWindowClickEvent)\n\n    this.triggerElement.removeEventListener('keyup', this.handleTriggerInput)\n  },\n  methods: {\n    setCurrentTimebarWidth (date) {\n      const wrapper = document.querySelector(`#${this.wrapperId}`)\n      const years = Array.from(wrapper.querySelectorAll(`.asd__timebar-progress > span`))\n\n      function getInt (val) {\n        return parseInt(val.style.left)\n      }\n\n      if (date.to) {\n        const dateFrom = years.find(it => it.textContent.trim() === date.from.split('.')[2])\n        const dateTo = years.find(it => it.textContent.trim() === date.to.split('.')[2])\n\n        if (dateFrom && dateTo) {\n          if (getInt(dateFrom) > getInt(dateTo)) {\n            this.currentTimebarWidth = 0\n            return\n          }\n        }\n\n        if (dateFrom) {\n          this.currentTimebarStart = getInt(dateFrom)\n          this.currentTimebarLeftPos = getInt(dateFrom)\n\n          this.currentPointScroll = getInt(dateFrom) / 3\n        }\n\n        if (dateTo) {\n          this.currentTimebarEnd = getInt(dateTo)\n        }\n\n        this.currentTimebarWidth = this.currentProgress\n      } else {\n        const dateFrom = years.find(it => it.textContent.trim() === date.from.split('.')[2])\n\n        this.currentTimebarStart = getInt(dateFrom)\n        this.currentTimebarLeftPos = getInt(dateFrom)\n        this.currentPointScroll = getInt(dateFrom) / 3\n      }\n    },\n    touchStart (e) {\n\n    },\n    touchMove (e) {\n\n    },\n    touchEnd (e) {\n\n    },\n    setFixedDate (type) {\n      this.currentFixedTime = type\n\n      let currentDate = new Date()\n      let startDate\n\n      switch (type) {\n        case 'week':\n          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7)\n          break\n\n        case 'month':\n          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate())\n          break\n\n        case 'quarter':\n          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, currentDate.getDate())\n          break\n\n        case 'year':\n          startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate())\n          break\n      }\n\n      this.selectedDate1 = startDate\n      this.selectedDate2 = currentDate\n      this.startingDate = startDate\n\n      this.generateMonths()\n    },\n    toggleScroll (e) {\n      e.preventDefault()\n      let currentPointX = e.clientX\n\n      const onMouseMove = moveEvt => {\n        moveEvt.preventDefault()\n        let pressedX = currentPointX - moveEvt.clientX\n        currentPointX = moveEvt.clientX\n        let passedX = e.target.offsetLeft - pressedX\n        this.timebarPosLeft = -Math.abs(passedX * 2)\n        this.currentPointScroll = passedX\n      }\n\n      let onMouseUp = upEvt => {\n        upEvt.preventDefault()\n        document.removeEventListener('mousemove', onMouseMove)\n        document.removeEventListener('mouseup', onMouseUp)\n      }\n      document.addEventListener('mousemove', onMouseMove)\n      document.addEventListener('mouseup', onMouseUp)\n    },\n    isWeekendDay (date, day) {\n      let weekends = isWeekend(date)\n\n      return weekends.sat.some(elem => elem === day) || weekends.sun.some(elem => elem === day)\n    },\n    getDayStyles (date) {\n      const isSelected = this.isSelected(date)\n      const isInRange = this.isInRange(date)\n      const isDisabled = this.isDisabled(date)\n\n      let styles = {\n        width: (this.width - 30) / 7 + 'px',\n        background: isSelected\n          ? this.colors.selected\n          : isInRange ? this.colors.inRange : '',\n        color: isSelected\n          ? this.colors.selectedText\n          : isInRange ? this.colors.selectedText : this.colors.text,\n      }\n\n      if (isDisabled) {\n        styles.background = this.colors.disabled\n      }\n      return styles\n    },\n    handleClickOutside (event) {\n      if (\n        event.target.id === this.triggerElementId ||\n        !this.showDatepicker ||\n        this.inline\n      ) {\n        return\n      }\n      this.closeDatepicker()\n    },\n    handleTriggerInput (event) {\n      const keys = {\n        arrowDown: 40,\n        arrowUp: 38,\n        arrowRight: 39,\n        arrowLeft: 37,\n      }\n      if (\n        event.keyCode === keys.arrowDown &&\n        !event.shiftKey &&\n        !this.showDatepicker\n      ) {\n        this.openDatepicker()\n      } else if (\n        event.keyCode === keys.arrowUp &&\n        !event.shiftKey &&\n        this.showDatepicker\n      ) {\n        this.closeDatepicker()\n      } else if (\n        event.keyCode === keys.arrowRight &&\n        !event.shiftKey &&\n        this.showDatepicker\n      ) {\n        this.nextMonth()\n      } else if (\n        event.keyCode === keys.arrowLeft &&\n        !event.shiftKey &&\n        this.showDatepicker\n      ) {\n        this.previousMonth()\n      } else {\n        if (this.mode === 'single') {\n          this.setDateFromText(event.target.value)\n        }\n      }\n    },\n    setDateFromText (value) {\n      if (value.length < 10) {\n        return\n      }\n      // make sure format is either 'YYYY-MM-DD' or 'DD.MM.YYYY'\n      const isFormatYearFirst = value.match(\n        /^(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/,\n      )\n      const isFormatDayFirst = value.match(\n        /^(0[1-9]|1[0-9]|2[0-9]|3[0-1])[.](0[1-9]|1[0-2])[.](\\d{4})$/,\n      )\n\n      if (!isFormatYearFirst && !isFormatDayFirst) {\n        return\n      }\n      const valueAsDateObject = new Date(value)\n      if (!isValid(valueAsDateObject)) {\n        return\n      }\n      const formattedDate = format(valueAsDateObject, this.dateFormat)\n      if (\n        this.isDateDisabled(formattedDate) ||\n        this.isBeforeMinDate(formattedDate) ||\n        this.isAfterEndDate(formattedDate)\n      ) {\n        return\n      }\n      this.startingDate = subMonths(formattedDate, 1)\n      this.generateMonths()\n      this.selectDate(formattedDate)\n    },\n    generateMonths () {\n      this.months = []\n      for (let i = 0; i < this.showMonths + 3; i++) {\n        this.months.push(this.getMonth(this.startingDate))\n        this.startingDate = this.addMonths(this.startingDate)\n      }\n    },\n    setupDatepicker () {\n      if (this.$options.sundayFirst) {\n        this.sundayFirst = copyObject(this.$options.sundayFirst)\n      }\n\n      this.$nextTick(function () {\n        this.parentToggleScrollWidth = this.$refs.timebarScroll.parentNode.offsetWidth - this.$refs.timebarScroll.offsetWidth\n      })\n\n      if (this.$options.colors) {\n        const colors = copyObject(this.$options.colors)\n        this.colors.selected = colors.selected || this.colors.selected\n        this.colors.inRange = colors.inRange || this.colors.inRange\n        this.colors.selectedText =\n          colors.selectedText || this.colors.selectedText\n        this.colors.text = colors.text || this.colors.text\n        this.colors.inRangeBorder =\n          colors.inRangeBorder || this.colors.inRangeBorder\n        this.colors.disabled = colors.disabled || this.colors.disabled\n      }\n      if (this.$options.monthNames && this.$options.monthNames.length === 12) {\n        this.monthNames = copyObject(this.$options.monthNames)\n      }\n      if (this.$options.days && this.$options.days.length === 7) {\n        this.days = copyObject(this.$options.days)\n      }\n      if (this.$options.daysShort && this.$options.daysShort.length === 7) {\n        this.daysShort = copyObject(this.$options.daysShort)\n      }\n      if (this.$options.texts) {\n        const texts = copyObject(this.$options.texts)\n        this.texts.apply = texts.apply || this.texts.apply\n        this.texts.cancel = texts.cancel || this.texts.cancel\n      }\n    },\n    setStartDates (date) {\n      let startDate\n\n      if (date) {\n        startDate = date\n      } else {\n        startDate = this.dateOne || new Date()\n      }\n\n      if (this.hasMinDate && isBefore(startDate, this.minDate)) {\n        startDate = this.minDate\n      }\n      this.startingDate = this.subtractMonths(startDate)\n      this.selectedDate1 = this.dateOne\n      this.selectedDate2 = this.dateTwo\n    },\n    setSundayToFirstDayInWeek () {\n      const lastDay = this.days.pop()\n      this.days.unshift(lastDay)\n      const lastDayShort = this.daysShort.pop()\n      this.daysShort.unshift(lastDayShort)\n    },\n    getMonth (date) {\n      const firstDateOfMonth = format(date, 'YYYY-MM-01')\n      const year = format(date, 'YYYY')\n      const monthNumber = parseInt(format(date, 'M'))\n      const monthName = this.monthNames[monthNumber - 1]\n\n      return {\n        year,\n        firstDateOfMonth,\n        monthName,\n        monthNumber,\n        weeks: this.getWeeks(firstDateOfMonth),\n      }\n    },\n    getWeeks (date) {\n      const weekDayNotInMonth = { dayNumber: 0 }\n      const daysInMonth = getDaysInMonth(date)\n      const year = format(date, 'YYYY')\n      const month = format(date, 'MM')\n      let firstDayInWeek = parseInt(format(date, this.sundayFirst ? 'd' : 'E'))\n      if (this.sundayFirst) {\n        firstDayInWeek++\n      }\n      let weeks = []\n      let week = []\n\n      // add empty days to get first day in correct position\n      for (let s = 1; s < firstDayInWeek; s++) {\n        week.push(weekDayNotInMonth)\n      }\n      for (let d = 0; d < daysInMonth; d++) {\n        let isLastDayInMonth = d >= daysInMonth - 1\n        let dayNumber = d + 1\n        let dayNumberFull = dayNumber < 10 ? '0' + dayNumber : dayNumber\n        week.push({\n          dayNumber,\n          dayNumberFull: dayNumberFull,\n          fullDate: year + '-' + month + '-' + dayNumberFull,\n        })\n\n        if (week.length === 7) {\n          weeks.push(week)\n          week = []\n        } else if (isLastDayInMonth) {\n          for (let i = 0; i < 7 - week.length; i++) {\n            week.push(weekDayNotInMonth)\n          }\n          weeks.push(week)\n          week = []\n        }\n      }\n      return weeks\n    },\n    selectDate (date, isFixed) {\n      this.currentFixedTime = ``\n      const reversedDate = reverseDate(date)\n\n      if (isFixed) {\n        this.startingDate = reversedDate\n        this.generateMonths()\n      }\n\n      if (\n        this.isBeforeMinDate(reversedDate) ||\n        this.isAfterEndDate(reversedDate) ||\n        this.isDateDisabled(reversedDate)\n      ) {\n        return\n      }\n\n      if (this.mode === 'single') {\n        this.selectedDate1 = reversedDate\n        this.closeDatepicker()\n        return\n      }\n\n      if (this.isSelectingDate1 || isBefore(reversedDate, this.selectedDate1)) {\n        this.selectedDate1 = reversedDate\n        this.isSelectingDate1 = false\n\n        if (!this.bookingMode) {\n          this.selectedDate2 = ``\n        }\n\n        if (isBefore(this.selectedDate2, reversedDate)) {\n          this.selectedDate2 = ``\n        }\n      } else {\n        this.selectedDate2 = reversedDate\n        this.isSelectingDate1 = true\n\n        if (isAfter(this.selectedDate1, reversedDate)) {\n          this.selectedDate1 = ``\n        }\n      }\n    },\n    setHoverDate (date) {\n      if (this.bookingMode) {\n        this.hoverDate = date\n      }\n    },\n    isSelected (date) {\n      if (!date) {\n        return\n      }\n      return this.selectedDate1 === date || this.selectedDate2 === date\n    },\n    isInRange (date) {\n      if (this.inBorderMode || !this.allDatesSelected) {\n        return isEqual(date, this.selectedDate1) || (\n          (isAfter(date, this.selectedDate1) &&\n            isBefore(date, this.selectedDate2)) ||\n          (isAfter(date, this.selectedDate1) &&\n            isBefore(date, this.hoverDate) &&\n            !this.allDatesSelected)\n        ) || isEqual(date, this.selectedDate2)\n      }\n\n      if (!this.allDatesSelected || this.isSingleMode) {\n        return false\n      }\n\n      return (\n        (isAfter(date, this.selectedDate1) &&\n          isBefore(date, this.selectedDate2)) ||\n        (isAfter(date, this.selectedDate1) &&\n          isBefore(date, this.hoverDate) &&\n          !this.allDatesSelected)\n      )\n    },\n    isBeforeMinDate (date) {\n      if (!this.minDate) {\n        return false\n      }\n      return isBefore(date, this.minDate)\n    },\n    isAfterEndDate (date) {\n      if (!this.endDate) {\n        return false\n      }\n      return isAfter(date, this.endDate)\n    },\n    isDateDisabled (date) {\n      return this.disabledDates.indexOf(date) > -1\n    },\n    isDisabled (date) {\n      return (\n        this.isDateDisabled(date) ||\n        this.isBeforeMinDate(date) ||\n        this.isAfterEndDate(date)\n      )\n    },\n    previousMonth () {\n      this.currentPointScroll = this.currentPointScroll - 4\n\n      this.startingDate = this.subtractMonths(this.months[0].firstDateOfMonth)\n      this.months.unshift(this.getMonth(this.startingDate))\n      this.months.splice(this.months.length - 1, 1)\n    },\n    nextMonth () {\n      this.currentPointScroll = this.currentPointScroll + 4\n\n      this.startingDate = this.addMonths(\n        this.months[this.months.length - 1].firstDateOfMonth,\n      )\n      this.months.push(this.getMonth(this.startingDate))\n      setTimeout(() => {\n        this.months.splice(0, 1)\n      }, 100)\n    },\n    subtractMonths (date) {\n      return format(subMonths(date, 1), this.dateFormat)\n    },\n    addMonths (date) {\n      return format(addMonths(date, 1), this.dateFormat)\n    },\n    toggleDatepicker () {\n      if (this.showDatepicker) {\n        this.closeDatepicker()\n      } else {\n        this.openDatepicker()\n      }\n    },\n    openDatepicker () {\n      this.positionDatepicker()\n      this.setStartDates()\n      this.triggerElement.classList.add('datepicker-open')\n      this.showDatepicker = true\n      this.initialDate1 = this.dateOne\n      this.initialDate2 = this.dateTwo\n    },\n    closeDatepickerCancel () {\n      if (this.showDatepicker) {\n        this.selectedDate1 = this.initialDate1\n        this.selectedDate2 = this.initialDate2\n        this.closeDatepicker()\n      }\n    },\n    closeDatepicker () {\n      if (this.inline) {\n        return\n      }\n      this.showDatepicker = false\n      this.triggerElement.classList.remove('datepicker-open')\n      this.$emit('closed')\n    },\n    apply () {\n      if (this.dateTo) {\n        this.$emit('date-one-selected', reverseDate(this.dateFrom))\n      }\n\n      if (this.dateFrom) {\n        this.$emit('date-two-selected', reverseDate(this.dateTo))\n      }\n\n      this.$emit('apply')\n      this.closeDatepicker()\n    },\n    positionDatepicker () {\n      const triggerWrapperElement = findAncestor(\n        this.triggerElement,\n        '.datepicker-trigger',\n      )\n      this.triggerPosition = this.triggerElement.getBoundingClientRect()\n      if (triggerWrapperElement) {\n        this.triggerWrapperPosition = triggerWrapperElement.getBoundingClientRect()\n      } else {\n        this.triggerWrapperPosition = { left: 0, right: 0 }\n      }\n\n      const viewportWidth =\n        document.documentElement.clientWidth || window.innerWidth\n      this.viewportWidth = viewportWidth + 'px'\n      this.isMobile = viewportWidth < 768\n      this.isTablet = viewportWidth >= 768 && viewportWidth <= 1024\n      this.showMonths = this.isMobile\n        ? 1\n        : this.isTablet && this.monthsToShow > 2 ? 2 : this.monthsToShow\n\n      this.$nextTick(function () {\n        const datepickerWrapper = document.getElementById(this.wrapperId)\n        if (!this.triggerElement || !datepickerWrapper) {\n          return\n        }\n\n        const rightPosition =\n          this.triggerElement.getBoundingClientRect().left +\n          datepickerWrapper.getBoundingClientRect().width\n        this.alignRight = rightPosition > viewportWidth\n      })\n    },\n  },\n}\n</script>\n\n<style lang=\"scss\">\n  @import './../styles/transitions';\n\n  $tablet: 768px;\n  $color-gray: rgba(0, 0, 0, 0.2);\n  $border-normal: 1px solid $color-gray;\n  $border: 1px solid #e4e7e7;\n  $transition-time: 0.3s;\n\n  *,\n  *:after,\n  *:before {\n    box-sizing: border-box;\n  }\n\n  .datepicker-trigger {\n    position: relative;\n    overflow: visible;\n  }\n\n  .asd {\n\n    &__close-icon {\n      display: block;\n      border: none;\n      background: none;\n      color: #24a2b4;\n      width: 10px;\n      height: 10px;\n      position: absolute;\n      top: 9px;\n      z-index: 5;\n      right: 8px;\n      cursor: pointer;\n\n      &::before {\n        content: \"\";\n        position: absolute;\n        height: 10px;\n        width: 2px;\n        background-color: #24a2b4;\n        transform: rotate(45deg);\n        top: 0;\n        left: 6px;\n      }\n\n      &::after {\n        content: \"\";\n        position: absolute;\n        height: 10px;\n        width: 2px;\n        background-color: #24a2b4;\n        transform: rotate(-45deg);\n        top: 0;\n        left: 6px;\n      }\n    }\n\n    &__timebar {\n      margin-top: 40px;\n      position: relative;\n    }\n\n    &__time-input {\n      height: 40px;\n      width: 120px;\n      font-family: inherit;\n    }\n\n    &__time-list {\n      display: flex;\n    }\n\n    &__time-button {\n      border: 1px solid #eeeeee;\n      border-right: none;\n      background: none;\n      width: 80px;\n      height: 40px;\n      margin: 0;\n      padding: 10px 0;\n      display: block;\n      text-align: center;\n      cursor: pointer;\n      font-size: 14px;\n\n      &:hover {\n        background-color: #e2f5f7;\n      }\n\n      &:last-child {\n        border-right: 1px solid #eeeeee;\n      }\n    }\n\n    &__datepicker-header {\n      padding: 40px\n    }\n\n    &__timebar-years {\n      display: flex;\n      align-items: center;\n    }\n\n    &__time-current-inputs {\n      display: flex;\n      margin-left: auto;\n      align-items: center;\n\n      & > span {\n        margin-left: 5px;\n        margin-right: 5px;\n      }\n    }\n\n    &__time-header {\n      display: flex;\n      align-items: center;\n    }\n\n    &__days-legend-wrapper {\n      display: flex;\n      top: 65px;\n      position: relative;\n      align-items: center;\n    }\n\n    &__timebar-monthes {\n      width: 100%;\n      position: absolute;\n      height: 20px;\n      overflow: hidden;\n      user-select: none;\n      border-radius: 3px;\n      background: #f4f4f3;\n    }\n\n    &__timebar-progress {\n      background-color: #f1f2f2;\n      height: 20px;\n      position: absolute;\n      top: 0;\n      left: 0;\n      padding: 0 15px;\n\n      & > span {\n        position: absolute;\n        cursor: pointer;\n        width: 35px;\n        display: block;\n        text-align: center\n      }\n    }\n\n    &__timebar-scroll {\n      position: absolute;\n      height: 40px;\n      width: 60px;\n      border: 3px solid #24a2b4;\n      display: block;\n      background-color: transparent;\n      top: -10px;\n      right: 0;\n      z-index: 1;\n      cursor: ew-resize;\n\n      &::after {\n        content: '';\n        display: block;\n        background: rgba(255, 255, 255, .7);\n        position: absolute;\n        top: 0;\n        bottom: 0;\n        left: 0;\n        right: 0;\n      }\n    }\n\n    &__timebar-progress-current {\n      background-color: #c8ebef;\n      position: absolute;\n      height: 20px;\n    }\n\n    &__wrapper {\n      border: $border-normal;\n      white-space: nowrap;\n      text-align: center;\n      overflow: hidden;\n      background-color: white;\n\n      &--full-screen {\n        position: fixed;\n        top: 0;\n        right: 0;\n        bottom: 0;\n        left: 0;\n        border: none;\n        z-index: 100;\n      }\n    }\n\n    &__inner-wrapper {\n      transition: all $transition-time ease;\n      position: relative;\n    }\n\n    &__datepicker-header {\n      position: relative;\n      padding-left: 40px;\n      padding-right: 40px;\n    }\n\n    &__change-month-button {\n      position: absolute;\n      bottom: -40px;\n      z-index: 10;\n      background: white;\n\n      &--previous {\n        left: 0;\n        padding-left: 40px;\n      }\n\n      &--next {\n        right: 0;\n        padding-right: 40px;\n      }\n\n      > button {\n        background-color: white;\n        border: none;\n        padding: 4px 8px;\n        cursor: pointer;\n\n        &:hover {\n          border: 1px solid #c4c4c4;\n        }\n\n        > svg {\n          height: 19px;\n          width: 19px;\n          fill: #82888a;\n        }\n      }\n    }\n\n    &__days-legend {\n      padding: 0 10px;\n    }\n\n    &__day-title {\n      display: inline-block;\n      width: percentage(1/7);\n      text-align: center;\n      margin-bottom: 4px;\n      color: rgba(0, 0, 0, 0.7);\n      font-size: 0.8em;\n      margin-left: -1px;\n      text-transform: lowercase;\n\n      &:nth-last-child(-n+2) {\n        color: #e45f3e;\n      }\n\n    }\n\n    &__month-table {\n      border-collapse: separate;\n      border-spacing: 0 10px;\n      background: white;\n      width: 100%;\n      max-width: 100%;\n    }\n\n    &__month {\n      transition: all $transition-time ease;\n      display: inline-block;\n      padding: 15px;\n\n      &--hidden {\n        height: 275px;\n        visibility: hidden;\n      }\n    }\n\n    &__month-name {\n      font-size: 17px;\n      text-align: center;\n      margin: 0 0 30px;\n      line-height: 1.4em;\n      text-transform: lowercase;\n      font-weight: normal;\n\n      &:first-letter {\n        text-transform: uppercase;\n      }\n\n    }\n\n    &__day {\n      $size: 15px;\n      line-height: $size;\n      height: $size;\n      padding: 0;\n      overflow: hidden;\n\n      &--enabled {\n        &:hover {\n          background-color: #e4e7e7;\n        }\n      }\n\n      &--disabled,\n      &--empty {\n        opacity: 0.5;\n\n        button {\n          cursor: default;\n        }\n      }\n\n      &--empty {\n        border: none;\n      }\n\n      &--disabled {\n        &:hover {\n          background-color: transparent;\n        }\n      }\n    }\n\n    &__day-button {\n      background: transparent;\n      width: 100%;\n      height: 100%;\n      border: none;\n      cursor: pointer;\n      color: #222222;\n      text-align: center;\n      user-select: none;\n      font-size: 15px;\n      font-weight: inherit;\n      padding: 0;\n      outline: 0;\n\n      &_weekend {\n        color: #e66b4b;\n      }\n    }\n\n    &__action-buttons {\n      min-height: 50px;\n      padding-top: 10px;\n      margin-bottom: 40px;\n\n      button {\n        display: block;\n        position: relative;\n        border: none;\n        font-weight: bold;\n        font-size: 15px;\n        cursor: pointer;\n        margin: 0 auto;\n        width: 121px;\n        color: #ffffff;\n        background-color: #008489;\n        padding: 15px 20px;\n      }\n    }\n\n    &__mobile-header {\n      border-bottom: $border-normal;\n      position: relative;\n      padding: 15px 15px 15px 15px !important;\n      text-align: center;\n      height: 50px;\n\n      h3 {\n        font-size: 20px;\n        margin: 0;\n      }\n    }\n\n    &__mobile-only {\n      display: none;\n      @media (max-width: 600px) {\n        display: block;\n      }\n    }\n\n    &__mobile-close {\n      position: absolute;\n      top: 7px;\n      right: 5px;\n      padding: 5px;\n      z-index: 100;\n      cursor: pointer;\n\n      &__icon {\n        position: relative;\n        font-size: 1.6em;\n        font-weight: bold;\n        padding: 0;\n      }\n    }\n  }\n\n  @media (min-width: 320px) and (max-width: 1280px) {\n\n    .asd__datepicker-header {\n      padding: 25px;\n    }\n\n    .asd__timebar {\n      display: none\n    }\n\n    .asd__time-list {\n      display: grid;\n      grid-auto-flow: column;\n      margin-bottom: 20px;\n      overflow: auto;\n      border-bottom: 2px solid #E8E8E8;\n      padding-bottom: 2px;\n    }\n\n    .asd__time-header {\n      display: block;\n      overflow: hidden;\n    }\n\n    .asd__time-input {\n      max-width: 120px;\n      width: 100%;\n    }\n\n    .asd__time-button {\n      border: none;\n      color: #24A2B4;\n      position: relative;\n\n      &:last-child {\n        border-right: none;\n      }\n\n      &_current {\n        color: #222222;\n\n        &::before {\n          content: '';\n          position: absolute;\n          width: 100%;\n          height: 2px;\n          left: 0;\n          bottom: -2px;\n          background-color: #222;\n        }\n      }\n    }\n\n    .asd__time-current-inputs {\n      margin-left: 0;\n      justify-content: center;\n    }\n\n    .asd__change-month-button {\n\n      &--previous {\n        padding-left: 25px;\n      }\n\n      &--next {\n        padding-right: 25px;\n      }\n\n    }\n\n    .asd__action-buttons {\n      margin-bottom: 20px;\n    }\n\n  }\n\n</style>\n"]}, media: undefined });

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
