import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KissanWiseReportComponent } from './kissan-wise-report.component';

describe('KissanWiseReportComponent', () => {
  let component: KissanWiseReportComponent;
  let fixture: ComponentFixture<KissanWiseReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [KissanWiseReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KissanWiseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
