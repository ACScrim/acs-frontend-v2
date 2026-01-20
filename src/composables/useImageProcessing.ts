import { useToastStore } from '@/stores/toastStore';

export interface ImageBase64Data {
  base64: string;
  mimeType: string;
}

export function useImageProcessing() {
  const toastStore = useToastStore();

  /**
   * Convert image file to base64 with automatic resize to 378px height
   */
  const convertImageToBase64 = async (file: File): Promise<ImageBase64Data | null> => {
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

  /**
   * Load image from URL and convert to base64
   */
  const loadImageFromUrl = async (url: string): Promise<ImageBase64Data | null> => {
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

  /**
   * Handle image upload event from file input
   */
  const handleImageUpload = async (
    event: Event,
    onSuccess: (base64: string, mimeType: string, fileSize: number) => void
  ) => {
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
        onSuccess(base64Data.base64, base64Data.mimeType, file.size);

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

  return {
    convertImageToBase64,
    loadImageFromUrl,
    handleImageUpload,
  };
}
