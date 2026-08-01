"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const PLACEHOLDER = `{\n  "hello": "world"\n}`;

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");

  const { formatted, error } = useMemo(() => {
    if (!input.trim()) return { formatted: "", error: null };
    try {
      const parsed = JSON.parse(input);
      return { formatted: JSON.stringify(parsed, null, 2), error: null };
    } catch (err) {
      return {
        formatted: "",
        error: err instanceof Error ? err.message : "Invalid JSON",
      };
    }
  }, [input]);

  async function copyOutput() {
    if (formatted) await navigator.clipboard.writeText(formatted);
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">JSON formatter &amp; validator</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <p className="mb-2 text-xs font-medium text-muted">Input</p>
          <Textarea
            rows={16}
            placeholder={PLACEHOLDER}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-xs"
          />
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted">Formatted output</p>
            <Button
              variant="ghost"
              onClick={copyOutput}
              disabled={!formatted}
              className="px-2 py-1 text-xs"
            >
              Copy
            </Button>
          </div>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <pre className="max-h-[26rem] overflow-auto whitespace-pre-wrap break-all font-mono text-xs">
              {formatted || (
                <span className="text-muted">Formatted JSON will appear here.</span>
              )}
            </pre>
          )}
        </Card>
      </div>
    </div>
  );
}
