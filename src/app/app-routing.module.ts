import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BienvenidaComponent } from './pages/bienvenida/bienvenida.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil.component';
import { SolicitarTurnoComponent } from './pages/solicitar-turno/solicitar-turno.component';
import { TurnosComponent } from './pages/turnos/turnos.component';
import { MisTurnosComponent } from './pages/mis-turnos/mis-turnos.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { EstadisticasComponent } from './pages/estadisticas/estadisticas.component';

const routes: Routes = [
  {path: "", component: BienvenidaComponent},
  {path: "bienvenida", component: BienvenidaComponent},
  {path: "login", component: LoginComponent},
  {path: "registro", component: RegistroComponent},
  {path: "usuarios", component: UsuariosComponent},
  {path: "mi-perfil", component: MiPerfilComponent},
  {path: "solicitar-turno", component: SolicitarTurnoComponent},
  {path: "turnos", component: TurnosComponent},
  {path: "mis-turnos", component: MisTurnosComponent},
  {path: "pacientes", component: PacientesComponent},
  {path: "estadisticas", component: EstadisticasComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
