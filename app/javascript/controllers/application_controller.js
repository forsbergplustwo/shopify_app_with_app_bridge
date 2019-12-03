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
import { Toast, History, Redirect, Loading, TitleBar } from '@shopify/app-bridge/actions'

const FLASH_DURATION = 5000

export default class extends Controller {
  initialize () {
    // Create the Application Bridge, History, Redirect and Loading
    this.appBridge = this.createAppBridge()
    this.appHistory = this.createAppHistory(this.appBridge)
    this.appRedirect = this.createAppRedirect(this.appBridge)
    this.appLoading = this.createAppLoading(this.appBridge)
  }

  connect () {
    this.updateHistory()
    this.bindStopLoadingEvent()
    this.bindStartLoadingEvent()
    console.log('Connected!')
  }

  disconnect () {
  }

  updateHistory () {
    this.appHistory.dispatch(History.Action.PUSH, window.location.pathname)
  }

  bindStartLoadingEvent () {
    this.startLoading = this.startLoading.bind(this)
    window.addEventListener('beforeunload', this.startLoading, { once: true })
  }

  bindStopLoadingEvent () {
    this.stopLoading = this.stopLoading.bind(this)
    window.addEventListener('DOMContentLoaded', this.stopLoading, { once: true })
  }

  startLoading () {
    this.appLoading.dispatch(Loading.Action.START)
    console.log('Started loading')
  }

  stopLoading () {
    this.appLoading.dispatch(Loading.Action.STOP)
    console.log('Stopped loading')
  }

  // Flash helpers
  flashNotice (message) {
    const options = {
      isError: false,
      duration: FLASH_DURATION,
      message: message
    }
    const toastNotice = Toast.create(this.appBridge, options)
    toastNotice.dispatch(Toast.Action.SHOW)
  }

  flashError (message) {
    const options = {
      isError: true,
      duration: FLASH_DURATION,
      message: message
    }
    const toastNotice = Toast.create(this.appBridge, options)
    toastNotice.dispatch(Toast.Action.SHOW)
  }

  // Application instance
  createAppBridge () {
    if (!this.application.appBridge) {
      const data = document.getElementById('shopify-app-init').dataset
      const app = createApp({
        apiKey: data.apiKey,
        shopOrigin: data.shopOrigin,
        forceRedirect: true
      })
      this.application.appBridge = app
    }
    return this.application.appBridge
  }

  // Application instance
  createAppHistory (app) {
    if (!this.application.appHistory) {
      const history = History.create(app)
      this.application.appHistory = history
    }
    return this.application.appHistory
  }

  // Application instance
  createAppLoading (app) {
    if (!this.application.appLoading) {
      const loading = Loading.create(app)
      this.application.appLoading = loading
    }
    return this.application.appLoading
  }

  // Application instance
  createAppRedirect (app) {
    if (!this.application.appRedirect) {
      const redirect = Redirect.create(app)
      this.application.appRedirect = redirect
    }
    return this.application.appRedirect
  }

  // Per-page instance (accepts options)
  createAppTitleBar (app, options) {
    if (!this.appTitleBar) {
      const titleBar = TitleBar.create(app, options)
      this.appTitleBar = titleBar
    }
    return this.appTitleBar
  }
}
