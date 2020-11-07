<template>
  <div>
    <yandex-map
      zoom="12"
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
          :balloon="{header: 'header', body: 'body', footer: 'footer'}"
          @click="onClick"
          @mouseenter="debounce(opt = 0.1,1000)"
          @mouseleave="debounce(opt = 0.4,1000)"
      ></ymap-marker>
    </yandex-map>
  </div>
</template>

<script>
import { yandexMap, loadYmap, ymapMarker } from 'vue-yandex-maps';
import { sortBy, debounce } from 'lodash';
import mkadArray from './mkad';

export default {
  components: { yandexMap, ymapMarker },
  data() {
    return {
      opt: 0.4,
      coords: [],
      polygon: mkadArray.map((i) => i.reverse()),
      globalMap: null,
      route: null,
    };
  },
  methods: {
    debounce,

    onClick(e) {
      console.log(e);
      this.coords = e.get('coords');
      const closestDistance = this.getClosestDistance(e.get('coords'));
      this.setRoute(e, closestDistance);
      return true;
    },

    /* - */

    initMap(map) {
      this.globalMap = map;
      console.log(map);
    },

    /* - */

    async geocoder() {
      await loadYmap();
    },

    /* - */

    getClosestDistance(currentPoint) {
      const object = [];
      this.polygon.forEach((coords) => {
        const r = 6371; // Радиус земли
        const dLat = (currentPoint[0].toFixed(6) - coords[0]) * (Math.PI / 180);
        const dLon = (currentPoint[1].toFixed(6) - coords[1]) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(coords[0] * (Math.PI / 180)) * Math.cos(currentPoint[0] * (Math.PI / 180))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = r * c; // Дистанция в КМ
        object.push({ distance, coords });
      });
      return object;
    },

    setRoute(e, closestDistance) {
      const selectPoint = sortBy(closestDistance, 'distance')[0];
      // eslint-disable-next-line no-undef
      ymaps.route([e.get('coords'), selectPoint.coords]).then((router) => {
        const distance = router.getLength();
        console.log(distance);
        /* message = '<span>Расстояние: ' + _this.distance + 'км.</span><br/>' +
            '<span>Время в пути: ' +  _this.secToTime(_this.routeTime) + '.</span><br/>' ; */

        console.log('dfdfdf');
        console.log('info', this.route);
        console.log(this.globalMap);

        if (this.route) this.globalMap.geoObjects.remove(this.route);
        this.route = router.getPaths();
        this.route.options.set({ strokeWidth: 5, strokeColor: '227f05', opacity: 0.7 });
        this.globalMap.geoObjects.add(this.route);

        /* _this.end_point.properties.set('iconContent',  _this.distance + ' км.');
        _this.end_point.properties.set('balloonContentBody', _this.address + message); */
      }, (error) => {
        console.log(error);
        // alert('Возникла ошибка: ' + error.message);
      });
      /* const selectPoint = sortBy(closestDistance, 'distance')[0];
      // eslint-disable-next-line no-undef
      const multiRoute = new ymaps.multiRouter.MultiRoute({
        referencePoints: [
          e.get('coords'),
          selectPoint.coords,
        ],
        params: {
          results: 2,
        },
      }, {
        boundsAutoApply: true,
      });
      this.globalMap.geoObjects.add(multiRoute); */
    },

  },

  async mounted() {
    await loadYmap();
  },
};
</script>

<style scoped>

</style>
