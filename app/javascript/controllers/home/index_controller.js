import ApplicationController from '../application_controller'
import { Button } from '@shopify/app-bridge/actions'

export default class extends ApplicationController {
  initialize () {
    super.initialize()
    const app = this.appBridge

    const flashButton = Button.create(app, { label: 'Flash (notice)' })
    const titleBarOptions = {
      title: 'Home',
      buttons: {
        primary: flashButton
      }
    }
    flashButton.subscribe(Button.Action.CLICK, data => {
      this.flashNotice('Flash button clicked')
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
