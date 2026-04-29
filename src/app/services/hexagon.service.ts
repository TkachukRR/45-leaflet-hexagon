import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import proj4 from 'proj4';
import { featureToH3Set } from 'geojson2h3';
import { cellToBoundary } from 'h3-js';
import { DATA_URL } from '../constants/url-data.constant';
import { HexagonModel } from '../models/hexagon.model';
import { DataResponseModel } from '../models/response-data.model';
import { FeatureModel } from '../models/feature.model';

@Injectable({
  providedIn: 'root'
})
export class HexagonService {
  private hexagonCache: { [key: number]: HexagonModel[] } = {};
  private readonly DATA_URL = DATA_URL;

  constructor(private http: HttpClient) {}

  async loadData(): Promise<FeatureModel[]> {
    try {
      const response = await firstValueFrom(this.http.get<DataResponseModel>(this.DATA_URL));
      return this.convertCoordinates(response.features);
    } catch (error) {
      console.error('Error loading data:', error);
      return [];
    }
  }

  private convertCoordinates(features: FeatureModel[]): FeatureModel[] {
    return features.map(feature => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: feature.geometry.coordinates.map(polygon =>
          polygon.map(ring =>
            ring.map(point => proj4('EPSG:3857', 'EPSG:4326', point))
          )
        ),
      },
    }));
  }

  getCachedHexagons(resolution: number): HexagonModel[] {
    return this.hexagonCache[resolution] ?? [];
  }

  async convertPolygonsToHexagons(features: FeatureModel[], resolution: number): Promise<HexagonModel[]> {
    if (this.hexagonCache[resolution]) {
      return this.hexagonCache[resolution];
    }

    const hexagons = features.flatMap(feature =>
      featureToH3Set(feature, resolution).map(h3Index => ({
        coordinates: cellToBoundary(h3Index, true).map(([lat, lng]) => [lng, lat] as [number, number]),
        color: '#' + feature.properties.COLOR_HEX,
        h3Index,
        regionId: feature.properties.ID,
      }))
    );

    this.hexagonCache[resolution] = hexagons;
    return hexagons;
  }
}
