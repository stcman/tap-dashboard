import { Component, OnInit, AfterViewInit, input, signal, inject } from '@angular/core';
import { Chart, registerables, ChartType } from 'chart.js';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { DateTime } from 'luxon';
import {provideNativeDateAdapter} from '@angular/material/core';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [MatSelectModule, MatFormFieldModule, MatDatepickerModule, MatInputModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})

export class ChartComponent implements AfterViewInit {
  
  chartData :any = input('');
  selectedFilter = signal<string>('none');

  modifiedChartData: any;
  filterValues:any = [];
  
  periods: any = [
    {value: 'none', viewValue: 'None'},
    {value: 'last-m', viewValue: 'Last Month'},
    {value: 'last-q', viewValue: 'Last Quarter'},
    {value: 'last-y', viewValue: 'Last Year'},
    {value: 'custom', viewValue: 'Custom'}
  ];

  filterChanged(option: {value: string}){
    console.log(option.value)
    this.chart.destroy();
    this.filterValues = [];
    this.selectedFilter.set(option.value);
    this.buildChart(option.value);
  }

  startDateChange(event: any){
    console.log(event)
  }

  endDateChange(event: any){
    console.log(event)
  }

  constructor() {}

  chartId = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  
  chart: any;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.buildChart('none');
    }, 0);
  }


  buildChart(filterOption: string) {
    this.modifiedChartData = structuredClone(this.chartData());
    const canvas = document.getElementById(`Chart-${this.chartId}`) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    // Define chart options
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

    let data: any = this.modifiedChartData.testData[0];
    let chartType: any = this.modifiedChartData.chartType;

    if (data.hasDates){
      let arr: any = [];

      for(let i = 0; i < data.labels.length; i++){
        let el = data.labels[i]
        let dt = DateTime.now();
        let labelDate = DateTime.fromISO(el);

        if(filterOption === 'last-m'){
          let lastMonth = dt.minus({months: 1});
          labelDate > lastMonth.startOf('month') && labelDate < lastMonth.endOf('month') ? arr.push(`${labelDate.toFormat("MMM d")}`) : this.filterValues.push(i);
        }else if(filterOption === 'last-q'){
          let lastMonth = dt.minus({months: 3});
          labelDate > lastMonth.startOf('quarter') && labelDate < lastMonth.endOf('quarter') ? arr.push(`${labelDate.toFormat("MMM d")}`) : this.filterValues.push(i);
        }else if(filterOption === 'last-y'){
          let lastYear = dt.minus({months: 12});
          labelDate > lastYear.startOf('year') && labelDate < lastYear.endOf('year') ? arr.push(`${labelDate.toFormat("MMM d")}`) : this.filterValues.push(i);
        }else if(filterOption === 'custom'){
          arr.push(`${labelDate.toFormat("MMM d")}`);
        }else{
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
        }else if(chartType === 'bar'){
          dataset.backgroundColor = `rgb(${color})`;
          dataset.borderColor = `rgb(${color})`;
          dataset.borderRadius = 5;
          dataset.borderSkipped = false;
          dataset.fill = true;
        }else if(chartType === 'pie'){
          options.scales = {};
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