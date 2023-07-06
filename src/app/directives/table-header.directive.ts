import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTableHeader]'
})
export class TableHeaderDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', '#FF8A98');
    this.renderer.setStyle(this.el.nativeElement, 'color', 'white');
  }
}
