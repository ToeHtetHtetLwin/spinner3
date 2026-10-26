import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThadingyutSurpriseComponent } from './thadingyut-surprise.component';

describe('ThadingyutSurpriseComponent', () => {
  let component: ThadingyutSurpriseComponent;
  let fixture: ComponentFixture<ThadingyutSurpriseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThadingyutSurpriseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThadingyutSurpriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
