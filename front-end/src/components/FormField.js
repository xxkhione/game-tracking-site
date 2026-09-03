export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  error,
  placeholder,
  as = "input",
  options = [],
}) {
  const sharedClasses =
    "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
      {as === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={sharedClasses}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={4}
          className={sharedClasses}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={sharedClasses}
        />
      )}
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </label>
  );
}
