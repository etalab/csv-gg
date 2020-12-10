<template>
  <FormGroup :field="field" :error="error">
    <!-- <b-form-input
      v-model="value"
      :id="`field-${field.name}`"
      type="text"
      :placeholder="field.example"
      :required="isRequired"
      v-on:input="onInput"
      :state="isValid"
    /> -->
    <div id="my_map">
      <l-map ref="myMap"></l-map>
    </div>
  </FormGroup>
</template>

<script>
import FormGroup from '@/components/FormGroup.vue'
import ValidateField from '@/mixins/ValidateField.vue'
import L from 'leaflet'


function initMap(map) {
  // Initial settings
  const coords = [46, 2]
  const zoomLevel = 12

  map.setView(coords, zoomLevel)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  let marker = L.marker(coords, {
    draggable: true
  }).addTo(map)
    .bindPopup('Choisir<br/>un point géographique')
    .openPopup();

  marker.on('dragstart', function(e) {
    marker.closePopup()
  })
  marker.on('dragend', function(e) {
    const lon = marker.getLatLng().lng
    const lat = marker.getLatLng().lat
    marker.bindPopup(`${lon.toFixed(2)}, ${lat.toFixed(2)}`)
    marker.openPopup()
  })

}

export default {
  name: 'GeoPointField',
  mixins: [ValidateField],
  components: {
    FormGroup
  },
  data() {
    return {
      lon: null,
      lat: null,
    }
  },
  mounted() {
      const map = this.$refs.myMap.mapObject
      initMap(map)
  },
}
</script>

<style>
  #my_map {
    height: 300px;
  }
</style>