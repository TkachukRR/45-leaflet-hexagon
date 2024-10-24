import { FeatureGeometry } from "./feature-geometry.model";
import { FeatureProperties } from "./feature-properties.model";

export interface FeatureModel {
  geometry: FeatureGeometry;
  properties: FeatureProperties;
  type: 'Feature';
}
