<script setup>
import VarButton from '..'
import { AppType } from 'luckly-cli/lib/client/index.js'
</script>

<template>
  <app-type>基本使用</app-type>
  <var-button>起步</var-button>

  <app-type>修改颜色</app-type>
  <var-button color="#03A9F4">起步</var-button>
</template>
