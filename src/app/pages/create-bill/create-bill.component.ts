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
    checkmarkCircleOutline, alertCircleOutline,
    calendarOutline,
    moon, sunny
} from 'ionicons/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { firstValueFrom } from 'rxjs';

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
    description: string = '';

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
            checkmarkCircleOutline, alertCircleOutline,
            calendarOutline,
            moon, sunny
        });
    }

    isDarkMode = false;
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
    }

    private applyTheme() {
        const isDarkClass = 'ion-palette-dark';
        if (this.isDarkMode) {
            document.documentElement.classList.add(isDarkClass);
            document.body.classList.add(isDarkClass);
        } else {
            document.documentElement.classList.remove(isDarkClass);
            document.body.classList.remove(isDarkClass);
        }
    }

    private restoreSavedTheme() {
        const savedTheme = localStorage.getItem('theme-mode');
        this.isDarkMode = savedTheme === 'dark';
        this.applyTheme();
    }

    ngOnInit(): void {
        this.restoreSavedTheme();
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

        // this.loadData();
    }



    // loadData() {
    //     if (!this.rangeId) {
    //         this.showToast('Range ID not found. Please login again.');
    //         return;
    //     }

    //     const paymentType = this.selectedBillType === 'vendor' ? 1 : 2;
    //     this.isPageLoading = true;

    //     this.api.paymentlistdata(this.selectedYear, this.rangeId, paymentType).subscribe({
    //         next: (res: any) => {
    //             console.log('Payment data loaded', res);
    //             this.allAwedans = res?.data || [];
    //             this.applyFilters();
    //             this.isPageLoading = false;
    //             this.cdRef.detectChanges();
    //         },
    //         error: (err) => {
    //             console.error('Error loading payment data', err);
    //             this.allAwedans = [];
    //             this.filteredAwedans = [];
    //             this.isPageLoading = false;
    //             this.cdRef.detectChanges();
    //         }
    //     });
    // }

    loadData() {

        if (!this.rangeId) {
            this.showToast('Range ID not found. Please login again.');
            return;
        }

        const paymentType = this.selectedBillType === 'vendor' ? 1 : 2;

        this.isPageLoading = true;

        this.api.paymentlistdata(this.selectedYear, this.rangeId, paymentType)
            .subscribe({
                next: (res: any) => {

                    console.log('Payment data loaded', res);

                    this.allAwedans = res?.data ?? [];

                    this.applyFilters();

                },
                error: (err) => {

                    console.error('Error loading payment data', err);

                    this.allAwedans = [];
                    this.filteredAwedans = [];

                    this.showToast('Failed to load payment list');

                },
                complete: () => {

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

    selectAllFiltered(event?: any) {
        const isChecked = event ? event.detail.checked : (this.selectedAwedans.length !== this.filteredAwedans.length);

        if (!isChecked) {
            this.selectedAwedans = [];
        } else {
            this.selectedAwedans = [...this.filteredAwedans];
        }
    }

    isSelected(item: any): boolean {
        return this.selectedAwedans.some(s => s.application_number === item.application_number);
    }

    toggleSelection(item: any, event: any) {
        if (event.detail.checked) {
            if (!this.isSelected(item)) {
                this.selectedAwedans = [...this.selectedAwedans, item];
            }
        } else {
            this.selectedAwedans = this.selectedAwedans.filter(s => s.application_number !== item.application_number);
        }
    }

    getAmount(item: any): number {
        return Number(item.total_amount || 0);
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

        const totalAmount = this.calculateTotalSelectedAmount();
        this.batchRefNo = 'BCH-' + Math.floor(Math.random() * 900000 + 100000);

        const confirmResult = await Swal.fire({
            title: 'Batch Bill Construction',
            html: `
            <div style="text-align: left;">
            <p><strong>Ref No:</strong> ${this.batchRefNo}</p>
            <p><strong>Description:</strong> ${this.description || 'N/A'}</p>
            <p><strong>Total Items:</strong> ${this.selectedAwedans.length}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
            <hr>
            <p>Do you want to proceed with creating and downloading this batch bill?</p>
            </div>
        `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Download Batch',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2e7d32',
        });

        if (confirmResult.isConfirmed) {

            this.isLoading = true;

            try {

                // 🔹 CALL API ONCE WITH ALL SELECTED RECORDS
                const payload = this.selectedAwedans.map(item => ({
                    paymentType: this.selectedBillType === 'vendor' ? 1 : 2,
                    account_no: String(item.account_no || ''),
                    address: String(item.address || ''),
                    application_number: String(item.application_number || ''),
                    bank_name: String(item.bank_name || ''),
                    billNumber: String(item.BillNumber || ''),
                    father_name: String(item.father_name || ''),
                    hitgrahi_name: String(item.hitgrahi_name || ''),
                    ifsc_code: String(item.ifsc_code || ''),
                    mobile_no: String(item.mobile_no || ''),
                    total_amount: this.getAmount(item),
                    fin_year: String(this.selectedYear || ''),
                    createby: String(this.rangeId || '')
                }));

                await firstValueFrom(this.api.SavePaymentDetails(payload));

                // 🔹 Prepare Excel
                const exportData = this.selectedAwedans.map(item => ({
                    'Application Number': item.application_number,
                    'Bill Number': item.BillNumber,
                    'Hitgrahi Name': item.hitgrahi_name,
                    'Father Name': item.father_name,
                    'Amount': this.getAmount(item),
                    'Batch Reference': this.batchRefNo,
                    'Batch Description': this.description
                }));

                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Batch Bill');

                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

                const data: Blob = new Blob([excelBuffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });

                saveAs(data, `Batch_Bill_${this.batchRefNo}.xlsx`);

                this.isLoading = false;

                await Swal.fire({
                    icon: 'success',
                    title: 'Batch Created',
                    text: `Batch Bill ${this.batchRefNo} has been created and downloaded successfully.`
                });

                this.selectedAwedans = [];
                this.description = '';
                this.loadData();
                this.cdRef.detectChanges();

            } catch (error) {

                console.error('Error creating batch bill:', error);

                this.isLoading = false;

                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while saving payment data.'
                });
            }
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
