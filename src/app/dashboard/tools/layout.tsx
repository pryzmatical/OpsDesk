import Link from "next/link";

const TOOLS = [
  { href: "/dashboard/tools/json-formatter", label: "JSON formatter" },
  { href: "/dashboard/tools/slug-generator", label: "Slug generator" },
  { href: "/dashboard/tools/text-diff", label: "Text diff" },
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav className="mb-6 flex gap-1 border-b border-border">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="px-3 py-2 text-sm text-muted hover:text-foreground"
          >
            {tool.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
