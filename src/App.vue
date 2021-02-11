<template>
  <div id="app">
      <header-component></header-component>
      <br/>
      <router-view/>
      <br/>
      <footer-component></footer-component>
  </div>
</template>
<style>
</style>

<script>
import HeaderComponent from './views/HeaderComponent.vue';
import FooterComponent from './views/FooterComponent.vue';

export default {
  name: 'home',
  components: { HeaderComponent, FooterComponent },
};

</script>
