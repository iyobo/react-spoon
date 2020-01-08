import {Component} from 'react';


export interface SpoonOptions {
    domId: string;
    providers: {
        domId: string,
        providers: { component: Component, props: { [key: string]: any } }[]
    }
}

export interface RouteDef {
    name: string;
    path: string;
    handler: Component;
    children: RouteDef[]
}