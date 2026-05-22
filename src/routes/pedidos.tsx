import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ChevronRight, Clock, History, ListOrdered } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/app-layout";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/pedidos")({
  component: PedidosPage,
  head: () => ({ meta: [{ title: "Pedidos · Rosario Sushi" }] }),
});

const SIDEBAR_ITEMS = [
  { to: "/pedidos", label: "Cola de Pedidos", icon: ListOrdered },
  { to: "/pedidos/historico", label: "Historial", icon: History },
];

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
    label: "CRITICO",
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
            <span className="font-semibold">{it.qty}x</span>
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

function PedidosRecientes() {
  const { orders, now } = useStore();
  const active = orders.filter((o) => o.status !== "ENTREGADO");
  const columns: { title: string; status: OrderStatus }[] = [
    { title: "Nuevos", status: "NUEVO" },
    { title: "En preparación", status: "PENDIENTE" },
    { title: "Listos", status: "LISTO" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {active.length} pedidos activos · Actualiza automáticamente
        </p>
        <div className="flex gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-success" /> {"<"} 15 min
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
    </div>
  );
}

const ITEMS_PER_PAGE = 10;

function HistoricoPedidos() {
  const { orders } = useStore();
  const [currentPage, setCurrentPage] = useState(1);

  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === "ENTREGADO").sort((a, b) => b.createdAt - a.createdAt),
    [orders]
  );

  const totalPages = Math.ceil(deliveredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = deliveredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Método Pago</th>
                <th className="px-4 py-3">Fecha/Hora</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-display font-bold">#{order.ticket}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      order.origin === "CAJA" ? "bg-primary/10 text-primary" : "bg-chart-2/10 text-chart-2"
                    )}>
                      {order.origin === "CAJA" ? "Caja" : "PedidosYa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.items.map((it) => `${it.qty}x ${it.name}`).join(", ").slice(0, 40)}
                    {order.items.map((it) => `${it.qty}x ${it.name}`).join(", ").length > 40 ? "..." : ""}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ${order.total.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.paymentMethod}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No hay pedidos completados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
            {getPageNumbers().map((page, i) => (
              <PaginationItem key={i}>
                {page === "ellipsis" ? (
                  <span className="px-2 text-muted-foreground">...</span>
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }}
                className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function PedidosPage() {
  const [activeSection, setActiveSection] = useState<"cola" | "historico">("cola");

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} title="Gestión de Pedidos" subtitle="Cocina">
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Internal sidebar */}
        <div className="hidden w-56 flex-shrink-0 border-r border-border bg-card/50 p-4 md:block">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection("cola")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeSection === "cola"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <ListOrdered className="h-4 w-4" />
              Cola de Prioridad
            </button>
            <button
              onClick={() => setActiveSection("historico")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeSection === "historico"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <History className="h-4 w-4" />
              Historial de Pedidos
            </button>
          </nav>
        </div>

        {/* Mobile tabs */}
        <div className="flex w-full flex-col">
          <div className="flex border-b border-border md:hidden">
            <button
              onClick={() => setActiveSection("cola")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeSection === "cola"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Cola de Prioridad
            </button>
            <button
              onClick={() => setActiveSection("historico")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeSection === "historico"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Historial
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold">
                {activeSection === "cola" ? "Cola de Prioridad" : "Historial de Pedidos"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeSection === "cola"
                  ? "Pedidos ordenados por hora de llegada"
                  : "Pedidos completados"}
              </p>
            </div>

            {activeSection === "cola" ? <PedidosRecientes /> : <HistoricoPedidos />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
