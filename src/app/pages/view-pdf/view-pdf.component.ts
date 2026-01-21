import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ApiService } from 'src/app/services/api.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-view-pdf',
  templateUrl: './view-pdf.component.html',
  styleUrls: ['./view-pdf.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, NgxExtendedPdfViewerModule],
})
export class ViewPdfComponent implements OnInit {

  safePdfUrl: string = ""
  receivedData: any;
  isLoadingPdf = true;
  loading: HTMLIonLoadingElement | null = null;

  async onIframeLoad() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private router: Router,
    private apiServices: ApiService, private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.showPdfUrl();
  }

  async showPdfUrl() {
        
    const nav = this.router.getCurrentNavigation();
    this.receivedData = nav?.extras?.state?.['userData'];

    const token = this.receivedData.token;
    const pdfFileName = this.receivedData.pdf_file_name;

    this.http
      .get(this.apiServices.apiGetSecurePath + `?filename=${pdfFileName}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })
      .subscribe(async blob => {
        await this.presentLoading();
        const url = URL.createObjectURL(blob);
        this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url) as string;
      });

  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Loading PDF...',
      spinner: 'crescent',
    });
    await this.loading.present();
  }



}
