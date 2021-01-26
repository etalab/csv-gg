import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import PublishForm from './views/PublishForm.vue'
import qs from 'qs'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/publish-form',
      name: 'publish-form',
      component: PublishForm
    },
    {
      path: '/:schema',
      name: 'home_schema',
      component: Home
    }
  ],
  // set custom query resolver
  parseQuery(query) {
      return qs.parse(query);
  },
  stringifyQuery(query) {
      var result = qs.stringify(query);

      return result ? ('?' + result) : '';
  }

})
