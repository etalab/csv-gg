<template>
  <div>
    <h1>Login page</h1>
    <a href="/">back</a>
  </div>
</template>

<script>
import Api from "@/services/Api"
import Auth from "@/services/Auth"

const $api = new Api()
const $auth = new Auth()

export default {
  data() {
    return {
      token: undefined
    }
  },
  async mounted() {
    if (!this.$store.state.auth.user.loggedIn) {
      try {
        await this.getoken()
      } catch (e) {
        // console.error(e.response.data)
        this.$router.push("/")
      }
      this.$store.dispatch("auth/login", this.token).then(() => {
        $api.get("me").then(response => {
          this.$store.dispatch("auth/fillUserData", response.data).then(() => {
            this.$router.push("/")
          })
        })
      })
    } else {
      // console.log("Logged in", this.$store.state.auth.user)
      this.$router.push("/")
    }
  },
  methods: {
    async getoken() {
      const queryObject = {}
      window.location.search
        .substr(1)
        .split("&")
        .forEach(item => {
          queryObject[item.split("=")[0]] = item.split("=")[1]
        })
      this.token = await $auth.retrieveToken(queryObject)
    }
  }
}
</script>
