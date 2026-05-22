import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, LogOut, Clock, User, Plus, Minus, ClipboardList, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/app-layout";
import type { OrderItem, PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/empleados")({
  component: EmpleadosPage,
  head: () => ({ meta: [{ title: "Empleados · Rosario Sushi" }] }),
});

const SIDEBAR_ITEMS = [
  { to: "/empleados", label: "Asistencia", icon: UserCheck },
  { to: "/empleados/crear-pedido", label: "Crear Pedido", icon: ClipboardList },
];

function EmpleadosPage() {
  const [activeSection, setActiveSection] = useState<"asistencia" | "crear-pedido">("asistencia");

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} title="Panel Empleados" subtitle="Personal">
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Internal sidebar for sections */}
        <div className="hidden w-56 flex-shrink-0 border-r border-border bg-card/50 p-4 md:block">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection("asistencia")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeSection === "asistencia"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <UserCheck className="h-4 w-4" />
              Asistencia
            </button>
            <button
              onClick={() => setActiveSection("crear-pedido")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeSection === "crear-pedido"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <ClipboardList className="h-4 w-4" />
              Crear Pedido
            </button>
          </nav>
        </div>

        {/* Mobile tabs */}
        <div className="flex flex-col w-full">
          <div className="flex border-b border-border md:hidden">
            <button
              onClick={() => setActiveSection("asistencia")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeSection === "asistencia"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Asistencia
            </button>
            <button
              onClick={() => setActiveSection("crear-pedido")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeSection === "crear-pedido"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Crear Pedido
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeSection === "asistencia" ? <AsistenciaSection /> : <CrearPedidoSection />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function AsistenciaSection() {
  const { employees, attendance, recordAttendance } = useStore();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = attendance.filter((a) => a.date === today);

  const handleFicharLlegada = () => {
    if (!selectedEmployee) {
      toast.error("Selecciona un empleado");
      return;
    }

    const employee = employees.find((e) => e.id === selectedEmployee);
    if (!employee) return;

    const existingRecord = todayAttendance.find((a) => a.employeeId === selectedEmployee);
    if (existingRecord?.checkIn) {
      toast.error("El empleado ya fichó llegada hoy");
      return;
    }

    recordAttendance(selectedEmployee, "entrada");
    toast.success(`${employee.name} fichó llegada`);
    setSelectedEmployee("");
  };

  const handleFicharSalida = () => {
    if (!selectedEmployee) {
      toast.error("Selecciona un empleado");
      return;
    }

    const employee = employees.find((e) => e.id === selectedEmployee);
    if (!employee) return;

    const existingRecord = todayAttendance.find(
      (a) => a.employeeId === selectedEmployee && a.checkIn && !a.checkOut
    );

    if (!existingRecord) {
      toast.error("El empleado no tiene fichaje de llegada hoy");
      return;
    }

    recordAttendance(selectedEmployee, "salida");
    toast.success(`${employee.name} fichó salida`);
    setSelectedEmployee("");
  };

  const selectedEmpData = employees.find((e) => e.id === selectedEmployee);
  const selectedEmpAttendance = selectedEmployee
    ? todayAttendance.find((a) => a.employeeId === selectedEmployee)
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Control de Asistencia</h1>
        <p className="text-sm text-muted-foreground">
          Ficha tu entrada y salida del turno
        </p>
      </div>

      {/* Selector de Empleado */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <User className="h-5 w-5 text-primary" />
          Seleccionar Empleado
        </h2>

        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="h-12 w-full rounded-lg border border-border bg-background px-4 text-base"
        >
          <option value="">Selecciona tu nombre...</option>
          {employees
            .filter((e) => e.active)
            .map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} - {emp.role}
              </option>
            ))}
        </select>

        {/* Estado Actual del Empleado */}
        {selectedEmpData && (
          <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">{selectedEmpData.name}</div>
                <div className="text-sm text-muted-foreground">{selectedEmpData.role}</div>
              </div>
              <div className="ml-auto text-right">
                {selectedEmpAttendance?.checkIn && !selectedEmpAttendance?.checkOut ? (
                  <>
                    <div className="text-xs text-muted-foreground">Hora de llegada</div>
                    <div className="font-display text-xl font-bold text-success">
                      {selectedEmpAttendance.checkIn}
                    </div>
                  </>
                ) : selectedEmpAttendance?.checkOut ? (
                  <>
                    <div className="text-xs text-muted-foreground">Turno completado</div>
                    <div className="text-sm">
                      {selectedEmpAttendance.checkIn} - {selectedEmpAttendance.checkOut}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Sin fichaje hoy</div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Botones de Fichaje */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={handleFicharLlegada}
          disabled={!selectedEmployee}
          className="flex h-32 flex-col items-center justify-center gap-3 rounded-2xl bg-success text-success-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          <LogIn className="h-10 w-10" />
          <span className="text-xl font-bold">Fichar Entrada</span>
        </button>

        <button
          onClick={handleFicharSalida}
          disabled={!selectedEmployee}
          className="flex h-32 flex-col items-center justify-center gap-3 rounded-2xl bg-danger text-danger-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          <LogOut className="h-10 w-10" />
          <span className="text-xl font-bold">Fichar Salida</span>
        </button>
      </div>

      {/* Registros de Hoy */}
      {todayAttendance.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
            <Clock className="h-5 w-5 text-primary" />
            Registros de Hoy
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {todayAttendance.map((record) => (
              <div
                key={record.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3",
                  record.status === "turno_activo"
                    ? "border-success/40 bg-success/5"
                    : record.status === "presente"
                    ? "border-border bg-muted/50"
                    : "border-danger/40 bg-danger/5"
                )}
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{record.employeeName}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {record.checkIn && <span>Entrada: {record.checkIn}</span>}
                    {record.checkOut && <span>· Salida: {record.checkOut}</span>}
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    record.status === "turno_activo"
                      ? "bg-success/20 text-success"
                      : record.status === "presente"
                      ? "bg-muted text-muted-foreground"
                      : "bg-danger/20 text-danger"
                  )}
                >
                  {record.status === "turno_activo"
                    ? "En turno"
                    : record.status === "presente"
                    ? "Completo"
                    : "Ausente"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CrearPedidoSection() {
  const { products, addOrder } = useStore();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [phone, setPhone] = useState("");

  const addItem = (product: typeof products[0]) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          qty: 1,
          unitPrice: product.priceMostrador,
        },
      ];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing && existing.qty > 1) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: i.qty - 1 } : i
        );
      }
      return prev.filter((i) => i.productId !== productId);
    });
  };

  const total = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }
    const order = addOrder(items, paymentMethod, "CAJA", phone || undefined);
    toast.success(`Pedido #${order.ticket} creado`);
    setItems([]);
    setPhone("");
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Crear Pedido</h1>
        <p className="text-sm text-muted-foreground">
          Toma una nueva orden para un cliente
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Products */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-display text-lg font-bold">Productos</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {products.map((product) => {
              const qty = items.find((i) => i.productId === product.id)?.qty || 0;
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-primary font-semibold">
                      ${product.priceMostrador.toLocaleString("es-AR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeItem(product.id)}
                      disabled={qty === 0}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background hover:bg-accent disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-semibold">{qty}</span>
                    <button
                      onClick={() => addItem(product)}
                      className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Order Summary */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-display text-lg font-bold">Resumen del Pedido</h3>

          {items.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Agrega productos al pedido
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>
                    {item.qty}x {item.name}
                  </span>
                  <span className="font-semibold">
                    ${(item.unitPrice * item.qty).toLocaleString("es-AR")}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-2">
                <div className="flex justify-between font-display text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toLocaleString("es-AR")}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Teléfono (opcional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="341 555 1234"
                className="h-10 w-full rounded-lg border border-border bg-background px-3"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="DEBITO">Débito</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={items.length === 0}
            className="mt-4 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Crear Pedido
          </button>
        </section>
      </div>
    </div>
  );
}
