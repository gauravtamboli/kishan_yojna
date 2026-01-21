import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SubmitAwedanByRangComponent } from './submit-awedan-by-rang.component';

describe('SubmitAwedanByRangComponent', () => {
  let component: SubmitAwedanByRangComponent;
  let fixture: ComponentFixture<SubmitAwedanByRangComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SubmitAwedanByRangComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitAwedanByRangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
