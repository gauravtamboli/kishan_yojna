import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KisanAwedanPage } from './kisan-awedan.page';

describe('KisanAwedanPage', () => {
  let component: KisanAwedanPage;
  let fixture: ComponentFixture<KisanAwedanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KisanAwedanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});