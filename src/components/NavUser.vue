<template>
  <b-navbar-nav class="ml-auto">
    <b-navbar-nav v-if="user && !user.loggedIn">
      <b-nav-item @click="submitLogin">
        Se connecter
      </b-nav-item>
    </b-navbar-nav>

    <b-nav-item-dropdown right v-if="user && user.loggedIn">
      <!-- Using 'button-content' slot -->
      <template v-slot:button-content>
        {{ user.data.first_name }} {{ user.data.last_name }}
      </template>
      <b-dropdown-item :href="user.data.page">
        Mon profil
      </b-dropdown-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item @click="logout">
        Se déconnecter
      </b-dropdown-item>
    </b-nav-item-dropdown>
  </b-navbar-nav>
</template>

<script>
import Auth from '../services/Auth';

const $auth = new Auth();

export default {
  created() {
    this.getUserConnections();
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    getUserConnections() {
    },
    submitLogin(evt) {
      evt.preventDefault();
      window.location = $auth.authUrl();
    },
    async logout() {
      await $auth.proceedLogout(this.$store.state.auth.user.token);
      this.$store.dispatch('auth/logout');
    },
  },
  mounted() {
    this.polling = setInterval(() => {
      if (this.$store.state.auth.user.token !== '') {
        this.$store.dispatch('auth/checkToken');
      }
    }, 3000);
  },
};
</script>
