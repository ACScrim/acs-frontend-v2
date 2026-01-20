<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import {Button, Card} from '@/components/ui';
import Modal from '@/components/global/Modal.vue';
import CollectibleCard from './CollectibleCard.vue';
import BasicInfoPanel from './components/BasicInfoPanel.vue';
import AppearancePanel from './components/AppearancePanel.vue';
import useCardStore from '@/stores/cardStore';
import {useToastStore} from '@/stores/toastStore';
import {useCardCategoryStore} from '@/stores/cardCategoryStore';
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import {useIntersectionObserver, useWindowSize} from "@vueuse/core";
import type {CardAsset, CardCategory} from "@/types/models";
import type {
  CustomText,
  PendingCardData,
} from '@/composables/useCardCustomization';
import type {AssetType} from '@/composables/useCardAssets';
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

// Destructure for easier access in template (backward compatibility)
const title = computed({
  get: () => basicInfo.title,
  set: (value) => basicInfo.title = value
});
const imageUrl = computed({
  get: () => basicInfo.imageUrl,
  set: (value) => basicInfo.imageUrl = value
});
const imageBase64 = computed({
  get: () => basicInfo.imageBase64,
  set: (value) => basicInfo.imageBase64 = value
});
const selectedCategoryId = computed({
  get: () => basicInfo.categoryId,
  set: (value) => basicInfo.categoryId = value
});

const titlePosX = computed({
  get: () => appearance.titlePosX,
  set: (value) => appearance.titlePosX = value
});
const titlePosY = computed({
  get: () => appearance.titlePosY,
  set: (value) => appearance.titlePosY = value
});
const titleAlign = computed({
  get: () => appearance.titleAlign,
  set: (value) => appearance.titleAlign = value
});
const titleWidth = computed({
  get: () => appearance.titleWidth,
  set: (value) => appearance.titleWidth = value
});
const titleColor = computed({
  get: () => appearance.titleColor,
  set: (value) => appearance.titleColor = value
});
const titleFontSize = computed({
  get: () => appearance.titleFontSize,
  set: (value) => appearance.titleFontSize = value
});

const imagePosX = computed({
  get: () => imageSettings.posX,
  set: (value) => imageSettings.posX = value
});
const imagePosY = computed({
  get: () => imageSettings.posY,
  set: (value) => imageSettings.posY = value
});
const imageScale = computed({
  get: () => imageSettings.scale,
  set: (value) => imageSettings.scale = value
});
const imageWidth = computed({
  get: () => imageSettings.width,
  set: (value) => imageSettings.width = value
});
const imageHeight = computed({
  get: () => imageSettings.height,
  set: (value) => imageSettings.height = value
});
const imageObjectFit = computed({
  get: () => imageSettings.objectFit,
  set: (value) => imageSettings.objectFit = value
});
const imageRounded = computed({
  get: () => imageSettings.rounded,
  set: (value) => imageSettings.rounded = value
});
const imageCropX = computed({
  get: () => imageSettings.cropX,
  set: (value) => imageSettings.cropX = value
});
const imageCropY = computed({
  get: () => imageSettings.cropY,
  set: (value) => imageSettings.cropY = value
});

const removeImageBg = computed({
  get: () => effects.removeImageBg,
  set: (value) => effects.removeImageBg = value
});
const holographicEffect = computed({
  get: () => effects.holographicEffect,
  set: (value) => effects.holographicEffect = value
});
const holographicIntensity = computed({
  get: () => effects.holographicIntensity,
  set: (value) => effects.holographicIntensity = value
});

const rarity = computed({
  get: () => metadata.rarity,
  set: (value) => metadata.rarity = value
});
const customTexts = computed({
  get: () => metadata.customTexts,
  set: (value) => metadata.customTexts = value
});

const assetCategory = computed({
  get: () => assetSelection.assetCategory,
  set: (value) => assetSelection.assetCategory = value
});
const selectedFrontAssetId = computed({
  get: () => assetSelection.selectedFrontAssetId,
  set: (value) => assetSelection.selectedFrontAssetId = value
});
const selectedBorderAssetId = computed({
  get: () => assetSelection.selectedBorderAssetId,
  set: (value) => assetSelection.selectedBorderAssetId = value
});
const useCustomFrontAsset = computed({
  get: () => assetSelection.useCustomFrontAsset,
  set: (value) => assetSelection.useCustomFrontAsset = value
});
const useCustomBorderAsset = computed({
  get: () => assetSelection.useCustomBorderAsset,
  set: (value) => assetSelection.useCustomBorderAsset = value
});

const backgroundAssetName = computed({
  get: () => backgroundAsset.name,
  set: (value) => backgroundAsset.name = value
});
const backgroundAssetType = computed({
  get: () => backgroundAsset.type,
  set: (value) => backgroundAsset.type = value
});
const backgroundSolidColor = computed({
  get: () => backgroundAsset.solidColor,
  set: (value) => backgroundAsset.solidColor = value
});
const backgroundGradientColor1 = computed({
  get: () => backgroundAsset.gradientColor1,
  set: (value) => backgroundAsset.gradientColor1 = value
});
const backgroundGradientColor2 = computed({
  get: () => backgroundAsset.gradientColor2,
  set: (value) => backgroundAsset.gradientColor2 = value
});
const backgroundGradientAngle = computed({
  get: () => backgroundAsset.gradientAngle,
  set: (value) => backgroundAsset.gradientAngle = value
});
const backgroundAssetImageBase64 = computed({
  get: () => backgroundAsset.imageBase64,
  set: (value) => backgroundAsset.imageBase64 = value
});
const backgroundAssetImagePreview = computed({
  get: () => backgroundAsset.imagePreview,
  set: (value) => backgroundAsset.imagePreview = value
});

const borderAssetName = computed({
  get: () => borderAsset.name,
  set: (value) => borderAsset.name = value
});
const borderAssetType = computed({
  get: () => borderAsset.type,
  set: (value) => borderAsset.type = value
});
const borderSolidColor = computed({
  get: () => borderAsset.solidColor,
  set: (value) => borderAsset.solidColor = value
});
const borderAssetImageBase64 = computed({
  get: () => borderAsset.imageBase64,
  set: (value) => borderAsset.imageBase64 = value
});
const borderAssetImagePreview = computed({
  get: () => borderAsset.imagePreview,
  set: (value) => borderAsset.imagePreview = value
});

const showCreateCategoryModal = computed({
  get: () => categoryModal.show,
  set: (value) => categoryModal.show = value
});
const newCategoryName = computed({
  get: () => categoryModal.name,
  set: (value) => categoryModal.name = value
});
const newCategoryDescription = computed({
  get: () => categoryModal.description,
  set: (value) => categoryModal.description = value
});

const activeTab = computed({
  get: () => ui.activeTab,
  set: (value) => ui.activeTab = value
});

// Container ref for saved cards section
const activeTimeouts = new Set<number>();

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
    backgroundAssetImagePreview.value = preview;
  } else {
    borderAssetImageBase64.value = base64;
    borderAssetImagePreview.value = preview;
  }
};

const clearCurrentImageData = () => {
  if (assetCategory.value === 'background') {
    backgroundAssetImageBase64.value = '';
    backgroundAssetImagePreview.value = '';
  } else {
    borderAssetImageBase64.value = '';
    borderAssetImagePreview.value = '';
  }
};

// Génère un nom explicite lorsqu’un asset n’a pas été renseigné
const generateAssetName = (category: 'background' | 'border') => {
  const prefix = category === 'background' ? 'Fond personnalisé' : 'Bordure personnalisée';
  const timestamp = new Date().toLocaleString('fr-FR', {hour12: false});
  return `${prefix} ${timestamp}`;
};

const ensureAssetName = (category: 'background' | 'border') => {
  const target = category === 'background' ? backgroundAssetName : borderAssetName;
  if (!target.value.trim()) {
    target.value = generateAssetName(category);
  }
  return target.value;
};

// Tab completion status
const isTabComplete = computed(() => ({
  basics: title.value.trim().length > 0 && hasMainImage.value,
  appearance: true, // Always accessible
  texts: true, // Always accessible
  assets: true, // Always accessible
  effects: true // Always accessible
}));

const hasMainImage = computed(() => Boolean(imageBase64.value));

// Computed
const selectedFrontAsset = computed(() => {
  if (selectedFrontAssetId.value) {
    useCustomFrontAsset.value = false;
    return cardStore.getCardAssetById(selectedFrontAssetId.value);
  }

  if (useCustomFrontAsset.value) {
    if (backgroundAssetType.value === 'solid' && isBackgroundAssetValid.value) {
      return {
        type: 'solid' as const,
        category: 'background',
        solidColor: backgroundSolidColor.value
      } as CardAsset;
    }
    if (backgroundAssetType.value === 'gradient' && isBackgroundAssetValid.value) {
      return {
        type: 'gradient' as const,
        color1: backgroundGradientColor1.value,
        color2: backgroundGradientColor2.value,
        angle: backgroundGradientAngle.value,
        category: 'background',
      } as CardAsset;
    }
    if (backgroundAssetType.value === 'image' && isBackgroundAssetValid.value) {
      return {
        type: 'image' as const,
        imageBase64: backgroundAssetImageBase64.value,
        category: 'background',
      } as CardAsset;
    }
  }

  return undefined;
});

const selectedBorderAsset = computed(() => {
  if (selectedBorderAssetId.value) {
    useCustomBorderAsset.value = false;
    return cardStore.getCardAssetById(selectedBorderAssetId.value);
  }

  if (useCustomBorderAsset.value) {
    if (borderAssetType.value === 'solid' && isBorderAssetValid.value) {
      return {
        type: 'solid' as const,
        solidColor: borderSolidColor.value,
        category: 'border',
      } as CardAsset;
    }
    if (borderAssetType.value === 'image' && isBorderAssetValid.value) {
      return {
        type: 'image' as const,
        imageBase64: borderAssetImageBase64.value,
        category: 'border',
      } as CardAsset;
    }
  }

  return undefined;
});

const isFormValid = computed(() => {
  const hasTitle = title.value.trim().length > 0;
  return hasTitle && hasMainImage.value;
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

const selectedCategoryName = computed(() => {
  console.log(selectedCategoryId)
  if (!selectedCategoryId.value) return undefined;
  return categoryStore.categories.find(c => c.id === selectedCategoryId.value)?.name;
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

    // Validate file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      toastStore.error('L\'image ne doit pas dépasser 3MB.');
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

const applyCurrentAsset = () => {
  if (assetCategory.value === 'background') {
    if (!isBackgroundAssetValid.value) {
      toastStore.error('Veuillez configurer correctement le fond avant de l\'utiliser.');
      return;
    }
    ensureAssetName('background');
    selectedFrontAssetId.value = undefined;
    useCustomFrontAsset.value = true;
    toastStore.success('Fond personnalisé appliqué.');
    return;
  }

  if (!isBorderAssetValid.value) {
    toastStore.error('Veuillez configurer correctement la bordure.');
    return;
  }
  ensureAssetName('border');
  selectedBorderAssetId.value = undefined;
  useCustomBorderAsset.value = true;
  toastStore.success('Bordure personnalisée appliquée.');
};

// Build asset data from current form
const buildFrontAssetData = () => {
  if (!isBackgroundAssetValid.value) {
    return null;
  }

  return {
    name: ensureAssetName('background'),
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
    })
  };
};

const buildBorderAssetData = () => {
  if (!isBorderAssetValid.value) {
    return null;
  }

  return {
    name: ensureAssetName('border'),
    category: 'border' as const,
    type: borderAssetType.value as 'solid' | 'image',
    ...(borderAssetType.value === 'solid' && { solidColor: borderSolidColor.value }),
    ...(borderAssetType.value === 'image' && {
      imageBase64: borderAssetImageBase64.value,
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
      imageUrl.value = `data:${base64Data.mimeType};base64,${base64Data.base64}`;

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
  imageUrl.value = '';
  imageBase64.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Custom text management
const addCustomText = () => {
  if (customTexts.value.length < 5) {
    customTexts.value.push({
      id: `text-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`, // Unique ID for proper key binding
      content: `Texte ${customTexts.value.length + 1}`,
      posX: 50,
      posY: 50 + (customTexts.value.length * 15),
      align: 'center',
      color: '#ffffff',
      width: 'w-full',
      fontSize: 14
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

// Category management
const createNewCategory = async () => {
  if (!newCategoryName.value.trim()) {
    toastStore.error('Le nom de la catégorie est requis');
    return;
  }

  const category = await categoryStore.createCategory(
    newCategoryName.value,
    newCategoryDescription.value
  );

  if (category) {
    selectedCategoryId.value = category.id;
    newCategoryName.value = '';
    newCategoryDescription.value = '';
    showCreateCategoryModal.value = false;
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

// Handle saved card visibility with intersection observer
const handleSavedCardVisible = (cardId: string) => {
  const card = cardStore.cardsPreview.find(c => c.id === cardId);
  if (card && !cardStore.cards.find(c => c.id === cardId)?.frontAsset) {
    cardStore.fetchFullCard(cardId);
  }
};

// Observe saved cards when container is mounted or updated
const observeSavedCards = () => {
  if (!savedCardsContainer.value) return;

  const cardElements = savedCardsContainer.value.querySelectorAll('[data-saved-card-id]');
  cardElements.forEach(element => {
    useIntersectionObserver(
      element as HTMLElement,
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cardId = (entry.target as HTMLElement).getAttribute('data-saved-card-id');
            if (cardId) {
              handleSavedCardVisible(cardId);
            }
          }
        });
      },
      {
        threshold: 0.1,
      }
    );
  });
};

// Reobserve saved cards when they change
watch(() => cardStore.cardsPreview.length, () => {
  const timeout = window.setTimeout(observeSavedCards, 100);
  activeTimeouts.add(timeout);
});

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
  if (!selectedFrontAssetId.value && useCustomFrontAsset.value) {
    frontAssetData = buildFrontAssetData();

    if (!frontAssetData) {
      toastStore.error('Veuillez configurer correctement le fond.');
      return;
    }
  }

  // Validate border asset only when user opted to use a custom one
  let borderAssetData = null;
  if (!selectedBorderAssetId.value && useCustomBorderAsset.value) {
    borderAssetData = buildBorderAssetData();

    if (!borderAssetData) {
      toastStore.error('Veuillez configurer correctement la bordure.');
      return;
    }
  }

  // Store card data for confirmation modal WITHOUT creating assets yet
  // For Discord avatars and Cloudinary images, use imageUrl directly instead of imageBase64
  const isDirectImageUrl = (imageSourceType.value === 'discord' && selectedDiscordMemberId.value) ||
                           (imageSourceType.value === 'cloudinary' && selectedCloudinaryImage.value);
  const member = imageSourceType.value === 'discord' && selectedDiscordMemberId.value
    ? cardStore.discordAvatars.find(m => m.id === selectedDiscordMemberId.value)
    : null;
  const cloudinaryImage = imageSourceType.value === 'cloudinary' && selectedCloudinaryImage.value
    ? cardStore.mainCardImages.find(img => img.publicId === selectedCloudinaryImage.value)
    : null;

  pendingCardData.value = {
    title: title.value,
    imageBase64: !isDirectImageUrl ? imageBase64.value : '',
    imageUrl: member?.avatarUrl || cloudinaryImage?.secure_url || undefined,
    frontAssetId: selectedFrontAssetId.value,
    borderAssetId: selectedBorderAssetId.value,
    categoryId: selectedCategoryId.value,
    frontAssetData,
    borderAssetData,
    titlePosX: titlePosX.value,
    titlePosY: titlePosY.value,
    titleAlign: titleAlign.value,
    titleWidth: titleWidth.value,
    titleFontSize: titleFontSize.value,
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
    imageRounded: imageRounded.value,
    imageCropX: imageCropX.value,
    imageCropY: imageCropY.value,
    rarity: rarity.value,
    customTexts: customTexts.value
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
        title: pendingCardData.value.title,
        imageBase64: pendingCardData.value.imageBase64,
        imageUrl: pendingCardData.value.imageUrl,  // For Discord avatars
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
      title: pendingCardData.value.title,
      imageBase64: pendingCardData.value.imageBase64,
      imageUrl: pendingCardData.value.imageUrl,  // For Discord avatars
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
      title.value = '';
      imageUrl.value = '';
      imageBase64.value = '';
      selectedFrontAssetId.value = undefined;
      selectedBorderAssetId.value = undefined;
      useCustomFrontAsset.value = false;
      useCustomBorderAsset.value = false;

      // Reset personnalisation
      titlePosX.value = 50;
      titlePosY.value = 10;
      titleAlign.value = 'center';
      titleWidth.value = 'w-full';
      titleFontSize.value = 18;
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
      backgroundSolidColor.value = 'transparent';
      backgroundGradientColor1.value = '#667eea';
      backgroundGradientColor2.value = '#764ba2';
      backgroundGradientAngle.value = 135;
      backgroundAssetImageBase64.value = '';
      backgroundAssetImagePreview.value = '';

      // Reset border asset
      borderAssetName.value = '';
      borderAssetType.value = 'solid';
      borderSolidColor.value = 'transparent';
      borderAssetImageBase64.value = '';
      borderAssetImagePreview.value = '';

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

    if (card.imageUrl) {
      const base64Data = await loadImageFromUrl(card.imageUrl);
      if (base64Data) {
        imageBase64.value = base64Data.base64;
      }
    }

    // Pré-remplissage du form
    title.value = card.title ?? '';
    imageUrl.value = card.imageUrl ?? '';
    selectedFrontAssetId.value = card.frontAssetId;
    selectedBorderAssetId.value = card.borderAssetId;
    selectedCategoryId.value = card.categoryId;

    titlePosX.value = card.titlePosX ?? 50;
    titlePosY.value = card.titlePosY ?? 10;
    titleAlign.value = (card.titleAlign as any) ?? 'center';
    titleWidth.value = (card.titleWidth as any) ?? 'w-full';
    titleFontSize.value = card.titleFontSize ?? 18;

    removeImageBg.value = Boolean(card.removeImageBg);
    holographicEffect.value = card.holographicEffect ?? true;
    holographicIntensity.value = card.holographicIntensity ?? 0.6;

    titleColor.value = card.titleColor ?? '#ffffff';

    imagePosX.value = card.imagePosX ?? 50;
    imagePosY.value = card.imagePosY ?? 30;
    imageScale.value = card.imageScale ?? 1;
    imageWidth.value = card.imageWidth ?? 160;
    imageHeight.value = card.imageHeight ?? 160;
    imageObjectFit.value = (card.imageObjectFit as any) ?? 'cover';

    rarity.value = (card.rarity as any) ?? 'common';
    customTexts.value = (card.customTexts as any) ?? [];

    // En mode edit, on veut éviter de montrer du state "création" résiduel
    showConfirmationModal.value = false;
    pendingCardData.value = null;
  }
});

// Helper to convert image to base64 with resize to 378px height
const convertImageToBase64 = async (file: File): Promise<{ base64: string; mimeType: string } | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const mimeType = file.type || 'image/png';
    reader.onload = async (e) => {
      const result = e.target?.result as string;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionner à 378px de hauteur en conservant le ratio d'aspect
        const targetHeight = 378;
        const ratio = width / height;
        const newHeight = targetHeight;
        const newWidth = Math.round(newHeight * ratio);

        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          const dataUrl = canvas.toDataURL(mimeType);
          const base64 = dataUrl.split(',')[1] || '';
          resolve({ base64, mimeType });
        } else {
          resolve(null);
        }
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = result;
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
      imageUrl.value = '';
    }
  }
});

watch(selectedDiscordMemberId, async (newMemberId) => {
  if (imageSourceType.value === 'discord' && newMemberId) {
    const member = cardStore.discordAvatars.find(m => m.id === newMemberId);
    if (member) {
      // For Discord avatars, use URL directly - no base64 conversion
      imageUrl.value = member.avatarUrl;
      imageBase64.value = ''; // Clear base64 so backend knows to use imageUrl

      // Load for preview only
      const base64Data = await loadImageFromUrl(member.avatarUrl);
      if (base64Data) {
        imageBase64.value = base64Data.base64; // Only for preview
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
      imageUrl.value = image.secure_url;
      imageBase64.value = ''; // Clear base64 so backend knows to use imageUrl

      // Load for preview only
      const base64Data = await loadImageFromUrl(image.secure_url);
      if (base64Data) {
        imageBase64.value = base64Data.base64; // Only for preview
      }
      toastStore.success('Image sélectionnée');
    }
  }
});

onMounted(() => {
  // Initial observation of saved cards
  observeSavedCards();
});

onUnmounted(() => {
  // Cleanup timeouts
  activeTimeouts.forEach(id => clearTimeout(id));
  activeTimeouts.clear();
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
                    title,
                    imageBase64,
                    frontAsset: selectedFrontAsset,
                    borderAsset: selectedBorderAsset,
                    titlePosX,
                    titlePosY,
                    titleAlign,
                    titleWidth,
                    titleFontSize,
                    removeImageBg,
                    holographicEffect,
                    holographicIntensity,
                    titleColor,
                    imagePosX,
                    imagePosY,
                    imageScale,
                    imageWidth,
                    imageHeight,
                    imageObjectFit,
                    imageRounded,
                    imageCropX,
                    imageCropY,
                    rarity,
                    customTexts,
                    category: selectedCategoryId ? {
                      id: selectedCategoryId,
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
                  activeTab === 'basics'
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-ink-700/50 text-foam-300 hover:bg-ink-600'
                ]"
                @click="activeTab = 'basics'"
              >
                <span class="flex items-center gap-2">
                  🎯 Essentiel
                  <span v-if="isTabComplete.basics" class="text-green-400">✓</span>
                </span>
              </button>
              <button
                :class="[
                  'px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200',
                  activeTab === 'appearance'
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-ink-700/50 text-foam-300 hover:bg-ink-600'
                ]"
                @click="activeTab = 'appearance'"
              >
                🎨 Apparence
              </button>
              <button
                :class="[
                  'px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200',
                  activeTab === 'texts'
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-ink-700/50 text-foam-300 hover:bg-ink-600'
                ]"
                @click="activeTab = 'texts'"
              >
                📝 Textes
              </button>
              <button
                :class="[
                  'px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200',
                  activeTab === 'assets'
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-ink-700/50 text-foam-300 hover:bg-ink-600'
                ]"
                @click="activeTab = 'assets'"
              >
                🖼️ Fond & Bordures
              </button>
              <button
                :class="[
                  'px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200',
                  activeTab === 'effects'
                    ? 'bg-accent-500 text-white shadow-lg'
                    : 'bg-ink-700/50 text-foam-300 hover:bg-ink-600'
                ]"
                @click="activeTab = 'effects'"
              >
                ✨ Effets
              </button>
            </div>

            <!-- Tab Content -->
            <div class="space-y-6 min-h-[500px]">
              <!-- TAB 1: ESSENTIEL -->
              <div v-show="activeTab === 'basics'">
                <!-- Hidden file input (needs to be in parent for ref access) -->
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageUpload"
                />
                
                <BasicInfoPanel
                  :title="title"
                  @update:title="title = $event"
                  :category-id="selectedCategoryId"
                  @update:category-id="selectedCategoryId = $event"
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
                  @show-create-category-modal="showCreateCategoryModal = true"
                  @trigger-file-input="triggerFileInput"
                  @remove-image="removeImage"
                  @load-image-from-url="async (url) => {
                    if (!url.trim()) {
                      toastStore.error('Veuillez entrer une URL valide.');
                      return;
                    }
                    const base64Data = await loadImageFromUrl(url.trim());
                    if (base64Data) {
                      imageBase64 = base64Data.base64;
                    }
                  }"
                  @toggle-show-all-images="toggleShowAllImages"
                  @refresh-images="showAllImages ? cardStore.fetchMainCardImages() : cardStore.fetchUsedMainCardImages()"
                />
              </div>

              <!-- TAB 2: APPARENCE -->
              <div v-show="activeTab === 'appearance'">
                <AppearancePanel
                  :title-color="titleColor"
                  @update:title-color="titleColor = $event"
                  :title-font-size="titleFontSize"
                  @update:title-font-size="titleFontSize = $event"
                  :title-pos-x="titlePosX"
                  @update:title-pos-x="titlePosX = $event"
                  :title-pos-y="titlePosY"
                  @update:title-pos-y="titlePosY = $event"
                  :title-align="titleAlign"
                  @update:title-align="titleAlign = $event"
                  :title-width="titleWidth"
                  @update:title-width="titleWidth = $event"
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
              <div v-show="activeTab === 'texts'" class="space-y-6 animate-fadeIn">
                <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-foam-200">📝 Textes personnalisés ({{ customTexts.length }}/5)</h3>
                    <Button
                      v-if="customTexts.length < 5"
                      variant="secondary"
                      size="sm"
                      @click="addCustomText"
                    >
                      ➕ Ajouter texte
                    </Button>
                  </div>

                  <!-- Custom texts list -->
                  <div v-if="customTexts.length === 0" class="text-xs text-foam-300/60 py-8 text-center border border-dashed border-white/10 rounded-lg">
                    <div class="mb-2">📝</div>
                    Aucun texte personnalisé. Cliquez sur "+ Ajouter texte" pour en ajouter.
                  </div>

                  <div v-for="(text, index) in customTexts" :key="text.id || `text-${index}`" class="space-y-3 p-4 border border-white/10 rounded-lg bg-ink-700/20 hover:border-accent-500/30 transition-all duration-200">
                    <!-- Text header -->
                    <div class="flex items-center justify-between">
                      <label class="text-xs text-foam-300 font-semibold">📄 Texte {{ index + 1 }}</label>
                      <Button
                        variant="danger"
                        size="sm"
                        @click="removeCustomText(index)"
                      >
                        🗑️ Supprimer
                      </Button>
                    </div>

                    <!-- Text content -->
                    <div class="space-y-2">
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

                    <!-- Text Font Size -->
                    <div class="space-y-2">
                      <label class="text-xs text-foam-300">Taille du texte</label>
                      <div class="flex gap-2 items-center">
                        <input
                          :value="text.fontSize || 14"
                          @input="updateCustomText(index, 'fontSize', Number(($event.target as HTMLInputElement).value))"
                          type="range"
                          min="8"
                          max="32"
                          class="flex-1"
                        />
                        <span class="text-xs text-foam-300 w-12 font-semibold">{{ text.fontSize || 14 }}px</span>
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
                            <span class="text-xs text-foam-300 w-12 font-semibold">{{ text.posX }}%</span>
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
                            <span class="text-xs text-foam-300 w-12 font-semibold">{{ text.posY }}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Text alignment -->
                    <div class="space-y-2">
                      <label class="text-xs text-foam-300 block">Alignement</label>
                      <div class="flex gap-2">
                        <button
                          :class="text.align === 'left' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                          class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
                          @click="updateCustomText(index, 'align', 'left')"
                        >
                          ◀ Gauche
                        </button>
                        <button
                          :class="text.align === 'center' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                          class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
                          @click="updateCustomText(index, 'align', 'center')"
                        >
                          ■ Centré
                        </button>
                        <button
                          :class="text.align === 'right' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                          class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
                          @click="updateCustomText(index, 'align', 'right')"
                        >
                          ▶ Droite
                        </button>
                      </div>
                    </div>

                    <!-- Text width -->
                    <div class="space-y-2">
                      <label class="text-xs text-foam-300 block">Largeur du texte</label>
                      <div class="flex gap-2">
                        <button
                          :class="text.width === 'w-full' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                          class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
                          @click="updateCustomText(index, 'width', 'w-full')"
                        >
                          Pleine largeur
                        </button>
                        <button
                          :class="text.width === 'w-auto' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                          class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
                          @click="updateCustomText(index, 'width', 'w-auto')"
                        >
                          Auto
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB 4: FOND & BORDURES -->
              <div v-show="activeTab === 'assets'" class="space-y-6 animate-fadeIn">
                <!-- CRÉER UN ASSET -->
                <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-foam-200">🎨 Créer un asset personnalisé</h3>
                    <div class="flex gap-2">
                      <button
                        :class="assetCategory === 'background' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                        class="px-3 py-1 rounded text-xs font-medium transition-all duration-200"
                        @click="assetCategory = 'background'"
                      >
                        🖼️ Fond
                      </button>
                      <button
                        :class="assetCategory === 'border' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                        class="px-3 py-1 rounded text-xs font-medium transition-all duration-200"
                        @click="assetCategory = 'border'"
                      >
                        🔲 Bordure
                      </button>
                    </div>
                  </div>

                  <!-- Asset Type Tabs -->
                  <div class="flex gap-2">
                    <button
                      :class="getCurrentAssetType() === 'solid' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                      class="px-3 py-2 rounded text-sm font-medium transition-all duration-200"
                      @click="setCurrentAssetType('solid')"
                    >
                      🎨 Couleur
                    </button>
                    <button
                      v-if="assetCategory === 'background'"
                      :class="getCurrentAssetType() === 'gradient' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                      class="px-3 py-2 rounded text-sm font-medium transition-all duration-200"
                      @click="setCurrentAssetType('gradient')"
                    >
                      🌈 Dégradé
                    </button>
                    <button
                      :class="getCurrentAssetType() === 'image' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                      class="px-3 py-2 rounded text-sm font-medium transition-all duration-200"
                      @click="setCurrentAssetType('image')"
                    >
                      📷 Image
                    </button>
                  </div>

                  <!-- Solid Color -->
                  <div v-if="getCurrentAssetType() === 'solid'" class="space-y-3">
                    <div class="flex gap-3 items-center">
                      <input
                        :value="getCurrentSolidColor()"
                        type="color"
                        class="w-16 h-10 rounded cursor-pointer border border-white/10"
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
                          class="w-16 h-10 rounded cursor-pointer border border-white/10"
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
                          class="w-16 h-10 rounded cursor-pointer border border-white/10"
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
                        <span class="text-sm text-foam-300 w-12 font-semibold">{{ getCurrentGradientAngle() }}°</span>
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
                        {{ getCurrentImagePreview() ? '🔄 Changer l\'image' : '📤 Ajouter une image' }}
                      </Button>
                      <Button
                        v-if="getCurrentImagePreview()"
                        variant="danger"
                        size="sm"
                        @click="removeAssetImage"
                      >
                        🗑️ Supprimer
                      </Button>
                    </div>
                    <p class="text-xs text-foam-300/50">PNG ou GIF, max 3MB</p>
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

                  <!-- Asset Name -->
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
                    <div class="flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        @click="applyCurrentAsset"
                        :disabled="assetCategory === 'background' ? !isBackgroundAssetValid : !isBorderAssetValid"
                      >
                        ✓ Utiliser cet asset
                      </Button>
                    </div>
                  </div>
                  <p class="text-xs text-foam-300/60 p-2 bg-ink-700/30 rounded border border-white/5">
                    💡 Vérifiez qu'un asset similaire n'existe pas déjà avant d'en créer un nouveau
                  </p>
                </div>

                <!-- SÉLECTION FOND -->
                <div class="space-y-3 p-4 border border-white/10 rounded-lg bg-ink-800/30">
                  <div class="flex justify-between items-center">
                    <label class="form-label flex items-center gap-2">
                      <span>🖼️ Fonds disponibles</span>
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="() => { selectedFrontAssetId = undefined; useCustomFrontAsset = false; }"
                    >
                      ✕ Aucun fond
                    </Button>
                  </div>
                  <div class="flex justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      @click="toggleShowAllAssets"
                      class="w-full max-w-xs"
                    >
                      {{ showAllAssets ? '👤 Afficher mes assets uniquement' : '👥 Afficher tous les assets' }}
                    </Button>
                  </div>
                  <div v-if="filteredBackgroundAssets.length === 0" class="text-sm text-foam-300/60 py-8 text-center border border-dashed border-white/10 rounded-lg">
                    {{ showAllAssets ? 'Aucun fond créé pour le moment.' : 'Vous n\'avez créé aucun fond. Cliquez sur "Afficher tous les assets" pour voir ceux des autres utilisateurs.' }}
                  </div>
                  <div v-else class="grid grid-cols-4 gap-3">
                    <button
                      v-for="asset in filteredBackgroundAssets"
                      :key="asset.id"
                      class="w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden relative"
                      :class="selectedFrontAssetId === asset.id ? 'border-accent-400 ring-2 ring-accent-400/50 scale-105' : 'border-white/10 hover:border-white/30'"
                      :style="
                        asset.type === 'solid'
                          ? { background: asset.solidColor }
                          : asset.type === 'gradient'
                            ? { background: `linear-gradient(${asset.angle || 135}deg, ${asset.color1} 0%, ${asset.color2} 100%)` }
                            : { background: '#1a1a2e' }
                      "
                      :title="asset.name"
                      @click="() => { selectedFrontAssetId = asset.id; useCustomFrontAsset = false; }"
                    >
                      <VueIcon v-if="asset.createdBy?.id === user?.id" name="fa:trash" class="text-red-400 cursor-pointer absolute top-1 right-1 hover:scale-125 transition-transform" @click.stop="cardStore.deleteAsset(asset.id)" />
                      <img
                        v-if="asset.type === 'image' && (asset.imageUrl || asset.imageBase64)"
                        :src="asset.imageUrl || `data:image/png;base64,${asset.imageBase64}`"
                        :alt="asset.name"
                        class="w-full h-full object-cover"
                      />
                    </button>
                  </div>
                </div>

                <!-- SÉLECTION BORDURE -->
                <div class="space-y-3 p-4 border border-white/10 rounded-lg bg-ink-800/30">
                  <div class="flex justify-between items-center">
                    <label class="form-label flex items-center gap-2">
                      <span>🔲 Bordures disponibles</span>
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="() => { selectedBorderAssetId = undefined; useCustomBorderAsset = false; }"
                    >
                      ✕ Aucune bordure
                    </Button>
                  </div>
                  <div class="flex justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      @click="toggleShowAllAssets"
                      class="w-full max-w-xs"
                    >
                      {{ showAllAssets ? '👤 Afficher mes assets uniquement' : '👥 Afficher tous les assets' }}
                    </Button>
                  </div>
                  <div v-if="filteredBorderAssets.length === 0" class="text-sm text-foam-300/60 py-8 text-center border border-dashed border-white/10 rounded-lg">
                    {{ showAllAssets ? 'Aucune bordure créée pour le moment.' : 'Vous n\'avez créé aucune bordure. Cliquez sur "Afficher tous les assets" pour voir ceux des autres utilisateurs.' }}
                  </div>
                  <div v-else class="grid grid-cols-4 gap-3">
                    <button
                      v-for="asset in filteredBorderAssets"
                      :key="asset.id"
                      class="w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden bg-ink-800 relative"
                      :class="selectedBorderAssetId === asset.id ? 'border-accent-400 ring-2 ring-accent-400/50 scale-105' : 'border-white/10 hover:border-white/30'"
                      :style="
                        asset.type === 'solid'
                          ? { borderColor: asset.solidColor }
                          : {}
                      "
                      :title="asset.name"
                      @click="() => { selectedBorderAssetId = asset.id; useCustomBorderAsset = false; }"
                    >
                      <VueIcon v-if="asset.createdBy?.id === user?.id" name="fa:trash" class="text-red-400 cursor-pointer absolute top-1 right-1 hover:scale-125 transition-transform" @click.stop="cardStore.deleteAsset(asset.id)" />
                      <img
                        v-if="asset.type === 'image' && (asset.imageUrl || asset.imageBase64)"
                        :src="asset.imageUrl || `data:image/png;base64,${asset.imageBase64}`"
                        :alt="asset.name"
                        class="w-full h-full object-cover"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <!-- TAB 5: EFFETS -->
              <div v-show="activeTab === 'effects'" class="space-y-6 animate-fadeIn">
                <!-- SECTION EFFETS -->
                <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
                  <h3 class="text-sm font-semibold text-foam-200">✨ Effets visuels</h3>

                  <!-- Remove Background Toggle -->
                  <div class="flex items-center gap-3 p-3 rounded-lg bg-ink-700/20 hover:bg-ink-700/30 transition-all duration-200">
                    <input
                      v-model="removeImageBg"
                      type="checkbox"
                      id="removeBg"
                      class="w-4 h-4 rounded cursor-pointer"
                    />
                    <label for="removeBg" class="text-sm text-foam-300 cursor-pointer flex-1">
                      🎭 Supprimer le fond de l'image (approximatif)
                    </label>
                  </div>

                  <!-- Holographic Effect Toggle -->
                  <div class="flex items-center gap-3 p-3 rounded-lg bg-ink-700/20 hover:bg-ink-700/30 transition-all duration-200">
                    <input
                      v-model="holographicEffect"
                      type="checkbox"
                      id="holoEffect"
                      class="w-4 h-4 rounded cursor-pointer"
                    />
                    <label for="holoEffect" class="text-sm text-foam-300 cursor-pointer flex-1">
                      💎 Activer l'effet holographique
                    </label>
                  </div>

                  <!-- Holographic Intensity Slider -->
                  <div v-if="holographicEffect" class="space-y-2 ml-6 p-3 bg-ink-700/10 rounded-lg border-l-2 border-accent-500/30">
                    <label class="text-xs text-foam-300 font-semibold">Intensité de l'effet</label>
                    <div class="flex gap-2 items-center">
                      <input
                        v-model.number="holographicIntensity"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        class="flex-1"
                      />
                      <span class="text-xs text-foam-300 w-12 font-semibold">{{ Math.round(holographicIntensity * 100) }}%</span>
                    </div>
                  </div>
                </div>
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
      <div v-if="cardStore.cardsPreview.length > 0" class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="h-px w-16 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Collection</p>
            <h2 class="text-xl font-semibold text-white/90">
              Vos Cartes <span class="text-foam-200/60">({{ cardStore.cardsPreview.length }})</span>
            </h2>
          </div>
        </div>

        <div ref="savedCardsContainer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            v-for="card in cardStore.cardsPreview"
            :key="card.id"
            :data-saved-card-id="card.id"
            class="flex flex-col items-center min-w-64 w-64"
          >
            <CollectibleCard
              :card="cardStore.cards.find(c => c.id === card.id) || {
                id: card.id,
                title: 'Carte non chargée',
                createdAt: '',
                updatedAt: ''
              }"
              :lazy-load="!cardStore.cards.find(c => c.id === card.id)"
              interactive
            />
            <Button
              variant="danger"
              size="sm"
              class="mt-4"
              @click="cardStore.deleteCard(card.id)"
              :disabled="!useUserStore().isSuperAdmin"
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
            Vous allez {{ isAdminEdit ? 'mettre à jour' : 'créer' }} une nouvelle carte avec les paramètres suivants :
          </p>

          <div class="flex justify-center">
            <CollectibleCard
              v-if="pendingCardData"
              :card="{
                id: 'preview',
                title: pendingCardData.title,
                imageBase64: pendingCardData.imageBase64,
                imageUrl: pendingCardData.imageUrl,
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
      <Modal :is-open="showCreateCategoryModal" @close="showCreateCategoryModal = false" class="!max-w-md">
        <template #header>
          <h2 class="text-lg font-semibold">Créer une nouvelle catégorie</h2>
        </template>

        <div class="space-y-4">
          <!-- Category Name -->
          <div class="space-y-2">
            <label class="form-label text-sm">Nom de la catégorie *</label>
            <input
              v-model="newCategoryName"
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
              v-model="newCategoryDescription"
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
              @click="showCreateCategoryModal = false"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              @click="createNewCategory"
              :disabled="!newCategoryName.trim()"
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

