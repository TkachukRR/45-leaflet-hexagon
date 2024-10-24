import { FeatureModel } from "./feature.model";

export interface DataResponseModel {
  type: 'FeatureCollection';
  features: FeatureModel[];
}

