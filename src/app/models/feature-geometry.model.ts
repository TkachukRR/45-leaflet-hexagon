export interface FeatureGeometry {
  type: 'MultiPolygon';
  crs: { type: string; properties: { name: string } };
  coordinates: number[][][][];
}
