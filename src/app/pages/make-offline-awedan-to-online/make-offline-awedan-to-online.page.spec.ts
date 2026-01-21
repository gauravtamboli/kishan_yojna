import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MakeOfflineAwedanToOnlinePage } from './make-offline-awedan-to-online.page';

describe('MakeOfflineAwedanToOnlinePage', () => {
  let component: MakeOfflineAwedanToOnlinePage;
  let fixture: ComponentFixture<MakeOfflineAwedanToOnlinePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeOfflineAwedanToOnlinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
