<template>
    <FormGroup :field=field :error=error>
        <b-form-input
            v-model="value"
            :id="`field-${field.name}`"
            :type="type"
            :placeholder="field.example"
            :required="isRequired"
            :min="field.constraints ? field.constraints.minimum : null"
            :max="field.constraints ? field.constraints.maximum : null"
            v-on:input="onInput"
            :state="isValid"
            :trim="true"
        />

        <!-- INSEE -->
        <div class="mt-2 valid-feedback d-block" v-if="isInsee && city">
            Ce code INSEE correspond à {{ this.city }}.
        </div>
        <div class="mt-2 invalid-feedback d-block" v-if="isInsee && !city && value">
            Ce code INSEE n'existe pas.
        </div>
        <!-- SIRET -->
        <div class="mt-2 valid-feedback d-block" v-if="isSiret && siretDescription">
            Ce SIRET correspond à {{ this.siretDescription }}.
        </div>
        <div class="mt-2 invalid-feedback d-block" v-if="isSiret && !siretDescription && value">
            Ce code SIRET n'existe pas.
        </div>
        <!-- SIREN -->
        <div class="mt-2 valid-feedback d-block" v-if="isSiren && sirenDescription">
            Ce SIREN correspond à {{ this.sirenDescription }}.
        </div>
        <div class="mt-2 invalid-feedback d-block" v-if="isSiren && !sirenDescription && value">
            Ce code SIREN n'existe pas.
        </div>
        <!-- Code postal -->
        <div class="mt-2 valid-feedback d-block" v-if="isPostCode && city">
            Ce code postal correspond à {{ this.city }}.
        </div>
        <div class="mt-2 invalid-feedback d-block" v-if="isPostCode && !city && value">
            Ce code code postal n'existe pas.
        </div>
    </FormGroup>
</template>
<script>
// eslint-disable-next-line import/extensions
import { EventBus } from '../event-bus.js';
import ValidateField from '../mixins/ValidateField.vue';
import FormGroup from './FormGroup.vue';

export default {
  name: 'StringField',
  mixins: [ValidateField],
  components: {
    FormGroup,
  },
  data() {
    return {
      city: null,
      siretDescription: null,
      sirenDescription: null,
    };
  },
  mounted() {
    EventBus.$on('field-value-changed', (fieldName, value) => {
      if (this.field.name !== fieldName) return;

      if (this.isInsee) {
        this.handleInseeInput(value);
      } else if (this.isSiret) {
        this.handleSiretInput(value);
      } else if (this.isSiren) {
        this.handleSirenInput(value);
      } else if (this.isPostCode) {
        this.handlePostcodeInput(value);
      }
    });
  },
  methods: {
    handleInseeInput(value) {
      fetch(`https://geo.api.gouv.fr/communes/${value}`).then((r) => {
        if (!r.ok) {
          this.city = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.city = data.nom;
      }).catch((_) => _);
    },
    handleSiretInput(value) {
      this.siretDescription = null;
      if (value.length !== 14) return;

      fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${value}`).then((r) => {
        if (!r.ok) {
          this.siretDescription = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.siretDescription = data.etablissement.unite_legale.denomination;
      }).catch((_) => _);
    },
    handleSirenInput(value) {
      this.sirenDescription = null;
      if (value.length !== 9) return;

      fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/unites_legales/${value}`).then((r) => {
        if (!r.ok) {
          this.sirenDescription = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.sirenDescription = data.unite_legale.denomination;
      }).catch((_) => _);
    },
    handlePostcodeInput(value) {
      fetch(`https://geo.api.gouv.fr/communes?codePostal=${value}&boost=population`).then((r) => {
        if (!r.ok) {
          this.city = null;
          throw new Error('Not 200 response');
        }
        return r.json();
      }).then((data) => {
        this.city = data.map((c) => c.nom).join(' ou ');
      }).catch((_) => _);
    },
    fieldHasKeyword(keyword) {
      const name = this.field.name.toLowerCase();
      const description = (this.field.description || '').toLowerCase();
      return name.includes(keyword) || new RegExp(`\\b${keyword}\\b`).test(description);
    },
  },
  computed: {
    type() {
      if (['number', 'float'].includes(this.field.type)) {
        return 'number';
      } if (this.field.format === 'email') {
        return 'email';
      }
      return 'text';
    },
    isInsee() {
      return this.field.name.toLowerCase().includes('insee');
    },
    isSiret() {
      return this.fieldHasKeyword('siret');
    },
    isSiren() {
      return this.fieldHasKeyword('siren');
    },
    isPostCode() {
      return ['codepostal', 'code-postal', 'code_postal'].includes(this.field.name.toLowerCase());
    },
  },
};
</script>
