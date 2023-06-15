import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-registro-especialista',
  templateUrl: './form-registro-especialista.component.html',
  styleUrls: ['./form-registro-especialista.component.css']
})
export class FormRegistroEspecialistaComponent {

  //@ts-ignore
  formEspecialista: FormGroup;
  soloLetrasEspacios:string = "^[a-zA-Z\s]+$";
  emailPattern:any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  solo8digitos:string = "[0-9]{8}";

  constructor(private formBuilder:FormBuilder)
  {
    this.formEspecialista = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern(this.soloLetrasEspacios)]],
      apellido: ['', [Validators.required, Validators.pattern(this.soloLetrasEspacios)]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(65)]],
      dni: ['', [Validators.required, Validators.pattern(this.solo8digitos)]],
      especialidad: ['', [Validators.required, Validators.pattern(this.soloLetrasEspacios)]],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required, Validators.pattern(".{6,}")]],
      fotoPerfil: ['', [Validators.required]]
    });
  }



}
