<template>
  <FormGroup :field="field" :error="error">
    <div>
      <l-map
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
      // as an array
      //const value = [center.lng, center.lat]
      // as a string
      const value = center.lng + ", " + center.lat
      // as an object (doesn't work)
      //const value = { lon: center.lng, lat: center.lat }
      EventBus.$emit('field-value-changed', this.field.name, value)
    }
  },
  data() {
    return {
      center: [46, 2],
      zoom: 12,
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      markerLocation: [46, 2],
      values: [[46, 2]]
    }
  },
}
</script>
