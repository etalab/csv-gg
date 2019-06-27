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
            <b-form-input
                v-model="value"
                :id="`field-${field.name}`"
                :type="type"
                :placeholder="field.example"
                :required="field.constraints ? field.constraints.required : false"
                :min="field.constraints ? field.constraints.minimum : null"
                :max="field.constraints ? field.constraints.maximum : null"
                v-on:input="onInput"
                :state="isValid"
                :trim="true"
            />
        </b-form-group>
    </div>
</template>
<script>
import ValidateField from '@/mixins/ValidateField.vue'

export default {
    name: 'StringField',
    mixins: [ValidateField],
    computed: {
        type() {
            if (['number', 'float'].includes(this.field.type)) {
                return 'number'
            } else if (this.field.format === 'email') {
                return 'email'
            }

            return 'text'
        }
    }
}
</script>
