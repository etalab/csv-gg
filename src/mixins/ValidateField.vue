<script>
import { EventBus } from '@/event-bus.js';

export default {
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
        isRequired() {
            return this.field.constraints ? this.field.constraints.required : false
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
<style>
label.required::before {
    content: '✱';
    color: #d63626;
    padding: .2em .5em 0 0;
    font-size: .8em;
    position: absolute;
    left: 0;
    transform: translateX(-100%);
}
</style>
