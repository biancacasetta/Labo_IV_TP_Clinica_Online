import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BienvenidaComponent } from './pages/bienvenida/bienvenida.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { FormRegistroEspecialistaComponent } from './components/form-registro-especialista/form-registro-especialista.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormRegistroPacienteComponent } from './components/form-registro-paciente/form-registro-paciente.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { FormRegistroAdminComponent } from './components/form-registro-admin/form-registro-admin.component';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil.component';
import { SolicitarTurnoComponent } from './pages/solicitar-turno/solicitar-turno.component';
import { TurnosComponent } from './pages/turnos/turnos.component';
import { MisTurnosComponent } from './pages/mis-turnos/mis-turnos.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { FiltroCamposPipe } from './pipes/filtro-campos.pipe';
import { DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EstadisticasComponent } from './pages/estadisticas/estadisticas.component';
import { CardHoverDirective } from './directives/card-hover.directive';
import { LogoHoverDirective } from './directives/logo-hover.directive';
import { TableHeaderDirective } from './directives/table-header.directive';
import { TableRowDirective } from './directives/table-row.directive';
import { MayusculaPipe } from './pipes/mayuscula.pipe';
import { InglesPipe } from './pipes/ingles.pipe';
import { PrimeraMayusculaPipe } from './pipes/primera-mayuscula.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    BienvenidaComponent,
    LoginComponent,
    RegistroComponent,
    FormRegistroEspecialistaComponent,
    FormRegistroPacienteComponent,
    SpinnerComponent,
    UsuariosComponent,
    FormRegistroAdminComponent,
    MiPerfilComponent,
    SolicitarTurnoComponent,
    TurnosComponent,
    MisTurnosComponent,
    PacientesComponent,
    FiltroCamposPipe,
    EstadisticasComponent,
    CardHoverDirective,
    LogoHoverDirective,
    TableHeaderDirective,
    TableRowDirective,
    MayusculaPipe,
    InglesPipe,
    PrimeraMayusculaPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  providers: [{ provide: FIREBASE_OPTIONS, useValue: environment.firebase }, DatePipe, InglesPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
