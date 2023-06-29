import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css']
})
export class TurnosComponent {

  listaTurnos:any;
  listaTurnosFiltrados:any;
  popup:boolean = false;
  formCancelacion:FormGroup;
  turnoACancelar:any;
  valorBusqueda = "";
  
  constructor(private firestore: FirestoreService, private formBuilder: FormBuilder)
  {
    this.formCancelacion = this.formBuilder.group({
      razon: ['', [Validators.required]],
    });
  }

  ngOnInit()
  {
    this.firestore.obtenerColeccion("tp2-turnos").subscribe((turnos) => {
      this.listaTurnos = turnos;
    });
  }

  cancelarTurno(turno:any)
  {
    this.popup = true;
    this.turnoACancelar = turno;
  }

  actualizarEstadoTurno()
  {
    this.popup = false;
    this.turnoACancelar = this.crearMoldeTurnoCancelado();
    this.firestore.actualizarTurno(this.turnoACancelar);
    this.formCancelacion.reset();
  }

  crearMoldeTurnoCancelado()
  {
    console.log(this.turnoACancelar);
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

  filtrarElementos()
  {
    this.listaTurnosFiltrados = this.listaTurnos.filter((turno:any) =>
      turno.especialidad.nombre.toLowerCase().includes(this.valorBusqueda.toLowerCase()) ||
      turno.especialista.nombre.toLowerCase().includes(this.valorBusqueda.toLowerCase()) ||
      turno.especialista.apellido.toLowerCase().includes(this.valorBusqueda.toLowerCase())
    );
  }
}
