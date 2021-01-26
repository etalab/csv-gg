<template>
  <div>
    <h1>Publication d'un jeu de données</h1>
    <p>Schema : {{ $router.query.schemaName }}</p>
    <div v-if="!userLoggedIn">
      <div>
        <b-alert show variant="danger">
          <h4 class="alert-heading">Erreur</h4>
          <p>
            Vous devez être connecté pour publier un jeu de données.
          </p>
          <hr />
          <p>Retour à la <b-link to="/">page d'accueil</b-link></p>
        </b-alert>
      </div>
    </div>
    <div v-if="userLoggedIn">
      <p>le jeu de données (preview)</p>
      <b-form @submit="onSubmit" @reset="onReset">
        <!-- Organisation -->
        <b-form-group
          id="input-group-org"
          label="Organisation :"
          label-for="input-org"
          description="Choisissez l'organisation au titre de laquelle vous intervenez"
        >
          <b-form-select
            id="input-org"
            v-model="form.org"
            :options="userOrganizations"
            required
          ></b-form-select>
        </b-form-group>

        <!-- Dataset title -->
        <b-form-group
          id="input-group-dataset-title"
          label="Titre du jeu de données :"
          label-for="input-dataset-title"
        >
          <b-form-input
            id="input-dataset-title"
            v-model="form.dataset.title"
            :trim="true"
          ></b-form-input>
        </b-form-group>

        <!-- Dataset description -->
        <b-form-group
          id="input-group-dataset-description"
          label="Description du jeu de données :"
          label-for="input-dataset-description"
        >
          <b-form-textarea
            id="input-dataset-description"
            v-model="form.dataset.description"
            placeholder="Description du jeu de données"
            rows="4"
          ></b-form-textarea>
        </b-form-group>

        <!-- Resource title -->
        <b-form-group
          id="input-group-resource-title"
          label="Titre de la resource :"
          label-for="input-resource-title"
        >
          <b-form-input
            id="input-resource-title"
            v-model="form.resource.title"
            :trim="true"
          ></b-form-input>
        </b-form-group>
      </b-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      form: {
        org: '',
        dataset: {
          title: '',
          description: ''
        },
        resource: {
          title: ''
        },
        schemaName: this.$route.query.schemaName
      },
      organizations: [],
      show: true
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user
    },
    userLoggedIn() {
      //   return this.$store.state.auth.user && this.$store.state.auth.user.loggedIn
      return this.user && this.user.loggedIn
    },
    userOrganizations() {
      // console.log({ UO_user: this.user })
      // console.log({ UO_org: this.user.data.organizations })
      // const orgList =
      //   this.user && this.user.data.organizations
      //     ? this.user.data.organizations.map(org => ({
      //         value: org.id,
      //         text: org.name
      //       }))
      //     : []
      // console.log({ UO_org_options: orgList })
      // return orgList
      return [
        { value: '1', text: 'foobar 1' },
        { value: '2', text: 'foobar 2' },
        { value: '3', text: 'foobar 3' },
        { value: '4', text: 'foobar 4' }
      ]
    }
  },
  methods: {
    onSubmit(event) {
      event.preventDefault()
      alert(JSON.stringify(this.form))
    },
    onReset(event) {
      event.preventDefault()
      // Reset our form values
      this.form.org = null
      this.form.checked = []
      // Trick to reset/clear native browser form validation state
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    }
  }
}
</script>
