/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../../../custom_typings/ng2.d.ts" />
/// <reference path="../../../../typings/underscore/underscore.d.ts" />

import {Component, View, Directive, coreDirectives} from 'angular2/angular2';
import {formDirectives, FormBuilder, Control, ControlGroup} from 'angular2/forms';
import {ResourceHandler} from '../../services/resourceHandler'

import {appDirectives} from '../../directives/directives';

import {Register} from '../registers/register'
import {GridInfo, GridInfoColumn} from '../dataTable/gridInfo'

let style = require('../../../../public/css/bootstrap.min.css');
let template = require('./transactionParser.html');

enum Phase {
    STEP1, STEP2, STEP3
}

@Component({
    selector: 'transaction-parser',
    appInjector: [FormBuilder, ResourceHandler]
})
@View({
        directives: [coreDirectives, formDirectives, appDirectives, Register],
        template: `
            <style>${style}</style>
            ${template}
        `
})
export class TransactionParser {
    resourceHandler: ResourceHandler;
    transactions: Array<any>;
    uniqueEvents: Array<any>;
    eventTagLists: Array<any>;
    currentPhase: Phase;
    tagsRef: any;
    transactionRef: any;
       
    rawTextForm: ControlGroup;
    rawText: Control;
    
    phase2GridInfo: GridInfo;
    phase3GridInfo: GridInfo;

    constructor(resourceHandler: ResourceHandler,     public formBuilder: FormBuilder) {
        this.resourceHandler = resourceHandler;
        
        this.rawTextForm = formBuilder.group({'rawText': ['']});
        this.rawText = this.rawTextForm.controls.rawText;
        
        this.phase2GridInfo = new GridInfo("transactionGrid", "Transactions", null, new Array<GridInfoColumn>(new GridInfoColumn('amount', '10%'), new GridInfoColumn('event', '75%'), new GridInfoColumn('transactionDate', '15%')));
        this.phase3GridInfo = new GridInfo("tagsGrid", "Tags", null, new Array<GridInfoColumn>(new GridInfoColumn('event', '70%'), new GridInfoColumn('tags', '30%')));
        
        this.transactionRef = this.resourceHandler.ref('transactions');
        this.tagsRef = this.resourceHandler.ref('tags');
//             transactionRef = resourceHandler.transactionRef;
// 
//             this.parseRawText = parseRawText;
//             this.addTransactions = addTransactions;
//             this.addTags = addTags;
// 
//             this.isInPhase = isInPhase;
//             this.setActive = setActive;
//             this.getTransactionGridHeight = getTransactionGridHeight;
// 
//             this.Phases = { STEP1: 1, STEP2: 2, STEP3: 3, STEP4: 4 };
// 
//             currentPhase = this.Phases.STEP1;
// 
             this.rawText.updateValue('140507 MAX I SKELLEFTEA, SKELLEFTEA 161,00');
    }

 
    parseRawText(rawText: string) {
        let that = this;
        var rawTransactions = rawText.split("\n");

        that.transactions = [];
        that.uniqueEvents = [];
        
        // Create transactions and events
        rawTransactions.forEach((rawTransaction) => {
            if (rawTransaction.trim().length > 0) {
                let textParts = rawTransaction.split(" ");

                let transactionEvent = '';
                for (var i = 1; i < textParts.length - 1; i++) {
                    transactionEvent += ' ' + textParts[i];
                }

                transactionEvent = transactionEvent.trim();

                let transaction = { transactionDate: textParts[0], event: transactionEvent, amount: textParts[textParts.length - 1] };
                that.transactions.push(transaction);

                if (that.uniqueEvents.indexOf(transactionEvent) < 0) {
                    that.uniqueEvents.push(transactionEvent);
                }
            }
        });
    
        // Get event tag lists from db 
        that.resourceHandler.list('tags').then((eventTags) => {
            that.eventTagLists = new Array<any>();
            (<Array<any>>eventTags).forEach((eventTagList) => {
                let tags = '';
                let uniqueEventIndex = that.uniqueEvents.indexOf(eventTagList.event);
                if (uniqueEventIndex >= 0) {
                    eventTagList.tags.forEach((tag) => {
                        tags += tags.length == 0 ? tag : ', ' + tag;
                    });

                    that.eventTagLists.push({ key: eventTagList.key, event: eventTagList.event, tags: tags });
                    that.uniqueEvents.splice(uniqueEventIndex, 1);
                }
            });
            
            // Add empty tag lists where event did not exist in db
            that.uniqueEvents.forEach((transactionEvent) => {
                that.eventTagLists.push({ event: transactionEvent, tags: '' });
            });
        });

        that.currentPhase = Phase.STEP2;
    }
    
    addTransactions() {
        this.transactions.forEach((transaction) => { this.transactionRef.push(transaction); });       
        this.currentPhase = Phase.STEP3;
    };

    addTags() {
        let tags = [];
        let events = [];
        this.eventTagLists.forEach((eventTagList) => {

            if (eventTagList.key && eventTagList.key.length > 0) {
                this.tagsRef.child(eventTagList.key).remove();
            }

            var eventTags = _.map(eventTagList.tags.split(','), (eventTag) => { return eventTag.trim() });
            eventTags = _.filter(eventTags, (eventTag) => { return eventTag && eventTag.length > 0 });

            if (eventTags && eventTags.length > 0) {
                this.tagsRef.push({ event: eventTagList.event, tags: eventTags });
            }
        });

        this.clearAll();
        
        //toastr.success('Added tags');
        this.currentPhase = Phase.STEP1;
    }

    isInPhase(phase) {
        return this.currentPhase == phase;
    }

    setActive(phase) {
        if (this.currentPhase != phase) {
            this.currentPhase = phase;
        }
    }

    clearAll() {
        this.transactions.length = 0;
        this.uniqueEvents.length = 0;
        this.eventTagLists.length = 0;
    }
}
