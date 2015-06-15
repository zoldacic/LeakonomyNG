/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../../../custom_typings/ng2.d.ts" />

export class GridInfoColumn {
    text: string;
    width: string;

    constructor(text: string, width: string) {
        this.text = text;
        this.width = width;
    }
}

export class GridInfo {
    id: string;
    datatype: string;
    title: string;
    columns: Array<GridInfoColumn>;

    constructor(id: string, title: string, datatype: string, columns: Array<GridInfoColumn>) {
        this.id = id;
        this.title = title;
        this.datatype = datatype;
        this.columns = columns;
    }
}