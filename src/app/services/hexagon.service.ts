// hexagon.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import proj4 from 'proj4';
import { featureToH3Set } from 'geojson2h3';
import { cellToBoundary } from 'h3-js';
import { DATA_URL } from '../constants/url-data.constant';

@Injectable({
  providedIn: 'root'
})
export class HexagonService {
  private hexagonCache: { [key: number]: any[] } = {};
  private readonly DATA_URL = DATA_URL;

  constructor(private http: HttpClient) {}

  loadData(): Promise<any[]> {
    return this.http.get<any>(this.DATA_URL).toPromise()
      .then(response => this.convertCoordinates(response.features))
      .catch(error => {
        console.error('Error loading data:', error);
        return [];
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

  async convertPolygonsToHexagons(features: any[], resolution: number): Promise<any[]> {
    if (this.hexagonCache[resolution]) {
      return this.hexagonCache[resolution];
    }

    const hexagons: any[] = [];
    for (const feature of features) {
      const h3Indexes = featureToH3Set(feature, resolution);
      for (const h3Index of h3Indexes) {
        const boundary = cellToBoundary(h3Index, true);
        const hexagonCoordinates = boundary.map(coord => [coord[1], coord[0]]);

        hexagons.push({
          coordinates: hexagonCoordinates,
          color: '#' + feature.properties.COLOR_HEX
        });
      }
    }

    this.hexagonCache[resolution] = hexagons;
    return hexagons;
  }
}
