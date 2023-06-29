import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-solicitar-turno',
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.css']
})
export class SolicitarTurnoComponent {

  listaUsuarios:any;
  listaEspecialistas:any[] = [];
  listaEspecialidades:any;
  listaTurnos:any;
  listaPacientes:any[] = [];
  pagina = 1;
  especialistaSeleccionado:any;
  especialidadSeleccionada:any;
  diasDisponibles:any;
  diaSeleccionado:string = "";
  horasDisponibles:any;
  horaSeleccionada:string = "";
  paciente:any;
  admin:any;

  dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  horas: string[] = [];

  constructor(private firestore: FirestoreService, private auth: AuthService) {}

  ngOnInit()
  {
    this.firestore.obtenerColeccion("tp2-usuarios").subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
      this.filtrarEspecialistas(this.listaUsuarios);
    });

    this.firestore.obtenerColeccion("tp2-especialidades").subscribe((esp) => {
      this.listaEspecialidades = esp;
    });

    this.firestore.obtenerColeccion("tp2-turnos").subscribe((turnos) => {
      this.listaTurnos = turnos;
    });
  }

  ngAfterViewInit()
  {
    this.auth.obtenerUsuarioLogueado().subscribe((usuario) => {
      if(usuario)
      {
        this.paciente = usuario;

        if(this.paciente.perfil == 'admin')
        {
          this.admin = this.paciente;
          this.pagina = 0;
        }
      }
    });
  }

  filtrarEspecialistas(lista:any)
  {
    this.listaEspecialistas = [];
    this.listaPacientes = [];

    for (let i = 0; i < lista.length; i++)
    {
      if(lista[i].perfil == "especialista")
      {
        this.listaEspecialistas.push(lista[i]);
      }
      else if(lista[i].perfil == "paciente")
      {
        this.listaPacientes.push(lista[i]);
      }
    }
  }

  seleccionarPaciente(paciente:any)
  {
    this.paciente = paciente;
    this.pagina = 1;

  }

  seleccionarEspecialista(especialista:any)
  {
    this.especialistaSeleccionado = especialista;
    this.pagina = 2;
  }

  seleccionarEspecialidad(especialidad:string)
  {
    this.especialidadSeleccionada = this.listaEspecialidades.find((e:any) => e.nombre === especialidad);
    this.diasDisponibles = this.obtenerDiasDisponibles(this.especialistaSeleccionado, this.especialidadSeleccionada.nombre);
    console.log(this.diasDisponibles);
    this.pagina = 3;
  }

  seleccionarDia(dia:string)
  {
    this.diaSeleccionado = dia;
    this.horasDisponibles = this.obtenerHorasDisponibles(this.especialistaSeleccionado,
      this.especialidadSeleccionada.nombre, this.diaSeleccionado);
    this.pagina = 4;
  }

  seleccionarHora(hora:string)
  {
    this.horaSeleccionada = hora;
    this.pagina = 5;
  }

  insertarFotoEspecialidad(especialidad:string)
  {
    for (let i = 0; i < this.listaEspecialidades.length; i++) {
      if(this.listaEspecialidades[i].nombre == especialidad)
      {
        return this.listaEspecialidades[i].foto;
      }
    }
  }

  obtenerDiasDisponibles(especialista: any, especialidad: string): string[] {
    const disponibilidad = especialista.disponibilidad.find((disp: any) => disp.especialidad === especialidad);
  
    if (!disponibilidad) {
      return [];
    }
  
    const diasDisponibles = disponibilidad.horarios.map((horario: any) => horario.dia);
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
    const setDiasDisponibles = new Set(diasDisponibles);
    const diasIncluidos = diasSemana.filter((dia) => setDiasDisponibles.has(dia));
  
    const proximos15Dias = [];
    const hoy = new Date();
    for (let i = 0; i < 15; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
      proximos15Dias.push(fecha); // Agregar la fecha al array proximos15Dias
    }
  
    const diasDisponiblesProximos15 = proximos15Dias
      .filter((fecha) => diasIncluidos.includes(diasSemana[fecha.getDay()]))
      .map((fecha) => {
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const anio = fecha.getFullYear().toString();
        return `${dia}-${mes}-${anio}`; // Formato DD-MM-AAAA
      });
  
    return diasDisponiblesProximos15;
  }

  obtenerHorasDisponibles(especialistaSeleccionado: any, especialidadSeleccionada: string, fechaSeleccionada: string): string[] {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
    const [dia, mes, anio] = fechaSeleccionada.split('-');
    const fecha = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
    const diaSemana = diasSemana[fecha.getDay()];
  
    const disponibilidad = especialistaSeleccionado.disponibilidad.find((disp: any) => disp.especialidad === especialidadSeleccionada);
    if (!disponibilidad) {
      return [];
    }
    
    const horariosDia = disponibilidad.horarios.find((horario: any) => horario.dia === diaSemana);
    if (!horariosDia) {
      return [];
    }

    const horasDisponibles = [...horariosDia.hora];

    this.formatearHoras(horasDisponibles);

    //verificar si la fecha y hora ya estan en un turno existente
    return this.filtrarHorasDisponibles(especialistaSeleccionado, especialidadSeleccionada, fechaSeleccionada, horasDisponibles);
  }

  formatearHoras(horas:string[])
  {
    for (let i = 0; i < horas.length; i++) {

      let hora = parseInt(horas[i].split(':')[0]);
      let minutos = horas[i].split(':')[1];

      if(hora > 12)
      {
        hora = hora - 12;
        horas[i] = `${hora}:${minutos}pm`;
      }
      else if(hora == 12)
      {
        horas[i] = `${hora}:${minutos}pm`;
      }
      else
      {
        horas[i] = `${hora}:${minutos}am`;
      }
    }
  }

  registrarTurno()
  {
    const turno = {
      id: Math.floor(Date.now() / 1000).toString(),
      dia: this.diaSeleccionado,
      hora: this.horaSeleccionada,
      especialista: this.especialistaSeleccionado,
      especialidad: this.especialidadSeleccionada,
      estado: 'solicitado',
      paciente: this.paciente,
    }
    this.firestore.guardarTurno(turno);

    this.pagina = 1;
    this.especialistaSeleccionado = null;
    this.especialidadSeleccionada = null;
    this.diaSeleccionado = "";
    this.horaSeleccionada = "";
  }

  filtrarHorasDisponibles(especialista: any, especialidad:string, fecha: string, horasDisponibles: string[]): string[]
  {
  
    const turnosFiltrados = this.listaTurnos.filter((turno: any) => {
      return (
        turno.especialista.id == especialista.id &&
        turno.especialidad.nombre == especialidad &&
        turno.dia == fecha &&
        (turno.estado !== "aceptado" || turno.estado !== "realizado")
      );
    });

    if (turnosFiltrados.length > 0) {
      turnosFiltrados.forEach((turno: any) => {
        const horaTurno = turno.hora;
        horasDisponibles = horasDisponibles.filter((hora: string) => hora !== horaTurno);
      });
    }
  
    return horasDisponibles;
  }

}
