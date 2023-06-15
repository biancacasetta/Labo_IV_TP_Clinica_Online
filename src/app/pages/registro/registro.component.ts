import { Component } from '@angular/core';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {

  vista:string = "seleccion";

  elegirVista(vista:string)
  {
    this.vista = vista;
  }

}
