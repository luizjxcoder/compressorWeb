
import React from 'react'
import { motion } from 'framer-motion'
import { CompressionOptions } from '../App'
import {Info, Globe, Zap, Target, Image as ImageIcon, Layers} from 'lucide-react'

interface CompressionSettingsProps {
  options: CompressionOptions
  onChange: (options: CompressionOptions) => void
  isWebMode?: boolean
}

const CompressionSettings: React.FC<CompressionSettingsProps> = ({ 
  options, 
  onChange, 
  isWebMode = false 
}) => {
  const handleQualityChange = (value: number) => {
    onChange({ ...options, quality: value / 100 })
  }

  const handleMaxWidthChange = (value: number) => {
    onChange({ ...options, maxWidth: value })
  }

  const handleMaxHeightChange = (value: number) => {
    onChange({ ...options, maxHeight: value })
  }

  const handleFormatChange = (format: CompressionOptions['format']) => {
    onChange({ ...options, format })
  }

  const getWebOptimizationTip = () => {
    if (options.webMode === 'hero') {
      return "Imagens hero devem ter alta qualidade mas serem otimizadas para carregamento rápido"
    } else if (options.webMode === 'thumbnail') {
      return "Miniaturas podem ter compressão maior para acelerar galerias"
    } else if (options.webMode === 'gallery') {
      return "Imagens de galeria precisam equilibrar qualidade visual e performance"
    } else if (options.webMode === 'background') {
      return "Backgrounds podem ser mais comprimidos sem perder impacto visual"
    }
    return "Configure manualmente para suas necessidades específicas"
  }

  const getOptimizationLevel = () => {
    const quality = options.quality
    const maxDimension = Math.max(options.maxWidth, options.maxHeight)
    
    if (quality >= 0.9 && maxDimension >= 1920) return { level: 'Baixa', color: 'red', icon: '🔴' }
    if (quality >= 0.8 && maxDimension >= 1200) return { level: 'Moderada', color: 'yellow', icon: '🟡' }
    if (quality >= 0.7 && maxDimension >= 800) return { level: 'Alta', color: 'green', icon: '🟢' }
    return { level: 'Máxima', color: 'blue', icon: '🔵' }
  }

  const getEstimatedSavings = () => {
    const baseReduction = options.format === 'webp' ? 0.6 : 
                         options.format === 'jpeg' ? 0.4 : 0.3
    const qualityFactor = 1 - options.quality
    const sizeFactor = options.maxWidth < 1200 ? 0.3 : 0.1
    
    return Math.round((baseReduction + qualityFactor * 0.3 + sizeFactor) * 100)
  }

  const optimization = getOptimizationLevel()
  const estimatedSavings = getEstimatedSavings()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white mb-4">
          {isWebMode ? 'Configurações Web Otimizadas' : 'Configurações Personalizadas'}
        </h3>
        {isWebMode && (
          <div className="flex items-center space-x-2 text-blue-400">
            <Globe className="w-4 h-4" />
            <span className="text-sm">Modo Web Ativo</span>
          </div>
        )}
      </div>

      {/* Optimization Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-4 border border-slate-600/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{optimization.icon}</div>
            <div>
              <h4 className="text-white font-medium">Nível de Otimização: {optimization.level}</h4>
              <p className="text-slate-400 text-sm">Economia estimada: ~{estimatedSavings}% do tamanho original</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">{estimatedSavings}%</span>
          </div>
        </div>
      </motion.div>

      {/* Web Optimization Tip */}
      {options.webMode !== 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-300 font-medium text-sm">Otimização Web Ativa</h4>
              <p className="text-blue-200 text-sm mt-1">{getWebOptimizationTip()}</p>
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Quality */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Qualidade: {Math.round(options.quality * 100)}%</span>
            </div>
            {isWebMode && (
              <span className="ml-2 text-xs text-blue-400">(Otimizado para {options.webMode})</span>
            )}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={Math.round(options.quality * 100)}
            onChange={(e) => handleQualityChange(parseInt(e.target.value))}
            disabled={isWebMode && options.webMode !== 'custom'}
            className={`w-full h-3 rounded-lg appearance-none cursor-pointer slider ${
              isWebMode && options.webMode !== 'custom' ? 'bg-blue-700/50' : 'bg-slate-700'
            }`}
            style={{
              background: isWebMode && options.webMode !== 'custom' 
                ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${options.quality * 100}%, #475569 ${options.quality * 100}%, #475569 100%)`
                : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${options.quality * 100}%, #475569 ${options.quality * 100}%, #475569 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Menor tamanho</span>
            <span>Melhor qualidade</span>
          </div>
          {isWebMode && options.webMode !== 'custom' && (
            <p className="text-xs text-blue-400 flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Configuração web otimizada</span>
            </p>
          )}
        </div>

        {/* Max Width */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>Largura Máxima: {options.maxWidth}px</span>
            </div>
            {isWebMode && options.webMode !== 'custom' && (
              <span className="ml-2 text-xs text-blue-400">(Web Otimizado)</span>
            )}
          </label>
          <input
            type="range"
            min="320"
            max="4096"
            step="32"
            value={options.maxWidth}
            onChange={(e) => handleMaxWidthChange(parseInt(e.target.value))}
            disabled={isWebMode && options.webMode !== 'custom'}
            className={`w-full h-3 rounded-lg appearance-none cursor-pointer slider ${
              isWebMode && options.webMode !== 'custom' ? 'bg-blue-700/50' : 'bg-slate-700'
            }`}
            style={{
              background: isWebMode && options.webMode !== 'custom'
                ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((options.maxWidth - 320) / (4096 - 320)) * 100}%, #475569 ${((options.maxWidth - 320) / (4096 - 320)) * 100}%, #475569 100%)`
                : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((options.maxWidth - 320) / (4096 - 320)) * 100}%, #475569 ${((options.maxWidth - 320) / (4096 - 320)) * 100}%, #475569 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>320px</span>
            <span>4096px</span>
          </div>
        </div>

        {/* Max Height */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 rotate-90" />
              <span>Altura Máxima: {options.maxHeight}px</span>
            </div>
            {isWebMode && options.webMode !== 'custom' && (
              <span className="ml-2 text-xs text-blue-400">(Web Otimizado)</span>
            )}
          </label>
          <input
            type="range"
            min="240"
            max="4096"
            step="32"
            value={options.maxHeight}
            onChange={(e) => handleMaxHeightChange(parseInt(e.target.value))}
            disabled={isWebMode && options.webMode !== 'custom'}
            className={`w-full h-3 rounded-lg appearance-none cursor-pointer slider ${
              isWebMode && options.webMode !== 'custom' ? 'bg-blue-700/50' : 'bg-slate-700'
            }`}
            style={{
              background: isWebMode && options.webMode !== 'custom'
                ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((options.maxHeight - 240) / (4096 - 240)) * 100}%, #475569 ${((options.maxHeight - 240) / (4096 - 240)) * 100}%, #475569 100%)`
                : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((options.maxHeight - 240) / (4096 - 240)) * 100}%, #475569 ${((options.maxHeight - 240) / (4096 - 240)) * 100}%, #475569 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>240px</span>
            <span>4096px</span>
          </div>
        </div>

        {/* Format */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>Formato de Saída</span>
            </div>
            {isWebMode && options.webMode !== 'custom' && (
              <span className="ml-2 text-xs text-blue-400">(Web Otimizado)</span>
            )}
          </label>
          <select
            value={options.format}
            onChange={(e) => handleFormatChange(e.target.value as CompressionOptions['format'])}
            disabled={isWebMode && options.webMode !== 'custom'}
            className={`w-full px-3 py-2 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              isWebMode && options.webMode !== 'custom'
                ? 'bg-blue-700/50 border-blue-600 cursor-not-allowed' 
                : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
            }`}
          >
            <option value="original">Original</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
          <p className="text-xs text-slate-500">
            {options.format === 'webp' ? (
              <span className="text-green-400 flex items-center space-x-1">
                <span>✓</span>
                <span>Melhor compressão para web</span>
              </span>
            ) : options.format === 'jpeg' ? (
              <span className="text-yellow-400 flex items-center space-x-1">
                <span>⚡</span>
                <span>Boa compatibilidade</span>
              </span>
            ) : (
              'WebP oferece melhor compressão'
            )}
          </p>
        </div>
      </div>

      {/* Web Performance Metrics */}
      {isWebMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50"
        >
          <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Métricas de Performance Web</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400">Redução de Tamanho</p>
              <p className="text-white font-medium text-lg">
                {options.format === 'webp' ? '~60-80%' : 
                 options.format === 'jpeg' ? '~40-60%' : 
                 '~30-50%'}
              </p>
              <p className="text-xs text-slate-500 mt-1">vs original</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400">Tempo de Carregamento</p>
              <p className={`font-medium text-lg ${
                options.maxWidth <= 800 ? 'text-green-400' :
                options.maxWidth <= 1200 ? 'text-yellow-400' : 'text-orange-400'
              }`}>
                {options.maxWidth <= 800 ? 'Muito Rápido' :
                 options.maxWidth <= 1200 ? 'Rápido' : 'Moderado'}
              </p>
              <p className="text-xs text-slate-500 mt-1">em 3G/4G</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400">Compatibilidade</p>
              <p className="text-blue-400 font-medium text-lg">
                {options.format === 'webp' ? '95%+' :
                 options.format === 'jpeg' ? '100%' :
                 '100%'}
              </p>
              <p className="text-xs text-slate-500 mt-1">dos navegadores</p>
            </div>
          </div>
        </motion.div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: ${isWebMode && options.webMode !== 'custom' ? '#3b82f6' : '#3b82f6'};
          cursor: pointer;
          box-shadow: 0 0 0 3px #1e293b, 0 2px 6px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 3px #1e293b, 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: ${isWebMode && options.webMode !== 'custom' ? '#3b82f6' : '#3b82f6'};
          cursor: pointer;
          border: 3px solid #1e293b;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        .slider:disabled::-webkit-slider-thumb {
          background: #64748b;
          cursor: not-allowed;
          transform: none;
        }
        
        .slider:disabled::-moz-range-thumb {
          background: #64748b;
          cursor: not-allowed;
        }

        .slider::-webkit-slider-track {
          height: 12px;
          border-radius: 6px;
        }

        .slider::-moz-range-track {
          height: 12px;
          border-radius: 6px;
        }
      `}</style>
    </motion.div>
  )
}

export default CompressionSettings
