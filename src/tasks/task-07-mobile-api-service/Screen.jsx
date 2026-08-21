import { useState } from "react";
import { Text } from "react-native";
import {
  Screen,
  PageHeader,
  SectionCard,
  Code,
  Button,
  Row,
  Badge,
  KeyValue
} from "../../shared/ui";
import { useTheme } from "../../hooks";
import { getProducts, getBroken, request, withRetry, ApiError } from "../../services";
import { type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);

  const note = message =>
    setLog(list => [`${new Date().toLocaleTimeString()} — ${message}`, ...list].slice(0, 8));

  async function run(label, operation) {
    setBusy(true);
    note(`→ ${label}`);
    const started = Date.now();

    try {
      const result = await operation();
      note(`✓ ${label} in ${Date.now() - started}ms — ${JSON.stringify(result).slice(0, 60)}…`);
    } catch (error) {
      note(
        `✗ ${error.name}: ${error.message} (kind: ${error.kind ?? "—"}, status: ${error.status ?? "none"})`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        number={7}
        title="Mobile API Service"
        brief="Create reusable API service functions with timeout, error normalization, and retry helper"
        lead="A phone loses signal in a lift. That single fact is why a mobile service layer needs more than the web version."
      />

      <SectionCard
        title="Try every outcome"
        note="Four buttons, four different failure modes. The error message distinguishes them, which is the whole point of normalising."
      >
        <Row>
          <Button
            label="success"
            size="sm"
            disabled={busy}
            onPress={() => run("getProducts", () => getProducts({ limit: 3 }))}
          />
          <Button
            label="404"
            size="sm"
            variant="ghost"
            disabled={busy}
            onPress={() => run("getBroken", () => getBroken())}
          />
          <Button
            label="timeout"
            size="sm"
            variant="ghost"
            disabled={busy}
            onPress={() => run("1ms timeout", () => getProducts({ limit: 3 }, { timeout: 1 }))}
          />
          <Button
            label="offline"
            size="sm"
            variant="ghost"
            disabled={busy}
            onPress={() =>
              run("dead host", () =>
                request("/x", { timeout: 4000 }).catch(() =>
                  fetch("https://no-such-host-9x7q.dev/x").then(r => r.json())
                )
              )
            }
          />
          <Button
            label="retry x3"
            size="sm"
            variant="ghost"
            disabled={busy}
            onPress={() =>
              run("withRetry on a 500-ish path", () =>
                withRetry(({ signal }) => getProducts({ limit: 2 }, { signal, timeout: 1 }), {
                  attempts: 3
                })
              )
            }
          />
        </Row>

        <Code>{log.length ? log.map(line => `> ${line}`).join("\n") : "> nothing yet"}</Code>
      </SectionCard>

      <SectionCard
        title="What the wrapper centralises"
        note="Every one of these is something you'd otherwise forget in three of five call sites."
      >
        <KeyValue
          items={[
            ["Base URL", "one constant, not a string in every screen"],
            ["res.ok checking", "fetch does NOT reject on 404 or 500"],
            ["Timeout", "fetch has none — a dead request hangs forever"],
            ["Abort forwarding", "a screen unmounting must cancel its request"],
            ["Error shape", "one ApiError, with a kind and a status"],
            ["Retry", "with backoff, and only for what's worth retrying"]
          ]}
        />
      </SectionCard>

      <SectionCard
        title="Errors carry a kind, not just a message"
        note="A screen shouldn't parse text to decide what to show. On mobile the offline case deserves its own wording."
      >
        <Code>{`export class ApiError extends Error {
  constructor(message, { status, url, kind = "http" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;        // "http" | "network" | "timeout" | "parse"
  }

  get isRetryable() {
    return this.kind === "network" || this.kind === "timeout" || this.status >= 500;
  }
}

// A screen then does:
{error.kind === "network" ? "You're offline" : "Something went wrong"}`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Press <Text style={{ fontWeight: "700" }}>404</Text> and{" "}
          <Text style={{ fontWeight: "700" }}>timeout</Text> above and compare the log lines — one
          has a status, the other has a kind and no status.
        </Text>
      </SectionCard>

      <SectionCard
        title="Timeout, because fetch doesn't have one"
        note="A request to a host that accepts the connection and then says nothing will wait indefinitely. On a train, that's most requests."
      >
        <Code>{`const controller = new AbortController();
const timer = setTimeout(() => controller.abort("timeout"), timeout);

if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

try {
  const response = await fetch(url, { signal: controller.signal, ...options });
  …
} finally {
  clearTimeout(timer);       // always — both paths
}`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Forwarding the caller’s signal is the part that’s easy to miss. Without it a screen’s
          cleanup passes a signal that does nothing, and the response still lands on an unmounted
          component.
        </Text>
      </SectionCard>

      <SectionCard
        title="Retry with backoff, and jitter"
        note="Retrying a 404 just makes the user wait longer for the same answer. Retry what's actually transient."
      >
        <Code>{`export async function withRetry(operation, { attempts = 3, baseDelay = 400 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation({ attempt });
    } catch (error) {
      if (error.name === "AbortError") throw error;
      if (error instanceof ApiError && !error.isRetryable) throw error;
      if (attempt === attempts - 1) throw error;

      // 400ms, 800ms, 1600ms — plus jitter
      await sleep(baseDelay * 2 ** attempt + Math.random() * 200);
    }
  }
}`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          The jitter matters more on mobile than anywhere else: when a cell tower comes back, every
          phone on it retries at once. Random spread turns a spike into a curve.
        </Text>
      </SectionCard>

      <SectionCard
        title="Normalising a wobbly endpoint"
        note="The categories endpoint has shipped as both string[] and object[]. The service absorbs that so no screen has to."
      >
        <Code>{`export async function getCategories(options = {}) {
  const data = await request("/products/categories", options);

  return data.map(item =>
    typeof item === "string" ? { slug: item, name: item }
                             : { slug: item.slug, name: item.name }
  );
}`}</Code>
        <Row>
          <Badge label="no screen imports fetch" tone="success" />
          <Badge label="no screen sees a URL" tone="success" />
        </Row>
      </SectionCard>
    </Screen>
  );
}
