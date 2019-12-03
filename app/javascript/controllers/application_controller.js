// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from 'stimulus'
import createApp from '@shopify/app-bridge'
import { Toast } from '@shopify/app-bridge/actions'

export default class extends Controller {
  initialize () {
    this.flashDuration = 5000
  }

  connect () {
    const data = document.getElementById('shopify-app-init').dataset
    const createdApp = createApp({
      apiKey: data.apiKey,
      shopOrigin: data.shopOrigin,
      forceRedirect: true
    })
    this.appBridge = createdApp
  }

  flashNotice (message) {
    const options = {
      isError: false,
      duration: this.flashDuration,
      message: message
    }
    const toastNotice = Toast.create(this.appBridge, options)
    toastNotice.dispatch(Toast.Action.SHOW)
  }

  flashError (message) {
    const options = {
      isError: true,
      duration: this.flashDuration,
      message: message
    }
    const toastNotice = Toast.create(this.appBridge, options)
    toastNotice.dispatch(Toast.Action.SHOW)
  }
}
