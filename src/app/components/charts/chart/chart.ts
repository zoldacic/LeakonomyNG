
import {ChartItem} from '../chart/chartItem'

export class Chart {
	id: string;
	
	create(data: Array<ChartItem>) {}
	
	destroy() {
        let element = d3.select("#" + this.id)[0][0] != null ? d3.select("#" + this.id) : d3.select("body /deep/ #" + this.id);
        element.remove();
    }
}