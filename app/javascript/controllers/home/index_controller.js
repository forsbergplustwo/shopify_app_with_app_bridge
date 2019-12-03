import ApplicationController from '../application_controller'
import { Button, Modal } from '@shopify/app-bridge/actions'

export default class extends ApplicationController {
  initialize () {
    super.initialize()
    const app = this.appBridge

    const flashButton = Button.create(app, { label: 'Flash (notice)' })
    flashButton.subscribe(Button.Action.CLICK, data => {
      this.flashNotice('Flash button clicked')
    })

    const modalButton = Button.create(app, { label: 'Open Modal' })
    modalButton.subscribe(Button.Action.CLICK, data => {
      this.openModal()
    })

    const titleBarOptions = {
      title: 'Home',
      buttons: {
        primary: flashButton,
        secondary: [modalButton]
      }
    }

    this.appTitleBar = this.createAppTitleBar(app, titleBarOptions)
  }

  openModal () {
    const modalOptions = {
      title: 'My Modal',
      message: 'Hello world!'
    }
    this.openedModal = Modal.create(this.appBridge, modalOptions)
    this.openedModal.dispatch(Modal.Action.OPEN)
  }

  connect () {
    super.connect()
    // this.appBridge is initialized here
  }

  disconnect () {
    super.disconnect()
  }
}
