<template>
  <div>
     <div class="parent-zoomer-image">
      <v-zoomer class="zoomer-image-container">
        <img
          :src="shot"
        >
      </v-zoomer>
    </div>
    <div class="absolute-select elevation-5 ma-1 pa-1">
      <v-select v-model="selectShot" hide-details :items="bands" 
        label="Спектр" dense outlined></v-select>
    </div> 
  </div>
</template>

<script>
export default {
  props: ["shots"],
  data: () => ({
    selectShot: ""
  }),
  computed:{
    bands(){
      return Object.keys(this.shots)
    },
    shot(){
      return this.shots[this.selectShot]
    }
  },
  created(){
    this.selectShot = this.bands[0]
  }
}
</script>

<style>

</style>