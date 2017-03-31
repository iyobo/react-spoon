# React-Spoon

A sane Routing library for React
Github: https://github.com/iyobo/react-spoon


## How to use

In main file:
```

import {ReactSpoon} from './util/react-spoon';
new ReactSpoon([
    {
        name: '',
        path: '*',
        handler: function(){ return <div>App Layout</div>},
        children: [
            { path: '', redirectTo: 'dashboard' },
            { path: 'dashboard', name: 'dashboard', handler: DashboardPage },
            { path: 'about', name: 'about', handler: () => <h1>About</h1> },
            {
                path: 'parent/:modelName*', name: 'models', handler: ModelLayout, children: [
                { path: 'models/:modelName', name: 'models.list', handler: ModelListPage },
                { path: 'models/:modelName/create', name: 'models.create', handler: ModelEditPage },
                { path: 'models/:modelName/:id', name: 'models.edit', handler: ModelEditPage }
            ]
            }
        ]
    }

], { domId: 'app', provider: Provider, providerProps: { store } });
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


## Development

* Build `npm run build`;
