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
  connect () {
    const data = document.getElementById('shopify-app-init').dataset
    const createdApp = createApp({
      apiKey: data.apiKey,
      shopOrigin: data.shopOrigin,
      forceRedirect: true
    })
    this.appBridge = createdApp
  }

  flashNotice (options) {
    options.isError = false
    const toastNotice = Toast.create(this.appBridge, options)
    toastNotice.dispatch(Toast.Action.SHOW)
  }

  flashError (options) {
    options.isError = true
    const toastNotice = Toast.create(this.appBridge, options)
    toastNotice.dispatch(Toast.Action.SHOW)
  }
}
