<script setup>
import VarButton from '..'
import { watchLang } from 'Luckly-cli/lib/client/index.js'
import { pack, use } from './locale'

watchLang(use, 'pc')
</script>

<template>
  <var-button>{{ pack.start }}</var-button>
</template>
