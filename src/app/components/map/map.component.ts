import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { DATA_URL } from '../../constants/url-data.constant';
import proj4 from 'proj4';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map!: L.Map;
  private convertedData = {};
  private readonly DATA_URL = DATA_URL;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initMap();
    this.loadData();
  }

  private initMap(): void {
    this.map = L.map('map').setView([0, 0], 0);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map)
  }

  private loadData(): void {
    this.http.get<any>(this.DATA_URL).subscribe((response) => {
      this.convertedData = this.convertCoordinates(response.features);
    }, (error) => {
      console.error('Error loading data:', error);
    });
  }

  private convertCoordinates(features: any[]): any[] {
    const EPSG3857 = 'EPSG:3857';
    const EPSG4326 = 'EPSG:4326';

    return features.map(feature => {
      const convertedCoordinates = feature.geometry.coordinates.map((polygon: any[]) =>
        polygon.map(ring =>
          ring.map((point: any) => proj4(EPSG3857, EPSG4326, point))
        )
      );

      return {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: convertedCoordinates
        }
      };
    });
  }
}
