import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {  throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private MAX_RETRY_LIMIT = 5;
  private wazirxApi = "https://api.wazirx.com";

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

  public callWazirXApi(path: string) {
    return this.httpClient
      .get(path)
      .pipe(retry(this.MAX_RETRY_LIMIT), catchError(this.handleError));
  }

  // public APIs
  public getMarketTicker(): Observable<Object> {
    return this.callWazirXApi(this.wazirxApi + '/api/v2/tickers');
  }
}
