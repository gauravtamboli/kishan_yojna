import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KisanAwedanOtpPage } from './kisan-awedan-otp.page';

describe('KisanAwedanOtpPage', () => {
  let component: KisanAwedanOtpPage;
  let fixture: ComponentFixture<KisanAwedanOtpPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KisanAwedanOtpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
