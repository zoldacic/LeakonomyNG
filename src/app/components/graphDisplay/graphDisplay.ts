/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../../../custom_typings/ng2.d.ts" />
/// <reference path="../../../../typings/underscore/underscore.d.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />

import {Component, View, Directive, coreDirectives, For} from 'angular2/angular2';
import {formDirectives, FormBuilder, Control, ControlGroup} from 'angular2/forms';
import {ResourceHandler} from '../../services/resourceHandler';
import {ChartService} from '../../services/chartService'
import {Charts} from '../charts/charts'
import {Chart} from '../charts/chart/chart'
import {ChartItem} from '../charts/chart/chartItem'
import {AreaChart} from '../charts/area/areaNVD3'
import {GridInfo, GridInfoColumn} from '../dataTable/gridInfo'

class DataSet {
    tags: Array<string>;
    color: string;
}

class Graph {
    key: string;
    name: string;
    displayName: string;
    datasets: Array<DataSet>;
    tags: Array<Object>;
    dateFrom: Date;
    dateTo: Date;
    timeInterval: string;
    type: string;
    
    constructor() {
        this.name = "";         
    }
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
let style = require('../../../../public/css/bootstrap.min.css');

@Component({
    selector: 'graph-display',
    appInjector: [FormBuilder, ResourceHandler, ChartService]
})
@View({
    template: `
        <style>${style}</style>
        ${template}`,
    directives: [coreDirectives, Charts]
})
export class GraphDisplay {      
    eventTagLists: Array<EventTagList>;
    graph: Graph;
    graphs: Array<Graph>;
    transactions: Array<Transaction>;
    chartTypes: Array<string>;
    timeIntervals: Array<string>;           
       
    chartForm: ControlGroup;
    nameInput: Control;
    dateFromInput: Control;
    dateToInput: Control;
    chartTypeInput: Control;
    timeIntervalInput: Control;
    
    dataSetGridInfo: GridInfo;
    dataSetTags: Array<any>;
    datasets: Array<any>;

    constructor(public resourceHandler: ResourceHandler, 
                public formBuilder: FormBuilder) {
                    
        let that = this;
        that.graphs = new Array();
        that.chartTypes = new Array<string>('- Select area -', 'Area');
        that.timeIntervals = new Array<string>('- Select time interval -', 'Yearly', 'Monthly', 'Daily');

        that.chartForm = formBuilder.group({'name': [''], 'dateFrom': [''], 'dateTo': [''], 'chartType': [''], 'timeInterval': ['']});
        that.nameInput = that.chartForm.controls.name;
        that.dateFromInput = that.chartForm.controls.dateFrom;
        that.dateToInput = that.chartForm.controls.dateTo;
        that.chartTypeInput = that.chartForm.controls.chartType;
        that.timeIntervalInput = that.chartForm.controls.timeInterval;

        that.dataSetGridInfo = new GridInfo("dataSetGrid", "Datasets", null, new Array<GridInfoColumn>(new GridInfoColumn('tags', '60%'), new GridInfoColumn('dataset1', '10%'), new GridInfoColumn('dataset2', '10%'), new GridInfoColumn('dataset3', '10%'), new GridInfoColumn('dataset4', '10%')));

        that.graph = that._createNewGraphItem();

        resourceHandler.list('graphs').
            then((newGraphs:Array<Graph>) => { that._addGraphs(newGraphs); }).
            then(() => { return resourceHandler.list('tags'); }).
            then((data) => { that.eventTagLists = (<Array<EventTagList>>data); });
            
        // resourceHandler.list('tags').
        //     then((tags:Array<any>) => {
        //         tags.forEach(tag => {
        //             that.dataSetTags.push(new { name: tag.});
        //         });                
        //     });                        
    }
    
    _createNewGraphItem() {
        let graph = new Graph();
        graph.displayName = "- New graph -";
        this.graphs.push(graph);
        return graph;
    }
    
    _addGraphs(newGraphs: Array<Graph> ) {
        let that = this;
        newGraphs.forEach((graph) => {
            that._setDisplayName(graph);
            that.graphs.push(graph);
        });
    };    
    
    _setDisplayName(graph: Graph) {
        graph.displayName = graph.name + ' : ' + graph.dateFrom + ' - ' + graph.dateTo;
    }
    
    _getFieldByClass(id: string) {
        return this._getFieldById("." + id);
    }
    
    _getFieldById(id: string) {
        let fieldId = id;
        
        if (fieldId.substr(0,1) != "#" && fieldId.substr(0,1) != ".") {
            fieldId = "#" + fieldId;
        }
        
        let field = $(fieldId).length > 0 ? $(fieldId) : $('body /deep/ ' + fieldId);
                       
        if (field.length > 0) {
            return field;
        } else {
            return null;
        }
    }
    
    updateChartFields() {
        let element = this._getFieldById('chartSelectionInput')
        let key = element.val();
        this.graph = this.graphs.filter((graph: Graph) => { return graph.key == key; })[0];   
        this.datasets = [];
        
        let i = 0;
        this.graph.datasets.forEach((ds) => this.datasets.push({id: i++, color: ds.color, value: ds.tags.reduce((name, tag) => { return name + ', ' + tag; })}));
    }

    updateInput(field, value) {
        if (value == "") {
            // The "controls" are not yet working properly, using jquery for now...
            value = this._getFieldById(field).val();
        } 
        
        if (field.substring(0, 11) == 'datasettags') {
            this.graph.datasets[field.substring(11, field.length)].tags = [];
            value.split(',').forEach(v => { this.graph.datasets[field.substring(11, field.length)].tags.push(v.trim())});
        } else if (field.substring(0, 12) == 'datasetcolor') {
            this.graph.datasets[field.substring(12, field.length)].color = value;            
        } else {        
            this.graph[field] = value;
        }
            
        this._setDisplayName(this.graph);                
    } 

    showGraph() {
        let that = this;
        that._getTransactions().then(() => { that._calculateChartData(); });                    
    }
    
    _getTransactions() {
        let that = this;
        return that.resourceHandler.list('transactions').then((data) => { that.transactions = (<Array<Transaction>>data); });
    }

    _calculateChartData() {
        let that = this;
        let datasets = [];

        that.graph.datasets.forEach((storedDataset) => {
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
            if (that.graph.timeInterval == 'Yearly') {
                dateGrouping = getYearFromTransaction;
            } if (that.graph.timeInterval == 'Monthly') {
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
        let nvd3ChartData = []; 
        
        for (let dataset of datasets) {
            let chartItems = []; // new Array<ChartItem>();
            for (let key in dataset.values) {
                // Reformat date if date = 'YYMMDD'
                let date = key;
                // if (date.length == 6) {
                //     date = '20' + date.substring(0, 2) + '-' + date.substring(2, 4) + '-' + date.substring(4, 7);
                // }
                let val = new Date(date.length == 6 ? '20' + date.substring(0, 2) : date.substring(0, 2), date.substring(2, 4), date.substring(4, 7), 0).valueOf();
                chartItems.push({x: val, y: dataset.values[key]});
            }        
            
            nvd3ChartData.push({ values: chartItems, key: dataset.name, color: dataset.color});
        }

        chart.id = 'chart' + Math.floor((1 + Math.random()) * 0x10000);
        ChartService.getInstance().charts.push(chart);      
        
        
        
        // VERY ugly solution until I found out how to do this correctly...
        let intervalId = setInterval(() => {  
            if (that._getFieldById(chart.id)) {
                chart.create(nvd3ChartData);    
                clearInterval(intervalId);
            }
        }, 500);                   
    }
 }
