<script setup>
import VarButton from '..'
import { watchLang } from 'luckly-cli/lib/client/index.js'
import { pack, use } from './locale'

watchLang(use, 'pc')
</script>

<template>
  <var-button>{{ pack.start }}</var-button>
</template>
