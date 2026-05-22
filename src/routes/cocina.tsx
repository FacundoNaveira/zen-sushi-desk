import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cocina")({
  component: CocinaPage,
  head: () => ({ meta: [{ title: "Cocina · Rosario Sushi" }] }),
});

const NEXT_LABEL: Record<OrderStatus, string> = {
  NUEVO: "Tomar pedido",
  PENDIENTE: "Marcar LISTO",
  LISTO: "Marcar ENTREGADO",
  ENTREGADO: "Entregado",
};

function statusColor(minutes: number, status: OrderStatus) {
  if (status === "LISTO")
    return {
      border: "border-blue-500/60",
      bg: "bg-blue-500/10",
      pill: "bg-blue-500 text-white",
      label: "LISTO",
    };
  if (minutes < 15)
    return {
      border: "border-success/60",
      bg: "bg-success/10",
      pill: "bg-success text-success-foreground",
      label: "A TIEMPO",
    };
  if (minutes < 30)
    return {
      border: "border-warning/70",
      bg: "bg-warning/15",
      pill: "bg-warning text-warning-foreground",
      label: "RETRASADO",
    };
  return {
    border: "border-danger/70",
    bg: "bg-danger/15 animate-pulse",
    pill: "bg-danger text-danger-foreground",
    label: "CRÍTICO",
  };
}

function OrderCard({ order, now }: { order: Order; now: number }) {
  const { advanceOrder } = useStore();
  const minutes = Math.floor((now - order.createdAt) / 60_000);
  const c = statusColor(minutes, order.status);

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border-2 p-4 shadow-sm",
        c.border,
        c.bg,
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {order.origin === "CAJA" ? "Caja" : "PedidosYa"}
          </div>
          <div className="font-display text-2xl font-bold">#{order.ticket}</div>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", c.pill)}>
          {c.label}
        </span>
      </header>

      <div className="flex items-center gap-1.5 text-sm font-medium">
        <Clock className="h-3.5 w-3.5" />
        {minutes} min · {new Date(order.createdAt).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      <ul className="space-y-1 border-y border-border/60 py-2 text-sm">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between">
            <span className="font-semibold">{it.qty}×</span>
            <span className="flex-1 px-2">{it.name}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-xs">
        <span className="rounded-md bg-background/60 px-2 py-1 font-medium">
          Estado: {order.status}
        </span>
      </div>

      <button
        onClick={() => advanceOrder(order.id)}
        disabled={order.status === "ENTREGADO"}
        className="mt-auto inline-flex h-11 items-center justify-center gap-1 rounded-lg bg-foreground text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {NEXT_LABEL[order.status]}
        {order.status !== "ENTREGADO" && <ChevronRight className="h-4 w-4" />}
      </button>
    </article>
  );
}

function CocinaPage() {
  const { orders, now } = useStore();
  const active = orders.filter((o) => o.status !== "ENTREGADO");
  const columns: { title: string; status: OrderStatus }[] = [
    { title: "Nuevos", status: "NUEVO" },
    { title: "En preparación", status: "PENDIENTE" },
    { title: "Listos", status: "LISTO" },
  ];

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Cocina · KDS</h1>
          <p className="text-sm text-muted-foreground">
            {active.length} pedidos activos · Actualiza automáticamente
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-success" /> &lt; 15 min
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-warning" /> 15-30 min
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-danger" /> +30 min
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {columns.map((col) => {
          const items = active.filter((o) => o.status === col.status);
          return (
            <section key={col.status}>
              <h2 className="mb-3 flex items-center justify-between font-display text-lg font-bold">
                <span>{col.title}</span>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs">
                  {items.length}
                </span>
              </h2>
              <div className="grid gap-3">
                {items.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    Sin pedidos
                  </div>
                )}
                {items.map((o) => (
                  <OrderCard key={o.id} order={o} now={now} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
