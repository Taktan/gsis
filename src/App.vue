<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div style="text-align:center;width:100%;line-height: 0px;" class="title">Получить квадратное изображение со спутника <span class="caption"><br />с помощью Google Earth Engine</span></div>
      <v-progress-circular indeterminate v-if="!loadedGoogle"/>
      <template v-else>
        <v-btn v-if="!statusGoogle" icon color="red" @click="authenticate()"><v-icon>mdi-google</v-icon></v-btn>
        <v-icon v-else color="green">mdi-google</v-icon>
      </template>
      
      
    </v-app-bar>

    <v-main>
      <v-container class="container-all-height" fluid style="height:'100%'">
        <div class="panels">
          <div class="left-panel" ref="leftPanel">
            <v-card>
              <v-tabs v-model="tabs" right icons-and-text>
                <v-tab>Един.<v-icon>mdi-image-area</v-icon></v-tab>
                <v-tab>Множ.<v-icon>mdi-view-comfy</v-icon></v-tab>
                <v-tab disabled>Карта<v-icon>mdi-map-outline</v-icon></v-tab>
              </v-tabs>
              <v-tabs-items v-model="tabs">
                <v-tab-item>
                  <div class="parent-zoomer-image">
                    <v-zoomer class="zoomer-image-container">
                      <img
                        src="/out.jpg"
                      >
                    </v-zoomer>
                  </div>
                  <div class="absolute-select elevation-5 ma-1 pa-1">
                    <v-select hide-details :items="['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12','Q10','Q20','Q30','TCI-R','TCI-G','TCI-B','color']" 
                      label="Спектр" dense outlined></v-select>
                  </div>
                </v-tab-item>
                <v-tab-item>
                  <v-skeleton-loader type="image" height="100%" v-if="!loadedStartApp"/>
                  <template v-else>
                    <div class="cards-images">
                      <v-card v-for="n in 9" :key="n" :width="widthCard">
                        <v-img src="/out.jpg">
                          <span class="text-in-image">Тест спектра</span>
                        </v-img>
                      </v-card>
                    </div>
                    <div class="absolute-select elevation-5 ma-1 pa-1" >
                      <v-slider
                        label="Размер"
                        max="10"
                        min="2"
                        hide-details
                        v-model="countInRow"
                        thumb-label="always"
                      />
                    </div>
                  </template>
                </v-tab-item>
                <v-tab-item>Три</v-tab-item>
              </v-tabs-items>
              
            </v-card>
          </div>
          <div class="right-panel">
            <v-card>
              <v-card-text>
                <v-img
                  aspect-ratio="1"
                  lazy-src="/out.jpg"
                  src="/out.jpg"
                  class="mb-4"
                ></v-img>
                <span class="subtitle-2">Координаты</span>
                <div class="d-flex">
                  <v-text-field label="Долгота" class="mr-1" outlined dense /> 
                  <v-text-field label="Широта" outlined dense />
                </div>
                <span class="subtitle-2">Ограничение по времени</span>
                <div class="d-flex">
                  <v-menu v-model="menuDateStart" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="dateStart" label="Начало" class="mr-1" readonly v-bind="attrs" v-on="on" outlined dense/>
                    </template>
                    <v-date-picker v-model="dateStart" @input="menuDateStart = false" />
                  </v-menu>
                  <v-menu v-model="menuDateEnd" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="dateEnd" label="Конец" readonly v-bind="attrs" v-on="on" outlined dense/>
                    </template>
                    <v-date-picker v-model="dateEnd" @input="menuDateEnd = false" />
                  </v-menu>
                </div>
                <div class="d-flex input-width-33">
                  <v-text-field label="Площадь" outlined dense />
                  <v-text-field class=" mx-1" label="Масштаб"  outlined dense />
                  <v-select :items="satellites" outlined dense label="Спутник"></v-select>
                </div>
                <!-- <v-switch label="Цветное изображение"></v-switch> -->
                <v-btn block color="primary" @click="snackbar.active = true">Получить</v-btn>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-container>
    </v-main>
    <v-dialog v-model="dialogLoaded" max-width="300" persistent>
      <v-card>
        <div class="card-dialog-loaded-content">
          <v-card-text>
            <v-progress-circular indeterminate color="primary" :size="75" :width="10"/>
            <p class="mt-2 body-1">Текст про загрузку</p>
          </v-card-text>
        </div>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar.active">{{ snackbar.text }}</v-snackbar>
  </v-app>
</template>

<script>
import ee from '@google/earthengine'
import privateJson from '../private.json'


export default {
  name: 'App',
  components:{
  },
  created(){
    this.authenticate()
  },
  data: () => ({
    loadedStartApp: false,
    dialogLoaded: false,
    snackbar:{
      active: false,
      text: "Тестовый текст"
    },
    statusGoogle: false,
    loadedGoogle: false,

    dateStart: new Date("2000-01-01").toISOString().substr(0, 10),
    dateEnd: new Date().toISOString().substr(0, 10),
    menuDateStart: false,
    menuDateEnd: false,

    satellites: ['Sentinel-2', 'Landsat-8'],

    tabs: 1,

    countInRow: 5,
    // widthCard: 300,
  }),
  mounted(){
    this.loadedStartApp = true;
    // this.widthCard = this.$refs.leftPanel.clientWidth / this.countInRow - 5 * this.countInRow
  },
  beforeUpdate(){
    
  },
  computed:{ // TODO сделать проверку на числа при вводе долготы и широты, площади, масштаба
    widthCard(){
      return this.$refs.leftPanel.clientWidth / (this.countInRow +   1)
    }
  },
  methods:{
    initialize(){
      ee.initialize();
      this.loadedGoogle = true;
    },
    authenticate(){
      this.loadedGoogle = false;
      ee.data.authenticateViaOauth(privateJson.clientID, ()=>{
          this.statusGoogle = true
          this.initialize()
        }, (e) => {
        console.error('Authentication error: ' + e);
        this.statusGoogle = false;
        this.loadedGoogle = true;
      }, null, () => {
        ee.data.authenticateViaPopup(()=>{
          this.statusGoogle = true
          this.initialize()
        }, (e)=>{
          console.log(e);
          this.statusGoogle = false
          this.loadedGoogle = true
        });
      });
    }
  }
};
</script>

<style>
  html, body{
    height:100vh;
    overflow:hidden
  }
  .v-application{
    height:100%;
  }
  .v-main{
    height:100%;
  }

  .container-all-height{
    height:100%;
  }
  .container-all-height > .row{
    height:100%;
  }
  .container-all-height > .row .left-panel > .v-card, .container-all-height > .row .right-panel > .v-card{
    height:100%;
    overflow: auto;
  }

  .container-all-height > .panels{
    display:flex;
    flex-wrap: nowrap;
    flex-direction: row;
    height: 100%;
    overflow: hidden;
  }
  .container-all-height > .panels > .left-panel{
    flex:1;
    max-height:100%;
  }
  .container-all-height > .panels > .right-panel{
    width:430px;
    flex-shrink: 0;
    max-height:100%;
  }

  .container-all-height > .panels > div > .v-card{
    height:100%;
  }

  .input-width-33 > .v-text-field{
    width:33%;
  }
  .parent-zoomer-image{
    width:100%;
    height: calc(100vh - 159px);
    text-align:center;
  }
  .parent-zoomer-image > .zoomer-image-container{
    height:100%;
  }
  .parent-zoomer-image > .zoomer-image-container img{
    max-width:100%;
    max-height:100%;
  }
  .absolute-select{
    position: absolute;
    top:0px;
    left:0px;
    background-color:white;
    border-radius: 5px;
    min-width:250px;
    text-align:center;
  }

  
  .cards-images{
    width:100%;
    height: calc(100vh - 159px);
    display:flex;
    flex-wrap: wrap;
    overflow: auto;
    align-items: baseline;
    align-content: baseline;
  }
  .cards-images > .v-card{
    margin:5px;
  }
  .cards-images .text-in-image{
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: white;
    color: black;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 5px;
  }

  .card-dialog-loaded-content{
    text-align:Center;
    padding:15px 5px 5px;
  }
</style>