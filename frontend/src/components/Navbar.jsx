import { Link, useLocation } from "react-router-dom";
import { FileBarChart2, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explorador", label: "Explorador" },
  { to: "/docs", label: "Docs" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold text-white no-underline"
        >
          <FileBarChart2 className="h-6 w-6 text-primary-400" />
          <span>Quiz2 Contratos</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
                pathname === link.to
                  ? "bg-surface-800 text-white"
                  : "text-surface-400 hover:bg-surface-800/50 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <Link
            to="/docs"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-primary-500"
          >
            Docs
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg border-none bg-transparent p-2 text-surface-400 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-surface-800 bg-surface-950 px-4 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium no-underline ${
                pathname === link.to
                  ? "bg-surface-800 text-white"
                  : "text-surface-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block rounded-lg bg-primary-600 px-4 py-2 text-center text-sm font-medium text-white no-underline"
          >
            API Docs
          </a>
        </div>
      )}
    </nav>
  );
}
