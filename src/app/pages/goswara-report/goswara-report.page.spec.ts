import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoswaraReportPage } from './goswara-report.page';

describe('GoswaraReportPage', () => {
  let component: GoswaraReportPage;
  let fixture: ComponentFixture<GoswaraReportPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GoswaraReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
