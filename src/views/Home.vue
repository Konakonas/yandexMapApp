<template>
  <div>
    <yandex-map
      zoom="12"
      style="width: 100%; max-width: 100%; height: 98vh;"
      :coords= "coords"
      v-on:click="onClick">
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
          :marker-fill="{color: '#1890ff', opacity: 0.4}"
          :marker-stroke="{color: '#1890ff', width: 1}"
          :balloon="{header: 'header', body: 'body', footer: 'footer'}"
      ></ymap-marker>
    </yandex-map>
    <h1>{{allData.currentAddress}}</h1>
    <div class="history" v-for="(adders, key) in allData.history" :key="key">
      {{adders.address}}
    </div>
  </div>
</template>

<script>
import { yandexMap, loadYmap } from 'vue-yandex-maps';
import { mapGetters, mapMutations } from 'vuex';
import mkadArray from './mkad';

export default {
  name: 'HelloWorld',
  components: { yandexMap },
  computed: mapGetters(['allData']),
  data() {
    return {
      coords: [55.7521833, 37.613614],
      options: {
        layout: 'default#image',
        imageSize: [30, 40],
        contentOffset: [0, 0],
      },
      polygon: mkadArray.map((i) => i.reverse()),
    };
  },
  methods: {
    ...mapMutations(['updateHistory']),
    ...mapMutations(['updateAddress']),
    onClick(e) {
      this.coords = e.get('coords');
      this.mounted(this.coords);
      console.log(this.closestPoint());
      return true;
    },
    async mounted() {
      await loadYmap({ debug: true })
        .then(() => {
          // eslint-disable-next-line no-undef
          ymaps.geocode(this.coords)
            .then((res) => {
              this.address = res.geoObjects.get(0)
                .getAddressLine();
              this.updateHistory({
                coords: this.coords,
                address: this.address,
              });
              this.updateAddress({
                coords: this.coords,
                address: this.address,
              });
            });
        });
    },
    closestPoint() {
      let minJ = 100000;
      let minDelta = 10000000;
      const currentPoint = this.coords;
      this.polygon.forEach((elem, key) => {
        const r = 6371;
        const dLat = (currentPoint[0] - elem[0]) * (Math.PI / 180);
        const dLon = (currentPoint[1] - elem[1]) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(elem[0] * (Math.PI / 180)) * Math.cos(currentPoint[0] * (Math.PI / 180))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        // const delta = (mkadPoints[j][0] - this.coords[0])
        //            * (mkadPoints[j][0] - this.coords[0])
        //            + (mkadPoints[j][1] - this.coords[1]) * (mkadPoints[j][1] - this.coords[1]);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = r * c; // Distance in km
        if (d < minDelta) {
          minJ = key;
          minDelta = d;
        }
        console.log(d);
      });
      return minJ;
    },
    /* getPolygon() {
      const mkadPoints = mkadArray;
      await loadYmap({ debug: true })
          .then(() => {
          let polygon = new YMaps.Polygon();
          for(i = 0; i < 108; i++) {
            polygon.addPoint(new YMaps.GeoPoint(mkad_km[i][1],mkad_km[i][2]));
          }
          map.addOverlay(polygon);
    }, */
    //   async getDistance() {
    //     const map = null;
    //     const mkadPoints = mkadArray;
    // //     // const minShir = mkadPoints[0][0];
    //     let dist = 0;
    //     let minDelta = 10000;
    //     let minJ = 0;
    //     const delta = 100000;
    //     function inPoly(x, y) {
    //       let j = mkadPoints.length - 1;
    //       let c = false; // true/false - внутри или вне полигона
    //       // eslint-disable-next-line no-plusplus
    //       for (let i = 0; i < mkadPoints.length; i++) {
    //         // eslint-disable-next-line no-undef,max-len,no-mixed-operators
    //         if ((((mkadPoints[i][1] <= y) && (y < mkadPoints[j][1]))
    //         || ((mkadPoints[j][1] <= y) && (y < mkadPoints[i][1])))
    //         && (x > (mkadPoints[j][0] - mkadPoints[i][0]) * (y - mkadPoints[i][1])
    //         / (mkadPoints[j][1] - mkadPoints[i][1]) + mkadPoints[i][0])) {
    //           c = !c;
    //         }
    //         j = i;
    //       }
    //       return c;
    //     }
    //     await loadYmap({ debug: true }).then(() => {
    //       if (!inPoly(...this.coords)) {
    //         // eslint-disable-next-line no-plusplus
    //         for (let j = 0; j < mkadPoints.length; j++) {
    // проверяем, какая из точек ближе всего
    //           // eslint-disable-next-line no-shadow,max-len
    //           const delta = (mkadPoints[j][0] - this.coords[0])
    //           * (mkadPoints[j][0] - this.coords[0])
    //           + (mkadPoints[j][1] - this.coords[1]) * (mkadPoints[j][1] - this.coords[1]);
    //           if (delta < minDelta) {
    //             const minShir = mkadPoints[j][0]; // широта ближайшей точки
    //             const minDolg = mkadPoints[j][1]; // долгота ближайшей точки
    //             minJ = j;
    //             minDelta = delta;
    //           }
    //         }
    //         // eslint-disable-next-line no-undef
    //         router = new ymaps.route([
    //           // eslint-disable-next-line no-undef
    //           allData.currentAddress,
    //         ]).then((route) => {
    //           const way = route.getPaths().get(0);
    //           const segments = way.getSegments();
    //           const numOfSegments = segments.length;
    //           let currSegment = numOfSegments - 1;
    //           let segment;
    //           map.geoObjects.add(route);
    //           map.setBounds(way.geometry.getBounds());
    //           while (currSegment >= 0) {
    //             segment = segments[currSegment];
    //             // если данный сегмент маршрута строится по МКАД, не учитываем
    //             if (segment.getStreet().indexOf('МКАД') >= 0) break;
    //             // eslint-disable-next-line no-plusplus
    //             currSegment--;
    //           }
    //           // eslint-disable-next-line no-plusplus
    //           for (let i = currSegment + 1; i < numOfSegments; i++) {
    //             dist += segments[i].getLength();
    //           }
    //         }, (error) => {
    //           console.log(`Возникла ошибка: ${error.message}`);
    //         });
    //       }
    //     },
    //     (error) => {
    //       console.log(`Возникла ошибка: ${error.message}`);
    //     });
    //     return (dist);
    //   },
    // },
    // var addr = 'Здесь адрес доставки';
    // var map = new YMaps.Map($("#YMapsID"));
    // var mysearchBounds = new YMaps.GeoBounds(new YMaps.GeoPoint(36.725552,56.334356),
    // new YMaps.GeoPoint(38.604214,55.296747)); // Ограничиваем область поиска адреса
    // var geocoder = new YMaps.Geocoder(addr, {boundedBy : mysearchBounds, strictBounds : true});
    // YMaps.Events.observe(geocoder, geocoder.Events.Load, function (geocoder) {
    //   if (geocoder.length()) { // Если адрес определен
    //     var point = geocoder.get(0).getGeoPoint();
    //
    //     // Создаем полигон МКАД по заданным координатам mkad_km
    //     var polygon = new YMaps.Polygon();
    //     for(i = 0; i < 108; i++) {
    //       polygon.addPoint(new YMaps.GeoPoint(mkad_km[i][1],mkad_km[i][2]));
    //     }
    //     map.addOverlay(polygon); // Обязательно добавляем на карту, иначе не будет работать
    //
    //     if(polygon.contains(point)) {
    //
    //       // Адрес внутри МКАД
    //
    //     } else {
    //
    //       // Адрес за МКАД
    //       // Расчет расстояния до адреса
    //       var from_km = polygon.getClosestPoint(point); // Ближайшая точка МКАД к адресу
    //       var router = new YMaps.Router([mkad_km[from_km.index][0] + 'км МКАД', addr]);
    // Строим маршрут от МКАД до адреса
    //       //Если путь найден
    //       YMaps.Events.observe(router, router.Events.Success, function () {
    //         var distance = Math.ceil(router.getDistance()/1000);
    // Получаем расстояние в км и округляем
    //       });
    //
    //     }
    //   } else {
    //
    //     // Адрес не удалось определить
    //
    //   }
    // });
  },
};
</script>

<style scoped>

</style>
