import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

export interface StepperStep {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
  disabled: boolean;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  template: `
    <div class="stepper-container">
      <div class="stepper-header">
        <div 
          *ngFor="let step of steps; let i = index" 
          class="step-item"
          [class.active]="step.active"
          [class.completed]="step.completed"
          [class.disabled]="step.disabled"
          (click)="onStepClick(step, i)">
          
          <div class="step-circle">
            <ion-icon 
              *ngIf="step.completed" 
              name="checkmark" 
              class="step-icon">
            </ion-icon>
            <span *ngIf="!step.completed" class="step-number">{{ step.id }}</span>
          </div>
          
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
          </div>
          
          <div *ngIf="i < steps.length - 1" class="step-connector"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stepper-container {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .stepper-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
    }
    
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      cursor: pointer;
    }
    
    .step-item.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      transition: all 0.3s ease;
      border: 2px solid #e9ecef;
    }
    
    .step-item.active .step-circle {
      background: #007bff;
      border-color: #007bff;
      color: white;
    }
    
    .step-item.completed .step-circle {
      background: #28a745;
      border-color: #28a745;
      color: white;
    }
    
    .step-number {
      font-weight: bold;
      font-size: 16px;
    }
    
    .step-icon {
      font-size: 20px;
    }
    
    .step-title {
      font-size: 12px;
      text-align: center;
      color: #6c757d;
      font-weight: 500;
    }
    
    .step-item.active .step-title {
      color: #007bff;
      font-weight: bold;
    }
    
    .step-item.completed .step-title {
      color: #28a745;
    }
    
    .step-connector {
      position: absolute;
      top: 20px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: #e9ecef;
      z-index: -1;
    }
    
    .step-item.completed + .step-item .step-connector {
      background: #28a745;
    }
    
    @media (max-width: 768px) {
      .stepper-header {
        flex-direction: column;
        gap: 20px;
      }
      
      .step-item {
        flex-direction: row;
        width: 100%;
        justify-content: flex-start;
      }
      
      .step-circle {
        margin-right: 15px;
        margin-bottom: 0;
      }
      
      .step-connector {
        display: none;
      }
    }
  `],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class StepperComponent {
  @Input() steps: StepperStep[] = [];
  @Output() stepChange = new EventEmitter<number>();

  onStepClick(step: StepperStep, index: number) {
    if (!step.disabled) {
      this.stepChange.emit(index);
    }
  }
}
