
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import Loading from 'vue-loading-overlay'

import 'vue-loading-overlay/dist/vue-loading.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


import axios from 'axios'
import VueAxios from 'vue-axios'

import store from './store'

Vue.config.productionTip = false
Vue.use(VueAxios, axios)
Vue.use(BootstrapVue)
Vue.use(Loading)
Vue.use(Vuex)


new Vue({
  router,
  render: h => h(App),
  store,
  mounted(){
    this.$store.subscribe((mutation, state) => {
      localStorage.setItem('store', JSON.stringify(state))
    })
    this.$store.beforeCreate = function () {
      this.$store.commit('initialiseStore')
    }
  }
}).$mount('#app')
