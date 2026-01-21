import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewAwedanPage } from './view-awedan.page';

describe('ViewAwedanPage', () => {
  let component: ViewAwedanPage;
  let fixture: ComponentFixture<ViewAwedanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAwedanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
