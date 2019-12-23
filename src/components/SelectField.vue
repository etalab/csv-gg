<template>
    <div>
        <b-form-group
            label-cols-sm="4"
            label-cols-lg="3"
            :label="field.name"
            :label-for="`field-${field.name}`"
            :invalid-feedback="error.content"
            valid-feedback="Ce champ est valide"
            :state="isValid"
            :label-class="{'required': isRequired}"
          >
            <template slot="description">
                <vue-markdown :source="field.description" />
            </template>
              <b-form-select v-model="value" :id="`field-${field.name}`" :options="options" v-on:input="onInput" :state="isValid" />
        </b-form-group>
    </div>
</template>
<script>
import ValidateField from '@/mixins/ValidateField.vue'

export default {
    name: 'SelectField',
    mixins: [ValidateField],
    computed: {
        options() {
            return this.field.constraints.enum
        }
    }
}
</script>
