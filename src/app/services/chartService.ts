
import {Chart} from '../components/charts/chart/chart'

export class ChartService {
	static instance:ChartService;
	charts: Array<Chart>;
	
	constructor() {
		this.charts = new Array<Chart>();
	}
	
   static getInstance() {
        if (ChartService.instance == null) {
            ChartService.instance = new ChartService();
        }
 
        return ChartService.instance;
    }	
}