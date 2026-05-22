import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Clock, Phone, ShoppingBag, Star, Menu, X, Percent, Tag } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Rosario Sushi · Sushi para llevar en Rosario" },
      {
        name: "description",
        content:
          "Combos de sushi para retiro en local o por PedidosYa. Calidad japonesa en el corazón de Rosario.",
      },
    ],
  }),
});

function Landing() {
  const { products, promociones } = useStore();
  const combos = products.filter((p) => p.category === "Combos" || p.category === "Veggie");
  const activePromociones = promociones.filter((p) => p.activa);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,oklch(0.58_0.21_18/0.18),transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <Star className="h-3 w-3 fill-primary text-primary" />
              Sushi premium · Rosario
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Sabor japonés,{" "}
              <span className="bg-gradient-to-r from-primary to-[oklch(0.7_0.18_40)] bg-clip-text text-transparent">
                hecho a mano
              </span>{" "}
              cada día.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Combos pensados para compartir, ingredientes frescos y la mejor relación
              precio-calidad de la ciudad. Retirá por el local o pedí por PedidosYa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://www.pedidosya.com.ar"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-lg bg-[#FA0050] px-6 py-3 font-semibold text-white shadow-lg shadow-[#FA0050]/30 transition-transform hover:scale-[1.02]"
              >
                <ShoppingBag className="h-5 w-5" />
                Pedir por PedidosYa
              </a>
              <button
                onClick={() => setMenuOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-semibold hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
                Ver carta completa
              </button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6 text-sm">
              <div>
                <dt className="text-muted-foreground">Combos</dt>
                <dd className="font-display text-2xl font-bold">{combos.length}+</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Años</dt>
                <dd className="font-display text-2xl font-bold">7</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rating</dt>
                <dd className="font-display text-2xl font-bold">4.8★</dd>
              </div>
            </dl>
          </div>
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-secondary shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=900&q=80"
                alt="Combo de sushi premium"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-4 shadow-xl md:block">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Tiempo promedio</div>
                  <div className="font-display text-lg font-bold">25 min</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMOCIONES ACTIVAS */}
      {activePromociones.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Ofertas especiales
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold">Promociones Activas</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePromociones.map((promo) => (
              <article
                key={promo.id}
                className="group overflow-hidden rounded-2xl border-2 border-primary/20 bg-[oklch(0.97_0.02_20)] p-6 transition-all hover:border-primary/40 hover:shadow-lg dark:bg-[oklch(0.25_0.03_20)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    <Percent className="h-3.5 w-3.5" />
                    {promo.descuento}% OFF
                  </span>
                  <Tag className="h-5 w-5 text-primary/60" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{promo.nombre}</h3>
                {promo.descripcion && (
                  <p className="mt-2 text-sm text-muted-foreground">{promo.descripcion}</p>
                )}
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Válido hasta{" "}
                  {new Date(promo.fechaFin).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "long",
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* COMBOS */}
      <section id="combos" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Nuestra carta
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold">Combos destacados</h2>
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            className="hidden text-sm font-medium text-primary hover:underline md:inline"
          >
            Ver carta completa →
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map((c, i) => (
            <article
              key={c.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={`https://images.unsplash.com/photo-${
                    [
                      "1611143669185-af224c5e3252",
                      "1617196034796-73dfa7b1fd56",
                      "1553621042-f6e147245754",
                      "1607301405390-d831c242f59b",
                    ][i % 4]
                  }?w=600&q=80`}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">{c.name}</h3>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs">
                    {c.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-display text-2xl font-bold text-primary">
                    ${c.priceMostrador.toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs text-muted-foreground">Precio mostrador</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Quiénes somos
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold">
              Sushi artesanal desde 2018.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Somos un local familiar de Rosario dedicado a la cocina japonesa. Cada pieza se
              arma a mano, todos los días, con pescado fresco y arroz seleccionado. No hacemos
              delivery propio: priorizamos la calidad sobre la velocidad, ofreciendo retiro por
              local y envío a través de PedidosYa.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <Clock className="h-5 w-5 text-primary" />
                <div className="mt-2 font-semibold">Horarios</div>
                <div className="text-sm text-muted-foreground">Mar-Dom · 19:00 - 23:30</div>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <Phone className="h-5 w-5 text-primary" />
                <div className="mt-2 font-semibold">Reservas</div>
                <div className="text-sm text-muted-foreground">+54 341 555 0123</div>
              </div>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4">
              {[
                "1617196701537-7329482cc9fe",
                "1564489563601-c53cfc451e93",
                "1546069901-ba9599a7e63c",
                "1583623025817-d180a2221d0a",
              ].map((id) => (
                <img
                  key={id}
                  src={`https://images.unsplash.com/photo-${id}?w=400&q=80`}
                  alt="Galería Rosario Sushi"
                  loading="lazy"
                  className="aspect-square w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Ubicación
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold">Vení a buscarlo.</h2>
            <p className="mt-4 text-muted-foreground">
              Estamos en pleno centro de Rosario. Estacionamiento sobre la cuadra.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <div className="font-semibold">Av. Pellegrini 1234</div>
                <div className="text-sm text-muted-foreground">Rosario, Santa Fe</div>
              </div>
            </div>
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Ubicación Rosario Sushi"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-60.6700%2C-32.9550%2C-60.6500%2C-32.9400&layer=mapnik"
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div>© {new Date().getFullYear()} Rosario Sushi · Todos los derechos reservados.</div>
          <Link to="/empleados" className="hover:text-foreground">Acceso empleados →</Link>
        </div>
      </footer>

      {/* Menu Drawer */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Nuestra Carta</SheetTitle>
            <SheetDescription>
              Todos nuestros productos y combos disponibles
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {["Combos", "Veggie", "Rolls", "Bebidas"].map((category) => {
              const categoryProducts = products.filter((p) => p.category === category);
              if (categoryProducts.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="mb-3 font-display text-lg font-bold text-primary">{category}</h3>
                  <div className="space-y-3">
                    {categoryProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-start justify-between rounded-lg border border-border bg-card p-4"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{product.name}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {product.description}
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="font-display text-lg font-bold text-primary">
                            ${product.priceMostrador.toLocaleString("es-AR")}
                          </div>
                          <div className="text-xs text-muted-foreground">Mostrador</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
