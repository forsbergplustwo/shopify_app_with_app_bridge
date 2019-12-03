import ApplicationController from '../application_controller'
import { TitleBar, Button, Redirect } from '@shopify/app-bridge/actions'

export default class extends ApplicationController {
  initialize () {
    super.initialize()
  }

  connect () {
    super.connect()
    // this.appBridge is initialized here
    const app = this.appBridge

    const flashButton = Button.create(app, { label: 'Show flash' })
    const titleBarOptions = {
      title: 'Home Index',
      buttons: {
        primary: flashButton
      }
    }
    flashButton.subscribe(Button.Action.CLICK, data => {
      this.flashNotice('Flash button clicked')
    })
    const myTitleBar = TitleBar.create(app, titleBarOptions)
  }

  disconnect () {
    super.disconnect()
  }
}
