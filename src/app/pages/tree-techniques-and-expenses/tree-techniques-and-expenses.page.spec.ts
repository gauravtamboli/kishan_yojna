import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeTechniquesAndExpensesPage } from './tree-techniques-and-expenses.page';

describe('TreeTechniquesAndExpensesPage', () => {
  let component: TreeTechniquesAndExpensesPage;
  let fixture: ComponentFixture<TreeTechniquesAndExpensesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeTechniquesAndExpensesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
