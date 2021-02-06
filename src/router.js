import Vue from 'vue'
import Router from 'vue-router'
import SchemaForm from './views/SchemaForm.vue'
import Homepage from './views/Homepage.vue'
import SchemaTable from './views/SchemaTable.vue'
import SelectFillingMode from './views/SelectFillingMode.vue'
import UploadData from './views/UploadData.vue'
import Login from './views/Login.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/form',
      name: 'home_schema',
      component: SchemaForm
    },
    {
      path: '/',
      name: 'home',
      component: Homepage
    },
    {
      path: '/select',
      name: 'select',
      component: SelectFillingMode
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadData
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/table',
      name: 'table',
      component: SchemaTable
    }
  ]
})
