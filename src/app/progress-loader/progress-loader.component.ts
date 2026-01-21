import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-progress-loader',
  template: `
    <div class="progress-loader-container">
      <div class="progress-header">
        <h3>आवेदन जमा हो रहा है...</h3>
      </div>
      
      <div class="progress-steps">
        <!-- Step 1: Data Upload -->
        <div class="progress-step" [class.completed]="dataUploaded && !dataUploadError" [class.error]="dataUploadError">
          <div class="step-icon">
            <ion-icon *ngIf="dataUploaded && !dataUploadError" name="checkmark-circle" class="check-icon"></ion-icon>
            <ion-icon *ngIf="dataUploadError" name="close-circle" class="error-icon"></ion-icon>
            <ion-spinner *ngIf="!dataUploaded && !dataUploadError" name="crescent"></ion-spinner>
          </div>
          <div class="step-content">
            <div class="step-title">डेटा अपलोड हो रहा है</div>
            <div *ngIf="dataUploadError && dataUploadErrorMessage" class="error-message">{{ dataUploadErrorMessage }}</div>
          </div>
        </div>

        <!-- Step 2: Plant Upload -->
        <div class="progress-step" [class.completed]="plantUploaded && !plantUploadError" [class.error]="plantUploadError">
          <div class="step-icon">
            <ion-icon *ngIf="plantUploaded && !plantUploadError" name="checkmark-circle" class="check-icon"></ion-icon>
            <ion-icon *ngIf="plantUploadError" name="close-circle" class="error-icon"></ion-icon>
            <ion-spinner *ngIf="!plantUploaded && !plantUploadError && dataUploaded" name="crescent"></ion-spinner>
            <div *ngIf="!dataUploaded" class="step-pending"></div>
          </div>
          <div class="step-content">
            <div class="step-title">पौधों की जानकारी अपलोड हो रही है</div>
            <div *ngIf="plantUploadError && plantUploadErrorMessage" class="error-message">{{ plantUploadErrorMessage }}</div>
          </div>
        </div>

        <!-- Step 3: File Upload -->
        <div class="progress-step" [class.completed]="fileUploaded && !fileUploadError" [class.error]="fileUploadError">
          <div class="step-icon">
            <ion-icon *ngIf="fileUploaded && !fileUploadError" name="checkmark-circle" class="check-icon"></ion-icon>
            <ion-icon *ngIf="fileUploadError" name="close-circle" class="error-icon"></ion-icon>
            <ion-spinner *ngIf="!fileUploaded && !fileUploadError && plantUploaded" name="crescent"></ion-spinner>
            <div *ngIf="!plantUploaded" class="step-pending"></div>
          </div>
          <div class="step-content">
            <div class="step-title">फाइलें अपलोड हो रही हैं</div>
            <div *ngIf="fileUploadError && fileUploadErrorMessage" class="error-message">{{ fileUploadErrorMessage }}</div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="allCompleted && !hasErrors" class="success-message">
        <ion-icon name="checkmark-circle" class="success-icon"></ion-icon>
        <p>आपका डेटा सफलतापूर्वक सेव हो गया है</p>
      </div>
    </div>
  `,
  styles: [`
    .progress-loader-container {
      padding: 24px;
      background: white;
      border-radius: 12px;
      min-width: 320px;
      max-width: 400px;
    }

    .progress-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .progress-header h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .progress-steps {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .progress-step {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 8px;
      background: #f5f5f5;
      transition: all 0.3s ease;
    }

    .progress-step.completed {
      background: #e8f5e9;
    }

    .progress-step.error {
      background: #ffebee;
    }

    .step-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .check-icon {
      font-size: 32px;
      color: #28a745;
    }

    .error-icon {
      font-size: 32px;
      color: #dc3545;
    }

    .step-pending {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #e0e0e0;
    }

    .step-content {
      flex: 1;
    }

    .step-title {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .progress-step.completed .step-title {
      color: #28a745;
      font-weight: 600;
    }

    .progress-step.error .step-title {
      color: #dc3545;
      font-weight: 600;
    }

    .error-message {
      font-size: 12px;
      color: #dc3545;
      margin-top: 4px;
      font-weight: 500;
      word-wrap: break-word;
    }

    .success-message {
      margin-top: 24px;
      padding: 16px;
      background: #e8f5e9;
      border-radius: 8px;
      text-align: center;
      animation: fadeIn 0.5s ease;
    }

    .success-icon {
      font-size: 48px;
      color: #28a745;
      margin-bottom: 8px;
    }

    .success-message p {
      margin: 0;
      color: #2d5a2d;
      font-size: 16px;
      font-weight: 600;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  imports: [CommonModule, IonicModule]
})
export class ProgressLoaderComponent implements OnInit, OnDestroy {
  private _dataUploaded: boolean = false;
  private _plantUploaded: boolean = false;
  private _fileUploaded: boolean = false;
  private _dataUploadError: boolean = false;
  private _plantUploadError: boolean = false;
  private _fileUploadError: boolean = false;
  private _dataUploadErrorMessage: string = '';
  private _plantUploadErrorMessage: string = '';
  private _fileUploadErrorMessage: string = '';
  
  // Subject for receiving updates
  private updateSubject = new Subject<{dataUploaded: boolean, plantUploaded: boolean, fileUploaded: boolean}>();
  private destroy$ = new Subject<void>();

  // Use setters to trigger change detection
  @Input() 
  set dataUploaded(value: boolean) {
    this._dataUploaded = value;
    this.cdRef.detectChanges();
  }
  get dataUploaded(): boolean {
    return this._dataUploaded;
  }

  @Input()
  set plantUploaded(value: boolean) {
    this._plantUploaded = value;
    this.cdRef.detectChanges();
  }
  get plantUploaded(): boolean {
    return this._plantUploaded;
  }

  @Input()
  set fileUploaded(value: boolean) {
    this._fileUploaded = value;
    this.cdRef.detectChanges();
  }
  get fileUploaded(): boolean {
    return this._fileUploaded;
  }

  @Input()
  set dataUploadError(value: boolean) {
    this._dataUploadError = value;
    this.cdRef.detectChanges();
  }
  get dataUploadError(): boolean {
    return this._dataUploadError;
  }

  @Input()
  set plantUploadError(value: boolean) {
    this._plantUploadError = value;
    this.cdRef.detectChanges();
  }
  get plantUploadError(): boolean {
    return this._plantUploadError;
  }

  @Input()
  set fileUploadError(value: boolean) {
    this._fileUploadError = value;
    this.cdRef.detectChanges();
  }
  get fileUploadError(): boolean {
    return this._fileUploadError;
  }

  @Input()
  set dataUploadErrorMessage(value: string) {
    this._dataUploadErrorMessage = value;
    this.cdRef.detectChanges();
  }
  get dataUploadErrorMessage(): string {
    return this._dataUploadErrorMessage;
  }

  @Input()
  set plantUploadErrorMessage(value: string) {
    this._plantUploadErrorMessage = value;
    this.cdRef.detectChanges();
  }
  get plantUploadErrorMessage(): string {
    return this._plantUploadErrorMessage;
  }

  @Input()
  set fileUploadErrorMessage(value: string) {
    this._fileUploadErrorMessage = value;
    this.cdRef.detectChanges();
  }
  get fileUploadErrorMessage(): string {
    return this._fileUploadErrorMessage;
  }

  get allCompleted(): boolean {
    return this.dataUploaded && this.plantUploaded && this.fileUploaded;
  }

  get hasErrors(): boolean {
    return this.dataUploadError || this.plantUploadError || this.fileUploadError;
  }

  constructor(public cdRef: ChangeDetectorRef) {
    addIcons({ checkmarkCircle, closeCircle });
  }

  ngOnInit() {
    // Subscribe to updates
    this.updateSubject.pipe(takeUntil(this.destroy$)).subscribe(update => {
      this._dataUploaded = update.dataUploaded;
      this._plantUploaded = update.plantUploaded;
      this._fileUploaded = update.fileUploaded;
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Method to update progress (called from parent via modal)
  updateProgress(dataUploaded: boolean, plantUploaded: boolean, fileUploaded: boolean) {
    this._dataUploaded = dataUploaded;
    this._plantUploaded = plantUploaded;
    this._fileUploaded = fileUploaded;
    this.cdRef.detectChanges();
  }
}

