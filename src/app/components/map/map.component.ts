import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { DATA_URL } from '../../constants/url-data.constant';
import proj4 from 'proj4';
import { featureToH3Set } from 'geojson2h3';
import { cellToBoundary } from 'h3-js';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgIf],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map!: L.Map;
  private convertedData: any[] = [];
  private hexagonCache: { [key: number]: any[] } = {};
  private hexagonLayers: L.Layer[] = [];
  private readonly DATA_URL = DATA_URL;
  private resolution = 3;
  private hexagonOpacity = 0.5;
  public isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initMap();
    this.loadData();
  }

  private initMap(): void {
    this.map = L.map('map').setView([22.5, 41.0], 6);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.map.on('zoomend', () => {
      this.adjustHexagonResolution();
    });

    this.map.on('moveend', () => {
      this.updateHexagons();
    });
  }

  private loadData(): void {
    this.isLoading = true;
    this.http.get<any>(this.DATA_URL).subscribe((response) => {
      this.convertedData = this.convertCoordinates(response.features);
      this.updateHexagons();
    }, (error) => {
      console.error('Error loading data:', error);
      this.isLoading = false;
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

  private async convertPolygonsToHexagons(features: any[]): Promise<any[]> {
    if (this.hexagonCache[this.resolution]) {
      return this.hexagonCache[this.resolution];
    }

    const hexagons: any[] = [];
    for (const feature of features) {
      const h3Indexes = featureToH3Set(feature, this.resolution);
      for (const h3Index of h3Indexes) {
        const boundary = cellToBoundary(h3Index, true);
        const hexagonCoordinates = boundary.map(coord => [coord[1], coord[0]] as L.LatLngExpression);

        hexagons.push({
          coordinates: hexagonCoordinates,
          color: '#' + feature.properties.COLOR_HEX
        });
      }
    }

    this.hexagonCache[this.resolution] = hexagons;
    return hexagons;
  }

  private addHexagonsToMap(hexagons: any[]): void {
    this.hexagonLayers.forEach(layer => this.map.removeLayer(layer));
    this.hexagonLayers = [];

    const visibleHexagons = this.filterVisibleHexagons(hexagons);

    visibleHexagons.forEach(hex => {
      const hexLayer = L.polygon(hex.coordinates, {
        color: hex.color,
        fillOpacity: this.hexagonOpacity,
      }).addTo(this.map);

      this.hexagonLayers.push(hexLayer);
    });
  }

  private filterVisibleHexagons(hexagons: any[]): any[] {
    const bounds = this.map.getBounds();
    return hexagons.filter(hex => {
      return hex.coordinates.every((coord: L.LatLngExpression) => bounds.contains(coord as L.LatLngExpression));
    });
  }

  private adjustHexagonResolution(): void {
    const zoomLevel = this.map.getZoom();
    const newResolution = this.getResolutionForZoom(zoomLevel);

    const visibleHexagons = this.filterVisibleHexagons(this.hexagonCache[this.resolution] || []);

    if (newResolution !== this.resolution) {
      this.resolution = newResolution;
      this.updateHexagons();
    } else {
      this.addHexagonsToMap(visibleHexagons);
    }
  }

  private getResolutionForZoom(zoom: number): number {
    if (zoom < 5) {
      return 2;
    } else if (zoom < 7) {
      return 3;
    } else if (zoom < 9) {
      return 4;
    } else if (zoom < 11) {
      return 5;
    } else {
      return 6;
    }
  }

  private async updateHexagons(): Promise<void> {
    this.isLoading = true;

    setTimeout(async () => {
      try {
        const hexagons = await this.convertPolygonsToHexagons(this.convertedData);
        this.addHexagonsToMap(hexagons);
      } catch (error) {
        console.error('Error updating hexagons:', error);
      } finally {
        this.isLoading = false;
      }
    }, 0);
  }
}
