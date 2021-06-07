import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';
import env from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class WazirxDataService {
  private basePath = env.baseUrl + "/wazirx-api";

  constructor(private dataService: DataService) { }

  public callWazirXApi(path: string) {
    return this.dataService.getData(path);
  }

  // public APIs
  public getMarketTicker(): Observable<Object> {
    return this.callWazirXApi(this.basePath + '/api/v2/tickers');
  }
}
