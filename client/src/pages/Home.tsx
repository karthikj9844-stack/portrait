import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Download, Zap, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  convertImageToVectorPortrait,
  downloadImage,
} from '@/lib/convert'

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [vectorImage, setVectorImage] = useState<Blob | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [sobelThreshold, setSobelThreshold] = useState(50)
  const [posterizeLevels, setPosterizeLevels] = useState(4)
  const [contrastIntensity, setContrastIntensity] = useState(1.8)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string)
      setVectorImage(null)
      toast.success('Image loaded successfully!')
    }
    reader.readAsDataURL(file)
  }

  const handleConvert = async () => {
    if (!originalImage) {
      toast.error('Please upload an image first')
      return
    }

    setIsConverting(true)
    try {
      const blob = await fetch(originalImage)
        .then((res) => res.blob())

      const file = new File([blob], 'image.png', { type: 'image/png' })

      const vectorBlob = await convertImageToVectorPortrait(file, {
        sobelThreshold,
        posterizeLevels,
        contrastIntensity,
      })

      const reader = new FileReader()
      reader.onload = (e) => {
        setVectorImage(vectorBlob)
        toast.success('Conversion complete!')
      }
      reader.readAsDataURL(vectorBlob)
    } catch (error) {
      console.error('Conversion failed:', error)
      toast.error('Conversion failed. Please try again.')
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (!vectorImage) return
    const timestamp = new Date().toISOString().slice(0, 10)
    downloadImage(vectorImage, `vector-portrait-${timestamp}.png`)
    toast.success('Image downloaded!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper to-white flex flex-col">
      {/* Header */}
      <header className="bg-ink text-paper py-8 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
              <Zap size={40} className="text-yellow-300" />
              Vector Portrait Converter
            </h1>
            <p className="text-lg text-gray-300">
              Transform your photos into bold, minimalist vector-style portraits. No server. No
              login. No fees. 100% in your browser.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Upload & Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-ink hover:bg-gray-50 ${
                originalImage ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload size={48} className="mx-auto mb-3 text-gray-500" />
              <p className="text-lg font-semibold text-ink mb-1">
                {originalImage ? '✓ Image loaded' : 'Upload your photo'}
              </p>
              <p className="text-sm text-gray-600">
                Click to select an image or drag and drop
              </p>
            </div>

            {/* Controls */}
            {originalImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-md space-y-6 border border-gray-200"
              >
                <h3 className="font-bold text-lg text-ink">Conversion Settings</h3>

                {/* Sobel Threshold */}
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Edge Detection Sensitivity: {sobelThreshold}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={sobelThreshold}
                    onChange={(e) => setSobelThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-600 mt-1">Lower = more details, Higher = bolder lines</p>
                </div>

                {/* Posterize Levels */}
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Color Levels: {posterizeLevels}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={posterizeLevels}
                    onChange={(e) => setPosterizeLevels(Number(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-600 mt-1">Controls the number of color bands</p>
                </div>

                {/* Contrast Intensity */}
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Contrast: {contrastIntensity.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={contrastIntensity}
                    onChange={(e) => setContrastIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-600 mt-1">Higher contrast = more dramatic effect</p>
                </div>

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                    isConverting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-ink text-paper hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  {isConverting ? 'Converting...' : '✨ Convert to Vector'}
                </button>
              </motion.div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How it works</p>
                <p>Your image is processed entirely in your browser using canvas-based algorithms (Sobel edge detection + posterization). Nothing is uploaded anywhere.</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Original Image Preview */}
            {originalImage && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-ink">Original</p>
                </div>
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Vector Image Preview */}
            {vectorImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-green-300 border-2"
              >
                <div className="bg-green-50 px-4 py-2 border-b border-green-200 flex justify-between items-center">
                  <p className="text-sm font-semibold text-ink">✓ Vector Portrait</p>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-ink text-paper px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all active:scale-95"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
                <div className="aspect-square bg-paper flex items-center justify-center overflow-hidden">
                  <img
                    src={URL.createObjectURL(vectorImage)}
                    alt="Vector Portrait"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 aspect-square flex flex-col items-center justify-center text-center p-6">
                <Zap size={48} className="text-gray-300 mb-3" />
                <p className="text-gray-600">
                  {originalImage ? 'Click "Convert to Vector" to see the magic happen!' : 'Upload an image to get started'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ink text-paper py-6 px-4 mt-12">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-400">
          <p>
            Built with React, Vite & Canvas. Entirely client-side. No tracking. MIT License.
          </p>
        </div>
      </footer>
    </div>
  )
}
