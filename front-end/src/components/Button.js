const variants = {
  primary:
    "bg-violet-600 text-white hover:bg-violet-500 focus-visible:outline-violet-600",
  secondary:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 focus-visible:outline-zinc-400",
  inverse:
    "bg-white text-violet-700 hover:bg-violet-50 focus-visible:outline-white",
  "hero-outline":
    "border border-white/30 bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white",
  danger:
    "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
  ghost: "text-violet-700 hover:bg-violet-50 focus-visible:outline-violet-400",
}

export default function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
