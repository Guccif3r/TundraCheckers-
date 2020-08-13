import moment from 'moment'
import Vue from 'vue'

moment.locale('ru')

Vue.filter('date', function(value) {
    return (value && moment(value).format('YYYY-MM-DD HH:mm:ss')) || ''
})

Vue.filter('time', function(value) {
    return (value && moment(value).format('HH:mm:ss')) || ''
})

Vue.filter('ago', function(value, now, short) {
    if (!value) return ''
    if (+now - +new Date(value) < 1000) return 'только что'
    return moment(value).from(now, short)
})
