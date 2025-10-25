
    
import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {Upload, Download, Image, Zap, Settings, Check, X, FileImage, Globe, Target, Monitor, ImageIcon, Camera, Mountain, RotateCcw} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import ImageUploader from './components/ImageUploader'
import CompressionSettings from './components/CompressionSettings'
import ImagePreview from './components/ImagePreview'
import ProgressBar from './components/ProgressBar'

export interface ImageFile {
  id: string
  file: File
  originalSize: number
  compressedSize?: number
  compressedFile?: File
  preview: string
  status: 'pending' | 'compressing' | 'completed' | 'error'
  compressionRatio?: number
  outputFormat?: string
}

export interface CompressionOptions {
  quality: number
  maxWidth: number
  maxHeight: number
  format: 'original' | 'jpeg' | 'png' | 'webp'
  webMode: 'custom' | 'hero' | 'thumbnail' | 'gallery' | 'background'
}

export interface WebPreset {
  name: string
  description: string
  quality: number
  maxWidth: number
  maxHeight: number
  format: 'webp' | 'jpeg'
  icon: React.ComponentType<{ className?: string }>
  use_case: string
  performance_tip: string
}

const webPresets: Record<string, WebPreset> = {
  hero: {
    name: 'Hero/Banner',
    description: 'Imagens principais de destaque',
    quality: 0.85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp',
    icon: Monitor,
    use_case: 'Primeira impressão do site',
    performance_tip: 'Alta qualidade com carregamento otimizado'
  },
  thumbnail: {
    name: 'Miniaturas',
    description: 'Pequenas imagens de preview',
    quality: 0.75,
    maxWidth: 400,
    maxHeight: 400,
    format: 'webp',
    icon: ImageIcon,
    use_case: 'Galerias e listas de produtos',
    performance_tip: 'Máxima compressão para carregamento rápido'
  },
  gallery: {
    name: 'Galeria',
    description: 'Imagens de galeria/portfólio',
    quality: 0.80,
    maxWidth: 1200,
    maxHeight: 800,
    format: 'webp',
    icon: Camera,
    use_case: 'Portfólios e showcases',
    performance_tip: 'Equilíbrio entre qualidade e performance'
  },
  background: {
    name: 'Background',
    description: 'Imagens de fundo',
    quality: 0.70,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'jpeg',
    icon: Mountain,
    use_case: 'Fundos de seções e páginas',
    performance_tip: 'Compressão agressiva sem perder impacto'
  }
}

function App() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [lastConvertedImage, setLastConvertedImage] = useState<ImageFile | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    quality: 0.85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp',
    webMode: 'hero'
  })

  const handleImagesAdded = useCallback((newImages: ImageFile[]) => {
    setImages(prev => [...prev, ...newImages])
  }, [])

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }, [])

  const getOutputExtension = useCallback((format: CompressionOptions['format'], originalName: string) => {
    if (format === 'original') {
      // Manter extensão original
      const ext = originalName.split('.').pop()?.toLowerCase()
      return ext === 'jpeg' ? 'jpg' : ext || 'jpg'
    }
    return format === 'jpeg' ? 'jpg' : format
  }, [])

  const getOutputFileName = useCallback((originalName: string, format: CompressionOptions['format']) => {
    const nameWithoutExt = originalName.split('.').slice(0, -1).join('.')
    const extension = getOutputExtension(format, originalName)
    return `optimized_${nameWithoutExt}.${extension}`
  }, [getOutputExtension])

  const handleCompressionComplete = useCallback((id: string, compressedFile: File, compressedSize: number) => {
    setImages(prev => prev.map(img => 
      img.id === id 
        ? { 
            ...img, 
            compressedFile, 
            compressedSize, 
            status: 'completed' as const,
            compressionRatio: Math.round(((img.originalSize - compressedSize) / img.originalSize) * 100),
            outputFormat: compressionOptions.format
          }
        : img
    ))
    
    // Salvar a última imagem convertida
    const updatedImage = images.find(img => img.id === id)
    if (updatedImage) {
      setLastConvertedImage({
        ...updatedImage,
        compressedFile,
        compressedSize,
        status: 'completed' as const,
        compressionRatio: Math.round(((updatedImage.originalSize - compressedSize) / updatedImage.originalSize) * 100),
        outputFormat: compressionOptions.format
      })
    }
  }, [compressionOptions.format, images])

  const handleCompressionError = useCallback((id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, status: 'error' as const } : img
    ))
  }, [])

  const handleCompressionStart = useCallback((id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, status: 'compressing' as const } : img
    ))
  }, [])

  const handleWebModeChange = useCallback((mode: CompressionOptions['webMode']) => {
    if (mode === 'custom') {
      setCompressionOptions(prev => ({ ...prev, webMode: mode }))
      toast.success('Modo personalizado ativado - Configure manualmente')
    } else {
      const preset = webPresets[mode]
      setCompressionOptions({
        quality: preset.quality,
        maxWidth: preset.maxWidth,
        maxHeight: preset.maxHeight,
        format: preset.format,
        webMode: mode
      })
      toast.success(`Modo ${preset.name} ativado`, {
        description: preset.performance_tip
      })
    }
  }, [])

  const downloadSingle = useCallback((image: ImageFile) => {
    if (!image.compressedFile) {
      toast.error('Imagem não foi comprimida ainda')
      return
    }

    const url = URL.createObjectURL(image.compressedFile)
    const a = document.createElement('a')
    a.href = url
    a.download = getOutputFileName(image.file.name, image.outputFormat as CompressionOptions['format'] || compressionOptions.format)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    const formatName = (image.outputFormat || compressionOptions.format).toUpperCase()
    toast.success(`Imagem baixada em formato ${formatName}!`)
  }, [getOutputFileName, compressionOptions.format])

  const downloadAll = useCallback(() => {
    const completedImages = images.filter(img => img.status === 'completed' && img.compressedFile)
    
    if (completedImages.length === 0) {
      toast.error('Nenhuma imagem comprimida disponível para download')
      return
    }

    let downloadCount = 0
    const formatCounts: Record<string, number> = {}

    completedImages.forEach(img => {
      if (img.compressedFile) {
        const url = URL.createObjectURL(img.compressedFile)
        const a = document.createElement('a')
        a.href = url
        a.download = getOutputFileName(img.file.name, img.outputFormat as CompressionOptions['format'] || compressionOptions.format)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        downloadCount++
        const format = (img.outputFormat || compressionOptions.format).toUpperCase()
        formatCounts[format] = (formatCounts[format] || 0) + 1
      }
    })

    const formatSummary = Object.entries(formatCounts)
      .map(([format, count]) => `${count} ${format}`)
      .join(', ')

    toast.success(`${downloadCount} imagens baixadas: ${formatSummary}`)
  }, [images, getOutputFileName, compressionOptions.format])

  const downloadByFormat = useCallback((targetFormat: 'jpeg' | 'png' | 'webp') => {
    const completedImages = images.filter(img => 
      img.status === 'completed' && 
      img.compressedFile && 
      (img.outputFormat === targetFormat || compressionOptions.format === targetFormat)
    )
    
    if (completedImages.length === 0) {
      toast.error(`Nenhuma imagem em formato ${targetFormat.toUpperCase()} disponível`)
      return
    }

    completedImages.forEach(img => {
      if (img.compressedFile) {
        const url = URL.createObjectURL(img.compressedFile)
        const a = document.createElement('a')
        a.href = url
        a.download = getOutputFileName(img.file.name, targetFormat)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    })

    toast.success(`${completedImages.length} imagens ${targetFormat.toUpperCase()} baixadas!`)
  }, [images, compressionOptions.format, getOutputFileName])

  const resetForNewConversion = useCallback(() => {
    // Limpar todas as imagens atuais
    setImages([])
    setIsCompressing(false)
    
    toast.success('Sistema resetado para nova conversão', {
      description: 'Última conversão mantida no histórico'
    })
  }, [])

  const clearAll = useCallback(() => {
    setImages([])
    setLastConvertedImage(null)
    toast.success('Todas as imagens foram removidas')
  }, [])

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0)
  const totalCompressedSize = images.reduce((sum, img) => sum + (img.compressedSize || 0), 0)
  const totalSavings = totalOriginalSize > 0 ? Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100) : 0
  const completedCount = images.filter(img => img.status === 'completed').length

  const currentPreset = compressionOptions.webMode !== 'custom' ? webPresets[compressionOptions.webMode] : null

  // Contar imagens por formato
  const formatCounts = images.filter(img => img.status === 'completed').reduce((acc, img) => {
    const format = (img.outputFormat || compressionOptions.format).toUpperCase()
    acc[format] = (acc[format] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155'
          }
        }}
      />
      
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Otimizador Web de Imagens</h1>
                <p className="text-slate-400 text-sm">Comprima e converta imagens para JPG, PNG e WebP</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {images.length > 0 && (
                <div className="flex space-x-2">
                  {/* Download por formato */}
                  {Object.entries(formatCounts).map(([format, count]) => (
                    <button
                      key={format}
                      onClick={() => downloadByFormat(format.toLowerCase() as 'jpeg' | 'png' | 'webp')}
                      disabled={count === 0}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>{format} ({count})</span>
                    </button>
                  ))}
                  
                  <button
                    onClick={downloadAll}
                    disabled={completedCount === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Todas ({completedCount})</span>
                  </button>
                  
                  <button
                    onClick={resetForNewConversion}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  
                  <button
                    onClick={clearAll}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Limpar Tudo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Current Preset Info */}
      {currentPreset && (
        <div className="border-b border-slate-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <currentPreset.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Modo Ativo: {currentPreset.name}</h3>
                  <p className="text-slate-300 text-sm">{currentPreset.use_case}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-slate-300">
                  <span className="text-slate-400">Qualidade:</span> {Math.round(currentPreset.quality * 100)}%
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">Tamanho:</span> {currentPreset.maxWidth}×{currentPreset.maxHeight}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">Formato:</span> {currentPreset.format.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Format Summary */}
      {completedCount > 0 && (
        <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileImage className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Formatos Processados:</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                {Object.entries(formatCounts).map(([format, count]) => (
                  <div key={format} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      format === 'WEBP' ? 'bg-green-400' :
                      format === 'JPEG' || format === 'JPG' ? 'bg-blue-400' :
                      'bg-purple-400'
                    }`} />
                    <span className="text-slate-300">{format}: {count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Web Mode Selector */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Presets de Otimização Web</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(webPresets).map(([key, preset]) => {
                const IconComponent = preset.icon
                return (
                  <button
                    key={key}
                    onClick={() => handleWebModeChange(key as CompressionOptions['webMode'])}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      compressionOptions.webMode === key
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/20'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-center mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        compressionOptions.webMode === key
                          ? 'bg-blue-500/20'
                          : 'bg-slate-600/50'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          compressionOptions.webMode === key
                            ? 'text-blue-400'
                            : 'text-slate-400'
                        }`} />
                      </div>
                    </div>
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{preset.description}</div>
                    <div className="text-xs text-slate-500 mt-2">
                      {preset.maxWidth}×{preset.maxHeight} • {Math.round(preset.quality * 100)}% • {preset.format.toUpperCase()}
                    </div>
                    {compressionOptions.webMode === key && (
                      <div className="mt-2 text-xs text-blue-400 flex items-center justify-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Ativo</span>
                      </div>
                    )}
                  </button>
                )
              })}
              
              <button
                onClick={() => handleWebModeChange('custom')}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  compressionOptions.webMode === 'custom'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500'
                }`}
              >
                <div className="flex justify-center mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    compressionOptions.webMode === 'custom'
                      ? 'bg-purple-500/20'
                      : 'bg-slate-600/50'
                  }`}>
                    <Settings className={`w-6 h-6 ${
                      compressionOptions.webMode === 'custom'
                        ? 'text-purple-400'
                        : 'text-slate-400'
                    }`} />
                  </div>
                </div>
                <div className="font-medium text-sm">Personalizado</div>
                <div className="text-xs text-slate-400 mt-1">Configuração manual</div>
                <div className="text-xs text-slate-500 mt-2">
                  Controle total
                </div>
                {compressionOptions.webMode === 'custom' && (
                  <div className="mt-2 text-xs text-purple-400 flex items-center justify-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Ativo</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel - Aparece apenas no modo personalizado */}
      <AnimatePresence>
        {compressionOptions.webMode === 'custom' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <CompressionSettings
                options={compressionOptions}
                onChange={setCompressionOptions}
                isWebMode={compressionOptions.webMode !== 'custom'}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileImage className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total de Imagens</p>
                  <p className="text-white text-xl font-semibold">{images.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Convertidas</p>
                  <p className="text-white text-xl font-semibold">{completedCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Economia Total</p>
                  <p className="text-white text-xl font-semibold">{totalSavings}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Formato Ativo</p>
                  <p className="text-white text-xl font-semibold">
                    {compressionOptions.format.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Area */}
        {images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ImageUploader onImagesAdded={handleImagesAdded} />
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <ProgressBar
              images={images}
              isCompressing={isCompressing}
              setIsCompressing={setIsCompressing}
              compressionOptions={compressionOptions}
              onCompressionStart={handleCompressionStart}
              onCompressionComplete={handleCompressionComplete}
              onCompressionError={handleCompressionError}
            />

            {/* Add More Images */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ImageUploader onImagesAdded={handleImagesAdded} compact />
            </motion.div>

            {/* Images Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {images.map((image) => (
                <ImagePreview
                  key={image.id}
                  image={image}
                  onRemove={handleRemoveImage}
                  onDownload={() => downloadSingle(image)}
                />
              ))}
            </motion.div>
          </div>
        )}

        {/* Última Conversão Salva */}
        {lastConvertedImage && images.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 border-t border-slate-700/50 pt-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Última Conversão</h3>
              <span className="text-slate-400 text-sm">
                {lastConvertedImage.outputFormat?.toUpperCase()} • 
                {lastConvertedImage.compressionRatio}% economia
              </span>
            </div>
            
            <div className="max-w-md">
              <ImagePreview
                image={lastConvertedImage}
                onRemove={() => setLastConvertedImage(null)}
                onDownload={() => downloadSingle(lastConvertedImage)}
              />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default App

    