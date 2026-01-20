import { reactive, ref } from 'vue';
import type { CustomText, ImageObjectFit, Rarity, TextAlign, TextWidth } from './useCardCustomization';
import type { AssetType, BorderAssetType } from './useCardAssets';

/**
 * Default values for card form fields
 * Single source of truth for initial/reset state
 */
const DEFAULTS = {
  basicInfo: {
    title: '',
    imageUrl: '',
    imageBase64: '',
    categoryId: undefined as string | undefined,
  },
  appearance: {
    titlePosX: 50,
    titlePosY: 10,
    titleAlign: 'center' as TextAlign,
    titleWidth: 'w-full' as TextWidth,
    titleColor: '#ffffff',
    titleFontSize: 18,
  },
  imageSettings: {
    posX: 50,
    posY: 30,
    scale: 1,
    width: 160,
    height: 160,
    objectFit: 'cover' as ImageObjectFit,
    rounded: 0,
    cropX: 50,
    cropY: 50,
  },
  effects: {
    removeImageBg: false,
    holographicEffect: true,
    holographicIntensity: 0.6,
  },
  metadata: {
    rarity: 'common' as Rarity,
    customTexts: [] as CustomText[],
  },
  assetSelection: {
    assetCategory: 'background' as 'background' | 'border',
    selectedFrontAssetId: undefined as string | undefined,
    selectedBorderAssetId: undefined as string | undefined,
    useCustomFrontAsset: false,
    useCustomBorderAsset: false,
  },
  backgroundAsset: {
    name: '',
    type: 'solid' as AssetType,
    solidColor: 'transparent',
    gradientColor1: '#667eea',
    gradientColor2: '#764ba2',
    gradientAngle: 135,
    imageBase64: '',
    imagePreview: '',
  },
  borderAsset: {
    name: '',
    type: 'solid' as BorderAssetType,
    solidColor: 'transparent',
    imageBase64: '',
    imagePreview: '',
  },
  categoryModal: {
    show: false,
    name: '',
    description: '',
  },
  ui: {
    activeTab: 'basics' as 'basics' | 'appearance' | 'texts' | 'assets' | 'effects',
  },
};

/**
 * Composable for managing CardCreator form state
 * Groups scattered refs into logical reactive objects for better organization
 */
export function useCardForm() {
  // Create reactive state from defaults
  const basicInfo = reactive({ ...DEFAULTS.basicInfo });
  const appearance = reactive({ ...DEFAULTS.appearance });
  const imageSettings = reactive({ ...DEFAULTS.imageSettings });
  const effects = reactive({ ...DEFAULTS.effects });
  const metadata = reactive({ rarity: DEFAULTS.metadata.rarity, customTexts: [] as CustomText[] });
  const assetSelection = reactive({ ...DEFAULTS.assetSelection });
  const backgroundAsset = reactive({ ...DEFAULTS.backgroundAsset });
  const borderAsset = reactive({ ...DEFAULTS.borderAsset });
  const categoryModal = reactive({ ...DEFAULTS.categoryModal });
  const ui = reactive({ ...DEFAULTS.ui });

  // File input refs (cannot be reactive)
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const backgroundAssetImageInputRef = ref<HTMLInputElement | null>(null);
  const borderAssetImageInputRef = ref<HTMLInputElement | null>(null);
  const cardPreviewRef = ref<HTMLDivElement | null>(null);
  const savedCardsContainer = ref<HTMLElement | null>(null);

  /**
   * Reset all form fields to initial state
   */
  const resetForm = () => {
    Object.assign(basicInfo, { ...DEFAULTS.basicInfo });
    Object.assign(appearance, { ...DEFAULTS.appearance });
    Object.assign(imageSettings, { ...DEFAULTS.imageSettings });
    Object.assign(effects, { ...DEFAULTS.effects });
    metadata.rarity = DEFAULTS.metadata.rarity;
    metadata.customTexts = [];
    Object.assign(assetSelection, { ...DEFAULTS.assetSelection });
    Object.assign(backgroundAsset, { ...DEFAULTS.backgroundAsset });
    Object.assign(borderAsset, { ...DEFAULTS.borderAsset });
    Object.assign(categoryModal, { ...DEFAULTS.categoryModal });
    Object.assign(ui, { ...DEFAULTS.ui });
  };

  /**
   * Reset only image-related fields
   */
  const resetImageFields = () => {
    basicInfo.imageUrl = '';
    basicInfo.imageBase64 = '';
    Object.assign(imageSettings, { ...DEFAULTS.imageSettings });
  };

  /**
   * Reset current asset data based on category
   */
  const resetCurrentAssetData = () => {
    if (assetSelection.assetCategory === 'background') {
      backgroundAsset.imageBase64 = '';
      backgroundAsset.imagePreview = '';
    } else {
      borderAsset.imageBase64 = '';
      borderAsset.imagePreview = '';
    }
  };

  return {
    // State groups
    basicInfo,
    appearance,
    imageSettings,
    effects,
    metadata,
    assetSelection,
    backgroundAsset,
    borderAsset,
    categoryModal,
    ui,
    
    // Refs
    fileInputRef,
    backgroundAssetImageInputRef,
    borderAssetImageInputRef,
    cardPreviewRef,
    savedCardsContainer,
    
    // Methods
    resetForm,
    resetImageFields,
    resetCurrentAssetData,
  };
}
