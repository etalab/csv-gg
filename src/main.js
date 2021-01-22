import Vue from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import Loading from 'vue-loading-overlay'
import VueSimpleSuggest from 'vue-simple-suggest'

import 'vue-loading-overlay/dist/vue-loading.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-simple-suggest/dist/styles.css'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(Loading)
Vue.component('vue-simple-suggest', VueSimpleSuggest)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
