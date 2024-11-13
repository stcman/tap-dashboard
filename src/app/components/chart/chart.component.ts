import { Component, AfterViewInit, input, signal } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { DateTime } from 'luxon';
import {provideNativeDateAdapter} from '@angular/material/core';
import { periods } from '../../model/periods.type';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(...registerables);
Chart.register(zoomPlugin);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [MatSelectModule, MatFormFieldModule, MatDatepickerModule, MatInputModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})

export class ChartComponent implements AfterViewInit {
  
  chartId: string = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  selectedFilter = signal<string>('none');
  filterValues: number[] = [];
  dateRange: any = {};
  chart: any;
  chartData: any = input('');
  modifiedChartData: any;
  periods: periods[] = [
    {value: 'none', viewValue: 'None'},
    {value: 'last-m', viewValue: 'Last Month'},
    {value: 'last-q', viewValue: 'Last Quarter'},
    {value: 'last-y', viewValue: 'Last Year'},
    {value: 'custom', viewValue: 'Custom'}
  ];
  testDataIndex: number = 0;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.buildChart('none');
    }, 0);
  }

  filterChanged(option: {value: string}){
    console.log(option.value)
    this.chart.destroy();
    this.filterValues = [];
    this.selectedFilter.set(option.value);
    this.buildChart(option.value);
  }

  handleDateRangeChange(event: any){
    this.filterValues = [];
    let date = DateTime.fromJSDate(event.value);
    let type = event.targetElement.dataset.selection;
    if(type === 'start'){
      this.dateRange.startText = date.toFormat("MMM d");
      this.dateRange.startDate = date;
    }else{
      this.dateRange.endText = date.toFormat("MMM d");
      this.dateRange.endDate = date;
      this.chart.destroy();
      this.buildChart('custom');
    }
  }

  getTotals(dataset: any, chartType: string){
    let sum = 0;
    let avg = 0;
    let value;

    let USDollar = new Intl.NumberFormat('en-US', {
      currency: 'USD',
      maximumFractionDigits: 0, 
      minimumFractionDigits: 0, 
    });

    if(chartType === 'scatter'){
      sum = dataset.data.reduce((partialSum: any, b: any) => partialSum + b.y, 0);
      avg = (sum / dataset.data.length) || 0;

      value = avg;
    }else{
      sum = dataset.data.reduce((partialSum: any, b: any) => partialSum + b, 0);
      avg = (sum / dataset.data.length) || 0;

      value = USDollar.format(avg);
    }

    dataset.value = value;
  }


  buildChart(filterOption: string) {
    this.modifiedChartData = structuredClone(this.chartData());
    const canvas = document.getElementById(`Chart-${this.chartId}`) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    const options: any = {
      skipNull: true,
      responsive: true,
      scales: {
        y: {
          grid: {
            display: true
          },
          border: {
            dash: [6,4],
            display: false
          },
          ticks: {
            callback: (value: any) => `$${value.toLocaleString()}`, // Format y-axis labels as currency
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      layout: {
        padding: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    };

    let data: any = this.modifiedChartData.testData[this.testDataIndex];
    let chartType: any = this.modifiedChartData.chartType;
    
    if (data.hasDates){
      let arr: any = [];

      for(let i = 0; i < data.labels.length; i++){
        let el = data.labels[i];
        let dt = DateTime.now();
        let labelDate = DateTime.fromISO(el);

        if(filterOption === 'last-m'){
          let lastMonth = dt.minus({months: 1});
          let start = lastMonth.startOf('month');
          let end = lastMonth.endOf('month');

          labelDate > start && labelDate < end ? arr.push(`${labelDate.toFormat("MMM d")}`) : this.filterValues.push(i);
          this.modifiedChartData.testData[this.testDataIndex].range.start = start.toFormat("MMM d");
          this.modifiedChartData.testData[this.testDataIndex].range.end = end.toFormat("MMM d");
        }else if(filterOption === 'last-q'){
          let lastMonth = dt.minus({months: 3});
          let start = lastMonth.startOf('quarter');
          let end = lastMonth.endOf('quarter');

          labelDate > lastMonth.startOf('quarter') && labelDate < lastMonth.endOf('quarter') ? arr.push(`${labelDate.toFormat("MMM d")}`) : this.filterValues.push(i);
          this.modifiedChartData.testData[this.testDataIndex].range.start = start.toFormat("MMM d");
          this.modifiedChartData.testData[this.testDataIndex].range.end = end.toFormat("MMM d");
        }else if(filterOption === 'last-y'){
          let lastYear = dt.minus({months: 12});
          let start = lastYear.startOf('year');
          let end = lastYear.endOf('year');

          labelDate > lastYear.startOf('year') && labelDate < lastYear.endOf('year') ? arr.push(`${labelDate.toFormat("MMM d")}`) : this.filterValues.push(i);
          this.modifiedChartData.testData[this.testDataIndex].range.start = start.toFormat("MMM d");
          this.modifiedChartData.testData[this.testDataIndex].range.end = end.toFormat("MMM d");
        }else if(filterOption === 'custom'){
          let start = this.dateRange.startDate;
          let end = this.dateRange.endDate;
          
          if(start & end){
            labelDate > start && labelDate < end ? arr.push(`${labelDate.toFormat("MMM d")}`) : this.filterValues.push(i);
            this.modifiedChartData.testData[this.testDataIndex].range.start = this.dateRange.startText;
            this.modifiedChartData.testData[this.testDataIndex].range.end = this.dateRange.endText;
          }
        }else{
          let start = DateTime.fromISO(data.labels[0]);
          let end = DateTime.fromISO(data.labels[data.labels.length-1]);
          this.modifiedChartData.testData[this.testDataIndex].range.start = start.toFormat("MMM d");
          this.modifiedChartData.testData[this.testDataIndex].range.end = end.toFormat("MMM d");
          arr.push(`${labelDate.toFormat("MMM d")}`);
        }

      };
      
      data.labels = arr;
    }

    if (ctx) {
      for(const dataset of data.datasets){ // loop over datasets
        let R = Math.floor(Math.random() * (255 - 1)) + 1;
        let B = Math.floor(Math.random() * (255 - 1)) + 1;
        let G = Math.floor(Math.random() * (255 - 1)) + 1;

        let color = dataset?.color ? `${dataset.color}` : `${R}, ${B}, ${G}`;

        dataset.data = dataset.data.filter((el: any, idx: any) => {
          return !this?.filterValues?.includes(idx);
        })

        this.getTotals(dataset, chartType);

        if(chartType === 'line'){
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, `rgba(${color}, 0.5)`);
          gradient.addColorStop(1, `rgba(${color}, 0)`);
          dataset.backgroundColor = gradient;
          dataset.borderColor = `rgba(${color}, 1)`;
          dataset.borderWidth = 2;
          dataset.tension = 0.05;
          dataset.pointRadius = 0;
          dataset.fill = true;
          options.plugins.zoom = {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            }
          }
        }else if(chartType === 'bar'){
          dataset.backgroundColor = `rgb(${color})`;
          dataset.borderColor = `rgb(${color})`;
          dataset.borderRadius = 5;
          dataset.borderSkipped = false;
          dataset.fill = true;
        }else if(chartType === 'scatter'){
          options.scales.x.ticks = {
            callback: (value: any) => `${DateTime.fromMillis(value).toFormat("MMM d")}`, // Format y-axis labels as currency
          }
        }
      }

      // Initialize the chart
      this.chart = new Chart(ctx, {
        type: chartType,
        data: data,
        options: options
      });
    }
  }
}