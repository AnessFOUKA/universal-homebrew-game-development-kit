<template>
  <router-view/>
</template>

<script setup>
  import {RouterLink, RouterView} from "vue-router";
  import router from "./router";
  let alreadyGone = false;
  if(!alreadyGone){
    router.push("/project");
    alreadyGone = true;
    }
</script>

<style>
  *{
    padding: 0;
    margin: 0;
  }
  html,body{
    overflow: hidden;
  }
  :root{
    --borderColor:rgb(108, 108, 108);
    --inputBackgroundColor:rgb(65, 65, 65);
  }
</style>