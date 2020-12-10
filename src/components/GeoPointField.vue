<template>
  <FormGroup :field="field" :error="error">
    <b-form-input
      v-model="value"
      :id="`field-${field.name}`"
      type="text"
      :placeholder="field.example"
      :required="isRequired"
      v-on:input="onInput"
      :state="isValid"
    />
  </FormGroup>
</template>
<script>
import FormGroup from '@/components/FormGroup.vue'
import ValidateField from '@/mixins/ValidateField.vue'

export default {
  name: 'GeoPointField',
  mixins: [ValidateField],
  components: {
    FormGroup
  }
}
</script>
