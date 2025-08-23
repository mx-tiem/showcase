import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LoactionInterface } from '../locations-list/locations-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { WidgetsService } from '../widgets-service';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-widget-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDividerModule, MatCardModule, MatSelectModule],
  templateUrl: './widget-dialog.html',
  styleUrl: './widget-dialog.scss'
})
export class WidgetDialog {
  basicInfo = new FormGroup({
    width: new FormControl(2, [Validators.required, Validators.min(1), Validators.max(6)]),
    height: new FormControl(2, [Validators.required, Validators.min(1), Validators.max(4)]),
  })
  widgetType = new FormControl('', Validators.required)

  chartType = new FormControl('', [Validators.required, Validators.minLength(3)])

  mapInfo = new FormGroup({
    mapName: new FormControl('', [Validators.required, Validators.minLength(1)])
  })

  locationForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    description: new FormControl(''),
    latitude: new FormControl('', Validators.required),
    longitude: new FormControl('', Validators.required),
    control: new FormControl('all', Validators.required)
  })

  locations: LoactionInterface[] = []

  data = inject(MAT_DIALOG_DATA);

  constructor(private widgetService: WidgetsService) {}

  submitWidget() {
    let newWidget: any = {
      width: this.basicInfo.value.width,
      height: this.basicInfo.value.height,
      type: this.widgetType.value
    }

    switch(this.widgetType.value) {
      case 'chart': {
        newWidget.chartType = this.chartType.value
        break
      }
      case 'map': {
        newWidget.mapName = this.mapInfo.value.mapName
        break
      }
      case 'list': {
        newWidget.controls = this.locationForm.value.control
        newWidget.locations = this.locations
        break
      }
      default: break
    }

    this.widgetService.submitNewWidget(newWidget)
  }

  selectWidgetType(widgetType: string) {
    this.widgetType.patchValue(widgetType)
  }

  validUserInput(): boolean {
    let validity = this.basicInfo.valid && this.widgetType.valid

    if (validity) {
      if (this.widgetType.value == 'chart') {
        validity = validity && this.chartType.valid
      } else if (this.widgetType.value == 'map') {
        validity = validity && this.mapInfo.valid
      } else if (this.widgetType.value == 'list') {
        validity = validity && this.locations.length > 0
      }
    }

    return validity
  }

  selectChartType(chartType: string) {
    this.chartType.patchValue(chartType)
  }

  addLocation() {
    this.locations.push({
      name: this.locationForm.value.name!, 
      latLng: {lat: +this.locationForm.value.latitude!, lng: +this.locationForm.value.longitude!},
      description: this.locationForm.value.description!})

    this.resetLocationForm()
  }

  resetLocationForm(){
    this.locationForm.controls.name.reset()
    this.locationForm.controls.description.reset()
    this.locationForm.controls.latitude.reset()
    this.locationForm.controls.longitude.reset()
  }

  removeLocation(location: LoactionInterface) {
    const index = this.locations.indexOf(location)
    this.locations.splice(index, 1)
  }
}
