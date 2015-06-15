import {Component, View, bootstrap, For} from 'angular2/angular2';
import {DataRow} from './dataRow'

@Component({
    selector: 'data-table',
    properties: {
        'items': 'items',
        'columns': 'columns'
    }
})
@View({
    templateUrl: 'common/dataTable/dataTable.html',
    directives: [For, DataRow]
})
export class DataTable {
    items: Array<Object>;
    columns: Array<string>;

    constructor() {
    }
}