<template>
  <FormGroup :field="field" :error="error">
    <div style="display: grid; grid-template-columns: auto 60px;">
      <b-form-input
        v-model="value"
        :id="`field-${field.name}`"
        :placeholder="placeHolder"
        :required="isRequired"
        v-on:blur="onBlur"
        :state="isValid"
        :trim="true"
      />
      <button v-on:click.prevent="showMap = !showMap">
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
          @update:latLng="onMarkerMove"
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
    onBlur() {
      // Called after the user changed text input value
      const strValue = this.value
      const latLng = this.extractLatLng(strValue)
      const valid = strValue == '' || latLng !== false
      EventBus.$emit('field-error', this.field.name, !valid)
      EventBus.$emit('field-value-changed', this.field.name, strValue)

      // Update marker on map if coords are ok
      if (latLng !== false) {
        this.recenterMap(latLng)
      }
    },
    // Called after marker has been moved
    // either dragging it or setting its location
    onMarkerMove(latLng) {

      // marker location
      this.markerLocation = latLng

      // formatted value: "lon, lat"
      const value = this.formatLatLng(latLng)

      // update text input
      this.value = value

      // Hey! value has changed
      EventBus.$emit('field-value-changed', this.field.name, value)
    },
    // Recenter map and marker on a location
    // called after coords have been changed in text input
    recenterMap(latLng) {
      this.markerLocation = latLng
      this.center = latLng
    },
    // Format longLat object to string
    formatLatLng(lngLat) {
      const fp = this.floatPrecision
      const { lat, lng } = lngLat
      return `${lng.toFixed(fp)},${lat.toFixed(fp)}`
    },
    // Extract latLng object from string
    // return false if an error occurred
    extractLatLng(str) {
      if (str == '') {
        return false
      }
      const chunks = str.split(',').map((elt) => elt.trim())

      if (chunks.length != 2) {
        return false
      }
      const lon = parseFloat(chunks[0])
      const lat = parseFloat(chunks[1])
      if (isNaN(lon) || isNaN(lat)) {
        return false;
      }
      // TODO: check lon and lat bounds
      return { lon, lat }
    },
  },
  data() {
    return {
      center: [46.8, 2.11], // center of France, cocorico!
      zoom: 5,
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      markerLocation: [46.8, 2.11],
      value: '',
      floatPrecision: 2,
      showMap: false,
    }
  },
  computed: {
    placeHolder() {
      return this.field.example || "longitude,latitude"
    }
  }
}
</script>
