import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutYojnaPage } from './about-yojna.page';

describe('AboutYojnaPage', () => {
  let component: AboutYojnaPage;
  let fixture: ComponentFixture<AboutYojnaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutYojnaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
