import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule, LoadingController, ToastController, Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { addIcons } from 'ionicons';
import {
    searchOutline, receiptOutline, peopleOutline,
    businessOutline, refreshOutline, listOutline,
    checkmarkCircleOutline, alertCircleOutline
} from 'ionicons/icons';

@Component({
    standalone: true,
    selector: 'app-create-bill',
    templateUrl: './create-bill.component.html',
    styleUrls: ['./create-bill.component.scss'],
    imports: [IonicModule, CommonModule, FormsModule, NgSelectModule, TableModule],
})
export class CreateBillComponent implements OnInit {

    // Selection data
    billTypes = [
        { id: 'vendor', name: 'Vendor (वेंडर)', icon: 'business-outline' },
        { id: 'hitgrahi', name: 'Hitgrahi (हितग्राही)', icon: 'people-outline' }
    ];
    selectedBillType: string = 'vendor';

    // Filters
    selectedYear: string = '1';
    years = [
        { id: '1', name: 'प्रथम वर्ष' },
        { id: '2', name: 'द्वितीय वर्ष' },
        { id: '3', name: 'तृतीय वर्ष' }
    ];

    rangeId!: number;
    officer_name: string = '';

    // Data
    allAwedans: any[] = [];
    filteredAwedans: any[] = [];
    selectedAwedans: any[] = [];

    // Search
    searchText: string = '';

    // Batch info
    batchRefNo: string = '';

    // UI State
    isLoading = false;
    isPageLoading = false;

    constructor(
        private location: Location,
        private api: ApiService,
        private cdRef: ChangeDetectorRef,
        private toastController: ToastController,
        private router: Router,
        private platform: Platform
    ) {
        addIcons({
            searchOutline, receiptOutline, peopleOutline,
            businessOutline, refreshOutline, listOutline,
            checkmarkCircleOutline, alertCircleOutline
        });
    }

    ngOnInit(): void {
        const storedData = sessionStorage.getItem('logined_officer_data');
        if (storedData) {
            try {
                const officer = JSON.parse(storedData);
                this.officer_name = officer?.officer_name || '';
                this.rangeId = officer?.rang_id || 0;
            } catch (e) {
                console.error('Error parsing officer data', e);
            }
        }

        this.loadData();
    }



    loadData() {
        if (!this.rangeId) {
            this.showToast('Range ID not found. Please login again.');
            return;
        }

        const paymentType = this.selectedBillType === 'vendor' ? 1 : 2;
        this.isPageLoading = true;
        this.api.paymentlistdata(this.selectedYear, this.rangeId, paymentType).subscribe({
            next: (res: any) => {
                console.log('Payment data loaded', res);
                this.allAwedans = res?.data || [];
                this.applyFilters();
                this.isPageLoading = false;
                this.cdRef.detectChanges();
            },
            error: (err) => {
                console.error('Error loading payment data', err);
                this.allAwedans = [];
                this.filteredAwedans = [];
                this.isPageLoading = false;
                this.cdRef.detectChanges();
            }
        });
    }

    applyFilters() {
        let result = [...this.allAwedans];

        // Search filter
        if (this.searchText.trim()) {
            const search = this.searchText.toLowerCase().trim();
            result = result.filter(item =>
                item.application_number?.toLowerCase().includes(search) ||
                item.hitgrahi_name?.toLowerCase().includes(search) ||
                item.father_name?.toLowerCase().includes(search) ||
                item.BillNumber?.toLowerCase().includes(search)
            );
        }

        this.filteredAwedans = result;
        this.selectedAwedans = []; // Reset selection when filters change
    }

    getAmount(item: any): number {
        return item.total_amount || 0;
    }

    getPlantNames(item: any): string {
        return item.plant_names || item.plant_name || 'Checked Plants';
    }

    calculateTotalSelectedAmount(): number {
        return this.selectedAwedans.reduce((sum, item) => sum + this.getAmount(item), 0);
    }

    async createBatchBill() {
        if (this.selectedAwedans.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Selection Required',
                text: 'Please select at least one application to create a batch bill.'
            });
            return;
        }

        const totalAmount = this.selectedAwedans.reduce((sum, item) => sum + this.getAmount(item), 0);

        const confirmResult = await Swal.fire({
            title: 'Batch Bill Construction',
            html: `
        <div style="text-align: left;">
          <p><strong>Reference No:</strong> ${this.batchRefNo}</p>
          <p><strong>Type:</strong> ${this.selectedBillType.toUpperCase()}</p>
          <p><strong>Total Items:</strong> ${this.selectedAwedans.length}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
          <hr>
          <p>Do you want to proceed with creating this batch bill?</p>
        </div>
      `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Create Batch',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2e7d32',
        });

        if (confirmResult.isConfirmed) {
            this.isLoading = true;

            // Simulate API call
            setTimeout(async () => {
                this.isLoading = false;
                await Swal.fire({
                    icon: 'success',
                    title: 'Batch Created',
                    text: `Batch Bill ${this.batchRefNo} has been created successfully for ${this.selectedAwedans.length} items.`
                });
                this.selectedAwedans = [];
                this.cdRef.detectChanges();
            }, 1500);
        }
    }

    private async showToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 2000,
            position: 'bottom',
            color: 'dark'
        });
        await toast.present();
    }

    goBack() {
        this.location.back();
    }
}
