/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../custom_typings/ng2.d.ts" />

// Angular 2
import {Component, View, coreDirectives} from 'angular2/angular2';
import {RouteConfig, RouterOutlet, RouterLink, Router} from 'angular2/router';
import {BrowserLocation} from 'angular2/src/router/browser_location';

// We use a folder if we want separate files
import {Home} from './home/home';
// Otherwise we only use one file for a component
import {Dashboard} from './dashboard';
// A simple example of a Component using a Service
import {Todo} from './todo';

import {Transactions} from './transactions'
import {Tags} from './tags'
import {TransactionParser} from './transactionParser/transactionParser'
import {GraphDisplay} from './graphDisplay/graphDisplay'

// Import all of our custom app directives
import {appDirectives} from '../directives/directives';

let template = require('./app.html');


// App: Top Level Component
@Component({
  selector: 'app' // without [ ] means we are selecting the tag directly,
})
@View({
    // needed in order to tell Angular's compiler what's in the template
    directives: [RouterOutlet, RouterLink, coreDirectives, appDirectives],
    template: `${template}`
})
@RouteConfig([
  { path: '/',          as: 'home',      component: Home },
  { path: '/dashboard', as: 'dashboard', component: Dashboard },
  { path: '/todo', as: 'todo', component: Todo },
  { path: '/transactions', as: 'transactions', component: Transactions },
  { path: '/tags', as: 'tags', component: Tags },
  { path: '/transactionParser', as: 'transactionParser', component: TransactionParser },
  { path: '/graphDisplay', as: 'graphDisplay', component: GraphDisplay }
  
])
export class App {
  name: string;
  constructor(router: Router, browserLocation: BrowserLocation) {
    this.name = 'Leakonomy';

    // we need to manually go to the correct uri until the router is fixed
    let uri = browserLocation.path();
    router.navigate(uri);
  }
}
