/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../../../custom_typings/ng2.d.ts" />

import {Component, View, bootstrap, For} from 'angular2/angular2';

@Component({
    selector: 'data-row',
    properties: {
        'item': 'item',
        'columns': 'columns'
    }
})
@View({
        templateUrl: 'common/dataTable/dataRow.html',
        directives: [For]        
})
export class DataRow {
    item: Object;
    columns: Array<string>;
}