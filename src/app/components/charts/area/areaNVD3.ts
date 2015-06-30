/// <reference path="../../../../../typings/d3/d3.d.ts" />
/// <reference path="../../../../../typings/tsd.d.ts" />
/// <reference path="../../../../custom_typings/ng2.d.ts" />

import {ChartItem} from '../chart/chartItem'
import {Chart} from '../chart/chart'
import {Component, View} from 'angular2/angular2';

let template = require('./areaNVD3.html');
let style = require('../../../../../public/css/nv.d3.css');

@Component({
    selector: 'area-chart',
    //properties: {
    //    'data': 'data'
    //}
})
@View({
        template: `
        <style>${style}</style>
        ${template}`        
})
export class AreaChart extends Chart {
    
    constructor() {
        super();
    }     

    create(data) {

        let that = this;
        //let element = d3.select("#" + this.id)[0][0] != null ? d3.select("#" + this.id) : d3.select("body /deep/ #" + this.id);
        nv.addGraph(function() {
         
            var chart = nv.models.lineWithFocusChart() //.lineChart()
                .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                //.transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                //.showYAxis(true)        //Show the y-axis
                //.showXAxis(true)        //Show the x-axis
        
            chart.xAxis
                .axisLabel('Date')
                 .tickFormat((d) => {  
                     let dx = data[0].values[d] && data[0].values[d].x || 0;
                     return d3.time.format('%x')(new Date(d));
                 });
                 
            chart.yAxis
            .axisLabel('Sum (kr)')
            .tickFormat(d3.format('.02f'));
            
            chart.x2Axis
                .axisLabel('Date')
                .tickFormat((d) => {  
                     let dx = data[0].values[d] && data[0].values[d].x || 0;
                     return d3.time.format('%x')(new Date(d));
                 });            
            
            chart.y2Axis
            .axisLabel('Sum (kr)')
            .tickFormat(d3.format('.02f'));
            
            let element = d3.select("#" + that.id + ' svg')[0][0] != null ? d3.select("#" + that.id + ' svg') : d3.select("body /deep/ #" + that.id + ' svg');
            element
            .datum(data)
           // .transition().duration(500)
            .call(chart);   
            
             //Update the chart when window resizes.
            nv.utils.windowResize(function() { chart.update() });            
            
            return chart;    
        });
    }
    
    destroy() {
        let element = d3.select("#" + this.id)[0][0] != null ? d3.select("#" + this.id) : d3.select("body /deep/ #" + this.id);
        element.remove();
    }
}