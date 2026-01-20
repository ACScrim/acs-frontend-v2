import { ref } from 'vue';
import type { Ref } from 'vue';
import type { CardAsset } from '@/types/models';

export interface CustomText {
  id: string; // Unique ID for proper Vue key binding
  content: string;
  posX: number;
  posY: number;
  align: 'left' | 'center' | 'right';
  color: string;
  width: 'w-full' | 'w-auto';
  fontSize?: number;
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type TextAlign = 'left' | 'center' | 'right';
export type TextWidth = 'w-full' | 'w-auto';
export type ImageObjectFit = 'contain' | 'cover';

export interface PendingCardData {
  title: string;
  imageBase64: string;  // Temporary base64 for upload, will be converted to URL on server
  imageUrl?: string;  // For Discord avatars - used directly without Cloudinary
  frontAssetId?: string;
  borderAssetId?: string;
  categoryId?: string;
  frontAssetData?: Omit<CardAsset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> | null;
  borderAssetData?: Omit<CardAsset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> | null;
  titlePosX: number;
  titlePosY: number;
  titleAlign: TextAlign;
  titleWidth: TextWidth;
  titleFontSize?: number;
  removeImageBg: boolean;
  holographicEffect: boolean;
  holographicIntensity: number;
  titleColor: string;
  imagePosX: number;
  imagePosY: number;
  imageScale: number;
  imageWidth: number;
  imageHeight: number;
  imageObjectFit: ImageObjectFit;
  imageRounded: number;
  imageCropX: number;
  imageCropY: number;
  rarity: Rarity;
  customTexts: CustomText[];
}

export interface CardCustomizationState {
  // Title customization
  titlePosX: Ref<number>;
  titlePosY: Ref<number>;
  titleAlign: Ref<TextAlign>;
  titleWidth: Ref<TextWidth>;
  titleColor: Ref<string>;

  // Image customization
  imagePosX: Ref<number>;
  imagePosY: Ref<number>;
  imageScale: Ref<number>;
  imageWidth: Ref<number>;
  imageHeight: Ref<number>;
  imageObjectFit: Ref<ImageObjectFit>;

  // Effects
  removeImageBg: Ref<boolean>;
  holographicEffect: Ref<boolean>;
  holographicIntensity: Ref<number>;

  // Rarity
  rarity: Ref<Rarity>;

  // Custom texts
  customTexts: Ref<CustomText[]>;
}

export function useCardCustomization(): CardCustomizationState {
  return {
    // Title customization
    titlePosX: ref(50),
    titlePosY: ref(10),
    titleAlign: ref<TextAlign>('center'),
    titleWidth: ref<TextWidth>('w-full'),
    titleColor: ref('#ffffff'),

    // Image customization
    imagePosX: ref(50),
    imagePosY: ref(30),
    imageScale: ref(1),
    imageWidth: ref(160),
    imageHeight: ref(160),
    imageObjectFit: ref<ImageObjectFit>('cover'),

    // Effects
    removeImageBg: ref(false),
    holographicEffect: ref(true),
    holographicIntensity: ref(0.6),

    // Rarity
    rarity: ref<Rarity>('common'),

    // Custom texts
    customTexts: ref<CustomText[]>([]),
  };
}

export function useCustomTextManagement(customTexts: Ref<CustomText[]>) {
  const addCustomText = () => {
    if (customTexts.value.length < 5) {
      customTexts.value.push({
        id: crypto.randomUUID(),
        content: '',
        posX: 50,
        posY: 85,
        align: 'center',
        color: '#ffffff',
        width: 'w-full',
      });
    }
  };

  const removeCustomText = (index: number) => {
    customTexts.value.splice(index, 1);
  };

  const updateCustomText = <K extends keyof CustomText>(
    index: number,
    field: K,
    value: CustomText[K]
  ) => {
    if (index >= 0 && index < customTexts.value.length) {
      const text = customTexts.value[index];
      if (text) {
        text[field] = value;
      }
    }
  };

  return {
    addCustomText,
    removeCustomText,
    updateCustomText,
  };
}
