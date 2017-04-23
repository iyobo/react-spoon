/**
 * Created by iyobo on 2017-03-21.
 */
import {Component} from 'react';

var React = require('react');
var ReactDom = require('react-dom');
var UrlPattern = require('url-pattern');

const URL_STATE_DELIM = '@';

function getWindowHash() {
    let hash = window.location.hash.replace(/^#\/?|\/$/g, '');

    //Do not include state
    hash = hash.split(URL_STATE_DELIM)[0];

    //console.log('hash:', hash);
    return hash;
}

/**
 * If pattern match, return map of params.
 * @param routePath
 * @param location
 */
function matchRoute(routePath, location) {
    //console.log( 'checking', routePath, 'with location',location);

    //This matcher is dumb and doesn't accept empty strings
    if (routePath === '' && location === '') {
        return {}; //match as empty string
    }
    else if (routePath !== '') {

        const pattern = new UrlPattern(routePath);
        return pattern.match(location);
    }
    else {
        return null;
    }
}

function objectsAreEqual(a, b) {
    for (var prop in a) {
        if (a.hasOwnProperty(prop)) {
            if (b.hasOwnProperty(prop)) {
                if (typeof a[prop] === 'object') {
                    if (!objectsAreEqual(a[prop], b[prop])) return false;
                } else {
                    if (a[prop] !== b[prop]) return false;
                }
            } else {
                return false;
            }
        }
    }
    return true;
}

/**
 * Routing context
 */
class SpoonContextProvider extends Component {
    static childContextTypes = {
        router: React.PropTypes.object
    };

    getChildContext() {
        return { router: this.props.router };
    }

    render() {
        return <div id="spoonContextProvider"> {this.props.children}</div>;
    }
}


export class ReactSpoon {

    /**
     *
     * @param routes
     * @param opts
     * @param opts.domId
     * @param opts.providers
     */
    constructor(routes, opts = {}) {

        this.domId = opts.domId || 'app';
        this.routes = routes;
        this.namedRoutes = {};

        //Providers
        //this.providerEl = opts.provider;
        //this.providerProps = opts.providerProps;

        this.providers = opts.providers || [];


        this.currentRouteHierarchy = null;
        this.currentHierarchyProps = {};

        this.state = {
            router: {
                location: getWindowHash(),
                activeRoutes: {},
                go: (name = '', params = {}, opts = {}) => {
                    const route = this.namedRoutes[name];
                    if (route) {

                        let path = route.path;

                        const pattern = new UrlPattern(path);

                        window.location.hash = '/' + pattern.stringify(params);

                        this.state.router.currentParams = params;
                    } else {
                        throw new Error('Unknown route name: ' + name);
                    }
                },
                buildLink: (name, params) => {

                    const route = this.namedRoutes[name];
                    let link = '#/';
                    if (route) {
                        const pattern = new UrlPattern(route.path);
                        link = '#/' + pattern.stringify(params);
                    }

                    //console.log('creating link', name, params, link)

                    return link;
                },
                currentParams: {}
            }
        };


        //console.log('RouteState:', this.state);

        const setupRoutes = (routeTree) => {
            routeTree.forEach((it) => {

                /**
                 * Register names
                 */
                if (it.name)
                    this.namedRoutes[it.name] = it;

                /**
                 * Create context
                 */
                if (it.handler) {
                    (it.handler.wrappedComponent || it.handler ).contextTypes = {
                        router: React.PropTypes.any
                    };
                }

                if (it.children) {
                    setupRoutes(it.children)
                }


            });
        }

        setupRoutes(this.routes);


        this.onRouteChanged();

        // Handle browser navigation events
        window.addEventListener('hashchange', this.onRouteChanged, false);
    }

    goToName = (name = '', params = {}, opts = {}) => {
        const route = this.namedRoutes[name];
        if (route) {

            let path = route.path;

            const pattern = new UrlPattern(path);


            window.location.hash = '/' + pattern.stringify(params);

            this.state.router.currentParams = params;
        } else {
            throw new Error('Unknown route name: ' + name);
        }
    }


    /**
     *
     * @param changes
     * @param changes.location - pure hash of current window url
     */
    changeRoute(changes) {

        /***
         * First thing to do on route change is to call onLeave on all active routes' handler components, from last to first.
         */
        if (this.currentRouteHierarchy) {

            for (let i = this.currentRouteHierarchy.length - 1; i >= 0; i--) {
                const it = this.currentRouteHierarchy[i];

                if (( it.handler.wrappedComponent || it.handler).onLeave) {
                    it.handler.wrappedComponent.onLeave(this.currentHierarchyProps);
                }

            }
        }


        this.state = { router: { ...this.state.router, ...changes, activeRoutes: {} } };

        var routeHierarchy = [];
        //this.state.router.activeRoutes = {};

        var routeParams = null;
        var activeRoute = null;

        const checkRoute = (routes, location, depth) => {
            for (let i in routes) {
                const route = routes[i];

                routeParams = matchRoute(route.path, location);

                //console.log(route.name, '(', route.path, ')', ' --> ', routeParams);
                if (routeParams) {
                    //The route is a match
                    this.state.router.currentParams = routeParams;

                    //are we supposed to redirect?
                    if (route.redirectTo) {
                        const toRoute = this.namedRoutes[route.redirectTo];

                        //console.log('redirecting to ' + toRoute.path);
                        //TODO: Add redirect wih params option
                        window.location.hash = '/' + toRoute.path;

                        return;
                    }

                    /**
                     * This is an active route node
                     */
                    activeRoute = route;
                    routeHierarchy.push(activeRoute);

                    if (activeRoute.name) {
                        this.state.router.activeRoutes[activeRoute.name] = activeRoute;
                    }


                    /**
                     * Okay now lets check if this route has children
                     */
                    if (activeRoute.children) {

                        //check the children too
                        checkRoute(activeRoute.children, location, i);
                    }

                    break;
                }
            }
        };

        //loop through routes and output the right match
        checkRoute(this.routes, this.state.router.location, 0);


        var component;
        /**
         * Build component hierarchy from route hierarchy.
         */
        const rhLength = routeHierarchy.length;

        //Determine the combined props, which is a merger of all the props in this router instance
        const providerProps = this.providers.reduce((result, next)=>{
            return {...result, ...next.props}
        },{});

        const combinedProps = { ...this.state, ...routeParams, ...providerProps };


        for (let i = rhLength - 1; i >= 0; i--) {

            const route = routeHierarchy[i];
            const handler = route.handler;

            if (component) {
                component = React.createElement(handler, { ...combinedProps, key: 'route' + i }, [component]);
                //React.createElement(route.handler, props, [component]);
            } else {
                /**
                 * Nested 404s
                 * If the last item in the route hierarchy has a children field, then this is obviously a nested 404
                 */
                if (i === rhLength - 1 && route.children) {
                    component = React.createElement(handler, { ...combinedProps, key: 'route' + i }, [<h1 key="page404">404
                        Nothing
                        Here</h1>]);
                } else {
                    //component = <handler {...props}></handler>;
                    component = React.createElement(handler, { ...combinedProps, key: 'route' + i });
                }
            }

        }

        //Wrap with Given provider elements e.g. Mobx, muitheme etc
        for (let i = this.providers.length - 1; i >= 0; i--) {
            const provider = this.providers[i];
            console.log(provider)
            component = React.createElement(provider.component, provider.props || {}, component);
        }

        //Wrap with Routing context
        component = React.createElement(SpoonContextProvider, this.state, component);

        /**
         * generic 404
         */
        if (!component) {
            component = <h1 key="page404">404 Nothing Here</h1>;
        }

        /**
         * Hooks
         * Run all static onEnters in the handlers.
         */
        routeHierarchy.forEach((it) => {

            if (( it.handler.wrappedComponent || it.handler).onEnter) {
                it.handler.wrappedComponent.onEnter(combinedProps);
            }
        });


        /**
         * At this point, this is the current route hierarchy
         *
         */
        this.currentRouteHierarchy = routeHierarchy;
        this.currentHierarchyProps = combinedProps;

        ReactDom.render(component, document.getElementById(this.domId));
    }

    /**
     * Extract the url state and load it.
     * Url state is a json string of everything after the very first @ of window.location.href
     */
    loadStateFromUrl() {

        /**
         * AGAIN, the purpose of URLState is not to store persistent state, but rather to DISPLAY a URL that better matches your page's current/reproducable state...reproducability that you define.
         * @type {{}}
         */
        urlState = {};

        //console.log(window.location.href)
        const stateString = stringAfter(window.location.href, URL_STATE_DELIM);

        if (!stateString) {
            //console.log('no url state to extract');
            return;
        }

        try {
            urlState = JSON.parse(stateString);
            //console.log('State pulled from URL', urlState)
        } catch (err) {
            console.error(stateObj, err.stack)
        }
    }

    onRouteChanged = () => {
        //console.log('route changing')

        //First load URL state
        this.loadStateFromUrl();

        //Now navigate
        this.changeRoute({ location: getWindowHash() });


    }

}

function stringAfter(str, delim) {
    if (str.indexOf(URL_STATE_DELIM) > -1) {
        return str.substring(str.indexOf(delim) + 1);
    }
    else {
        return null;
    }
}

function stringBefore(str, delim) {
    return str.split(delim)[0];
}

/**
 *
 */
export class Link extends Component {

    constructor() {

        super();
        this.state = {};


    }

    static contextTypes = {
        router: React.PropTypes.object
    };

    /**
     * Upon creating a link, we need to attach it to a route.
     * We must find the best route that matches it's 'to's
     */
    componentWillMount() {
        var router = this.context.router;

        if (!router) {
            throw new Error('You are trying to define a <Link> outside of a Laddle Router context. link: ' + this.props.to || this.props.toName)
        }

        //build href for this link

        this.href = this.props.toName ? router.buildLink(this.props.toName, this.props.params) : this.props.to || '#/';

    }

    /**
     * Not used! Links will now build hrefs on Mount insead of per-click. Performance boost.
     * @param event
     */
    onClick = (event) => {
        if (this.props.onClick) this.props.onClick(event);

        if (event.defaultPrevented) return;

        var router = this.context.router;

        if (!router) {
            throw new Error('You are trying to use a <Link> outside of a Laddle Router context. Link: ' + this.props.to || this.props.toName)
        }

        //!router ? process.env.NODE_ENV !== 'production' ? invariant(false, '<Link>s rendered outside of a router context cannot navigate.') : invariant(false) : void 0;

        //if (isModifiedEvent(event) || !isLeftClickEvent(event)) return;

        // If target prop is set (e.g. to "_blank"), let browser handle link.
        /* istanbul ignore if: untestable with Karma */
        if (this.props.target) return;

        event.preventDefault();

        //router.push(resolveToLocation(this.props.to, router));

        if (this.props.to) {
            window.location.hash = '#' + this.props.to;
        } else if (this.props.toName) {
            router.go(this.props.toName, this.props.params);
        }

    }

    checkIfActive() {
        this.isActive = false;

        //console.log(this.props.to || this.props.toName, 'this params', this.props.params, ' current route params', this.context.router.currentParams, this.context.router.activeRoutes);

        ////The basic requirement for being active is that a toName prop exists
        //const basicRequirement = !!this.props.activeClassName;
        //
        ////Next, t

        if (this.props.toName && this.context.router.activeRoutes[this.props.toName] && objectsAreEqual(this.props.params, this.context.router.currentParams)) {
            //console.log(this.props.to || this.props.toName, 'is active')
            //console.log(this.props.to || this.props.toName,'this params', this.props.params, ' last params', this.context.router.currentParams)
            this.isActive = true;
        }
    }

    //componentWillUpdate() {
    //    this.checkIfActive();
    //}

    render() {
        this.checkIfActive();

        return (
            <a href={this.href}
               className={this.isActive ? 'active' : ''}>
                {this.props.children}
            </a>
        );
    }
}

// querySync feature
let urlState = {};

/**
 * Only works if pushState is supported
 */
function replaceUrlStateInUrl() {

    const realHref = stringBefore(window.location.href, URL_STATE_DELIM);
    const stateHref = realHref + URL_STATE_DELIM + JSON.stringify(urlState);

    window.history.replaceState(null, null, stateHref);
}

export const storeState = (key, value) => {
    if (value) {
        //console.log('storing url state', key, value);
        urlState[key] = value;
    }
    else if (urlState[key]) {
        //pass in null value to wipe key:val from urlState
        delete urlState[key];
    }

    replaceUrlStateInUrl();
}
export const getState = (key) => {
    return urlState[key]

}