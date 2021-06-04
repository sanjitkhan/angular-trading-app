import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { merge, of as observableOf } from 'rxjs';
import { startWith, switchMap, catchError, map } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { WazirxDataService } from '../services/data/wazirx/wazirx.data.service';
import { BitbnsDataService } from '../services/data/bitbns/bitbns.data.service';
import { DataServiceEnum } from '../services/data/data.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { convertToINR, convertToSpacedNumeral } from '../utils/utils';

import WAZIRX_LOGO from '!!raw-loader!./../../assets/svg/wazirx.svg';
import BITBNS_LOGO from '!!raw-loader!./../../assets/svg/bitbns.svg';

interface DataPoints {
  // showing raw from the data
  name: string;
  price: string;
  high: string;
  low: string;
  volume: string;

  //required to calculate
  open: string; // market open price
  last: string; // last traded price
}

interface TableElement extends Pick<DataPoints, 
  'name'  |
  'price' |
  'high'  |
  'low'   |
  'volume'> {
  //calculated
  change: string;
  fluctuation: string;
  cash_flow: string;
}

interface MarketTableColumn {
  id: keyof TableElement;
  label: string;
}

interface MarketObject {
  dataService: WazirxDataService | BitbnsDataService,
  dataPoints: DataPoints,
  nameFn?: Function,
  volumeFn?: Function,
  filterFn: (value: any, index: number, array: any[]) => any
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  sort: MatSort;
  displayedColumns: (keyof TableElement)[];
  dataSource: MatTableDataSource<TableElement>;
  isLoadingResults: boolean;
  isRateLimitReached: boolean;
  selectedMarket: DataServiceEnum;
  marketObject: MarketObject;
  marketTableColumns: MarketTableColumn[];
  DataServiceEnum: typeof DataServiceEnum;

  constructor(private wazirxDataService: WazirxDataService, 
    private bitbnsDataService: BitbnsDataService,
    iconRegistry: MatIconRegistry, 
    sanitizer: DomSanitizer) {
      this.DataServiceEnum = DataServiceEnum;
      this.selectedMarket = DataServiceEnum.WAZIRX;
      this.marketObject = this.getMarket(this.selectedMarket);
      this.isLoadingResults = true;
      this.isRateLimitReached = false;
      this.marketTableColumns = [
        { id: 'name', label: 'Name' },
        { id: 'price', label: 'Price' },
        { id: 'change', label: 'Change %' },
        { id: 'high', label: 'High' },
        { id: 'low', label: 'Low' },
        { id: 'fluctuation', label: 'Fluctuation %' },
        { id: 'volume', label: 'Volume' },
        { id: 'cash_flow', label: 'Cash Flow' }
      ];
      this.displayedColumns = this.marketTableColumns.map(({ id }) => id);
      this.dataSource = new MatTableDataSource<TableElement>([]);
      this.sort = new MatSort;
      iconRegistry.addSvgIconLiteral('wazirx-logo', sanitizer.bypassSecurityTrustHtml(WAZIRX_LOGO));
      iconRegistry.addSvgIconLiteral('bitbns-logo', sanitizer.bypassSecurityTrustHtml(BITBNS_LOGO));
  }

  @ViewChild(MatSort, { static: false }) set content(content: MatSort) {
    this.sort = content;
    if (this.sort){
       this.dataSource.sort = this.sort;
    }
  }

  wazirxMarketObject: MarketObject = {
    dataService: this.wazirxDataService,
    dataPoints: {
      name: 'base_unit',
      price: 'last',
      open: 'open',
      last: 'last',
      high: 'high',
      low: 'low',
      volume: 'volume'
    },
    filterFn: ({ quote_unit }: any) => quote_unit === 'inr'
  };
  
  bitbnsMarketObject: MarketObject = {
    dataService: this.bitbnsDataService,
    dataPoints: {
      name: 'symbol',
      price: 'last',
      open: 'open',
      last: 'last',
      high: 'high',
      low: 'low',
      volume: 'info'
    },
    volumeFn: ({ volume: { volume }}: any) => volume,
    nameFn: (nameString: any) => nameString?.length < 4 ? nameString : nameString.slice(0,-4) || '',
    filterFn: ({ symbol }: any) => symbol.slice(-3) === "INR"
  };

  getMarket(selectedMarket: DataServiceEnum): MarketObject {
    switch(selectedMarket) {
      case DataServiceEnum.BITBNS: return this.bitbnsMarketObject;
      case DataServiceEnum.WAZIRX:
      default: return this.wazirxMarketObject;
    }
  }

  changeMarket({ value }: MatButtonToggleChange) {
    this.marketObject = this.getMarket(value);
    this.getMarketData();
  }

  getMarketData() {
    merge()
    .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.marketObject.dataService.getMarketTicker()
        .pipe(catchError(() => observableOf(null)));
      }),
      map(data => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        this.isRateLimitReached = data === null;

        if (data === null) {
          return [];
        }
        
        return Object.values(data)
          .filter(this.marketObject.filterFn) // filtering out currencies other than INR
          .filter((data: any) => { // filtering out invalid data
            const open = Number(data[this.marketObject.dataPoints.open]);
            const low = Number(data[this.marketObject.dataPoints.low]);
            return !(
              open === 0 ||
              low === 0
            )
          })
          .map((data: any) => {
            const nameString = data[this.marketObject.dataPoints.name];
            const name = this.marketObject.nameFn ? this.marketObject.nameFn(nameString) : nameString;
            const price = data[this.marketObject.dataPoints.price];
            const open = data[this.marketObject.dataPoints.open];
            const last = data[this.marketObject.dataPoints.last];
            const high = data[this.marketObject.dataPoints.high];
            const low = data[this.marketObject.dataPoints.low];
            const volumeObject = data[this.marketObject.dataPoints.volume];
            const volume = this.marketObject.volumeFn ? this.marketObject.volumeFn(volumeObject) : volumeObject;
            return {
              name,
              price: convertToINR(price),
              change: ((Number(last)-Number(open))/Number(open)*100).toFixed(4),
              high: convertToINR(high),
              low: convertToINR(low),
              fluctuation: ((Number(high)-Number(low))/Number(low)*100).toFixed(4),
              volume: convertToSpacedNumeral(volume),
              cash_flow: convertToINR((Number(volume)*Number(price)).toFixed(4))
            }
          });
      })
    )
    .subscribe(data => {
      this.dataSource.data = data;
      // this.sort = new MatSort;
      // this.dataSource.sort = this.sort;
    });
  }
  ngAfterViewInit() {
    this.getMarketData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
