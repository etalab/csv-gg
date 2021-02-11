<template>
    <FormGroup :field=field :error=error>
        <b-form-radio-group
            v-model="value"
            :id="`field-${field.name}`"
            :options="options"
            v-on:input="onInput"
            :state="isValid"
        />
    </FormGroup>
</template>
<script>
import FormGroup from './FormGroup.vue';
import ValidateField from '../mixins/ValidateField.vue';

export default {
  name: 'RadioField',
  mixins: [ValidateField],
  components: {
    FormGroup,
  },
  computed: {
    options() {
      const options = [
        { text: 'Vrai', value: this.trueValue },
        { text: 'Faux', value: this.falseValue },
      ];

      if (this.field.constraints && this.field.constraints.required) {
        return options;
      }

      options.push({ text: 'Non renseigné', value: '' });

      return options;
    },
    trueValue() {
      return this.field.trueValues ? this.field.trueValues[0] : 'true';
    },
    falseValue() {
      return this.field.falseValues ? this.field.falseValues[0] : 'false';
    },
  },
};
</script>
