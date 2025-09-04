// src/app/services/temperature.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TemperatureService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // GET real-time temperature
  getRealtime(latitude: number, longitude: number): Observable<any> {
    const params = new HttpParams()
      .set('latitude', latitude)
      .set('longitude', longitude);
    return this.http.get(`${this.apiUrl}/realtime`, { params });
  }

  // GET historical temperature
  getHistorical(latitude: number, longitude: number, startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('latitude', latitude)
      .set('longitude', longitude)
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.http.get(`${this.apiUrl}/historical`, { params });
  }

  // GET combined real-time + historical
  getCombined(latitude: number, longitude: number, startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('latitude', latitude)
      .set('longitude', longitude)
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.http.get(`${this.apiUrl}/combined`, { params });
  }

  // ⚽ Default location - Madrid (Real Madrid's home city)
  getDefaultLocation() {
    return {
      lat: 36.8340,   // Latitude for Almería
      lon: -2.4637,   // Longitude for Almería
      name: 'Almería, Spain 🇪🇸'
    };
  }
}
