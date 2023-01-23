<script setup>
import VarButton from '..'
import { watchLang } from 'luckly-cli/lib/client/index.js'
import { pack, use } from './locale'

watchLang(use, 'pc')
</script>

<template>
  <var-button color="#03A9F4">{{ pack.start }}</var-button>
</template>
