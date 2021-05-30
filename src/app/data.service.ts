import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {  throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

enum Endpoint {
  PLATFORM = '/platform'
}

enum BitbnsApi {
  V1 = "https://api.bitbns.com/api/trade/v1",
  V2 = "https://api.bitbns.com/api/trade/v2"
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private MAX_RETRY_LIMIT = 5;

  constructor(private httpClient: HttpClient) { }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  public callBitbnsApi(path: string) {
    const headers = {
      'X-BITBNS-APIKEY': '0A9AE4A5C2A644B34CEF80DFBB9ABD41'
    };
    return this.httpClient
      .get(path, { headers })
      .pipe(retry(this.MAX_RETRY_LIMIT), catchError(this.handleError));
  }

  // public APIs
  public getPlatformStatus(): Observable<Object> {
    return this.callBitbnsApi(BitbnsApi.V1 + Endpoint.PLATFORM + '/status');
  }
}
