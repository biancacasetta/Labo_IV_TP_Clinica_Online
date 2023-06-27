import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private angularFirestore: AngularFirestore) { }

  obtenerColeccion(nombreColeccion:string)
  {
    const coleccion = this.angularFirestore.collection<any>(nombreColeccion).valueChanges();
    return coleccion;
  }

  guardarEspecialista(especialista:any, uid:any)
  {
    this.angularFirestore.collection('tp2-usuarios').doc(uid)
      .set({
        id: uid,
        nombre: especialista.nombre,
        apellido: especialista.apellido,
        edad: especialista.edad,
        dni: especialista.dni,
        especialidades: especialista.especialidades,
        email: especialista.email,
        password: especialista.password,
        fotoPerfil: especialista.fotoPerfil,
        aprobado: especialista.aprobado,
        perfil: especialista.perfil
      })
      .then(()=>{
        console.log("¡Registro de especialista exitoso!");
      }).catch((error)=>{
        console.log(error.code);
      });
  }

  guardarPaciente(paciente:any, uid:any)
  {
    this.angularFirestore.collection('tp2-usuarios').doc(uid)
      .set({
        id: uid,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        edad: paciente.edad,
        dni: paciente.dni,
        obraSocial: paciente.obraSocial,
        email: paciente.email,
        password: paciente.password,
        fotoPerfil: paciente.fotoPerfil,
        fotoPerfil2: paciente.fotoPerfil2,
        perfil: paciente.perfil
      })
      .then(()=>{
        console.log("¡Registro de paciente exitoso!");
      }).catch((error)=>{
        console.log(error.code);
      });
  }

  guardarAdmin(admin:any, uid:any)
  {
    this.angularFirestore.collection('tp2-usuarios').doc(uid)
      .set({
        id: uid,
        nombre: admin.nombre,
        apellido: admin.apellido,
        edad: admin.edad,
        dni: admin.dni,
        email: admin.email,
        password: admin.password,
        fotoPerfil: admin.fotoPerfil,
        perfil: admin.perfil
      })
      .then(()=>{
        console.log("¡Registro de admin exitoso!");
      }).catch((error)=>{
        console.log(error.code);
      });
  }

  guardarEspecialidad(especialidad:any)
  {
    this.angularFirestore.collection('tp2-especialidades').add(especialidad);
  }

  obtenerUsuarioPorEmail(email:string)
  {
    return new Promise<any>((resolve, reject) => {
      resolve(this.angularFirestore.collection<any>('tp2-usuarios', ref => ref
      .where('email', '==', email)).valueChanges())});  
  }

  actualizarUsuario(usuarioActualizado:any)
  {
    this.angularFirestore.doc<any>(`tp2-usuarios/${usuarioActualizado.id}`).update(usuarioActualizado);
  }
  
}
