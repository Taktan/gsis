<template>
<div>
  <div class="cards-images" ref="divCardsImages" >
    <v-card v-for="(value,name) in shots" :key="name" :width="widthCard">
      <img :src="value" />
      <span class="text-in-image">{{name}}</span>
    </v-card>
  </div>
  <div class="absolute-select elevation-5 ma-1 pa-1" >
    <v-slider label="Размер" max="10" min="2" hide-details v-model="countInRow" thumb-label="always"/>
  </div>
</div>
</template>

<script>
export default {
  props: ["shots"],
  created() {
    window.addEventListener("resize", this.resizeCards);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeCards);
  },
  computed:{
    computedShots(){
      return this.shots
    }
  },
  data: ()=>{
    return{
      countInRow: 5,
      widthCard: 200
    }
  },
  mounted(){
    this.resizeCards()
  },
  methods:{
    resizeCards(){
      if(this.$refs.divCardsImages){
        this.widthCard = this.$refs.divCardsImages.clientWidth / (this.countInRow +   1)
      }
    }
  },
  watch:{
    countInRow(){
      this.resizeCards()
    }
  }
}
</script>

<style>

</style>