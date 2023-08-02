import Vue from 'vue'
import App from './App'

import share from './common/share.js'
Vue.mixin(share) 

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue({
    ...App,share
})
app.$mount()
