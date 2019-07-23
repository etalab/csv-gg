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

            <!-- INSEE -->
            <div class="mt-2 valid-feedback d-block" v-if="isInsee && city">Ce code INSEE correspond à {{ this.city }}.</div>
            <div class="mt-2 invalid-feedback d-block" v-if="isInsee && !city && value">Ce code INSEE n'existe pas.</div>

            <!-- SIRET -->
            <div class="mt-2 valid-feedback d-block" v-if="isSiret && siretDescription">Ce SIRET correspond à {{ this.siretDescription }}.</div>
            <div class="mt-2 invalid-feedback d-block" v-if="isSiret && !siretDescription && value">Ce code SIRET n'existe pas.</div>
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
            city: null,
            siretDescription: null
        }
    },
    mounted() {
        EventBus.$on('field-value-changed', (field_name, value) => {
            if (this.field.name !== field_name) return

            if (this.isInsee) {
                this.handleInseeInput(value)
            } else if (this.isSiret) {
                this.handleSiretInput(value)
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
            .catch(_ => _)
        },
        handleSiretInput: function(value) {
            this.siretDescription = null
            if (value.length !== 14) return

            fetch(`https://entreprise.data.gouv.fr/api/sirene/v1/siret/${value}`).then(r => {
                if (!r.ok) {
                    this.siretDescription = null
                    throw new Error("Not 200 response")
                }
                return r.json()
            }).then(data => {
                const company = data.etablissement
                this.siretDescription = `${company.nom_raison_sociale} (${company.libelle_activite_principale})`
            })
            .catch(_ => _)
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
        },
        isSiret() {
            return this.field.name.toLowerCase().includes('siret')
        }
    }
}
</script>
