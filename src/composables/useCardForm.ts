import { reactive, ref } from 'vue';
import type { CustomText, ImageObjectFit, Rarity, TextAlign, TextWidth } from './useCardCustomization';
import type { AssetType, BorderAssetType } from './useCardAssets';

/**
 * Composable pour gérer l'état du formulaire CardCreator
 * Regroupe logiquement les refs éparpillés en objets réactifs
 */
export function useCardForm() {
  // Basic card information
  const basicInfo = reactive({
    title: '',
    imageUrl: '',
    imageBase64: '', // Temporary for preview only
    categoryId: undefined as string | undefined,
  });

  // Title appearance settings
  const appearance = reactive({
    titlePosX: 50,
    titlePosY: 10,
    titleAlign: 'center' as TextAlign,
    titleWidth: 'w-full' as TextWidth,
    titleColor: '#ffffff',
    titleFontSize: 18,
  });

  // Main image settings
  const imageSettings = reactive({
    posX: 50,
    posY: 30,
    scale: 1,
    width: 160,
    height: 160,
    objectFit: 'cover' as ImageObjectFit,
    rounded: 0, // 0-50 %
    cropX: 50, // 0-100 %
    cropY: 50, // 0-100 %
  });

  // Visual effects
  const effects = reactive({
    removeImageBg: false,
    holographicEffect: true,
    holographicIntensity: 0.6,
  });

  // Card metadata
  const metadata = reactive({
    rarity: 'common' as Rarity,
    customTexts: [] as CustomText[],
  });

  // Asset selection state
  const assetSelection = reactive({
    assetCategory: 'background' as 'background' | 'border',
    selectedFrontAssetId: undefined as string | undefined,
    selectedBorderAssetId: undefined as string | undefined,
    useCustomFrontAsset: false,
    useCustomBorderAsset: false,
  });

  // Background asset configuration
  const backgroundAsset = reactive({
    name: '',
    type: 'solid' as AssetType,
    solidColor: 'transparent',
    gradientColor1: '#667eea',
    gradientColor2: '#764ba2',
    gradientAngle: 135,
    imageBase64: '', // Temporary for preview
    imagePreview: '',
  });

  // Border asset configuration
  const borderAsset = reactive({
    name: '',
    type: 'solid' as BorderAssetType,
    solidColor: 'transparent',
    imageBase64: '', // Temporary for preview
    imagePreview: '',
  });

  // Category modal state
  const categoryModal = reactive({
    show: false,
    name: '',
    description: '',
  });

  // UI state
  const ui = reactive({
    activeTab: 'basics' as 'basics' | 'appearance' | 'texts' | 'assets' | 'effects',
  });

  // File input refs (can't be reactive)
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const backgroundAssetImageInputRef = ref<HTMLInputElement | null>(null);
  const borderAssetImageInputRef = ref<HTMLInputElement | null>(null);
  const cardPreviewRef = ref<HTMLDivElement | null>(null);
  const savedCardsContainer = ref<HTMLElement | null>(null);

  /**
   * Reset all form fields to initial state
   */
  const resetForm = () => {
    // Basic info
    Object.assign(basicInfo, {
      title: '',
      imageUrl: '',
      imageBase64: '',
      categoryId: undefined,
    });

    // Appearance
    Object.assign(appearance, {
      titlePosX: 50,
      titlePosY: 10,
      titleAlign: 'center',
      titleWidth: 'w-full',
      titleColor: '#ffffff',
      titleFontSize: 18,
    });

    // Image settings
    Object.assign(imageSettings, {
      posX: 50,
      posY: 30,
      scale: 1,
      width: 160,
      height: 160,
      objectFit: 'cover',
      rounded: 0,
      cropX: 50,
      cropY: 50,
    });

    // Effects
    Object.assign(effects, {
      removeImageBg: false,
      holographicEffect: true,
      holographicIntensity: 0.6,
    });

    // Metadata
    Object.assign(metadata, {
      rarity: 'common',
      customTexts: [],
    });

    // Asset selection
    Object.assign(assetSelection, {
      assetCategory: 'background',
      selectedFrontAssetId: undefined,
      selectedBorderAssetId: undefined,
      useCustomFrontAsset: false,
      useCustomBorderAsset: false,
    });

    // Background asset
    Object.assign(backgroundAsset, {
      name: '',
      type: 'solid',
      solidColor: 'transparent',
      gradientColor1: '#667eea',
      gradientColor2: '#764ba2',
      gradientAngle: 135,
      imageBase64: '',
      imagePreview: '',
    });

    // Border asset
    Object.assign(borderAsset, {
      name: '',
      type: 'solid',
      solidColor: 'transparent',
      imageBase64: '',
      imagePreview: '',
    });

    // Category modal
    Object.assign(categoryModal, {
      show: false,
      name: '',
      description: '',
    });

    // UI
    Object.assign(ui, {
      activeTab: 'basics',
    });
  };

  /**
   * Reset only image-related fields
   */
  const resetImageFields = () => {
    basicInfo.imageUrl = '';
    basicInfo.imageBase64 = '';
    Object.assign(imageSettings, {
      posX: 50,
      posY: 30,
      scale: 1,
      width: 160,
      height: 160,
      objectFit: 'cover',
      rounded: 0,
      cropX: 50,
      cropY: 50,
    });
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
