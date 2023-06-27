import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {

  vista:string = "seleccion";
  spinner:boolean = false;
  popup:boolean = false;
  usuarioActual:any;

  constructor(public auth: AuthService) {}

  ngAfterViewInit()
  {
    this.auth.obtenerUsuarioLogueado().subscribe((usuario) => {
      if(usuario)
      {
        this.usuarioActual = usuario;
      }
    });
  }

  elegirVista(vista:string)
  {
    this.vista = vista;
  }

  activarSpinner()
  {
    this.spinner = true;

    setTimeout(() => {
      this.spinner = false;
    }, 3000);
  }

}
