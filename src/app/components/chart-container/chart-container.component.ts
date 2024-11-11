import { Component, signal, inject, OnInit } from '@angular/core';
import { ChartComponent } from '../chart/chart.component';
import { ChartsService } from '../../services/charts.service';

@Component({
  selector: 'app-chart-container',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './chart-container.component.html',
  styleUrl: './chart-container.component.scss'
})
export class ChartContainerComponent implements OnInit {
  chartType = signal<string>('line');
  chartService = inject(ChartsService);
  chartData = signal<any>({});

  ngOnInit(): void {
    this.chartService
    .getTestData()
    .subscribe((data) => {
      this.chartData.set(data);
    });
  }
}
