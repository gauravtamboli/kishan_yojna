import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TableModule } from 'primeng/table';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, searchOutline, personOutline, locationOutline, leafOutline, documentTextOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Toast } from '@capacitor/toast';
import Swal from 'sweetalert2';
import { RangeReportResponseModel, GetRangeReportResponse } from './PitAwedanModels';

@Component({
    selector: 'app-number-of-pit',
    templateUrl: './number-of-pit.page.html',
    styleUrls: ['./number-of-pit.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, TableModule]
})
export class NumberOfPitPage implements OnInit {

    isLoading: boolean = false;
    loadingMessage: string = 'लोड किया जा रहा है...';
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
            checkmarkCircleOutline
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

        this.apiService.getPitKisanAwedanListByRange(rangeId, this.currentPage, this.pageSize)
            .subscribe({
                next: (response: GetRangeReportResponse) => {
                    if (response && response.data) {
                        this.allData = response.data;
                        this.totalRecords = response.totalCount || 0;
                        this.totalPages = response.totalPages || 0;
                        this.filteredData = [...this.allData];

                        console.log('loded data', this.allData);

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
                    console.error('Error loading gadda data:', err);
                    await Toast.show({ text: 'डेटा लोड करने में त्रुटि हुई', duration: 'long' });
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

    async addGaddaRow(applicationNumber: string, plantId: number, qty: any) {

        // Basic validation
        if (!qty || qty <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'अमान्य संख्या',
                text: 'कृपया सही संख्या दर्ज करें',
                confirmButtonText: 'ठीक है'
            });
            return;
        }

        const totalGadda = parseInt(qty);

        const result = await Swal.fire({
            title: 'क्या आप सुनिश्चित हैं?',
            text: `आवेदन ${applicationNumber} के लिए ${totalGadda} गड्ढों की संख्या दर्ज करें?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'हाँ, दर्ज करें',
            cancelButtonText: 'नहीं',
            heightAuto: false
        });

        if (result.isConfirmed) {
            this.isLoading = true;
            this.loadingMessage = 'दर्ज किया जा रहा है...';

            const payload = {
                applicationNumber: applicationNumber,
                plantId: plantId,
                totalGadda: totalGadda
            };

            this.apiService.addGaddaPlant(payload).subscribe({
                next: async (res) => {
                    this.isLoading = false;
                    if (res && res.response && res.response.code === 200) {
                        await Swal.fire({
                            title: 'सफलता',
                            text: 'गड्ढों की संख्या सफलतापूर्वक दर्ज की गई',
                            icon: 'success',
                            heightAuto: false
                        });
                        this.loadData(this.currentPage);
                    } else {
                        const msg = res?.response?.message || 'दर्ज करने में त्रुटि हुई';
                        await Toast.show({ text: msg, duration: 'long' });
                    }
                    this.cdRef.detectChanges();
                },
                error: async (err) => {
                    this.isLoading = false;
                    console.error('Error adding gadda count:', err);
                    await Toast.show({ text: 'सर्वर त्रुटि', duration: 'long' });
                    this.cdRef.detectChanges();
                }
            });
        }
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
