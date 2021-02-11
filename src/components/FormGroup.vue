<template>
    <b-form-group
        label-cols-sm="4"
        label-cols-lg="3"
        :label="field.name"
        :label-for="`field-${field.name}`"
        :invalid-feedback="errorMessage"
        valid-feedback="Ce champ est valide"
        :state="isValid"
        :label-class="{'required': isRequired}"
    >
        <template slot="description">
            <vue-markdown :source="field.description" />
        </template>

        <slot></slot>

    </b-form-group>
</template>
<script>
import VueMarkdown from 'vue-markdown';
import ValidateField from '../mixins/ValidateField.vue';

export default {
  name: 'FormGroup',
  mixins: [ValidateField],
  components: {
    VueMarkdown,
  },
  computed: {
    errorMessage() {
      // Test order matters.
      // legacy report error contains 'content' (fr) and 'message' (en) properties
      // New validation report only contains 'message' (fr) property
      return this.error.content ? this.error.content : this.error.message;
    },
  },
};
</script>
