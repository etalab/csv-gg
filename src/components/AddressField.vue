<template>
    <FormGroup :field=field :error=error>
        <vue-simple-suggest
            v-model="value"
            display-attribute="label"
            value-attribute="label"
            :list="getSuggestionList"
            :min-length="3"
            :debounce="200"
        >
            <input
                :id="inputId"
                type="text"
                :placeholder="placeholder"
                class="form-control"
                v-model="value"
                v-on:change="onChange"
                :required="isRequired"
                :state="isValid"
            />
        </vue-simple-suggest>
    </FormGroup>
</template>

<script>
import VueSimpleSuggest from 'vue-simple-suggest';
import queryString from 'query-string';
// eslint-disable-next-line import/extensions
import { EventBus } from '../event-bus.js';
import ValidateField from '../mixins/ValidateField.vue';
import FormGroup from './FormGroup.vue';

export default {
  name: 'AddressField',
  mixins: [ValidateField],
  components: {
    FormGroup,
    VueSimpleSuggest,
  },
  data() {
    return {
      value: '',
    };
  },
  methods: {
    // Function returning a promise as a factory for suggestion lists.
    getSuggestionList(inputValue) {
      return new Promise((resolve, reject) => {
        const url = queryString.stringifyUrl({
          url: 'https://api-adresse.data.gouv.fr/search/',
          query: {
            q: inputValue,
          },
        });
        fetch(url).then((response) => {
          if (!response.ok) {
            reject();
          }
          response.json().then((json) => {
            resolve(json.features.map((feature) => ({ label: feature.properties.label })));
          }).catch((e) => {
            reject(e);
          });
        });
      });
    },
    onChange() {
      const text = this.value;
      EventBus.$emit('field-error', this.field.name, false);
      EventBus.$emit('field-value-changed', this.field.name, text);
    },
  },
  computed: {
    placeholder() {
      return this.field.example || '3 rue des Mimosas';
    },
    inputId() {
      return `field-${this.field.name}`;
    },
  },
  mounted() {
    // reset input on new form line
    EventBus.$on('form-reset', () => {
      this.value = '';
    });
  },
};
</script>

<style>
.z-1000 {
  z-index: 1000;
}
.hover {
  background-color: #007bff;
  color: #fff;
}
</style>
