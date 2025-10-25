
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import {Upload, Image, Plus} from 'lucide-react'
import toast from 'react-hot-toast'
import { ImageFile } from '../App'

interface ImageUploaderProps {
  onImagesAdded: (images: ImageFile[]) => void
  compact?: boolean
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesAdded, compact = false }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles: ImageFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      originalSize: file.size,
      preview: URL.createObjectURL(file),
      status: 'pending' as const
    }))

    onImagesAdded(imageFiles)
    toast.success(`${acceptedFiles.length} imagem(ns) adicionada(s)`)
  }, [onImagesAdded])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: (fileRejections) => {
      fileRejections.forEach(rejection => {
        const { file, errors } = rejection
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name} é muito grande. Máximo 50MB.`)
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} não é um tipo de imagem válido.`)
          }
        })
      })
    }
  })

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...getRootProps()}
        className={`
          relative cursor-pointer border-2 border-dashed rounded-xl p-6 transition-all duration-300
          ${isDragActive && !isDragReject 
            ? 'border-blue-400 bg-blue-500/10' 
            : isDragReject 
            ? 'border-red-400 bg-red-500/10'
            : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Plus className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-white font-medium">Adicionar mais imagens</p>
            <p className="text-slate-400 text-sm">Arraste ou clique para selecionar</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...getRootProps()}
      className={`
        relative cursor-pointer border-2 border-dashed rounded-2xl p-12 transition-all duration-300
        ${isDragActive && !isDragReject 
          ? 'border-blue-400 bg-blue-500/10 scale-105' 
          : isDragReject 
          ? 'border-red-400 bg-red-500/10'
          : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="text-center space-y-6">
        <motion.div
          animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
        >
          {isDragActive ? (
            <Upload className="w-10 h-10 text-white" />
          ) : (
            <Image className="w-10 h-10 text-white" />
          )}
        </motion.div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {isDragActive 
              ? 'Solte as imagens aqui...' 
              : 'Arraste suas imagens ou clique para selecionar'
            }
          </h3>
          <p className="text-slate-400">
            Suporta JPEG, PNG, GIF, WebP, BMP, TIFF • Máximo 50MB por arquivo
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 bg-slate-700 rounded">JPG</span>
          <span className="px-2 py-1 bg-slate-700 rounded">PNG</span>
          <span className="px-2 py-1 bg-slate-700 rounded">GIF</span>
          <span className="px-2 py-1 bg-slate-700 rounded">WebP</span>
          <span className="px-2 py-1 bg-slate-700 rounded">BMP</span>
          <span className="px-2 py-1 bg-slate-700 rounded">TIFF</span>
        </div>
      </div>

      {isDragReject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-2xl"
        >
          <p className="text-red-400 font-medium">Tipo de arquivo não suportado</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ImageUploader
