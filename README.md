# Geo Hexagon Map

Angular 18 application that visualizes geographic GeoJSON data as an interactive H3 hexagonal grid on a Leaflet map.

## Features

- **Coordinate conversion** — source data in EPSG:3857 is converted to EPSG:4326 via [proj4js](https://proj4js.org)
- **Dynamic H3 resolution** — hexagon size adjusts automatically based on zoom level (H3 resolution 2–6)
- **Hexagon coloring** — each hexagon inherits `COLOR_HEX` from the corresponding GeoJSON feature
- **Viewport culling** — only hexagons within the visible map bounds are rendered
- **Performance** — Canvas renderer (`L.canvas`), `LayerGroup` for batch DOM updates, debounced pan events via RxJS

## Tech Stack

| Library | Purpose |
|---|---|
| [Angular 18](https://angular.dev) | Framework, standalone components |
| [Leaflet](https://leafletjs.com) | Interactive map rendering |
| [H3-js](https://h3geo.org) | Hexagonal hierarchical grid |
| [geojson2h3](https://github.com/uber/geojson2h3) | GeoJSON polygon → H3 index conversion |
| [proj4js](https://proj4js.org) | Coordinate system transformation (EPSG:3857 → EPSG:4326) |

## Getting Started

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200/`

## Data

GeoJSON `FeatureCollection` with `MultiPolygon` geometries in EPSG:3857 projection. Each feature includes a `COLOR_HEX` property used for hexagon fill color.

Source: [gis-point/angular-hexagon-test](https://github.com/gis-point/angular-hexagon-test)
