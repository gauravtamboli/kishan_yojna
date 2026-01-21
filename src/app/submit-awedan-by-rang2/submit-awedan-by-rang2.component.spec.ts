import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SubmitAwedanByRang2Component } from './submit-awedan-by-rang2.component';

describe('SubmitAwedanByRang2Component', () => {
  let component: SubmitAwedanByRang2Component;
  let fixture: ComponentFixture<SubmitAwedanByRang2Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitAwedanByRang2Component ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitAwedanByRang2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
