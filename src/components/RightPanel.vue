<template>
  <v-card>
    <v-card-text>
      <empty-state v-if="!shot"/>
      <v-img v-else aspect-ratio="1" :src="shot" class="mb-4" />
      <div class="d-flex">
        <v-text-field v-model.number="coordinates.longitude" :rules="[rules.coordinates]" label="Долгота" class="mr-1" outlined dense />
        <v-text-field v-model.number="coordinates.latitude" :rules="[rules.coordinates]" label="Широта" outlined dense />
      </div>
      <div class="d-flex">
        <v-menu v-model="menuDateStart" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field v-model="dateStart" label="Начало" class="mr-1" readonly v-bind="attrs" v-on="on" outlined dense />
          </template>
          <v-date-picker v-model="dateStart" @input="menuDateStart = false" :max="dateEnd" />
        </v-menu>
        <v-menu v-model="menuDateEnd" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field v-model="dateEnd" label="Конец" readonly v-bind="attrs" v-on="on" outlined dense />
          </template>
          <v-date-picker v-model="dateEnd" @input="menuDateEnd = false" :min="dateStart" />
        </v-menu>
      </div>
      <div class="d-flex input-width-33">
        <v-text-field label="Площадь" v-model="area" disabled :rules="[rules.integer]" outlined dense />
        <v-text-field class="mx-1" label="Заоблочность, %" v-model="cloudPercent" disabled :rules="[rules.integer]" outlined dense />
        <v-text-field v-model.number="scale" label="Масштаб" :rules="[rules.integer]" outlined dense />
      </div>
      <div class="d-flex">
        <v-select class="mr-1" :items="satellites" v-model="satellite" outlined dense label="Спутник" disabled hide-details></v-select>
        <v-select :items="bands" v-model="selectBands" outlined dense label="Спектры" multiple hide-details>
          <template v-slot:selection="{ index }">
            <span v-if="index === 1" class="grey--text caption">{{ selectBands.length }} выбано</span>
          </template>
        </v-select>
      </div>
      <v-radio-group v-model="postFunction" row hide-details>
        <v-radio label=".median()" value="median" />
        <v-radio label=".mean()" value="mean" />
        <v-radio label=".first()" value="first" />
      </v-radio-group>
      <v-checkbox v-model="checkColorImage" label="Цветное изображение" />
			<div class="d-flex flex-nowrap">
				<v-btn class="flex-grow-1" color="primary" @click="
						sendGetShots(
							coordinates,
							[dateStart, dateEnd],
							area,
							cloudPercent,
							scale,
							satellite,
							selectBands,
							postFunction,
							checkColorImage
						)
					" :disabled="disabledButton">Получить</v-btn>
				<v-btn v-if="archiveUrl" :href="archiveUrl" class="ml-2 flex-grow-0" dark color="primary"><v-icon dark> mdi-package-down </v-icon></v-btn>
			</div>
    </v-card-text>
    <v-speed-dial absolute right bottom transition="slide-x-reverse-transition" direction="left">
      <template v-slot:activator>
        <v-btn v-model="statusButtonsSaveData" color="blue darken-2" dark fab title="Управление данными">
          <v-icon v-if="statusButtonsSaveData">mdi-close</v-icon>
          <v-icon v-else>mdi-database-cog-outline</v-icon>
        </v-btn>
      </template>
      <v-btn fab dark small color="green" @click="saveToFile()" title="Сохранить файлом"><v-icon>mdi-file-download-outline</v-icon></v-btn>
      <v-btn fab dark small color="green" @click="loadFromFile()" title="Загрузить из файла"><v-icon>mdi-file-upload-outline</v-icon></v-btn>
      <v-btn fab dark small color="green" @click="saveToLocalStorage()" title="Сохранить в localStorage"><v-icon>mdi-cloud-download-outline</v-icon></v-btn>
      <v-btn fab dark small color="green" @click="loadFromLocalStorage()" title="Загрузить из localStorage"><v-icon>mdi-cloud-upload-outline</v-icon></v-btn>
      <v-btn fab dark small color="pink" @click="$emit('load-test')"><v-icon>mdi-cloud-circle</v-icon></v-btn>
    </v-speed-dial>
  </v-card>
</template>

<script>
export default {
	props:{
		archiveUrl: {
			type: String,
			default: null
    },
    shot: {
      default: null
    }
	},
  data: () => ({
    coordinates: {
      longitude: 135,
      latitude: 45,
    },
    dateStart: new Date("2017-01-01").toISOString().substr(0, 10),
    dateEnd: new Date().toISOString().substr(0, 10),
    menuDateStart: false,
    menuDateEnd: false,
    satellites: [
      {
        text: "Sentinel-2 Level-2A",
        value: "COPERNICUS/S2_SR",
      },
      {
        text: "Sentinel-2 Level-1C",
        value: "COPERNICUS/S2",
        disabled: true,
      },
      {
        text: "Landsat-8 Surface Reflectance Tier 1",
        value: "LANDSAT/LC08/C01/T1_SR",
        disabled: true,
      },
    ],
    satellite: "COPERNICUS/S2_SR",
    area: 1,
    cloudPercent: 10,
    scale: 1,
    bands: [
      "B1",
      "B2",
      "B3",
      "B4",
      "B5",
      "B6",
      "B7",
      "B8",
      "B8A",
      "B9",
      "B11",
      "B12",
      "TCI_R",
      "TCI_G",
      "TCI_B",
    ], // TODO Получение доступных спектров из родительского компонента
    selectBands: ["B2", "B3", "B4", "B5", "TCI_R", "TCI_G", "TCI_B"],
    checkColorImage: true,
    postFunction: "median",

    statusButtonsSaveData: false,
    rules: {
      coordinates: (value) =>
        (Number.isFinite(+value) && value.length != 0) || "Невалидное значение",
      integer: (value) => Number.isInteger(+value) || "Нужно целое значение",
      min10: (value) => value > 10 || "Нужно больше 10",
    },
  }),
  //TODO при загрузке получить значение localStrage
  computed: {
    disabledButton() {
      if (
        this.coordinates.longitude &&
        this.coordinates.latitude &&
        this.dateStart &&
        this.area &&
        this.scale &&
        this.selectBands.length
      )
        return false;
      else return true;
    },
    formattedData: {
      set: function(newValue){
        Object.keys(newValue).sort().forEach(key=>{
          this[key] = newValue[key];
        })
      },
      get: function(){
        return{
          coordinates: this.coordinates,
          date: [this.dateStart,this.dateEnd],
          area: this.area,
          cloudPercent: this.cloudPercent,
          scale: this.scale,
          satellite: this.satellite,
          bands: this.selectBands,
          postFunction: this.postFunction,
          colorImage: this.checkColorImage,
        }
      }
    }
  },
  methods: {
    /**
     * Отправка данных для получения шота
     * @param {Object} coordinates Координаты центра запрашиваемой области
     * @param {Array} date Ограничение по времени
     * @param {Number} area Площадь запрашиваемой секции
     * @param {Number} cloudPercent Максимальный процент заоблочности
     * @param {Number} scale Масштаб(качество) снимка
     * @param {String} satellite Название спутника, с которого нужно запросить снимки
     * @param {Array} bands Массив названий спектров, которые нужно получить
     * @param {String} postFunction Название конечной функции, применяемой к выборке(first,median, mean)
     * @param {Boolean} colorImage Чек, реализовывать ли цветное изображение
     */
    // eslint-disable-next-line no-unused-vars
    sendGetShots(
      coordinates,
      date,
      area,
      cloudPercent,
      scale,
      satellite,
      bands,
      postFunction,
      colorImage
    ) {
      this.$emit("get-shots", {
        coordinates: coordinates,
        date: date,
        area: area,
        cloudPercent: cloudPercent,
        scale: scale,
        satellite: satellite,
        bands: bands,
        postFunction: postFunction,
        colorImage: colorImage,
      });
    },
    saveToLocalStorage(){
      localStorage.setItem("data-right-panel", JSON.stringify(this.formattedData))
    },
    loadFromLocalStorage(){
      if(localStorage.length){
        let dataFromStore = JSON.parse(localStorage.getItem("data-right-panel"));
        this.coordinates = dataFromStore.coordinates;
        this.dateStart = dataFromStore.date[0];
        this.dateEnd = dataFromStore.date[1];
        this.area = dataFromStore.area;
        this.cloudPercent = dataFromStore.cloudPercent;
        this.scale = dataFromStore.scale;
        this.satellite = dataFromStore.satellite;
        this.selectBands = dataFromStore.bands;
        this.postFunction = dataFromStore.postFunction;
        this.colorImage = dataFromStore.colorImage;
      }
    },
    saveToFile(){
      let a = document.createElement("a");
      let file = new Blob([JSON.stringify(this.formattedData)], {type: 'application/json'});
      a.href = URL.createObjectURL(file);
      a.download = 'data.json';
      a.click();
    },
    loadFromFile(){
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async ()=>{
        let data = JSON.parse(await input.files[0].text());
        // console.log(Object.keys(data).sort());
        // console.log(Object.keys(this.formattedData).sort());
        let bool = JSON.stringify(Object.keys(data).sort()) == JSON.stringify(Object.keys(this.formattedData).sort());
        if(bool){
          this.formattedData = data;
        }else{
          this.$emit("error-snackbar", {
            "text": "Некорректный синтаксис",
            "error": true
          })
        }
      }
      input.click();
    }
  },
};
</script>

<style></style>
