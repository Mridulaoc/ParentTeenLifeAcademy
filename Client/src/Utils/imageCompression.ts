export const compressImage = async (
  file: File,
  maxWidthHeight = 1200,
  quality = 0.8
): Promise<{
  compressedImage: string;
  stats: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  };
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const originalSize = file.size;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxWidthHeight) {
          height = Math.round((height * maxWidthHeight) / width);
          width = maxWidthHeight;
        } else if (height > maxWidthHeight) {
          width = Math.round((width * maxWidthHeight) / height);
          height = maxWidthHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create blob"));
              return;
            }
            const compressedSize = blob.size;
            const compressionRatio =
              ((originalSize - compressedSize) / originalSize) * 100;

            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => {
              resolve({
                compressedImage: reader.result as string,
                stats: {
                  originalSize,
                  compressedSize,
                  compressionRatio,
                },
              });
            };
            reader.onerror = () => {
              reject(new Error("Error converting blob to base64"));
            };
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Error loading image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
  });
};

export const convertToFile = async (imageData: string, fileName: string) => {
  const response = await fetch(imageData);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type });
};
