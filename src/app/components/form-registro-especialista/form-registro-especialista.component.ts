import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-registro-especialista',
  templateUrl: './form-registro-especialista.component.html',
  styleUrls: ['./form-registro-especialista.component.css']
})
export class FormRegistroEspecialistaComponent {
  @Output() activarSpinner: EventEmitter<any> = new EventEmitter<any>();

  //@ts-ignore
  formEspecialista: FormGroup;
  soloLetrasEspacios:string = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$";
  emailPattern:any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  solo8digitos:string = "[0-9]{8}";
  listaEspecialidades:any;
  archivoFoto:string = "";
  rutaFoto:string = "";
  fotoPerfil:string = "";
  captcha: string = "";
  spinner:boolean = false;
  
  formEspecialidad:FormGroup;
  popup:boolean = false;
  nuevaEspecialidad:string = "";

  constructor(private formBuilder:FormBuilder, private firestore: FirestoreService, private auth: AuthService,
    private angularFireStorage: AngularFireStorage, private router: Router)
  {
    this.formEspecialista = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern(this.soloLetrasEspacios)]],
      apellido: ['', [Validators.required, Validators.pattern(this.soloLetrasEspacios)]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(65)]],
      dni: ['', [Validators.required, Validators.pattern(this.solo8digitos)]],
      especialidad: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required, Validators.pattern(".{6,}")]],
      fotoPerfil: ['', [Validators.required]],
      captcha: ['', [Validators.required]]
    });

    this.captcha = this.generarCaptcha(6);

    this.formEspecialidad = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern(this.soloLetrasEspacios)]],
      fotoEspecialidad: ['', [Validators.required]],
    });
    
    this.activarSpinner.emit();
  }
  
  ngOnInit()
  {
    this.firestore.obtenerColeccion("tp2-especialidades").subscribe((data) => {
      this.listaEspecialidades = data;
      console.log(this.listaEspecialidades);
    });

    this.spinner = true;

    setTimeout(() => {
      this.spinner = false;
    }, 2000);
  }

  async registrarEspecialista()
  {
    if(this.formEspecialista.valid)
    {
      this.spinner = true;
      await this.subirFoto("fotoPerfil");

      const especialista = {
        nombre: this.formEspecialista.value.nombre,
        apellido: this.formEspecialista.value.apellido,
        edad: this.formEspecialista.value.edad,
        dni: this.formEspecialista.value.dni,
        especialidades: this.obtenerEspecialidadesSeleccionadas(),
        email: this.formEspecialista.value.email,
        password: this.formEspecialista.value.password,
        fotoPerfil: this.fotoPerfil,
        aprobado: false,
        perfil: "especialista",
        duracionTurno: 30,
        disponibilidad: []
      };

      this.auth.registrarEspecialista(especialista);
      this.formEspecialista.reset();
      this.spinner = false;
      this.router.navigateByUrl('/login');
    }
    else
    {
      console.log("formulario inválido");
    }
  }

  obtenerEspecialidadesSeleccionadas()
  {
    const checkboxes = document.getElementsByName('especialidad');
    let especialidadesSeleccionadas: string[] = [];

    checkboxes.forEach((checkbox)=>{
      //@ts-ignore
      if(checkbox.checked)
      {
        //@ts-ignore
        especialidadesSeleccionadas.push(checkbox.value);
      }
    });
    return especialidadesSeleccionadas;
  }

  async registrarEspecialidad()
  {
    if(this.formEspecialidad.valid)
    {
      await this.subirFoto("especialidad");

      const especialidad = {
        nombre: this.formEspecialidad.value.nombre,
        foto: this.nuevaEspecialidad,
      };

      this.firestore.guardarEspecialidad(especialidad);
      this.formEspecialidad.reset();
      this.popup = false;
    }
    else
    {
      console.log("formulario inválido");
    }
  }

  generarRutaFoto($event: any)
  {
    this.archivoFoto = $event.target.files[0];
    this.rutaFoto = 'img ' + Date.now();
  }

  async subirFoto(tipoFoto:string)
  {
    return new Promise(async (resolve)=>{
      const referencia = this.angularFireStorage.ref(this.rutaFoto);
      await referencia.put(this.archivoFoto).then(async () => {
        referencia.getDownloadURL().subscribe((urlImg) => {
          if(tipoFoto == "fotoPerfil")
          {
            this.fotoPerfil = urlImg;
            resolve(urlImg);
          }
          if(tipoFoto == "especialidad")
          {
            this.nuevaEspecialidad = urlImg;
            resolve(urlImg);
          }
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
