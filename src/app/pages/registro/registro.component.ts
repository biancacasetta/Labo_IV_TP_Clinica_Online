import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { deslizarIzqADerAnimacion } from '../animaciones';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  animations: [deslizarIzqADerAnimacion]
})
export class RegistroComponent {

  vista:string = "seleccion";
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

}
