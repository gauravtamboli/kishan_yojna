import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TableModule } from 'primeng/table';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, searchOutline, personOutline, locationOutline, leafOutline, documentTextOutline, checkmarkCircleOutline, alertCircleOutline, helpCircleOutline } from 'ionicons/icons';
import { Toast } from '@capacitor/toast';
// import Swal from 'sweetalert2';
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

    // Modal State
    isStatusModalOpen = false;
    statusType: 'success' | 'error' | 'question' = 'success';
    statusMessage = '';
    pendingAction: (() => void) | null = null;

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
            alertCircleOutline,
            helpCircleOutline
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
            this.statusType = 'error';
            this.statusMessage = 'कृपया सही संख्या दर्ज करें';
            this.isStatusModalOpen = true;
            return;
        }

        const totalGadda = parseInt(qty);

        this.statusType = 'question';
        this.statusMessage = `आवेदन ${applicationNumber} के लिए ${totalGadda} गड्ढों की संख्या दर्ज करें?`;
        this.pendingAction = () => this.submitGaddaPlant(applicationNumber, plantId, totalGadda);
        this.isStatusModalOpen = true;
    }

    private submitGaddaPlant(applicationNumber: string, plantId: number, totalGadda: number) {
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
                    this.statusType = 'success';
                    this.statusMessage = 'गड्ढों की संख्या सफलतापूर्वक दर्ज की गई';
                    this.isStatusModalOpen = true;
                } else {
                    this.statusType = 'error';
                    this.statusMessage = res?.response?.message || 'दर्ज करने में त्रुटि हुई';
                    this.isStatusModalOpen = true;
                }
                this.cdRef.detectChanges();
            },
            error: async (err) => {
                this.isLoading = false;
                console.error('Error adding gadda count:', err);
                this.statusType = 'error';
                this.statusMessage = 'सर्वर त्रुटि';
                this.isStatusModalOpen = true;
                this.cdRef.detectChanges();
            }
        });
    }

    confirmAction() {
        if (this.pendingAction) {
            const action = this.pendingAction;
            this.pendingAction = null;
            this.isStatusModalOpen = false;
            action();
        }
    }

    closeStatusModal() {
        this.isStatusModalOpen = false;
        this.pendingAction = null;
        if (this.statusType === 'success') {
            this.loadData(this.currentPage);
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
