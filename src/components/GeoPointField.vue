<template>
  <FormGroup :field="field" :error="error">
    <b-input-group>
      <b-form-input
        v-model="value"
        :id="`field-${field.name}`"
        :placeholder="placeHolder"
        :required="isRequired"
        v-on:change="onChange"
        :state="isValid"
        :trim="true"
      />
      <b-input-group-append>
        <b-button variant="info" v-b-toggle="`${field.name}-collapse`" :title="mapTooltip">
            carte
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-collapse :id="`${field.name}-collapse`" v-model="showMap">
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
            Déplacez moi<br/>
            pour mettre à jour<br/>
            les coordonnées
          </l-tooltip>
        </l-marker>
      </l-map>
    </b-collapse>
  </FormGroup>
</template>

<script>
import FormGroup from '@/components/FormGroup.vue'
import ValidateField from '@/mixins/ValidateField.vue'
import { LMap, LTileLayer, LMarker, LTooltip } from 'vue2-leaflet'
import { EventBus } from '@/event-bus.js';

// Initial settings
const GEO_WIDGET_INITIAL_CENTER = [46.8, 2.11] // Center of France
const GEO_DECIMAL_COUNT = 2
const accessToken = process.env.VUE_APP_GEO_ACCESS_TOKEN
const GEO_TILES_URL = `https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}.png?access-token=${accessToken}`

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
    onChange(strValue) {
      // Called after the user changed text input value
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
      center: GEO_WIDGET_INITIAL_CENTER,
      markerLocation: GEO_WIDGET_INITIAL_CENTER,
      zoom: 5,
      accessToken: null,
      url: GEO_TILES_URL,
      attribution: `<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank"
                     class="jawg-attrib">&copy; <b>Jawg</b>Maps</a>
                     | <a href="https://www.openstreetmap.org/copyright"
                     title="OpenStreetMap is open data licensed under ODbL" target="_blank"
                     class="osm-attrib">&copy; OSM contributors</a>`,
      value: '',
      floatPrecision: GEO_DECIMAL_COUNT,
      showMap: false,
    }
  },
  computed: {
    placeHolder() {
      return this.field.example || "longitude,latitude"
    },
    mapTooltip() {
      return this.showMap ? "cacher la carte" : "afficher la carte"
    }
  },
  mounted() {
    // reset map on new form line
    EventBus.$on('form-reset', () => {
        this.center = GEO_WIDGET_INITIAL_CENTER
        this.markerLocation = GEO_WIDGET_INITIAL_CENTER
        this.showMap = false
        this.value = ''
    })
  }
}
</script>
