<template>
  <div class="d-flex align-center justify-center flex-column pa-2">
      <div><v-icon x-large>mdi-{{icon}}</v-icon></div>
      <p class="title">{{text}}</p>
  </div>
</template>

<script>
export default {
  props:{
    icon:{
      type:String,
      default: "image-off-outline"
    },
    text:{
      type:String,
      default: "Отсутствуют изображения"
    }
  }
}
</script>

<style>

</style>