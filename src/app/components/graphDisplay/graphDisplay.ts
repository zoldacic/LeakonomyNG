/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../../../custom_typings/ng2.d.ts" />
/// <reference path="../../../../typings/underscore/underscore.d.ts" />

import {Component, View, Directive, coreDirectives, For} from 'angular2/angular2';
import {ResourceHandler} from '../../services/resourceHandler';
import {Charts} from '../charts/charts'
import {Chart} from '../charts/chart/chart'
import {ChartItem} from '../charts/chart/chartItem'
import {AreaChart} from '../charts/area/area'

class TimeInterval {
    name: string;
}

class DataSet {
    tags: Array<string>;
    color: string;
}

class Graph {
    datasets: Array<DataSet>;
    tags: Array<Object>;
    timeInterval: TimeInterval;
}

class EventTag {
   
}

class EventTagList {
    event: string;
    tags: Array<string>;
}

class Transaction {
    event: string;
    amount: string;
}

let template = require('./graphDisplay.html');

@Component({
    selector: 'graph-display',
    appInjector: [ResourceHandler]
})
@View({
    template: `${template}`,
    directives: [coreDirectives, Charts]
})
export class GraphDisplay {
    eventTagLists: Array<EventTagList>;
    graph: Graph;
    graphs: Array<Graph>;
    transactions: Array<Transaction>;
    charts: Array<Chart>;

    constructor(resourceHandler: ResourceHandler) {
        let that = this;
        that.graphs = new Array();
        that.charts = new Array<Chart>();

        resourceHandler.list('graphs').
            then((newGraphs) => { that.addGraphs(that.graphs, newGraphs); }).
            then(() => { return resourceHandler.list('tags'); }).
            then((data) => { that.eventTagLists = (<Array<EventTagList>>data); }).
            then(() => { return resourceHandler.list('transactions'); }).
            then((data) => { that.transactions = (<Array<Transaction>>data); });
    }

    selectGraph(graph) {
        //this.graph = graph;
        this.graph = this.graphs[0];
        this.createGraph();
    }

    createGraph() {
        let that = this;
        let datasets = [];

        this.graph.datasets.forEach((storedDataset) => {
            var name = storedDataset.tags.reduce((name, tag) => { return name + ', ' + tag; });
            var dataset = { color: storedDataset.color, name: name, values: {} };

            // Retrieve included events
            //var events = _.pluck(_.filter(eventTagLists, function (eventTagList) {
            //    var intersect = _.intersection(eventTagList.tags, storedDataset.tags)
            //    return intersect.length > 0;
            //}), 'event');

            let eventTagLists = that.eventTagLists.filter((eventTagList) => {
                let found = false;
                eventTagList.tags.forEach((tag) => {
                    if (storedDataset.tags.some((t) => { return tag == t })) {
                        found = true;
                    }
                });

                return found;
            });

            let events = eventTagLists.map((eventTagList) => { return eventTagList.event; });

            // Retrive transactions with selected events
            var includedTransactions = that.transactions.filter((transaction) => { return events.some((event) => { return event == transaction.event }); });

            // Group transactions (by month)
            function getYearFromTransaction(transaction) { return transaction.transactionDate.substring(0, 2) };
            function getMonthFromTransaction(transaction) { return transaction.transactionDate.substring(0, 4) };
            function getDateFromTransaction(transaction) { return transaction.transactionDate; };

            var dateGrouping;
            if (that.graph.timeInterval.name == 'Yearly') {
                dateGrouping = getYearFromTransaction;
            } if (that.graph.timeInterval.name == 'Monthly') {
                dateGrouping = getMonthFromTransaction;
            } else {
                dateGrouping = getDateFromTransaction;
            }

            var transactionGroups = _.groupBy(includedTransactions, dateGrouping);

            // Summarize transactions
            _.each(transactionGroups, (transactionGroup, key) => {
                var amounts = transactionGroup.map((transaction) => { return parseInt(transaction.amount) });
                dataset.values[key] = amounts.reduce((sum, transactionAmount) => { return sum + transactionAmount; });
            });

            // -- "No Underscore"-version....
            //transactionGroups.forEach((transactionGroup) => {
            //    var amounts = transactionGroup.map((transaction) => { return parseInt(transaction.amount) });
            //    dataset.values[key] = amounts.reduce((sum, transactionAmount) => { return sum + transactionAmount; });
            //});

            datasets.push(dataset);
        });

        //var index = vm.charts.length;
        //vm.charts.push({ index: index });
    
        //showGraph(vm.graph, datasets);
         //let data = [new AreaChartItem(new Date(2015, 1, 1), 200.5), new AreaChartItem(new Date(2015, 1, 15), 150.7)];
        let chart = new AreaChart();
        let chartItems = new Array<ChartItem>();

        for (let key in datasets[0].values) {
            // Reformat date if date = 'YYMMDD'
            let date = key;
            if (date.length == 6) {
                date = '20' + date.substring(0, 2) + '-' + date.substring(2, 4) + '-' + date.substring(4, 7);
            }
            chartItems.push(new ChartItem(new Date(date), datasets[0].values[key]));
        }        

        this.charts.push(chart);
        chart.createChart(chartItems);        
    }

    addGraphs(currentGraphs: Array<Object>, newGraphs) {
        currentGraphs.length = 0;
        newGraphs.forEach((graph) => {
            //graph.key = key;
            graph.nameAndDate = graph.name + ' : ' + graph.dateFrom + ' - ' + graph.dateTo;
            currentGraphs.push(graph);
        });
    };

    showGraph(graph, datasets) {
    }
}
