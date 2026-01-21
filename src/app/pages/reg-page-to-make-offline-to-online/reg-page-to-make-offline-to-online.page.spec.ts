import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegPageToMakeOfflineToOnlinePage } from './reg-page-to-make-offline-to-online.page';

describe('RegPageToMakeOfflineToOnlinePage', () => {
  let component: RegPageToMakeOfflineToOnlinePage;
  let fixture: ComponentFixture<RegPageToMakeOfflineToOnlinePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegPageToMakeOfflineToOnlinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
