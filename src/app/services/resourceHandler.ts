/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../custom_typings/ng2.d.ts" />
/// <reference path="../../../typings/firebase/firebase.d.ts" />
/// <reference path="../../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../../../typings/es6-promises/es6-promises.d.ts" />

export class ResourceHandler {
    baseRef: string;
    firebaseRef: Firebase;
    
    constructor() { 
        this.baseRef = 'https://leakonomy.firebaseio.com/';
        this.firebaseRef = new Firebase(this.baseRef);      
    }

    list(path: string) {

        let promise = new Promise((resolve, reject) => {
            let items = new Array<Object>();
            this.firebaseRef.child(path).once("value", (values) => {
                values.forEach((value) => {
                    let val = value.val();
                    val.key = value.key();
                    items.push(val);
                });

                resolve(items);
            });
        });

        return promise;
    }
    
    ref(path: string) {
        return new Firebase(this.baseRef).child(path);           
    }
}