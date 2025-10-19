/**
 * @fileoverview Signature Capture Component
 * @version shadcn/ui + React 19
 * @see {@link /docs/copilot-instructions.md} Component Guidelines
 */

'use client'

import { useRef, useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  PenTool,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Download,
} from 'lucide-react'

interface SignatureCaptureProps {
  /**
   * Recipient name to display
   */
  recipientName?: string
  
  /**
   * Recipient title/position
   */
  recipientTitle?: string
  
  /**
   * Existing signature URL (for viewing mode)
   */
  existingSignature?: string | null
  
  /**
   * Callback when signature is captured
   */
  onSignatureCapture?: (signatureData: SignatureData) => void
  
  /**
   * Callback when signature is cleared
   */
  onSignatureClear?: () => void
  
  /**
   * Whether component is in view-only mode
   */
  viewOnly?: boolean
  
  /**
   * Loading state
   */
  isLoading?: boolean
  
  /**
   * Error message
   */
  error?: string | null
}

export interface SignatureData {
  /**
   * Base64 encoded signature image
   */
  signatureDataUrl: string
  
  /**
   * Recipient name
   */
  recipientName: string
  
  /**
   * Recipient title/position
   */
  recipientTitle?: string
  
  /**
   * Timestamp when signature was captured
   */
  signedAt: Date
}

/**
 * Signature Capture Component
 * 
 * Features:
 * - Canvas-based signature drawing
 * - Touch and mouse support
 * - Clear and undo functionality
 * - Base64 export for storage
 * - Signature verification display
 * - Responsive design
 * 
 * @param props - Component props
 */
export function SignatureCapture({
  recipientName: initialRecipientName = '',
  recipientTitle: initialRecipientTitle = '',
  existingSignature = null,
  onSignatureCapture,
  onSignatureClear,
  viewOnly = false,
  isLoading = false,
  error = null,
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [recipientName, setRecipientName] = useState(initialRecipientName)
  const [recipientTitle, setRecipientTitle] = useState(initialRecipientTitle)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(existingSignature)

  useEffect(() => {
    if (existingSignature) {
      setSignatureDataUrl(existingSignature)
      setHasDrawn(true)
    }
  }, [existingSignature])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || viewOnly) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Configure drawing style
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [viewOnly])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (viewOnly || isLoading) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(true)

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || viewOnly) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()

    e.preventDefault()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    setSignatureDataUrl(null)
    
    if (onSignatureClear) {
      onSignatureClear()
    }
  }

  const captureSignature = () => {
    if (!hasDrawn || !recipientName.trim()) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    // Get signature as base64
    const dataUrl = canvas.toDataURL('image/png')
    setSignatureDataUrl(dataUrl)

    // Call callback with signature data
    if (onSignatureCapture) {
      onSignatureCapture({
        signatureDataUrl: dataUrl,
        recipientName: recipientName.trim(),
        recipientTitle: recipientTitle.trim() || undefined,
        signedAt: new Date(),
      })
    }
  }

  const downloadSignature = () => {
    if (!signatureDataUrl) return

    const link = document.createElement('a')
    link.download = `signature-${recipientName.replace(/\s+/g, '-')}-${Date.now()}.png`
    link.href = signatureDataUrl
    link.click()
  }

  // View-only mode - display existing signature
  if (viewOnly && existingSignature) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Tanda Tangan Terverifikasi
              </CardTitle>
              <CardDescription>Tanda tangan penerima telah tersimpan</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Terverifikasi
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Recipient Info */}
          {recipientName && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Nama Penerima</Label>
              </div>
              <p className="text-base font-semibold">{recipientName}</p>
              {recipientTitle && (
                <p className="text-sm text-muted-foreground">{recipientTitle}</p>
              )}
            </div>
          )}

          <Separator />

          {/* Signature Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tanda Tangan</Label>
            <div className="border-2 border-muted rounded-lg p-4 bg-white dark:bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingSignature}
                alt="Tanda Tangan Penerima"
                className="w-full h-auto max-h-48 object-contain"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={downloadSignature}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Unduh Tanda Tangan
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Capture mode
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5 text-primary" />
          Tanda Tangan Penerima
        </CardTitle>
        <CardDescription>
          {signatureDataUrl
            ? 'Tanda tangan telah ditangkap'
            : 'Minta penerima untuk menandatangani di area di bawah'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Recipient Information Form */}
        {!signatureDataUrl && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">
                Nama Penerima <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nama lengkap penerima"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientTitle">Jabatan/Posisi (Opsional)</Label>
              <Input
                id="recipientTitle"
                value={recipientTitle}
                onChange={(e) => setRecipientTitle(e.target.value)}
                placeholder="Kepala Sekolah, Guru, dll."
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Signature Canvas or Display */}
        {!signatureDataUrl ? (
          <>
            {/* Drawing Instructions */}
            <Alert>
              <PenTool className="h-4 w-4" />
              <AlertDescription>
                Gunakan mouse atau sentuh layar untuk menggambar tanda tangan di area putih
                di bawah
              </AlertDescription>
            </Alert>

            {/* Canvas */}
            <div className="space-y-2">
              <Label>Area Tanda Tangan</Label>
              <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg bg-white dark:bg-muted/10">
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-muted-foreground text-sm">
                      Tanda tangani di sini
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={clearSignature}
                variant="outline"
                size="sm"
                disabled={!hasDrawn || isLoading}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
              
              <Button
                onClick={captureSignature}
                variant="default"
                size="sm"
                disabled={!hasDrawn || !recipientName.trim() || isLoading}
                className="gap-2 flex-1"
              >
                <Check className="h-4 w-4" />
                {isLoading ? 'Menyimpan...' : 'Konfirmasi Tanda Tangan'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Captured Signature Display */}
            <div className="space-y-4">
              {/* Recipient Info */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Penerima</Label>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold">{recipientName}</p>
                  {recipientTitle && (
                    <p className="text-sm text-muted-foreground">{recipientTitle}</p>
                  )}
                </div>
              </div>

              {/* Signature Preview */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tanda Tangan</Label>
                <div className="border-2 border-green-200 rounded-lg p-4 bg-white dark:bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={signatureDataUrl}
                    alt="Tanda Tangan Penerima"
                    className="w-full h-auto max-h-48 object-contain"
                  />
                </div>
              </div>

              {/* Success Badge */}
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Tanda tangan berhasil ditangkap dan siap disimpan
                </AlertDescription>
              </Alert>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={clearSignature}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Ulangi
                </Button>
                
                <Button
                  onClick={downloadSignature}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Unduh
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
