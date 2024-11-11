import { Component, OnInit, AfterViewInit, input, signal, inject } from '@angular/core';
import { Chart, registerables, ChartType } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})

export class ChartComponent implements AfterViewInit {
  
  chartData:any = input('');

  constructor() {}

  chartId = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  
  chart: any;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.buildChart();
    }, 0);
  }


  buildChart() {
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

    let data: any = this.chartData().testData[0];
    let chartType: any = this.chartData().chartType;

    if (data.hasDates){
      let arr: any = [];
      data.labels.forEach((el: any) => {
        let date = new Date(el);
        let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
        let month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
        let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
        arr.push(`${month} ${day}`);
      });
      data.labels = arr;
    }

    if (ctx) {
      for(let i = 0; i < data.datasets.length; i++){ // loop over datasets
        let R = Math.floor(Math.random() * (255 - 1)) + 1;
        let B = Math.floor(Math.random() * (255 - 1)) + 1;
        let G = Math.floor(Math.random() * (255 - 1)) + 1;

        if(chartType === 'line'){
          let dataset = data.datasets[i];
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, `rgba(${R}, ${B}, ${G}, 0.5)`);
          gradient.addColorStop(1, `rgba(${R}, ${B}, ${G}, 0)`);
          dataset.backgroundColor = gradient;
          dataset.borderColor = `rgba(${R}, ${B}, ${G}, 0.5)`;
          dataset.borderWidth = 2;
          dataset.tension = 0.05;
          dataset.pointRadius = 0;
          dataset.fill = true;
        }else if(chartType === 'bar'){
          let dataset = data.datasets[i];
          dataset.backgroundColor = `rgb(${R}, ${B}, ${G})`;
          dataset.borderColor = `rgb(${R}, ${B}, ${G})`;
          dataset.borderRadius = 5;
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