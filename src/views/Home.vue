<template>
    <div>
        <b-alert show dismissible>
            <h4 class="alert-heading">Mode d'emploi</h4>
            <p>Cet outil vous permet de créer un fichier CSV en vous assurant qu'il est conforme à un schéma, c'est-à-dire que ses données sont complètes, valides et structurées.</p>
            <ol class="mb-0">
                <li>Sélectionnez le schéma qui vous intéresse dans la liste déroulante, les schémas disponibles ici étant ceux référencés sur <a href="https://schema.data.gouv.fr">schema.data.gouv.fr</a>&nbsp;;</li>
                <li>Remplissez le formulaire&nbsp;: vous allez ainsi créer la première ligne de votre fichier CSV&nbsp;;</li>
                <li>L'outil vous prévient d'éventuelles erreurs de validation, le cas échéant vous pouvez les corriger&nbsp;;</li>
                <li>Une fois votre formulaire valide, les valeurs apparaissent sous la forme d'une ligne dans un tableau récapitulatif&nbsp;;</li>
                <li>Vous pouvez alors choisir d'ajouter une ou plusieurs lignes (répétez les étapes 2 à 4) ou télécharger le fichier CSV correspondant au tableau récapitulatif.</li>
            </ol>
        </b-alert>
        <b-form-group
          label="Choisissez un schéma à utiliser :"
          :description="schema && schema.description ? schema.description : ''"
          class="my-4"
        >
            <b-form-select v-model="schemaName" :options="options">
                <template slot="first">
                  <option :value="null" disabled>Choisissez un schéma</option>
                </template>
            </b-form-select>
        </b-form-group>
        <schema-form v-if="schema" :schema-meta="schema" :schema-name="schemaName"></schema-form>
    </div>
</template>

<script>
import SchemaForm from './SchemaForm.vue'

const SCHEMAS_CATALOG_URL = process.env.VUE_APP_SCHEMAS_CATALOG_URL

export default {
  name: 'home',
  components: {SchemaForm},
  data() {
      return {
          schemaName: this.$route.query.schema,
          schemas: null,
          options: [],
      }
  },
  mounted() {
      let loader = this.$loading.show()
      fetch(`${SCHEMAS_CATALOG_URL}`).then(r => {
          return r.json()
      }).then(data => {
          this.schemas = data.schemas
          this.options = this.schemas.map(s => {
              return {value: s.name, text: s.title || s.name}
          })
      }).finally(() => {
          loader.hide()
      })
  },
  computed: {
      schema() {
          if (!this.schemaName) return
          if (!this.schemas) return
          return this.schemas.find(s => s.name === this.schemaName)
      }
  },
  watch: {
    schemaName(newVal) {
        this.$router.push({ query: { ...this.$route.query, schema: newVal } })
    }
  }
}
</script>
