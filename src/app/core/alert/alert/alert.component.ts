import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit
{

    public title: string;
    public message: string;
    public params: Record<string, string>;
    public visible: boolean = false;

    constructor(
        private alertService: AlertService
    ) { }

    ngOnInit(): void
    {
        this.alertService.messages.subscribe((_data) =>
        {
            if (Boolean(_data.type) && _data.type !== 'default') return;
            
            this.title = _data.title;
            this.message = _data.message;
            this.params = _data.params || {};
            this.show();
        });
    }

    public show()
    {
        this.visible = true;
    }

    public hide(_event?)
    { 
        this.visible = false;
        this.params = {};
        this.message = '';
        this.title = '';
    }
}
