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
    </yandex-map>
    <h1>{{allData.currentAddress}}</h1>
    <div class="history" v-for="addrs in allData.history" :key="addrs.coords">
      {{addrs.address}}
    </div>
  </div>
</template>

<script>
import { yandexMap, loadYmap } from 'vue-yandex-maps';
import { mapGetters, mapMutations } from 'vuex';

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
    };
  },
  methods: {
    ...mapMutations(['updateHistory']),
    ...mapMutations(['updateAddress']),
    onClick(e) {
      this.coords = e.get('coords');
      this.mounted(this.coords);
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
    //   async getDistance() {
    //     const map = null;
    //     const mkadPoints = [
    //       [37.842663, 55.774543],
    //       [37.842663, 55.774543],
    //       [37.84269, 55.765129],
    //       [37.84216, 55.75589],
    //       [37.842232, 55.747672],
    //       [37.841109, 55.739098],
    //       [37.840112, 55.730517],
    //       [37.839555, 55.721782],
    //       [37.836968, 55.712173],
    //       [37.832449, 55.702566],
    //       [37.829557, 55.694271],
    //       [37.831425, 55.685214],
    //       [37.834695, 55.676732],
    //       [37.837543, 55.66763],
    //       [37.839295, 55.658535],
    //       [37.834713, 55.650881],
    //       [37.824948, 55.643749],
    //       [37.813746, 55.636433],
    //       [37.803083, 55.629521],
    //       [37.793022, 55.623666],
    //       [37.781614, 55.617657],
    //       [37.769945, 55.61114],
    //       [37.758428, 55.604819],
    //       [37.747199, 55.599077],
    //       [37.736949, 55.594763],
    //       [37.721013, 55.588135],
    //       [37.709416, 55.58407],
    //       [37.695708, 55.578971],
    //       [37.682709, 55.574157],
    //       [37.668471, 55.57209],
    //       [37.649948, 55.572767],
    //       [37.63252, 55.573749],
    //       [37.619243, 55.574579],
    //       [37.600828, 55.575648],
    //       [37.586814, 55.577785],
    //       [37.571866, 55.581383],
    //       [37.55761, 55.584782],
    //       [37.534541, 55.590027],
    //       [37.527732, 55.59166],
    //       [37.512227, 55.596173],
    //       [37.501959, 55.602902],
    //       [37.493874, 55.609685],
    //       [37.485682, 55.616259],
    //       [37.477812, 55.623066],
    //       [37.466709, 55.63252],
    //       [37.459074, 55.639568],
    //       [37.450135, 55.646802],
    //       [37.441691, 55.65434],
    //       [37.433292, 55.66177],
    //       [37.425513, 55.671509],
    //       [37.418497, 55.680179],
    //       [37.414338, 55.687995],
    //       [37.408076, 55.695418],
    //       [37.397934, 55.70247],
    //       [37.388978, 55.709784],
    //       [37.38322, 55.718354],
    //       [37.379681, 55.725427],
    //       [37.37483, 55.734978],
    //       [37.370131, 55.745291],
    //       [37.369368, 55.754978],
    //       [37.369062, 55.763022],
    //       [37.369691, 55.771408],
    //       [37.370086, 55.782309],
    //       [37.372979, 55.789537],
    //       [37.37862, 55.796031],
    //       [37.387047, 55.806252],
    //       [37.390523, 55.81471],
    //       [37.393371, 55.824147],
    //       [37.395176, 55.832257],
    //       [37.394476, 55.840831],
    //       [37.392949, 55.850767],
    //       [37.397368, 55.858756],
    //       [37.404564, 55.866238],
    //       [37.417446, 55.872996],
    //       [37.429672, 55.876839],
    //       [37.443129, 55.88101],
    //       [37.45955, 55.882904],
    //       [37.474237, 55.88513],
    //       [37.489634, 55.889361],
    //       [37.503001, 55.894737],
    //       [37.519072, 55.901823],
    //       [37.529367, 55.905654],
    //       [37.543749, 55.907682],
    //       [37.559757, 55.909418],
    //       [37.575423, 55.910881],
    //       [37.590488, 55.90913],
    //       [37.607035, 55.904902],
    //       [37.621911, 55.901152],
    //       [37.633014, 55.898735],
    //       [37.652993, 55.896458],
    //       [37.664905, 55.895661],
    //       [37.681443, 55.895106],
    //       [37.697513, 55.894046],
    //       [37.711276, 55.889997],
    //       [37.723681, 55.883636],
    //       [37.736168, 55.877359],
    //       [37.74437, 55.872743],
    //       [37.75718, 55.866137],
    //       [37.773646, 55.8577],
    //       [37.780284, 55.854234],
    //       [37.792322, 55.848038],
    //       [37.807961, 55.840007],
    //       [37.816127, 55.835816],
    //       [37.829665, 55.828718],
    //       [37.836914, 55.821325],
    //       [37.83942, 55.811538],
    //       [37.840166, 55.802472],
    //       [37.841145, 55.793925],
    //     ];
    //     // const minShir = mkadPoints[0][0];
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
    //         if ((((mkad_points[i][1] <= y) && (y < mkad_points[j][1]))
    //         || ((mkad_points[j][1] <= y) && (y < mkad_points[i][1])))
    //         && (x > (mkad_points[j][0] - mkad_points[i][0]) * (y - mkad_points[i][1])
    //         / (mkad_points[j][1] - mkad_points[i][1]) + mkad_points[i][0])) {
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
