import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Plus, Trash2, TrendingUp, Wallet, EyeOff, Award } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { PAYMENT_TO_INCOME, PAYMENT_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin · Rosario Sushi" }] }),
});

type RangeKey = "hoy" | "semana" | "mes" | "todo";

const RANGES: { key: RangeKey; label: string; ms: number }[] = [
  { key: "hoy", label: "Hoy", ms: 24 * 3600_000 },
  { key: "semana", label: "Semana", ms: 7 * 24 * 3600_000 },
  { key: "mes", label: "Mes", ms: 30 * 24 * 3600_000 },
  { key: "todo", label: "Todo", ms: Infinity },
];

function AdminPage() {
  const {
    orders,
    products,
    employees,
    addEmployee,
    removeEmployee,
    updateProduct,
    addProduct,
    removeProduct,
    applyMassIncrease,
  } = useStore();

  const [range, setRange] = useState<RangeKey>("semana");
  const [increasePct, setIncreasePct] = useState(10);
  const [newEmp, setNewEmp] = useState({ name: "", role: "Sushiman" });
  const [newProd, setNewProd] = useState({
    name: "",
    priceMostrador: 0,
    pricePedidosYa: 0,
    stock: 0,
    category: "Combos",
  });

  const cutoff = useMemo(() => {
    const r = RANGES.find((x) => x.key === range)!;
    return r.ms === Infinity ? 0 : Date.now() - r.ms;
  }, [range]);

  const filtered = orders.filter((o) => o.createdAt >= cutoff);

  const { totalBlanco, totalNegro, byPayment, topProducts } = useMemo(() => {
    let blanco = 0;
    let negro = 0;
    const byPay: Record<string, number> = {};
    const byProd: Record<string, { name: string; qty: number; total: number }> = {};
    for (const o of filtered) {
      const bucket = PAYMENT_TO_INCOME[o.paymentMethod];
      if (bucket === "BLANCO") blanco += o.total;
      else negro += o.total;
      byPay[o.paymentMethod] = (byPay[o.paymentMethod] ?? 0) + o.total;
      for (const it of o.items) {
        byProd[it.productId] ??= { name: it.name, qty: 0, total: 0 };
        byProd[it.productId].qty += it.qty;
        byProd[it.productId].total += it.qty * it.unitPrice;
      }
    }
    return {
      totalBlanco: blanco,
      totalNegro: negro,
      byPayment: Object.entries(byPay).map(([k, v]) => ({
        name: PAYMENT_LABEL[k as keyof typeof PAYMENT_LABEL],
        value: v,
      })),
      topProducts: Object.values(byProd)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5),
    };
  }, [filtered]);

  // daily series
  const dailySeries = useMemo(() => {
    const map: Record<string, { date: string; BLANCO: number; NEGRO: number }> = {};
    for (const o of filtered) {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
      map[key] ??= { date: key, BLANCO: 0, NEGRO: 0 };
      map[key][PAYMENT_TO_INCOME[o.paymentMethod]] += o.total;
    }
    return Object.values(map).reverse();
  }, [filtered]);

  const round50 = (n: number) => Math.round(n / 50) * 50;

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
      {/* Header / range */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Administración</h1>
          <p className="text-sm text-muted-foreground">
            Dashboard financiero, productos y empleados.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                range === r.key ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total facturado
            </span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold">
            ${(totalBlanco + totalNegro).toLocaleString("es-AR")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{filtered.length} pedidos</div>
        </div>
        <div className="rounded-xl border-2 border-blanco/30 bg-blanco/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-blanco">
              BLANCO
            </span>
            <Wallet className="h-4 w-4 text-blanco" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-blanco">
            ${totalBlanco.toLocaleString("es-AR")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Transferencia · Débito · Crédito · PedidosYa
          </div>
        </div>
        <div className="rounded-xl border-2 border-negro/40 bg-negro/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-foreground/70">
              NEGRO
            </span>
            <EyeOff className="h-4 w-4 text-foreground/70" />
          </div>
          <div className="mt-2 font-display text-3xl font-bold">
            ${totalNegro.toLocaleString("es-AR")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Efectivo</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 font-display text-lg font-bold">Ingresos por día</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Bar dataKey="BLANCO" fill="var(--color-blanco)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="NEGRO" fill="var(--color-negro)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-display text-lg font-bold">Por método de pago</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byPayment}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {byPayment.map((_, i) => (
                    <Cell key={i} fill={`var(--color-chart-${(i % 5) + 1})`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top products */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Award className="h-5 w-5 text-primary" /> Ranking de productos
        </h3>
        <div className="space-y-2">
          {topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 font-display font-bold text-primary">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(p.qty / (topProducts[0]?.qty || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-bold">{p.qty} u.</div>
                <div className="text-xs text-muted-foreground">
                  ${p.total.toLocaleString("es-AR")}
                </div>
              </div>
            </div>
          ))}
          {topProducts.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Sin datos</p>
          )}
        </div>
      </section>

      {/* Products CRUD */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h3 className="font-display text-lg font-bold">Productos & Combos</h3>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
            <span className="text-xs font-medium text-muted-foreground">Aumento masivo</span>
            <input
              type="number"
              value={increasePct}
              onChange={(e) => setIncreasePct(Number(e.target.value))}
              className="h-9 w-20 rounded-md border border-border bg-card px-2 text-sm"
            />
            <span className="text-sm">%</span>
            <button
              onClick={() => {
                applyMassIncrease(increasePct);
                toast.success(`Precios aumentados ${increasePct}% (redondeo $50)`);
              }}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Aplicar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">Producto</th>
                <th className="py-2 pr-3">Categoría</th>
                <th className="py-2 pr-3 text-right">Mostrador</th>
                <th className="py-2 pr-3 text-right">Con aumento</th>
                <th className="py-2 pr-3 text-right">PedidosYa</th>
                <th className="py-2 pr-3 text-right">Con aumento</th>
                <th className="py-2 pr-3 text-right">Stock</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const newM = round50(p.priceMostrador * (1 + increasePct / 100));
                const newP = round50(p.pricePedidosYa * (1 + increasePct / 100));
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-3 font-medium">{p.name}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{p.category}</td>
                    <td className="py-3 pr-3 text-right">
                      <input
                        type="number"
                        value={p.priceMostrador}
                        onChange={(e) =>
                          updateProduct(p.id, { priceMostrador: Number(e.target.value) })
                        }
                        className="h-8 w-24 rounded-md border border-border bg-background px-2 text-right"
                      />
                    </td>
                    <td className="py-3 pr-3 text-right text-xs">
                      <span className="rounded-md bg-success/15 px-2 py-1 font-semibold text-success-foreground">
                        ${newM.toLocaleString("es-AR")}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <input
                        type="number"
                        value={p.pricePedidosYa}
                        onChange={(e) =>
                          updateProduct(p.id, { pricePedidosYa: Number(e.target.value) })
                        }
                        className="h-8 w-24 rounded-md border border-border bg-background px-2 text-right"
                      />
                    </td>
                    <td className="py-3 pr-3 text-right text-xs">
                      <span className="rounded-md bg-success/15 px-2 py-1 font-semibold text-success-foreground">
                        ${newP.toLocaleString("es-AR")}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <input
                        type="number"
                        value={p.stock}
                        onChange={(e) =>
                          updateProduct(p.id, { stock: Number(e.target.value) })
                        }
                        className={cn(
                          "h-8 w-20 rounded-md border bg-background px-2 text-right",
                          p.stock < 5
                            ? "border-danger text-danger"
                            : "border-border",
                        )}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="grid h-8 w-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-border p-4">
          <div className="mb-2 text-sm font-semibold">Nuevo producto</div>
          <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
            <input
              placeholder="Nombre"
              value={newProd.name}
              onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
              className="h-10 rounded-md border border-border bg-background px-3"
            />
            <input
              placeholder="Categoría"
              value={newProd.category}
              onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
              className="h-10 rounded-md border border-border bg-background px-3"
            />
            <input
              type="number"
              placeholder="$ Mostrador"
              value={newProd.priceMostrador || ""}
              onChange={(e) =>
                setNewProd({ ...newProd, priceMostrador: Number(e.target.value) })
              }
              className="h-10 rounded-md border border-border bg-background px-3"
            />
            <input
              type="number"
              placeholder="$ PedidosYa"
              value={newProd.pricePedidosYa || ""}
              onChange={(e) =>
                setNewProd({ ...newProd, pricePedidosYa: Number(e.target.value) })
              }
              className="h-10 rounded-md border border-border bg-background px-3"
            />
            <input
              type="number"
              placeholder="Stock"
              value={newProd.stock || ""}
              onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
              className="h-10 rounded-md border border-border bg-background px-3"
            />
            <button
              onClick={() => {
                if (!newProd.name) return toast.error("Nombre requerido");
                addProduct({ ...newProd, description: "" });
                setNewProd({
                  name: "",
                  priceMostrador: 0,
                  pricePedidosYa: 0,
                  stock: 0,
                  category: "Combos",
                });
                toast.success("Producto creado");
              }}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Agregar
            </button>
          </div>
        </div>
      </section>

      {/* Employees */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-display text-lg font-bold">Empleados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">Nombre</th>
                <th className="py-2 pr-3">Rol</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3">Turno</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-3 font-medium">{e.name}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{e.role}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        e.active
                          ? "bg-success/20 text-success-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {e.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-xs">
                    {e.checkedIn ? (
                      <span className="text-success">● En turno</span>
                    ) : (
                      <span className="text-muted-foreground">○ Fuera</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => removeEmployee(e.id)}
                      className="grid h-8 w-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-border p-4">
          <div className="mb-2 text-sm font-semibold">Alta de empleado</div>
          <div className="grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
            <input
              placeholder="Nombre completo"
              value={newEmp.name}
              onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
              className="h-10 rounded-md border border-border bg-background px-3"
            />
            <select
              value={newEmp.role}
              onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
              className="h-10 rounded-md border border-border bg-background px-3"
            >
              <option>Sushiman</option>
              <option>Caja</option>
              <option>Cadete</option>
              <option>Encargado</option>
            </select>
            <button
              onClick={() => {
                if (!newEmp.name) return toast.error("Nombre requerido");
                addEmployee(newEmp.name, newEmp.role);
                setNewEmp({ name: "", role: "Sushiman" });
                toast.success("Empleado agregado");
              }}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Agregar
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
