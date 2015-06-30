/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../../../custom_typings/ng2.d.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../../typings/jquery.datatables/jquery.dataTables.d.ts" />

import {Component, View, For, Directive, coreDirectives} from 'angular2/angular2';
import {ResourceHandler} from '../../services/resourceHandler';

let template = require('./register.html');
let style = require('../../../../public/css/bootstrap.min.css');

@Component({
    selector: 'register',
    appInjector: [coreDirectives, ResourceHandler],
    properties: {        
        'gridid': 'gridid',
        'title': 'title',
        'datatype': 'datatype',
        'columns': 'columns',
        'data': 'data'
    }
})

@View({
        template: `
            <style>${style}</style>
            ${template}`,
        directives: []
})

export class Register {
    gridid: string;
    title: string;
    datatype: string;
    columns: Array<any>;
    gotData: boolean;
    data: Array<any>;

    constructor(resourceHandler: ResourceHandler) {
        let that = this;
        this.gotData = false;

        // VERY ugly solution until I found out how to do this correctly...
        let intervalId = setInterval(() => {
            if (that.datatype && !that.gotData && !that.data) {
                that.gotData = true;
                resourceHandler.list(that.datatype).then((data) => {
                    that.createDataTable(<any[]>data);
                });               
            } else if (!that.gotData && that.data) {
                that.gotData = true;
                that.createDataTable(that.data);
            }
        }, 1000);

        if (that.gotData) {
            clearInterval(intervalId);
        }
    }
    
    createDataTable(data: Array<any>) {
        let that = this;
        let dataSet = [];
        
        data.forEach((item) => {
            let set = [];
            that.columns.forEach(c => set.push(item[c.text]));
            dataSet.push(set);
        }); 
        
        let dataTableColumns = new Array<Object>();
        that.columns.forEach(c => dataTableColumns.push({ "title": c.text[0].toUpperCase() + c.text.slice(1), "width": c.width }));
        
        // Chrome specific
        let element = $('#' + that.gridid).length == 0 ? $('body /deep/ #' + that.gridid) : $('#' + that.gridid);
        element.DataTable({
            "data": dataSet,
            "columns": dataTableColumns,
            "pageLength": 200
        });        
    }
}