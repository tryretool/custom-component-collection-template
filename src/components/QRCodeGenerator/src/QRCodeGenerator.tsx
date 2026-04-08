import React, { FC, useRef, useState, useEffect, useCallback } from 'react'
import { Retool } from '@tryretool/custom-component-support'
import QRCodeStyling from 'qr-code-styling'
import styles from './QRCodeGenerator.module.css'

// ── Types ──────────────────────────────────────────────────────────────────

type DotShape = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded'
type BorderOpt = 'none' | 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted'

// ── Shape options ──────────────────────────────────────────────────────────

const SHAPES: { type: DotShape; label: string; icon: React.ReactNode }[] = [
  {
    type: 'square', label: 'Square',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22">
        {[0,7,14].map(r => [0,7,14].map(c =>
          <rect key={`${r}-${c}`} x={c+1} y={r+1} width="5" height="5" rx="0" fill="currentColor" />
        ))}
      </svg>
    ),
  },
  {
    type: 'dots', label: 'Dots',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22">
        {[0,7,14].map(r => [0,7,14].map(c =>
          <circle key={`${r}-${c}`} cx={c+3.5} cy={r+3.5} r="2.5" fill="currentColor" />
        ))}
      </svg>
    ),
  },
  {
    type: 'rounded', label: 'Rounded',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22">
        {[0,7,14].map(r => [0,7,14].map(c =>
          <rect key={`${r}-${c}`} x={c+1} y={r+1} width="5" height="5" rx="1.5" fill="currentColor" />
        ))}
      </svg>
    ),
  },
  {
    type: 'extra-rounded', label: 'Soft',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22">
        {[0,7,14].map(r => [0,7,14].map(c =>
          <rect key={`${r}-${c}`} x={c+1} y={r+1} width="5" height="5" rx="2.5" fill="currentColor" />
        ))}
      </svg>
    ),
  },
  {
    type: 'classy', label: 'Classy',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22">
        {[0,7,14].map(r => [0,7,14].map(c =>
          <path key={`${r}-${c}`} d={`M${c+1},${r+3} L${c+3},${r+1} L${c+6},${r+1} L${c+6},${r+6} L${c+1},${r+6} Z`} fill="currentColor" />
        ))}
      </svg>
    ),
  },
  {
    type: 'classy-rounded', label: 'Classy+',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22">
        {[0,7,14].map(r => [0,7,14].map(c =>
          <path key={`${r}-${c}`} d={`M${c+1},${r+3} L${c+3},${r+1} L${c+5},${r+1} Q${c+6},${r+1} ${c+6},${r+2} L${c+6},${r+5} Q${c+6},${r+6} ${c+5},${r+6} L${c+2},${r+6} Q${c+1},${r+6} ${c+1},${r+5} Z`} fill="currentColor" />
        ))}
      </svg>
    ),
  },
]

const BORDERS: { value: BorderOpt; label: string }[] = [
  { value: 'none',   label: 'None'   },
  { value: 'thin',   label: 'Thin'   },
  { value: 'medium', label: 'Medium' },
  { value: 'thick',  label: 'Thick'  },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
]

function borderCss(style: BorderOpt, color: string): string {
  if (style === 'none') return 'none'
  const width = style === 'thin' ? '1px' : style === 'thick' ? '4px' : '2px'
  const type  = style === 'dashed' ? 'dashed' : style === 'dotted' ? 'dotted' : 'solid'
  return `${width} ${type} ${color || '#e2e5e9'}`
}

// ── Icons ──────────────────────────────────────────────────────────────────

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ── Component ──────────────────────────────────────────────────────────────

export const QRCodeGenerator: FC = () => {
  Retool.useComponentSettings({ defaultWidth: 16, defaultHeight: 58 })

  // ── Inspector inputs ────────────────────────────────────────────────────

  const [value] = Retool.useStateString({
    name: 'value',
    label: 'Value',
    description: 'Text or URL to encode in the QR code',
    initialValue: 'https://retool.com',
  })

  const [title] = Retool.useStateString({
    name: 'title',
    label: 'Title',
    description: 'Label shown below the QR code',
    initialValue: '',
  })

  const [size] = Retool.useStateNumber({
    name: 'size',
    label: 'Size (px)',
    description: 'Width and height of the QR code in pixels',
    initialValue: 200,
  })

  const [fgColor, setFgColor] = Retool.useStateString({
    name: 'fgColor',
    label: 'Shape color',
    description: 'Color of the QR code dots/shapes',
    initialValue: '#000000',
  })

  const [bgColor, setBgColor] = Retool.useStateString({
    name: 'bgColor',
    label: 'Background color',
    description: 'Color of the light areas inside the QR code (not the component background)',
    initialValue: '#FFFFFF',
  })

  const [dotShape, setDotShape] = Retool.useStateEnumeration({
    name: 'dotShape',
    label: 'Dot shape',
    description: 'Style of the QR code dots',
    inspector: 'select',
    enumDefinition: ['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'],
    enumLabels: { square: 'Square', dots: 'Dots', rounded: 'Rounded', 'extra-rounded': 'Soft', classy: 'Classy', 'classy-rounded': 'Classy+' },
    initialValue: 'square',
  })

  const [borderStyle, setBorderStyle] = Retool.useStateEnumeration({
    name: 'borderStyle',
    label: 'Border style',
    description: 'Border style around the QR code component',
    inspector: 'select',
    enumDefinition: ['none', 'thin', 'medium', 'thick', 'dashed', 'dotted'],
    enumLabels: { none: 'None', thin: 'Thin', medium: 'Medium', thick: 'Thick', dashed: 'Dashed', dotted: 'Dotted' },
    initialValue: 'none',
  })

  const [borderColor, setBorderColor] = Retool.useStateString({
    name: 'borderColor',
    label: 'Border color',
    description: 'Color of the component border',
    initialValue: '#e2e5e9',
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
    description: 'Logo width as a percentage of the QR code size (5–30)',
    initialValue: 20,
  })

  const [errorLevel] = Retool.useStateString({
    name: 'errorLevel',
    label: 'Error correction',
    description: 'How much of the QR can be covered and still scan. L=7% M=15% Q=25% H=30%. Use H with a logo.',
    initialValue: 'M',
  })

  const [, setDataUrl] = Retool.useStateString({
    name: 'dataUrl',
    label: 'QR image (Data URL)',
    description: 'The QR code as a base64 PNG — connect to an Image component or save to a database',
    initialValue: '',
    inspector: 'hidden',
  })

  // ── Events ──────────────────────────────────────────────────────────────

  const onDownload = Retool.useEventCallback({ name: 'download' })

  // ── Refs & local state ───────────────────────────────────────────────────

  const qrRef      = useRef<HTMLDivElement>(null)
  const bodyRef    = useRef<HTMLDivElement>(null)
  const qrInstance = useRef<QRCodeStyling | null>(null)
  const [localDataUrl,  setLocalDataUrl]  = useState('')
  const [bodyHeight,    setBodyHeight]    = useState(400)

  // ── Derived values ───────────────────────────────────────────────────────

  const safeValue      = value?.trim()   || 'https://retool.com'
  const maxQRSize      = Math.max(64, bodyHeight - 120)   // leave room for controls below
  const safeSize       = Math.max(64, Math.min(maxQRSize, size || 200))
  const safeFg         = fgColor  || '#000000'
  const safeBg         = bgColor  || '#ffffff'
  const safeDotShape   = (dotShape  as DotShape)  || 'square'
  const safeBorderStyle= (borderStyle as BorderOpt) || 'none'
  const safeBorderColor= borderColor || '#e2e5e9'
  const safeLogoSize   = Math.max(5, Math.min(30, logoSize || 20)) / 100
  const safeErrorLevel = (['L','M','Q','H'].includes((errorLevel||'').toUpperCase())
    ? errorLevel.toUpperCase() : 'M') as 'L'|'M'|'Q'|'H'
  const downloadFilename = `qr-${safeValue.slice(0, 40).replace(/[^a-z0-9]/gi, '-')}`

  // ── QR code instance ────────────────────────────────────────────────────

  // Measure available body height so QR never overlaps the toolbar
  useEffect(() => {
    if (!bodyRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setBodyHeight(e.contentRect.height)
    })
    ro.observe(bodyRef.current)
    return () => ro.disconnect()
  }, [])

  const getOptions = () => ({
    width:  safeSize,
    height: safeSize,
    data:   safeValue,
    dotsOptions:            { color: safeFg, type: safeDotShape },
    backgroundOptions:      { color: safeBg },
    cornersSquareOptions:   { color: safeFg },
    cornersDotOptions:      { color: safeFg },
    qrOptions:              { errorCorrectionLevel: safeErrorLevel },
    ...(logoUrl?.trim() ? {
      image: logoUrl.trim(),
      imageOptions: { crossOrigin: 'anonymous' as const, imageSize: safeLogoSize, margin: 4 },
    } : {}),
  })

  // Initialize once
  useEffect(() => {
    if (!qrRef.current) return
    qrInstance.current = new QRCodeStyling(getOptions())
    qrInstance.current.append(qrRef.current)
  }, []) // eslint-disable-line

  // Update on option changes
  useEffect(() => {
    if (!qrInstance.current) return
    qrInstance.current.update(getOptions())
    const t = setTimeout(async () => {
      try {
        const blob = await qrInstance.current!.getRawData('png') as Blob
        if (!blob) return
        const reader = new FileReader()
        reader.onload = () => {
          const url = reader.result as string
          setLocalDataUrl(url)
          setDataUrl(url)
        }
        reader.readAsDataURL(blob)
      } catch { /* cross-origin logo may block */ }
    }, 150)
    return () => clearTimeout(t)
  }, [safeValue, safeSize, safeFg, safeBg, safeDotShape, logoUrl, safeLogoSize, safeErrorLevel, bodyHeight])

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleDownload = () => {
    qrInstance.current?.download({ name: downloadFilename, extension: 'png' })
    onDownload()
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.root}>

      {/* ── Top toolbar ── */}
      <div className={styles.toolbar}>

        {/* Shape selector */}
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Shape</span>
          <div className={styles.toolRow}>
            {SHAPES.map(s => (
              <button
                key={s.type}
                className={`${styles.shapeBtn} ${safeDotShape === s.type ? styles.shapeBtnActive : ''}`}
                title={s.label}
                onClick={() => setDotShape(s.type)}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.toolDivider} />

        {/* Border selector */}
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Border</span>
          <div className={styles.toolRow}>
            {BORDERS.map(b => (
              <button
                key={b.value}
                className={`${styles.borderBtn} ${safeBorderStyle === b.value ? styles.borderBtnActive : ''}`}
                onClick={() => setBorderStyle(b.value)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Body ── */}
      <div className={styles.body} ref={bodyRef}>

        {/* QR code — border applied here, around the code itself */}
        <div
          className={styles.qrWrap}
          ref={qrRef}
          style={{ border: borderCss(safeBorderStyle, safeBorderColor), borderRadius: 6 }}
        />

        {/* Title */}
        {title?.trim() && (
          <div className={styles.title}>{title.trim()}</div>
        )}

        {/* Value preview */}
        <div className={styles.valuePreview} title={safeValue}>{safeValue}</div>

        {/* Color pickers + download */}
        <div className={styles.bottomRow}>
          <div className={styles.colorRow}>
            <label className={styles.colorLabel}>
              <input type="color" className={styles.colorPicker}
                value={safeFg} onChange={e => setFgColor(e.target.value)} />
              <span>Shape</span>
            </label>
            <label className={styles.colorLabel}>
              <input type="color" className={styles.colorPicker}
                value={safeBg} onChange={e => setBgColor(e.target.value)} />
              <span>Background</span>
            </label>
            <label className={styles.colorLabel}>
              <input type="color" className={styles.colorPicker}
                value={safeBorderColor} onChange={e => setBorderColor(e.target.value)} />
              <span>Border</span>
            </label>
          </div>

          <button className={styles.btn} onClick={handleDownload} disabled={!localDataUrl}>
            <DownloadIcon />
            Download PNG
          </button>
        </div>

      </div>
    </div>
  )
}
