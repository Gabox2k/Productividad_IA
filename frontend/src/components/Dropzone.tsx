import { useEffect, useRef, useState, type DragEvent } from "react"

export function Dropzone({ archivo, onArchivo }: { archivo: File | null; onArchivo: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [arrastrando, setArrastrando] = useState(false)

  function manejarDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setArrastrando(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onArchivo(file)
  }

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const esVideo = archivo?.type.startsWith("video/")

  useEffect(() => {
    if (!archivo) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(archivo)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setArrastrando(true)
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={manejarDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        arrastrando ? "border-amber-400 bg-amber-50" : "border-neutral-300 hover:border-neutral-400"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => onArchivo(e.target.files?.[0] || null)}
      />

      {previewUrl ? (
        esVideo ? (
          <video src={previewUrl} controls className="max-h-48 rounded-lg" onClick={(e) => e.stopPropagation()} />
        ) : (
          <img src={previewUrl} alt="Vista previa" className="max-h-48 rounded-lg object-contain" />
        )
      ) : (
        <>
          <div className="mb-3 text-3xl">📷</div>
          <p className="text-sm text-neutral-600">
            Arrastrá una foto o video acá, o <span className="font-semibold text-neutral-900 underline">buscá un archivo</span>
          </p>
          <p className="mt-1 text-xs text-neutral-400">Imágenes o video (máx. 50MB)</p>
        </>
      )}

      {archivo && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onArchivo(null)
          }}
          className="mt-3 text-xs font-semibold text-neutral-500 underline hover:text-neutral-800"
        >
          Quitar archivo
        </button>
      )}
    </div>
  )
}
