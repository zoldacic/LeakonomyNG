/// <reference path="../../../../../typings/d3/d3.d.ts" />
/// <reference path="../../../../../typings/tsd.d.ts" />
/// <reference path="../../../../custom_typings/ng2.d.ts" />

import {ChartItem} from '../chart/chartItem'
import {Chart} from '../chart/chart'
import {Component, View} from 'angular2/angular2';

let template = require('./area.html');

@Component({
    selector: 'area-chart',
    //properties: {
    //    'data': 'data'
    //}
})
@View({
        template: `${template}`        
})
export class AreaChart extends Chart {
    
    constructor() {
        //let data = [new AreaChartItem(new Date(2015, 1, 1), 200.5), new AreaChartItem(new Date(2015, 1, 15), 150.7)];
        //this.createChart(data);

        super();
    }    

    create(data: Array<ChartItem>) {
        let margin  = { top: 20, right: 20, bottom: 30, left: 50 };
        let width   = 400 - margin.left - margin.right;
        let height  = 300 - margin.top - margin.bottom;

        //let parseDate = d3.time.format("%d-%b-%y").parse;

        let x = d3.time.scale().range([0, width]);
        let y = d3.scale.linear().range([height, 0]);

        let xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        let yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        let area = d3.svg.area()
            .x((d) => { return x(d.date); })
            .y0(height)
            .y1((d) => { return y(d.close); });

        let element = d3.select("#" + this.id)[0][0] != null ? d3.select("#" + this.id) : d3.select("body /deep/ #" + this.id);
        let svg = element.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //d3.tsv("data.tsv", (error, data) => {
       
            data.forEach((d) => {
                d.date = d.date; //parseDate(d.date);
                d.close = +d.close;
            });

            x.domain(d3.extent(data, (d) => { return d.date; }));
            y.domain([0, d3.max(data, (d) => { return d.close; })]);

            svg.append("path")
                .datum(data)
                .attr("class", "area")
                .attr("d", area);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Sum (kr)");
       // });
    }
    
    destroy() {
        let element = d3.select("#" + this.id)[0][0] != null ? d3.select("#" + this.id) : d3.select("body /deep/ #" + this.id);
        element.remove();
    }
}