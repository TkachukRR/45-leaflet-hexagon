// map.component.ts
import { Component, OnInit } from '@angular/core';
import { HexagonService } from '../../services/hexagon.service';
import { NgIf } from '@angular/common';
import * as L from 'leaflet';

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
  private hexagonLayers: L.Layer[] = [];
  private resolution = 3;
  private hexagonOpacity = 0.5;
  public isLoading = false;

  constructor(private hexagonService: HexagonService) {}

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
    this.hexagonService.loadData().then(data => {
      this.convertedData = data;
      this.updateHexagons();
    }).finally(() => {
      this.isLoading = false;
    });
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

    if (newResolution !== this.resolution) {
      this.resolution = newResolution;
      this.updateHexagons();
    } else {
      this.addHexagonsToMap(this.hexagonService['hexagonCache'][this.resolution] || []);
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
        const hexagons = await this.hexagonService.convertPolygonsToHexagons(this.convertedData, this.resolution);
        this.addHexagonsToMap(hexagons);
      } catch (error) {
        console.error('Error updating hexagons:', error);
      } finally {
        this.isLoading = false;
      }
    }, 0);
  }
}
