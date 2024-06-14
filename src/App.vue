<template>
  <div id="app">
    <MilkPriceCalculator />
  </div>
</template>

<script>
import MilkPriceCalculator from '@/components/MilkPriceCalculator.vue'
import '@/styles/comm.scss' // 引入独立的 SCSS 文件

export default {
  name: 'app',
  components: {
    MilkPriceCalculator
  }
}
</script>
