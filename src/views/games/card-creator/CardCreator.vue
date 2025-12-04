<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {Button, Card} from '@/components/ui';
import Modal from '@/components/global/Modal.vue';
import CollectibleCard from './CollectibleCard.vue';
import useCardStore from '@/stores/cardStore';
import {useToastStore} from '@/stores/toastStore';
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import {useWindowSize} from "@vueuse/core";

const cardStore = useCardStore();
const toastStore = useToastStore();

const {width} = useWindowSize();

// Modal state for card confirmation
const showConfirmationModal = ref(false);
const pendingCardData = ref<any>(null);

// Form state
const title = ref('');
const imageUrl = ref('');
const imageBase64 = ref('');
const imageMimeType = ref('');
const assetCategory = ref<'background' | 'border'>('background');

// Personnalisation - Position
const titlePosX = ref(50);
const titlePosY = ref(10);
const titleAlign = ref<'left' | 'center' | 'right'>('center');
const titleWidth = ref<'w-full' | 'w-auto'>('w-full');

// Personnalisation - Effets
const removeImageBg = ref(false);
const holographicEffect = ref(true);
const holographicIntensity = ref(0.6);

// Personnalisation - Couleurs du texte
const titleColor = ref('#ffffff');

// Personnalisation - Textes personnalisés (0-5)
interface CustomText {
  content: string;
  posX: number;
  posY: number;
  align: 'left' | 'center' | 'right';
  color: string;
  width: 'w-full' | 'w-auto';
}

const customTexts = ref<CustomText[]>([]);

// Personnalisation - Image principale
const imagePosX = ref(50);
const imagePosY = ref(30);
const imageScale = ref(1);
const imageWidth = ref(160);
const imageHeight = ref(160);
const imageObjectFit = ref<'contain' | 'cover'>('cover');

// Personnalisation - Rareté
const rarity = ref<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'>('common');

const selectedFrontAssetId = ref<string | undefined>();
const selectedBorderAssetId = ref<string | undefined>();

// Custom asset state for creation
type AssetType = 'solid' | 'gradient' | 'image';

// Background asset state
const backgroundAssetName = ref('');
const backgroundAssetType = ref<AssetType>('solid');
const backgroundSolidColor = ref('#667eea');
const backgroundGradientColor1 = ref('#667eea');
const backgroundGradientColor2 = ref('#764ba2');
const backgroundGradientAngle = ref(135);
const backgroundAssetImageBase64 = ref('');
const backgroundAssetImageMimeType = ref('');
const backgroundAssetImagePreview = ref('');

// Border asset state
const borderAssetName = ref('');
const borderAssetType = ref<'solid' | 'image'>('solid');
const borderSolidColor = ref('#ffffff');
const borderAssetImageBase64 = ref('');
const borderAssetImageMimeType = ref('');
const borderAssetImagePreview = ref('');

// File input refs
const fileInputRef = ref<HTMLInputElement | null>(null);
const backgroundAssetImageInputRef = ref<HTMLInputElement | null>(null);
const borderAssetImageInputRef = ref<HTMLInputElement | null>(null);

// Image source selection
const imageSourceType = ref<'upload' | 'url' | 'discord'>('upload');
const imageUrlInput = ref('');
const selectedDiscordMemberId = ref<string>('');
const discordSearchQuery = ref('');

// Helper to get current asset config based on category
const getCurrentAssetName = () => assetCategory.value === 'background' ? backgroundAssetName.value : borderAssetName.value;
const getCurrentAssetType = () => assetCategory.value === 'background' ? backgroundAssetType.value : borderAssetType.value;
const getCurrentSolidColor = () => assetCategory.value === 'background' ? backgroundSolidColor.value : borderSolidColor.value;
const getCurrentGradientColor1 = () => backgroundGradientColor1.value;
const getCurrentGradientColor2 = () => backgroundGradientColor2.value;
const getCurrentGradientAngle = () => backgroundGradientAngle.value;
const getCurrentImagePreview = () => assetCategory.value === 'background' ? backgroundAssetImagePreview.value : borderAssetImagePreview.value;

// Helper to set current asset properties
const setCurrentAssetName = (value: string) => {
  if (assetCategory.value === 'background') {
    backgroundAssetName.value = value;
  } else {
    borderAssetName.value = value;
  }
};

const setCurrentAssetType = (value: AssetType) => {
  if (assetCategory.value === 'background') {
    backgroundAssetType.value = value;
  } else {
    // Pour les bordures, on accepte seulement 'solid' et 'image'
    if (value !== 'gradient') {
      borderAssetType.value = value as 'solid' | 'image';
    }
  }
};

const setCurrentSolidColor = (value: string) => {
  if (assetCategory.value === 'background') {
    backgroundSolidColor.value = value;
  } else {
    borderSolidColor.value = value;
  }
};

const setCurrentGradientColor1 = (value: string) => {
  if (assetCategory.value === 'background') {
    backgroundGradientColor1.value = value;
  }
};

const setCurrentGradientColor2 = (value: string) => {
  if (assetCategory.value === 'background') {
    backgroundGradientColor2.value = value;
  }
};

const setCurrentGradientAngle = (value: number) => {
  if (assetCategory.value === 'background') {
    backgroundGradientAngle.value = value;
  }
};

const setCurrentImageData = (base64: string, mimeType: string, preview: string) => {
  if (assetCategory.value === 'background') {
    backgroundAssetImageBase64.value = base64;
    backgroundAssetImageMimeType.value = mimeType;
    backgroundAssetImagePreview.value = preview;
  } else {
    borderAssetImageBase64.value = base64;
    borderAssetImageMimeType.value = mimeType;
    borderAssetImagePreview.value = preview;
  }
};

const clearCurrentImageData = () => {
  if (assetCategory.value === 'background') {
    backgroundAssetImageBase64.value = '';
    backgroundAssetImageMimeType.value = '';
    backgroundAssetImagePreview.value = '';
  } else {
    borderAssetImageBase64.value = '';
    borderAssetImageMimeType.value = '';
    borderAssetImagePreview.value = '';
  }
};

// Computed
const selectedFrontAsset = computed(() => {
  if (!selectedFrontAssetId.value) {
    // Return current asset being created
    if (backgroundAssetType.value === 'solid') {
      return {
        type: 'solid' as const,
        solidColor: backgroundSolidColor.value
      };
    }
    if (backgroundAssetType.value === 'gradient') {
      return {
        type: 'gradient' as const,
        color1: backgroundGradientColor1.value,
        color2: backgroundGradientColor2.value,
        angle: backgroundGradientAngle.value
      };
    }
    if (backgroundAssetType.value === 'image' && backgroundAssetImagePreview.value) {
      return {
        type: 'image' as const,
        imageBase64: backgroundAssetImageBase64.value,
        imageMimeType: backgroundAssetImageMimeType.value
      };
    }
  }
  return cardStore.getCardAssetById(selectedFrontAssetId.value || '');
});

const selectedBorderAsset = computed(() => {
  if (!selectedBorderAssetId.value) {
    // Return current asset being created
    if (borderAssetType.value === 'solid') {
      return {
        type: 'solid' as const,
        solidColor: borderSolidColor.value
      };
    }
    if (borderAssetType.value === 'image' && borderAssetImagePreview.value) {
      return {
        type: 'image' as const,
        imageBase64: borderAssetImageBase64.value,
        imageMimeType: borderAssetImageMimeType.value
      };
    }
  }
  return cardStore.getCardAssetById(selectedBorderAssetId.value || '');
});

const isFormValid = computed(() => {
  const hasTitle = title.value.trim().length > 0;

  // Either has a selected front asset OR has valid new asset data
  const hasFrontAsset = selectedFrontAssetId.value !== undefined || (backgroundAssetName.value.trim() && isBackgroundAssetValid.value);

  return hasTitle && hasFrontAsset;
});

const isBackgroundAssetValid = computed(() => {
  if (backgroundAssetType.value === 'solid') {
    return backgroundSolidColor.value.trim().length > 0;
  }
  if (backgroundAssetType.value === 'gradient') {
    return backgroundGradientColor1.value.trim().length > 0 && backgroundGradientColor2.value.trim().length > 0;
  }
  if (backgroundAssetType.value === 'image') {
    return backgroundAssetImageBase64.value.length > 0;
  }
  return false;
});

const isBorderAssetValid = computed(() => {
  if (borderAssetType.value === 'solid') {
    return borderSolidColor.value.trim().length > 0;
  }
  if (borderAssetType.value === 'image') {
    return borderAssetImageBase64.value.length > 0;
  }
  return false;
});

// Filtered Discord members based on search query
const filteredDiscordMembers = computed(() => {
  if (!discordSearchQuery.value.trim()) {
    return cardStore.discordAvatars;
  }
  const query = discordSearchQuery.value.toLowerCase();
  return cardStore.discordAvatars.filter(member =>
    member.username.toLowerCase().includes(query)
  );
});

// Handle asset image upload
const handleAssetImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];

    // Validate file type (PNG or GIF only)
    if (!['image/png', 'image/gif'].includes(file.type)) {
      toastStore.error('Veuillez sélectionner une image PNG ou GIF.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toastStore.error('L\'image ne doit pas dépasser 10MB.');
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
      setCurrentAssetType('image');
    };
    reader.onerror = () => {
      toastStore.error('Erreur lors de la lecture du fichier.');
    };
    reader.readAsDataURL(file);
  }
};

const triggerAssetImageInput = () => {
  if (assetCategory.value === 'background') {
    backgroundAssetImageInputRef.value?.click();
  } else {
    borderAssetImageInputRef.value?.click();
  }
};

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

// Build asset data from current form
const buildFrontAssetData = () => {
  if (!backgroundAssetName.value.trim() || !isBackgroundAssetValid.value) {
    return null;
  }

  return {
    name: backgroundAssetName.value,
    category: 'background' as const,
    type: backgroundAssetType.value as 'solid' | 'gradient' | 'image',
    ...(backgroundAssetType.value === 'solid' && { solidColor: backgroundSolidColor.value }),
    ...(backgroundAssetType.value === 'gradient' && {
      color1: backgroundGradientColor1.value,
      color2: backgroundGradientColor2.value,
      angle: backgroundGradientAngle.value
    }),
    ...(backgroundAssetType.value === 'image' && {
      imageBase64: backgroundAssetImageBase64.value,
      imageMimeType: backgroundAssetImageMimeType.value
    })
  };
};

const buildBorderAssetData = () => {
  if (!borderAssetName.value.trim() || !isBorderAssetValid.value) {
    return null;
  }

  return {
    name: borderAssetName.value,
    category: 'border' as const,
    type: borderAssetType.value as 'solid' | 'image',
    ...(borderAssetType.value === 'solid' && { solidColor: borderSolidColor.value }),
    ...(borderAssetType.value === 'image' && {
      imageBase64: borderAssetImageBase64.value,
      imageMimeType: borderAssetImageMimeType.value
    })
  };
};

// Methods
const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toastStore.error('Veuillez sélectionner une image valide.');
      return;
    }
    
    // Convert to base64 with automatic resize if needed
    const base64Data = await convertImageToBase64(file);
    if (base64Data) {
      imageBase64.value = base64Data.base64;
      imageMimeType.value = base64Data.mimeType;
      imageUrl.value = `data:${base64Data.mimeType};base64,${base64Data.base64}`;

      const sizeInMB = file.size / 1024 / 1024;
      if (file.size > 5 * 1024 * 1024) {
        toastStore.success(`Image redimensionnée et chargée (original: ${sizeInMB.toFixed(2)}MB)`);
      } else {
        toastStore.success(`Image chargée avec succès (${sizeInMB.toFixed(2)}MB)`);
      }
    } else {
      toastStore.error('Erreur lors de la conversion de l\'image.');
    }
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const removeImage = () => {
  imageUrl.value = '';
  imageBase64.value = '';
  imageMimeType.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Custom text management
const addCustomText = () => {
  if (customTexts.value.length < 5) {
    customTexts.value.push({
      content: `Texte ${customTexts.value.length + 1}`,
      posX: 50,
      posY: 50 + (customTexts.value.length * 15),
      align: 'center',
      color: '#ffffff',
      width: 'w-full'
    });
  }
};

const removeCustomText = (index: number) => {
  customTexts.value.splice(index, 1);
};

const updateCustomText = (index: number, field: 'content' | 'posX' | 'posY' | 'align' | 'color' | 'width', value: any) => {
  if (index >= 0 && index < customTexts.value.length) {
    (customTexts.value[index] as any)[field] = value;
  }
};

const saveCard = async () => {
  if (!isFormValid.value) {
    toastStore.error('Veuillez remplir tous les champs requis.');
    return;
  }

  // Validate front asset
  let frontAssetData = null;
  if (!selectedFrontAssetId.value) {
    // Check if asset name is provided
    if (!backgroundAssetName.value.trim()) {
      toastStore.error('Veuillez nommer le fond personnalisé ou sélectionner un fond prédéfini.');
      return;
    }

    frontAssetData = buildFrontAssetData();

    if (!frontAssetData) {
      toastStore.error('Veuillez configurer correctement le fond.');
      return;
    }
  }

  // Validate border asset if a name is provided
  let borderAssetData = null;
  if (!selectedBorderAssetId.value && borderAssetName.value.trim()) {
    if (!isBorderAssetValid.value) {
      toastStore.error('Veuillez configurer correctement la bordure.');
      return;
    }
    borderAssetData = buildBorderAssetData();
  }

  // Store card data for confirmation modal WITHOUT creating assets yet
  pendingCardData.value = {
    title: title.value,
    imageBase64: imageBase64.value,
    imageMimeType: imageMimeType.value,
    frontAssetId: selectedFrontAssetId.value,
    borderAssetId: selectedBorderAssetId.value,
    frontAssetData,
    borderAssetData,
    titlePosX: titlePosX.value,
    titlePosY: titlePosY.value,
    titleAlign: titleAlign.value,
    titleWidth: titleWidth.value,
    removeImageBg: removeImageBg.value,
    holographicEffect: holographicEffect.value,
    holographicIntensity: holographicIntensity.value,
    titleColor: titleColor.value,
    imagePosX: imagePosX.value,
    imagePosY: imagePosY.value,
    imageScale: imageScale.value,
    imageWidth: imageWidth.value,
    imageHeight: imageHeight.value,
    imageObjectFit: imageObjectFit.value,
    rarity: rarity.value,
    customTexts: customTexts.value,
  };

  // Show confirmation modal
  showConfirmationModal.value = true;
};

// Confirm card creation from modal
const confirmCardCreation = async () => {
  if (!pendingCardData.value) return;

  try {
    // Determine if we're using a new or existing front asset
    let finalFrontAssetId = pendingCardData.value.frontAssetId;

    // If no existing asset is selected, create the new one NOW
    if (!finalFrontAssetId && pendingCardData.value.frontAssetData) {
      const newAsset = await cardStore.createCardAsset(pendingCardData.value.frontAssetData);
      if (!newAsset) {
        toastStore.error('Erreur lors de la création du fond.');
        return;
      }
      finalFrontAssetId = newAsset.id;
    }

    // Determine if we're using a new or existing border asset
    let finalBorderAssetId: string | undefined;

    if (pendingCardData.value.borderAssetId) {
      finalBorderAssetId = pendingCardData.value.borderAssetId;
    } else if (pendingCardData.value.borderAssetData) {
      const newAsset = await cardStore.createCardAsset(pendingCardData.value.borderAssetData);
      if (newAsset) {
        finalBorderAssetId = newAsset.id;
      }
    }

    // Create the card with the asset IDs
    const card = await cardStore.createCard({
      title: pendingCardData.value.title,
      imageBase64: pendingCardData.value.imageBase64,
      imageMimeType: pendingCardData.value.imageMimeType,
      frontAssetId: finalFrontAssetId,
      borderAssetId: finalBorderAssetId,
      titlePosX: pendingCardData.value.titlePosX,
      titlePosY: pendingCardData.value.titlePosY,
      titleAlign: pendingCardData.value.titleAlign,
      titleWidth: pendingCardData.value.titleWidth,
      removeImageBg: pendingCardData.value.removeImageBg,
      holographicEffect: pendingCardData.value.holographicEffect,
      holographicIntensity: pendingCardData.value.holographicIntensity,
      titleColor: pendingCardData.value.titleColor,
      imagePosX: pendingCardData.value.imagePosX,
      imagePosY: pendingCardData.value.imagePosY,
      imageScale: pendingCardData.value.imageScale,
      imageWidth: pendingCardData.value.imageWidth,
      imageHeight: pendingCardData.value.imageHeight,
    imageObjectFit: pendingCardData.value.imageObjectFit,
    rarity: pendingCardData.value.rarity,
    customTexts: pendingCardData.value.customTexts,
  });

    if (card) {
      toastStore.success('Carte créée avec succès ! En attente de validation admin.');

      // Reset form
      title.value = '';
      imageUrl.value = '';
      imageBase64.value = '';
      imageMimeType.value = '';
      selectedFrontAssetId.value = undefined;
      selectedBorderAssetId.value = undefined;

      // Reset personnalisation
      titlePosX.value = 50;
      titlePosY.value = 10;
      titleAlign.value = 'center';
      titleWidth.value = 'w-full';
      removeImageBg.value = false;
      holographicEffect.value = true;
      holographicIntensity.value = 0.6;
      titleColor.value = '#ffffff';
      imagePosX.value = 50;
      imagePosY.value = 30;
      imageScale.value = 1;
      imageWidth.value = 160;
      imageHeight.value = 160;
      imageObjectFit.value = 'cover';
      rarity.value = 'common';
      customTexts.value = [];

      // Reset background asset
      backgroundAssetName.value = '';
      backgroundAssetType.value = 'solid';
      backgroundSolidColor.value = '#667eea';
      backgroundGradientColor1.value = '#667eea';
      backgroundGradientColor2.value = '#764ba2';
      backgroundGradientAngle.value = 135;
      backgroundAssetImageBase64.value = '';
      backgroundAssetImageMimeType.value = '';
      backgroundAssetImagePreview.value = '';

      // Reset border asset
      borderAssetName.value = '';
      borderAssetType.value = 'solid';
      borderSolidColor.value = '#ffffff';
      borderAssetImageBase64.value = '';
      borderAssetImageMimeType.value = '';
      borderAssetImagePreview.value = '';

      // Close modal and reset
      showConfirmationModal.value = false;
      pendingCardData.value = null;

      // Fetch updated cards
      await cardStore.fetchCards();
    }
  } catch (error) {
    toastStore.error('Erreur lors de la création de la carte.');
  }
};

// Cancel card creation from modal
const cancelCardCreation = () => {
  showConfirmationModal.value = false;
  pendingCardData.value = null;
};

const resetForm = () => {
  title.value = '';
  imageUrl.value = '';
  imageBase64.value = '';
  imageMimeType.value = '';
  selectedFrontAssetId.value = undefined;
  selectedBorderAssetId.value = undefined;

  // Reset personnalisation
  titlePosX.value = 50;
  titlePosY.value = 10;
  titleAlign.value = 'center';
  titleWidth.value = 'w-full';
  removeImageBg.value = false;
  holographicEffect.value = true;
  holographicIntensity.value = 0.6;
  titleColor.value = '#ffffff';
  imagePosX.value = 50;
  imagePosY.value = 30;
  imageScale.value = 1;
  imageWidth.value = 160;
  imageHeight.value = 160;
  imageObjectFit.value = 'cover';
  rarity.value = 'common';
  customTexts.value = [];

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

onMounted(async () => {
  await cardStore.fetchCardAssets();
  await cardStore.fetchCards();
  await cardStore.fetchDiscordAvatars();
});

// Helper to convert image to base64 with resize if needed
const convertImageToBase64 = async (file: File): Promise<{ base64: string; mimeType: string } | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const mimeType = file.type || 'image/png';
    reader.onload = async (e) => {
      const result = e.target?.result as string;

      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        // If larger than 5MB, resize using canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions to keep aspect ratio
          const maxDimension = 1024;
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL(mimeType);
            const base64 = dataUrl.split(',')[1] || '';
            resolve({ base64, mimeType });
          } else {
            resolve(null);
          }
        };
        img.src = result;
      } else {
        // If smaller than 5MB, use as is
        const base64 = result.split(',')[1] || '';
        resolve({ base64, mimeType });
      }
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
};

// Helper to load image from URL
const loadImageFromUrl = async (url: string): Promise<{ base64: string; mimeType: string } | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'image', { type: blob.type });
    return await convertImageToBase64(file);
  } catch (error) {
    toastStore.error('Erreur lors du chargement de l\'image depuis l\'URL.');
    console.error(error);
    return null;
  }
};

// Watchers
watch(imageUrlInput, async (newUrl) => {
  if (imageSourceType.value === 'url' && newUrl.trim()) {
    const base64Data = await loadImageFromUrl(newUrl.trim());
    if (base64Data) {
      imageBase64.value = base64Data.base64;
      imageMimeType.value = base64Data.mimeType;
      imageUrl.value = '';
    }
  }
});

watch(selectedDiscordMemberId, async (newMemberId) => {
  if (imageSourceType.value === 'discord' && newMemberId) {
    const member = cardStore.discordAvatars.find(m => m.id === newMemberId);
    if (member) {
      const base64Data = await loadImageFromUrl(member.avatarUrl);
      if (base64Data) {
        imageBase64.value = base64Data.base64; // Assuming avatar is already in base64 format
        imageMimeType.value = base64Data.mimeType; // Default to PNG for Discord avatars
        imageUrl.value = '';
      }
    }
  }
});

watch(imageSourceType, (newType) => {
  if (newType === 'upload') {
    // Clear URL and Discord selection when uploading new image
    imageUrlInput.value = '';
    selectedDiscordMemberId.value = '';
    discordSearchQuery.value = '';
  } else if (newType === 'url') {
    // Clear file input and Discord selection when using URL
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    selectedDiscordMemberId.value = '';
    discordSearchQuery.value = '';
  } else if (newType === 'discord') {
    // Clear file input and URL when using Discord avatar
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    imageUrlInput.value = '';
  }
});
</script>

<template>
  <template v-if="width <= 1280">
    <div class="py-8 space-y-8">
      <p class="text-center text-foam-300">Le créateur de carte n'est pas encore optimisé pour les petits écrans. Veuillez utiliser un appareil avec un écran plus grand pour accéder à cette fonctionnalité.</p>
    </div>

  </template>
  <template v-else>
    <div class="py-8 space-y-8">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <div class="h-px w-16 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Créateur</p>
          <h1 class="text-2xl font-semibold text-white/90">Création de Carte</h1>
        </div>
      </div>

      <div class="flex gap-8">
        <!-- Card Preview Panel - Sticky -->
        <div class="w-full lg:w-1/2 lg:sticky lg:top-8 h-fit">
          <Card class="p-8 flex flex-col items-center justify-center">
            <h2 class="text-lg font-semibold text-foam-200 mb-6">Aperçu 3D</h2>
            <div class="flex items-center justify-center">
              <CollectibleCard
                :title="title"
                :image-url="imageUrl"
                :image-base64="imageBase64"
                :image-mime-type="imageMimeType"
                :front-asset="selectedFrontAsset"
                :border-asset="selectedBorderAsset"
                :interactive="true"
                :title-pos-x="titlePosX"
                :title-pos-y="titlePosY"
                :title-align="titleAlign"
                :title-width="titleWidth"
                :remove-image-bg="removeImageBg"
                :holographic-effect="holographicEffect"
                :holographic-intensity="holographicIntensity"
                :title-color="titleColor"
                :image-pos-x="imagePosX"
                :image-pos-y="imagePosY"
                :image-scale="imageScale"
                :image-width="imageWidth"
                :image-height="imageHeight"
                :image-object-fit="imageObjectFit"
                :rarity="rarity"
                :custom-texts="customTexts"
              />
            </div>
            <p class="text-sm text-foam-300/60 mt-6 text-center">
              Déplacez votre souris sur la carte pour voir l'effet 3D
            </p>
          </Card>
        </div>

        <!-- Editor Panel -->
        <div class="w-full lg:w-1/2">
          <Card class="p-8 space-y-6">
          <h2 class="text-lg font-semibold text-foam-200 mb-4">Personnalisation</h2>

          <!-- SECTION TITRE ET SA PERSONNALISATION -->
          <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
            <h3 class="text-sm font-semibold text-foam-200">Titre</h3>

            <!-- Title Input -->
            <div class="space-y-2">
              <label class="form-label text-sm">Contenu du titre *</label>
              <input
                v-model="title"
                type="text"
                maxlength="30"
                placeholder="Entrez le titre de votre carte"
                class="form-input"
              />
              <p class="text-xs text-foam-300/50">{{ title.length }}/30 caractères</p>
            </div>

            <!-- Title Color -->
            <div class="space-y-2">
              <label class="text-xs text-foam-300">Couleur du titre</label>
              <div class="flex gap-3 items-center">
                <input
                  v-model="titleColor"
                  type="color"
                  class="w-12 h-10 rounded cursor-pointer border border-white/10"
                />
                <input
                  v-model="titleColor"
                  type="text"
                  placeholder="#ffffff"
                  class="flex-1 form-input text-sm"
                />
              </div>
            </div>

            <!-- Title Positioning -->
            <div class="space-y-2">
              <label class="text-xs text-foam-300 block">Position du titre</label>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-foam-300/80 block mb-1">X</label>
                  <div class="flex gap-2 items-center">
                    <input
                      v-model.number="titlePosX"
                      type="range"
                      min="0"
                      max="100"
                      class="flex-1"
                    />
                    <span class="text-xs text-foam-300 w-8">{{ titlePosX }}%</span>
                  </div>
                </div>
                <div>
                  <label class="text-xs text-foam-300/80 block mb-1">Y</label>
                  <div class="flex gap-2 items-center">
                    <input
                      v-model.number="titlePosY"
                      type="range"
                      min="0"
                      max="100"
                      class="flex-1"
                    />
                    <span class="text-xs text-foam-300 w-8">{{ titlePosY }}%</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  :class="titleAlign === 'left' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-2 py-1 rounded text-xs font-medium transition-colors flex-1"
                  @click="titleAlign = 'left'"
                >
                  Gauche
                </button>
                <button
                  :class="titleAlign === 'center' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-2 py-1 rounded text-xs font-medium transition-colors flex-1"
                  @click="titleAlign = 'center'"
                >
                  Centré
                </button>
                <button
                  :class="titleAlign === 'right' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-2 py-1 rounded text-xs font-medium transition-colors flex-1"
                  @click="titleAlign = 'right'"
                >
                  Droite
                </button>
              </div>

              <!-- Title width -->
              <div class="space-y-2">
                <label class="text-xs text-foam-300 block">Largeur du titre</label>
                <div class="flex gap-2">
                  <button
                    :class="titleWidth === 'w-full' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                    class="px-2 py-1 rounded text-xs font-medium transition-colors flex-1"
                    @click="titleWidth = 'w-full'"
                  >
                    Pleine largeur
                  </button>
                  <button
                    :class="titleWidth === 'w-auto' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                    class="px-2 py-1 rounded text-xs font-medium transition-colors flex-1"
                    @click="titleWidth = 'w-auto'"
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION TEXTES PERSONNALISÉS -->
          <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-foam-200">Textes personnalisés (0-5)</h3>
              <Button
                v-if="customTexts.length < 5"
                variant="secondary"
                size="sm"
                @click="addCustomText"
              >
                + Ajouter texte
              </Button>
            </div>

            <!-- Custom texts list -->
            <div v-if="customTexts.length === 0" class="text-xs text-foam-300/60 py-4">
              Aucun texte personnalisé. Cliquez sur "+ Ajouter texte" pour en ajouter.
            </div>

            <div v-for="(text, index) in customTexts" :key="index" class="space-y-3 p-3 border border-white/10 rounded bg-ink-700/20">
              <!-- Text content -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs text-foam-300">Texte {{ index + 1 }}</label>
                  <Button
                    variant="danger"
                    size="sm"
                    @click="removeCustomText(index)"
                  >
                    Supprimer
                  </Button>
                </div>
                <textarea
                  :value="text.content"
                  @input="updateCustomText(index, 'content', ($event.target as HTMLTextAreaElement).value)"
                  rows="2"
                  maxlength="100"
                  placeholder="Entrez votre texte..."
                  class="form-input resize-none w-full text-sm"
                />
                <p class="text-xs text-foam-300/50">{{ text.content.length }}/100 caractères</p>
              </div>

              <!-- Text color -->
              <div class="space-y-2">
                <label class="text-xs text-foam-300">Couleur</label>
                <div class="flex gap-3 items-center">
                  <input
                    :value="text.color"
                    type="color"
                    @input="updateCustomText(index, 'color', ($event.target as HTMLInputElement).value)"
                    class="w-12 h-8 rounded cursor-pointer border border-white/10"
                  />
                  <input
                    :value="text.color"
                    type="text"
                    @input="updateCustomText(index, 'color', ($event.target as HTMLInputElement).value)"
                    placeholder="#ffffff"
                    class="flex-1 form-input text-sm"
                  />
                </div>
              </div>

              <!-- Text positioning -->
              <div class="space-y-2">
                <label class="text-xs text-foam-300 block">Position</label>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs text-foam-300/80 block mb-1">X</label>
                    <div class="flex gap-2 items-center">
                      <input
                        :value="text.posX"
                        @input="updateCustomText(index, 'posX', Number(($event.target as HTMLInputElement).value))"
                        type="range"
                        min="0"
                        max="100"
                        class="flex-1"
                      />
                      <span class="text-xs text-foam-300 w-8">{{ text.posX }}%</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs text-foam-300/80 block mb-1">Y</label>
                    <div class="flex gap-2 items-center">
                      <input
                        :value="text.posY"
                        @input="updateCustomText(index, 'posY', Number(($event.target as HTMLInputElement).value))"
                        type="range"
                        min="0"
                        max="100"
                        class="flex-1"
                      />
                      <span class="text-xs text-foam-300 w-8">{{ text.posY }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Text alignment -->
              <div class="space-y-2">
                <label class="text-xs text-foam-300 block">Alignement</label>
                <div class="flex gap-2">
                  <button
                    :class="text.align === 'left' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                    class="px-2 py-1 rounded text-xs font-medium transition-colors flex-1"
                    @click="updateCustomText(index, 'align', 'left')"
                  >
                    Gauche
                  </button>
                  <button
                    :class="text.align === 'center' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                    class="px-2 py-1 rounded text-xs font-medium transition-colors flex-1"
                    @click="updateCustomText(index, 'align', 'center')"
                  >
                    Centré
                  </button>
                  <button
                    :class="text.align === 'right' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                    class="px-2 py-1 rounded text-xs font-medium transition-colors flex-1"
                    @click="updateCustomText(index, 'align', 'right')"
                  >
                    Droite
                  </button>
                </div>
              </div>

              <!-- Text width -->
              <div class="space-y-2">
                <label class="text-xs text-foam-300 block">Largeur du texte</label>
                <div class="flex gap-2">
                  <button
                    :class="text.width === 'w-full' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                    class="px-2 py-1 rounded text-xs font-medium transition-colors flex-1"
                    @click="updateCustomText(index, 'width', 'w-full')"
                  >
                    Pleine largeur
                  </button>
                  <button
                    :class="text.width === 'w-auto' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                    class="px-2 py-1 rounded text-xs font-medium transition-colors flex-1"
                    @click="updateCustomText(index, 'width', 'w-auto')"
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION IMAGE PRINCIPALE -->
          <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
            <h3 class="text-sm font-semibold text-foam-200">Image principale</h3>

            <!-- Image Upload -->
            <div class="space-y-2">
              <label class="form-label text-sm">Importer une image</label>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageUpload"
              />
              <div class="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  @click="triggerFileInput"
                >
                  {{ imageUrl ? 'Changer l\'image' : 'Ajouter une image' }}
                </Button>
                <Button
                  v-if="imageUrl"
                  variant="danger"
                  size="sm"
                  @click="removeImage"
                >
                  Supprimer
                </Button>
              </div>
            </div>

            <!-- Image Source Selection -->
            <div class="space-y-2">
              <label class="text-xs text-foam-300 block">Source de l'image</label>
              <div class="flex gap-2">
                <button
                  :class="imageSourceType === 'upload' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-3 py-2 rounded text-xs font-medium transition-colors flex-1"
                  @click="imageSourceType = 'upload'"
                >
                  Téléverser
                </button>
                <button
                  :class="imageSourceType === 'url' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-3 py-2 rounded text-xs font-medium transition-colors flex-1"
                  @click="imageSourceType = 'url'"
                >
                  URL
                </button>
                <button
                  v-if="cardStore.discordAvatars.length > 0"
                  :class="imageSourceType === 'discord' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-3 py-2 rounded text-xs font-medium transition-colors flex-1"
                  @click="imageSourceType = 'discord'"
                >
                  Discord ({{ cardStore.discordAvatars.length }})
                </button>
              </div>
            </div>

            <!-- URL Input -->
            <div v-if="imageSourceType === 'url'" class="space-y-2">
              <label class="form-label text-sm">URL de l'image</label>
              <div class="flex gap-2">
                <input
                  v-model="imageUrlInput"
                  type="text"
                  placeholder="Entrez l'URL de l'image"
                  class="form-input flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  @click="async () => {
                    if (!imageUrlInput.trim()) {
                      toastStore.error('Veuillez entrer une URL valide.');
                      return;
                    }
                    const base64Data = await loadImageFromUrl(imageUrlInput.trim());
                    if (base64Data) {
                      (imageBase64 as any).value = base64Data.base64;
                      (imageMimeType as any).value = base64Data.mimeType;
                    }
                  }"
                >
                  Charger
                </Button>
              </div>
            </div>

            <!-- Discord Member Selector -->
            <div v-if="imageSourceType === 'discord'" class="space-y-2">
              <label class="form-label text-sm">Sélectionner un avatar Discord</label>

              <!-- Search Input -->
              <input
                v-model="discordSearchQuery"
                type="text"
                placeholder="Rechercher par username..."
                class="form-input"
              />

              <!-- Discord Members Grid -->
              <div v-if="filteredDiscordMembers.length > 0" class="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-white/10 rounded-lg p-3 bg-ink-700/20">
                <button
                  v-for="member in filteredDiscordMembers"
                  :key="member.id"
                  :class="selectedDiscordMemberId === member.id ? 'ring-2 ring-accent-400 border-accent-400' : 'border-white/10 hover:border-white/30'"
                  class="flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105"
                  :title="member.username"
                  @click="selectedDiscordMemberId = member.id"
                >
                  <img
                    :src="member.avatarUrl"
                    :alt="member.username"
                    class="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                  <span class="text-xs text-foam-300 truncate max-w-[3rem]">{{ member.username }}</span>
                </button>
              </div>

              <!-- No results message -->
              <div v-else class="text-xs text-foam-300/60 py-4 text-center">
                {{ discordSearchQuery ? 'Aucun membre trouvé.' : 'Aucun membre disponible.' }}
              </div>
            </div>

            <!-- Image Positioning and Scale -->
            <div class="space-y-2">
              <label class="text-xs text-foam-300 block">Position de l'image</label>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-foam-300/80 block mb-1">X</label>
                  <div class="flex gap-2 items-center">
                    <input
                      v-model.number="imagePosX"
                      type="range"
                      min="0"
                      max="100"
                      class="flex-1"
                    />
                    <span class="text-xs text-foam-300 w-8">{{ imagePosX }}%</span>
                  </div>
                </div>
                <div>
                  <label class="text-xs text-foam-300/80 block mb-1">Y</label>
                  <div class="flex gap-2 items-center">
                    <input
                      v-model.number="imagePosY"
                      type="range"
                      min="0"
                      max="100"
                      class="flex-1"
                    />
                    <span class="text-xs text-foam-300 w-8">{{ imagePosY }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image Scale -->
            <div class="space-y-2">
              <label class="text-xs text-foam-300">Échelle de l'image</label>
              <div class="flex gap-2 items-center">
                <input
                  v-model.number="imageScale"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  class="flex-1"
                />
                <span class="text-xs text-foam-300 w-10">{{ imageScale.toFixed(1) }}x</span>
              </div>
            </div>

            <!-- Image Container Size -->
            <div class="space-y-2">
              <label class="text-xs text-foam-300 block">Taille du conteneur</label>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-foam-300/80 block mb-1">Largeur (px)</label>
                  <input
                    v-model.number="imageWidth"
                    type="range"
                    min="40"
                    max="300"
                    step="10"
                    class="w-full"
                  />
                  <span class="text-xs text-foam-300">{{ imageWidth }}px</span>
                </div>
                <div>
                  <label class="text-xs text-foam-300/80 block mb-1">Hauteur (px)</label>
                  <input
                    v-model.number="imageHeight"
                    type="range"
                    min="40"
                    max="300"
                    step="10"
                    class="w-full"
                  />
                  <span class="text-xs text-foam-300">{{ imageHeight }}px</span>
                </div>
              </div>
            </div>

            <!-- Image Object Fit -->
            <div class="space-y-2">
              <label class="text-xs text-foam-300 block">Ajustement de l'image</label>
              <div class="flex gap-2">
                <button
                  :class="imageObjectFit === 'cover' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-3 py-1 rounded text-xs font-medium transition-colors flex-1"
                  @click="imageObjectFit = 'cover'"
                >
                  Cover (rognée)
                </button>
                <button
                  :class="imageObjectFit === 'contain' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-3 py-1 rounded text-xs font-medium transition-colors flex-1"
                  @click="imageObjectFit = 'contain'"
                >
                  Contain (complète)
                </button>
              </div>
            </div>
          </div>

          <!-- SECTION RARETÉ -->
          <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
            <h3 class="text-sm font-semibold text-foam-200">Rareté</h3>

            <!-- Rarity Selection -->
            <div class="space-y-2">
              <label class="text-xs text-foam-300 block">Sélectionnez la rareté de la carte</label>
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="r in ['common', 'uncommon', 'rare', 'epic', 'legendary']"
                  :key="r"
                  :class="rarity === r ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-2 py-2 rounded text-xs font-medium transition-colors"
                  :title="r.charAt(0).toUpperCase() + r.slice(1)"
                  @click="rarity = r as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'"
                >
                  {{ r === 'common' ? '⚪' : r === 'uncommon' ? '🟩' : r === 'rare' ? '🟦' : r === 'epic' ? '🟪' : '🟨' }}
                </button>
              </div>
            </div>
          </div>

          <!-- SECTION EFFETS -->
          <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
            <h3 class="text-sm font-semibold text-foam-200">Effets</h3>

            <!-- Remove Background Toggle -->
            <div class="flex items-center gap-3">
              <input
                v-model="removeImageBg"
                type="checkbox"
                id="removeBg"
                class="w-4 h-4 rounded cursor-pointer"
              />
              <label for="removeBg" class="text-sm text-foam-300 cursor-pointer">
                Supprimer le fond de l'image (approximatif)
              </label>
            </div>

            <!-- Holographic Effect Toggle -->
            <div class="flex items-center gap-3">
              <input
                v-model="holographicEffect"
                type="checkbox"
                id="holoEffect"
                class="w-4 h-4 rounded cursor-pointer"
              />
              <label for="holoEffect" class="text-sm text-foam-300 cursor-pointer">
                Activer l'effet holographique
              </label>
            </div>

            <!-- Holographic Intensity Slider -->
            <div v-if="holographicEffect" class="space-y-2 ml-6">
              <label class="text-xs text-foam-300">Intensité de l'effet</label>
              <div class="flex gap-2 items-center">
                <input
                  v-model.number="holographicIntensity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  class="flex-1"
                />
                <span class="text-xs text-foam-300 w-10">{{ Math.round(holographicIntensity * 100) }}%</span>
              </div>
            </div>
          </div>
          <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-foam-200">Créer ou sélectionner un asset</h3>
              <div class="flex gap-2">
                <button
                  :class="assetCategory === 'background' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-3 py-1 rounded text-xs font-medium transition-colors"
                  @click="assetCategory = 'background'"
                >
                  Fond
                </button>
                <button
                  :class="assetCategory === 'border' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                  class="px-3 py-1 rounded text-xs font-medium transition-colors"
                  @click="assetCategory = 'border'"
                >
                  Bordure
                </button>
              </div>
            </div>

            <!-- Asset Type Tabs -->
            <div class="flex gap-2">
              <button
                :class="getCurrentAssetType() === 'solid' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                class="px-3 py-2 rounded text-sm font-medium transition-colors"
                @click="setCurrentAssetType('solid')"
              >
                Couleur
              </button>
              <button
                v-if="assetCategory === 'background'"
                :class="getCurrentAssetType() === 'gradient' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                class="px-3 py-2 rounded text-sm font-medium transition-colors"
                @click="setCurrentAssetType('gradient')"
              >
                Dégradé
              </button>
              <button
                :class="getCurrentAssetType() === 'image' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                class="px-3 py-2 rounded text-sm font-medium transition-colors"
                @click="setCurrentAssetType('image')"
              >
                Image
              </button>
            </div>

            <!-- Solid Color -->
            <div v-if="getCurrentAssetType() === 'solid'" class="space-y-3">
              <div class="flex gap-3 items-center">
                <input
                  :value="getCurrentSolidColor()"
                  type="color"
                  class="w-16 h-10 rounded cursor-pointer"
                  @input="(e) => setCurrentSolidColor((e.target as HTMLInputElement).value)"
                />
                <input
                  :value="getCurrentSolidColor()"
                  type="text"
                  placeholder="#667eea"
                  class="flex-1 form-input text-sm"
                  @input="(e) => setCurrentSolidColor((e.target as HTMLInputElement).value)"
                />
              </div>
              <div
                class="w-full h-20 rounded-lg border border-white/10"
                :style="{ background: getCurrentSolidColor() }"
              />
            </div>

            <!-- Gradient -->
            <div v-if="getCurrentAssetType() === 'gradient' && assetCategory === 'background'" class="space-y-3">
              <div>
                <label class="form-label text-sm">Couleur 1</label>
                <div class="flex gap-3 items-center mt-1">
                  <input
                    :value="getCurrentGradientColor1()"
                    type="color"
                    class="w-16 h-10 rounded cursor-pointer"
                    @input="(e) => setCurrentGradientColor1((e.target as HTMLInputElement).value)"
                  />
                  <input
                    :value="getCurrentGradientColor1()"
                    type="text"
                    placeholder="#667eea"
                    class="flex-1 form-input text-sm"
                    @input="(e) => setCurrentGradientColor1((e.target as HTMLInputElement).value)"
                  />
                </div>
              </div>
              <div>
                <label class="form-label text-sm">Couleur 2</label>
                <div class="flex gap-3 items-center mt-1">
                  <input
                    :value="getCurrentGradientColor2()"
                    type="color"
                    class="w-16 h-10 rounded cursor-pointer"
                    @input="(e) => setCurrentGradientColor2((e.target as HTMLInputElement).value)"
                  />
                  <input
                    :value="getCurrentGradientColor2()"
                    type="text"
                    placeholder="#764ba2"
                    class="flex-1 form-input text-sm"
                    @input="(e) => setCurrentGradientColor2((e.target as HTMLInputElement).value)"
                  />
                </div>
              </div>
              <div>
                <label class="form-label text-sm">Angle (0-360°)</label>
                <div class="flex gap-3 items-center mt-1">
                  <input
                    :value="getCurrentGradientAngle()"
                    type="range"
                    min="0"
                    max="360"
                    class="flex-1"
                    @input="(e) => setCurrentGradientAngle(Number((e.target as HTMLInputElement).value))"
                  />
                  <span class="text-sm text-foam-300 w-12">{{ getCurrentGradientAngle() }}°</span>
                </div>
              </div>
              <div
                class="w-full h-20 rounded-lg border border-white/10"
                :style="{ background: `linear-gradient(${getCurrentGradientAngle()}deg, ${getCurrentGradientColor1()} 0%, ${getCurrentGradientColor2()} 100%)` }"
              />
            </div>

            <!-- Image Upload -->
            <div v-if="getCurrentAssetType() === 'image'" class="space-y-3">
              <input
                v-if="assetCategory === 'background'"
                ref="backgroundAssetImageInputRef"
                type="file"
                accept="image/png,image/gif"
                class="hidden"
                @change="handleAssetImageUpload"
              />
              <input
                v-else
                ref="borderAssetImageInputRef"
                type="file"
                accept="image/png,image/gif"
                class="hidden"
                @change="handleAssetImageUpload"
              />
              <div class="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  @click="triggerAssetImageInput"
                >
                  {{ getCurrentImagePreview() ? 'Changer l\'image' : 'Ajouter une image' }}
                </Button>
                <Button
                  v-if="getCurrentImagePreview()"
                  variant="danger"
                  size="sm"
                  @click="removeAssetImage"
                >
                  Supprimer
                </Button>
              </div>
              <p class="text-xs text-foam-300/50">PNG ou GIF, max 10MB</p>
              <div
                v-if="getCurrentImagePreview()"
                class="w-full h-20 rounded-lg border border-white/10 overflow-hidden"
              >
                <img
                  :src="getCurrentImagePreview()"
                  alt="Aperçu de l'asset"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>

            <!-- Asset Name (only shown when creating new asset) -->
            <div class="space-y-2">
              <label class="form-label text-sm">Nommer cet asset (pour le créer)</label>
              <input
                :value="getCurrentAssetName()"
                type="text"
                :placeholder="`ex: ${assetCategory === 'background' ? 'Ciel étoilé' : 'Bordure dorée'}`"
                class="form-input text-sm"
                @input="(e) => setCurrentAssetName((e.target as HTMLInputElement).value)"
              />
              <p class="text-xs text-foam-300/50">Laissez vide pour sélectionner un asset existant</p>
            </div>
          </div>

          <!-- Background Assets Selector -->
          <div class="space-y-3">
            <label class="form-label">Fonds disponibles</label>
            <div v-if="cardStore.getCardAssetsByCategory('background').length === 0" class="text-sm text-foam-300/60">
              Aucun fond créé pour le moment.
            </div>
            <div v-else class="grid grid-cols-4 gap-3">
              <button
                v-for="asset in cardStore.getCardAssetsByCategory('background')"
                :key="asset.id"
                class="w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden relative"
                :class="selectedFrontAssetId === asset.id ? 'border-accent-400 ring-2 ring-accent-400/50' : 'border-white/10 hover:border-white/30'"
                :style="
                  asset.type === 'solid'
                    ? { background: asset.solidColor }
                    : asset.type === 'gradient'
                      ? { background: `linear-gradient(${asset.angle || 135}deg, ${asset.color1} 0%, ${asset.color2} 100%)` }
                      : { background: '#1a1a2e' }
                "
                :title="asset.name"
                @click="selectedFrontAssetId = asset.id"
              >
                <button class="absolute top-1 right-1">
                  <VueIcon name="fa:trash" class="text-red-400 cursor-pointer" @click.stop="cardStore.deleteAsset(asset.id)" />
                </button>
                <img
                  v-if="asset.type === 'image' && asset.imageBase64"
                  :src="`data:${asset.imageMimeType || 'image/png'};base64,${asset.imageBase64}`"
                  :alt="asset.name"
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          <!-- Border Assets Selector -->
          <div class="space-y-3">
            <label class="form-label">Bordures disponibles</label>
            <div v-if="cardStore.getCardAssetsByCategory('border').length === 0" class="text-sm text-foam-300/60">
              Aucune bordure créée pour le moment.
            </div>
            <div v-else class="grid grid-cols-4 gap-3">
              <button
                v-for="asset in cardStore.getCardAssetsByCategory('border')"
                :key="asset.id"
                class="w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden bg-ink-800 relative"
                :class="selectedBorderAssetId === asset.id ? 'border-accent-400 ring-2 ring-accent-400/50' : 'border-white/10 hover:border-white/30'"
                :style="
                  asset.type === 'solid'
                    ? { borderColor: asset.solidColor }
                    : {}
                "
                :title="asset.name"
                @click="selectedBorderAssetId = asset.id"
              >
                <button class="absolute top-1 right-1">
                  <VueIcon name="fa:trash" class="text-red-400 cursor-pointer" @click.stop="cardStore.deleteAsset(asset.id)" />
                </button>
                <img
                  v-if="asset.type === 'image' && asset.imageBase64"
                  :src="`data:${asset.imageMimeType || 'image/png'};base64,${asset.imageBase64}`"
                  :alt="asset.name"
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-4">
            <Button
              variant="primary"
              :disabled="!isFormValid || cardStore.loading"
              :loading="cardStore.loading"
              @click="saveCard"
              class="flex-1"
            >
              Sauvegarder la carte
            </Button>
            <Button
              variant="ghost"
              @click="resetForm"
            >
              Réinitialiser
            </Button>
          </div>
          </Card>
        </div>
      </div>

      <!-- Saved Cards Section -->
      <div v-if="cardStore.cards.length > 0" class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="h-px w-16 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Collection</p>
            <h2 class="text-xl font-semibold text-white/90">
              Vos Cartes <span class="text-foam-200/60">({{ cardStore.cards.length }})</span>
            </h2>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            v-for="card in cardStore.cards"
            :key="card.id"
            class="flex flex-col items-center min-w-64 w-64"
          >
            <CollectibleCard
              :title="card.title"
              :image-url="card.imageUrl"
              :image-base64="card.imageBase64"
              :image-mime-type="card.imageMimeType"
              :front-asset="card.frontAsset"
              :border-asset="card.borderAsset"
              :interactive="true"
              :title-pos-x="card.titlePosX ?? 50"
              :title-pos-y="card.titlePosY ?? 10"
              :title-align="card.titleAlign ?? 'center'"
              :title-width="card.titleWidth ?? 'w-full'"
              :remove-image-bg="card.removeImageBg ?? false"
              :holographic-effect="card.holographicEffect ?? true"
              :holographic-intensity="card.holographicIntensity ?? 0.6"
              :title-color="card.titleColor ?? '#ffffff'"
              :image-pos-x="card.imagePosX ?? 50"
              :image-pos-y="card.imagePosY ?? 30"
              :image-scale="card.imageScale ?? 1"
              :image-width="card.imageWidth ?? 160"
              :image-height="card.imageHeight ?? 160"
              :image-object-fit="card.imageObjectFit ?? 'cover'"
              :rarity="card.rarity ?? 'common'"
              :custom-texts="card.customTexts ?? []"
            />
            <Button
              variant="danger"
              size="sm"
              class="mt-4"
              @click="cardStore.deleteCard(card.id)"
              :disabled="card.status === 'active'"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <Modal :is-open="showConfirmationModal" @close="cancelCardCreation" class="!max-w-3xl">
        <template #header>
          <h2 class="text-lg font-semibold text-center">Confirmer la création de la carte</h2>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-center text-foam-300/80">
            Vous allez créer une nouvelle carte avec les paramètres suivants :
          </p>

          <!-- Confirmation Details -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-xs text-foam-300/70">Titre</span>
              <p class="text-sm font-semibold text-white truncate">{{ title }}</p>
            </div>
            <div>
              <span class="text-xs text-foam-300/70">Rareté</span>
              <p class="text-sm font-semibold text-white">{{ rarity }}</p>
            </div>
            <div>
              <span class="text-xs text-foam-300/70">Image principale</span>
              <div class="flex items-center gap-2">
                <img
                  v-if="imageBase64"
                  :src="`data:${imageMimeType};base64,${imageBase64}`"
                  alt="Aperçu de l'image"
                  class="w-16 h-16 rounded-lg object-cover border border-white/10"
                />
                <span class="text-sm font-semibold text-white truncate">{{ imageUrl }}</span>
              </div>
            </div>
            <div>
              <span class="text-xs text-foam-300/70">Front Asset</span>
              <p class="text-sm font-semibold text-white truncate">
                {{ pendingCardData?.frontAssetId ? cardStore.getCardAssetById(pendingCardData.frontAssetId)?.name : 'Nouveau fond' }}
              </p>
            </div>
            <div>
              <span class="text-xs text-foam-300/70">Border Asset</span>
              <p class="text-sm font-semibold text-white truncate">
                {{ pendingCardData?.borderAssetId ? cardStore.getCardAssetById(pendingCardData.borderAssetId)?.name : 'Pas de bordure' }}
              </p>
            </div>
          </div>

          <!-- Custom Texts Preview -->
          <div v-if="pendingCardData?.customTexts.length > 0" class="mt-4">
            <span class="text-xs text-foam-300/70">Textes personnalisés</span>
            <div class="space-y-2 mt-1">
              <div
                v-for="(text, index) in pendingCardData.customTexts"
                :key="index"
                class="p-3 rounded-lg bg-ink-700/20 border border-white/10"
              >
                <p class="text-sm font-semibold text-white">{{ text.content }}</p>
                <p class="text-xs text-foam-300/70">
                  Position : X{{ text.posX }}%, Y{{ text.posY }}% |
                  Alignement : {{ text.align }} |
                  Couleur : {{ text.color }}
                </p>
              </div>
            </div>
          </div>

          <!-- Warning Message -->
          <div class="text-xs text-foam-300/70">
            <p>
              Remarque : Les cartes créées seront soumises à une validation admin avant d'être visibles publiquement.
            </p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-4">
            <Button
              variant="ghost"
              size="sm"
              @click="cancelCardCreation"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              @click="confirmCardCreation"
            >
              Confirmer et créer
            </Button>
          </div>
        </template>
      </Modal>
    </div>
  </template>
</template>
