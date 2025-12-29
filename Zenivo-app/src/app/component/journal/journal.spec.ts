import { ComponentFixture, TestBed } from '@angular/core/testing';


import { JournalsComponent } from './journal';

describe('Journal', () => {
  let component: JournalsComponent;
  let fixture: ComponentFixture<JournalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
