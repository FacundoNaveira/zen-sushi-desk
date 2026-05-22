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
import {
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
  EyeOff,
  Award,
  BarChart3,
  Users,
  Tag,
  Edit2,
  Calendar,
  Percent,
  Clock,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { PAYMENT_TO_INCOME, PAYMENT_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/app-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin · Rosario Sushi" }] }),
});

const SIDEBAR_ITEMS = [
  { to: "/admin", label: "Estadísticas", icon: BarChart3 },
  { to: "/admin/empleados", label: "Empleados", icon: Users },
  { to: "/admin/promociones", label: "Promociones", icon: Tag },
];

type RangeKey = "hoy" | "semana" | "mes" | "todo";

const RANGES: { key: RangeKey; label: string; ms: number }[] = [
  { key: "hoy", label: "Hoy", ms: 24 * 3600_000 },
  { key: "semana", label: "Semana", ms: 7 * 24 * 3600_000 },
  { key: "mes", label: "Mes", ms: 30 * 24 * 3600_000 },
  { key: "todo", label: "Todo", ms: Infinity },
];

type AdminSection = "estadisticas" | "empleados" | "promociones";

function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("estadisticas");

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} title="Administración" subtitle="Admin">
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Internal sidebar */}
        <div className="hidden w-56 flex-shrink-0 border-r border-border bg-card/50 p-4 md:block">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection("estadisticas")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeSection === "estadisticas"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </button>
            <button
              onClick={() => setActiveSection("empleados")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeSection === "empleados"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <Users className="h-4 w-4" />
              Gestión Empleados
            </button>
            <button
              onClick={() => setActiveSection("promociones")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeSection === "promociones"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <Tag className="h-4 w-4" />
              Editor Promociones
            </button>
          </nav>
        </div>

        {/* Mobile tabs */}
        <div className="flex w-full flex-col">
          <div className="flex border-b border-border md:hidden">
            <button
              onClick={() => setActiveSection("estadisticas")}
              className={cn(
                "flex-1 px-3 py-3 text-xs font-medium transition-colors",
                activeSection === "estadisticas"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Estadísticas
            </button>
            <button
              onClick={() => setActiveSection("empleados")}
              className={cn(
                "flex-1 px-3 py-3 text-xs font-medium transition-colors",
                activeSection === "empleados"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Empleados
            </button>
            <button
              onClick={() => setActiveSection("promociones")}
              className={cn(
                "flex-1 px-3 py-3 text-xs font-medium transition-colors",
                activeSection === "promociones"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Promociones
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeSection === "estadisticas" && <EstadisticasSection />}
            {activeSection === "empleados" && <EmpleadosSection />}
            {activeSection === "promociones" && <PromocionesSection />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function EstadisticasSection() {
  const { orders, products, updateProduct, addProduct, removeProduct, applyMassIncrease } =
    useStore();

  const [range, setRange] = useState<RangeKey>("semana");
  const [increasePct, setIncreasePct] = useState(10);
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
    <div className="space-y-8">
      {/* Header / range */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Estadísticas Generales</h1>
          <p className="text-sm text-muted-foreground">
            Dashboard financiero y métricas de ventas
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                range === r.key ? "bg-primary text-primary-foreground" : "hover:bg-accent"
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
                      <span className="rounded-md bg-success/15 px-2 py-1 font-semibold text-success">
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
                      <span className="rounded-md bg-success/15 px-2 py-1 font-semibold text-success">
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
                          p.stock < 5 ? "border-danger text-danger" : "border-border"
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
    </div>
  );
}

function EmpleadosSection() {
  const { employees, attendance, addEmployee, removeEmployee } = useStore();
  const [newEmp, setNewEmp] = useState({ name: "", role: "Sushiman" });

  const today = new Date().toISOString().split("T")[0];

  // Calculate attendance stats per employee
  const employeeStats = useMemo(() => {
    const stats: Record<
      string,
      { totalDays: number; presentDays: number; absentDays: number; totalHours: number }
    > = {};

    for (const emp of employees) {
      const empAttendance = attendance.filter((a) => a.employeeId === emp.id);
      let presentDays = 0;
      let absentDays = 0;
      let totalHours = 0;

      for (const record of empAttendance) {
        if (record.status === "presente" || record.status === "turno_activo") {
          presentDays++;
          if (record.checkIn && record.checkOut) {
            const [inH, inM] = record.checkIn.split(":").map(Number);
            const [outH, outM] = record.checkOut.split(":").map(Number);
            const hours = outH - inH + (outM - inM) / 60;
            totalHours += hours;
          }
        } else if (record.status === "ausente") {
          absentDays++;
        }
      }

      stats[emp.id] = {
        totalDays: empAttendance.length,
        presentDays,
        absentDays,
        totalHours: Math.round(totalHours * 10) / 10,
      };
    }

    return stats;
  }, [employees, attendance]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Gestión de Empleados</h1>
        <p className="text-sm text-muted-foreground">
          Estadísticas de asistencia y administración del personal
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Empleados
          </div>
          <div className="mt-1 font-display text-2xl font-bold">{employees.length}</div>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-success">
            En Turno Hoy
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-success">
            {employees.filter((e) => e.checkedIn).length}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Activos
          </div>
          <div className="mt-1 font-display text-2xl font-bold">
            {employees.filter((e) => e.active).length}
          </div>
        </div>
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-warning">
            Inactivos
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-warning-foreground">
            {employees.filter((e) => !e.active).length}
          </div>
        </div>
      </div>

      {/* Employee Table with Stats */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-display text-lg font-bold">Empleados y Estadísticas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">Empleado</th>
                <th className="py-2 pr-3">Rol</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3">Turno Hoy</th>
                <th className="py-2 pr-3 text-center">Días Presentes</th>
                <th className="py-2 pr-3 text-center">Días Ausentes</th>
                <th className="py-2 pr-3 text-center">Horas Totales</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const stats = employeeStats[e.id] || {
                  totalDays: 0,
                  presentDays: 0,
                  absentDays: 0,
                  totalHours: 0,
                };
                return (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{e.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">{e.role}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          e.active
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {e.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-xs">
                      {e.checkedIn ? (
                        <span className="text-success font-semibold">En turno</span>
                      ) : (
                        <span className="text-muted-foreground">Fuera</span>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-center font-semibold text-success">
                      {stats.presentDays}
                    </td>
                    <td className="py-3 pr-3 text-center font-semibold text-danger">
                      {stats.absentDays}
                    </td>
                    <td className="py-3 pr-3 text-center font-semibold">{stats.totalHours}h</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => removeEmployee(e.id)}
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

      {/* Attendance History */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Calendar className="h-5 w-5 text-primary" />
          Historial de Asistencia
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">Empleado</th>
                <th className="py-2 pr-3">Día</th>
                <th className="py-2 pr-3">Hora Ingreso</th>
                <th className="py-2 pr-3">Hora Salida</th>
                <th className="py-2 pr-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {attendance.slice(0, 20).map((record) => (
                <tr key={record.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-3 font-medium">{record.employeeName}</td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {new Date(record.date).toLocaleDateString("es-AR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="py-3 pr-3">{record.checkIn || "-"}</td>
                  <td className="py-3 pr-3">{record.checkOut || "-"}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        record.status === "presente" || record.status === "turno_activo"
                          ? "bg-success/20 text-success"
                          : "bg-danger/20 text-danger"
                      )}
                    >
                      {record.status === "turno_activo"
                        ? "En turno"
                        : record.status === "presente"
                        ? "Presente"
                        : "Ausente"}
                    </span>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No hay registros de asistencia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PromocionesSection() {
  const { promociones, addPromocion, updatePromocion, removePromocion, togglePromocion } =
    useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<(typeof promociones)[0] | null>(null);
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

  const openEditDialog = (promo: (typeof promociones)[0]) => {
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
      updatePromocion(editingPromo.id, formData);
      toast.success("Promoción actualizada");
    } else {
      addPromocion({ ...formData, activa: true });
      toast.success("Promoción creada");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Editor de Promociones</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las promociones que aparecen en la Landing
          </p>
        </div>
        <button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Crear Promoción
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
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
                ? "border-primary/30 bg-[oklch(0.97_0.02_20)] dark:bg-[oklch(0.25_0.03_20)]"
                : "border-border bg-card opacity-75"
            )}
          >
            <div className="mb-3 flex items-start justify-between">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                  promo.activa
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {promo.activa ? "Activa" : "Inactiva"}
              </span>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEditDialog(promo)}
                  className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Editar promoción"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    removePromocion(promo.id);
                    toast.success("Promoción eliminada");
                  }}
                  className="grid h-8 w-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                  aria-label="Eliminar promoción"
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
              <Clock className="h-3.5 w-3.5" />
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
              Crea tu primera promoción para comenzar
            </p>
            <button
              onClick={openCreateDialog}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Crear Promoción
            </button>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingPromo ? "Editar Promoción" : "Nueva Promoción"}
            </DialogTitle>
            <DialogDescription>
              {editingPromo
                ? "Modifica los datos de la promoción"
                : "Completa los datos para crear una nueva promoción"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Nombre de la promoción *
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
                Descripción (opcional)
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder="Describe los detalles de la promoción..."
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
                {editingPromo ? "Guardar cambios" : "Crear promoción"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
