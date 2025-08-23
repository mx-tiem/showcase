import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Chart } from '../chart/chart';
import { WidgetMap } from '../widget-map/widget-map';
import { LoactionInterface, LocationsList } from '../locations-list/locations-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


export interface WidgetInterface {
  id: number;
  width: number;
  height: number;
  type: string;
  anchorX: number;
  anchorY: number;
  chartType?: 'line' | 'bar' | 'radar' | 'pie' | 'polarArea' | 'doughnut';
  mapName?: string;
  controls?: string;
  locations?: LoactionInterface[]
}

@Component({
  selector: 'app-widget',
  imports: [Chart, WidgetMap, LocationsList, CdkDrag, CdkDragHandle, MatIconModule, MatButtonModule],
  templateUrl: './widget.html',
  styleUrl: './widget.scss'
})
export class Widget {
  @Input() widget!: WidgetInterface;
  @Output() widgetMoved = new EventEmitter<any>();
  @Output() widgetDeleted = new EventEmitter<WidgetInterface>();
  scrolling = false

  onDragEnded(event: any) {
    const handleDomData = event.source.element.nativeElement.querySelector('.widget-handle').getBoundingClientRect()
    const x = (handleDomData.left+handleDomData.right)/2
    const y = (handleDomData.top+handleDomData.bottom)/2
    this.widgetMoved.emit({dropPoint: {x: x, y: y}, widget: this.widget, event: event})
    event.source._dragRef.reset();
  }

  onScroll(event: any) {
    this.scrolling = event.target.scrollTop > 0
  }

  deleteWidget() {
    this.widgetDeleted.emit(this.widget)
  }
}
