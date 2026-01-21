import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SafedChanddanPage } from './safed-chanddan.page';

describe('SafedChanddanPage', () => {
  let component: SafedChanddanPage;
  let fixture: ComponentFixture<SafedChanddanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SafedChanddanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
