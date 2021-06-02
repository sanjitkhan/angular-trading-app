import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { merge, of as observableOf } from 'rxjs';
import { startWith, switchMap, catchError, map } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface TableElement {
  name: string;
  price: string;
  price_prev: number;
  change: string;
  high: string;
  low: string;
  fluctuation: string;
  fluctuation_percent: string;
  volume: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  marketTableColumns = [
    {
      id: 'name',
      label: 'Name'
    },
    {
      id: 'price',
      label: 'Price'
    },
    {
      id: 'price_prev',
      label: 'Previous Window Price'
    },
    {
      id: 'change',
      label: 'Change %'
    },
    {
      id: 'high',
      label: 'High'
    },
    {
      id: 'low',
      label: 'Low'
    },
    {
      id: 'fluctuation',
      label: 'Fluctuation'
    },
    {
      id: 'fluctuation_percent',
      label: 'Fluctuation %'
    },
    {
      id: 'volume',
      label: 'Volume'
    }
    
  ];
  displayedColumns = this.marketTableColumns.map(({ id }) => id);
  dataSource: MatTableDataSource<TableElement> = new MatTableDataSource<TableElement>([]);
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatSort)
  sort: MatSort = new MatSort;

  constructor(private dataService: DataService) {}

  ngAfterViewInit() {
    merge()
    .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.dataService.getMarketTicker()
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
          .filter(({ quote_unit }: any) => quote_unit === 'inr')
          .map(({ base_unit, last, open, high, low, volume }: any) => ({
            name: base_unit,
            price: last,
            price_prev: open,
            change: ((Number(last)-open)/open*100).toFixed(4),
            fluctuation: (Number(high)-Number(low)).toFixed(4),
            fluctuation_percent: ((Number(high)-Number(low))/Number(low)*100).toFixed(4),
            high,
            low,
            volume
          }));
      })
    )
    .subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
