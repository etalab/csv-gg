import Vue from 'vue';
import Router from 'vue-router';
import FillDataForm from './views/FillDataForm.vue';
import Homepage from './views/Homepage.vue';
import FillDataTable from './views/FillDataTable.vue';
import SelectFillingMode from './views/SelectFillingMode.vue';
import FillDataUpload from './views/FillDataUpload.vue';
import Login from './views/Login.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Homepage,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/select',
      name: 'select',
      component: SelectFillingMode,
    },
    {
      path: '/form',
      name: 'home_schema',
      component: FillDataForm,
    },
    {
      path: '/table',
      name: 'table',
      component: FillDataTable,
    },
    {
      path: '/upload',
      name: 'upload',
      component: FillDataUpload,
    },
  ],
});
