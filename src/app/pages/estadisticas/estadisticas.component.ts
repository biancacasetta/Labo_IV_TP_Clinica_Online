import { Component } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as FileSaver from 'file-saver';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import {
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  LinearScale,
  registerables,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent {
  spinner:boolean = false;
  popup:boolean = false;
  listaLogs:any = new Array();
  listaTurnos:any = new Array();
  listaTurnoSolicitados:any = new Array();
  listaTurnoFinalizados:any = new Array();
  listaEspecialidades:any = new Array();
  nombresEspecialidades:string[] = [];
  nombresEspecialistas:string[] = [];
  nombresFiltrados:string[] = [];
  turnosPorEspecialidad:any []=[];
  turnosPorDia = [0,0,0,0,0,0];
  turnosSolicitados:any[] = [];
  turnosSolicitadosOrdenados:any[] = [];
  turnosFinalizados:any[] = [];
  turnosFinalizadosOrdenados:any[] = [];
  cantidadTurnosPorEspecialidad:any[] = [];
  cantidadTurnosPorEspecialidadOrdenadas:any[] = [];
  turnosMedicoPorTiempo:any []=[];
  turnosFinalizadosMedicoPorTiempo:any []=[];
  barChart:any;
  chartPorEspecialidad:any;
  logs:boolean = false;
  turnosEspecialidad:boolean = false;
  turnosPorDias:boolean = false;
  turnosSolicitadosGrafico:boolean = false;
  turnosFinalizadosGrafico:boolean = false;
  constructor(private firestore:FirestoreService,
    private auth:AuthService)
  { 
    this.spinner = true;
    Chart.register(
      BarElement,
      BarController,
      CategoryScale,
      Decimation,
      Filler,
      Legend,
      Title,
      Tooltip,
      LinearScale
    );
    Chart.register(...registerables);
    this.listaLogs = [];
    this.listaTurnos = [];
    this.firestore.obtenerColeccion("tp2-registros").subscribe((logs)=>{
      this.listaLogs = [...logs];
    });
    this.firestore.obtenerColeccion("tp2-especialidades").subscribe((especialidades)=>{
      this.listaEspecialidades = [...especialidades];

      for (let i = 0; i < especialidades.length; i++)
      {
        this.nombresEspecialidades.push(especialidades[i].nombre);
      }

      this.nombresEspecialidades.sort();
    });

    this.firestore.obtenerColeccion("tp2-usuarios").subscribe((usuarios)=>{
      for (let i = 0; i < usuarios.length; i++) {
        if(usuarios[i].perfil == "especialista")
        {
          this.nombresEspecialistas.push(usuarios[i].nombre + ' ' + usuarios[i].apellido);
        }
      }

      this.nombresEspecialistas.sort();
    });
    
    this.firestore.obtenerColeccion("tp2-turnos").subscribe((turnos)=>{
      this.listaTurnos = [...turnos];
      this.cargarTurnosPorEspecialidad();
      this.cargarTurnosPorDia();
      for (let i = 0; i < turnos.length; i++) {
        if(turnos[i].estado == 'solicitado')
        {
          this.listaTurnoSolicitados.push(turnos[i]);
        }  
        else if(turnos[i].estado == 'realizado')
        {
          this.listaTurnoFinalizados.push(turnos[i]);
        }
      }
      this.cargarTurnosSolicitadosMedico();
      this.cargarTurnosFinalizadosMedico();
    });
    setTimeout(()=>{
      this.spinner = false;
    },2500);
  }

  cargarTurnosPorDia()
  {
    for (let i = 0; i < this.listaTurnos.length; i++)
    {
      const [dia, mes, anio] = this.listaTurnos[i].dia.split('-');
      const fecha = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
      const diaSemana = fecha.getDay();

      switch(diaSemana)
      { 
        case 1:
          this.turnosPorDia[0]++;
          break;
        case 2:
          this.turnosPorDia[1]++;
          break;
        case 3:
          this.turnosPorDia[2]++;
          break;
        case 4:
          this.turnosPorDia[3]++;
          break;
        case 5:
          this.turnosPorDia[4]++;
          break;
        case 6:
          this.turnosPorDia[5]++;
          break;             
      } 
    }
  }

  formeatearFecha(fecha:string)
  {
    const fechaActual = new Date(fecha);
    const dia = fechaActual.toLocaleDateString('es-AR', { weekday: 'long' });
    return dia;
  }

  cargarTurnosPorEspecialidad()
  {
    let keys:any[] = [];

    for (let i = 0; i < this.listaTurnos.length; i++)
    {
      if(!keys.includes(this.listaTurnos[i].especialidad.nombre))
      {
        keys.push(this.listaTurnos[i].especialidad.nombre);
        this.cantidadTurnosPorEspecialidad[this.listaTurnos[i].especialidad.nombre] = 1;
      }
      else
      {
        this.cantidadTurnosPorEspecialidad[this.listaTurnos[i].especialidad.nombre]++;
      }
    }

    for (let j = 0; j < this.listaEspecialidades.length; j++)
    {
      if(!keys.includes(this.listaEspecialidades[j].nombre))
      {
        keys.push(this.listaEspecialidades[j].nombre);
        this.cantidadTurnosPorEspecialidad[this.listaEspecialidades[j].nombre] = 0;
      }
    }

    keys.sort();

    keys.forEach((key:any) => {
      this.cantidadTurnosPorEspecialidadOrdenadas[key] = this.cantidadTurnosPorEspecialidad[key];
    });
  }

  cargarTurnosSolicitadosMedico()
  {
    let keys:any[] = [];

    for (let i = 0; i < this.listaTurnoSolicitados.length; i++)
    {
      const nombreEspecialista:any = `${this.listaTurnoSolicitados[i].especialista.nombre} ${this.listaTurnoSolicitados[i].especialista.apellido}`;
      if(!keys.includes(nombreEspecialista))
      {
        keys.push(nombreEspecialista);
        this.turnosSolicitados[nombreEspecialista] = 1;
      }
      else
      {
        this.turnosSolicitados[nombreEspecialista]++;
      }
    }

    keys.sort();

    keys.forEach((key:any) => {
      this.turnosSolicitadosOrdenados[key] = this.turnosSolicitados[key];
    });

  }

  cargarTurnosFinalizadosMedico()
  {
    let keys:any[] = [];

    for (let i = 0; i < this.listaTurnoFinalizados.length; i++)
    {
      const nombreEspecialista:any = `${this.listaTurnoSolicitados[i].especialista.nombre} ${this.listaTurnoSolicitados[i].especialista.apellido}`;
      if(!keys.includes(nombreEspecialista))
      {
        keys.push(nombreEspecialista);
        this.turnosFinalizados[nombreEspecialista] = 1;
      }
      else
      {
        this.turnosFinalizados[nombreEspecialista]++;
      }
    }

    keys.sort();

    keys.forEach((key:any) => {
      this.turnosFinalizadosOrdenados[key] = this.turnosFinalizados[key];
    });
  }

  generarGraficoBarras()
  {
    if (this.barChart) {
      this.barChart.destroy();
    }
    const ctx = (<any>document.getElementById('barChart')).getContext('2d');
    const colors = [
      '#FF8A98',
      '#FD5C6F',
    ];
    
    //@ts-ignore
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.nombresEspecialidades,
        datasets: [{
          label: 'Turnos',
          data: Object.values(this.cantidadTurnosPorEspecialidadOrdenadas),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10
          }
        }
      }
    });
  }

  generarGraficoBarrasDias()
  {
    if (this.barChart) {
      this.barChart.destroy(); // Destruir el gráfico existente antes de crear uno nuevo
    }
    const ctx = (<any>document.getElementById('barChartDias')).getContext('2d');
    const colors = [
      '#FF8A98',
      '#FD5C6F',
    ];

    //@ts-ignore
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Lunes', 'Martes', 'Miércoles','Jueves','Viernes','Sábado'],
        datasets: [{
          label: 'Turnos por día',
          data: this.turnosPorDia,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10
          }
        }
      }
    });
  }

  generarGraficoSolicitados()
  {
    if (this.chartPorEspecialidad) {
      this.chartPorEspecialidad.destroy(); // Destruir el gráfico existente antes de crear uno nuevo
    }
    const ctx = (<any>(
      document.getElementById('turnosSolicitadosPorMedico'))).getContext('2d');

      const colors = [
        '#FF8A98',
        '#FD5C6F',
      ];

    const datos = this.nombresFiltrados.map((nombre:any, index:number) => ({
      
    }));

    console.log(datos);

    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.nombresEspecialistas,
        datasets:
        [{
          label: "Turnos solicitados",
          data: Object.values(this.turnosSolicitadosOrdenados),
          backgroundColor: colors,
        }]
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10
          }
        }
      },
    });
  }
  
  generarGraficoFinalizadosMedico()
  {
    if (this.barChart) {
      this.barChart.destroy(); // Destruir el gráfico existente antes de crear uno nuevo
    }
    const ctx = (<any>document.getElementById('barChartFinalizados')).getContext('2d');
    const colors = [
      '#FF8A98',
      '#FD5C6F',
    ];

    //@ts-ignore
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.nombresEspecialistas,
        datasets: [{
          label: 'Turnos realizados',
          data:  Object.values(this.turnosFinalizadosOrdenados),
          backgroundColor: colors,
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10
          }
        }
      }
    });
  }

  exportarComoExcel(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.guardarComoExcel(excelBuffer, excelFileName);
  }

  guardarComoExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }

  descargarExcelLogs() {
    this.exportarComoExcel(this.listaLogs, 'logUsuarios');
  }

  descargarPDFLogs() {
    const DATA = document.getElementById('pdflogs');
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
        docResult.save(`logs_usuarios.pdf`);
      });
  }

  descargarPDFTurnosFinalizadosPorMedico() {
    const DATA = document.getElementById('pdfTurnosFinalizadosPorMedico');
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
        docResult.save(`turnosFinalizadosPorMedico.pdf`);
      });
  }

  descargarPDFTurnosSolicitadosPorMedico() {
    const DATA = document.getElementById('pdfTurnosSolicitadosPorMedico');
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
        docResult.save(`pdfTurnosSolicitadosPorMedico.pdf`);
      });
  }

  descargarPDFTurnosPorDiaPorMedico() {
    const DATA = document.getElementById('pdfTurnosPorDiaPorMedico');
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
        docResult.save(`pdfTurnosPorDiaPorMedico.pdf`);
      });
  }

  descargarPDFTurnosEspecialidadPorMedico() {
    const DATA = document.getElementById('pdfTurnosPorEspecialidadPorMedico');
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
        docResult.save(`pdfTurnosPorEspecialidadPorMedico.pdf`);
      });
  }
}
