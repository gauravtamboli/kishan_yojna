import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PragatiPrativedanComponent } from './pragati-prativedan.component';

describe('PragatiPrativedanComponent', () => {
  let component: PragatiPrativedanComponent;
  let fixture: ComponentFixture<PragatiPrativedanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PragatiPrativedanComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PragatiPrativedanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
