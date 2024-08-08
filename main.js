import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
import App from './App'

import share from './common/share.js'
Vue.mixin(share) 

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue({
    ...App,share
})
app.$mount()
