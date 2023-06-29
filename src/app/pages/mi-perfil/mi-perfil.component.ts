import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent {

  usuarioActual:any;
  dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  horas: string[] = [];
  formDuracion:FormGroup;

  especialidadActual:string = "";
  disponibilidad:any[] = [];
  listaHistoriales:any;
  listaUsuarios:any;
  listaEspecialistas:any;
  historialesClinicosPacienteActual:any[] = [];
  hayHistorialFiltrado:boolean = true;
  fechaActual:any;
  popup:boolean = false;
  historial:boolean = false;

  constructor(public auth: AuthService, private formBuilder: FormBuilder, private firestore: FirestoreService, private datePipe: DatePipe)
  {
    this.formDuracion = this.formBuilder.group({
      duracion: ['', [Validators.required, Validators.min(10), Validators.max(60)]],
    });

    this.fechaActual = this.datePipe.transform((new Date), 'dd/MM/yyyy h:mm:ss');

    this.firestore.obtenerColeccion("tp2-usuarios").subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
      this.filtrarEspecialistas(this.listaUsuarios);
    });

  }

  filtrarEspecialistas(lista:any)
  {
    this.listaEspecialistas = [];

    for (let i = 0; i < lista.length; i++)
    {
      if(lista[i].perfil == "especialista")
      {
        this.listaEspecialistas.push(lista[i]);
      }
    }
  }

  ngAfterViewInit()
  {
    this.auth.obtenerUsuarioLogueado().subscribe((usuario) => {
      if(usuario)
      {
        this.usuarioActual = usuario;

        if(this.usuarioActual.perfil == "especialista")
        {
          this.especialidadActual = this.usuarioActual.especialidades[0];
          this.calcularHorariosTurnos(this.usuarioActual.duracionTurno, 8, 17);
          this.disponibilidad = this.usuarioActual.disponibilidad;
        }

        this.firestore.obtenerHistoriasClinicas().subscribe((historiales) => {
          this.listaHistoriales = historiales;
          for (let i = 0; i < historiales.length; i++) {
            if(historiales[i].paciente?.id == this.usuarioActual.id)
            {
              this.historialesClinicosPacienteActual.push(historiales[i]);
            }
          }
          this.listaHistoriales = [...this.historialesClinicosPacienteActual];
        });
      }


    });

  }

  verTabla(especialidad:string)
  {
    this.especialidadActual = especialidad;
  }

  calcularHorariosTurnos(duracionTurno: number, horaInicio: number, horaFin: number)
  {
    const minutosPorHora = 60;
    const minutosDia = (horaFin - horaInicio) * minutosPorHora;
    
    let minutosActual = 0;
    for (let minutos = 0; minutos < minutosDia; minutos += duracionTurno) {
      const hora = Math.floor(minutosActual / minutosPorHora) + horaInicio;
      const minuto = minutosActual % minutosPorHora;
      const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      this.horas.push(horario);
      
      minutosActual += duracionTurno;
    }
  }

  modificarDuracion()
  {
    this.usuarioActual.duracionTurno = this.formDuracion.value.duracion;
    this.horas = [];
    this.calcularHorariosTurnos(this.usuarioActual.duracionTurno, 8, 17);
    this.firestore.actualizarUsuario(this.usuarioActual);
  }

  actualizarDisponibilidad(especialidad: string, dia: string, hora: string, $event: any)
  {
    if ($event.target.checked)
    {
      const dispoEspecialidad = this.disponibilidad.find((disp: any) => disp.especialidad === especialidad);
  
      if (dispoEspecialidad)
      {
        const dispoDia = dispoEspecialidad.horarios.find((horario: any) => horario.dia === dia);
        
        if (dispoDia)
        {
          dispoDia.hora.push(hora);
        }
        else
        {
          dispoEspecialidad.horarios.push({ dia, hora: [hora] });
        }
      }
      else
      {
        this.disponibilidad.push({ especialidad, horarios: [{ dia, hora: [hora] }] });
      }
    }
    else
    {
      const dispoEspecialidad = this.disponibilidad.find((disp: any) => disp.especialidad === especialidad);
  
      if (dispoEspecialidad)
      {
        const dispoDia = dispoEspecialidad.horarios.find((horario: any) => horario.dia === dia);
  
        if (dispoDia)
        {
          dispoDia.hora = dispoDia.hora.filter((h: string) => h !== hora);
          if (dispoDia.hora.length === 0)
          {
            dispoEspecialidad.horarios = dispoEspecialidad.horarios.filter((hor: any) => hor.dia !== dia);
          }
        }
  
        if (dispoEspecialidad.horarios.length === 0)
        {
          this.disponibilidad = this.disponibilidad.filter((disp: any) => disp.especialidad !== especialidad);
        }
      }
    }
  
    this.usuarioActual.disponibilidad = this.disponibilidad;
    this.firestore.actualizarUsuario(this.usuarioActual);
    console.log(this.disponibilidad);
  }
  

  estaDisponible(especialidad: string, dia: string, hora: string): boolean
  {
    const dispoEspecialidad = this.disponibilidad.find((disp: any) => disp.especialidad === especialidad);
    
    if (dispoEspecialidad) {
      const dispoDia = dispoEspecialidad.horarios.find((hor: any) => hor.dia === dia);
      
      if (dispoDia) {
        return dispoDia.hora.includes(hora);
      }
    }
    return false;
  }

  descargarPDF() {
    const DATA = document.getElementById('pdf');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((docResult) => {
        docResult.save(`historia_clinica_usuario.pdf`);
      });
  }

  filtrarEspecialista(especialista:any, seleccion:string)
  {
    this.listaHistoriales = [];
    if(seleccion == 'todos')
    {
      this.listaHistoriales = [...this.historialesClinicosPacienteActual];
    }
    else
    {
      for (let i = 0; i < this.historialesClinicosPacienteActual.length; i++) {
        if(this.historialesClinicosPacienteActual[i].especialista.id == especialista.id)
        {
          this.listaHistoriales.push(this.historialesClinicosPacienteActual[i]);
        }
      }
    }

    if (this.listaHistoriales.length == 0) {
      this.hayHistorialFiltrado = false;
    } else {
      this.hayHistorialFiltrado = true;
    }
  }

}
