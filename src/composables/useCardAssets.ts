import { ref } from 'vue';
import type { Ref } from 'vue';

export type AssetType = 'solid' | 'gradient' | 'image';
export type BorderAssetType = 'solid' | 'image';

export interface BackgroundAssetState {
  name: Ref<string>;
  type: Ref<AssetType>;
  solidColor: Ref<string>;
  gradientColor1: Ref<string>;
  gradientColor2: Ref<string>;
  gradientAngle: Ref<number>;
  imageBase64: Ref<string>;
  imageMimeType: Ref<string>;
  imagePreview: Ref<string>;
}

export interface BorderAssetState {
  name: Ref<string>;
  type: Ref<BorderAssetType>;
  solidColor: Ref<string>;
  imageBase64: Ref<string>;
  imageMimeType: Ref<string>;
  imagePreview: Ref<string>;
}

export function useBackgroundAsset(): BackgroundAssetState {
  return {
    name: ref(''),
    type: ref<AssetType>('solid'),
    solidColor: ref('#667eea'),
    gradientColor1: ref('#667eea'),
    gradientColor2: ref('#764ba2'),
    gradientAngle: ref(135),
    imageBase64: ref(''),
    imageMimeType: ref(''),
    imagePreview: ref(''),
  };
}

export function useBorderAsset(): BorderAssetState {
  return {
    name: ref(''),
    type: ref<BorderAssetType>('solid'),
    solidColor: ref('#ffffff'),
    imageBase64: ref(''),
    imageMimeType: ref(''),
    imagePreview: ref(''),
  };
}
