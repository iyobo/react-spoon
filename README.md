# React-Spoon

A sane front-end Routing library for React
Github: https://github.com/iyobo/react-spoon


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
        handler: AppLayout},
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

## Nested page rendering
A layout rendering nested pages is really just rendering children.
```
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
//This will have class="active" when we are on the dashboard page
<Link toName="dashboard">
    <i className="pe-7s-graph"></i>
    <p>Dashboard</p>
</Link>


//Passing params to namedRoutes

    <Link toName="models.list" params={{modelName: 'User'}} >
        <p>List All Users</p>
    </Link>

    <Link toName="models.edit" params={{modelName: 'Role', id: 'abc123'}} >
        <p>Edit Role</p>
    </Link>

```

## On-Enter Hook

Spoon will look for a static OnEnter(...) function declaration in your React Component and call it whenever it is navigating to that component.

```
class DashboardPage extends React.Component{

...

  static onEnter(props){
    console.log('Entering Dashboard Page');
  }
...

}
```

### Why use a hook? React has life-cycle functions!

Because React's life-cycle functions can be unpredictable, especially when doing nested routing.
Say you wanted to print the name of each page the router was rendering in the EXACT order EACH TIME you route there i.e AppLayout > ModelLayout > ModelListPage ,

You may find that they don't show up in this order or sometimes don't show up at all. Sometimes, one route will show up multiple times while others never do.

Defining/using the onEnter hook just gives you one more way to control your react app's paging with improved precision. 
And it is WAY more cleaner and elegant to define this static hook at the class/component level, and not in your main file where you are defining the route tree.

Besides wanting an elegant, full-featured **frontend** routing library...needing one with Reliable, Component-oriented route-event handling was one of the key reasons why I created React-Spoon


## Why 'Spoon'?

I created React-Spoon while creating [JollofJS](http://github.com/iyobo/jollofjs) (Think Django for NodeJS). I created its built-in admin tool with React.
JollofJS is named after Jollof Rice, a delicious Nigerian rice dish.
You'd usually use a spoon when serving anything rice... which made React-Spoon an appropriate router name.


Yes, I'm a Foodie :P


## Development

* Build with `npm run build`;
