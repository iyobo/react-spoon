'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getState = exports.storeState = exports.Link = exports.ReactSpoon = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp, _class3, _temp2;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               * Created by iyobo on 2017-03-21.
                                                                                                                                                                                                                                                                               */


var _react = require('react');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var ReactDom = require('react-dom');
var UrlPattern = require('url-pattern');

var URL_STATE_DELIM = '@';

function getWindowHash() {
    var hash = window.location.hash.replace(/^#\/?|\/$/g, '');

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
    } else if (routePath !== '') {

        var pattern = new UrlPattern(routePath);
        return pattern.match(location);
    } else {
        return null;
    }
}

function objectsAreEqual(a, b) {
    for (var prop in a) {
        if (a.hasOwnProperty(prop)) {
            if (b.hasOwnProperty(prop)) {
                if (_typeof(a[prop]) === 'object') {
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
var SpoonContextProvider = (_temp = _class = function (_Component) {
    _inherits(SpoonContextProvider, _Component);

    function SpoonContextProvider() {
        _classCallCheck(this, SpoonContextProvider);

        return _possibleConstructorReturn(this, (SpoonContextProvider.__proto__ || Object.getPrototypeOf(SpoonContextProvider)).apply(this, arguments));
    }

    _createClass(SpoonContextProvider, [{
        key: 'getChildContext',
        value: function getChildContext() {
            return { router: this.props.router };
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { id: 'spoonContextProvider' },
                ' ',
                this.props.children
            );
        }
    }]);

    return SpoonContextProvider;
}(_react.Component), _class.childContextTypes = {
    router: React.PropTypes.object
}, _temp);

var ReactSpoon = exports.ReactSpoon = function () {

    /**
     *
     * @param routes
     * @param opts
     * @param opts.domId
     * @param opts.providers
     */
    function ReactSpoon(routes) {
        var _this2 = this;

        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, ReactSpoon);

        this.goToName = function () {
            var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var route = _this2.namedRoutes[name];
            if (route) {

                var path = route.path;

                var pattern = new UrlPattern(path);

                window.location.hash = '/' + pattern.stringify(params);

                _this2.state.router.currentParams = params;
            } else {
                throw new Error('Unknown route name: ' + name);
            }
        };

        this.onRouteChanged = function () {
            //console.log('route changing')

            //First load URL state
            _this2.loadStateFromUrl();

            //Now navigate
            _this2.changeRoute({ location: getWindowHash() });
        };

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
                go: function go() {
                    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
                    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                    var route = _this2.namedRoutes[name];
                    if (route) {

                        var path = route.path;

                        var pattern = new UrlPattern(path);

                        window.location.hash = '/' + pattern.stringify(params);

                        _this2.state.router.currentParams = params;
                    } else {
                        throw new Error('Unknown route name: ' + name);
                    }
                },
                buildLink: function buildLink(name, params) {

                    var route = _this2.namedRoutes[name];
                    var link = '#/';
                    if (route) {
                        var pattern = new UrlPattern(route.path);
                        link = '#/' + pattern.stringify(params);
                    }

                    //console.log('creating link', name, params, link)

                    return link;
                },
                currentParams: {}
            }
        };

        //console.log('RouteState:', this.state);

        var setupRoutes = function setupRoutes(routeTree) {
            routeTree.forEach(function (it) {

                /**
                 * Register names
                 */
                if (it.name) _this2.namedRoutes[it.name] = it;

                /**
                 * Create context
                 */
                if (it.handler) {
                    (it.handler.wrappedComponent || it.handler).contextTypes = {
                        router: React.PropTypes.any
                    };
                }

                if (it.children) {
                    setupRoutes(it.children);
                }
            });
        };

        setupRoutes(this.routes);

        this.onRouteChanged();

        // Handle browser navigation events
        window.addEventListener('hashchange', this.onRouteChanged, false);
    }

    _createClass(ReactSpoon, [{
        key: 'changeRoute',


        /**
         *
         * @param changes
         * @param changes.location - pure hash of current window url
         */
        value: function changeRoute(changes) {
            var _this3 = this;

            /***
             * First thing to do on route change is to call onLeave on all active routes' handler components, from last to first.
             */
            if (this.currentRouteHierarchy) {

                for (var i = this.currentRouteHierarchy.length - 1; i >= 0; i--) {
                    var it = this.currentRouteHierarchy[i];

                    if ((it.handler.wrappedComponent || it.handler).onLeave) {
                        it.handler.wrappedComponent.onLeave(this.currentHierarchyProps);
                    }
                }
            }

            this.state = { router: _extends({}, this.state.router, changes, { activeRoutes: {} }) };

            var routeHierarchy = [];
            //this.state.router.activeRoutes = {};

            var routeParams = null;
            var activeRoute = null;

            var checkRoute = function checkRoute(routes, location, depth) {
                for (var _i in routes) {
                    var route = routes[_i];

                    routeParams = matchRoute(route.path, location);

                    //console.log(route.name, '(', route.path, ')', ' --> ', routeParams);
                    if (routeParams) {
                        //The route is a match
                        _this3.state.router.currentParams = routeParams;

                        //are we supposed to redirect?
                        if (route.redirectTo) {
                            var toRoute = _this3.namedRoutes[route.redirectTo];

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
                            _this3.state.router.activeRoutes[activeRoute.name] = activeRoute;
                        }

                        /**
                         * Okay now lets check if this route has children
                         */
                        if (activeRoute.children) {

                            //check the children too
                            checkRoute(activeRoute.children, location, _i);
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
            var rhLength = routeHierarchy.length;

            //Determine the combined props, which is a merger of all the props in this router instance
            var providerProps = this.providers.reduce(function (result, next) {
                return _extends({}, result, next.props);
            }, {});

            var combinedProps = _extends({}, this.state, routeParams, providerProps);

            for (var _i2 = rhLength - 1; _i2 >= 0; _i2--) {

                var route = routeHierarchy[_i2];
                var handler = route.handler;

                if (component) {
                    component = React.createElement(handler, _extends({}, combinedProps, { key: 'route' + _i2 }), [component]);
                    //React.createElement(route.handler, props, [component]);
                } else {
                    /**
                     * Nested 404s
                     * If the last item in the route hierarchy has a children field, then this is obviously a nested 404
                     */
                    if (_i2 === rhLength - 1 && route.children) {
                        component = React.createElement(handler, _extends({}, combinedProps, { key: 'route' + _i2 }), [React.createElement(
                            'h1',
                            {
                                key: 'page404' },
                            '404 Nothing Here'
                        )]);
                    } else {
                        //component = <handler {...props}></handler>;
                        component = React.createElement(handler, _extends({}, combinedProps, { key: 'route' + _i2 }));
                    }
                }
            }

            //Wrap with Given provider elements e.g. Mobx, muitheme etc
            for (var _i3 = this.providers.length - 1; _i3 >= 0; _i3--) {
                var provider = this.providers[_i3];
                //console.log(provider)
                component = React.createElement(provider.component, provider.props || {}, component);
            }

            //Wrap with Routing context
            component = React.createElement(SpoonContextProvider, this.state, component);

            /**
             * generic 404
             */
            if (!component) {
                component = React.createElement(
                    'h1',
                    { key: 'page404' },
                    '404 Nothing Here'
                );
            }

            /**
             * Hooks
             * Run all static onEnters in the handlers.
             */
            routeHierarchy.forEach(function (it) {

                if ((it.handler.wrappedComponent || it.handler).onEnter) {
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

    }, {
        key: 'loadStateFromUrl',
        value: function loadStateFromUrl() {

            /**
             * AGAIN, the purpose of URLState is not to store persistent state, but rather to DISPLAY a URL that better matches your page's current/reproducable state...reproducability that you define.
             * @type {{}}
             */
            urlState = {};

            //console.log(window.location.href)
            var stateString = stringAfter(window.location.href, URL_STATE_DELIM);

            if (!stateString) {
                //console.log('no url state to extract');
                return;
            }

            try {
                urlState = JSON.parse(stateString);
                //console.log('State pulled from URL', urlState)
            } catch (err) {
                console.error('Error loading data from state', err, stateString);
            }
        }
    }]);

    return ReactSpoon;
}();

function stringAfter(str, delim) {
    if (str.indexOf(URL_STATE_DELIM) > -1) {
        return str.substring(str.indexOf(delim) + 1);
    } else {
        return null;
    }
}

function stringBefore(str, delim) {
    return str.split(delim)[0];
}

/**
 *
 */
var Link = exports.Link = (_temp2 = _class3 = function (_Component2) {
    _inherits(Link, _Component2);

    function Link() {
        _classCallCheck(this, Link);

        var _this4 = _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).call(this));

        _this4.onClick = function (event) {
            if (_this4.props.onClick) _this4.props.onClick(event);

            if (event.defaultPrevented) return;

            var router = _this4.context.router;

            if (!router) {
                throw new Error('You are trying to use a <Link> outside of a Laddle Router context. Link: ' + _this4.props.to || _this4.props.toName);
            }

            //!router ? process.env.NODE_ENV !== 'production' ? invariant(false, '<Link>s rendered outside of a router context cannot navigate.') : invariant(false) : void 0;

            //if (isModifiedEvent(event) || !isLeftClickEvent(event)) return;

            // If target prop is set (e.g. to "_blank"), let browser handle link.
            /* istanbul ignore if: untestable with Karma */
            if (_this4.props.target) return;

            event.preventDefault();

            //router.push(resolveToLocation(this.props.to, router));

            if (_this4.props.to) {
                window.location.hash = '#' + _this4.props.to;
            } else if (_this4.props.toName) {
                router.go(_this4.props.toName, _this4.props.params);
            }
        };

        _this4.state = {};

        return _this4;
    }

    _createClass(Link, [{
        key: 'componentWillMount',


        /**
         * Upon creating a link, we need to attach it to a route.
         * We must find the best route that matches it's 'to's
         */
        value: function componentWillMount() {
            var router = this.context.router;

            if (!router) {
                throw new Error('You are trying to define a <Link> outside of a Laddle Router context. link: ' + this.props.to || this.props.toName);
            }

            //build href for this link

            this.href = this.props.toName ? router.buildLink(this.props.toName, this.props.params) : this.props.to || '#/';
        }

        /**
         * Not used! Links will now build hrefs on Mount insead of per-click. Performance boost.
         * @param event
         */

    }, {
        key: 'checkIfActive',
        value: function checkIfActive() {
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

    }, {
        key: 'render',
        value: function render() {
            this.checkIfActive();

            return React.createElement(
                'a',
                { href: this.href,
                    className: this.isActive ? 'active' : '' },
                this.props.children
            );
        }
    }]);

    return Link;
}(_react.Component), _class3.contextTypes = {
    router: React.PropTypes.object
}, _temp2);

// querySync feature

var urlState = {};

/**
 * Only works if pushState is supported
 */
function replaceUrlStateInUrl() {

    var realHref = stringBefore(window.location.href, URL_STATE_DELIM);
    var stateHref = realHref + URL_STATE_DELIM + JSON.stringify(urlState);

    window.history.replaceState(null, null, stateHref);
}

var storeState = exports.storeState = function storeState(key, value) {
    if (value) {
        //console.log('storing url state', key, value);
        urlState[key] = value;
    } else if (urlState[key]) {
        //pass in null value to wipe key:val from urlState
        delete urlState[key];
    }

    replaceUrlStateInUrl();
};
var getState = exports.getState = function getState(key) {
    return urlState[key];
};
//# sourceMappingURL=react-spoon.js.map