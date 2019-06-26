<template>
    <div class="">
        <b-form-group
            label-cols-sm="4"
            label-cols-lg="3"
            :description="field.description"
            :label="field.name"
            :label-for="`field-${field.name}`"
            :invalid-feedback="error.content"
            valid-feedback="Ce champ est valide"
            :state="isValid"
          >
              <b-form-input v-model="value" :id="`field-${field.name}`" :placeholder="field.example" v-on:input="onInput" :state="isValid" trim/>
        </b-form-group>
    </div>
</template>
<script>
import ValidateField from '@/mixins/ValidateField.vue'

export default {
    name: 'StringField',
    mixins: [ValidateField]
}
</script>
