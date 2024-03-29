import { Component } from '@angular/core';
import { InglesPipe } from 'src/app/pipes/ingles.pipe';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  usuarioActual:any;
  spinner:boolean = false;

  constructor(public auth: AuthService, public pipeIngles: InglesPipe) {
    
  }

  ngAfterViewInit()
  {
    this.auth.obtenerUsuarioLogueado().subscribe((usuario) => {
      if(usuario)
      {
        this.usuarioActual = usuario;
      }
    });
  }

  cerrarSesion()
  {
    this.spinner = true;

    setTimeout(() => {
      this.spinner = false;
    }, 2000);
  }



}
