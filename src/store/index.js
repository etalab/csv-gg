import Vue from 'vue'
import Vuex from 'vuex'

import auth from '@/store/modules/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  modules: {
    auth
  },
  mutations: {
    initialiseStore (state) {
      if (localStorage.getItem('store')) {
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem('store')))
        )
      }
    }
  }
})