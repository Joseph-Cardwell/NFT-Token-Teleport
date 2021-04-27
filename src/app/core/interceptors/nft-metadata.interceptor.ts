import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class NftMetadataInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    if (!request.url.includes('/api/bridge/get-nftoken-metadata')) return next.handle(request);

    return next.handle(request).pipe(tap(_response => 
      {
        if (!(_response instanceof HttpResponse)) return;

        if (_response.status !== 200) return;
      }))
  }
}
