import React, { FC, useRef, useState, useEffect } from 'react'
import { Retool } from '@tryretool/custom-component-support'
import { QRCodeCanvas } from 'qrcode.react'
import styles from './QRCodeGenerator.module.css'

type ErrorLevel = 'L' | 'M' | 'Q' | 'H'

/* ── Icons ── */

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1h6A1.5 1.5 0 0 1 13 2.5v6A1.5 1.5 0 0 1 11.5 10H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ── Component ── */

export const QRCodeGenerator: FC = () => {
  Retool.useComponentSettings({ defaultWidth: 280, defaultHeight: 380 })

  /* ── Inputs ── */

  const [value] = Retool.useStateString({
    name: 'value',
    label: 'Value',
    description: 'Text or URL to encode in the QR code',
    initialValue: 'https://retool.com',
  })

  const [size] = Retool.useStateNumber({
    name: 'size',
    label: 'Size (px)',
    description: 'Width and height of the QR code in pixels',
    initialValue: 200,
  })

  const [fgColor] = Retool.useStateString({
    name: 'fgColor',
    label: 'Foreground color',
    description: 'QR code dot color (hex)',
    initialValue: '#000000',
  })

  const [bgColor] = Retool.useStateString({
    name: 'bgColor',
    label: 'Background color',
    description: 'QR code background color (hex)',
    initialValue: '#FFFFFF',
  })

  const [errorLevel] = Retool.useStateString({
    name: 'errorLevel',
    label: 'Error correction',
    description: 'L = 7%, M = 15%, Q = 25%, H = 30%. Use H when embedding a logo.',
    initialValue: 'M',
  })

  const [logoUrl] = Retool.useStateString({
    name: 'logoUrl',
    label: 'Logo URL',
    description: 'Optional image URL to embed in the center of the QR code',
    initialValue: '',
  })

  const [logoSize] = Retool.useStateNumber({
    name: 'logoSize',
    label: 'Logo size (%)',
    description: 'Logo width as a percentage of the QR code size (5–30). Ignored if no logo URL.',
    initialValue: 20,
  })

  const [title] = Retool.useStateString({
    name: 'title',
    label: 'Title',
    description: 'Label shown below the QR code',
    initialValue: '',
  })

  /* ── Outputs ── */

  const [, setDataUrl] = Retool.useStateString({
    name: 'dataUrl',
    label: 'Data URL',
    description: 'QR code as a PNG data URL — use in Image components or store in a DB column',
    initialValue: '',
  })

  /* ── Events ── */

  const onDownload = Retool.useEventCallback({ name: 'download' })
  const onCopy = Retool.useEventCallback({ name: 'copy' })

  /* ── Derived values ── */

  const safeValue = value?.trim() || 'https://retool.com'
  const safeSize = Math.max(64, Math.min(512, size || 200))
  const safeErrorLevel = (['L', 'M', 'Q', 'H'].includes((errorLevel || '').toUpperCase())
    ? errorLevel.toUpperCase()
    : 'M') as ErrorLevel
  const safeLogoSize = Math.max(5, Math.min(30, logoSize || 20))
  const logoPixels = Math.round(safeSize * (safeLogoSize / 100))

  /* ── Local state ── */

  const canvasRef = useRef<HTMLDivElement>(null)
  // localDataUrl drives the download <a> href — updated whenever QR changes
  const [localDataUrl, setLocalDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  const downloadFilename = `qr-${safeValue.slice(0, 40).replace(/[^a-z0-9]/gi, '-')}.png`

  /* ── Sync data URL whenever QR changes ── */

  useEffect(() => {
    const timeout = setTimeout(() => {
      const canvas = canvasRef.current?.querySelector('canvas')
      if (!canvas) return
      try {
        const url = canvas.toDataURL('image/png')
        setLocalDataUrl(url)
        setDataUrl(url)
      } catch {
        // Cross-origin logo blocks toDataURL — leave previous value
      }
    }, 120)
    return () => clearTimeout(timeout)
  }, [safeValue, safeSize, fgColor, bgColor, safeErrorLevel, logoUrl, safeLogoSize, setDataUrl])

  /* ── Copy value text to clipboard ── */
  // Copying image data requires ClipboardItem which is blocked in iframes.
  // Copying the encoded text is more reliable and just as useful.

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(safeValue)
      setCopied(true)
      setCopyError(false)
      onCopy()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError(true)
      setTimeout(() => setCopyError(false), 2000)
    }
  }

  /* ── Logo image settings ── */

  const imageSettings = logoUrl?.trim()
    ? { src: logoUrl.trim(), height: logoPixels, width: logoPixels, excavate: true }
    : undefined

  /* ── Render ── */

  return (
    <div className={styles.root}>
      <div className={styles.card}>

        {/* QR Code canvas */}
        <div className={styles.qrWrap} ref={canvasRef}>
          <QRCodeCanvas
            value={safeValue}
            size={safeSize}
            fgColor={fgColor || '#000000'}
            bgColor={bgColor || '#FFFFFF'}
            level={safeErrorLevel}
            imageSettings={imageSettings}
            style={{ display: 'block' }}
          />
        </div>

        {/* Title */}
        {title?.trim() && (
          <div className={styles.title}>{title.trim()}</div>
        )}

        {/* Encoded value preview */}
        <div className={styles.valuePreview} title={safeValue}>
          {safeValue}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Real <a> tag — direct user click on anchor works in iframes, programmatic .click() does not */}
          <a
            className={styles.btn}
            href={localDataUrl || undefined}
            download={downloadFilename}
            onClick={() => { if (localDataUrl) onDownload() }}
            aria-disabled={!localDataUrl}
          >
            <DownloadIcon />
            Download PNG
          </a>

          <button
            className={`${styles.btn} ${copied ? styles.btnSuccess : ''} ${copyError ? styles.btnError : ''}`}
            onClick={handleCopy}
            title="Copy encoded value to clipboard"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied!' : copyError ? 'Failed' : 'Copy value'}
          </button>
        </div>

      </div>
    </div>
  )
}
