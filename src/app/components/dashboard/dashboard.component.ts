import { Component } from '@angular/core';
import { ChartContainerComponent } from '../chart-container/chart-container.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartContainerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
