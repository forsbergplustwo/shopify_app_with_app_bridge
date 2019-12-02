TLDR; I'm searching for ways I can continue to create apps in the way I love, and easily includ small amounts of MODERN javascript for interactions.

As a solo-developer running 4 apps (and more that I'd like to build) keeping things easy to maintain is something I need to spend more and more time on. For the past few weeks I've been researching different ways to build reusable "components" for my apps with Rails Engines. Part of the refactoring would also be to get a handle on the javascript in my applications.. the old rails way of stuffing everything into the `assets/javascript` folder, or into `content_for` tags in the HTML itself just wasn't maintaining well and is hard to follow by looking at the HTML itself.

Another reason for this is that I've been building my Shopify apps using Rails and the Shopify EASDK javascript library since it came out, but last year Shopify launched their new App Bridge library. The Shopify App Bridge making it possible to create cross-platform embedded apps much more easily.. but the problem is.. I have no experience with Typescript or even the modular javascript of ES6 that the "proper" version of the App Bridge uses. t's not really "a thing" in the Rails world.

Working with the vanilla javascript version of the App Bridge library proved frustrating and resulted in lots more code to do the same thing, so I've been stuck with the old EASDK. Even the official `shopify_app` gem still uses the EASDK, so I've had no good examples to go from for Rails apps.

Below is a step-by-step guide on how I've ended up integrating the Shopify App Bridge into a Rails 6 app, with help from webpacker and Stimulus.js. This gives me the best of both worlds, where I can continue to create Rails apps the way I love, but using the latest modular javascript libraries.

If you aren't familiar with Stimulus.js, here's a quick intro:

"Stimulus is a JavaScript framework with modest ambitions. It doesn’t seek to take over your entire front-end —in fact, it’s not concerned with rendering HTML at all. Instead, it’s designed to augment your HTML with just enough behavior to make it shine.

Stimulus works by continuously monitoring the page, waiting for the magic `data-controller` attribute to appear. Like the class attribute, you can put more than one value inside it. But instead of applying or removing CSS class names, `data-controller` values connect and disconnect Stimulus controllers.

Think of it like this: in the same way that class is a bridge connecting HTML to CSS, `data-controller` is a bridge from HTML to JavaScript.

On top of this foundation, Stimulus adds the magic `data-action` attribute, which describes how events on the page should trigger controller methods, and the magic `data-target` attribute, which gives you a handle for finding elements in the controller’s scope."

It's built by the team at Basecamp, so active and maintained. I like it's simplicity and that it'll help me create more maintainable javascript code, which is also easily reused. I'd highly recommend reading at least the Introduction of the  [Stimulus.js Handbook](https://stimulusjs.org/handbook/introduction) before continuing on witht this guide.

The guide won't cover actions or targets using Stimulus, there's lots of tutorials etc on that. This guide focuses on how we can use Stimulus to make integrating and using the Shopify App Bridge easier.

# Why do I like this approach (so far)

1. It lets me use the power of modern modular javascript, without needing to fundamentally change the way I build rails apps. I'm still rendering HTML on the server, and adding interaction with small amounts of javascript.

2. I can have page specific javascript and app bridge setups, without needing to load different javascript files for every page, or embed it into `content_for` tags in the HTML files themselves. We are still loading just a single `application.js` file for our javascript.

3. Stimulus automatically connects and disconnects the correct javascript for each page when it turns up in the DOM. It also works with Turbolinks, which is a bonus.

4. I can organize javascript files in a way that fits with the rest of the Rails conventions.

5. It will be easier to see what javascript is bound to the html elements on the page, and keeps javascript away from classes and ids.. which has made refactoring my apps harder in the past (I've learnt a lot over the years)

Ok, so let's get into it..

WARNING: This is a "first attempt" by a noob to the world of javascript, and this was done to simply test out the overall concept and resulting folder structures to see if it fits with "The Rails Way" in my head. YMMV!

# Setup a new Rails 6.0.1 app:

````
rvm use 2.6.5
gem install rails -v 6.0.1
rails _6.0.1_ new shopify_app_with_app_bridge --database=postgresql
cd shopify_app_with_app_bridge
rails db:create
rails db:migrate
rails s
````
Check it boots and you see the "You're riding rails" start page

# Setup the shopify_app gem
https://github.com/Shopify/shopify_app

`Add gem 'shopify_app'` to gemfile then run

```
bundle install
rails generate shopify_app
```

Create a `.env` file and add Shopify app credentials:

```
SHOPIFY_API_KEY=your api key
SHOPIFY_API_SECRET=your api secret
```
Then run:
```
rails generate shopify_app:install
rails generate shopify_app:shop_model
rails db:migrate
````
We'll just use the default setup in `config/intitializers/shopify_app.rb` for a new Shopify App for now, it's not relevant or interesting in the context of this guide.

Remember to add your shopify/auth/callback url to the whitelisted redirection url in partner admin, under App Setup.

Finally run `rails s` and check you can login to the app. So far so good, you have a fresh Rails app, with the Shopify App gem setup and working.

Now, we need to remove some code and files that the shopify_app installer created, as it's still using the EASDK libary instead of the App Bridge that we want.

In `app/javascripts/packs/application.js` remove the `require("shopify_app")` line


Remove the `layouts/_flash_messages.html.erb` file.

Remove the following code from `layouts/embedded_app.html.erb:`

```
    <%= render 'layouts/flash_messages' %>

    <script src="https://cdn.shopify.com/s/assets/external/app.js?<%= Time.now.strftime('%Y%m%d%H') %>"></script>
```

Remove just the text `https://` from the below code in the same file:

```
  <%= content_tag(:div, nil, id: 'shopify-app-init', data: {
      api_key: ShopifyApp.configuration.api_key,
      shop_origin: ("https://#{ @shop_session.url }" if @shop_session),
      debug: Rails.env.development?
    } ) %>
```
We want to keep the actual content_tag wth data attributes in the code, so we can pull the store url and api key, from inside the stimulus controller later.

Also delete this from the top "home/index.html.erb" view. We're going to add all javascript in stimulus controller files from now on instead:

```
<% content_for :javascript do %>
  <script type="text/javascript">
    ShopifyApp.ready(function(){
      ShopifyApp.Bar.initialize({ title: "Home" });
    });
  </script>
<% end %>
```

Delete the entire `javascripts/shopify_app` folder too.. not needed.

We now have a clean Shopify App app install, with the boilerplate EASDK code and files removed. We've really just created a standard shopify app project and deleted some stuff.


# Install the App Bridge

In the terminal, run the following at the app root to install the app bridge package into your project:

`yarn add @shopify/app-bridge`

# Install Stimulus.js

Stimulus comes with a handy helper for installation through webpacker.. so all you need to do is:

`rails webpacker:install:stimulus`

In addition to adding the package to your project, it also creates 2 files under `app/javascripts/conntrollers`.. and an entry in `packs/application.js`.. go take a look.

One of the files created sets up and automatically loads any controllers you create later in the app/javascrpts/conrollers` folder, and the other is an example hello controller.

Now for the fun part, rename `hello_controller.js` to `application_controller.js` and replace it's content with:

```
import { Controller } from 'stimulus'
import createApp from '@shopify/app-bridge'

export default class extends Controller {
  connect () {
    const data = document.getElementById('shopify-app-init').dataset

    this.appBridge = createApp({
      apiKey: data.apiKey,
      shopOrigin: data.shopOrigin,
      forceRedirect: true
    })
  }
}
```

The connect() function gets called automatically by Stimulus whenever the magic data-controller of the same name appears in the DOM, when the DOM is interactive (like document.ready or turbolinks:load). If it's later removed from the DOM, then the disconnect() function is automatically called.

In this file, we are also now importing the createApp module from the Shopify App Bridge, reading the shop url and api key from the dom and creating the appBridge.

To make it actually work, we'll need to hookup this controller to the page. We do that by simply updating the `home/index.html.erb` and adding an wrapper div with the data-controller attribute:

```
<div data-controller="application">
 content here
</div>
```

Now reload the browser (full page reload recommended after deleting so much stuff) and check you don't have any console errors. Great, now whenever a page has that outer div, it will automatically connect the Shopify app bridge for us.

To continue, we'll create a new folder called `pages` under `app/javascripts/controllers/` where we'll keep all the *page specifc app bridge controllers*. This will make it easier to update and add more files later, which are seperate from the more usual 'action' based Stimulus controllers.

In that folder, create a file named `home_index_controller.js` and add the following code:

```
import ApplicationController from '../application_controller'

export default class extends ApplicationController {
  initialize () {
    super.initialize()
  }

  connect () {
    super.connect()
    // this.appBridge is available from here down
    console.log(this.appBridge)
  }

  disconnect () {
    super.disconnect()
  }
}
```

This controller inherits from the application_controller.js file we just created, instead of the normal base Controller of Stimulus. This file format will be the base template we use for all pages going forward. Doing it this way means we don't have to repeat the initial creation of the AppBridge as we can inherit those functions.

Any other functions you want to run on all pages, can be added to the ApplicationController.. while page specifc functions use the page specific controllers instead.

The key concept here is to use super.connect() to make sure the ApplicationController function has run before we try to use the appBridge.. otherwise it won't be setup yet.

Update the HTML in `views/home/index.html.erb` to use this page specific controller instead, by changing `data-controller="application"` to `data-controller="pages--home-index"` .. so it now looks like:

```
<div data-controller="pages--home-index">
 content here
</div>
```

There is a convention when naming the controllers in Stimulus, and as the controller lives in the `pages/`folder, the data controller attribute must start with `pages--` and then the controller name.

Now we can start using the app bridge as per Shopify docs. Firstly lets test things out by firing a flash message (or Toast as they call it) on page load, just to see evertything is alive. The code is copied right from the Shopify App Bridge docs, minus the initial createApp. Update the `home_index_controller.js` file to be:

```
import ApplicationController from '../application_controller'
import { Toast } from '@shopify/app-bridge/actions'

export default class extends ApplicationController {
  initialize () {
    super.initialize()
  }

  connect () {
    super.connect()
    // this.appBridge is initialized here
    const app = this.appBridge

    const toastOptions = {
      message: 'Product saved',
      duration: 5000
    }

    const toastNotice = Toast.create(app, toastOptions)
    toastNotice.subscribe(Toast.Action.SHOW, data => {
      // Do something with the show action
    })

    toastNotice.subscribe(Toast.Action.CLEAR, data => {
      // Do something with the clear action
    })

    // Dispatch the show Toast action, using the toastOptions above
    toastNotice.dispatch(Toast.Action.SHOW)
  }

  disconnect () {
    super.disconnect()
  }
}
```
So we are now importing the action we need (Toast), and on connect() we setup the App Brige, create the toastNotice and fire it. Reload and you'll see "Product saved" in the browser.. yaay, it works!

Now lets get a bit more creative by adding a flash helper function to our ApplicationController instead, so we don't need to repeat that code on every page specific controller. In `controllers/application_controller.js` update it to be:

```
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
```

We've imported the Toast action from the AppBridge and setup 2 functions on the controller for handling the notice and error versions of the flash messages. We can pass in the options (like message and duration) to the flash when calling the function.

Now we can cleanup the page specific contoller to use these new functions instead. Update `controllers/pages/home_index_controller.js` again:

```

import ApplicationController from '../application_controller'

export default class extends ApplicationController {
  initialize () {
    super.initialize()
  }

  connect () {
    super.connect()
    // this.appBridge and ApplicationController functions are available now
    const toastOptions = {
      message: 'Product saved',
      duration: 5000
    }
    this.flashNotice(toastOptions)
  }

  disconnect () {
    super.disconnect()
  }
}
````
Reload the page and you'll still get the flash message still showing up.

Ok that works, let's setup the titlebar with breadcrumbs instead, just taking the examples from the App Bridge documentation:

```
import ApplicationController from '../application_controller'
import { TitleBar, Button, Redirect } from '@shopify/app-bridge/actions'

export default class extends ApplicationController {
  initialize () {
    super.initialize()
  }

  connect () {
    super.connect()
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
```

Awesome, it works :) There's a lot that could be added to this, and cleanup up (duration of flashMessages could be set in initialize() for example), but the concept works, and I feel like I could come back to this a few months later and know exactly what is happeing on every page.

If you add a new page to your rails app, like "products/show or similar you simply create a new stimulus controller under `app/javascripts/controllers/pages/products_show_controller.js`:

```
import ApplicationController from '../application_controller'

export default class extends ApplicationController {
  initialize () {
    super.initialize()
  }

  connect () {
    super.connect()
    // this.appBridge is available from here down
    console.log(this.appBridge)
  }

  disconnect () {
    super.disconnect()
  }
}
```

and then in the HTML for the page, wrap everything in:

```
<div data-controller="pages--products-show">
  content
</div>
```

There's lots more to learn and test out, but so far I'm pretty happy with how it's turned out. Feedback and comments are more than welcome, would love to discuss what I'm doing wrong or right here :)
