"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";

const links = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Catalog" },
  { href: "/library", label: "My Library", auth: true },
  { href: "/submit", label: "Submit Game", auth: true },
  { href: "/admin", label: "Admin", admin: true },
];

function NavLink({ href, label, active }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-violet-100 text-violet-800"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth()

  const visibleLinks = links.filter((link) => {
    if (link.admin) {
      return isAdmin
    }

    if (link.auth) {
      return isAuthenticated
    }

    return true
  })

  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-violet-700">
            Game Backlog
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={pathname === link.href}
              />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-zinc-400">...</span>
          ) : isAuthenticated ? (
            <>
              <span className="hidden text-sm text-zinc-600 sm:inline">
                {user.username}
              </span>
              <Button variant="secondary" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
