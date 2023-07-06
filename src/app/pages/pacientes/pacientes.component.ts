import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent {

  historialPorPaciente:any = new Array();
  listaPacientes:any = new Array();
  usuariosPorEspecialista:any = new Array();
  comentario:boolean = false;
  especialista:any;
  listaTurnosPorEspecialista:any = new Array();
  spinner:boolean = false;
  abrirComentario:boolean = false;
  pacientesCount: { [paciente: string]: { count: number; fechas: string[] } } = {};

  constructor(private auth: AuthService, private firestore: FirestoreService) {}

  ngOnInit()
  {
    this.auth.obtenerUsuarioLogueado().subscribe((usuario)=>{
      this.especialista = usuario;
      console.log(usuario);
      this.listaTurnosPorEspecialista = [];
      this.firestore.obtenerColeccion("tp2-turnos").subscribe((turnos)=>{
        for (let i = 0; i < turnos.length; i++) {
          if(turnos[i].especialista.id == this.especialista.id && turnos[i].estado == "realizado")
          {
            this.listaTurnosPorEspecialista.push(turnos[i]);
          }
        }

        this.filtrarTurnos();
      });
    })
  }

  obtenerConteoPacientes(): void {
    this.pacientesCount = {};
    for (const historia of this.listaTurnosPorEspecialista) {
      const paciente = historia.paciente;
      const fecha = historia.fechaTurno;

      if (paciente.id in this.pacientesCount) {
        this.pacientesCount[paciente.id].count++;
        if (this.pacientesCount[paciente.id].fechas.length < 3) {
          this.pacientesCount[paciente.id].fechas.push(fecha);
        }
      } else {
        this.pacientesCount[paciente.id] = { count: 1, fechas: [fecha] };
      }
    }
  }

  obtenerFechasPaciente(pacienteInfo: { count: number; fechas: string[]; }): string {
    const fechas = pacienteInfo.fechas.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return fechas.length > 0 ? fechas.join('<br> ') : 'No hay fechas disponibles';
  }

  filtrarTurnos(): void {
    this.listaPacientes = [];
    const pacientesSet = new Set<string>();
    for (const turno of this.listaTurnosPorEspecialista) {
      const paciente = turno.paciente;

      if (!pacientesSet.has(paciente.id)) {
        pacientesSet.add(paciente.id);
        this.listaPacientes.push(paciente);
      }
    }

    console.log(this.listaPacientes);
  }

  verComentario(paciente:any)
  {
    this.comentario = true;
    this.obtenerHistorialPorPaciente(paciente);
  }

  obtenerHistorialPorPaciente(paciente:any)
  {
    this.historialPorPaciente = [];
    console.log(this.listaTurnosPorEspecialista);
    for (let i = 0; i < this.listaTurnosPorEspecialista.length; i++) {
      if(this.listaTurnosPorEspecialista[i].paciente.id == paciente.id)
      {
        this.historialPorPaciente.push(this.listaTurnosPorEspecialista[i]);
      }
    }
    console.log(this.historialPorPaciente);
  }

}
