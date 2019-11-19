(function () {
    var Toast = Fanli.Utility.Toast;

    var tpl = "<div>"+
        "<div class='calendar-wrap' :class='{showCal:!show}'>"+
            "<div class='calendar-header'>"+
                "<span class='close-calendar' @click='hideCalendar'>取消</span>"+
                "<p class='calendar-title bold'>请选择日期</p>"+
            "</div>"+
            "<ul class='calendar-grid weekend-box'>"+
                "<li class='cl-item-week sunday'>日</li>"+
                "<li class='cl-item-week'>一</li>"+
                "<li class='cl-item-week'>二</li>"+
                "<li class='cl-item-week'>三</li>"+
                "<li class='cl-item-week'>四</li>"+
                "<li class='cl-item-week'>五</li>"+
                "<li class='cl-item-week saturday'>六</li>"+
            "</ul>"+
            "<div class='calendar-body'>"+
                "<div v-for='(item,index) in calendarData' :key='index'>"+
                    "<h2 class='calendar-month'>{{item.year}}年{{item.month}}月</h2>"+
                    "<ul class='calendar-grid'>"+
                        "<li class='cl-item' v-for=\"n in item.blankHolder\" :key=\"n\"></li>"+
                        '<date-module v-for="n in item.dates" :key="n" :curTime="curTime" :inDay="inDay" :outDay="outDay" :year="item.year" :month="item.month" :date="n" :formattedholiday="formattedholiday" @selectDate="selectDate" />'+
                    "</ul>"+
                "</div>"+
            "</div>"+
        "</div>"+
        "<div class=\"calendar-mask\" v-show=\"show\" @click=\"hideCalendar\"></div>"+
    "</div>";

    var calendar = Vue.component('calendar', {
        template: tpl,
        props: {
            "months": {
                type: Number,
                default: 3
            },
            "show": {
                type: Boolean,
                default: false
            },
            "formattedholiday": {
                type: Object,
                default: {}
            },
            "inDateTime": {
                type: Number,
                default: 0
            },
            "outDateTime": {
                type: Number,
                default:0
            }
        },
        data: function () {
            return {
                calendarData: [],
                curYear: "",
                curMonth: "",
                inDay:"",
                outDay:"",
                today: "",
                date: new Date()
            }
        },
        computed: {
            curTime: function() {
                return this.date.getTime();
            }
        },
        mounted: function () {
            this.initDate();
            // console.log(this.formattedholiday);
        },
        methods: {
            initDate: function() {
                var curhours = this.date.getHours();
                var oneDayTime = 24*60*60*1000;
                var prevTime = this.date.getTime() - oneDayTime;
                var nextTime = this.date.getTime() + oneDayTime;
                var curYear = this.date.getFullYear();
                var prevYear = new Date(prevTime).getFullYear();
                var nextYear = new Date(nextTime).getFullYear();
                var curMonth = this.date.getMonth() + 1;
                var prevMonth = new Date(prevTime).getMonth() + 1;
                var nextMonth = new Date(nextTime).getMonth() + 1;
                var curDate = this.date.getDate();
                var prevDate = new Date(prevTime).getDate();
                var nextDate = new Date(nextTime).getDate();

                if (curhours >= 0 && curhours <= 5) {
                    this.curYear = prevYear;
                    this.curMonth = prevMonth;
                    this.today = prevDate;
                    this.inDay = this.inDateTime == 0?new Date(this.curYear+"/"+this.curMonth+"/"+this.today).getTime(): this.inDateTime;
                    this.outDay = this.outDateTime == 0?new Date(curYear+"/"+curMonth+"/"+curDate).getTime(): this.outDateTime;
                } else {
                    this.curYear = curYear;
                    this.curMonth = curMonth;
                    this.today = curDate;
                    this.inDay = this.inDateTime == 0?new Date(this.curYear+"/"+this.curMonth+"/"+this.today).getTime(): this.inDateTime;
                    this.outDay = this.outDateTime == 0?new Date(nextYear+"/"+nextMonth+"/"+nextDate).getTime(): this.outDateTime;
                }
                this.createCalendar(this.curYear, this.curMonth);
            },
            createCalendar: function (year, month) {
                for (var index = 0; index < this.months; index++) {
                    if (this.curMonth > 12) {
                        this.curYear++;
                        this.curMonth = 1;
                    }
                    var oneMonthData = {};
                    oneMonthData.blankHolder = this.getFirstDay(this.curYear, this.curMonth);
                    oneMonthData.dates = this.getMonthLen(this.curYear, this.curMonth);
                    oneMonthData.year = this.curYear;
                    oneMonthData.month = this.curMonth;
                    this.calendarData.push(oneMonthData);
                    this.curMonth++;
                }
            },
            //获取月份天数
            getMonthLen: function (year, month) {
                return new Date(year, month, 0).getDate();
            },
            //获取第一天是周几
            getFirstDay: function (year, month) {
                return new Date(year, month - 1, 1).getDay();
            },
            hideCalendar: function () {
                this.$emit("close");
            },
            selectDate: function (date) {
                var that = this;
                var oneDayTime = 24*60*60*1000;
                var totalDate = (date.out - date.in) / oneDayTime;

                if (totalDate === 0) {
                    return;
                }

                if(totalDate > 14){
                    Toast.open("最多只能订14晚哦~");
                    return;
                }

                this.inDay = date.in;
                this.outDay = date.out;

                if (this.outDay) {
                    this.$emit("selectdate", date);
                    setTimeout(function () {
                        that.hideCalendar();
                    },500);
                }
            }
        }
    });
})()