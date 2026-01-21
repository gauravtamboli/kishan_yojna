import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficersDashboardROPage } from './officers-dashboard-ro.page';
import { OfficersDashboardPage } from '../officers-dashboard/officers-dashboard.page';

describe('OfficersDashboardPage', () => {
  let component: OfficersDashboardPage;
  let fixture: ComponentFixture<OfficersDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficersDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
