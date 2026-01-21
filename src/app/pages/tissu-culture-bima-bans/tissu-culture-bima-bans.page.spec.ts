import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TissuCultureBimaBansPage } from './tissu-culture-bima-bans.page';

describe('TissuCultureBimaBansPage', () => {
  let component: TissuCultureBimaBansPage;
  let fixture: ComponentFixture<TissuCultureBimaBansPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TissuCultureBimaBansPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
