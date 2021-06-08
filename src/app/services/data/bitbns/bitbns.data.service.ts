import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import env from '../../../../environments/environment'

const BITBNSAPI = {
  V1: env.baseUrl + "/bitbns-api-v1",
  V2: env.baseUrl + "/bitbns-api-v2",
  ORDER: env.baseUrl + "/bitbns-api-order"
}

@Injectable({
  providedIn: 'root'
})
export class BitbnsDataService {
  constructor(private dataService: DataService) { }

  public callBitbnsApi(path: string) {
    return this.dataService.getData(path);
  }

  // public APIs
  public getMarketTicker(): Observable<Object> {
    return this.callBitbnsApi(BITBNSAPI.ORDER + '/fetchTickers');
  }
}
