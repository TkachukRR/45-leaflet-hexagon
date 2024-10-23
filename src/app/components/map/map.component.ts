import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'proj4leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  map!: L.Map;

  ngOnInit() {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([0, 0], 0);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map)
  }
}
