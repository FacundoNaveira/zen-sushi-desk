import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, Utensils, ClipboardList, Store, LayoutDashboard, Home, Tag, Users } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/caja", label: "Caja", icon: Store },
  { to: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { to: "/promociones", label: "Promociones", icon: Tag },
  { to: "/empleados", label: "Empleados", icon: Users },
  { to: "/admin", label: "Admin", icon: LayoutDashboard },
];

export function Nav() {
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Utensils className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-tight">Rosario Sushi</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Operations OS
            </div>
          </div>
        </Link>
        <nav className="ml-4 hidden gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent",
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <nav className="flex gap-1 md:hidden">
            {links.map((l) => {
              const active = pathname === l.to;
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-md",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                  )}
                  aria-label={l.label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
          <button
            onClick={toggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background hover:bg-accent"
            aria-label="Cambiar tema"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
