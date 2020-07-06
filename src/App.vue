<template>
  <div class="app">
    <div class="main">
      <div class="flex-grow bg-red-300">
        <div class="w-1/3">
          
          <SvgProductLabel />
        </div>
      </div>
      <div class="flex-grow bg-blue-300">
        <div class="w-1/3">
          <SvgProductLabel />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SvgProductLabel from '@/assets/svgs/hoveringProductLabel.svg';

export default {
  name: 'App',
  components: {
    SvgProductLabel
  },
}
</script>

<style lang="scss">
  .app {
    @apply flex items-center justify-center bg-black overflow-y-auto w-full;
    min-height: calc(100vh - 0rem);
    .main {
      @apply relative flex p-4 flex-col w-full m-auto max-w-lg;
      @screen md {
        @apply flex-row p-0;
      }
    }
  }
</style>
