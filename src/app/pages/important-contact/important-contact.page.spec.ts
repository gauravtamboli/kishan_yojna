import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportantContactPage } from './important-contact.page';

describe('ImportantContactPage', () => {
  let component: ImportantContactPage;
  let fixture: ComponentFixture<ImportantContactPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportantContactPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
