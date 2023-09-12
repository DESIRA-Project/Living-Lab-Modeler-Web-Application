import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import L from 'leaflet';

@Component({
  selector: 'app-living-lab-view-page-about',
  templateUrl: './living-lab-view-page-about.component.html',
  styleUrls: ['./living-lab-view-page-about.component.css']
})
export class LivingLabViewPageAboutComponent implements AfterViewInit {

  @Input() livingLab: any;
  d: any;
  lat = 0;
  lng = 0;
  zoom = 10;

  constructor() {}

  ngAfterViewInit(): void {
    this.lat = this.livingLab.location?.latitude ?? null;
    this.lng = this.livingLab.location?.longitude ?? null;
    this.zoom = this.livingLab.location?.zoom ?? this.zoom;

    // Hide map if either lat or lng are missing
    if (this.lat == null || this.lng == null) {
      const element = document.getElementById('leaflet-map');
      if (element != null) {
        element.style.height = '0';
      }

      // Style location text in case map does not exist
      const textWrapper = document.querySelector('.living-lab-location-text') as HTMLElement;
      if (textWrapper) {
        textWrapper.style.height = '100%'
      }
      const text = document.querySelector('.living-lab-location-text-title-subtitle') as HTMLElement;
      if (text) {
        text.style.marginTop = '0.5rem';
        text.style.webkitLineClamp = '8';
      }

      return;
    }
    const map = L.map('leaflet-map').setView([this.lat, this.lng], this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    map.on('click', e => {
      const url = 'https://www.openstreetmap.org/#map=' + map.getZoom() + '/' + e.latlng.lat + '/' + e.latlng.lng;
      window.open(url);
    });
  }

}
