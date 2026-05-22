import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, LogIn, LogOut, Clock, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/empleados")({
  component: EmpleadosPage,
  head: () => ({ meta: [{ title: "Empleados · Rosario Sushi" }] }),
});

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "presente" | "ausente" | "turno_activo";
}

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att1",
    employeeId: "e1",
    employeeName: "Lucia Fernandez",
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:00",
    checkOut: null,
    status: "turno_activo",
  },
  {
    id: "att2",
    employeeId: "e2",
    employeeName: "Mateo Rossi",
    date: new Date().toISOString().split("T")[0],
    checkIn: "10:30",
    checkOut: null,
    status: "turno_activo",
  },
  {
    id: "att3",
    employeeId: "e1",
    employeeName: "Lucia Fernandez",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    checkIn: "09:15",
    checkOut: "18:00",
    status: "presente",
  },
  {
    id: "att4",
    employeeId: "e2",
    employeeName: "Mateo Rossi",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    checkIn: "10:00",
    checkOut: "19:30",
    status: "presente",
  },
  {
    id: "att5",
    employeeId: "e3",
    employeeName: "Camila Torres",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    checkIn: null,
    checkOut: null,
    status: "ausente",
  },
];

function EmpleadosPage() {
  const { employees, addEmployee, removeEmployee, toggleCheckIn } = useStore();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [newEmp, setNewEmp] = useState({ name: "", role: "Sushiman" });
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  const today = new Date().toISOString().split("T")[0];

  const handleFicharLlegada = () => {
    if (!selectedEmployee) {
      toast.error("Selecciona un empleado");
      return;
    }

    const employee = employees.find((e) => e.id === selectedEmployee);
    if (!employee) return;

    const existingRecord = attendance.find(
      (a) => a.employeeId === selectedEmployee && a.date === today
    );

    if (existingRecord?.checkIn) {
      toast.error("El empleado ya ficho llegada hoy");
      return;
    }

    const now = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (existingRecord) {
      setAttendance((prev) =>
        prev.map((a) =>
          a.id === existingRecord.id
            ? { ...a, checkIn: now, status: "turno_activo" }
            : a
        )
      );
    } else {
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        employeeId: selectedEmployee,
        employeeName: employee.name,
        date: today,
        checkIn: now,
        checkOut: null,
        status: "turno_activo",
      };
      setAttendance((prev) => [newRecord, ...prev]);
    }

    toggleCheckIn(selectedEmployee);
    toast.success(`${employee.name} ficho llegada a las ${now}`);
    setSelectedEmployee("");
  };

  const handleFicharSalida = () => {
    if (!selectedEmployee) {
      toast.error("Selecciona un empleado");
      return;
    }

    const employee = employees.find((e) => e.id === selectedEmployee);
    if (!employee) return;

    const existingRecord = attendance.find(
      (a) => a.employeeId === selectedEmployee && a.date === today && a.checkIn && !a.checkOut
    );

    if (!existingRecord) {
      toast.error("El empleado no tiene fichaje de llegada hoy");
      return;
    }

    const now = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setAttendance((prev) =>
      prev.map((a) =>
        a.id === existingRecord.id
          ? { ...a, checkOut: now, status: "presente" }
          : a
      )
    );

    toggleCheckIn(selectedEmployee);
    toast.success(`${employee.name} ficho salida a las ${now}`);
    setSelectedEmployee("");
  };

  const todayAttendance = attendance.filter((a) => a.date === today);
  const pastAttendance = attendance.filter((a) => a.date !== today);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Empleados</h1>
        <p className="text-sm text-muted-foreground">
          Gestion de empleados y control de asistencia
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Empleados
          </div>
          <div className="mt-1 font-display text-2xl font-bold">{employees.length}</div>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-success">
            En Turno
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

      {/* Control de Asistencia */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Clock className="h-5 w-5 text-primary" />
          Control de Horarios
        </h2>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-sm font-medium">Seleccionar Empleado</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="">Selecciona un empleado...</option>
              {employees
                .filter((e) => e.active)
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.role}
                  </option>
                ))}
            </select>
          </div>

          <button
            onClick={handleFicharLlegada}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-success px-5 font-semibold text-success-foreground transition-opacity hover:opacity-90"
          >
            <LogIn className="h-4 w-4" />
            Fichar Llegada
          </button>

          <button
            onClick={handleFicharSalida}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-danger px-5 font-semibold text-danger-foreground transition-opacity hover:opacity-90"
          >
            <LogOut className="h-4 w-4" />
            Fichar Salida
          </button>
        </div>

        {/* Asistencia de Hoy */}
        {todayAttendance.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              Registros de Hoy ({new Date().toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" })})
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                        ? "bg-success/20 text-success-foreground"
                        : record.status === "presente"
                        ? "bg-muted text-muted-foreground"
                        : "bg-danger/20 text-danger-foreground"
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
          </div>
        )}
      </section>

      {/* Historial de Asistencia */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Calendar className="h-5 w-5 text-primary" />
          Historial de Asistencia
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">Empleado</th>
                <th className="py-2 pr-3">Dia</th>
                <th className="py-2 pr-3">Hora Ingreso</th>
                <th className="py-2 pr-3">Hora Salida</th>
                <th className="py-2 pr-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pastAttendance.map((record) => (
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
                        record.status === "presente"
                          ? "bg-success/20 text-success-foreground"
                          : "bg-danger/20 text-danger-foreground"
                      )}
                    >
                      {record.status === "presente" ? "Presente" : "Ausente"}
                    </span>
                  </td>
                </tr>
              ))}
              {pastAttendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No hay registros anteriores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lista de Empleados */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-display text-lg font-bold">Lista de Empleados</h3>
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
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {e.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-xs">
                    {e.checkedIn ? (
                      <span className="text-success">En turno</span>
                    ) : (
                      <span className="text-muted-foreground">Fuera</span>
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
