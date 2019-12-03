import ApplicationController from '../application_controller'
import { Button, Redirect } from '@shopify/app-bridge/actions'

export default class extends ApplicationController {
  initialize () {
    super.initialize()
    const app = this.appBridge
    const flashButton = Button.create(app, { label: 'Go home' })
    const titleBarOptions = {
      title: 'Show',
      buttons: {
        secondary: [flashButton]
      }
    }
    flashButton.subscribe(Button.Action.CLICK, data => {
      this.appRedirect.dispatch(Redirect.Action.APP, '/')
    })
    this.appTitleBar = this.createAppTitleBar(app, titleBarOptions)
  }

  connect () {
    super.connect()
    // this.appBridge is initialized here
  }

  disconnect () {
    super.disconnect()
  }
}
