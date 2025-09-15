import { Component, OnInit } from '@angular/core';
import { TemperatureService } from '../../services/temperature-service';

@Component({
    selector: 'app-historical',
    standalone: false,
    templateUrl: './historical.html',
    styleUrls: ['./historical.css']
})
export class Historical implements OnInit {
    historicalData: any;
    loadingHistorical = false;

    startDate = '';
    endDate = '';
    maxDate = '';

    // Pagination
    currentPage = 1;
    pageSize = 10;

    constructor(private temperatureService: TemperatureService) {}

    ngOnInit(): void {
        const today = new Date();
        this.maxDate = today.toISOString().split('T')[0];

        // Default to last 7 days
        this.endDate = this.maxDate;
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 7);
        this.startDate = pastDate.toISOString().split('T')[0];

        // Automatically fetch historical data
        this.fetchHistorical();
    }

    onStartDateChange(): void {
        if (this.startDate > this.endDate) {
            this.endDate = this.startDate;
        }
        this.fetchHistorical(); // refetch automatically when date changes
    }

    onEndDateChange(): void {
        if (this.endDate < this.startDate) {
            this.startDate = this.endDate;
        }
        this.fetchHistorical(); // refetch automatically when date changes
    }

    fetchHistorical(): void {
        if (!this.startDate || !this.endDate) return;

        this.loadingHistorical = true;

        const { lat, lon } = this.temperatureService.getDefaultLocation();

        this.temperatureService.getHistorical(lat, lon, this.startDate, this.endDate).subscribe({
            next: (data) => {
                this.historicalData = data;
                this.currentPage = 1; // reset pagination
                this.loadingHistorical = false;
            },
            error: (err) => {
                console.error('Error fetching historical data', err);
                this.loadingHistorical = false;
            }
        });
    }

    get totalPages(): number {
        return this.historicalData
            ? Math.ceil(this.historicalData.data.temperature_2m.length / this.pageSize)
            : 0;
    }

    changePage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }
}
