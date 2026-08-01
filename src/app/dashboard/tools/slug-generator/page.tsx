"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics (combining marks left behind by NFKD)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export default function SlugGeneratorPage() {
  const [input, setInput] = useState("");
  const slug = useMemo(() => slugify(input), [input]);
  const [copied, setCopied] = useState(false);

  async function copySlug() {
    if (!slug) return;
    await navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Slug generator</h1>
      <Card className="max-w-xl p-4">
        <Label htmlFor="slug-input">Text</Label>
        <Input
          id="slug-input"
          placeholder="e.g. Q2 2026 Product Update!"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <p className="mb-1 mt-4 text-xs font-medium text-muted">Slug</p>
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
          <code className="flex-1 truncate text-sm">
            {slug || <span className="text-muted">your-slug-appears-here</span>}
          </code>
          <Button
            variant="ghost"
            onClick={copySlug}
            disabled={!slug}
            className="px-2 py-1 text-xs"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
