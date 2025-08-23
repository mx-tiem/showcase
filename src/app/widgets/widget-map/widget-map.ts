import { Component, Input, OnDestroy } from '@angular/core';
import { LeafletDirective } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import { WidgetInterface } from '../widget/widget';
import { control, latLng, Map, marker, tileLayer } from 'leaflet';
import { iconPNG } from '../../app';
import { defaultLocations, LoactionInterface } from '../locations-list/locations-list';
import { initialCenterLatLng, WidgetsService } from '../widgets-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-widget-map',
  imports: [LeafletDirective],
  templateUrl: './widget-map.html',
  styleUrl: './widget-map.scss'
})
export class WidgetMap implements OnDestroy{
  @Input() widget!: WidgetInterface
  centerLatLngSub = new Subscription()
  markersSub = new Subscription()
  initialLatLng = initialCenterLatLng

  map: L.Map | null = null

  locations: LoactionInterface[] = defaultLocations

  locationMarkers = this.locations.map(location => {
          return marker([location.latLng.lat, location.latLng.lng], { icon: iconPNG() })
        })

  mapLayers = [
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }),
    ...this.locationMarkers
  ]

  options = {
    layers: this.mapLayers,
    zoom: 18,
    zoomControl: false,
    center: latLng(this.initialLatLng.lat, this.initialLatLng.lng),
  };

  constructor(private widgetService: WidgetsService) {}
  

  ngOnDestroy(): void {
    this.centerLatLngSub.unsubscribe()
    this.markersSub.unsubscribe()
  }

  onMapReady(map: Map) {
    map.addControl(control.zoom({ position: 'topright' }));
    this.map = map
    this.subscribeToCenterLatLng()
    this.subscribeToMarkers()
  }

  subscribeToCenterLatLng() {
    this.centerLatLngSub = this.widgetService.currentCenterLatLng
      .subscribe(data => {
        if (data.control == 'all' || data.control == this.widget.mapName) {
          !!this.map && this.map.flyTo(new L.LatLng(data.lat, data.lng))
        }
      });
  }

  subscribeToMarkers() {
    this.markersSub = this.widgetService.currentMarkers
      .subscribe((markerControls: {lat: number, lng: number, control: string}[]) => {
        let concernedControls = markerControls.filter(markerControl => {
          return markerControl.control == 'all' || markerControl.control == this.widget.mapName
        })
        this.locations = concernedControls.map(markerControls => {
          return {
            name: '', latLng: {lat: markerControls.lat, lng: markerControls.lng}, description: ''
          }
        })
        this.updateLocationMarkers()
      })
  }

  updateLocationMarkers() {
    this.locationMarkers = []
    this.locationMarkers = this.locations.map(location => {
      return marker(location.latLng, { icon: iconPNG() })
    })

    this.mapLayers = [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }),
      ...this.locationMarkers
    ]
    this.map?.eachLayer(layer => this.map?.removeLayer(layer))
    this.mapLayers.forEach(layer => {
      this.map?.addLayer(layer)
    })
  }
}
