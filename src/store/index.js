import Vue from 'vue'
import Vuex from 'vuex'

import auth from '@/store/modules/auth'
import folders from '@/store/modules/folders'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  modules: {
    auth,
    folders
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
