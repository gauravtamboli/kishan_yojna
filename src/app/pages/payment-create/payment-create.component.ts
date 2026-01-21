import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { tableData } from '../generate-estimate-dynamic/estimate-table';
import Swal from 'sweetalert2';
import { addIcons } from 'ionicons';
import { cloudUploadOutline } from 'ionicons/icons';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFontsBold from "../../../assets/fonts/vfs_fonts_bold_custom";
import * as pdfFontsNormal from "../../../assets/fonts/vfs_fonts_custom";

(pdfMake as any).vfs = { ...pdfFontsBold.vfs, ...pdfFontsNormal.vfs };

type DisplayCategory = {
  label: string;
  rateField: string;
  plantCount: number;
  area: number;
  total_ropit: number;
  rowGrantMap: {
    [year: number]: { [itemKramank: number]: boolean };
  };
};

@Component({
  standalone: true,
  selector: 'app-payment-create',
  templateUrl: './payment-create.component.html',
  styleUrls: ['./payment-create.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, NgSelectModule],
})
export class PaymentCreateComponent implements OnInit {


  application_number: string | null = null;
  singleData: any;
  estimateRows: any[] = [];
  officer_name: string = '';

  year1Rows: any[] = tableData['प्रथम_वर्ष'] || [];
  year2Rows: any[] = tableData['द्वितीय_वर्ष'] || [];
  year3Rows: any[] = tableData['तृतीय_वर्ष'] || [];

  selectedYear: number | null = null;
  showYear1 = false;
  showYear2 = false;
  showYear3 = false;

  categoriesToShow: DisplayCategory[] = [];

  isLoading = false;
  isPageLoading = false;
  private loadingElement: any = null;

  private plantNameToRateField: Record<string, string> = {
    'क्लोनल नीलगिरी': 'klonalNeelgiri',
    'नीलगिरी': 'klonalNeelgiri',
    'टिशू कल्चर बांस': 'tissuclturebans',
    'टिश्यू कल्चर बांस': 'tissuclturebans',
    'साधारण बांस': 'tissuclturebans',
    'चंदन': 'chandan_poudha',
    'मिलिया डूबिया': 'milidubiya',
    'साधारण सागौन': 'tissuclturesagon',
    'टिशू कल्चर सागौन': 'tissuclturesagon',
    'टिश्यू कल्चर सागौन': 'tissuclturesagon',
  };

  isNavigating = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private api: ApiService,
    private cdRef: ChangeDetectorRef,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({ cloudUploadOutline });
  }

  ngOnInit(): void {

    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      try {
        this.officer_name = JSON.parse(storedData)?.officer_name || '';
      } catch { }
    }


    this.route.queryParams.subscribe(params => {
      this.application_number = params['application_number'] || null;
      const yearParam = Number(params['year']);
      this.selectedYear = [1, 2, 3].includes(yearParam) ? yearParam : null;

      this.showYear1 = this.selectedYear === 1;
      this.showYear2 = this.selectedYear === 2;
      this.showYear3 = this.selectedYear === 3;

      if (this.application_number) {
        this.isPageLoading = true;
        this.loadBundle(this.application_number);
      }
    });


    // state is working fine for testing of other 2 yeares i can put this code in comment after test other 2 year then un comment this code


    // const nav = this.router.getCurrentNavigation();
    // const state = nav?.extras.state;

    // this.application_number =
    //   state?.['application_number'] ||
    //   history.state?.['application_number'] ||
    //   null;

    // const year =
    //   state?.['year'] ||
    //   history.state?.['year'];

    // this.selectedYear = [1, 2, 3].includes(year) ? year : null;
    // this.showYear1 = this.selectedYear === 1;
    // this.showYear2 = this.selectedYear === 2;
    // this.showYear3 = this.selectedYear === 3;

    // if (this.application_number) {
    //   this.isPageLoading = true;
    //   this.loadBundle(this.application_number);
    // }


  }

  // ================= LOAD DATA =================
  private loadBundle(application_number: string) {
    this.api.getPaymentBundel(application_number).subscribe({
      next: (res: any) => {

        this.singleData = res?.singleData || null;
        this.estimateRows = res?.data || [];

        const categoryMap = new Map<string, any>();

        this.estimateRows.forEach(row => {
          const plantName = (row?.plant_name || '').trim();
          if (!plantName) return;

          const plantId = Number(row?.plant_id) || 0;
          const count = Number(row?.total_tree || row?.estimated_required_trees) || 0;
          const area = Number(row?.total_area) || 0;
          const ropit = Number(row?.total_ropit) || 0;

          const rateField =
            plantId < 8
              ? (this.plantNameToRateField[plantName] || 'anyaPoudha')
              : 'anyaPoudha';

          const existing = categoryMap.get(plantName) || {
            plantCount: 0,
            area: 0,
            rateField,
            total_ropit: 0
          };

          categoryMap.set(plantName, {
            plantCount: existing.plantCount + count,
            area: existing.area + area,
            rateField,
            total_ropit: existing.total_ropit + ropit
          });
        });

        this.categoriesToShow = Array.from(categoryMap.entries()).map(([label, data]) => ({
          label,
          plantCount: data.plantCount,
          area: data.area,
          rateField: data.rateField,
          total_ropit: data.total_ropit,
          rowGrantMap: { 1: {}, 2: {}, 3: {} }
        }));

        // ✅ INIT CHECKBOX STATE (IMPORTANT FIX)
        this.categoriesToShow.forEach(cat => {
          this.year1Rows.forEach(r => cat.rowGrantMap[1][r.itemKramank] = true);
          this.year2Rows.forEach(r => cat.rowGrantMap[2][r.itemKramank] = true);
          this.year3Rows.forEach(r => cat.rowGrantMap[3][r.itemKramank] = true);
        });

        this.isPageLoading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.categoriesToShow = [];
        this.isPageLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  // ================= CALCULATION =================
  getYearTotal(cat: DisplayCategory, yearRows: any[], year: number): number {
    return yearRows.reduce((sum, row) => {

      const isGranted =
        cat.rowGrantMap[year]?.[row.itemKramank] ?? true;

      if (!isGranted) {
        return sum;
      }

      const less5Rate = Number(row?.[cat.rateField]) || 0;
      const more5Rate = Number(row?.[cat.rateField]) || 0;

      const rowTotal =
        (this.less5AreaCount(cat) * less5Rate) +
        (this.more5AreaCount(cat) * (more5Rate / 2));

      return sum + rowTotal;

    }, 0);
  }








  goBack() {
    this.location.back();
  }



  convertNumberToWords(num: number): string {
    if (num === 0) return 'Zero';

    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
      'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
      'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];

    const b = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
      'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000)
        return a[Math.floor(n / 100)] + ' Hundred' +
          (n % 100 ? ' ' + inWords(n % 100) : '');
      if (n < 100000)
        return inWords(Math.floor(n / 1000)) + ' Thousand' +
          (n % 1000 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000)
        return inWords(Math.floor(n / 100000)) + ' Lakh' +
          (n % 100000 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' +
        (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
    };

    return inWords(num);
  }

  less5AreaCount(cat: DisplayCategory): number {
    const peracre = cat.plantCount / cat.area;
    const A = peracre * 5;
    if (A >= cat.total_ropit) {
      return cat.total_ropit;
    }
    return (cat.plantCount / cat.area) * 5;
  }
  more5AreaCount(cat: DisplayCategory) {
    if (cat.area <= 5) {
      return 0;
    }

    const ropit = cat.total_ropit || 0;
    const less5Count = this.less5AreaCount(cat);
    const more5Count = ropit - less5Count;
    return more5Count > 0 ? more5Count : 0;
    //
  }

  getAllPrajatiYearTotal(year: number): number {
    let total = 0;

    for (let cat of this.categoriesToShow) {
      if (year === 1) {
        total += this.getYearTotal(cat, this.year1Rows, 1);
      }
      if (year === 2) {
        total += this.getYearTotal(cat, this.year2Rows, 2);
      }
      if (year === 3) {
        total += this.getYearTotal(cat, this.year3Rows, 3);
      }
    }

    return total;
  }




}