import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HexagonService } from '../../services/hexagon.service';
import { NgIf } from '@angular/common';
import * as L from 'leaflet';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FeatureModel } from '../../models/feature.model';
import { HexagonModel } from '../../models/hexagon.model';
import { ColorFilterComponent } from '../color-filter/color-filter.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [NgIf, ColorFilterComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  map!: L.Map;
  private convertedData: FeatureModel[] = [];
  private hexagonLayer!: L.LayerGroup;
  private renderer!: L.Canvas;
  colors: string[] = [];
  private activeColors = new Set<string>();
  private resolution = 3;
  private hexagonOpacity = 0.5;
  private isZooming = false;
  private readonly destroy$ = new Subject<void>();
  private readonly moveEnd$ = new Subject<void>();
  public isLoading = false;
  public visibleCount = 0;
  public totalCount = 0;

  constructor(
    private hexagonService: HexagonService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map('map').setView([22.5, 41.0], 6);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.renderer = L.canvas();
    this.hexagonLayer = L.layerGroup().addTo(this.map);

    this.moveEnd$.pipe(debounceTime(150), takeUntil(this.destroy$))
      .subscribe(() => this.updateHexagons());

    this.map.on('zoomstart', () => {
      this.isZooming = true;
    });

    this.map.on('zoomend', () => {
      this.adjustHexagonResolution();
    });

    this.map.on('moveend', () => {
      if (this.isZooming) { this.isZooming = false; return; }
      this.moveEnd$.next();
    });
  }

  private loadData(): void {
    this.isLoading = true;
    this.hexagonService.loadData().then((data: FeatureModel[]) => {
      this.convertedData = data;
      this.colors = [...new Set(data.map(f => '#' + f.properties.COLOR_HEX))];
      this.activeColors = new Set(this.colors);
      this.updateHexagons();
    }).finally(() => {
      this.isLoading = false;
    });
  }

  onActiveColorsChange(activeColors: Set<string>): void {
    this.activeColors = activeColors;
    this.addHexagonsToMap(this.hexagonService.getCachedHexagons(this.resolution));
  }

  private addHexagonsToMap(hexagons: HexagonModel[]): void {
    this.hexagonLayer.clearLayers();

    const visible = this.filterVisibleHexagons(hexagons);
    this.totalCount = hexagons.length;
    this.visibleCount = visible.length;

    visible.forEach(hex => {
      L.polygon(hex.coordinates, {
        color: hex.color,
        fillOpacity: this.hexagonOpacity,
        renderer: this.renderer,
      })
        .bindTooltip(
          `<b>Region:</b> ${hex.regionId}<br><b>H3:</b> ${hex.h3Index}<br><b>Res:</b> ${this.resolution}<br><b>Color:</b> ${hex.color}`,
          { sticky: true },
        )
        .addTo(this.hexagonLayer);
    });
  }

  private filterVisibleHexagons(hexagons: HexagonModel[]): HexagonModel[] {
    const bounds = this.map.getBounds();
    return hexagons.filter(hex =>
      this.activeColors.has(hex.color) &&
      hex.coordinates.some(coord => bounds.contains(coord as L.LatLngExpression))
    );
  }

  private adjustHexagonResolution(): void {
    const zoomLevel = this.map.getZoom();
    const newResolution = this.getResolutionForZoom(zoomLevel);

    if (newResolution !== this.resolution) {
      this.resolution = newResolution;
      this.updateHexagons();
    } else {
      this.addHexagonsToMap(this.hexagonService.getCachedHexagons(this.resolution));
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
    this.cdr.detectChanges();

    try {
      const hexagons = await this.hexagonService.convertPolygonsToHexagons(this.convertedData, this.resolution);
      this.addHexagonsToMap(hexagons);
    } catch (error) {
      console.error('Error updating hexagons:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
