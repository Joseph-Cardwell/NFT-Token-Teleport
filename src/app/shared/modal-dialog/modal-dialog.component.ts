import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-modal-dialog',
    templateUrl: './modal-dialog.component.html',
    styleUrls: ['./modal-dialog.component.scss']
})
export class ModalDialogComponent implements OnInit
{

    @Input('modal-title')
    public title: string;

    @Output('close')
    public close: EventEmitter<void> = new EventEmitter();

    constructor() { }

    ngOnInit(): void
    {
    }
}
