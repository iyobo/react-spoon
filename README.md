# React-Spoon

A sane front-end Routing library for React
Github: https://github.com/iyobo/react-spoon



## Features
* Making the router is as easy as instantiating a class.
* Simple JSON-based configuration.
* Nested routing
* Component-level Navigation Hooks (static + reliable triggering)
* Navigation Links (w/ Hierarchial active state)
* StateSync


## Caveat Emptor
* Only hash-based routing is supported at this time.


## How to use

```
npm install --save react-spoon
```


in html
```
<div id='app'></div>
```

In main file:
```

import React from 'react';
import {ReactSpoon} from 'react-spoon';

const someProvider = {...} //Redux, MobX or any provider
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

], { domId: 'app', provider: someProvider, providerProps: { store } });
```

You are also able to have multiple ReactSpoon instances on a page with multiple anchor points/domIds.

### The ReactSpoon Class
Its signature: new ReactSpoon(routeTree, opts)

* routeTree: a JSON object to define hierarchial routes. See above.
* opts: a JSON object with config options
* opts.domId: The DOM id of the object to mount your routed app on.
* opts.provider: The component class declaration or equivalent of a provider to wrap your app with (In the future, this will alternatively be an array for nesting multiple provdiders)
* opts.providerProps: A prop map of attributes/properties to attach to the equivalent provider. (In the future, this will alternatively be an array of prop maps)


## True Nested Routing
A layout rendering nested pages is really just rendering children.
```
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

```
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

## On-Enter Hook

Spoon will look for a static OnEnter(...) function declaration in your React Component and call it whenever it is navigating to that component.
In the future, this function might be made to handle (returned) promises.

```
class DashboardPage extends React.Component{

...

  static onEnter(props){
    console.log('Entering Dashboard Page');
  }
...

}
```

If you'd like an onLeave(...) hook, create an issue on github. I am actively using RSpoon for open-source dev so chances are I'll add that before you create it. Race ya :P

## Why another React Router

So while building JollofJS, I found that the routing libraries in the React ecosystem **just didn't seem to get** what routing libraries do IMO.
They either had too much ceremony around actually using them, or they kept stripping themselves of useful features with every major release (fascinating right?).
I also remember the devs of one claiming that "Named routes are an anti-pattern". :P

Anyway! It became clear that if I was ever going to continue onwards without having to keep revisiting this routing issues, I'd just have to grab the bull by the horns and create one that worked "for me".
I'm sharing it in hopes that it works for someone out there too. :)

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

Besides wanting an elegant, full-featured **frontend** routing library...needing one with Reliable, Object-Oriented route-event handling was one of the key reasons why I created React-Spoon




## Development

* Make sure babel is installed globally

* Build with `npm run build`;
