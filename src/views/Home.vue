<template>
  <div>
    <yandex-map
            :zoom="zoom"
            style="width: 100%; max-width: 100%; height: 98vh;"
            :coords= "coords.length ? coords : [55.7521833, 37.613614]"
            @click="onClick"
            @map-was-initialized="initMap"
    >
      <ymap-marker
              :coords="coords"
              marker-id="123"
              hint-content="some hint"
      />
      <ymap-marker
              :marker-id="1234"
              marker-type="polygon"
              :coords="[polygon,[]]"
              circle-radius="16000"
              :marker-fill="{color: '#1890ff', opacity: opt}"
              :marker-stroke="{color: '#1890ff', width: 1}"
              @click="onClick"
      ></ymap-marker>
    </yandex-map>
  </div>
</template>

<script>
import { yandexMap, loadYmap, ymapMarker } from 'vue-yandex-maps';
import { debounce, sortBy } from 'lodash';
import mkadArray from './mkad';

export default {
  components: { yandexMap, ymapMarker },
  data() {
    return {
      opt: 0.4,
      coords: [],
      address: null,
      polygon: mkadArray,
      globalMap: null,
      route: null,
      airRoute: null,
      zoom: 12,
      points: 5,
    };
  },
  methods: {
    debounce,
    async onClick(e) {
      this.coords = e.get('coords');
      this.getAdress();
      console.log(e);
      const closestDistance = await this.сalcClosestDistance(e);
      this.setRoute(e, closestDistance);
      return true;
    },
    /* сохранение карты в переменную */
    initMap(map) {
      this.globalMap = map;
    },
    /* - */
    async geocoder() {
      await loadYmap();
    },
    /* получение адреса по координатам */
    async getAdress() {
      // eslint-disable-next-line no-undef
      ymaps.geocode(this.coords)
        .then((res) => {
          this.address = res.geoObjects.get(0)
            .getAddressLine();
        });
    },
    /* расчет ближайшего расстояния по воздуху */
    сalcClosestDistance(e) {
      const currentPoint = e.get('coords');
      const object = [];
      this.polygon.forEach(async (coords) => {
        const r = 6371; // Радиус земли
        const dLat = (currentPoint[0].toFixed(6) - coords[0]) * (Math.PI / 180);
        const dLon = (currentPoint[1].toFixed(6) - coords[1]) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        // eslint-disable-next-line max-len
                  + Math.cos(coords[0] * (Math.PI / 180)) * Math.cos(currentPoint[0] * (Math.PI / 180))
                  * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = r * c;
        object.push({ distance, coords });
      });
      return object;
    },
    /* расчет ближайшего расстояния по земле */
    async calcDistance(e, coords) {
      // eslint-disable-next-line no-undef
      const dis = await ymaps.route([e.get('coords'), coords]);
      return dis.getLength();
    },
    /* расчет путей */
    setRoute(e, distances) {
      const selected = sortBy(distances, 'distance');
      const count = this.points;
      this.getDistProccess(selected.slice(0, count), e);
    },
    /* выбор ближайших точек для расчета по воздуху и земле */
    async getDistProccess(selected, e) {
      const promises = [];
      selected.forEach((point) => {
        promises.push(this.calcDistance(e, point.coords));
      });
      await Promise.all(promises).then((res) => {
        let min = 0;
        let minRes = res[0];
        res.forEach((point, index) => {
          if (point < minRes) {
            minRes = point;
            min = index;
          }
        });
        console.log('Расстояние по воздуху:  ', selected[0]);
        console.log('Расстояние по дорогам:  ', selected[min]);
        this.routeCarDistance(e, selected[min]);
        this.routeAirDistance(e, selected[0]);
      });
    },
    /* создание маршрута по земле */
    routeCarDistance(e, select) {
      // eslint-disable-next-line no-undef
      ymaps.route([e.get('coords'), select.coords]).then((router) => {
        if (this.route) this.globalMap.geoObjects.remove(this.route);
        this.route = router.getPaths();
        this.route.options.set({ strokeWidth: 5, strokeColor: '227f05', opacity: 0.7 });
        this.globalMap.geoObjects.add(this.route);
      });
    },
    /* создание маршрута по воздуху */
    routeAirDistance(e, select) {
      // eslint-disable-next-line no-undef
      const myGeoObject = new ymaps.GeoObject({
        geometry: {
          type: 'LineString',
          coordinates: [e.get('coords'), select.coords],
        },
      });
      if (this.airRoute) this.globalMap.geoObjects.remove(this.airRoute);
      this.airRoute = myGeoObject;
      this.airRoute.set({ strokeColor: '#000000', strokeWidth: 4, strokeStyle: '1 5' });
      this.globalMap.geoObjects.add(this.airRoute);
    },
  },
  async mounted() {
    await loadYmap();
  },
};
</script>

<style scoped>
</style>
