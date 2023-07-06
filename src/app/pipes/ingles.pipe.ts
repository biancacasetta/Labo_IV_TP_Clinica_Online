import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ingles'
})
export class InglesPipe implements PipeTransform {

  inglesActivado = false;

  toggleIdioma(enabled: boolean): void {
    this.inglesActivado = enabled;
  }

  transform(value: string): string {
    if (this.inglesActivado) {
      console.log("activo ingles");
      switch (value) {
        case 'Bienvenida':
          return 'home';
        case 'usuarios':
          return 'users';
        case 'solicitar turno':
          return 'make appointment';
        case 'turnos':
          return 'appointments';
        case 'mis turnos':
          return 'my appointments';
        case 'pacientes':
          return 'patients';
        case 'estadísticas':
          return 'statistics';
        default:
          return value;
      }
    } else {
      return value;
    }
  }

}
