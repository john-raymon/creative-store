<template>
  <div class="app">
    <div class="main">
      <div class="w-full md:w-1/2">
        <div class="relative flex justify-center items-center">
          <img src="./shirt.png" width="100%" />
          <SvgProductLabel class="absolute m-auto w-2/3"/>
        </div>
      </div>
      <div class="flex-grow bg-gray-900 rounded min-h-full">
        <!-- yarn add commerce-component right here baby! -->
        <form>
          <button>
            Buy now
          </button>
        </form>
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
  html, body {
    @apply bg-black;
  }
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
