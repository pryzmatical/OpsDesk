"use client";

import { useMemo, useState } from "react";
import { diffLines } from "diff";
import { Card } from "@/components/ui/Card";
import { Textarea, Label } from "@/components/ui/Input";

export default function TextDiffPage() {
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");

  const changes = useMemo(() => diffLines(before, after), [before, after]);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Text diff</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <Label htmlFor="before">Before</Label>
          <Textarea
            id="before"
            rows={10}
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            className="font-mono text-xs"
          />
        </Card>
        <Card className="p-4">
          <Label htmlFor="after">After</Label>
          <Textarea
            id="after"
            rows={10}
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            className="font-mono text-xs"
          />
        </Card>
      </div>

      <Card className="mt-4 p-4">
        <p className="mb-2 text-xs font-medium text-muted">Diff</p>
        <pre className="max-h-[26rem] overflow-auto whitespace-pre-wrap font-mono text-xs">
          {before || after ? (
            changes.map((change, i) => (
              <span
                key={i}
                className={
                  change.added
                    ? "block bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : change.removed
                      ? "block bg-red-500/15 text-red-700 line-through dark:text-red-400"
                      : "block text-muted"
                }
              >
                {change.value}
              </span>
            ))
          ) : (
            <span className="text-muted">The diff will appear here.</span>
          )}
        </pre>
      </Card>
    </div>
  );
}
