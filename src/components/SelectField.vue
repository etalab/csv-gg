<template>
    <FormGroup :field=field :error=error>
        <b-form-select
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
  name: 'SelectField',
  mixins: [ValidateField],
  components: {
    FormGroup,
  },
  computed: {
    options() {
      return this.field.constraints.enum;
    },
  },
};
</script>
