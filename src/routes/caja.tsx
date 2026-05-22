import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Minus, Trash2, Printer, LogIn, LogOut, Check } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { OrderItem, PaymentMethod } from "@/lib/types";
import { PAYMENT_LABEL } from "@/lib/types";
import { TicketPreview } from "@/components/ticket-preview";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/caja")({
  component: CajaPage,
  head: () => ({ meta: [{ title: "Caja · Rosario Sushi" }] }),
});

const PAYMENT_OPTIONS: PaymentMethod[] = ["EFECTIVO", "TRANSFERENCIA", "DEBITO", "CREDITO"];

function CajaPage() {
  const { products, employees, toggleCheckIn, addOrder, orders } = useStore();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("EFECTIVO");
  const [lastTicket, setLastTicket] = useState<string | null>(null);

  const lastOrder = useMemo(
    () => orders.find((o) => o.id === lastTicket) ?? null,
    [lastTicket, orders],
  );

  const total = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  function addToCart(productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setCart((c) => {
      const i = c.findIndex((it) => it.productId === productId);
      if (i >= 0) {
        const copy = [...c];
        copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
        return copy;
      }
      return [...c, { productId: p.id, name: p.name, qty: 1, unitPrice: p.priceMostrador }];
    });
  }

  function changeQty(productId: string, delta: number) {
    setCart((c) =>
      c
        .map((it) =>
          it.productId === productId ? { ...it, qty: Math.max(0, it.qty + delta) } : it,
        )
        .filter((it) => it.qty > 0),
    );
  }

  function confirmOrder() {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    const order = addOrder(cart, payment, "CAJA", phone || undefined);
    setLastTicket(order.id);
    setCart([]);
    setPhone("");
    toast.success(`Ticket #${order.ticket} enviado a cocina`);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Turnos */}
      <section className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Turnos del día</h2>
          <span className="text-xs text-muted-foreground">
            {employees.filter((e) => e.checkedIn).length} fichados
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {employees
            .filter((e) => e.active)
            .map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  toggleCheckIn(e.id);
                  toast.success(`${e.name} · ${e.checkedIn ? "Check-out" : "Check-in"}`);
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-3 text-left transition-colors",
                  e.checkedIn
                    ? "border-success/40 bg-success/10"
                    : "border-border bg-background hover:bg-accent",
                )}
              >
                <div>
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.role}</div>
                </div>
                {e.checkedIn ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-success/20 px-2 py-1 text-xs font-semibold text-success-foreground">
                    <LogOut className="h-3 w-3" /> Check-out
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-semibold">
                    <LogIn className="h-3 w-3" /> Check-in
                  </span>
                )}
              </button>
            ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Catálogo + Carrito */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 font-display text-lg font-bold">Nuevo pedido</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p.id)}
                  className="group rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md active:translate-y-0"
                >
                  <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    {p.category}
                  </div>
                  <div className="font-semibold leading-snug">{p.name}</div>
                  <div className="mt-3 flex items-end justify-between">
                    <div className="font-display text-xl font-bold text-primary">
                      ${p.priceMostrador.toLocaleString("es-AR")}
                    </div>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Plus className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Stock: {p.stock}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 font-display text-base font-bold">Carrito</h3>
            {cart.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Tocá un producto para agregarlo
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((it) => (
                  <div
                    key={it.productId}
                    className="flex items-center gap-3 rounded-lg bg-background p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ${it.unitPrice.toLocaleString("es-AR")} c/u
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent"
                        onClick={() => changeQty(it.productId, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center font-semibold">{it.qty}</span>
                      <button
                        className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent"
                        onClick={() => changeQty(it.productId, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="w-24 text-right font-semibold">
                      ${(it.qty * it.unitPrice).toLocaleString("es-AR")}
                    </div>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                      onClick={() => changeQty(it.productId, -it.qty)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Teléfono del cliente</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="341 555 1234"
                  className="h-11 w-full rounded-md border border-border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Método de pago</span>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayment(m)}
                      className={cn(
                        "h-11 rounded-md border text-sm font-medium transition-colors",
                        payment === m
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-accent",
                      )}
                    >
                      {PAYMENT_LABEL[m]}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <div>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="font-display text-3xl font-bold">
                  ${total.toLocaleString("es-AR")}
                </div>
              </div>
              <button
                onClick={confirmOrder}
                className="inline-flex h-14 items-center gap-2 rounded-lg bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-100"
              >
                <Check className="h-5 w-5" />
                Confirmar y enviar a cocina
              </button>
            </div>
          </section>
        </div>

        {/* Comanda */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display text-base font-bold">Comanda</h3>
            <button
              onClick={() => lastOrder && window.print()}
              disabled={!lastOrder}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
            >
              <Printer className="h-3 w-3" /> Imprimir
            </button>
          </div>
          <TicketPreview order={lastOrder} />
        </aside>
      </div>
    </main>
  );
}
