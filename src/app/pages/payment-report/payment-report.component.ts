import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableModule } from 'primeng/table';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchOutline, walletOutline, alertCircleOutline, checkmarkCircleOutline, closeCircleOutline, timeOutline, filterOutline, moon, sunny, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-payment-report',
  templateUrl: './payment-report.component.html',
  styleUrls: ['./payment-report.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgSelectModule, TableModule],
})
export class PaymentReportComponent implements OnInit {

  // Route State Data
  rangeId!: number;
  year!: number;
  finYear!: string;

  // Tabs / Segment
  // User order: ACK FAILD, REJECTED, COMPLETED, PENDING
  // We'll use these as values
  selectedTab: string = 'PENDING';
  
  // Data
  paymentList: any[] = [];
  filteredPaymentList: any[] = [];
  searchText: string = '';

  // Pagination
  pageSize = 25;
  currentPage = 1;
  totalRecords = 0;
  totalPages = 0;

  isLoading = false;
  isDarkMode = false;

  constructor(
    private platform: Platform,
    private router: Router,
    private api: ApiService,
    private cdRef: ChangeDetectorRef
  ) {
    addIcons({
      searchOutline,
      walletOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      timeOutline,
      filterOutline,
      moon,
      sunny,
      chevronBackOutline,
      chevronForwardOutline
    });
  }

  ngOnInit(): void {
    this.restoreSavedTheme();
    
    // Get data from navigation state
    const navigationState = history.state;
    if (navigationState?.range_id) {
      this.rangeId = navigationState.range_id;
      this.year = navigationState.year || 1;
      this.finYear = navigationState.fin_year || '';
    }

    this.loadData();
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

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
  }

  onTabChange() {
    this.currentPage = 1;
    this.loadData();
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
    this.onTabChange();
  }

  loadData() {
    this.isLoading = true;
    
    this.api.getPaymentBatchDetails(this.finYear).subscribe({
      next: (res: any) => {
        let allData = res?.data || [];
        
        let targetStatus = 'Pending';
        if (this.selectedTab === 'COMPLETED') targetStatus = 'COMPLETED';
        else if (this.selectedTab === 'REJECTED') targetStatus = 'RJCT';
        else if (this.selectedTab === 'ACK_FAILED') targetStatus = 'ACK';

        this.paymentList = allData.filter((item: any) => 
          item.payment_status && item.payment_status.toUpperCase() === targetStatus.toUpperCase()
        );

        this.applySearch();
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.paymentList = [];
        this.filteredPaymentList = [];
        this.totalRecords = 0;
        this.totalPages = 0;
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  applySearch() {
    const text = this.searchText.toLowerCase().trim();
    let data = [...this.paymentList];

    if (text) {
      data = data.filter(item => 
        item.application_number?.toLowerCase().includes(text) ||
        item.hitgrahi_name?.toLowerCase().includes(text) ||
        item.father_name?.toLowerCase().includes(text) ||
        item.bank_name?.toLowerCase().includes(text) ||
        item.ifsc_code?.toLowerCase().includes(text)
      );
    }

    this.totalRecords = data.length;
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    
    // Apply Pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredPaymentList = data.slice(start, end);
  }

  onSearchInput() {
    this.currentPage = 1;
    this.applySearch();
  }

  // Pagination Helpers
  goToPage(page: number) {
    this.currentPage = page;
    this.applySearch();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applySearch();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applySearch();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goBack() {
    this.router.navigate(['/officers-dashboard-ro']);
  }

  getTabLabel(tab: string): string {
    switch(tab) {
      case 'PENDING': return 'प्रतीक्षित (Pending)';
      case 'COMPLETED': return 'पूर्ण (Completed)';
      case 'REJECTED': return 'अस्वीकृत (Rejected)';
      case 'ACK_FAILED': return 'ACK विफल (Ack Failed)';
      default: return tab;
    }
  }

  getStatusColor(tab: string): string {
    switch(tab) {
      case 'PENDING': return 'warning';
      case 'COMPLETED': return 'success';
      case 'REJECTED': return 'danger';
      case 'ACK_FAILED': return 'medium';
      default: return 'primary';
    }
  }
}
