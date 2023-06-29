import {trigger, state, style, transition, animate} from '@angular/animations';

export const deslizarArribaAbajoAnimacion = trigger('entrarArribaAbajo', [
    state('void', style({ transform: 'translateY(-100%)' })),
    transition(':enter', [
      animate('0.3s ease-in', style({ transform: 'translateY(0%)' }))
    ]),
    transition(':leave', [
      animate('0.3s ease-out', style({ transform: 'translateY(100%)' }))
    ])
  ]);

  export const deslizarIzqADerAnimacion = trigger('entrarIzqADer', [
    state('void', style({ transform: 'translateX(-100%)' })),
    transition(':enter', [
        animate('0.3s ease-in', style({ transform: 'translateX(0%)' }))
    ]),
    transition(':leave', [
        animate('0.3s ease-out', style({ transform: 'translateX(100%)' }))
    ])
]);