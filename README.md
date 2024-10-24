# Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.9.

## Project Description

This project implements a hexagon view for data provided in the data.json file. The file contains coordinates and color values to define how the hexagons should be colored on the map.

### Key Features:

	•	Data Conversion: Coordinates in the data.json file are in EPSG:3857 system and are converted to the EPSG:4326 system using proj4js.
	•	Hexagon Display: The application uses OpenStreetMap to display the map with hexagons. The hexagons adjust in size based on the zoom level (lower zoom = bigger hexagons).
	•	Hexagon Coloring: The color of each hexagon is set based on the COLOR_HEX property from data.json.
	•	Visibility: Hexagons are displayed only within the visible screen area of the map.
	•	Libraries: The project uses proj4js for coordinate transformation, geojson2h3 to convert polygons to H3 hexagons, and h3-js to generate hexagonal boundaries.

### Useful Links:

	•	Proj4js
	•	Geojson2h3
	•	H3-js

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
