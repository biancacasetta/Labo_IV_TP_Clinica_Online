import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import 'firebase/compat/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirestoreService } from './firestore.service';
import { map, switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  usuarioIngresado:boolean = false;
  usuarioLogueado:any;

  constructor(private router:Router,
    private angularFireAuth:AngularFireAuth, private firestore: FirestoreService, private angularFirestore: AngularFirestore) { }

  async login(email:string, password:string)
  {
    return new Promise<any> ((resolve, reject) => {
      this.angularFireAuth.signInWithEmailAndPassword(email, password)
        .then(async usuario => {
          this.usuarioIngresado = true;
          resolve(usuario);
        })
        .catch(error => reject(error));
      });
  }

  logout()
  {
      this.usuarioIngresado = false;
      this.angularFireAuth.signOut();
      console.log("Logout exitoso");
  }

  registrarEspecialista(especialista:any)
  {
    this.angularFireAuth.createUserWithEmailAndPassword(especialista.email, especialista.password)
      .then((datos) => {
        datos.user?.sendEmailVerification();
        this.firestore.guardarEspecialista(especialista, datos.user?.uid);
      })
      .catch(
        error => {
          console.error(error);
        }
      );
  }

  registrarPaciente(paciente:any)
  {
    this.angularFireAuth.createUserWithEmailAndPassword(paciente.email, paciente.password)
      .then((datos) => {
        datos.user?.sendEmailVerification();
        this.firestore.guardarPaciente(paciente, datos.user?.uid);
      })
      .catch(
        error => {
          console.error(error);
        }
      );
  }

  registrarAdmin(admin:any)
  {
    this.angularFireAuth.createUserWithEmailAndPassword(admin.email, admin.password)
      .then((datos) => {
        datos.user?.sendEmailVerification();
        this.firestore.guardarAdmin(admin, datos.user?.uid);
      })
      .catch(
        error => {
          console.error(error);
        }
      );
  }

  obtenerUsuarioLogueado()
  {
    return this.angularFireAuth.authState.pipe(
      switchMap((usuario:any) =>{
        if(usuario)
        {
          return this.angularFirestore
          .collection('tp2-usuarios')
          .doc(usuario.uid)
          .get()
          .pipe(
            map((doc) =>{
              const datos = doc.data();
              if(doc.exists && datos)
              {
                return { id: doc.id, ...datos};
              }
              else{
                return null;
              }
            })
            )
        }
        else
        {
          return of(null);
        }
      })
    );
  }
}