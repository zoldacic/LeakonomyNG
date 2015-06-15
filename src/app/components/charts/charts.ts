/// <reference path="../../../../typings/d3/d3.d.ts" />
/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../../../custom_typings/ng2.d.ts" />

import {Component, View, Directive, coreDirectives} from 'angular2/angular2';
import {Chart} from './chart/chart'
import {AreaChart} from './area/area'

let template =  require('./charts.html');

@Component({
    selector: 'charts',
    properties: {
        'charts': 'charts'
    }
})
@View({
    template: `${template}`,
    directives: [coreDirectives, AreaChart]
}) 
export class Charts {
    //charts: Array<Chart>;

    constructor() {
      //  this.charts = new Array<Chart>();
    }

    //add(chart: IChart) {
    //    this.charts.push(chart);
    //}
}