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
<!--    <a-button type="primary" @click="openNotification">-->
<!--      Open the notification box-->
<!--    </a-button>-->
  </div>
</template>

<script>
import { yandexMap, loadYmap, ymapMarker } from 'vue-yandex-maps';
import { debounce, sortBy } from 'lodash';
// import { notification } from 'ant-design-vue';
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
      testPoints: {},
    };
  },
  methods: {
    // notification,
    debounce,
    async onClick(e) {
      this.coords = e.get('coords');
      // this.openNotification();
      this.getAdress();
      // console.log(e);
      const closestDistance = await this.calcClosestDistance(e);
      const firstCoords = this.setRoute(e, closestDistance);
      // const calcCoords =
      this.getDistProccess(firstCoords, e);
      console.log('1: ', this.testPoints);
      this.getInfo();
      // this.routeCarDistance(e, calcCoords[0].carCoord);
      // console.log('2: ', calcCoords.airCoord);
      // this.routeAirDistance(e, calcCoords[0].airCoord);
      // console.log('3');
      return true;
    },
    getInfo() {
      console.log(
        'координаты:  ', this.coords, '\n',
        'координаты ближайшей по земле:  ', this.testPoints.carCoord, '\n',
        'координаты ближайшей по воздуху:  ', this.testPoints.airCoord, '\n',
        'дистанция по земле:   ', this.testPoints.airDistance, '\n',
        'дистанция по воздуху:   ', this.testPoints.carDistance, '\n',
        'адрес:   ', this.testPoints.address,
      );
    },
    /* сохранение карты в переменную */
    initMap(map) {
      this.globalMap = map;
    },
    /* загрузка модуля yandex api vue для работы с ymaps */
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
    /* выбор n(point) ближайших точек */
    setRoute(e, distances) {
      const result = sortBy(distances, 'distance').slice(0, this.points);
      this.testPoints.airDistance = result[0].distance * 1000;
      return result;
    },
    /* выбор 2 ближайших точек: для расчета по воздуху и земле */
    async getDistProccess(selected, e) {
      const promises = [];
      selected.forEach((point) => {
        promises.push(this.calcDistance(e, point.coords));
      });
      const array = [];
      await Promise.all(promises).then((res) => {
        console.log(res);
        let min = 0;
        let minRes = res[0];
        res.forEach((point, index) => {
          if (point < minRes) {
            minRes = point;
            min = index;
          }
        });
        // console.log('Расстояние по воздуху:  ', selected[0]);
        // console.log('Расстояние по дорогам:  ', selected[min]);
        // this.testPoints = { carCoord: selected[min], airCoord: selected[0] };
        // console.log({ carCoord: selected[min], airCoord: selected[0] });
        // array.push({ carCoord: selected[min], airCoord: selected[0] });
        // return {};
        this.routeCarDistance(e, selected[min], res[min]);
        this.routeAirDistance(e, selected[0]);
      });
      return array;
    },
    /* создание пути на карте для авто */
    routeCarDistance(e, select, dist) {
      this.testPoints.carCoord = select;
      this.testPoints.carDistance = dist;
      console.log(select);
      // eslint-disable-next-line no-undef
      ymaps.route([e.get('coords'), select.coords]).then((router) => {
        if (this.route) this.globalMap.geoObjects.remove(this.route);
        this.route = router.getPaths();
        this.route.options.set({ strokeWidth: 5, strokeColor: '227f05', opacity: 0.7 });
        this.globalMap.geoObjects.add(this.route);
      });
    },
    /* создание пути на карте по воздуху */
    routeAirDistance(e, select) {
      this.testPoints.airCoord = select;
      console.log(select);
      // eslint-disable-next-line no-undef
      const myGeoObject = new ymaps.GeoObject({
        geometry: {
          type: 'LineString',
          coordinates: [e.get('coords'), select.coords],
        },
      }, {
        strokeColor: '#000000',
        strokeWidth: 4,
        strokeStyle: '1 5',
      });
      if (this.airRoute) this.globalMap.geoObjects.remove(this.airRoute);
      this.airRoute = myGeoObject;
      this.globalMap.geoObjects.add(this.airRoute);
    },
    // openNotification() {
    //   const key = `open${Date.now()}`;
    //   notification.open({
    //     message: 'Вы верно выбрали адрес? '
    //             + `${this.address}`,
    //     btn: (h) => h(
    //       'a-button',
    //       {
    //         props: {
    //           type: 'primary',
    //           size: 'small',
    //         },
    //         // on: {
    //         //   click: () => this.$notification.close(key),
    //         // },
    //       },
    //       'Confirm',
    //     ),
    //     key,
    //   });
    //   console.log('TEEEEEEEEEEEST');
    // },
  },
  async mounted() {
    await loadYmap();
  },
};
</script>

<style scoped>
</style>
