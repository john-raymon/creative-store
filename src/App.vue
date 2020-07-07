<template>
  <div class="app">
    <div class="main">
      <div class="flex w-full md:w-1/2">
        <div class="relative flex justify-center items-center">
          <img src="./shirt.png" width="100%" />
          <SvgProductLabel class="absolute m-auto w-2/3"/>
        </div>
      </div>
      <div class="w-full md:w-1/2 flex items-center rounded min-h-full py-4">
        <chec-payment-form
          v-show="checCheckout"
          class="checForm"
          identifierId="vippy"
          identifierType="permalink"
          :checkout.sync="checCheckout"
          :context.sync="formData"
          v-slot="{ countries, subdivisions, shippingOptions, shippingOptionsById, captureOrder }"
        >
          <input type="email" placeholder="Email" v-model="formData.customer.email">
          
          <input name="shipping-name" placeholder="Shipping name" v-model="formData.shipping.name" type="text">
          <input name="street-address" placeholder="Shipping street" v-model="formData.shipping.street" type="text">
          <input name="street2" placeholder="Shipping street 2" v-model="formData.shipping.street2" type="text">
          <input name="city" placeholder="Shipping City" v-model="formData.shipping.townCity" type="text">
          <input name="postalCode" placeholder="Shipping Zip Code" v-model="formData.shipping.postalZipCode" type="text">

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

          <template v-if="checCheckout">
            <p class="text-xs text-gray-500 border-top">
              Please choose a unisex size below (small, medium, large).
              The size variant button will activate once all shipping information is provided above.
            </p>
            <select @change="onSizeChange" :disabled="!(formData.selectedShippingMethod && formData.shipping.country && formData.shipping.countyState)">
              <option value disabled selected>Select a size</option>
              <option
                v-for="option in checCheckout.line_items[0].variants[0].options"
                :value="`${option.id},${checCheckout.line_items[0].variants[0].id}`"
                :key="option.id"
              >{{option.name}}</option>
            </select>
          </template>

          <!-- Stripe.js handles populating card-element-->
          <div id="card-element"/>

          <div class="text-xs text-white flex justify-between">
            <p class="text-white">
              Shipping: {{ shippingOptionsById[formData.selectedShippingMethod] && shippingOptionsById[formData.selectedShippingMethod].price.formatted_with_code || 'Select a shipping option' }} 
            </p>

            <p class="text-white">
              Total: {{ checCheckout && `$${checCheckout.live.total.formatted_with_code}` }}
            </p>
          </div>
          <button 
            class="text-black tracking-widest bg-green-700 hover:opacity-75 focus:opacity-75 focus:outline-none w-full uppercase outline-none font-mich text-xs font-bold py-2 px-4 rounded" 
            @click="() => handleCaptureOrder(captureOrder)"
          >
            buy now
          </button>
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
      receipt: {},
    }
  },
  // handles setting Stripe.js #card-element when mounted on DOM
  mounted() {
    this.setUpStripeElementCard();
  },
  methods: {
    onSizeChange(e) {
      // eslint-disable-next-line no-unused-vars
      const [optionId, variantId] = e.target.value.split(',');
      // eslint-disable-next-line no-debugger
      debugger;
      this.$commerce.checkout.checkVariant(this.checCheckout.id, this.checCheckout.line_items[0].id, {
        variant_id: variantId,
        option_id: optionId,
      // eslint-disable-next-line no-unused-vars
      }).then(response => {
        // eslint-disable-next-line no-debugger
        debugger;
        this.checCheckout.live = response.live;
      }).catch(() => {
        // eslint-disable-next-line no-debugger
        debugger;
      });
    },
    /**
    * custom captureOrder method
    */
    handleCaptureOrder(captureOrderCallBack) {
     this.$stripe
        .createToken(this.$stripeCard)
        .then(result => {
          if (result.error) {
            throw result.error;
          } else {
            this.formData.card.token = result.token.id;
            // captureOrder returns a Promise & has access to ^ formData.card.token
            return captureOrderCallBack();
          }
        })
        .then(resp => {
            // can also handle successful resp by listening to, order:success, event on <chec-payment-form>
            // https://commercejs.com/docs/api/?javascript--cjs#capture-order
            console.log('💸💸 YAY ORDER SUCCESSFUL!', resp);
        })
        .catch((err) => {
          // eslint-disable-next-line no-debugger
          debugger;
          let errorToAlert = '';
          const { error = {} } = err.data || {};
          if (error.type === 'validation') { // catch validation errors and update corresponding data/state
            error.message.forEach(({param, error}) => {
              this.errors = {
                ...this.errors,
                [param]: error
              }
            })
            const allErrors = error.message.reduce((string, error) => {
              return `${string} ${error.error}`
            }, '') // accumalate a string of errors using reduce
            errorToAlert = allErrors;
          }
          if (error.type === 'gateway_error' || error.type === 'not_valid' || error.type === 'bad_request') { // either a gateway error or a shipping error and update corresponding data/state
            this.errors = {
              ...this.errors,
              [(error.type === 'not_valid' ? 'fulfillment[shipping_method]' : error.type)]: error.message
            }
            errorToAlert = error.message
          }
          if (!errorToAlert) {
            errorToAlert = (error && error.message) || err.message || 'We\'re sorry we couldn\t process your word right now';
          }
          alert(errorToAlert);
        });
    },
//     // add variant to checkout 
//     Commerce.checkout.checkVariant('chkt_L5z3kmQpdpkGlA', 'item_7RyWOwmK5nEa2V', {
//   variant_id: 'vrnt_Kvg9l6Apq51bB7',
//   option_id: 'optn_3BkyN5YDRo0b69',
// }).then(response => console.log(response));
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
    @apply flex items-center justify-center bg-black overflow-y-auto w-full font-mich;
    min-height: calc(100vh - 0rem);
    .main {
      @apply relative flex p-4 flex-col w-full m-auto max-w-xl;
      @screen md {
        @apply flex-row p-0;
      }
    }

    .checForm {
      input, select, div {
        @apply text-white bg-transparent flex-grow py-2 border-b mb-4 font-mich outline-none w-full;
      }
    }
  }
</style>
