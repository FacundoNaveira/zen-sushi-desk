import type { Order } from "@/lib/types";
import { PAYMENT_LABEL } from "@/lib/types";

export function TicketPreview({ order }: { order: Order | null }) {
  if (!order) {
    return (
      <div className="ticket grid h-full min-h-[400px] place-items-center rounded-md p-6 text-center text-sm text-neutral-500">
        Confirmá un pedido para ver la comanda
      </div>
    );
  }
  const d = new Date(order.createdAt);
  return (
    <div className="ticket rounded-md p-4 text-xs leading-relaxed">
      <div className="text-center">
        <div className="text-base font-bold">ROSARIO SUSHI</div>
        <div>Av. Pellegrini 1234 · Rosario</div>
        <div>--------------------------------</div>
        <div className="text-sm font-bold">
          TICKET #{order.ticket} · {order.origin}
        </div>
        <div>{d.toLocaleString("es-AR")}</div>
        <div>--------------------------------</div>
      </div>
      <div className="my-2">
        {order.items.map((it, i) => (
          <div key={i} className="flex justify-between gap-2">
            <span>
              {it.qty} × {it.name}
            </span>
            <span>${(it.qty * it.unitPrice).toLocaleString("es-AR")}</span>
          </div>
        ))}
      </div>
      <div>--------------------------------</div>
      <div className="flex justify-between font-bold">
        <span>TOTAL</span>
        <span>${order.total.toLocaleString("es-AR")}</span>
      </div>
      <div className="mt-1">Pago: {PAYMENT_LABEL[order.paymentMethod]}</div>
      {order.phone && <div>Tel: {order.phone}</div>}
      <div className="mt-3 text-center">
        <div>--------------------------------</div>
        <div>¡Gracias por tu compra!</div>
      </div>
    </div>
  );
}
