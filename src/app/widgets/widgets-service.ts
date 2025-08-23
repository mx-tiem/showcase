import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WidgetInterface } from './widget/widget';
import { LoactionInterface } from './locations-list/locations-list';

interface LatLngControlInterface {lat: number, lng: number, control: string}
interface MarkerControlInterface {lat: number, lng: number, control: string}

export const initialCenterLatLng: LatLngControlInterface = {
  lat: 45.81324918928916,
  lng: 15.97735111094576,
  control: 'all'
}

const initialMarkerControl: MarkerControlInterface[] = [{
  lat: 45.81324918928916,
  lng: 15.97735111094576,
  control: 'all'
}]

@Injectable({
  providedIn: 'root'
})
export class WidgetsService {
  private centerLatLng = new BehaviorSubject<LatLngControlInterface>(initialCenterLatLng);
  currentCenterLatLng = this.centerLatLng.asObservable();

  private allMarkers = new BehaviorSubject<MarkerControlInterface[]>(initialMarkerControl);
  currentMarkers = this.allMarkers.asObservable();

  private newWidget = new BehaviorSubject<any>({});
  newWidgetObs = this.newWidget.asObservable()

  constructor() {}

  updateCenterLatLng(lat: number, lng: number, control: string) {
    this.centerLatLng.next({lat: lat, lng: lng, control: control});
  }

  updateMarkers(locations: LoactionInterface[], widget: WidgetInterface) {
    let newMakersList: {lat: number, lng: number, control: string}[] = []
    locations.forEach(location => {
      const newMarker = {
        lat: location.latLng.lat,
        lng: location.latLng.lng,
        control: widget.controls!
      }
      if (!this.currentMarkersInclude(newMarker)) {
        newMakersList.push(newMarker)
      }
    })
    this.allMarkers.next([...this.allMarkers.value, ...newMakersList])
  }

  currentMarkersInclude(newMarker: {lat: number, lng: number, control: string}): boolean {
    let currentMarkers = this.allMarkers.value
    let returnValue = false

    currentMarkers.forEach(marker => {
      if (marker.lat == newMarker.lat &&
          marker.lng == newMarker.lng &&
          marker.control == newMarker.control
      ) returnValue = true
    })
    return returnValue
  }

  submitNewWidget(newWidget: any) {
    this.newWidget.next(newWidget)
  }

  removeLocations(widget: WidgetInterface) {
    let localAllMarkers = this.allMarkers.value
    const widgetLocationsLatLng = widget.locations?.map(location => {return location.latLng})
    this.allMarkers.next(
      localAllMarkers.filter(marker => {
        let validMarker = true
        widget.locations?.forEach(location => {
          validMarker &&
          (validMarker = (marker.lat != location.latLng.lat && marker.lng != location.latLng.lng))
        })

        return validMarker
      })
    )
  }
}
