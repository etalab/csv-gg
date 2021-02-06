<template>
  <div>
    <b-form>
      <p class="text-muted">
        Publiez le fichier CSV en cours d'édition dans un nouveau jeu de données
      </p>

      <!-- Organisation -->
      <b-form-group
        id="input-group-org"
        label-for="input-org"
        description="Choisissez l'organisation dans laquelle sera créé le jeu de données"
      >
        <template v-slot:label>
          Organisation <span class="text-danger">*</span>
        </template>
        <b-form-select
          id="input-org"
          v-model="form.org"
          :options="organizations"
          v-on:change="onChange"
          required
        ></b-form-select>
      </b-form-group>

      <!-- Dataset title -->
      <b-form-group
        id="input-group-dataset-title"
        label-for="input-dataset-title"
      >
        <template v-slot:label>
          Nom du jeu de données <span class="text-danger">*</span>
        </template>
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
        label-for="input-dataset-description"
      >
        <template v-slot:label>
          Description du jeu de données <span class="text-danger">*</span>
        </template>
        <b-form-textarea
          id="input-dataset-description"
          v-model="form.dataset.description"
          rows="4"
          v-on:change="onChange"
          :trim="true"
        ></b-form-textarea>
      </b-form-group>

      <!-- Resource title -->
      <b-form-group
        id="input-group-resource-title"
        label-for="input-resource-title"
      >
        <template v-slot:label>
          Nom du fichier CSV <span class="text-danger">*</span>
        </template>
        <b-form-input
          id="input-resource-title"
          v-model="form.resource.title"
          v-on:change="onChange"
          :trim="true"
          placeholder="data.csv"
        ></b-form-input>
      </b-form-group>
      <p class="text-muted">
        Les champs suivis d'une astérisque (<span class="text-danger">*</span>)
        sont obligatoires
      </p>
    </b-form>
  </div>
</template>
<script>
export default {
  props: {
    schemaName: String,
    organizations: Array,
    value: {
      type: undefined,
      required: true
    }
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
    this.$emit('form-state-change', this.okState)
  },
  computed: {
    okState() {
      return (
        this.form.org != '' &&
        this.form.dataset.title !== '' &&
        this.form.dataset.description !== '' &&
        this.form.resource.title !== ''
      )
    },
    payload() {
      return {
        organizationId: this.form.org,
        dataset: {
          title: this.form.dataset.title,
          description: this.form.dataset.description
        },
        resource: {
          title: this.form.resource.title,
          schemaName: this.schemaName
        }
      }
    }
  },
  methods: {
    onChange() {
      const okState = this.okState
      this.$emit('form-state-change', okState)
      if (okState) {
        this.$emit('input', this.payload)
      }
    }
  }
}
</script>