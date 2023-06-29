import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { deslizarArribaAbajoAnimacion } from '../animaciones';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.css'],
  animations: [deslizarArribaAbajoAnimacion],
})
export class BienvenidaComponent {

  constructor(public auth: AuthService) {}

}
