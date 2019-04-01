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
import { EventBus } from '@/event-bus.js';

export default {
    name: 'StringField',
    props: {
        field: Object,
    },
    data() {
        return {
            error: false,
            formValidated: false,
            value: null,
        }
    },
    mounted() {
        EventBus.$on('field-error', (field_name, error) => {
            if (this.field.name !== field_name) return
            this.error = error
        })
        EventBus.$on('field-no-error', (field_name) => {
            if (this.field.name !== field_name) return
            this.error = false
        })
        EventBus.$on('form-validated', () => {
            this.formValidated = true
        })
        EventBus.$on('form-reset', () => {
            this.formValidated = false
            this.error = false
            this.value = null
        })
    },
    computed: {
        isValid() {
            if (!this.formValidated) return null
            return !this.error
        },
    },
    methods: {
        onInput(event) {
            this.formValidated = false
            this.error = false
            EventBus.$emit('field-value-changed', this.field.name, event)
        }
    }
}
</script>
