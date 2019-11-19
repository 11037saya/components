(function () {
    var tpl = '<li class="cl-item" :class="status" @click="selectDate">'+
        '<span class="holiday-tip">{{holidayText}}</span>'+
        '<em>{{date}}</em>'+
        '<span class="remind">{{remindText}}</span>'+
        '<p class="cl-item-tips" v-if="this.status.inDay && !outDay">请选择离店日期</p>'+
    '</li>';

    Vue.component('date-module', {
        template: tpl,
        props: ["curTime", "inDay", "outDay", "year", "month", "date", "formattedholiday"],
        data: function () {
            return {
                timestamp: new Date(this.year + "/" + this.month + "/" + this.date).getTime(),
                holidayText: '',
                isStandout: false,
            }
        },
        computed: {
            status: function() {
                return {
                    inDay: this.timestamp == this.inDay,
                    outDay: this.timestamp == this.outDay,
                    daypast: this.curTime - this.timestamp > 30 * 3600 * 1000,// 凌晨0至6点特殊处理
                    "day-range": this.timestamp > this.inDay && this.timestamp < this.outDay,
                    "stand-out": this.isStandout,
                }
            },
            remindText: function() {
                if (this.status.inDay) {
                    return '入住';
                } else if (this.status.outDay) {
                    return '离店';
                } else {
                    return '';
                }
            },
            isWeekend: function() {
                var day = new Date(this.year + "/" + this.month + "/" + this.date).getDay();
                var bool;
                switch(day) {
                    case 0:
                        bool = true;
                        break;
                    case 6:
                        bool = true;
                        break;
                    default:
                        bool = false;
                }
                return bool;
            }
        },
        watch: {
            formattedholiday: function(newVal) {
                this.initData();
            }
        },
        methods: {
            initData: function() {
                var holidayName,
                    isHolidayDate,
                    isWorkDate;

                holidayName = this.getObjectVal(this.timestamp, this.formattedholiday.holiday);
                isHolidayDate = this.isInArray(this.timestamp, this.formattedholiday.holidayDate);
                isWorkDate = this.isInArray(this.timestamp, this.formattedholiday.workDate);

                if (holidayName) {
                    this.holidayText = holidayName;
                } else if (!holidayName && isHolidayDate) {
                    this.holidayText = '休';
                } else if (isWorkDate) {
                    this.holidayText = '班';
                }

                /**
                * 周末&&节假日&&休假 颜色突出
                * 周末&&节假日&&补班 不突出
                * 周末&&补班 不突出
                * 周末 突出
                **/
                if (this.isWeekend && holidayName && isHolidayDate) {
                    this.isStandout = true;
                } else if (this.isWeekend && holidayName && isWorkDate) {
                    this.isStandout = false;
                } else if (this.isWeekend && isWorkDate) {
                    this.isStandout = false;
                } else if (this.isWeekend) {
                    this.isStandout = true;
                }

                /**
                * 周一至周五&&节假日&&休假 颜色突出
                * 周一至周五&&节假日 不突出
                * 周一至周五&&休假 不突出
                * 周一至周五 不突出
                **/
                if (!this.isWeekend && holidayName && isHolidayDate) {
                    this.isStandout = true;
                } else if (!this.isWeekend && holidayName) {
                    this.isStandout = false;
                } else if (!this.isWeekend && isHolidayDate) {
                    this.isStandout = true;
                } else if (!this.isWeekend) {
                    this.isStandout = false;
                }
            },
            isInArray: function(k, arr) {
                if (!arr) {return false;}
                for (var i = 0; i < arr.length; i++) {
                    if (k == arr[i]) {
                        return true;
                    }
                }
                return false;
            },
            getObjectVal: function(k, o) {
                for(var key in o){
                    if (key == k) {
                        return o[key];
                    }
                }
                return null;
            },
            selectDate: function() {

                if (this.status.daypast) {
                    return;
                }

                if (this.outDay || this.timestamp < this.inDay) {
                    this.$emit("selectDate", {
                        in: this.timestamp,
                        out: ""
                    });
                } else {
                    this.$emit("selectDate", {
                        in: this.inDay,
                        out: this.timestamp
                    });
                }
            }
        },
        mounted: function() {
            this.initData();
        }
    });
})()