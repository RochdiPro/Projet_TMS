import { Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {GoogleMapsAPIWrapper} from '@agm/core';

// interface pour le latitude et le longitude
export interface ILatLng {
  latitude: number;
  longitude: number;
}

// pour eviter l'erreur w.r.t
declare var google: any;

@Directive({
  selector: '[appDirectionsMap]'
})
export class DirectionsMapDirective implements OnInit, OnChanges{
  @Input() origin: ILatLng;
  @Input() destination: ILatLng;
  @Input() showDirection: boolean;

  private directionsRenderer: any;

  constructor(private gmapsApi: GoogleMapsAPIWrapper) { }
  ngOnInit(): void {
    this.drawDirectionsRoute();
  }
  drawDirectionsRoute() {
    this.gmapsApi.getNativeMap().then(map => {
      if (!this.directionsRenderer) {
        // if you already have a marker at the coordinate location on the map, use suppressMarkers option
        // suppressMarkers prevents google maps from automatically adding a marker for you
        this.directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
      }
      const directionsRenderer = this.directionsRenderer;

      if ( this.showDirection && this.destination ) {
          const directionsService = new google.maps.DirectionsService;
          directionsRenderer.setMap(map);
          directionsService.route({
              origin: {lat: this.origin.latitude, lng: this.origin.longitude},
              destination: {lat: this.destination.latitude, lng: this.destination.longitude},
              waypoints: [],
              optimizeWaypoints: true,
              travelMode: 'DRIVING'
          }, (response: any, status: any) => {
              if (status === 'OK') {
                  directionsRenderer.setDirections(response);
                  // If you'll like to display an info window along the route
                  // middleStep is used to estimate the midpoint on the route where the info window will appear
                  // const middleStep = (response.routes[0].legs[0].steps.length / 2).toFixed();
                  // const infowindow2 = new google.maps.InfoWindow();
                  // infowindow2.setContent(`${response.routes[0].legs[0].distance.text} <br> ${response.routes[0].legs[0].duration.text}  `);
                  // infowindow2.setPosition(response.routes[0].legs[0].steps[middleStep].end_location);
                  // infowindow2.open(map);
              } else {
                  console.log('Directions request failed due to ' + status);
              }
          });
      }

    });
}

ngOnChanges(changes: SimpleChanges) {
    if (changes.destination || changes.showDirection) {
        // this checks if the show directions input changed, if so the directions are removed
        // else we redraw the directions
        if (changes.showDirection && !changes.showDirection.currentValue) {
            if (this.directionsRenderer !== undefined) { // check this value is not undefined
                this.directionsRenderer.setDirections({routes: []});
                return;
            }
        } else {
            this.drawDirectionsRoute();
        }
    }
}
}
