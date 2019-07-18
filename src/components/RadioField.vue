<template>
    <div>
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
            <b-form-radio-group v-model="value" :id="`field-${field.name}`" :options="options" v-on:input="onInput" :state="isValid" />
        </b-form-group>
    </div>
</template>
<script>
import ValidateField from '@/mixins/ValidateField.vue'

export default {
    name: 'RadioField',
    mixins: [ValidateField],
    computed: {
        options: function() {
            let options = [
                { text: 'Vrai', value: this.trueValue },
                { text: 'Faux', value: this.falseValue },
            ]

            if (this.field.constraints && this.field.constraints.required) {
                return options
            }

            options.push({ text: 'Non renseigné', value: '' })

            return options
        },
        trueValue: function() {
            return this.field.trueValues ? this.field.trueValues[0] : 'true'
        },
        falseValue: function() {
            return this.field.falseValues ? this.field.falseValues[0] : 'false'
        }
    }
}
</script>
