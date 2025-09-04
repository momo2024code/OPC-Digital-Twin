import { Component, OnInit } from '@angular/core';
import { TemperatureService } from '../../services/temperature-service';

@Component({
  selector: 'app-temperature',
  standalone: false,
  templateUrl: './temperature.html',
  styleUrls: ['./temperature.css']  // fixed typo here from 'styleUrl' to 'styleUrls'
})
export class Temperature implements OnInit {
  realtimeData: any;
  loadingRealtime = true;

  constructor(private temperatureService: TemperatureService) {}

  ngOnInit(): void {
    const latitude = 36.83408;  // Madrid latitude
    const longitude = -2.4637; // Madrid longitude

    this.temperatureService.getRealtime(latitude, longitude).subscribe({
      next: (data) => {
        this.realtimeData = data;
        this.loadingRealtime = false;
      },
      error: (err) => {
        console.error('Error fetching real-time data', err);
        this.loadingRealtime = false;
      }
    });
  }
}
