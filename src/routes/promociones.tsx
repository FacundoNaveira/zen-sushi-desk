import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Calendar, Percent, Tag, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/promociones")({
  component: PromocionesPage,
  head: () => ({ meta: [{ title: "Promociones · Rosario Sushi" }] }),
});

interface Promocion {
  id: string;
  nombre: string;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  descripcion?: string;
}

const INITIAL_PROMOCIONES: Promocion[] = [
  {
    id: "promo1",
    nombre: "2x1 Martes de Sushi",
    descuento: 50,
    fechaInicio: "2026-05-01",
    fechaFin: "2026-06-30",
    activa: true,
    descripcion: "Todos los martes, lleva 2 combos y paga solo 1",
  },
  {
    id: "promo2",
    nombre: "Descuento PedidosYa",
    descuento: 15,
    fechaInicio: "2026-05-15",
    fechaFin: "2026-05-31",
    activa: true,
    descripcion: "15% de descuento en pedidos via PedidosYa",
  },
  {
    id: "promo3",
    nombre: "Happy Hour",
    descuento: 20,
    fechaInicio: "2026-04-01",
    fechaFin: "2026-04-30",
    activa: false,
    descripcion: "20% off de 17 a 19hs en take away",
  },
];

function PromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>(INITIAL_PROMOCIONES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promocion | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descuento: 10,
    fechaInicio: "",
    fechaFin: "",
    descripcion: "",
  });

  const resetForm = () => {
    setFormData({
      nombre: "",
      descuento: 10,
      fechaInicio: "",
      fechaFin: "",
      descripcion: "",
    });
    setEditingPromo(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (promo: Promocion) => {
    setEditingPromo(promo);
    setFormData({
      nombre: promo.nombre,
      descuento: promo.descuento,
      fechaInicio: promo.fechaInicio,
      fechaFin: promo.fechaFin,
      descripcion: promo.descripcion || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.fechaInicio || !formData.fechaFin) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    if (editingPromo) {
      setPromociones((prev) =>
        prev.map((p) =>
          p.id === editingPromo.id
            ? { ...p, ...formData, activa: p.activa }
            : p
        )
      );
      toast.success("Promocion actualizada");
    } else {
      const newPromo: Promocion = {
        id: crypto.randomUUID(),
        ...formData,
        activa: true,
      };
      setPromociones((prev) => [...prev, newPromo]);
      toast.success("Promocion creada");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const togglePromocion = (id: string) => {
    setPromociones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p))
    );
  };

  const deletePromocion = (id: string) => {
    setPromociones((prev) => prev.filter((p) => p.id !== id));
    toast.success("Promocion eliminada");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Promociones</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las promociones y descuentos activos
          </p>
        </div>
        <button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Crear Promocion
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Promociones
          </div>
          <div className="mt-1 font-display text-2xl font-bold">{promociones.length}</div>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-success">
            Activas
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-success">
            {promociones.filter((p) => p.activa).length}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Inactivas
          </div>
          <div className="mt-1 font-display text-2xl font-bold">
            {promociones.filter((p) => !p.activa).length}
          </div>
        </div>
      </div>

      {/* Promociones Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promociones.map((promo) => (
          <article
            key={promo.id}
            className={cn(
              "group relative rounded-xl border-2 p-5 transition-all",
              promo.activa
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card opacity-75"
            )}
          >
            <div className="mb-3 flex items-start justify-between">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                  promo.activa
                    ? "bg-success/20 text-success-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {promo.activa ? "Activa" : "Inactiva"}
              </span>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEditDialog(promo)}
                  className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Editar promocion"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deletePromocion(promo.id)}
                  className="grid h-8 w-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                  aria-label="Eliminar promocion"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="font-display text-lg font-bold">{promo.nombre}</h3>
            {promo.descripcion && (
              <p className="mt-1 text-sm text-muted-foreground">{promo.descripcion}</p>
            )}

            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-primary">
                <Percent className="h-4 w-4" />
                <span className="font-bold">{promo.descuento}% OFF</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(promo.fechaInicio).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
              })}{" "}
              -{" "}
              {new Date(promo.fechaFin).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>

            <button
              onClick={() => togglePromocion(promo.id)}
              className={cn(
                "mt-4 w-full rounded-lg py-2 text-sm font-medium transition-colors",
                promo.activa
                  ? "bg-muted text-muted-foreground hover:bg-muted/80"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              )}
            >
              {promo.activa ? "Desactivar" : "Activar"}
            </button>
          </article>
        ))}

        {promociones.length === 0 && (
          <div className="col-span-full rounded-xl border-2 border-dashed border-border p-12 text-center">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-display font-bold">Sin promociones</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea tu primera promocion para comenzar
            </p>
            <button
              onClick={openCreateDialog}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Crear Promocion
            </button>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingPromo ? "Editar Promocion" : "Nueva Promocion"}
            </DialogTitle>
            <DialogDescription>
              {editingPromo
                ? "Modifica los datos de la promocion"
                : "Completa los datos para crear una nueva promocion"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Nombre de la promocion *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: 2x1 Martes de Sushi"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Descuento (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.descuento}
                onChange={(e) =>
                  setFormData({ ...formData, descuento: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Fecha inicio *</label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaInicio: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Fecha fin *</label>
                <input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Descripcion (opcional)
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder="Describe los detalles de la promocion..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {editingPromo ? "Guardar cambios" : "Crear promocion"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
