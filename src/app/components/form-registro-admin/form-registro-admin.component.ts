import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-registro-admin',
  templateUrl: './form-registro-admin.component.html',
  styleUrls: ['./form-registro-admin.component.css']
})
export class FormRegistroAdminComponent {

   //@ts-ignore
   formAdmin: FormGroup;
   soloLetrasEspacios:string = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$";
   emailPattern:any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   solo8digitos:string = "[0-9]{8}";
 
   archivoFoto:string = "";
   rutaFoto:string = "";
   foto:string = "";
   captcha:string = "";
   spinner:boolean = false;
 
   constructor(private formBuilder:FormBuilder, private auth: AuthService, private angularFireStorage: AngularFireStorage,
    private router: Router)
   {
     this.formAdmin = this.formBuilder.group({
       nombre: ['', [Validators.required, Validators.pattern(this.soloLetrasEspacios)]],
       apellido: ['', [Validators.required, Validators.pattern(this.soloLetrasEspacios)]],
       edad: ['', [Validators.required, Validators.min(18), Validators.max(65)]],
       dni: ['', [Validators.required, Validators.pattern(this.solo8digitos)]],
       email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
       password: ['', [Validators.required, Validators.pattern(".{6,}")]],
       fotoPerfil: ['', [Validators.required]],
       captcha: ['', [Validators.required]]
     });

     this.captcha = this.generarCaptcha(6);
   }
 
   async registrarAdmin()
   {
     if(this.formAdmin.valid)
     {
      this.spinner = true;
        await this.subirFoto();
  
        const admin = {
          nombre: this.formAdmin.value.nombre,
          apellido: this.formAdmin.value.apellido,
          edad: this.formAdmin.value.edad,
          dni: this.formAdmin.value.dni,
          email: this.formAdmin.value.email,
          password: this.formAdmin.value.password,
          fotoPerfil: this.foto,
          perfil: "admin",
        };
  
        this.auth.registrarAdmin(admin);
        this.formAdmin.reset();
        this.spinner = false;
        this.router.navigateByUrl('/login');
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
 
   async subirFoto()
   {
     return new Promise(async (resolve)=>{
       const referencia = this.angularFireStorage.ref(this.rutaFoto);
       await referencia.put(this.archivoFoto).then(async () => {
         referencia.getDownloadURL().subscribe((urlImg:any) => {
           this.foto = urlImg;
           resolve(urlImg);
         });
       });
     });
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
