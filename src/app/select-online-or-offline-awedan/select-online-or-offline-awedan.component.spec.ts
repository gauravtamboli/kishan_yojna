import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectOnlineOrOfflineAwedanComponent } from './select-online-or-offline-awedan.component';

describe('SelectOnlineOrOfflineAwedanComponent', () => {
  let component: SelectOnlineOrOfflineAwedanComponent;
  let fixture: ComponentFixture<SelectOnlineOrOfflineAwedanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectOnlineOrOfflineAwedanComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectOnlineOrOfflineAwedanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
