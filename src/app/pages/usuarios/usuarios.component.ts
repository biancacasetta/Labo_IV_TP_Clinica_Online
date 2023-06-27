import { Component } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {

  listaUsuarios:any;
  listaPacientes:any[] = [];
  listaEspecialistas:any[] = [];
  listaAdmins:any[] = [];

  vistaUsuarios:string = "admins";

  constructor(private firestore: FirestoreService) {}

  ngOnInit()
  {
    this.firestore.obtenerColeccion("tp2-usuarios").subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
      this.filtrarPerfil(this.listaUsuarios);
    });
  }

  filtrarPerfil(lista:any)
  {
    this.listaPacientes = [];
    this.listaEspecialistas = [];
    this.listaAdmins = [];

    for (let i = 0; i < lista.length; i++)
    {
      switch(lista[i].perfil)
      {
        case "paciente":
          this.listaPacientes.push(lista[i]);
          break;
        case "especialista":
          this.listaEspecialistas.push(lista[i]);
          break;
        case "admin":
          this.listaAdmins.push(lista[i]);
          break;
      }
    }
  }

  cambiarVistaUsuarios(vista:string)
  {
    this.vistaUsuarios = vista;
  }

  async toggleEspecialistaAprobado(email:string)
  {
    let especialista:any = {};
    await this.firestore.obtenerUsuarioPorEmail(email).then((usuario) => {
      usuario.subscribe((user:any) => {
        especialista = user;
      });
    });
    
    setTimeout(() => {
      especialista[0].aprobado = !especialista[0].aprobado;
      this.firestore.actualizarUsuario(especialista[0]);
    }, 2000);
    
  }

}
