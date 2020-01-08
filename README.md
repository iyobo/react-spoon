# React-Spoon

A sane front-end Routing library for React
Github: https://github.com/iyobo/react-spoon



## Features
* Making the router is as easy as instantiating a class.
* Simple JSON-based configuration.
* Nested routing
* Component-level Navigation Hooks (static + reliable triggering)
* Navigation Links (w/ Hierarchial active state)
* Store and retrieve state from URL as Key:Object or key:Value pairs


## Caveat Emptor
* Only hash-based routing is supported at this time.


## How to use

```typescript
npm install --save react-spoon
```


in html
```typescript
<div id='app'></div>
```

In main file:
```typescript

import React from 'react';
import {ReactSpoon} from 'react-spoon';

const SomeProvider = {...} //Redux, MobX or any provider
const store = {...} //any props the provider needs

new ReactSpoon([
    {
        name: '',
        path: '*',
        handler: AppLayout,
        children: [
            { path: '', redirectTo: 'dashboard' },
            { path: 'dashboard', name: 'dashboard', handler: DashboardPage },
            { path: 'about', name: 'about', handler: () => <h1>About</h1> },
            {
             path: 'models/:modelName*', name: 'models', handler: ModelLayout, children: [
                { path: 'models/:modelName', name: 'models.list', handler: ModelListPage },
                { path: 'models/:modelName/create', name: 'models.create', handler: ModelEditPage },
                { path: 'models/:modelName/:id', name: 'models.edit', handler: ModelEditPage }
              ]
            }
        ]
    }

], { domId: 'app', providers: [ {component: SomeProvider, props: { store }}, {component: AnotherProvider} ] );
```

You are also able to have multiple ReactSpoon instances on a page with multiple anchor points/domIds.

### The ReactSpoon Class
Its signature: new ReactSpoon(routeTree, opts)

* routeTree: a JSON object to define hierarchial routes. See above.
* opts: a JSON object with config options
* opts.domId: The DOM id of the object to mount your routed app on.
* opts.providers: An array of components and their props which you intend to wrap around your routed components.
* opts.providers.*.component: The provider component to instantiate
* opts.providers.*.props: The props to attach to this provider component when instantiating it.
The order of defining providers is important. In the above example, this is the JSX equivalent

<SomeProvider {...store}>
    <AnotherProvider>
        // ... your routed components
    </AnotherProvider>
</SomeProvider>

These have been replaced by opts.providers and are now **decommisioned**. Please upgrade by using the new opts.providers syntax:
~~* opts.provider: The component class declaration or equivalent of a provider to wrap your app with (In the future, this will alternatively be an array for nesting multiple provdiders)~~
~~* opts.providerProps: A prop map of attributes/properties to attach to the equivalent provider. (In the future, this will alternatively be an array of prop maps)~~


## True Nested Routing
A layout rendering nested pages is really just rendering children.
```typescript
import {Component} from 'react';

class AppLayout extends Component {
    
    render(){
        ...
        <div>
           {this.props.children}
        </div>
        ...
    }
}
```


## Nav Links (Named Routes)

```typescript
import {Link} from 'react-spoon';

...



//This will have class="active" when we are on the route named "dashboard".
//
    <Link toName="dashboard">
        <p>Dashboard</p>
    </Link>


//Passing params to named Routes

    <Link toName="models.list" params={{modelName: 'User'}} >
        <p>List All Users</p>
    </Link>

    <Link toName="models.edit" params={{modelName: 'Role', id: 'abc123'}} >
        <p>Edit Role</p>
    </Link>


```

## Programmatic navigation

Every instance of React-Spoon makes use of the react context API for making itself visible in any component. 
You grab a reference to this instance by statically defining contextTypes in your component:

```typescript
class MyComponent extends React.Component{

    ... 
    
    static contextTypes = {
        router: PropTypes.any
    }
    
    ...
    
    someFunction = () => {
    
        //navigates to destination
        this.context.router.go('app.myRouteName', {routeParams} )
        
        //or if you just want the url without actually navigating to it
        const path = this.context.router.buildLink('app.myRouteName', {routeParams} )
    }

```



It is highly recommended to navigate this way as opposed to just trying to change window.location.href... (even though that should still work).

Also, only **named routes** can be programmatically navigated to at this time. (It's a better pattern/structure to navigate with named routes anyway!)


## On-Enter Hook

Spoon will look for a static OnEnter(props) function declaration in your React Component and call it whenever it is navigating to that component.
This respects nested routing too, with the topmost component's onEnter triggered first and the next in sequence. (First to Last)
In the future, this function might be made to handle (returned) promises.

```typescript
class DashboardPage extends React.Component{

...

  static onEnter(props){
    console.log('Entering Dashboard Page');
  }
...

}
```

~~If you'd like an onLeave(...) hook, create an issue on github. I am actively using RSpoon for open-source dev so chances are I'll add that before you create it. Race ya :P~~

## On-Leave hook (Added since v1.4)

Beat you to it! :D

You can now create a static onLeave(props) function that RSpoon will call whenever it is navigating away from a route's component.
This, like onEnter, respects nested routing. Only difference is that it reverses the order of activation, i.e. Last to First.

```typescript
class DashboardPage extends React.Component{

...

  static onLeave(props){
    console.log('Leaving Dashboard Page');
  }
...

}
```

## URL State (Added since v1.3)

Use these to store and retrieve values or objects from the URL.
It should not be used for persistence, but more so as a way for your users to be able to return to a very particular/predictable state of your app by using the exact same URL.
e.g See what Google Maps does to it's URL while you navigate. Then try copy that URL in some other tab (or send it to a friend ) and see how it takes you back to that exact map center/zoom state.

### Storing State

```typescript
import {storeState} from 'react-spoon';


var myState = {
  paging: {
          page: 1,
          limit: 10
      },
      sort: { dateCreated: -1 },
      filters: []
  }
}

storeState('modelFilter', myState);

```

Simple!
You'll notice your URL changes after you call this function:
e.g #/models/Foo**@{"modelFilter":{"paging":{"page":1,"limit":10},"sort":{"dateCreated":-1},"filters":[]}}**


The First '@' is the delimeter that seperates your path from your data.
The data is stored as a JSON string.

You'll want to do this, for example, when the state you are trying to persist in your url changes

### Retrieving State
Retrieving state is just as easy
```typescript
import {getState} from 'react-spoon';

...

myState = getState('modelFilter');

```
And now myState is chuck full of all that state that is currently in your URL.

Clearly, You probably want to do this when loading/mounting/onEntering something that needs this state.


## Q&A

### Is that JSON? Ewwww Why?

JSON is more flexible to configure than ~~XML~~ JSX :D.
For one, It's simply the best vehicle for conditional or even distributed route configuration.
You can have different modules/functions/whatever define what they want for a route and it can all then be converged into one JS object that RSpoon consumes.


### Why another React Router?

So while building [JollofJS](http://github.com/iyobo/jollofjs), I found that the routing libraries in the React ecosystem **just didn't seem to get** what routing libraries do IMO.
They either had too much ceremony around actually using them, or they kept stripping themselves of useful features with every major release (fascinating right?).
I also remember the devs of one claiming that "Named routes are an anti-pattern". :P

Anyway! It became clear that if I was ever going to continue onwards without having to keep revisiting this routing issues, I'd just have to grab the bull by the horns and create one that worked "for me".
I'm sharing it in hopes that it works for someone out there too.

### Okay but what's with 'Spoon'?

I created React-Spoon while creating [JollofJS](http://github.com/iyobo/jollofjs) (Think Django for NodeJS - Still in Development). 
I created its built-in admin tool with React.
JollofJS is named after Jollof Rice, a delicious Nigerian rice dish.
You'd usually use a spoon when serving rice... which made React-Spoon an appropriate router name.

...Yes, I'm a Foodie :P


### Why use a hook? React has life-cycle functions!

Because React's life-cycle functions can be unpredictable, especially when doing nested routing.
Say you wanted to print the name of each page the router was rendering in the EXACT NESTED ORDER each time you route there i.e AppLayout > ModelLayout > ModelListPage ,

You may find that they don't show up in this order or sometimes don't show up at all. Sometimes, one route will show up multiple times while others never do.

Defining/using the onEnter hook just gives you one solid way to reliably control your react app's page-nesting sequencing with improved precision.
And it is WAY more cleaner and elegant to define this static hook at the class/component level, and not in your main file or wherever you are defining the route tree.

Besides wanting an elegant, full-featured **frontend** routing library...needing one with Reliable, Object-Level route-event handling was one of the key reasons why I created React-Spoon




## Development
* `npm i`

* Make sure babel is installed globally

* Build with `npm run build`;
