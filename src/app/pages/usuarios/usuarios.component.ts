import { Component } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {

  listaUsuarios:any;
  listaTurnos:any;
  turnosPaciente:any[] = [];

  constructor(private firestore: FirestoreService) {}

  ngOnInit()
  {
    this.firestore.obtenerColeccion("tp2-usuarios").subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
      console.log(this.listaUsuarios);
    });

    this.firestore.obtenerColeccion("tp2-turnos").subscribe((turnos) => {
      this.listaTurnos = turnos;
    });
  }

  async toggleEspecialistaAprobado(email:string)
  {
    let especialista:any = {};
    await this.firestore.obtenerUsuarioPorEmail(email).then((usuario) => {
      usuario.subscribe((user:any) => {
        especialista = user;
      });
    });
    
    setTimeout(() => {
      especialista[0].aprobado = !especialista[0].aprobado;
      this.firestore.actualizarUsuario(especialista[0]);
    }, 2000);
    
  }

  exportarArchivoExcel(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.guardarArchivoExcel(excelBuffer, excelFileName);
  }

  guardarArchivoExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }

  descargarExcel()
  {
    this.exportarArchivoExcel(this.listaUsuarios, 'Datos usuarios');
  }

  filtrarTurnosPorPaciente(paciente:any)
  {
    this.turnosPaciente = [];
    for (let i = 0; i < this.listaTurnos.length; i++) {
      if(paciente.id == this.listaTurnos[i].paciente.id)
      {
        this.turnosPaciente.push(this.listaTurnos[i]);
      } 
    }
  }

  descargarExcelPaciente(paciente:any) {
    if(paciente.perfil == 'paciente')
    {
      this.filtrarTurnosPorPaciente(paciente);
      this.exportarArchivoExcel(this.turnosPaciente, 'Turnos paciente');
    }
  }

}
