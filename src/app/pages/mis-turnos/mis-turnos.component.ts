import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-mis-turnos',
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.css']
})
export class MisTurnosComponent {

  usuarioActual:any;
  listaTurnos:any[] = [];
  listaTurnosPaciente:any[] = [];
  listaTurnosEspecialista:any[] = [];
  popup:boolean = false;
  turnoACancelar:any;
  formCancelacion:FormGroup;
  cancelacion:boolean = false;
  comentario:boolean = false;
  comentarioTurno:string = "";
  formAtencion:FormGroup;
  turnoACalificar:any;
  calificacion:boolean = false;
  encuesta:boolean = false;
  rechazo:boolean = false;
  turnoARechazar:any;
  formRechazo:FormGroup;
  turnoFinalizado:any;
  finalizado:boolean = false;
  formFinalizado:FormGroup;
  valorBusqueda = '';
  historialClinico:boolean = false;
  camposDinamicos: { key: string, value: any }[] = [];
  peso:any = '';
  temperatura:any = '';
  presion:any = '';
  altura:any = '';
  error:boolean = false;

  constructor(public auth: AuthService, private firestore: FirestoreService, private formBuilder: FormBuilder)
  {
    this.formCancelacion = this.formBuilder.group({
      razon: ['', [Validators.required]],
    });

    this.formAtencion = this.formBuilder.group({
      razon: ['', [Validators.required]],
    });

    this.formRechazo = this.formBuilder.group({
      razon: ['', [Validators.required]],
    });

    this.formFinalizado = this.formBuilder.group({
      razon: ['', [Validators.required]],
    });
  }

  ngOnInit()
  {
    this.auth.obtenerUsuarioLogueado().subscribe((usuario) => {
      if(usuario)
      {
        this.usuarioActual = usuario;
        this.firestore.obtenerColeccion("tp2-turnos").subscribe((turnos) => {
          this.listaTurnos = turnos;
          this.filtrarTurnos(this.listaTurnos);
        });
      }
    });
  }

  filtrarTurnos(lista:any)
  {
    this.listaTurnosEspecialista = [];
    this.listaTurnosPaciente = [];

    for (let i = 0; i < lista.length; i++) {
      if(lista[i].paciente.id == this.usuarioActual.id)
      {
        this.listaTurnosPaciente.push(lista[i]);
      }
      
      if(lista[i].especialista.id == this.usuarioActual.id)
      {
        this.listaTurnosEspecialista.push(lista[i]);
      }
    }
  }

  cancelarTurno(turno:any)
  {
    this.popup = true;
    this.cancelacion = true;
    this.turnoACancelar = turno;
  }

  calificarAtencion(turno:any)
  {
    this.popup = true;
    this.calificacion = true;
    this.turnoACalificar = turno;
  }

  completarEncuesta()
  {
    this.popup = true;
    this.encuesta = true;
  }

  rechazarTurno(turno:any)
  {
    this.popup = true;
    this.rechazo = true;
    this.turnoARechazar = turno;
  }

  aceptarTurno(turno:any)
  {
    let turnoAceptado = turno;
    turnoAceptado.estado = "aceptado";
    this.firestore.actualizarTurno(turnoAceptado);
  }

  finalizarTurno(turno:any)
  {
    this.popup = true;
    this.finalizado = true;
    this.turnoFinalizado = turno;
  }

  actualizarEstadoCancelado()
  {
    this.popup = false;
    this.cancelacion = false;
    this.turnoACancelar = this.crearMoldeTurnoCancelado();
    this.firestore.actualizarTurno(this.turnoACancelar);
    this.formCancelacion.reset();
  }

  actualizarEstadoRechazado()
  {
    this.popup = false;
    this.rechazo = false;
    this.turnoARechazar = this.crearMoldeTurnoRechazado();
    this.firestore.actualizarTurno(this.turnoARechazar);
    this.formRechazo.reset();
  }

  actualizarEstadoFinalizado()
  {
    this.finalizado = false;
    this.historialClinico = true;
    this.turnoFinalizado = this.crearMoldeTurnoFinalizado();
    this.firestore.actualizarTurno(this.turnoFinalizado);
    this.formFinalizado.reset();
  }

  actualizarComentario()
  {
    this.popup = false;
    this.calificacion = false;
    this.turnoACalificar = this.crearMoldeTurnoCalificado();
    this.firestore.actualizarTurno(this.turnoACalificar);
    this.formAtencion.reset();
  }

  crearMoldeTurnoCancelado()
  {
    let moldeTurno = {
      id: this.turnoACancelar.id,
      especialidad: this.turnoACancelar.especialidad,
      especialista: this.turnoACancelar.especialista,
      paciente: this.turnoACancelar.paciente,
      dia: this.turnoACancelar.dia,
      hora: this.turnoACancelar.hora,
      estado: 'cancelado',
      comentario: this.formCancelacion.value.razon,
    }
    return moldeTurno;
  }

  crearMoldeTurnoCalificado()
  {
    let moldeTurno = {
      id: this.turnoACalificar.id,
      especialidad: this.turnoACalificar.especialidad,
      especialista: this.turnoACalificar.especialista,
      paciente: this.turnoACalificar.paciente,
      dia: this.turnoACalificar.dia,
      hora: this.turnoACalificar.hora,
      estado: this.turnoACalificar.estado,
      comentario: this.formAtencion.value.razon,
    }
    return moldeTurno;
  }

  crearMoldeTurnoRechazado()
  {
    let moldeTurno = {
      id: this.turnoARechazar.id,
      especialidad: this.turnoARechazar.especialidad,
      especialista: this.turnoARechazar.especialista,
      paciente: this.turnoARechazar.paciente,
      dia: this.turnoARechazar.dia,
      hora: this.turnoARechazar.hora,
      estado: 'rechazado',
      comentario: this.formRechazo.value.razon,
    }
    return moldeTurno;
  }

  crearMoldeTurnoFinalizado()
  {
    let moldeTurno = {
      id: this.turnoFinalizado.id,
      especialidad: this.turnoFinalizado.especialidad,
      especialista: this.turnoFinalizado.especialista,
      paciente: this.turnoFinalizado.paciente,
      dia: this.turnoFinalizado.dia,
      hora: this.turnoFinalizado.hora,
      estado: 'realizado',
      comentario: this.formFinalizado.value.razon,
    }
    return moldeTurno;
  }

  verComentario(turno:any)
  {
    this.popup = true;
    this.comentario = true;
    this.comentarioTurno = turno.comentario;
  }

  filtrarElementos() {
    if (this.usuarioActual.perfil == "paciente") {
      this.listaTurnosPaciente = this.listaTurnos.filter(turno =>
        turno.especialidad.nombre.toLowerCase().includes(this.valorBusqueda.toLowerCase()) ||
        turno.especialista.nombre.toLowerCase().includes(this.valorBusqueda.toLowerCase()) ||
        turno.especialista.apellido.toLowerCase().includes(this.valorBusqueda.toLowerCase())
      );
    }
    else {
      this.listaTurnosEspecialista = this.listaTurnos.filter(turno =>
        turno.data.especialidad.name.toLowerCase().includes(this.valorBusqueda.toLowerCase()) ||
        turno.data.paciente.nombre.toLowerCase().includes(this.valorBusqueda.toLowerCase()) ||
        turno.data.paciente.apellido.toLowerCase().includes(this.valorBusqueda.toLowerCase())
      );
    }
  }

  agregarCamposDinamicos() {
    if (this.camposDinamicos.length < 3) {
      this.camposDinamicos.push({ key: '', value: '' });
    }
  }

  quitarCampoDinamico(index: number) {
    this.camposDinamicos.splice(index, 1);
  }

  crearHistorial() {
    const historialClinico: { [ket:string]:any}={
      altura: this.altura,
      peso: this.peso,
      temperatura: this.temperatura,
      presion: this.presion,
      especialista: this.usuarioActual,
      paciente: this.turnoFinalizado.paciente,
      especialidad: this.turnoFinalizado.especialidad,
      dia: this.turnoFinalizado.dia,
      hora: this.turnoFinalizado.hora,
    };
    if(this.altura != '' && this.peso != '' && this.temperatura != '' && this.presion != '')
    {
      this.error = false;
  
      this.camposDinamicos.forEach(campo => {
        historialClinico[campo.key] = campo.value;
      });

      this.firestore.guardarHistoriaClinica(historialClinico);
      this.popup = false;
    }
    else
    {
      this.error = true;
    }

  } 
}
