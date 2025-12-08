// src/app/shared/datepicker-overlay/datepicker-overlay.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-datepicker-overlay',
  standalone: true,
  template: `<input #input readonly (focus)="open()" [value]="value" />`,
  styles: [`input{width:100%;padding:.4rem}`]
})
export class DatepickerOverlay {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  overlayRef?: OverlayRef;
  value = '';

  constructor(private overlay: Overlay) { }

  open() {
    if (this.overlayRef) { this.overlayRef.dispose(); }
    const pos = this.overlay.position().flexibleConnectedTo(this.input.nativeElement)
      .withPositions([{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }])
      .withDefaultOffsetY(6);
    this.overlayRef = this.overlay.create({ positionStrategy: pos, hasBackdrop: true, backdropClass: 'cdk-overlay-transparent-backdrop' });
    const portal = new ComponentPortal(SimpleCalendarComponent);
    const ref = this.overlayRef.attach(portal);
    ref.instance.select.subscribe((d: string) => { this.value = d; this.overlayRef?.dispose(); });
    this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.dispose());
  }
}

import { EventEmitter } from '@angular/core';
@Component({
  selector: 'simple-calendar',
  standalone: true,
  template: `
    <div class="cal" style="background:white;border:1px solid #ddd;padding:.5rem">
      <input type="date" (change)="onPick($any($event.target).value)" />
      <div style="margin-top:.5rem"><button (click)="chooseToday()">Today</button></div>
    </div>
  `
})
export class SimpleCalendarComponent {
  select = new EventEmitter<string>();
  onPick(v: string) { this.select.emit(v); }
  chooseToday() { this.select.emit(new Date().toISOString().slice(0, 10)); }
}
