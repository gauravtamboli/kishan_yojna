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
    plant_id: number;
    rateField: string;
    plantCount: number;
    area: number;
    total_ropit: number;
    total_pit: number;
    rowGrantMap: {
        [year: number]: { [itemKramank: number]: boolean };
    };
};

@Component({
    standalone: true,
    selector: 'app-vendor-payment',
    templateUrl: './vendor-payment.component.html',
    styleUrls: ['./vendor-payment.component.scss'],
    imports: [IonicModule, CommonModule, FormsModule, NgSelectModule],
})
export class VendorPaymentComponent implements OnInit {


    application_number: string | null = null;
    singleData: any;
    estimateRows: any[] = [];
    officer_name: string = '';
    officer_id: number = 0;

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
                // console.log('Retrieved officer data from sessionStorage:', storedData);
                this.officer_name = JSON.parse(storedData)?.officer_name || '';
                this.officer_id = JSON.parse(storedData)?.rang_id || '';
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

        // Filter out rows 3, 4, 5 for Vendor Payment
        this.filterRowsForVendor();

    }

    // Filter rows logic
    filterRowsForVendor() {
        const skippedIndices = [3, 4, 5]; // Item Kramank 3, 4, 5 are skipped
        this.year1Rows = this.year1Rows.filter(row => !skippedIndices.includes(row.itemKramank));
        this.year2Rows = this.year2Rows.filter(row => !skippedIndices.includes(row.itemKramank));
        this.year3Rows = this.year3Rows.filter(row => !skippedIndices.includes(row.itemKramank));
    }

    // ================= LOAD DATA =================
    private loadBundle(application_number: string) {
        this.api.getPaymentBundelVendor(application_number).subscribe({
            next: (res: any) => {
                console.log('API Response for getPaymentBundelVendor:', res);
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
                    const pit = Number(row?.total_pit) || 0;

                    const rateField =
                        plantId < 8
                            ? (this.plantNameToRateField[plantName] || 'anyaPoudha')
                            : 'anyaPoudha';

                    const existing = categoryMap.get(plantName) || {
                        plant_id: plantId,
                        plantCount: 0,
                        area: 0,
                        rateField,
                        total_ropit: 0,
                        total_pit: 0
                    };

                    categoryMap.set(plantName, {
                        plant_id: plantId,
                        plantCount: existing.plantCount + count,
                        area: existing.area + area,
                        rateField,
                        total_ropit: existing.total_ropit + ropit,
                        total_pit: existing.total_pit + pit
                    });
                });

                this.categoriesToShow = Array.from(categoryMap.entries()).map(([label, data]) => ({
                    label,
                    plant_id: data.plant_id,
                    plantCount: data.plantCount,
                    area: data.area,
                    rateField: data.rateField,
                    total_ropit: data.total_ropit,
                    total_pit: data.total_pit,
                    rowGrantMap: { 1: {}, 2: {}, 3: {} }
                }));

                // ✅ INIT CHECKBOX STATE (IMPORTANT FIX) - make sure to handle filtered rows?
                // Actually, since we filtered this.year1Rows, looping over them works fine.
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

    // Fixed: Calculated based on total_pit for 5 acres limit
    less5PitCount(cat: DisplayCategory): number {
        if (!cat.area || cat.area === 0) return 0;
        const peracre = cat.plantCount / cat.area;
        const limit5Acres = peracre * 5;

        // If total_pit is within the 5-acre limit, all are "less 5"
        if (limit5Acres >= cat.total_pit) {
            return cat.total_pit;
        }
        // Otherwise only the 5-acre capacity is "less 5"
        return limit5Acres;
    }

    more5PitCount(cat: DisplayCategory): number {
        if (cat.area <= 5) {
            return 0;
        }
        const totalPit = cat.total_pit || 0;
        const less5 = this.less5PitCount(cat); // Reuse logic
        const more5 = totalPit - less5;
        return more5 > 0 ? more5 : 0;
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

            let lessCount = 0;
            let moreCount = 0;

            // Item 3 is assumed to be Pits (Gadda)
            if (row.itemKramank === 3) {
                lessCount = this.less5PitCount(cat);
                moreCount = this.more5PitCount(cat);
            } else {
                lessCount = this.less5AreaCount(cat);
                moreCount = this.more5AreaCount(cat);
            }

            const rowTotal =
                (lessCount * less5Rate) +
                (moreCount * (more5Rate / 2));

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

    // async makePayment() {
    //     if (!this.application_number || !this.selectedYear) {
    //         await this.showToast('कृपया आवेदन संख्या और वर्ष का चयन करें।');
    //         return;
    //     }

    //     // Get the appropriate year rows based on selected year
    //     const selectedYearRows = this.selectedYear === 1 ? this.year1Rows :
    //         this.selectedYear === 2 ? this.year2Rows :
    //             this.year3Rows;

    //     // Collect detailed payment data with all table rows for each category
    //     const paymentData = {
    //         application_number: this.application_number,
    //         year: this.selectedYear!,
    //         officer_name: this.officer_id, // Send officer_id instead of name for backend processing
    //         applicant_details: {
    //             hitgrahiName: this.singleData?.hitgrahiName,
    //             fatherName: this.singleData?.fatherName,
    //             address: this.singleData?.address,
    //             gramPanchayatName: this.singleData?.gramPanchayatName,
    //             mobileNo: this.singleData?.mobileNo,
    //             landType: this.singleData?.landType,
    //             totalAcre: this.singleData?.totalAcre
    //         },
    //         categories: this.categoriesToShow.map(cat => {

    //             // ✅ calculate ONCE per category
    //             const less5Count = this.less5AreaCount(cat);
    //             const more5Count = this.more5AreaCount(cat);

    //             return {
    //                 plant_id: cat.plant_id,

    //                 // ✅ category-level counts
    //                 less5plant: less5Count,
    //                 more5plant: more5Count,

    //                 table_rows: selectedYearRows.map(item => {

    //                     const isGranted =
    //                         cat.rowGrantMap[this.selectedYear!]?.[item.itemKramank] ?? true;

    //                     let less5Amount = 0;
    //                     let more5Amount = 0;

    //                     if (isGranted) {
    //                         const rate = Number(item[cat.rateField]) || 0;
    //                         const halfRate = rate / 2;

    //                         less5Amount = less5Count * rate;
    //                         more5Amount = more5Count * halfRate;
    //                     }

    //                     return {
    //                         item_kramank: item.itemKramank,

    //                         // ✅ correct names for backend
    //                         less_5_count: less5Count,
    //                         more_5_count: more5Count,

    //                         [`work${item.itemKramank}`]: less5Amount,
    //                         [`work${item.itemKramank}A`]: more5Amount,

    //                         total_amount: less5Amount + more5Amount
    //                     };
    //                 }),

    //                 year_total: this.getYearTotal(cat, selectedYearRows, this.selectedYear!)
    //             };
    //         }),


    //         // Grand total for all categories in selected year
    //         grand_total: this.getAllPrajatiYearTotal(this.selectedYear!),
    //         grand_total_in_words: this.convertNumberToWords(this.getAllPrajatiYearTotal(this.selectedYear!))
    //     };

    //     console.log('Payment Data to Submit:', paymentData);

    //     this.isLoading = true;
    //     this.cdRef.detectChanges();

    //     this.api.submitVendorPayment(paymentData).subscribe({
    //         next: async (response: any) => {
    //             this.isLoading = false;
    //             this.cdRef.detectChanges();

    //             if (response?.response?.code === 200) {
    //                 await this.showToast('भुगतान सफलतापूर्वक सबमिट किया गया।');
    //                 this.goBack();
    //             } else {
    //                 await this.showToast(response?.response?.msg || 'भुगतान सबमिट करने में त्रुटि।');
    //             }
    //         },
    //         error: async (error) => {
    //             this.isLoading = false;
    //             this.cdRef.detectChanges();
    //             console.error('Payment submission error:', error);
    //             await this.showToast('भुगतान सबमिट करने में त्रुटि हुई।');
    //         }
    //     });
    // }



    async makePayment() {

        // 1️⃣ Basic validation
        if (!this.application_number || !this.selectedYear) {
            await Swal.fire({
                icon: 'warning',
                title: 'आवश्यक जानकारी',
                text: 'कृपया आवेदन संख्या और वर्ष का चयन करें।'
            });
            return;
        }

        // 2️⃣ Calculate final amount BEFORE confirmation
        const finalAmount = this.getAllPrajatiYearTotal(this.selectedYear!);

        // 3️⃣ Confirmation with amount + checkbox
        const confirmResult = await Swal.fire({
            title: 'भुगतान पुष्टि',
            html: `
            <div style="text-align:left">               
                <div style="margin-top:15px">
                    <input type="checkbox" id="confirmCheck">
                    <label for="confirmCheck">
                        मैं पुष्टि करता/करती हूँ कि उपरोक्त जानकारी सही है
                    </label>
                </div>
            </div>
        `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'हाँ, भुगतान सबमिट करें',
            cancelButtonText: 'रद्द करें',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            reverseButtons: true,
            preConfirm: () => {
                const checkbox = document.getElementById('confirmCheck') as HTMLInputElement;
                if (!checkbox?.checked) {
                    Swal.showValidationMessage('कृपया पुष्टि के लिए चेकबॉक्स चुनें।');
                    return false;
                }
                return true;
            }
        });

        if (!confirmResult.isConfirmed) {
            return; // ❌ User cancelled
        }

        // 4️⃣ Prepare data AFTER confirmation
        const selectedYearRows =
            this.selectedYear === 1 ? this.year1Rows :
                this.selectedYear === 2 ? this.year2Rows :
                    this.year3Rows;

        const paymentData = {
            application_number: this.application_number,
            year: this.selectedYear!,
            officer_name: this.officer_id,
            categories: this.categoriesToShow.map(cat => {
                const less5Count = this.less5AreaCount(cat);
                const more5Count = this.more5AreaCount(cat);

                return {
                    plant_id: cat.plant_id,
                    less5plant: less5Count,
                    more5plant: more5Count,
                    table_rows: selectedYearRows.map(item => {
                        const isGranted =
                            cat.rowGrantMap[this.selectedYear!]?.[item.itemKramank] ?? true;

                        let less5Amount = 0;
                        let more5Amount = 0;

                        if (isGranted) {
                            const rate = Number(item[cat.rateField]) || 0;
                            const halfRate = rate / 2;
                            less5Amount = less5Count * rate;
                            more5Amount = more5Count * halfRate;
                        }

                        return {
                            item_kramank: item.itemKramank,
                            [`work${item.itemKramank}`]: less5Amount,
                            [`work${item.itemKramank}A`]: more5Amount,
                            total_amount: less5Amount + more5Amount
                        };
                    }),
                    year_total: this.getYearTotal(cat, selectedYearRows, this.selectedYear!)
                };
            }),
            grand_total: finalAmount,
            grand_total_in_words: this.convertNumberToWords(finalAmount)
        };

        // 5️⃣ Loader Swal
        Swal.fire({
            title: 'भुगतान सबमिट हो रहा है...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        this.isLoading = true;
        this.cdRef.detectChanges();

        // 6️⃣ API call
        this.api.submitVendorPayment(paymentData).subscribe({
            next: async (response: any) => {
                this.isLoading = false;
                this.cdRef.detectChanges();
                Swal.close();

                if (response?.response?.code === 200) {
                    const msg = response?.response?.msg;
                    // ✅ Success with BillNumber
                    await Swal.fire({
                        icon: 'success',
                        title: 'Bill Created',
                        html: `
                        <p><strong><h4 style="color:#2e7d32">${msg}</h4></strong></p>
                      
                      
                    `,
                        confirmButtonText: 'ठीक है'
                    });

                    this.goBack();

                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: 'त्रुटि',
                        text: response?.response?.msg || 'भुगतान सबमिट करने में त्रुटि।'
                    });
                }
            },
            error: async (error) => {
                this.isLoading = false;
                this.cdRef.detectChanges();
                Swal.close();

                console.error('Payment submission error:', error);

                await Swal.fire({
                    icon: 'error',
                    title: 'त्रुटि',
                    text: 'भुगतान सबमिट करने में त्रुटि हुई।'
                });
            }
        });
    }



    private async showToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 3000,
            position: 'bottom',
            color: 'dark'
        });
        await toast.present();
    }

}
