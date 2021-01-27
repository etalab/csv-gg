<template>
  <div>
    <p>
      Schéma <strong>{{ schemaName }}</strong>
    </p>
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
          :options="organizations"
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
          v-on:change="onChange"
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
          placeholder="Information sur le jeu de données..."
          rows="4"
          v-on:change="onChange"
          :trim="true"
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
          v-on:change="onChange"
          :trim="true"
        ></b-form-input>
      </b-form-group>
    </b-form>
  </div>
</template>
<script>
export default {
  props: {
    schemaName: String,
    organizations: Array
  },
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
        }
      }
    }
  },
  mounted() {
    this.form.dataset.title = ''
  },
  methods: {
    onChange() {
      const formState =
        this.form.dataset.title !== '' &&
        this.form.dataset.description !== '' &&
        this.form.resource.title !== ''
      this.$emit('form-state-change', formState)
    }
  }
}
</script>
