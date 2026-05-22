import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Employee,
  Order,
  OrderItem,
  OrderOrigin,
  OrderStatus,
  PaymentMethod,
  Product,
  Promocion,
  AttendanceRecord,
} from "./types";

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Combo Sakura · 15 piezas",
    description: "Mix variado de niguiris, makis y rolls de salmón.",
    priceMostrador: 8500,
    pricePedidosYa: 10200,
    stock: 24,
    category: "Combos",
  },
  {
    id: "p2",
    name: "Combo Geisha · 30 piezas",
    description: "Selección clásica para 2 personas.",
    priceMostrador: 15500,
    pricePedidosYa: 18600,
    stock: 12,
    category: "Combos",
  },
  {
    id: "p3",
    name: "Combo Shogun · 50 piezas",
    description: "El más pedido. Ideal para compartir.",
    priceMostrador: 24500,
    pricePedidosYa: 29400,
    stock: 8,
    category: "Combos",
  },
  {
    id: "p4",
    name: "Combo Veggie · 20 piezas",
    description: "Palta, pepino, mango y queso crema.",
    priceMostrador: 9800,
    pricePedidosYa: 11800,
    stock: 15,
    category: "Veggie",
  },
  {
    id: "p5",
    name: "Roll Philadelphia x10",
    description: "Salmón, queso crema y palta.",
    priceMostrador: 6900,
    pricePedidosYa: 8300,
    stock: 30,
    category: "Rolls",
  },
  {
    id: "p6",
    name: "Sake Hot 330ml",
    description: "Bebida tradicional japonesa caliente.",
    priceMostrador: 3500,
    pricePedidosYa: 4200,
    stock: 20,
    category: "Bebidas",
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "e1", name: "Lucía Fernández", role: "Caja", active: true, checkedIn: true },
  { id: "e2", name: "Mateo Rossi", role: "Sushiman", active: true, checkedIn: true },
  { id: "e3", name: "Camila Torres", role: "Sushiman", active: true, checkedIn: false },
  { id: "e4", name: "Diego Pérez", role: "Cadete", active: false, checkedIn: false },
];

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

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att1",
    employeeId: "e1",
    employeeName: "Lucía Fernández",
    date: today,
    checkIn: "09:00",
    checkOut: null,
    status: "turno_activo",
  },
  {
    id: "att2",
    employeeId: "e2",
    employeeName: "Mateo Rossi",
    date: today,
    checkIn: "10:30",
    checkOut: null,
    status: "turno_activo",
  },
  {
    id: "att3",
    employeeId: "e1",
    employeeName: "Lucía Fernández",
    date: yesterday,
    checkIn: "09:15",
    checkOut: "18:00",
    status: "presente",
  },
  {
    id: "att4",
    employeeId: "e2",
    employeeName: "Mateo Rossi",
    date: yesterday,
    checkIn: "10:00",
    checkOut: "19:30",
    status: "presente",
  },
  {
    id: "att5",
    employeeId: "e3",
    employeeName: "Camila Torres",
    date: yesterday,
    checkIn: null,
    checkOut: null,
    status: "ausente",
  },
];

function mkOrder(
  ticket: number,
  origin: OrderOrigin,
  items: OrderItem[],
  paymentMethod: PaymentMethod,
  minutesAgo: number,
  status: OrderStatus = "NUEVO",
  phone?: string,
): Order {
  return {
    id: crypto.randomUUID(),
    ticket,
    origin,
    items,
    total: items.reduce((s, i) => s + i.unitPrice * i.qty, 0),
    paymentMethod,
    status,
    phone,
    createdAt: Date.now() - minutesAgo * 60_000,
  };
}

const INITIAL_ORDERS: Order[] = [
  mkOrder(
    1001,
    "CAJA",
    [{ productId: "p1", name: "Combo Sakura · 15 piezas", qty: 1, unitPrice: 8500 }],
    "EFECTIVO",
    4,
    "NUEVO",
    "3415551234",
  ),
  mkOrder(
    1002,
    "PEDIDOS_YA",
    [{ productId: "p3", name: "Combo Shogun · 50 piezas", qty: 1, unitPrice: 29400 }],
    "PEDIDOS_YA_ONLINE",
    18,
    "PENDIENTE",
  ),
  mkOrder(
    1003,
    "CAJA",
    [
      { productId: "p2", name: "Combo Geisha · 30 piezas", qty: 1, unitPrice: 15500 },
      { productId: "p6", name: "Sake Hot 330ml", qty: 2, unitPrice: 3500 },
    ],
    "TRANSFERENCIA",
    33,
    "PENDIENTE",
    "3415559876",
  ),
  mkOrder(
    1004,
    "PEDIDOS_YA",
    [{ productId: "p4", name: "Combo Veggie · 20 piezas", qty: 1, unitPrice: 11800 }],
    "PEDIDOS_YA_ONLINE",
    9,
    "NUEVO",
  ),
];

// Yesterday/today closed orders for dashboard
const HISTORY_ORDERS: Order[] = Array.from({ length: 24 }).map((_, i) => {
  const products = [
    { p: INITIAL_PRODUCTS[0], pay: "EFECTIVO" as PaymentMethod },
    { p: INITIAL_PRODUCTS[1], pay: "DEBITO" as PaymentMethod },
    { p: INITIAL_PRODUCTS[2], pay: "PEDIDOS_YA_ONLINE" as PaymentMethod },
    { p: INITIAL_PRODUCTS[3], pay: "TRANSFERENCIA" as PaymentMethod },
    { p: INITIAL_PRODUCTS[4], pay: "CREDITO" as PaymentMethod },
  ];
  const pick = products[i % products.length];
  return mkOrder(
    900 + i,
    i % 3 === 0 ? "PEDIDOS_YA" : "CAJA",
    [{ productId: pick.p.id, name: pick.p.name, qty: 1 + (i % 3), unitPrice: pick.p.priceMostrador }],
    pick.pay,
    60 * (1 + i),
    "ENTREGADO",
  );
});

interface StoreCtx {
  products: Product[];
  orders: Order[];
  employees: Employee[];
  promociones: Promocion[];
  attendance: AttendanceRecord[];
  nextTicket: number;
  addOrder: (
    items: OrderItem[],
    paymentMethod: PaymentMethod,
    origin: OrderOrigin,
    phone?: string,
  ) => Order;
  advanceOrder: (id: string) => void;
  toggleCheckIn: (id: string) => void;
  addEmployee: (name: string, role: string) => void;
  removeEmployee: (id: string) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  addProduct: (p: Omit<Product, "id">) => void;
  removeProduct: (id: string) => void;
  applyMassIncrease: (percent: number) => void;
  addPromocion: (p: Omit<Promocion, "id">) => void;
  updatePromocion: (id: string, patch: Partial<Promocion>) => void;
  removePromocion: (id: string) => void;
  togglePromocion: (id: string) => void;
  recordAttendance: (employeeId: string, type: "entrada" | "salida") => void;
  now: number;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([...INITIAL_ORDERS, ...HISTORY_ORDERS]);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [promociones, setPromociones] = useState<Promocion[]>(INITIAL_PROMOCIONES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [nextTicket, setNextTicket] = useState(1005);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const addOrder = useCallback<StoreCtx["addOrder"]>(
    (items, paymentMethod, origin, phone) => {
      const order: Order = {
        id: crypto.randomUUID(),
        ticket: nextTicket,
        origin,
        items,
        total: items.reduce((s, i) => s + i.unitPrice * i.qty, 0),
        paymentMethod,
        status: "NUEVO",
        phone,
        createdAt: Date.now(),
      };
      setNextTicket((t) => t + 1);
      setOrders((o) => [order, ...o]);
      return order;
    },
    [nextTicket],
  );

  const advanceOrder = useCallback((id: string) => {
    setOrders((o) =>
      o.map((order) => {
        if (order.id !== id) return order;
        const next: Record<OrderStatus, OrderStatus> = {
          NUEVO: "PENDIENTE",
          PENDIENTE: "LISTO",
          LISTO: "ENTREGADO",
          ENTREGADO: "ENTREGADO",
        };
        return { ...order, status: next[order.status] };
      }),
    );
  }, []);

  const toggleCheckIn = useCallback((id: string) => {
    setEmployees((e) =>
      e.map((emp) => (emp.id === id ? { ...emp, checkedIn: !emp.checkedIn } : emp)),
    );
  }, []);

  const addEmployee = useCallback((name: string, role: string) => {
    setEmployees((e) => [
      ...e,
      { id: crypto.randomUUID(), name, role, active: true, checkedIn: false },
    ]);
  }, []);

  const removeEmployee = useCallback((id: string) => {
    setEmployees((e) => e.filter((emp) => emp.id !== id));
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setProducts((ps) => [...ps, { ...p, id: crypto.randomUUID() }]);
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((ps) => ps.filter((p) => p.id !== id));
  }, []);

  const applyMassIncrease = useCallback((percent: number) => {
    const round50 = (n: number) => Math.round(n / 50) * 50;
    setProducts((ps) =>
      ps.map((p) => ({
        ...p,
        priceMostrador: round50(p.priceMostrador * (1 + percent / 100)),
        pricePedidosYa: round50(p.pricePedidosYa * (1 + percent / 100)),
      })),
    );
  }, []);

  const addPromocion = useCallback((p: Omit<Promocion, "id">) => {
    setPromociones((ps) => [...ps, { ...p, id: crypto.randomUUID() }]);
  }, []);

  const updatePromocion = useCallback((id: string, patch: Partial<Promocion>) => {
    setPromociones((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const removePromocion = useCallback((id: string) => {
    setPromociones((ps) => ps.filter((p) => p.id !== id));
  }, []);

  const togglePromocion = useCallback((id: string) => {
    setPromociones((ps) =>
      ps.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p))
    );
  }, []);

  const recordAttendance = useCallback((employeeId: string, type: "entrada" | "salida") => {
    const todayStr = new Date().toISOString().split("T")[0];
    const timeNow = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setAttendance((prev) => {
      const existingRecord = prev.find(
        (a) => a.employeeId === employeeId && a.date === todayStr
      );

      if (type === "entrada") {
        if (existingRecord?.checkIn) return prev;
        const employee = employees.find((e) => e.id === employeeId);
        if (!employee) return prev;

        if (existingRecord) {
          return prev.map((a) =>
            a.id === existingRecord.id
              ? { ...a, checkIn: timeNow, status: "turno_activo" as const }
              : a
          );
        } else {
          const newRecord: AttendanceRecord = {
            id: crypto.randomUUID(),
            employeeId,
            employeeName: employee.name,
            date: todayStr,
            checkIn: timeNow,
            checkOut: null,
            status: "turno_activo",
          };
          return [newRecord, ...prev];
        }
      } else {
        if (!existingRecord || !existingRecord.checkIn || existingRecord.checkOut) return prev;
        return prev.map((a) =>
          a.id === existingRecord.id
            ? { ...a, checkOut: timeNow, status: "presente" as const }
            : a
        );
      }
    });

    if (type === "entrada" || type === "salida") {
      toggleCheckIn(employeeId);
    }
  }, [employees, toggleCheckIn]);

  const value = useMemo<StoreCtx>(
    () => ({
      products,
      orders,
      employees,
      promociones,
      attendance,
      nextTicket,
      addOrder,
      advanceOrder,
      toggleCheckIn,
      addEmployee,
      removeEmployee,
      updateProduct,
      addProduct,
      removeProduct,
      applyMassIncrease,
      addPromocion,
      updatePromocion,
      removePromocion,
      togglePromocion,
      recordAttendance,
      now,
    }),
    [
      products,
      orders,
      employees,
      promociones,
      attendance,
      nextTicket,
      addOrder,
      advanceOrder,
      toggleCheckIn,
      addEmployee,
      removeEmployee,
      updateProduct,
      addProduct,
      removeProduct,
      applyMassIncrease,
      addPromocion,
      updatePromocion,
      removePromocion,
      togglePromocion,
      recordAttendance,
      now,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
