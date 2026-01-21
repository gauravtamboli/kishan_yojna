import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficerLoginPage } from './officer-login.page';

describe('OfficeLoginPage', () => {
  let component: OfficerLoginPage;
  let fixture: ComponentFixture<OfficerLoginPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficerLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
