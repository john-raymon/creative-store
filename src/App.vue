<template>
  <div class="app">
    <div class="main">
      <div class="flex w-full md:w-1/2">
        <div class="relative flex justify-center items-center">
          <img src="./shirt.png" width="100%" />
          <SvgProductLabel class="absolute m-auto w-2/3"/>
        </div>
      </div>
      <div class="w-full md:w-1/2 bg-gray-900 rounded min-h-full">
        <chec-payment-form
          class="w-full"
          identifierId="vippy"
          identifierType="permalink"
          :checkout.sync="checCheckout"
          :context.sync="formData"
          v-slot="{ countries, subdivisions, shippingOptions, shippingOptionsById, captureOrder }"
        >
          <input type="email" placeholder="email" v-model="formData.customer.email">
          
          <input placeholder="Shipping name" v-model="formData.shipping.name" type="text">
          <input placeholder="Shipping street" v-model="formData.shipping.street" type="text">
          <input placeholder="Shipping street2" v-model="formData.shipping.street2" type="text">
          <input placeholder="Shipping City" v-model="formData.shipping.townCity" type="text">
          <input placeholder="Shipping Zip Code" v-model="formData.shipping.postalZipCode" type="text">

          <!-- shipping country -->
          <select v-model="formData.shipping.countyState">
            <option value disabled selected>Select a shipping state/subdivision</option>
            <option
              v-for="(subdivision, subdivisionCode) in subdivisions"
              :value="subdivisionCode"
              :key="subdivisionCode"
            >{{ subdivision }}</option>
          </select>

          <!-- shipping country -->
          <select v-model="formData.shipping.country">
            <option value disabled selected>Select a shipping method</option>
            <option
              v-for="(country, countryCode) in countries"
              :value="countryCode"
              :key="countryCode"
            >{{ country }}</option>
          </select>

          <!-- shipping options -->
          <select v-model="formData.selectedShippingMethod">
            <option value disabled selected>Select a shipping method</option>
            <option
              v-for="option in shippingOptions"
              :value="option.id"
              :key="option.id"
            >{{ `${option.description || ''} $${option.price.formatted_with_code}` }}</option>
          </select>

          <!-- Stripe.js handles populating card-element-->
          <div id="card-element"/>

          <button class="text-white" @click="() => handleCaptureOrder(captureOrder)">make a payment</button>
        </chec-payment-form>
      </div>
    </div>
  </div>
</template>

<script>
import { loadStripe } from "@stripe/stripe-js";
import SvgProductLabel from '@/assets/svgs/hoveringProductLabel.svg';

export default {
  name: 'App',
  components: {
    SvgProductLabel
  },
  data() {
    return {
      checCheckout: null,
      formData: {},
    }
  },
  // handles setting Stripe.js #card-element when mounted on DOM
  mounted() {
    this.setUpStripeElementCard();
  },
  methods: {
    // set up Stripe.js card element
    setUpStripeElementCard() {
      loadStripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY).then(stripe => {
        this.$stripe = stripe;
        // Create an instance of Elements
        const elements = stripe.elements();

        // Custom styling can be passed to options when creating an Element.
        // (Note that this demo uses a wider set of styles than the guide below.)
        const style = {
          base: {
            color: "#ffffff",
            lineHeight: "18px",
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
              color: "#aab7c4"
            }
          },
          invalid: {
            color: "#fa755a",
            iconColor: "#fa755a"
          }
        };

        // Create an instance of the card Element
        this.$stripeCard = elements.create("card", { style });

        // Add an instance of the card Element into the `card-element` <div>
        this.$stripeCard.mount("#card-element");
      });
    }
  }
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
