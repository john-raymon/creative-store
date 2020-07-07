<template>
  <div class="app">
    <div class="main">
      <div class="flex w-full md:w-1/2">
        <div class="relative flex justify-center items-center">
          <img src="./shirt.png" width="100%" />
          <SvgProductLabel class="absolute m-auto w-2/3"/>
        </div>
      </div>
      <div class="w-full md:w-1/2 flex items-center rounded min-h-full py-6 md:py-12">
        <chec-payment-form
          v-show="checCheckout"
          class="checForm"
          identifierId="vippy"
          identifierType="permalink"
          :checkout.sync="checCheckout"
          :context.sync="formData"
          v-slot="{ countries, subdivisions, shippingOptions, shippingOptionsById, captureOrder }"
        >

          <label for="email" class="text-xs track-widest text-gray-600">
            Email address for receipt:
          </label>
          <input id="email" type="email" placeholder="Email" v-model="formData.customer.email">
          
          <label for="shipping-name" class="text-xs track-widest text-gray-600">
            Shipping name:
          </label>
          <input id="shipping-name" name="shipping-name" placeholder="Shipping name" v-model="formData.shipping.name" type="text">
          
          <label for="street-address" class="text-xs track-widest text-gray-600">
            Street address:
          </label>
          <input id="street-address" name="street-address" placeholder="Shipping street" v-model="formData.shipping.street" type="text">
          <input name="street2" class="-mt-4" placeholder="Shipping street 2" v-model="formData.shipping.street2" type="text">

          <label for="city" class="text-xs track-widest text-gray-600">
            City:
          </label>
          <input id="city" name="city" placeholder="Shipping City" v-model="formData.shipping.townCity" type="text">
          
          <label for="postalCode" class="text-xs track-widest text-gray-600">
            Postal code:
          </label>
          <input id="postalCode" name="postalCode" placeholder="Shipping Zip Code" v-model="formData.shipping.postalZipCode" type="text">

          <!-- shipping country -->
          <label for="shippingState" class="text-xs track-widest text-gray-600">
            Shipping state/subdivision
          </label>
          <select id="shippingState" v-model="formData.shipping.countyState">
            <option value disabled selected>Select a shipping state/subdivision</option>
            <option
              v-for="(subdivision, subdivisionCode) in subdivisions"
              :value="subdivisionCode"
              :key="subdivisionCode"
            >{{ subdivision }}</option>
          </select>

          <!-- shipping country -->
          <label for="shippingCountry" class="text-xs track-widest text-gray-600">
            Shipping country
          </label>
          <select id="shippingCountry" v-model="formData.shipping.country">
            <option value disabled selected>Select a shipping country</option>
            <option
              v-for="(country, countryCode) in countries"
              :value="countryCode"
              :key="countryCode"
            >{{ country }}</option>
          </select>


          <!-- shipping country -->
          <label for="shippingMethod" class="text-xs track-widest text-gray-600">
            Shipping method:
          </label>
          <!-- shipping options -->
          <select id="shippingMethod" v-model="formData.selectedShippingMethod">
            <option value disabled selected>Select a shipping method</option>
            <option
              v-for="option in shippingOptions"
              :value="option.id"
              :key="option.id"
            >{{ `${option.description || ''} $${option.price.formatted_with_code}` }}</option>
          </select>

          <template v-if="checCheckout">
            <label for="sizeVariant" class="text-xs text-gray-500 track-widest">
              Please choose a unisex size below (small, medium, large).
              The size variant button will activate once all shipping information is provided above.
            </label>
            <select id="sizeVariant" @change="onSizeChange" :disabled="!(formData.selectedShippingMethod && formData.shipping.country && formData.shipping.countyState)">
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
              Subtotal: {{ checCheckout && `$${checCheckout.live.subtotal.formatted_with_code}` }}
            </p>
            <p class="text-sm text-white font-bold">
              +
            </p>
            <p class="text-white">
              Shipping: {{ shippingOptionsById[formData.selectedShippingMethod] && shippingOptionsById[formData.selectedShippingMethod].price.formatted_with_code || 'Select a shipping option' }} 
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
      const [optionId, variantId] = e.target.value.split(',');
      this.$commerce.checkout.checkVariant(this.checCheckout.id, this.checCheckout.line_items[0].id, {
        variant_id: variantId,
        option_id: optionId,
      }).then(response => {
        this.checCheckout.live = response.live;
      }).catch((e) => {
        console.log('error while adding variant', e);
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
            alert('Thanks for ordering! A receipt will be sent to your email!')
            location.reload();
            // can also handle successful resp by listening to, order:success, event on <chec-payment-form>
            // https://commercejs.com/docs/api/?javascript--cjs#capture-order
            console.log('💸💸 YAY ORDER SUCCESSFUL!', resp);
        })
        .catch((err) => {
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
      @apply relative flex p-4 flex-col w-full m-auto;
      max-width: 750px;
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
