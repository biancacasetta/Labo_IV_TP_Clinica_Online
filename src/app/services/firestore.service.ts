import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { addDoc, collection } from '@angular/fire/firestore';
import { Firestore } from 'firebase/firestore';
import * as moment from 'moment';

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
        perfil: especialista.perfil,
        duracionTurno: especialista.duracionTurno,
        disponibilidad: especialista.disponibilidad
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

  guardarTurno(turno:any)
  {
    this.angularFirestore.collection("tp2-turnos").add(turno);
  }

  guardarHistoriaClinica(historiaClinica:any)
  {
    this.angularFirestore.collection("tp2-historiales-clinicos").add(historiaClinica);
  }

  guardarRegistro(usuario:any)
  {
    const dia = moment(new Date()).format('DD-MM-YYYY');
    const hora = moment(new Date()).format('HH:mm:ss');

    const registro =
    {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      dia: dia,
      hora: hora,
      perfil: usuario.perfil
    };
    
    this.angularFirestore.collection("tp2-registros").add(registro);
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

  actualizarTurno(turnoActualizado:any)
  {
    this.angularFirestore.collection('tp2-turnos', ref =>
    ref.where('id', '==', turnoActualizado.id))
    .get()
    .subscribe(snapshot => {
      if (snapshot.size === 1) {
        const turnoDoc = snapshot.docs[0];

        turnoDoc.ref.update(turnoActualizado)
          .then(() => {
            console.log('Turno actualizado exitosamente');
          })
          .catch((error) => {
            console.error('Error al actualizar el turno:', error);
          });
      } else {
        console.error('No se encontró un único documento que cumpla con los criterios especificados');
      }
    });
  }

  obtenerHistoriasClinicas()
  {
    const coleccion = this.angularFirestore.collection<any>('tp2-historiales-clinicos');
    return coleccion.valueChanges();
  }
  
}
