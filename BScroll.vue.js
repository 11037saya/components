(function() {
    // :style="containerH"
    var tpl = '<div class="swiper-container" :class="{ltele: ltele}">'+
        '<div class="swiper-wrapper location-swiper" @click="selectCity">'+
                '<div v-for="(item, index) in totalCityArr" :key="index" ref="listGroup" class="swiper-slide">'+
                    '<h2 class="swp-title" :class="getTitleClassName(item.style)">{{item.title}}</h2>'+
                    '<div v-if="item.style == \'current_cities\' && (neighborhood != \'\' || streetNumber != \'\')" class="show-location-btn">' +
                        '<div class="location-btn" >' +
                            '<span class="icon"></span>'+
                            '<div class="info">' +
                                '<p class="title">{{neighborhood}}</p>'+
                                '<p class="subtitle">{{streetNumber}}</p>'+
                            '</div>'+
                            '<a href="javascript:void(0);" :data-cityid="item.data[0].city_id" :data-cityname="item.data[0].name" :data-curlocation="neighborhood"></a>'+
                        '</div>'+
                    '</div>'+
                    '<div  class="swp-label" v-if="item.type === 0">'+
                        '<a v-for="(cityItem, index) in item.data" :key="index" :class="[cityItem.city_id == selectedCityId ? \'current\' : \'\', $parent.setCustomStyle(cityItem.name)]" :data-cityid="cityItem.city_id" :data-cityname="cityItem.name" href="javascript:void(0);" :data-spm="\'page_name.h5.pty-search_place~id-\' + cityItem.city_id + \'~std-43525\'">{{cityItem.name}}</a>'+
                    '</div>'+
                    '<div class="swp-label-line" v-else>'+
                        '<a v-for="(cityItem, index) in item.data" :key="index" :data-cityId="cityItem.city_id" :data-cityName="cityItem.name" href="javascript:void(0);" :data-spm="\'page_name.h5.pty-search_place~id-\' + cityItem.city_id + \'~std-43525\'">{{cityItem.name}}</a>'+
                    '</div>'+
                '</div>'+
        '</div>'+
        '<div class="swiper-pagination" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">'+
            '<p v-for="(item, index) in totalCityArr" :key="index" :data-index="index" class="bold" v-text="simplifyTitle(item.title)"></p>'+
        '</div>'+
    '</div>';

    var FONT_SIZE = parseFloat(document.documentElement.style.fontSize);
    var deltaHeight = 12 / 50 * FONT_SIZE;
    var ANCHOR_HEIGHT = window.innerHeight <= 480 ? 15 : 16;
    // var SCROLL_HEIGHT = $(window).height() - 78 / 100 * FONT_SIZE;

    Vue.component('BScroll', {
        template: tpl,
        props: {
            totalCityArr: {
                type: Array,
                default: []
            },
            selectedCityId: [String, Number]
        },
        data: function() {
            return {
                // containerH: 'height:' + SCROLL_HEIGHT + 'px',
                bscroll : {},
                scrollY: -1,
                currentIndex: 0,
                listHeight: [],
                touch: {},
                ltele: false
            }
        },
        methods: {
            selectCity: function(event) {
                this.$parent.selectCity(event);
            },
            simplifyTitle: function(t) {
                return t.slice(0, 2);
            },
            // setCustomStyle: function(s) {
            //     this.$parent.setCustomStyle(s);
            // },
            getTitleClassName: function(txt) {
                if (txt === 'history_cities') {
                    return 'history';
                } else if (txt === 'hot_cities'){
                    return 'hot';
                }
            },
            initSwiper() {
                this.bscroll = new BScroll('.swiper-container', {
                    probeType: 2,
                    click: true
                });
                this.bscroll.on("scroll", this.scroll);
            },
            scroll(pos) {
                this.scrollY = pos.y;
            },
            onShortcutTouchStart(e) {
                var anchorIndex = e.target.getAttribute("data-index");
                var firstTouch = e.touches[0];
                this.touch.y1 = firstTouch.pageY;
                this.touch.anchorIndex = anchorIndex;
                this._scrollTo(anchorIndex);
            },
            onShortcutTouchMove(e) {
                var firstTouch = e.touches[0];
                this.touch.y2 = firstTouch.pageY;
                var delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0;
                var anchorIndex = parseInt(this.touch.anchorIndex) + delta;
                this._scrollTo(anchorIndex);
            },
            _calcHeight() {
                var list = this.$refs.listGroup;
                if (!list) {
                    return;
                }
                this.listHeight = [];
                var height = deltaHeight;
                this.listHeight.push(height);
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    height += item.clientHeight + deltaHeight;
                    this.listHeight.push(height);
                }
            },
            _scrollTo(index) {
                if (!index && index !== 0) {
                    return;
                }
                if (index < 0) {
                    index = 0;
                } else if (index > this.listHeight.length - 2) {
                    index = this.listHeight.length - 2;
                }
                this.bscroll.scrollToElement(this.$refs.listGroup[index], 100);
                this.scrollY = this.bscroll.y;
            }
        },
        computed: {
            neighborhood:function(){
                return this.$parent.neighborhood;
            },
            streetNumber:function(){
                return this.$parent.streetNumber;
            }
        },
        created: function() {
            
        },
        mounted: function() {
            var that = this;
            this.initSwiper();
            setTimeout(function() {
                that._calcHeight();
            }, 20);

            var ua = navigator.userAgent.toLowerCase();
            var isIos = /ip(hone|od|ad)/i.test(ua);

            if (isIos) {
                var appv = navigator.appVersion;
                var vArr = appv.match(/OS (\d+)[_\.](?:\d+)[_\.]?(?:\d+)?/);
                var ver = parseInt(vArr[1], 10);

                if (ver < 11) {
                    this.ltele = true;
                } else {
                    this.ltele = false;
                }
            }
        },
        watch: {
            totalCityArr() {
                var that = this;
                setTimeout(function() {
                    that._calcHeight();
                }, 20);
                setTimeout(function() {
                    that.bscroll.refresh();
                }, 300);
                setTimeout(function() {
                    that.bscroll.refresh();
                }, 5000);
            },
            scrollY(newY) {
                var listHeight = this.listHeight;
                if (newY > - deltaHeight) {
                    this.currentIndex = 0;
                    return;
                }

                for (var i = 0; i < listHeight.length; i ++) {
                    var height1 = listHeight[i];
                    var height2 = listHeight[i + 1];
                    if (-newY > height1 && -newY < height2) {
                        this.currentIndex = i;
                        return;
                    }
                }

                this.currentIndex = listHeight.length - 2;
            }
        }
    })
})();