export function StatCard({ icono, etiqueta, valor }: { icono: string; etiqueta: string; valor: number | string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-xl">{icono}</div>
      <div>
        <p className="text-sm text-neutral-500">{etiqueta}</p>
        <p className="text-2xl font-bold text-neutral-900">{valor}</p>
      </div>
    </div>
  )
}
