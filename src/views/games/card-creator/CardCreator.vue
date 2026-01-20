<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {Button, Card} from '@/components/ui';
import Modal from '@/components/global/Modal.vue';
import CollectibleCard from './CollectibleCard.vue';
import BasicInfoPanel from './components/BasicInfoPanel.vue';
import AppearancePanel from './components/AppearancePanel.vue';
import TextsPanel from './components/TextsPanel.vue';
import AssetsPanel from './components/AssetsPanel.vue';
import EffectsPanel from './components/EffectsPanel.vue';
import useCardStore from '@/stores/cardStore';
import {useToastStore} from '@/stores/toastStore';
import {useCardCategoryStore} from '@/stores/cardCategoryStore';
import {useWindowSize} from "@vueuse/core";
import type {CardAsset, CardCategory} from "@/types/models";
import type {
  CustomText,
  PendingCardData,
} from '@/composables/useCardCustomization';
import {useRoute, useRouter} from 'vue-router';
import useAdminStore from '@/stores/adminStore';
import {useUserStore} from "@/stores/userStore.ts";
import { useCardForm } from '@/composables/useCardForm';

const cardStore = useCardStore();
const toastStore = useToastStore();
const categoryStore = useCardCategoryStore();
const adminStore = useAdminStore();
const user = useUserStore().user;
const route = useRoute();
const router = useRouter();

const {width} = useWindowSize();

// Modal state for card confirmation
const showConfirmationModal = ref(false);
const pendingCardData = ref<PendingCardData | null>(null);

// Use the new useCardForm composable for organized state management
const {
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
  fileInputRef,
  backgroundAssetImageInputRef,
  borderAssetImageInputRef,
  cardPreviewRef,
  savedCardsContainer,
  resetForm,
} = useCardForm();

// Use image processing composable
import { useImageProcessing } from '@/composables/useImageProcessing';
const { loadImageFromUrl } = useImageProcessing();
const { convertImageToBase64, handleImageUpload: handleImageUploadWrapper } = useImageProcessing();

// Use asset management composable
import { useCardAssetManagement } from '@/composables/useCardAssetManagement';
const assetManagement = useCardAssetManagement(
  backgroundAsset,
  borderAsset,
  assetSelection.assetCategory as any,
  backgroundAssetImageInputRef,
  borderAssetImageInputRef,
  assetSelection.selectedFrontAssetId as any,
  assetSelection.selectedBorderAssetId as any,
  assetSelection.useCustomFrontAsset as any,
  assetSelection.useCustomBorderAsset as any
);

// Use saved cards observer composable
import { useSavedCardsObserver } from '@/composables/useSavedCardsObserver';
useSavedCardsObserver(savedCardsContainer, cardStore);

// Import SavedCardsGallery component
import SavedCardsGallery from './components/SavedCardsGallery.vue';


// Image source selection
const imageSourceType = ref<'upload' | 'url' | 'discord' | 'cloudinary'>('cloudinary');
const imageUrlInput = ref('');
const selectedDiscordMemberId = ref<string>('');
const discordSearchQuery = ref('');
const selectedCloudinaryImage = ref<string>('');

// Mode édition admin quand on passe par /admin/cards/:cardId/edit
const adminEditCardId = computed(() => (route.params as any).cardId as string | undefined);
const isAdminEdit = computed(() => route.path.startsWith('/admin/cards/') && route.path.endsWith('/edit') && Boolean(adminEditCardId.value));

// Filtrage des assets et images
const showAllAssets = ref(false);
const showAllImages = ref(false);

// Helper to get current asset config based on category


// Tab completion status
const isTabComplete = computed(() => ({
  basics: basicInfo.title.trim().length > 0 && hasMainImage.value,
  appearance: true, // Always accessible
  texts: true, // Always accessible
  assets: true, // Always accessible
  effects: true // Always accessible
}));

const hasMainImage = computed(() => Boolean(basicInfo.imageBase64));

// Computed
const selectedFrontAsset = computed(() => {
  if (assetSelection.selectedFrontAssetId) {
    assetSelection.useCustomFrontAsset = false;
    return cardStore.getCardAssetById(assetSelection.selectedFrontAssetId);
  }

  if (assetSelection.useCustomFrontAsset) {
    if (backgroundAsset.type === 'solid' && assetManagement.isBackgroundAssetValid()) {
      return {
        type: 'solid' as const,
        category: 'background',
        solidColor: backgroundAsset.solidColor
      } as CardAsset;
    }
    if (backgroundAsset.type === 'gradient' && assetManagement.isBackgroundAssetValid()) {
      return {
        type: 'gradient' as const,
        color1: backgroundAsset.gradientColor1,
        color2: backgroundAsset.gradientColor2,
        angle: backgroundAsset.gradientAngle,
        category: 'background',
      } as CardAsset;
    }
    if (backgroundAsset.type === 'image' && assetManagement.isBackgroundAssetValid()) {
      return {
        type: 'image' as const,
        imageBase64: backgroundAsset.imageBase64,
        category: 'background',
      } as CardAsset;
    }
  }

  return undefined;
});

const selectedBorderAsset = computed(() => {
  if (assetSelection.selectedBorderAssetId) {
    assetSelection.useCustomBorderAsset = false;
    return cardStore.getCardAssetById(assetSelection.selectedBorderAssetId);
  }

  if (assetSelection.useCustomBorderAsset) {
    if (borderAsset.type === 'solid' && assetManagement.isBorderAssetValid()) {
      return {
        type: 'solid' as const,
        solidColor: borderAsset.solidColor,
        category: 'border',
      } as CardAsset;
    }
    if (borderAsset.type === 'image' && assetManagement.isBorderAssetValid()) {
      return {
        type: 'image' as const,
        imageBase64: borderAsset.imageBase64,
        category: 'border',
      } as CardAsset;
    }
  }

  return undefined;
});

const isFormValid = computed(() => {
  const hasTitle = basicInfo.title.trim().length > 0;
  return hasTitle && hasMainImage.value;
});

const isBackgroundAssetValid = computed(() => {
  if (backgroundAsset.type === 'solid') {
    return backgroundAsset.solidColor.trim().length > 0;
  }
  if (backgroundAsset.type === 'gradient') {
    return backgroundAsset.gradientColor1.trim().length > 0 && backgroundAsset.gradientColor2.trim().length > 0;
  }
  if (backgroundAsset.type === 'image') {
    return backgroundAsset.imageBase64.length > 0;
  }
  return false;
});

const isBorderAssetValid = computed(() => {
  if (borderAsset.type === 'solid') {
    return borderAsset.solidColor.trim().length > 0;
  }
  if (borderAsset.type === 'image') {
    return borderAsset.imageBase64.length > 0;
  }
  return false;
});

const selectedCategoryName = computed(() => {
  console.log(basicInfo.categoryId)
  if (!basicInfo.categoryId) return undefined;
  return categoryStore.categories.find(c => c.id === basicInfo.categoryId)?.name;
});

// Filtered assets - show only user's assets by default
const filteredBackgroundAssets = computed(() => {
  const assets = cardStore.getCardAssetsByCategory('background');
  if (showAllAssets.value) {
    return assets;
  }
  return assets.filter(asset => asset.createdBy?.id === user?.id);
});

const filteredBorderAssets = computed(() => {
  const assets = cardStore.getCardAssetsByCategory('border');
  if (showAllAssets.value) {
    return assets;
  }
  return assets.filter(asset => asset.createdBy?.id === user?.id);
});

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
      basicInfo.imageBase64 = base64Data.base64;
      basicInfo.imageUrl = `data:${base64Data.mimeType};base64,${base64Data.base64}`;

      const sizeInMB = file.size / 1024 / 1024;
      if (file.size > 3 * 1024 * 1024) {
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
  basicInfo.imageUrl = '';
  basicInfo.imageBase64 = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Custom text management
const addCustomText = () => {
  if (metadata.customTexts.length < 5) {
    metadata.customTexts.push({
      id: `text-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`, // Unique ID for proper key binding
      content: `Texte ${metadata.customTexts.length + 1}`,
      posX: 50,
      posY: 50 + (metadata.customTexts.length * 15),
      align: 'center',
      color: '#ffffff',
      width: 'w-full',
      fontSize: 14
    });
  }
};

const removeCustomText = (index: number) => {
  metadata.customTexts.splice(index, 1);
};

const updateCustomText = <K extends keyof CustomText>(
  index: number, 
  field: K, 
  value: CustomText[K]
) => {
  if (index >= 0 && index < metadata.customTexts.length) {
    const text = metadata.customTexts[index];
    if (text) {
      text[field] = value;
    }
  }
};

// Category management
const createNewCategory = async () => {
  if (!categoryModal.name.trim()) {
    toastStore.error('Le nom de la catégorie est requis');
    return;
  }

  const category = await categoryStore.createCategory(
    categoryModal.name,
    categoryModal.description
  );

  if (category) {
    basicInfo.categoryId = category.id;
    categoryModal.name = '';
    categoryModal.description = '';
    categoryModal.show = false;
    toastStore.success('Catégorie créée avec succès');
  }
};

// Toggle functions for showing all assets/images
const toggleShowAllAssets = async () => {
  showAllAssets.value = !showAllAssets.value;
  if (showAllAssets.value) {
    toastStore.info('Affichage de tous les assets');
  } else {
    toastStore.info('Affichage de vos assets uniquement');
  }
};

const toggleShowAllImages = async () => {
  showAllImages.value = !showAllImages.value;
  if (showAllImages.value) {
    await cardStore.fetchMainCardImages();
    toastStore.info('Affichage de toutes les images');
  } else {
    await cardStore.fetchUsedMainCardImages();
    toastStore.info('Affichage des images utilisées uniquement');
  }
};

// Observe saved cards when container is mounted or updated


const saveCard = async () => {
  if (!isFormValid.value) {
    toastStore.error('Veuillez remplir tous les champs requis.');
    return;
  }

  if (!hasMainImage.value) {
    toastStore.error('Veuillez ajouter une image principale.');
    return;
  }

  // Validate front asset uniquement si l'utilisateur veut en créer un
  let frontAssetData = null;
  if (!assetSelection.selectedFrontAssetId && assetSelection.useCustomFrontAsset) {
    frontAssetData = assetManagement.buildFrontAssetData();

    if (!frontAssetData) {
      toastStore.error('Veuillez configurer correctement le fond.');
      return;
    }
  }

  // Validate border asset only when user opted to use a custom one
  let borderAssetData = null;
  if (!assetSelection.selectedBorderAssetId && assetSelection.useCustomBorderAsset) {
    borderAssetData = assetManagement.buildBorderAssetData();

    if (!borderAssetData) {
      toastStore.error('Veuillez configurer correctement la bordure.');
      return;
    }
  }

  // Store card data for confirmation modal WITHOUT creating assets yet
  // For Discord avatars and Cloudinary images, use basicInfo.imageUrl directly instead of basicInfo.imageBase64
  const isDirectImageUrl = (imageSourceType.value === 'discord' && selectedDiscordMemberId.value) ||
                           (imageSourceType.value === 'cloudinary' && selectedCloudinaryImage.value);
  const member = imageSourceType.value === 'discord' && selectedDiscordMemberId.value
    ? cardStore.discordAvatars.find(m => m.id === selectedDiscordMemberId.value)
    : null;
  const cloudinaryImage = imageSourceType.value === 'cloudinary' && selectedCloudinaryImage.value
    ? cardStore.mainCardImages.find(img => img.publicId === selectedCloudinaryImage.value)
    : null;

  pendingCardData.value = {
    title: basicInfo.title,
    imageBase64: !isDirectImageUrl ? basicInfo.imageBase64 : '',
    imageUrl: member?.avatarUrl || cloudinaryImage?.secure_url || undefined,
    frontAssetId: assetSelection.selectedFrontAssetId,
    borderAssetId: assetSelection.selectedBorderAssetId,
    categoryId: basicInfo.categoryId,
    frontAssetData,
    borderAssetData,
    titlePosX: appearance.titlePosX,
    titlePosY: appearance.titlePosY,
    titleAlign: appearance.titleAlign,
    titleWidth: appearance.titleWidth,
    titleFontSize: appearance.titleFontSize,
    removeImageBg: effects.removeImageBg,
    holographicEffect: effects.holographicEffect,
    holographicIntensity: effects.holographicIntensity,
    titleColor: appearance.titleColor,
    imagePosX: imageSettings.posX,
    imagePosY: imageSettings.posY,
    imageScale: imageSettings.scale,
    imageWidth: imageSettings.width,
    imageHeight: imageSettings.height,
    imageObjectFit: imageSettings.objectFit,
    imageRounded: imageSettings.rounded,
    imageCropX: imageSettings.cropX,
    imageCropY: imageSettings.cropY,
    rarity: metadata.rarity,
    customTexts: metadata.customTexts
  };

  // Show confirmation modal
  showConfirmationModal.value = true;
};

const isSavingCard = ref(false);
// Confirm card creation from modal
const confirmCardCreation = async () => {
  isSavingCard.value = true;
  if (!pendingCardData.value) {
    toastStore.error('Données de carte manquantes.');
    isSavingCard.value = false;
    showConfirmationModal.value = false;
    return;
  }

  try {
    // Determine if we're using a new or existing front asset
    let finalFrontAssetId = pendingCardData.value.frontAssetId;

    // If no existing asset is selected, create the new one NOW
    if (!finalFrontAssetId && pendingCardData.value.frontAssetData) {
      const newAsset = await cardStore.createCardAsset(pendingCardData.value.frontAssetData);
      if (!newAsset) {
        toastStore.error('Erreur lors de la création du fond.');
        isSavingCard.value = false;
        showConfirmationModal.value = false;
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

    if (isAdminEdit.value) {
      const cardId = adminEditCardId.value;
      if (!cardId) return;

      const updatedCard = await adminStore.updateCard(cardId, {
        title: pendingCardData.value.basicInfo.title,
        imageBase64: pendingCardData.value.basicInfo.imageBase64,
        imageUrl: pendingCardData.value.basicInfo.imageUrl,  // For Discord avatars
        frontAssetId: finalFrontAssetId,
        borderAssetId: finalBorderAssetId,
        categoryId: pendingCardData.value.categoryId,
        titlePosX: pendingCardData.value.titlePosX,
        titlePosY: pendingCardData.value.titlePosY,
        titleAlign: pendingCardData.value.titleAlign,
        titleWidth: pendingCardData.value.titleWidth,
        titleFontSize: pendingCardData.value.titleFontSize,
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
        imageRounded: pendingCardData.value.imageRounded,
        imageCropX: pendingCardData.value.imageCropX,
        imageCropY: pendingCardData.value.imageCropY,
        rarity: pendingCardData.value.rarity,
        customTexts: pendingCardData.value.customTexts,
      });

      if (updatedCard) {
        toastStore.success('Carte mise à jour avec succès.');
        showConfirmationModal.value = false;
        isSavingCard.value = false;
        pendingCardData.value = null;
        await adminStore.fetchCards();
        await router.push('/admin/cards');
      }

      return;
    }

    // Create the card with the asset IDs
    const card = await cardStore.createCard({
      title: pendingCardData.value.basicInfo.title,
      imageBase64: pendingCardData.value.basicInfo.imageBase64,
      imageUrl: pendingCardData.value.basicInfo.imageUrl,  // For Discord avatars
      frontAssetId: finalFrontAssetId,
      borderAssetId: finalBorderAssetId,
      categoryId: pendingCardData.value.categoryId,
      titlePosX: pendingCardData.value.titlePosX,
      titlePosY: pendingCardData.value.titlePosY,
      titleAlign: pendingCardData.value.titleAlign,
      titleWidth: pendingCardData.value.titleWidth,
      titleFontSize: pendingCardData.value.titleFontSize,
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
      imageRounded: pendingCardData.value.imageRounded,
      imageCropX: pendingCardData.value.imageCropX,
      imageCropY: pendingCardData.value.imageCropY,
      rarity: pendingCardData.value.rarity,
      customTexts: pendingCardData.value.customTexts
    });

    if (card) {
      toastStore.success('Carte créée avec succès ! En attente de validation admin.');

      // Reset form
      basicInfo.title = '';
      basicInfo.imageUrl = '';
      basicInfo.imageBase64 = '';
      assetSelection.selectedFrontAssetId = undefined;
      assetSelection.selectedBorderAssetId = undefined;
      assetSelection.useCustomFrontAsset = false;
      assetSelection.useCustomBorderAsset = false;

      // Reset personnalisation
      appearance.titlePosX = 50;
      appearance.titlePosY = 10;
      appearance.titleAlign = 'center';
      appearance.titleWidth = 'w-full';
      appearance.titleFontSize = 18;
      effects.removeImageBg = false;
      effects.holographicEffect = true;
      effects.holographicIntensity = 0.6;
      appearance.titleColor = '#ffffff';
      imageSettings.posX = 50;
      imageSettings.posY = 30;
      imageSettings.scale = 1;
      imageSettings.width = 160;
      imageSettings.height = 160;
      imageSettings.objectFit = 'cover';
      metadata.rarity = 'common';
      metadata.customTexts = [];

      // Reset background asset
      backgroundAsset.name = '';
      backgroundAsset.type = 'solid';
      backgroundAsset.solidColor = 'transparent';
      backgroundAsset.gradientColor1 = '#667eea';
      backgroundAsset.gradientColor2 = '#764ba2';
      backgroundAsset.gradientAngle = 135;
      backgroundAsset.imageBase64 = '';
      backgroundAsset.imagePreview = '';

      // Reset border asset
      borderAsset.name = '';
      borderAsset.type = 'solid';
      borderAsset.solidColor = 'transparent';
      borderAsset.imageBase64 = '';
      borderAsset.imagePreview = '';

      // Close modal and reset
      showConfirmationModal.value = false;
      pendingCardData.value = null;

      isSavingCard.value = false;
      showConfirmationModal.value = false;

      // Fetch updated cards
      await cardStore.fetchCardsPreviews();
    }
  } catch (error) {
    toastStore.error(isAdminEdit.value ? 'Erreur lors de la mise à jour de la carte.' : 'Erreur lors de la création de la carte.');
    isSavingCard.value = false;
    showConfirmationModal.value = false;
  }
};

// Cancel card creation from modal
const cancelCardCreation = () => {
  showConfirmationModal.value = false;
  pendingCardData.value = null;
};

onMounted(async () => {
  await cardStore.fetchCardAssets();
  await cardStore.fetchCardsPreviews();
  await cardStore.fetchDiscordAvatars();
  await cardStore.fetchUsedMainCardImages(); // Charger uniquement les images utilisées par défaut
  await categoryStore.fetchCategories();

  if (isAdminEdit.value) {
    const cardId = adminEditCardId.value;
    if (!cardId) return;

    // On préfère utiliser la liste admin (qui comprend tous les status)
    if (!adminStore.cards.length) {
      await adminStore.fetchCards();
    }

    const card = adminStore.cards.find(c => c.id === cardId);
    if (!card) {
      toastStore.error('Carte introuvable.');
      await router.push('/admin/cards');
      return;
    }

    if (card.basicInfo.imageUrl) {
      const base64Data = await loadImageFromUrl(card.basicInfo.imageUrl);
      if (base64Data) {
        basicInfo.imageBase64 = base64Data.base64;
      }
    }

    // Pré-remplissage du form
    basicInfo.title = card.basicInfo.title ?? '';
    basicInfo.imageUrl = card.basicInfo.imageUrl ?? '';
    assetSelection.selectedFrontAssetId = card.frontAssetId;
    assetSelection.selectedBorderAssetId = card.borderAssetId;
    basicInfo.categoryId = card.categoryId;

    appearance.titlePosX = card.titlePosX ?? 50;
    appearance.titlePosY = card.titlePosY ?? 10;
    appearance.titleAlign = (card.titleAlign as any) ?? 'center';
    appearance.titleWidth = (card.titleWidth as any) ?? 'w-full';
    appearance.titleFontSize = card.titleFontSize ?? 18;

    effects.removeImageBg = Boolean(card.removeImageBg);
    effects.holographicEffect = card.holographicEffect ?? true;
    effects.holographicIntensity = card.holographicIntensity ?? 0.6;

    appearance.titleColor = card.titleColor ?? '#ffffff';

    imageSettings.posX = card.imagePosX ?? 50;
    imageSettings.posY = card.imagePosY ?? 30;
    imageSettings.scale = card.imageScale ?? 1;
    imageSettings.width = card.imageWidth ?? 160;
    imageSettings.height = card.imageHeight ?? 160;
    imageSettings.objectFit = (card.imageObjectFit as any) ?? 'cover';

    metadata.rarity = (card.rarity as any) ?? 'common';
    metadata.customTexts = (card.customTexts as any) ?? [];

    // En mode edit, on veut éviter de montrer du state "création" résiduel
    showConfirmationModal.value = false;
    pendingCardData.value = null;
  }
});

// Watchers
watch(imageUrlInput, async (newUrl) => {
  if (imageSourceType.value === 'url' && newUrl.trim()) {
    const base64Data = await loadImageFromUrl(newUrl.trim());
    if (base64Data) {
      basicInfo.imageBase64 = base64Data.base64;
      basicInfo.imageUrl = '';
    }
  }
});

watch(selectedDiscordMemberId, async (newMemberId) => {
  if (imageSourceType.value === 'discord' && newMemberId) {
    const member = cardStore.discordAvatars.find(m => m.id === newMemberId);
    if (member) {
      // For Discord avatars, use URL directly - no base64 conversion
      basicInfo.imageUrl = member.avatarUrl;
      basicInfo.imageBase64 = ''; // Clear base64 so backend knows to use basicInfo.imageUrl

      // Load for preview only
      const base64Data = await loadImageFromUrl(member.avatarUrl);
      if (base64Data) {
        basicInfo.imageBase64 = base64Data.base64; // Only for preview
      }
      toastStore.success(`Avatar de ${member.username} sélectionné`);
    }
  }
});

watch(imageSourceType, (newType) => {
  if (newType === 'upload') {
    // Clear URL and Discord selection when uploading new image
    imageUrlInput.value = '';
    selectedDiscordMemberId.value = '';
    discordSearchQuery.value = '';
    selectedCloudinaryImage.value = '';
  } else if (newType === 'url') {
    // Clear file input and Discord selection when using URL
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    selectedDiscordMemberId.value = '';
    discordSearchQuery.value = '';
    selectedCloudinaryImage.value = '';
  } else if (newType === 'discord') {
    // Clear file input and URL when using Discord avatar
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    imageUrlInput.value = '';
    selectedCloudinaryImage.value = '';
  } else if (newType === 'cloudinary') {
    // Load Cloudinary images when switching to Cloudinary source
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    imageUrlInput.value = '';
    selectedDiscordMemberId.value = '';
    discordSearchQuery.value = '';
    selectedCloudinaryImage.value = '';
    if (cardStore.mainCardImages.length === 0) {
      cardStore.fetchUsedMainCardImages(); // Charger uniquement les images utilisées
    }
  }
});

watch(selectedCloudinaryImage, async (newImageId) => {
  if (imageSourceType.value === 'cloudinary' && newImageId) {
    const image = cardStore.mainCardImages.find(img => img.publicId === newImageId);
    if (image) {
      // For Cloudinary images, use URL directly - no base64 conversion
      basicInfo.imageUrl = image.secure_url;
      basicInfo.imageBase64 = ''; // Clear base64 so backend knows to use basicInfo.imageUrl

      // Load for preview only
      const base64Data = await loadImageFromUrl(image.secure_url);
      if (base64Data) {
        basicInfo.imageBase64 = base64Data.base64; // Only for preview
      }
      toastStore.success('Image sélectionnée');
    }
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
              <div ref="cardPreviewRef">
                <CollectibleCard
                  :card="{
                    id: 'preview',
                    title: basicInfo.title,
                    imageBase64: basicInfo.imageBase64,
                    frontAsset: selectedFrontAsset,
                    borderAsset: selectedBorderAsset,
                    titlePosX: appearance.titlePosX,
                    titlePosY: appearance.titlePosY,
                    titleAlign: appearance.titleAlign,
                    titleWidth: appearance.titleWidth,
                    titleFontSize: appearance.titleFontSize,
                    removeImageBg: effects.removeImageBg,
                    holographicEffect: effects.holographicEffect,
                    holographicIntensity: effects.holographicIntensity,
                    titleColor: appearance.titleColor,
                    imagePosX: imageSettings.posX,
                    imagePosY: imageSettings.posY,
                    imageScale: imageSettings.scale,
                    imageWidth: imageSettings.width,
                    imageHeight: imageSettings.height,
                    imageObjectFit: imageSettings.objectFit,
                    imageRounded: imageSettings.rounded,
                    imageCropX: imageSettings.cropX,
                    imageCropY: imageSettings.cropY,
                    rarity: metadata.rarity,
                    customTexts: metadata.customTexts,
                    category: basicInfo.categoryId ? {
                      id: basicInfo.categoryId,
                      name: selectedCategoryName
                    } as CardCategory : undefined,
                    createdAt: '',
                    updatedAt: ''
                  }"
                  :interactive="true"
                />
              </div>
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

            <!-- Tabs Navigation -->
            <div class="flex gap-2 border-b border-white/10 pb-4">
              <button
                :class="[
                  'px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 relative',
                  ui.activeTab === 'basics'
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-ink-700/50 text-foam-300 hover:bg-ink-600'
                ]"
                @click="ui.activeTab = 'basics'"
              >
                <span class="flex items-center gap-2">
                  🎯 Essentiel
                  <span v-if="isTabComplete.basics" class="text-green-400">✓</span>
                </span>
              </button>
              <button
                :class="[
                  'px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200',
                  ui.activeTab === 'appearance'
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-ink-700/50 text-foam-300 hover:bg-ink-600'
                ]"
                @click="ui.activeTab = 'appearance'"
              >
                🎨 Apparence
              </button>
              <button
                :class="[
                  'px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200',
                  ui.activeTab === 'texts'
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-ink-700/50 text-foam-300 hover:bg-ink-600'
                ]"
                @click="ui.activeTab = 'texts'"
              >
                📝 Textes
              </button>
              <button
                :class="[
                  'px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200',
                  ui.activeTab === 'assets'
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-ink-700/50 text-foam-300 hover:bg-ink-600'
                ]"
                @click="ui.activeTab = 'assets'"
              >
                🖼️ Fond & Bordures
              </button>
              <button
                :class="[
                  'px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200',
                  ui.activeTab === 'effects'
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-ink-700/50 text-foam-300 hover:bg-ink-600'
                ]"
                @click="ui.activeTab = 'effects'"
              >
                ✨ Effets
              </button>
            </div>

            <!-- Tab Content -->
            <div class="space-y-6 min-h-[500px]">
              <!-- TAB 1: ESSENTIEL -->
              <div v-show="ui.activeTab === 'basics'">
                <!-- Hidden file input (needs to be in parent for ref access) -->
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageUpload"
                />

                <!-- Hidden asset file inputs -->
                <input
                  ref="backgroundAssetImageInputRef"
                  type="file"
                  accept="image/png,image/gif"
                  class="hidden"
                  @change="assetManagement.handleAssetImageUpload"
                />
                <input
                  ref="borderAssetImageInputRef"
                  type="file"
                  accept="image/png,image/gif"
                  class="hidden"
                  @change="assetManagement.handleAssetImageUpload"
                />
                
                <BasicInfoPanel
                  :basicInfo.title="basicInfo.title"
                  @update:basicInfo.title="basicInfo.title = $event"
                  :category-id="basicInfo.categoryId"
                  @update:category-id="basicInfo.categoryId = $event"
                  :rarity="rarity"
                  @update:rarity="rarity = $event"
                  :has-main-image="hasMainImage"
                  :image-source-type="imageSourceType"
                  @update:image-source-type="imageSourceType = $event"
                  :image-url-input="imageUrlInput"
                  @update:image-url-input="imageUrlInput = $event"
                  :discord-search-query="discordSearchQuery"
                  @update:discord-search-query="discordSearchQuery = $event"
                  :selected-discord-member-id="selectedDiscordMemberId"
                  @update:selected-discord-member-id="selectedDiscordMemberId = $event"
                  :selected-cloudinary-image="selectedCloudinaryImage"
                  @update:selected-cloudinary-image="selectedCloudinaryImage = $event"
                  :show-all-images="showAllImages"
                  :categories="categoryStore.categories"
                  :discord-members="cardStore.discordAvatars"
                  :cloudinary-images="cardStore.mainCardImages"
                  :is-loading-images="cardStore.loading"
                  @show-create-category-modal="categoryModal.show = true"
                  @trigger-file-input="triggerFileInput"
                  @remove-image="removeImage"
                  @load-image-from-url="async (url) => {
                    if (!url.trim()) {
                      toastStore.error('Veuillez entrer une URL valide.');
                      return;
                    }
                    const base64Data = await loadImageFromUrl(url.trim());
                    if (base64Data) {
                      basicInfo.imageBase64 = base64Data.base64;
                    }
                  }"
                  @toggle-show-all-images="toggleShowAllImages"
                  @refresh-images="showAllImages ? cardStore.fetchMainCardImages() : cardStore.fetchUsedMainCardImages()"
                />
              </div>

              <!-- TAB 2: APPARENCE -->
              <div v-show="ui.activeTab === 'appearance'">
                <AppearancePanel
                  :basicInfo.title-color="titleColor"
                  @update:basicInfo.title-color="titleColor = $event"
                  :basicInfo.title-font-size="titleFontSize"
                  @update:basicInfo.title-font-size="titleFontSize = $event"
                  :basicInfo.title-pos-x="titlePosX"
                  @update:basicInfo.title-pos-x="titlePosX = $event"
                  :basicInfo.title-pos-y="titlePosY"
                  @update:basicInfo.title-pos-y="titlePosY = $event"
                  :basicInfo.title-align="titleAlign"
                  @update:basicInfo.title-align="titleAlign = $event"
                  :basicInfo.title-width="titleWidth"
                  @update:basicInfo.title-width="titleWidth = $event"
                  :image-pos-x="imagePosX"
                  @update:image-pos-x="imagePosX = $event"
                  :image-pos-y="imagePosY"
                  @update:image-pos-y="imagePosY = $event"
                  :image-scale="imageScale"
                  @update:image-scale="imageScale = $event"
                  :image-width="imageWidth"
                  @update:image-width="imageWidth = $event"
                  :image-height="imageHeight"
                  @update:image-height="imageHeight = $event"
                  :image-object-fit="imageObjectFit"
                  @update:image-object-fit="imageObjectFit = $event"
                  :image-rounded="imageRounded"
                  @update:image-rounded="imageRounded = $event"
                  :image-crop-x="imageCropX"
                  @update:image-crop-x="imageCropX = $event"
                  :image-crop-y="imageCropY"
                  @update:image-crop-y="imageCropY = $event"
                />
              </div>

              <!-- TAB 3: TEXTES -->
              <div v-show="ui.activeTab === 'texts'">
                <TextsPanel
                  :custom-texts="customTexts"
                  @add-text="addCustomText"
                  @remove-text="removeCustomText"
                  @update-text="updateCustomText"
                />
              </div>

              <!-- TAB 4: FOND & BORDURES -->
              <div v-show="ui.activeTab === 'assets'">
                <AssetsPanel
                  :asset-category="assetCategory"
                  @update:asset-category="assetCategory = $event"
                  :background-asset-name="backgroundAsset.name"
                  @update:background-asset-name="backgroundAsset.name = $event"
                  :background-asset-type="backgroundAsset.type"
                  @update:background-asset-type="backgroundAsset.type = $event"
                  :background-solid-color="backgroundAsset.solidColor"
                  @update:background-solid-color="backgroundAsset.solidColor = $event"
                  :background-gradient-color1="backgroundAsset.gradientColor1"
                  @update:background-gradient-color1="backgroundAsset.gradientColor1 = $event"
                  :background-gradient-color2="backgroundAsset.gradientColor2"
                  @update:background-gradient-color2="backgroundAsset.gradientColor2 = $event"
                  :background-gradient-angle="backgroundAsset.gradientAngle"
                  @update:background-gradient-angle="backgroundAsset.gradientAngle = $event"
                  :background-asset-image-preview="backgroundAsset.imagePreview"
                  :border-asset-name="borderAsset.name"
                  @update:border-asset-name="borderAsset.name = $event"
                  :border-asset-type="borderAsset.type"
                  @update:border-asset-type="borderAsset.type = $event"
                  :border-solid-color="borderAsset.solidColor"
                  @update:border-solid-color="borderAsset.solidColor = $event"
                  :border-asset-image-preview="borderAsset.imagePreview"
                  :selected-front-asset-id="assetSelection.selectedFrontAssetId"
                  @update:selected-front-asset-id="assetSelection.selectedFrontAssetId = $event"
                  :selected-border-asset-id="assetSelection.selectedBorderAssetId"
                  @update:selected-border-asset-id="assetSelection.selectedBorderAssetId = $event"
                  @update:use-custom-front-asset="assetSelection.useCustomFrontAsset = $event"
                  @update:use-custom-border-asset="assetSelection.useCustomBorderAsset = $event"
                  :is-background-asset-valid="isBackgroundAssetValid"
                  :is-border-asset-valid="isBorderAssetValid"
                  :filtered-background-assets="filteredBackgroundAssets"
                  :filtered-border-assets="filteredBorderAssets"
                  :show-all-assets="showAllAssets"
                  :user-id="user?.id"
                  @trigger-asset-image-input="assetManagement.triggerAssetImageInput"
                  @remove-asset-image="assetManagement.removeAssetImage"
                  @apply-current-asset="assetManagement.applyCurrentAsset"
                  @delete-asset="cardStore.deleteAsset"
                  @toggle-show-all-assets="toggleShowAllAssets"
                />
              </div>

              <!-- TAB 5: EFFETS -->
              <div v-show="ui.activeTab === 'effects'">
                <EffectsPanel
                  :effects="effects"
                />
              </div>
            </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-6 border-t border-white/10 mt-6">
            <Button
              variant="primary"
              :disabled="!isFormValid || cardStore.loading"
              :loading="cardStore.loading"
              @click="saveCard"
              class="flex-1"
            >
              <span class="flex items-center gap-2">
                {{ isFormValid ? '💾 Sauvegarder la carte' : '⚠️ Compléter les champs requis' }}
              </span>
            </Button>
            <Button
              variant="ghost"
              @click="resetForm"
            >
              🔄 Réinitialiser
            </Button>
          </div>
          </Card>
        </div>
      </div>

      <!-- Saved Cards Section -->
      <SavedCardsGallery 
        :card-store="cardStore"
        :saved-cards-container="savedCardsContainer"
      />

      <!-- Confirmation Modal -->
      <Modal :is-open="showConfirmationModal" @close="cancelCardCreation" class="!max-w-3xl">
        <template #header>
          <h2 class="text-lg font-semibold text-center">Confirmer la création de la carte</h2>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-center text-foam-300/80">
            Vous allez {{ isAdminEdit ? 'mettre à jour' : 'créer' }} une nouvelle carte avec les paramètres suivants :
          </p>

          <div class="flex justify-center">
            <CollectibleCard
              v-if="pendingCardData"
              :card="{
                id: 'preview',
                title: pendingCardData.basicInfo.title,
                imageBase64: pendingCardData.basicInfo.imageBase64,
                imageUrl: pendingCardData.basicInfo.imageUrl,
                frontAsset: pendingCardData.frontAssetData ?? (pendingCardData.frontAssetId ? cardStore.getCardAssetById(pendingCardData.frontAssetId) : undefined),
                borderAsset: pendingCardData.borderAssetData ?? (pendingCardData.borderAssetId ? cardStore.getCardAssetById(pendingCardData.borderAssetId) : undefined),
                titlePosX: pendingCardData.titlePosX,
                titlePosY: pendingCardData.titlePosY,
                titleAlign: pendingCardData.titleAlign,
                titleWidth: pendingCardData.titleWidth,
                titleFontSize: pendingCardData.titleFontSize,
                removeImageBg: pendingCardData.removeImageBg,
                holographicEffect: pendingCardData.holographicEffect,
                holographicIntensity: pendingCardData.holographicIntensity,
                titleColor: pendingCardData.titleColor,
                imagePosX: pendingCardData.imagePosX,
                imagePosY: pendingCardData.imagePosY,
                imageScale: pendingCardData.imageScale,
                imageWidth: pendingCardData.imageWidth,
                imageHeight: pendingCardData.imageHeight,
                imageObjectFit: pendingCardData.imageObjectFit,
                imageRounded: pendingCardData.imageRounded,
                imageCropX: pendingCardData.imageCropX,
                imageCropY: pendingCardData.imageCropY,
                rarity: pendingCardData.rarity,
                customTexts: pendingCardData.customTexts,
                createdAt: '',
                updatedAt: ''
              }"
              :interactive="false"
            />
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
              :loading="isSavingCard"
              :disabled="isSavingCard"
            >
              Confirmer et créer
            </Button>
          </div>
        </template>
      </Modal>

      <!-- Create Category Modal -->
      <Modal :is-open="categoryModal.show" @close="categoryModal.show = false" class="!max-w-md">
        <template #header>
          <h2 class="text-lg font-semibold">Créer une nouvelle catégorie</h2>
        </template>

        <div class="space-y-4">
          <!-- Category Name -->
          <div class="space-y-2">
            <label class="form-label text-sm">Nom de la catégorie *</label>
            <input
              v-model="categoryModal.name"
              type="text"
              placeholder="Entrez le nom de la catégorie"
              class="form-input w-full"
              @keyup.enter="createNewCategory"
            />
          </div>

          <!-- Category Description -->
          <div class="space-y-2">
            <label class="form-label text-sm">Description (optionnel)</label>
            <textarea
              v-model="categoryModal.description"
              placeholder="Entrez une description..."
              rows="3"
              class="form-input resize-none w-full"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-4">
            <Button
              variant="ghost"
              size="sm"
              @click="categoryModal.show = false"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              @click="createNewCategory"
              :disabled="!categoryModal.name.trim()"
              :loading="categoryStore.loading"
            >
              Créer
            </Button>
          </div>
        </template>
      </Modal>
    </div>
  </template>
</template>

<style scoped>
/* Animation de fade-in pour les onglets */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* Amélioration du style des sliders */
input[type="range"] {
  height: 0.5rem;
  background-color: #1e293b;
  border-radius: 0.5rem;
  appearance: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  background-color: #8b5cf6;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background-color: #a78bfa;
}

input[type="range"]::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  background-color: #8b5cf6;
  border-radius: 9999px;
  cursor: pointer;
  border: 0;
  transition: background-color 0.2s;
}

input[type="range"]::-moz-range-thumb:hover {
  background-color: #a78bfa;
}

/* Style amélioré pour les checkboxes */
input[type="checkbox"] {
  accent-color: #8b5cf6;
}

/* Smooth scrolling pour les contenus longs */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.3) rgba(255, 255, 255, 0.05);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}
</style>

