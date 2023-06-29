import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-form-registro-paciente',
  templateUrl: './form-registro-paciente.component.html',
  styleUrls: ['./form-registro-paciente.component.css']
})
export class FormRegistroPacienteComponent {

  //@ts-ignore
  formPaciente: FormGroup;
  soloLetrasEspacios:string = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$";
  emailPattern:any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  solo8digitos:string = "[0-9]{8}";

  archivoFoto1:string = "";
  archivoFoto2:string = "";
  rutaFoto1:string = "";
  rutaFoto2:string = "";
  foto1:string = "";
  foto2:string = "";
  captcha:string = "";

  constructor(private formBuilder:FormBuilder, private auth: AuthService, private angularFireStorage: AngularFireStorage)
  {
    this.formPaciente = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern(this.soloLetrasEspacios)]],
      apellido: ['', [Validators.required, Validators.pattern(this.soloLetrasEspacios)]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(65)]],
      dni: ['', [Validators.required, Validators.pattern(this.solo8digitos)]],
      obraSocial: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required, Validators.pattern(".{6,}")]],
      foto1: ['', [Validators.required]],
      foto2: ['', [Validators.required]],
      captcha: ['', [Validators.required]]
    });

    this.captcha = this.generarCaptcha(6);
  }

  async registrarPaciente()
  {
    if(this.formPaciente.valid)
    {
      await this.subirFoto();
      await this.subirFoto2();

      const paciente = {
        nombre: this.formPaciente.value.nombre,
        apellido: this.formPaciente.value.apellido,
        edad: this.formPaciente.value.edad,
        dni: this.formPaciente.value.dni,
        obraSocial: this.formPaciente.value.obraSocial,
        email: this.formPaciente.value.email,
        password: this.formPaciente.value.password,
        fotoPerfil: this.foto1,
        fotoPerfil2: this.foto2,
        perfil: "paciente"
      };

      this.auth.registrarPaciente(paciente);
      this.formPaciente.reset();
    }
    else
    {
      console.log("formulario inválido");
    }
  }

  generarRutaFoto1($event: any)
  {
    this.archivoFoto1 = $event.target.files[0];
    this.rutaFoto1 = 'img ' + Date.now();
  }

  generarRutaFoto2($event: any)
  {
    this.archivoFoto2 = $event.target.files[0];
    this.rutaFoto2 = 'img ' + Date.now();
  }

  async subirFoto()
  {
    return new Promise(async (resolve)=>{
      const referencia = this.angularFireStorage.ref(this.rutaFoto1);
      await referencia.put(this.archivoFoto1).then(async () => {
        referencia.getDownloadURL().subscribe((urlImg) => {
          this.foto1 = urlImg;
          resolve(urlImg);
        });
      });
    });
  }

  async subirFoto2()
  {
    return new Promise(async (resolve)=>{
      const referencia = this.angularFireStorage.ref(this.rutaFoto2);
      await referencia.put(this.archivoFoto2).then(async () => {
        referencia.getDownloadURL().subscribe((urlImg) => {
          this.foto2 = urlImg;
          resolve(urlImg);
        });
      });
    })
  }

  generarCaptcha(num: number)
  {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1 = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
      result1 += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
    }
    return result1;
  }
}
