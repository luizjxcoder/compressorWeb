
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import { ImageFile, CompressionOptions } from '../App';

interface ProgressBarProps {
     images: ImageFile[];
     isCompressing: boolean;
     setIsCompressing: (value: boolean) => void;
     compressionOptions: CompressionOptions;
     onCompressionStart: (id: string) => void;
     onCompressionComplete: (id: string, compressedFile: File, compressedSize: number) => void;
     onCompressionError: (id: string) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
     images,
     isCompressing,
     setIsCompressing,
     compressionOptions,
     onCompressionStart,
     onCompressionComplete,
     onCompressionError
}) => {
     const [currentImageIndex, setCurrentImageIndex] = useState(0);
     const [progress, setProgress] = useState(0);

     const pendingImages = images.filter((img) => img.status === 'pending');
     const completedImages = images.filter((img) => img.status === 'completed');
     const totalImages = images.length;

     useEffect(() => {
          if (isCompressing && pendingImages.length > 0) {
               compressNextImage();
          } else if (isCompressing && pendingImages.length === 0) {
               setIsCompressing(false);
               toast.success('Todas as imagens foram processadas!');
          }
     }, [isCompressing, pendingImages.length]);

     const getOutputFileType = (format: CompressionOptions['format']) => {
          switch (format) {
               case 'jpeg':
                    return 'image/jpeg';
               case 'png':
                    return 'image/png';
               case 'webp':
                    return 'image/webp';
               case 'original':
               default:
                    return undefined; // Mantém formato original
          }
     };

     const compressNextImage = async () => {
          const nextImage = pendingImages[0];
          if (!nextImage) return;

          onCompressionStart(nextImage.id);
          setCurrentImageIndex(images.findIndex((img) => img.id === nextImage.id));

          try {
               const outputFileType = getOutputFileType(compressionOptions.format);

               const options = {
                    maxSizeMB: 10,
                    maxWidthOrHeight: Math.max(compressionOptions.maxWidth, compressionOptions.maxHeight),
                    useWebWorker: true,
                    initialQuality: compressionOptions.quality,
                    fileType: outputFileType,
                    onProgress: (progress: number) => {
                         setProgress(progress);
                    }
               };

               const compressedFile = await imageCompression(nextImage.file, options);

               // Criar novo arquivo com nome atualizado se necessário
               let finalFile = compressedFile;
               if (compressionOptions.format !== 'original') {
                    const originalName = nextImage.file.name.split('.').slice(0, -1).join('.');
                    const newExtension = compressionOptions.format === 'jpeg' ? 'jpg' : compressionOptions.format;
                    const newFileName = `${originalName}.${newExtension}`;

                    finalFile = new File([compressedFile], newFileName, {
                         type: compressedFile.type,
                         lastModified: Date.now()
                    });
               }

               onCompressionComplete(nextImage.id, finalFile, finalFile.size);

               const formatName = compressionOptions.format === 'original' ? 'original' : compressionOptions.format.toUpperCase();
               toast.success(`${nextImage.file.name} convertido para ${formatName}`);

          } catch (error) {
               console.error('Compression error:', error);
               onCompressionError(nextImage.id);
               toast.error(`Erro ao processar ${nextImage.file.name}`);
          }
     };

     const startCompression = () => {
          if (pendingImages.length === 0) {
               toast.error('Nenhuma imagem pendente para processar');
               return;
          }

          const formatName = compressionOptions.format === 'original' ? 'formato original' : compressionOptions.format.toUpperCase();
          toast.success(`Iniciando conversão para ${formatName}`);

          setIsCompressing(true);
          setProgress(0);
     };

     const pauseCompression = () => {
          setIsCompressing(false);
          toast.info('Processamento pausado');
     };

     const resetAll = () => {
          setIsCompressing(false);
          setProgress(0);
          setCurrentImageIndex(0);
          toast.success('Processo resetado');
     };

     const overallProgress = totalImages > 0 ? completedImages.length / totalImages * 100 : 0;

     return (
          <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">

               <div className="flex items-center justify-between mb-4">
                    <div>
                         <h3 className="text-lg font-semibold text-white">Processamento e Conversão</h3>
                         <p className="text-slate-400 text-sm">
                              {completedImages.length} de {totalImages} imagens convertidas para{' '}
                              <span className="text-blue-400 font-medium">
                                   {compressionOptions.format === 'original' ? 'formato original' : compressionOptions.format.toUpperCase()}
                              </span>
                         </p>
                    </div>

                    <div className="flex items-center space-x-2">
                         {!isCompressing ?
                              <button
                                   onClick={startCompression}
                                   disabled={pendingImages.length === 0}
                                   className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors">

                                   <Play className="w-4 h-4" />
                                   <span>Converter para {compressionOptions.format.toUpperCase()}</span>
                              </button> :

                              <button
                                   onClick={pauseCompression}
                                   className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">

                                   <Pause className="w-4 h-4" />
                                   <span>Pausar</span>
                              </button>
                         }








                    </div>
               </div>

               {/* Format Info */}
               <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${compressionOptions.format === 'webp' ? 'bg-green-400' :
                                        compressionOptions.format === 'jpeg' ? 'bg-blue-400' :
                                             compressionOptions.format === 'png' ? 'bg-purple-400' :
                                                  'bg-slate-400'}`
                              } />
                              <span className="text-white font-medium">
                                   Formato de Saída: {compressionOptions.format === 'original' ? 'Original' : compressionOptions.format.toUpperCase()}
                              </span>
                         </div>
                         <div className="text-slate-400 text-sm">
                              Qualidade: {Math.round(compressionOptions.quality * 100)}% •
                              Tamanho: {compressionOptions.maxWidth}×{compressionOptions.maxHeight}
                         </div>
                    </div>
               </div>

               {/* Overall Progress */}
               <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                         <span className="text-slate-400">Progresso Geral</span>
                         <span className="text-white">{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                         <motion.div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${overallProgress}%` }}
                              transition={{ duration: 0.5 }} />

                    </div>
               </div>

               {/* Current Image Progress */}
               {isCompressing &&
                    <div className="space-y-2">
                         <div className="flex justify-between text-sm">
                              <span className="text-slate-400">
                                   Processando: {images[currentImageIndex]?.file.name || 'N/A'}
                              </span>
                              <span className="text-white">{Math.round(progress)}%</span>
                         </div>
                         <div className="w-full bg-slate-700 rounded-full h-2">
                              <motion.div
                                   className="bg-green-500 h-2 rounded-full"
                                   style={{ width: `${progress}%` }}
                                   transition={{ duration: 0.2 }} />

                         </div>
                    </div>
               }

               {/* Summary */}
               {completedImages.length > 0 &&
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                         <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                   <p className="text-slate-400 text-sm">Convertidas</p>
                                   <p className="text-white text-lg font-semibold">{completedImages.length}</p>
                              </div>
                              <div>
                                   <p className="text-slate-400 text-sm">Economia Média</p>
                                   <p className="text-green-400 text-lg font-semibold">
                                        {completedImages.length > 0 ?
                                             Math.round(completedImages.reduce((sum, img) => sum + (img.compressionRatio || 0), 0) / completedImages.length) :
                                             0
                                        }%
                                   </p>
                              </div>
                              <div>
                                   <p className="text-slate-400 text-sm">Status</p>
                                   <p className="text-blue-400 text-lg font-semibold">
                                        {isCompressing ? 'Convertendo' : pendingImages.length > 0 ? 'Pausado' : 'Concluído'}
                                   </p>
                              </div>
                         </div>
                    </div>
               }
          </motion.div>);

};

export default ProgressBar;