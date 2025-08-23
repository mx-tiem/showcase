import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Widget, WidgetInterface } from './widget/widget';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { WidgetDialog } from './widget-dialog/widget-dialog';
import { Subscription } from 'rxjs';
import { WidgetsService } from './widgets-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoactionInterface } from './locations-list/locations-list';

interface GridInterface {
  [key: string]: GridCellInterface[];
}
interface GridCellInterface {
  gridCellId: string | null;
  widgetId: number | null;
  type?: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  coordinates: {
    x: number;
    y: number;
  }
}

const initialGridCell: GridCellInterface = {
  gridCellId: null,
  widgetId: null,
  coordinates: {
    x: 0,
    y: 0
  },
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0
}

const exmapleLocations1: LoactionInterface[] = [
    { name: 'Trg bana Josipa Jelačića', latLng: {lat: 45.81324918928916, lng: 15.97735111094576}, description: 'The central city square and vibrant heart of Zagreb, where historic architecture meets modern city life.'},
    { name: 'HNK', latLng: {lat: 45.80975723831787, lng: 15.969805063066701}, description: 'A grandiose neo-baroque theater showcasing Croatian opera, ballet, and drama in an opulent setting.'},
    { name: 'Glavni Kolodvor', latLng: {lat: 45.80473828332682, lng: 15.978769282109697}, description: 'Zagreb’s main railway station, an elegant 19th-century building that serves as a gateway to domestic and international train travel.'},
    { name: 'Autobusni Kolodvor', latLng: {lat: 45.804391097545974, lng: 15.993206609095234}, description: 'The city’s central bus terminal, a functional hub connecting Zagreb to regional and European destinations.'},
    { name: 'Jarun', latLng: {lat: 45.780687368857066, lng: 15.91743673689596}, description: 'A scenic lake and recreational area popular for kayaking, cycling, and Zagreb’s lively summer nightlife scene.'},
    { name: 'Bundek', latLng: {lat: 45.78539319986199, lng: 15.986879256856362}, description: 'A peaceful urban park and lake ideal for picnics, jogging, or relaxing by the water amidst landscaped greenery.'},
    { name: 'Maksimir', latLng: {lat: 45.824543503132176, lng: 16.01754417423182}, description: 'Home to Zagreb’s largest park and zoo, a vast green space filled with walking trails, lakes, and forested areas.'},
    { name: 'Cibona', latLng: {lat: 45.80319059939342, lng: 15.963846082109576}, description: 'A sports complex best known for the iconic Cibona Tower and the basketball club that has brought pride to the city.'},
    { name: 'Arena', latLng: {lat: 45.77136219265469, lng: 15.943632797451126}, description: 'A massive modern multipurpose venue that hosts everything from concerts and sporting events to large international exhibitions.'},
    { name: 'Botanical Garden', latLng: {lat: 45.80498158199586, lng: 15.971388738789747}, description: 'A serene garden showcasing a diverse collection of plants, trees, and flowers.'}
  ]

const exmapleLocations2: LoactionInterface[] = [
  { name: 'Zagreb #1', latLng: {lat: 45.815399, lng: 15.966568}, description: 'Zagreb location #1'},
  { name: 'Zagreb #2', latLng: {lat: 45.812764, lng: 15.977111}, description: 'Zagreb location #2'},
  { name: 'Zagreb #3', latLng: {lat: 45.821585, lng: 15.955215}, description: 'Zagreb location #3'},
  { name: 'Zagreb #4', latLng: {lat: 45.807397, lng: 15.981849}, description: 'Zagreb location #4'},
  { name: 'Zagreb #5', latLng: {lat: 45.826120, lng: 15.965410}, description: 'Zagreb location #5'},
]

@Component({
  selector: 'app-widgets',
  imports: [ Widget, MatIconModule, MatButtonModule, RouterLink ],
  templateUrl: './widgets.html',
  styleUrl: './widgets.scss',
})
export class Widgets implements AfterViewInit, OnDestroy {
  newWidgetSub = new Subscription()
  private _snackBar = inject(MatSnackBar);

  grid: GridInterface = {
    row1: [initialGridCell, initialGridCell, initialGridCell, initialGridCell, initialGridCell, initialGridCell],
    row2: [initialGridCell, initialGridCell, initialGridCell, initialGridCell, initialGridCell, initialGridCell],
    row3: [initialGridCell, initialGridCell, initialGridCell, initialGridCell, initialGridCell, initialGridCell],
    row4: [initialGridCell, initialGridCell, initialGridCell, initialGridCell, initialGridCell, initialGridCell]
  }
  gridRows = () => Object.keys(this.grid);

  nextCellId = 0;

  allWidgets: WidgetInterface[] = [
    { id: 1, width: 2, height: 2, anchorX: 1, anchorY: 1, type: 'chart', chartType: 'polarArea' },
    { id: 2, width: 2, height: 2, anchorX: 5, anchorY: 1,  type: 'chart', chartType: 'radar' },
    { id: 3, width: 2, height: 2, anchorX: 3, anchorY: 1,  type: 'map', mapName: 'Up map' },
    { id: 4, width: 2, height: 2, anchorX: 3, anchorY: 3,  type: 'map', mapName: 'Down map' },
    { id: 5, width: 2, height: 2, anchorX: 1, anchorY: 3,  type: 'list', controls: 'all', locations: exmapleLocations1 },
    { id: 6, width: 2, height: 2, anchorX: 5, anchorY: 3,  type: 'list', controls: 'Up map', locations: exmapleLocations2 },
  ]

  constructor(private dialog: MatDialog, private widgetService: WidgetsService, private router: Router) {
    this.checkFilledRows()
    this.setGridCellIdsAndCoordinates()
    this.subscribeToNewWidget()
  }

  ngAfterViewInit(): void {
    this.setGridCellXandYs()
    this.routeUrl()
  }

  ngOnDestroy(): void {
    this.newWidgetSub.unsubscribe()
  }

  routeUrl() {
    if (this.router.url == `/widgets/new`) this.openDialog()
  }

  openDialog(): void {
    this.router.navigate(['widgets', 'new']);
    const dialogRef = this.dialog.open(WidgetDialog, {
      width: '50vw',
      maxWidth: '80vw',
      height: '75vh',
      data: {mapNames: this.allWidgets
                          .filter(widget => widget.type == 'map')
                          .map(widget => widget.mapName)}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['widgets'])
    });
  }

  subscribeToNewWidget() {
    this.newWidgetSub = this.widgetService.newWidgetObs.subscribe(
      newWidget => {
        if (!!newWidget.type) {
          const newAnchor: {x: number, y: number}  | false = this.getNewAnchor(newWidget)
          if (newAnchor) {
            newWidget.anchorX = newAnchor.x
            newWidget.anchorY = newAnchor.y
            newWidget.id = this.getNewId()
            this.allWidgets.push(newWidget)
          } else {
            this.openSnackBar(`Sorry, can't find place for that widget.`, `Ok`)
          }
        }
      }
    )
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  getNewAnchor(newWidget: any) {
    var returnValue: any = false
    this.gridRows().forEach((row: string) => {
      this.grid[row].forEach(gridCell => {
        if (!gridCell.widgetId &&
            this.canSnapToGrid(newWidget, undefined, gridCell) &&
            !this.checkIfWidgetOutbound(newWidget, gridCell) &&
            !returnValue) {
          returnValue = {x: gridCell.coordinates.x, y: gridCell.coordinates.y}
        }
      })
    })
    return returnValue
  }

  checkIfWidgetOutbound(newWidget: WidgetInterface, gridCell: GridCellInterface) {
    const lastX = newWidget.width + gridCell.coordinates.x - 1
    const lastY = newWidget.height + gridCell.coordinates.y - 1

    return lastX > 6 || lastY > 4
  }

  removeWidget(widget: WidgetInterface) {
    this.allWidgets.splice(this.allWidgets.indexOf(widget), 1)
    if (widget.type == 'list') { this.widgetService.removeLocations(widget) }
    this.checkFilledRows()
  }

  setGridCellIdsAndCoordinates() {
    Object.keys(this.grid).forEach((rowKey, firstIndex) => {
      this.grid[rowKey].forEach((cell, secondIndex) => {
        let cellCopy = Object.assign({}, this.grid[rowKey][secondIndex])
        cellCopy.gridCellId = `grid-cell-${this.nextCellId}`;
        cellCopy.coordinates = {
          x: secondIndex + 1,
          y: firstIndex + 1
        }
        this.grid[rowKey][secondIndex] = cellCopy;
        this.nextCellId++;
      })
    })
  }

  checkFilledRows() {
    this.emptyAllCells()
    this.allWidgets.forEach(widget => {
      for (let i = widget.anchorY; i < widget.anchorY + widget.height; i++) {
        for (let j = widget.anchorX; j < widget.anchorX + widget.width; j++) {
          let cellCopy = Object.assign({}, this.grid[`row${i}`][j-1])
          cellCopy.widgetId = widget.id;
          cellCopy.type = widget.type;
          this.grid[`row${i}`][j-1] = cellCopy;
        }
      }
    })
  }

  setGridCellXandYs() {
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 6; j++) {
        const gridCellId = (i - 1) * 6 + (j - 1);
        const htmlElement = document.getElementById(`grid-cell-${gridCellId}`)
        let domValues: {x1: number, y1: number, x2: number, y2: number} = {
          x1: htmlElement!.getBoundingClientRect().x,
          y1: htmlElement!.getBoundingClientRect().y,
          x2: htmlElement!.getBoundingClientRect().x + htmlElement!.getBoundingClientRect().width,
          y2: htmlElement!.getBoundingClientRect().y + htmlElement!.getBoundingClientRect().height
        }
        this.grid[`row${i}`][j-1].x1 = domValues.x1;
        this.grid[`row${i}`][j-1].y1 = domValues.y1;
        this.grid[`row${i}`][j-1].x2 = domValues.x2;
        this.grid[`row${i}`][j-1].y2 = domValues.y2;
      }
    }
  }

  widgetMoved({ dropPoint, widget, event }: { dropPoint: {x: number, y: number}, widget: WidgetInterface, event: any }) {
    if (this.canSnapToGrid(widget, dropPoint, undefined)) {
      this.snapWidgetToGrid(dropPoint, widget)
    } else {
      event.source._dragRef.reset()
    }
    this.checkFilledRows()
  }

  canSnapToGrid(widget: WidgetInterface, dropPoint?: { x: number, y: number }, dropCell?: GridCellInterface): boolean {
    let occupiedCells: any[] = []
    let canSnap = true
    this.allWidgets.filter(filterWidget => {return filterWidget.id != widget.id} )
          .forEach(activeWidget => {
            occupiedCells.push(this.getOccupiedCells(activeWidget).map(cell => cell.gridCellId))
          })
    occupiedCells = occupiedCells.flat()
    
    let newAnchor = !!dropPoint ? this.findCellIdByDropPoint(dropPoint) : dropCell
    let newWidget = {...widget} 
    newWidget.anchorX = newAnchor!.coordinates.x
    newWidget.anchorY = newAnchor!.coordinates.y

    let newOccupiedCells = this.getOccupiedCells(newWidget)
    newOccupiedCells.forEach(newCell => {
      if (occupiedCells.includes(newCell.gridCellId)) canSnap = false
    })
    return canSnap;
  }

  snapWidgetToGrid(dropPoint: { x: number, y: number }, widget: WidgetInterface) {
    const targetCell = this.findCellIdByDropPoint(dropPoint);
    const widgetIndex = this.allWidgets.findIndex(w => w.id === widget.id);
    this.allWidgets[widgetIndex].anchorX = targetCell!.coordinates.x
    this.allWidgets[widgetIndex].anchorY = targetCell!.coordinates.y
  }

  findCellIdByDropPoint(dropPoint: { x: number, y: number }): GridCellInterface | null {
    for (const rowKey of Object.keys(this.grid)) {
      for (const cell of this.grid[rowKey]) {
        if (
          dropPoint.x >= cell.x1 &&
          dropPoint.x <= cell.x2 &&
          dropPoint.y >= cell.y1 &&
          dropPoint.y <= cell.y2
        ) {
          return cell;
        }
      }
    }
    return null;
  }

  emptyAllCells() {
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 6; j++) {
        this.grid[`row${i}`][j-1].widgetId = null
      }
    }
  }

  getOccupiedCells(activeWidget: WidgetInterface) {
    let occupiedCells: GridCellInterface[] = []
    for(let i = activeWidget.anchorY; i < activeWidget.anchorY + activeWidget.height; i++ ) {
      for(let j = activeWidget.anchorX; j < activeWidget.anchorX + activeWidget.width; j++) {
        const foundCell = this.findCellByCoordinate(j, i)
        if (foundCell != 'null') occupiedCells.push(foundCell)
      }
    }
    return occupiedCells
  }

  findCellByCoordinate(x: number, y: number) {
    for (const rowKey of Object.keys(this.grid)) {
      for (const cell of this.grid[rowKey]) {
        if (cell.coordinates.x == x && cell.coordinates.y == y)
          return cell
      }
    }

    return 'null'
  }

  getNewId() {
    return Math.max(0, ...this.allWidgets.map(widget => widget.id)) + 1
  }
}