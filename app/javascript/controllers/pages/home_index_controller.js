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

    const breadcrumb = Button.create(app, { label: 'My breadcrumb' })
    breadcrumb.subscribe(Button.Action.CLICK, () => {
      app.dispatch(Redirect.toApp({ path: '/breadcrumb-link' }))
    })

    const titleBarOptions = {
      title: 'My page title',
      breadcrumbs: breadcrumb
    }

    const myTitleBar = TitleBar.create(app, titleBarOptions)
  }

  disconnect () {
    super.disconnect()
  }
}
