import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { deslizarArribaAbajoAnimacion } from '../animaciones';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [deslizarArribaAbajoAnimacion],
})
export class LoginComponent {

   //@ts-ignore
   formLogin: FormGroup;
   soloLetrasEspacios:string = "^[a-zA-Z\s]+$";
   emailPattern:any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   solo8digitos:string = "[0-9]{8}";
   spinner:boolean = false;

   listaUsuarios:any;
   accesosRapidos:any[] = [];
 
   constructor(private formBuilder:FormBuilder, private auth: AuthService, private firestore: FirestoreService, private router: Router)
   {
     this.formLogin = this.formBuilder.group({
       email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
       password: ['', [Validators.required, Validators.pattern(".{6,}")]],
     });

     this.obtenerUsuariosAccesosRapidos();
   }

   async login()
   {
     if (this.formLogin.valid)
     {
        let verificacion:string = "";
        this.spinner = true;
        try
        {
          await this.auth.login(this.formLogin.value.email, this.formLogin.value.password)
          .then(async(datos:any)=>{
            await this.obtenerDatosUsuario().then((usuario)=>{
              verificacion = this.verificarUsuario(datos,usuario);

                if (verificacion != "verificado")
                {
                  this.auth.logout();
                }
                else
                {
                  this.spinner = false;
                  this.router.navigate(['/bienvenida']);
                  this.firestore.guardarRegistro(usuario);
                }       
          });
        });       
        } catch (error) {
        console.log(error);
      }
     }
   }

   verificarUsuario(datos:any, usuario:any)
  {
    let usuarioVerificado = "El usuario no pertenece a un perfil existente";
    datos.user?.reload;
    switch(usuario.perfil)
    {
      case 'especialista':
        if(usuario.aprobado)
        {     
          if(datos.user.emailVerified)
          {
            usuarioVerificado = "verificado";
          }
          else
          {
            usuarioVerificado = "Falta verificar su correo electrónico.";
          }
        }
        else
        {
          usuarioVerificado = "Especialista no aprobado por administrador";
        }
        break;
      case 'paciente':
        if(datos.user.emailVerified)
          {
            usuarioVerificado = "verificado";
          }
          else
          {
            usuarioVerificado = "Falta verificar su correo electrónico.";
          }
        break;
        default:
          usuarioVerificado = "verificado";
        break;    
    }
    return usuarioVerificado;
  }

  async obtenerDatosUsuario() {
    return new Promise<any>(async(resolve, reject) => {
      (await this.auth.obtenerUsuarioLogueado()).subscribe((user) => {
        resolve(user);
      });
    });
  }

  obtenerUsuariosAccesosRapidos()
  {
    this.firestore.obtenerColeccion("tp2-usuarios").subscribe((data) => {
      this.listaUsuarios = data;

      let pacientes = 0;
      let especialistas = 0;
      let admins = 0;

      data.forEach(usuario => {
      if(this.listaUsuarios.find((u:any) => u.id === usuario.id) === undefined)
      {
        if(usuario.perfil == "admin" && admins == 0)
        {
          this.listaUsuarios.push(usuario);
          admins++;
        }
        else if(usuario.perfil == "especialista" && especialistas < 2)
        {
          this.listaUsuarios.push(usuario);
          especialistas++;
        }
        else if(usuario.perfil == "paciente" && pacientes < 3)
        {
          this.listaUsuarios.push(usuario);
          pacientes++;
        }
      }

     });
    });
      
  }

  insertarAccesoRapido(email:string, password:string)
  {
    this.formLogin.get('email').setValue(email);
    this.formLogin.get('password').setValue(password);
  }


}
