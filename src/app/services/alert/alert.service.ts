import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Platform } from '../nft-observer/nft-observer.service';

export type AlertMessage = {
    title: string,
    message: string,
    type?: 'network-change' | 'default',
    network_data?: {platform: Platform}
    params?: Record<string, string>
}

@Injectable({
    providedIn: 'root'
})
export class AlertService
{

    private alertStream: Subject<AlertMessage> = new Subject()

    constructor() { }

    public show(_alert: AlertMessage)
    {
        this.alertStream.next(_alert);
    }

    get messages(): Observable<AlertMessage>
    {
        return this.alertStream.asObservable();
    }
}
