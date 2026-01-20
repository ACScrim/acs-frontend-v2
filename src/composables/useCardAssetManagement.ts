import type { Ref } from 'vue';
import { useToastStore } from '@/stores/toastStore';

interface AssetConfig {
  name: Ref<string>;
  type: Ref<'solid' | 'gradient' | 'image'>;
  solidColor?: Ref<string>;
  gradientColor1?: Ref<string>;
  gradientColor2?: Ref<string>;
  gradientAngle?: Ref<number>;
  imageBase64: Ref<string>;
  imagePreview: Ref<string>;
}

export function useCardAssetManagement(
  backgroundAsset: AssetConfig,
  borderAsset: AssetConfig,
  assetCategory: Ref<'background' | 'border'>,
  backgroundAssetImageInputRef: Ref<HTMLInputElement | null>,
  borderAssetImageInputRef: Ref<HTMLInputElement | null>,
  selectedFrontAssetId: Ref<string | undefined>,
  selectedBorderAssetId: Ref<string | undefined>,
  useCustomFrontAsset: Ref<boolean>,
  useCustomBorderAsset: Ref<boolean>
) {
  const toastStore = useToastStore();

  /**
   * Set image data for current asset category
   */
  const setCurrentImageData = (base64: string, mimeType: string, preview: string) => {
    if (assetCategory.value === 'background') {
      backgroundAsset.imageBase64.value = base64;
      backgroundAsset.imagePreview.value = preview;
    } else {
      borderAsset.imageBase64.value = base64;
      borderAsset.imagePreview.value = preview;
    }
  };

  /**
   * Clear image data for current asset category
   */
  const clearCurrentImageData = () => {
    if (assetCategory.value === 'background') {
      backgroundAsset.imageBase64.value = '';
      backgroundAsset.imagePreview.value = '';
    } else {
      borderAsset.imageBase64.value = '';
      borderAsset.imagePreview.value = '';
    }
  };

  /**
   * Generate asset name with timestamp
   */
  const generateAssetName = (category: 'background' | 'border') => {
    const prefix = category === 'background' ? 'Fond personnalisé' : 'Bordure personnalisée';
    const timestamp = new Date().toLocaleString('fr-FR', { hour12: false });
    return `${prefix} ${timestamp}`;
  };

  /**
   * Ensure asset has a name, generate one if needed
   */
  const ensureAssetName = (category: 'background' | 'border') => {
    const target = category === 'background' ? backgroundAsset.name : borderAsset.name;
    if (!target.value.trim()) {
      target.value = generateAssetName(category);
    }
    return target.value;
  };

  /**
   * Validate background asset based on type
   */
  const isBackgroundAssetValid = () => {
    if (backgroundAsset.type.value === 'solid') {
      return backgroundAsset.solidColor!.value.trim().length > 0;
    }
    if (backgroundAsset.type.value === 'gradient') {
      return (
        backgroundAsset.gradientColor1!.value.trim().length > 0 &&
        backgroundAsset.gradientColor2!.value.trim().length > 0
      );
    }
    if (backgroundAsset.type.value === 'image') {
      return backgroundAsset.imageBase64.value.length > 0;
    }
    return false;
  };

  /**
   * Validate border asset based on type
   */
  const isBorderAssetValid = () => {
    if (borderAsset.type.value === 'solid') {
      return borderAsset.solidColor!.value.trim().length > 0;
    }
    if (borderAsset.type.value === 'image') {
      return borderAsset.imageBase64.value.length > 0;
    }
    return false;
  };

  /**
   * Handle asset image upload (PNG or GIF only)
   */
  const handleAssetImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type (PNG or GIF only)
      if (!['image/png', 'image/gif'].includes(file.type)) {
        toastStore.error('Veuillez sélectionner une image PNG ou GIF.');
        return;
      }

      // Validate file size (max 3MB)
      if (file.size > 3 * 1024 * 1024) {
        toastStore.error("L'image ne doit pas dépasser 3MB.");
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string).split(',')[1];
        const mimeType = file.type;
        const preview = e.target?.result as string;

        if (!base64String) {
          toastStore.error('Erreur lors de la lecture du fichier.');
          return;
        }

        setCurrentImageData(base64String, mimeType, preview);
        if (assetCategory.value === 'background') {
          backgroundAsset.type.value = 'image';
        } else {
          borderAsset.type.value = 'image';
        }
      };
      reader.onerror = () => {
        toastStore.error('Erreur lors de la lecture du fichier.');
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Build front asset data from current form state
   */
  const buildFrontAssetData = () => {
    if (!isBackgroundAssetValid()) {
      return null;
    }

    return {
      name: ensureAssetName('background'),
      category: 'background' as const,
      type: backgroundAsset.type.value as 'solid' | 'gradient' | 'image',
      ...(backgroundAsset.type.value === 'solid' && {
        solidColor: backgroundAsset.solidColor!.value,
      }),
      ...(backgroundAsset.type.value === 'gradient' && {
        color1: backgroundAsset.gradientColor1!.value,
        color2: backgroundAsset.gradientColor2!.value,
        angle: backgroundAsset.gradientAngle!.value,
      }),
      ...(backgroundAsset.type.value === 'image' && {
        imageBase64: backgroundAsset.imageBase64.value,
      }),
    };
  };

  /**
   * Build border asset data from current form state
   */
  const buildBorderAssetData = () => {
    if (!isBorderAssetValid()) {
      return null;
    }

    return {
      name: ensureAssetName('border'),
      category: 'border' as const,
      type: borderAsset.type.value as 'solid' | 'image',
      ...(borderAsset.type.value === 'solid' && {
        solidColor: borderAsset.solidColor!.value,
      }),
      ...(borderAsset.type.value === 'image' && {
        imageBase64: borderAsset.imageBase64.value,
      }),
    };
  };

  /**
   * Apply current asset to the card
   */
  const applyCurrentAsset = () => {
    if (assetCategory.value === 'background') {
      if (!isBackgroundAssetValid()) {
        toastStore.error('Veuillez configurer correctement le fond avant de l\'utiliser.');
        return;
      }
      ensureAssetName('background');
      selectedFrontAssetId.value = undefined;
      useCustomFrontAsset.value = true;
      toastStore.success('Fond personnalisé appliqué.');
      return;
    }

    if (!isBorderAssetValid()) {
      toastStore.error('Veuillez configurer correctement la bordure.');
      return;
    }
    ensureAssetName('border');
    selectedBorderAssetId.value = undefined;
    useCustomBorderAsset.value = true;
    toastStore.success('Bordure personnalisée appliquée.');
  };

  /**
   * Trigger file input for asset image
   */
  const triggerAssetImageInput = () => {
    if (assetCategory.value === 'background') {
      backgroundAssetImageInputRef.value?.click();
    } else {
      borderAssetImageInputRef.value?.click();
    }
  };

  /**
   * Remove asset image and reset input
   */
  const removeAssetImage = () => {
    clearCurrentImageData();
    if (assetCategory.value === 'background') {
      if (backgroundAssetImageInputRef.value) {
        backgroundAssetImageInputRef.value.value = '';
      }
    } else {
      if (borderAssetImageInputRef.value) {
        borderAssetImageInputRef.value.value = '';
      }
    }
  };

  return {
    handleAssetImageUpload,
    buildFrontAssetData,
    buildBorderAssetData,
    applyCurrentAsset,
    triggerAssetImageInput,
    removeAssetImage,
    isBackgroundAssetValid,
    isBorderAssetValid,
  };
}
