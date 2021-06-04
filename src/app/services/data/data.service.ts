import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {  throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export enum DataServiceEnum {
  WAZIRX = "wazirx",
  BITBNS = "bitbns"
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

  public getData(path: string) {
    return this.httpClient
      .get(path)
      .pipe(retry(this.MAX_RETRY_LIMIT), catchError(this.handleError));
  }
}
