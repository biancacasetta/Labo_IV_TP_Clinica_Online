import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRegistroEspecialistaComponent } from './form-registro-especialista.component';

describe('FormRegistroEspecialistaComponent', () => {
  let component: FormRegistroEspecialistaComponent;
  let fixture: ComponentFixture<FormRegistroEspecialistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormRegistroEspecialistaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRegistroEspecialistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
