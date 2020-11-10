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
              marker-id="1"
              hint-content="some hint"
              :mouseenter="{color: '#1890ff', opacity: 1}"
      />
      <ymap-marker
              :marker-id="1234"
              marker-type="polygon"
              :coords="[polygon,[]]"
              circle-radius="16000"
              :marker-fill="{color: '#1890ff', opacity: 0.7}"
              :marker-stroke="{color: '#1890ff', width: 1}"
              @click="onClick"
      ></ymap-marker>
    </yandex-map>
  </div>
</template>

<script>
import { yandexMap, loadYmap, ymapMarker } from 'vue-yandex-maps';
import { debounce, sortBy, minBy } from 'lodash';
import { notification } from 'ant-design-vue';
import mkadArray from './mkad';
/* CONST */
const MAX_POINTS_CHECK = 5; // Вот так нормально заводятся константы

export default {
  components: { yandexMap, ymapMarker },
  data() {
    return {
      opt: 0.4,
      coords: [],
      polygon: mkadArray,
      zoom: 12,
    };
  },
  methods: {
    debounce,
    async onClick(e) {
      this.coords = e.get('coords');
      const closestDistance = await this.calcClosestDistance(e);
      const minDistance = await this.getDistance(e.get('coords'), closestDistance);
      this.pushInfo(minDistance);
      return true;
    },
    pushInfo(i) {
      console.log(i);
      const key = `open${Date.now()}`;
      notification.open({
        message: 'Заголовок',
        description:
            `Информация в json сам переведи в норм вид ${JSON.stringify(i)}`,
        btn: (h) => h(
          'a-button',
          {
            props: {
              type: 'primary',
              size: 'small',
            },
            on: {
              click: () => notification.close(key), // Вешай функцию на событие
            },
          },
          'Записать',
        ),
        key,
      });
    },
    /* сохранение карты в переменную */
    initMap(map) {
      this.globalMap = map;
    },

    /*
      загрузка модуля yandex api vue для работы с ymaps
    */

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

    calcClosestDistance(e) {
      const currentPoint = e.get('coords');
      return this.polygon.map((coords) => {
        const r = 6371; // Радиус земли
        const dLat = (currentPoint[0].toFixed(6) - coords[0]) * (Math.PI / 180);
        const dLon = (currentPoint[1].toFixed(6) - coords[1]) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            // eslint-disable-next-line max-len
            + Math.cos(coords[0] * (Math.PI / 180)) * Math.cos(currentPoint[0] * (Math.PI / 180))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = r * c;
        return { distance, coords };
      });
    },

    /* расчет ближайшего расстояния по земле */

    async calcDistance(coordsA, coordsB) {
      // eslint-disable-next-line no-undef
      const dis = await ymaps.route([coordsA, coordsB]);
      return dis.getLength();
    },

    /* выбор n(point) ближайших точек */

    filterCoords(coords) {
      return sortBy(coords, 'distance').slice(0, MAX_POINTS_CHECK);
    },

    /* выбор 2 ближайших точек: для расчета по воздуху и земле */

    async getDistance(point, coords) {
      const filterCoords = this.filterCoords(coords);
      const promises = filterCoords.map(async (i) => {
        // eslint-disable-next-line no-param-reassign
        i.carDistance = await this.calcDistance(point, i.coords);
        return i;
      });
      return Promise.all(promises).then((res) => ({ minAir: minBy(res, 'distance'), minCar: minBy(res, 'carDistance') }));
    },
  },

  async mounted() {
    await loadYmap();
  },
};
</script>

<style scoped>
</style>
