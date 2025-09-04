import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitaltwinComponent } from './digitaltwin.component';

describe('DigitaltwinComponent', () => {
  let component: DigitaltwinComponent;
  let fixture: ComponentFixture<DigitaltwinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DigitaltwinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitaltwinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
