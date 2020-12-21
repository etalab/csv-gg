<template>
  <FormGroup :field="field" :error="error">
    <!-- <b-form-input
            v-model="value"
            :id="`field-${field.name}`"
            :type="type"
            :placeholder="field.example"
            :required="isRequired"
            :min="field.constraints ? field.constraints.minimum : null"
            :max="field.constraints ? field.constraints.maximum : null"
            v-on:input="onInput"
            :state="isValid"
            :trim="true"
        /> -->
    <div style="display: grid; grid-template-columns: auto 60px;">
      <b-form-input />
      <button @click.prevent="showMap = !showMap">
          GEO
      </button>
    </div>
    <div>
      <l-map
        v-if="showMap"
        :center="center"
        :zoom="zoom"
        style="height: 300px; width: 100%"
        >
        <l-tile-layer
          :url="url"
          :attribution="attribution"
        />
        <l-marker
          :lat-lng="markerLocation"
          :draggable="true"
          @update:latLng="updateLocation"
          >
          <l-tooltip>
            Déplacez le marqueur<br/>
            pour sélectionner l'emplacement
          </l-tooltip>
        </l-marker>
      </l-map>
    </div>
  </FormGroup>
</template>

<script>
import FormGroup from '@/components/FormGroup.vue'
import ValidateField from '@/mixins/ValidateField.vue'
import { LMap, LTileLayer, LMarker, LTooltip } from 'vue2-leaflet'
import { EventBus } from '@/event-bus.js';

export default {
  name: 'GeoPointField',
  mixins: [ValidateField],
  components: {
    FormGroup,
    LMap,
    LTileLayer,
    LMarker,
    LTooltip
  },
  methods: {
    updateLocation(center) {
      this.markerLocation = center

      const fp = this.floatPrecision
      const value = `${center.lng.toFixed(fp)}, ${center.lat.toFixed(fp)}`
      EventBus.$emit('field-value-changed', this.field.name, value)
    },
    limitPrecision(floatVal) {
      return floatVal.toFixed(this.floatPrecision)
    }
  },
  data() {
    return {
      center: [46, 2],
      zoom: 12,
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      markerLocation: [46, 2],
      values: [[46, 2]],
      floatPrecision: 3,
      showMap: false,
    }
  },
}
</script>
