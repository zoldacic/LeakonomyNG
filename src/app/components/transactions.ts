/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../custom_typings/ng2.d.ts" />

// Angular 2
import {Component, View } from 'angular2/angular2';

// App
import {Register} from './registers/register'
import {GridInfo, GridInfoColumn} from './dataTable/gridInfo'

@Component({
  selector: 'transactions'
})
@View({
  directives: [Register],
  template: `  
    <register [gridid]=gridInfo.id [title]=gridInfo.title [datatype]=gridInfo.datatype [columns]=gridInfo.columns></register>
  `
})
export class Transactions {
    gridInfo: GridInfo;

    constructor() {
        this.gridInfo = new GridInfo("transactionsGrid", "Transactions", "transactions", new Array<GridInfoColumn>(new GridInfoColumn('amount', '10%'), new GridInfoColumn('event', '75%'), new GridInfoColumn('transactionDate', '15%')));       
  }
}