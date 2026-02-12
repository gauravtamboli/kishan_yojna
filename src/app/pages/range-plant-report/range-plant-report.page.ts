import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TableModule } from 'primeng/table';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, searchOutline, personOutline, locationOutline, leafOutline, documentTextOutline, checkmarkCircleOutline, refreshOutline, businessOutline, mapOutline } from 'ionicons/icons';
import { Toast } from '@capacitor/toast';
import { RangeReportResponseModel, GetRangeReportResponse } from '../number-of-pit/PitAwedanModels';

@Component({
    selector: 'app-range-plant-report',
    templateUrl: './range-plant-report.page.html',
    styleUrls: ['./range-plant-report.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, TableModule]
})
export class RangePlantReportPage implements OnInit {

    isLoading: boolean = false;
    loadingMessage: string = 'रिपोर्ट लोड की जा रही है...';
    searchText: string = '';

    allData: RangeReportResponseModel[] = [];
    filteredData: RangeReportResponseModel[] = [];

    // Pagination
    currentPage: number = 1;
    pageSize: number = 10;
    totalRecords: number = 0;
    totalPages: number = 0;

    constructor(
        private apiService: ApiService,
        private router: Router,
        private cdRef: ChangeDetectorRef
    ) {
        addIcons({
            chevronBackOutline,
            chevronForwardOutline,
            searchOutline,
            personOutline,
            locationOutline,
            leafOutline,
            documentTextOutline,
            checkmarkCircleOutline,
            refreshOutline,
            businessOutline,
            mapOutline
        });
    }

    ngOnInit() {
        this.loadData();
    }

    async loadData(page: number = 1) {
        this.isLoading = true;
        this.currentPage = page;

        const officerData = JSON.parse(sessionStorage.getItem('logined_officer_data') || '{}');
        const rangeId = officerData.rang_id || 0;

        if (!rangeId) {
            await Toast.show({ text: 'रेंज आईडी नहीं मिली', duration: 'long' });
            this.isLoading = false;
            return;
        }

        this.apiService.getGaddaplantKisanAwedanListByRange(rangeId, this.currentPage, this.pageSize)
            .subscribe({
                next: (response: GetRangeReportResponse) => {

                    console.log('API Response:', response);
                    if (response && response.data) {
                        this.allData = response.data;
                        this.totalRecords = response.totalCount || 0;
                        this.totalPages = response.totalPages || 0;
                        this.filteredData = [...this.allData];
                    } else {
                        this.allData = [];
                        this.filteredData = [];
                        this.totalRecords = 0;
                        this.totalPages = 0;
                    }
                    this.isLoading = false;
                    this.cdRef.detectChanges();
                },
                error: async (err) => {
                    console.error('Error loading report data:', err);
                    await Toast.show({ text: 'रिपोर्ट लोड करने में त्रुटि हुई', duration: 'long' });
                    this.isLoading = false;
                    this.cdRef.detectChanges();
                }
            });
    }

    onSearch() {
        if (!this.searchText.trim()) {
            this.filteredData = [...this.allData];
        } else {
            const search = this.searchText.toLowerCase().trim();
            this.filteredData = this.allData.filter(item =>
                item.ApplicationNumber?.toLowerCase().includes(search) ||
                item.HitgrahiName?.toLowerCase().includes(search) ||
                item.FatherName?.toLowerCase().includes(search) ||
                item.VillageCityName?.toLowerCase().includes(search) ||
                item.GramPanchayatNagar?.toLowerCase().includes(search)
            );
        }
    }

    onSearchEnter() {
        this.onSearch();
    }

    // Pagination helpers
    goToPage(page: number) {
        if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
            this.loadData(page);
        }
    }

    goToPreviousPage() {
        if (this.currentPage > 1) {
            this.loadData(this.currentPage - 1);
        }
    }

    goToNextPage() {
        if (this.currentPage < this.totalPages) {
            this.loadData(this.currentPage + 1);
        }
    }

    getPageNumbers(): number[] {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }
}
