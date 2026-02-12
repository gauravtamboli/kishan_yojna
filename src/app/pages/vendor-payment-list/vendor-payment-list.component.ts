import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableModule } from 'primeng/table';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';

addIcons({
    'search-outline': searchOutline,
});

@Component({
    selector: 'app-vendor-payment-list',
    templateUrl: './vendor-payment-list.component.html',
    styleUrls: ['./vendor-payment-list.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, NgSelectModule, TableModule],
})
export class VendorPaymentListComponent implements OnInit {

    /** Year */
    selectedPaymentYear: string | null = null;
    year: number | undefined;
    rangeId!: number;

    /** Platform select */
    selectInterface: 'popover' | 'alert' = 'popover';

    /** Pagination */
    pageSize = 10;
    currentPage = 1;
    totalRecords = 0;
    totalPages = 0;

    paymentList: any[] = [];
    allAwedans: any[] = [];
    awedans: any[] = [];
    filteredAwedans: any[] = [];

    searchText: string = '';

    constructor(
        private platform: Platform,
        private router: Router,
        private api: ApiService,
        // private route: ActivatedRoute
    ) { }

    ngOnInit(): void {

        const navigationState = history.state;

        this.rangeId = navigationState.range_id;
        this.year = navigationState.year;
        console.log('Navigation State (Vendor List):', navigationState);
        this.onLoadPayment((this.year ?? 1).toString());
        this.setSelectInterface();
    }

    /** Detect Mobile vs Web */
    setSelectInterface() {
        if (this.platform.is('android') || this.platform.is('ios')) {
            this.selectInterface = 'alert';
        } else {
            this.selectInterface = 'popover';
        }
    }

    /** Load Payment Data */
    onLoadPayment(selectedPaymentYear: string) {
        this.currentPage = 1;

        this.api.VendorPaymentListData(selectedPaymentYear, this.rangeId).subscribe({
            next: (res: any) => {
                this.paymentList = res?.data || [];

                this.allAwedans = [...this.paymentList];
                this.awedans = [...this.allAwedans];

                this.totalRecords = this.awedans.length;
                this.totalPages = Math.ceil(this.totalRecords / this.pageSize);

                this.applyPagination();
            },
            error: () => {
                this.paymentList = [];
                this.allAwedans = [];
                this.awedans = [];
                this.filteredAwedans = [];
                this.totalRecords = 0;
                this.totalPages = 0;
            }
        });
    }

    /** AUTO SEARCH */
    applySearch() {
        const text = this.searchText?.toLowerCase().trim();

        if (!text) {
            this.awedans = [...this.allAwedans];
        } else {
            this.awedans = this.allAwedans.filter(item =>
                item.application_number?.toLowerCase().includes(text) ||
                item.hitgrahi_name?.toLowerCase().includes(text) ||
                item.father_name?.toLowerCase().includes(text) ||
                item.address?.toLowerCase().includes(text)
            );
        }

        this.currentPage = 1;
        this.totalRecords = this.awedans.length;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);

        this.applyPagination();
    }

    /** Pagination */
    applyPagination() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.filteredAwedans = this.awedans.slice(start, end);
    }

    getPageNumbers(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    goToPage(page: number) {
        this.currentPage = page;
        this.applyPagination();
    }

    goToPreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.applyPagination();
        }
    }

    goToNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.applyPagination();
        }
    }

    /** Amount */


    /** View Application */
    viewApplication(item: any) {
        // Navigate to VendorPaymentComponent
        this.router.navigate(['/vendor-payment'], {
            queryParams: {
                application_number: item.application_number,
                year: this.year
            }
        });
    }

}
