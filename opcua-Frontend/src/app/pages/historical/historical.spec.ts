import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Historical } from './historical';

describe('Historical', () => {
  let component: Historical;
  let fixture: ComponentFixture<Historical>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Historical]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Historical);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
