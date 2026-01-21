import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaDwaraVivranPage } from './ra-dwara-vivran.page';

describe('RaDwaraVivranPage', () => {
  let component: RaDwaraVivranPage;
  let fixture: ComponentFixture<RaDwaraVivranPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RaDwaraVivranPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});