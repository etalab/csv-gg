import Vue from 'vue';
import Vuex from 'vuex';
import BootstrapVue from 'bootstrap-vue';
import Loading from 'vue-loading-overlay';
import VueSimpleSuggest from 'vue-simple-suggest';

import axios from 'axios';
import VueAxios from 'vue-axios';
import router from './router';
import App from './App.vue';

import store from './store';

import 'vue-loading-overlay/dist/vue-loading.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vue-simple-suggest/dist/styles.css';

// eslint-disable-next-line import/extensions
import '@gouvfr/all/dist/js/all.js';
import '@gouvfr/all/dist/css/all.css';
import './static/css/custom.css';

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(BootstrapVue);
Vue.use(Loading);
Vue.use(Vuex);

Vue.component('vue-simple-suggest', VueSimpleSuggest);

new Vue({
  router,
  render: (h) => h(App),
  store,
  mounted() {
    this.$store.subscribe((mutation, state) => {
      localStorage.setItem('store', JSON.stringify(state));
    });
  },
  beforeCreate() { this.$store.commit('initialiseStore'); },
}).$mount('#app');
