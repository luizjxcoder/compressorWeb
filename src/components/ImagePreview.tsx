
import React from 'react'
import { motion } from 'framer-motion'
import {X, Download, FileImage, Loader, AlertCircle, Check} from 'lucide-react'
import { ImageFile } from '../App'

interface ImagePreviewProps {
  image: ImageFile
  onRemove: (id: string) => void
  onDownload?: (image: ImageFile) => void
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onRemove, onDownload }) => {
  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusIcon = () => {
    switch (image.status) {
      case 'pending':
        return <FileImage className="w-4 h-4 text-slate-400" />
      case 'compressing':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />
      case 'completed':
        return <Check className="w-4 h-4 text-green-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <FileImage className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = () => {
    switch (image.status) {
      case 'pending':
        return 'border-slate-600'
      case 'compressing':
        return 'border-blue-500 shadow-lg shadow-blue-500/20'
      case 'completed':
        return 'border-green-500 shadow-lg shadow-green-500/20'
      case 'error':
        return 'border-red-500 shadow-lg shadow-red-500/20'
      default:
        return 'border-slate-600'
    }
  }

  const getFormatBadgeColor = (format: string) => {
    switch (format?.toLowerCase()) {
      case 'webp':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'jpeg':
      case 'jpg':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'png':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border transition-all duration-200 overflow-hidden ${getStatusColor()}`}
    >
      {/* Image Preview */}
      <div className="relative aspect-video bg-slate-900/50">
        <img
          src={image.preview}
          alt={image.file.name}
          className="w-full h-full object-cover"
        />
        
        {/* Status Overlay */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
            {getStatusIcon()}
            <span className="text-xs text-white capitalize">{image.status}</span>
          </div>
          
          {image.outputFormat && (
            <div className={`backdrop-blur-sm rounded-lg px-2 py-1 border text-xs font-medium ${getFormatBadgeColor(image.outputFormat)}`}>
              {image.outputFormat.toUpperCase()}
            </div>
          )}
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-3 right-3 w-8 h-8 bg-red-600/80 hover:bg-red-600 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Download Button */}
        {image.status === 'completed' && onDownload && (
          <button
            onClick={() => onDownload(image)}
            className="absolute bottom-3 right-3 w-8 h-8 bg-green-600/80 hover:bg-green-600 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Compression Progress */}
        {image.status === 'compressing' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-medium text-sm truncate" title={image.file.name}>
            {image.file.name}
          </h3>
          <p className="text-slate-400 text-xs">
            {formatSize(image.originalSize)}
            {image.compressedSize && (
              <>
                {' → '}
                <span className="text-green-400">{formatSize(image.compressedSize)}</span>
              </>
            )}
          </p>
        </div>

        {/* Compression Stats */}
        {image.status === 'completed' && image.compressionRatio && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-xs font-medium">
                {image.compressionRatio}% economia
              </span>
            </div>
            
            {image.outputFormat && (
              <div className={`px-2 py-1 rounded border text-xs font-medium ${getFormatBadgeColor(image.outputFormat)}`}>
                {image.outputFormat.toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {image.status === 'error' && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-xs">Erro na compressão</span>
          </div>
        )}

        {/* Processing Message */}
        {image.status === 'compressing' && (
          <div className="flex items-center space-x-2">
            <Loader className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="text-blue-400 text-xs">Processando...</span>
          </div>
        )}

        {/* Download Button (Full Width) */}
        {image.status === 'completed' && onDownload && (
          <button
            onClick={() => onDownload(image)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Baixar {image.outputFormat?.toUpperCase() || 'Imagem'}</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default ImagePreview
