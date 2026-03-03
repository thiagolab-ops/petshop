/**
 * Utilitário para compressão de imagens no lado do cliente
 * Redimensiona para máximo 800x600, converte para WebP e comprime para ~100KB
 */

export interface CompressedImage {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 600,
  maxSizeKB = 100
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        
        // Criar canvas para redimensionamento
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'));
          return;
        }
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Função para comprimir iterativamente até atingir o tamanho desejado
        const compressToSize = (quality: number): Promise<Blob> => {
          return new Promise((resolveBlob) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolveBlob(blob);
                }
              },
              'image/webp',
              quality
            );
          });
        };
        
        // Compressão iterativa
        const findOptimalQuality = async (): Promise<Blob> => {
          let quality = 0.9;
          let blob = await compressToSize(quality);
          const maxSizeBytes = maxSizeKB * 1024;
          
          // Reduzir qualidade até atingir tamanho desejado
          while (blob.size > maxSizeBytes && quality > 0.1) {
            quality -= 0.1;
            blob = await compressToSize(quality);
          }
          
          // Se ainda estiver grande, tentar qualidades mais baixas
          if (blob.size > maxSizeBytes && quality <= 0.1) {
            quality = 0.05;
            blob = await compressToSize(quality);
          }
          
          return blob;
        };
        
        findOptimalQuality()
          .then((blob) => {
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.webp'),
              { type: 'image/webp' }
            );
            
            const dataUrl = canvas.toDataURL('image/webp', 0.8);
            
            resolve({
              file: compressedFile,
              dataUrl,
              width,
              height,
              originalSize: file.size,
              compressedSize: blob.size,
            });
          })
          .catch(reject);
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
