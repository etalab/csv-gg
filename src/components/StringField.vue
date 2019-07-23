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
            <div class="mt-2" v-if="city">Ce code INSEE correspond à {{ this.city }}.</div>
        </b-form-group>
    </div>
</template>
<script>
import { EventBus } from '@/event-bus.js'
import ValidateField from '@/mixins/ValidateField.vue'

export default {
    name: 'StringField',
    mixins: [ValidateField],
    data() {
        return {
            city: null
        }
    },
    mounted() {
        EventBus.$on('field-value-changed', (field_name, value) => {
            if (this.field.name !== field_name) return
            if (this.isInsee) {
                this.handleInseeInput(value)
            }
        })
    },
    methods: {
        handleInseeInput: function(value) {
            fetch(`https://geo.api.gouv.fr/communes/${value}`).then(r => {
                if (!r.ok) {
                    this.city = null
                    throw new Error("Not 200 response")
                }
                return r.json()
            }).then(data => {
                this.city = data.nom
            })
        }
    },
    computed: {
        type() {
            if (['number', 'float'].includes(this.field.type)) {
                return 'number'
            } else if (this.field.format === 'email') {
                return 'email'
            }

            return 'text'
        },
        isInsee() {
            return this.field.name.toLowerCase().includes('insee')
        }
    }
}
</script>
