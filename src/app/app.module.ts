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
    FormRegistroAdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  providers: [{ provide: FIREBASE_OPTIONS, useValue: environment.firebase }],
  bootstrap: [AppComponent]
})
export class AppModule { }
