/// <reference path="../../../../typings/d3/d3.d.ts" />
/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../../../custom_typings/ng2.d.ts" />

import {Component, View, Directive, coreDirectives} from 'angular2/angular2';
import {Chart} from './chart/chart'
import {ChartService} from '../../services/chartService'
import {AreaChart} from './area/areaNVD3'

let template =  require('./charts.html');
let style = require('../../../../public/css/nv.d3.css');

@Component({
    selector: 'charts',
    appInjector: [ChartService],
    properties: {
   //     'charts': 'charts'
    }
})
@View({
        template: `
        <style>${style}</style>
        ${template}`,
    directives: [coreDirectives, AreaChart]
}) 
export class Charts {
    chartService: ChartService;
    constructor() {
        // This is needed for the 'ng-for'-binding in the view
        this.chartService = ChartService.getInstance();
    }

    close(chartId) {
        let chart = ChartService.getInstance().charts.filter(c => { return c.id == chartId; })[0];
        let index = ChartService.getInstance().charts.indexOf(chart, 0);
         
        chart.destroy();         
        ChartService.getInstance().charts.splice(index, 1);
    }
}