import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroCampos'
})
export class FiltroCamposPipe implements PipeTransform {

  transform(value: any): any {
    if (value && typeof value === 'object') {
      const camposFiltradores = ['especialidad', 'altura', 'peso', 'paciente', 'especialista', 'dia', 'hora', 'presion','temperatura'];
      return Object.entries(value).filter(([key]) => !camposFiltradores.includes(key));
    }
    return [];
  }
}
