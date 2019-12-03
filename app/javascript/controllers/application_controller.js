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
import { Toast, History, Loading } from '@shopify/app-bridge/actions'

export default class extends Controller {
  initialize () {
    this.flashDuration = 5000
    // Create the App Bridge
    const data = document.getElementById('shopify-app-init').dataset
    const app = createApp({
      apiKey: data.apiKey,
      shopOrigin: data.shopOrigin,
      forceRedirect: true
    })
    this.appBridge = app

    // Create the App Bridge History Helper
    const history = History.create(app)
    this.appBridgeHistory = history

    // Create the App Bridge Loading Indicator
    const loading = Loading.create(app)
    this.appBridgeLoader = loading
  }

  connect () {
    this.updateHistory()
    setTimeout(() => {
      this.stopLoading()
    }, 300)
    console.log('Connected!')
  }

  disconnect () {
    this.startLoading()
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

  updateHistory () {
    this.appBridgeHistory.dispatch(History.Action.PUSH, window.location.pathname)
  }

  startLoading () {
    this.appBridgeLoader.dispatch(Loading.Action.START)
  }

  stopLoading () {
    this.appBridgeLoader.dispatch(Loading.Action.STOP)
  }
}
