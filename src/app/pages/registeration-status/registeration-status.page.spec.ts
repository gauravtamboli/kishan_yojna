import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterationStatusPage } from './registeration-status.page';

describe('RegisterationStatusPage', () => {
  let component: RegisterationStatusPage;
  let fixture: ComponentFixture<RegisterationStatusPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterationStatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
