<template>
    <div>
        <b-alert show dismissible>
            <h4 class="alert-heading">Mode d'emploi</h4>
            <p>Cet outil vous permet de créer un fichier CSV en vous assurant qu'il est conforme à un schéma, c'est-à-dire que ses données sont complètes, valides et structurées.</p>
            <ol class="mb-0">
                <li>Sélectionnez le schéma qui vous intéresse dans la liste déroulante, les schémas disponibles ici étant ceux référencés sur <a href="https://schema.data.gouv.fr">schema.data.gouv.fr</a>.</li>
                <li>Remplissez le formulaire à l'aide des descriptions des différents champs et des valeurs d'exemples. Les champs indiqués par un astérisque rouge doivent obligatoirement être renseignés au moment de la saisie.</li>
                <li>L'outil vous prévient d'éventuelles erreurs de validation, le cas échéant vous pouvez les corriger.</li>
                <li>Une fois votre formulaire valide, les valeurs apparaissent sous la forme d'une ligne dans un tableau récapitulatif.</li>
                <li>Vous pouvez alors choisir d'ajouter une ou plusieurs lignes (répétez les étapes 2 à 4) ou télécharger le fichier CSV correspondant au tableau récapitulatif.</li>
                <li v-if="schema && schema.name === 'etalab/schema-lieux-covoiturage'">Une fois votre fichier complété et téléchargé, vous pouvez l'envoyer à <a href="mailto:contact@transport.beta.gouv.fr">contact@transport.beta.gouv.fr</a> pour qu'il soit intégré à la base nationale.</li>
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
        <b-alert v-if="schema && schema.name === 'etalab/schema-lieux-covoiturage'" show dismissible>
            <div>Pour toute question, n'hésitez pas à adresser un mail à <a href="mailto:contact@transport.beta.gouv.fr">contact@transport.beta.gouv.fr</a></div>
        </b-alert>
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
          let tableschemas = [];
          data.schemas.forEach((schema) => {
            if(schema.schema_type == 'tableschema') {
              tableschemas.push(schema);
            }
          });
          this.schemas = tableschemas;
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
