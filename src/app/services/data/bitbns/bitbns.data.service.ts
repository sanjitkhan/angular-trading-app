import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';

enum BITBNSAPI {
  V1 = "https://api.bitbns.com/api/trade/v1",
  V2 = "https://api.bitbns.com/api/trade/v2",
  ORDER = "https://bitbns.com/order"
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
