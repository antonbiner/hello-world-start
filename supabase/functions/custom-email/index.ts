import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SmtpConfig {
  email: string;
  password: string;
  displayName?: string;
  smtpServer: string;
  smtpPort: number;
  smtpSecurity: "ssl" | "tls" | "none";
}

interface ImapConfig {
  email: string;
  password: string;
  imapServer: string;
  imapPort: number;
  imapSecurity: "ssl" | "tls" | "none";
}

interface EmailPayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyHtml?: string;
}

// ─── Test Connection ───

async function testConnection(config: SmtpConfig & ImapConfig) {
  // Test SMTP connection
  try {
    const client = new SmtpClient();
    const connectConfig = {
      hostname: config.smtpServer,
      port: config.smtpPort,
      username: config.email,
      password: config.password,
    };

    // Handle SMTP security modes:
    // - "ssl": implicit TLS (usually port 465) -> connectTLS
    // - "tls": prefer STARTTLS if available, otherwise fall back to TLS connect
    // - "none": plain connect
    if (config.smtpSecurity === "ssl") {
      await client.connectTLS(connectConfig);
    } else if (config.smtpSecurity === "tls") {
      // Try plain connect and then STARTTLS if supported by the client
      try {
        await client.connect({ ...connectConfig, // some clients expect hostname/port only for STARTTLS phase
          username: undefined as any,
          password: undefined as any,
        });
        // If the client exposes a startTLS method, use it to upgrade
        if (typeof (client as any).startTLS === 'function') {
          await (client as any).startTLS();
          // After STARTTLS, authenticate
          if (typeof (client as any).auth === 'function') {
            await (client as any).auth(connectConfig.username, connectConfig.password);
          }
        } else {
          // Fallback to explicit TLS connect
          try { await client.close(); } catch {}
          await client.connectTLS(connectConfig);
        }
      } catch {
        // Fallback to explicit TLS connect
        try { await client.close(); } catch {}
        await client.connectTLS(connectConfig);
      }
    } else {
      await client.connect(connectConfig);
    }
    await client.close();
  } catch (err: any) {
    return {
      success: false,
      error: `SMTP connection failed: ${err.message || "Unable to connect to SMTP server"}`,
    };
  }

  return { success: true };
}

// ─── Send Email via SMTP ───

async function sendEmail(config: SmtpConfig, email: EmailPayload) {
  try {
    const client = new SmtpClient();
    const connectConfig = {
      hostname: config.smtpServer,
      port: config.smtpPort,
      username: config.email,
      password: config.password,
    };

    if (config.smtpSecurity === "ssl") {
      await client.connectTLS(connectConfig);
    } else if (config.smtpSecurity === "tls") {
      try {
        await client.connect({ ...connectConfig, username: undefined as any, password: undefined as any });
        if (typeof (client as any).startTLS === 'function') {
          await (client as any).startTLS();
          if (typeof (client as any).auth === 'function') {
            await (client as any).auth(connectConfig.username, connectConfig.password);
          }
        } else {
          try { await client.close(); } catch {}
          await client.connectTLS(connectConfig);
        }
      } catch {
        try { await client.close(); } catch {}
        await client.connectTLS(connectConfig);
      }
    } else {
      await client.connect(connectConfig);
    }

    const fromAddr = config.displayName
      ? `${config.displayName} <${config.email}>`
      : config.email;

    // smtp@v0.7.0 SendConfig only supports from/to/subject/content/html
    // Merge cc/bcc into "to" as a workaround since the library lacks cc/bcc support
    const allRecipients = [
      ...email.to,
      ...(email.cc || []),
      ...(email.bcc || []),
    ].join(",");

    await client.send({
      from: fromAddr,
      to: allRecipients,
      subject: email.subject,
      content: email.bodyHtml || email.body,
      html: email.bodyHtml || undefined,
    });

    await client.close();
    return { success: true, messageId: `custom-${Date.now()}` };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to send: ${err.message || "SMTP error"}`,
    };
  }
}

// ─── Fetch Emails via IMAP (basic) ───
// Note: Full IMAP support in Deno edge functions is limited.
// This provides a basic connection test & stub for future IMAP library integration.

async function fetchEmails(
  config: ImapConfig,
  options: { folder: string; limit: number }
) {
  const { imapServer, imapPort, email, password, imapSecurity } = config;
  const { folder, limit } = options;

  const MAX_BODY_CHARS = 100_000; // limit HTML body
  const MAX_PLAIN_CHARS = 20_000; // limit plain text

  function parseHeaders(raw: string) {
    // unfold folded headers
    const unfolded = raw.replace(/\r\n[ \t]+/g, ' ');
    const lines = unfolded.split(/\r\n/);
    const headers: Record<string, string> = {};
    for (const line of lines) {
      if (!line) break;
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const val = line.slice(idx + 1).trim();
      headers[key] = (headers[key] ? headers[key] + '\n' : '') + val;
    }
    return {
      from: headers['from'] || '',
      to: headers['to'] || '',
      subject: headers['subject'] || '',
      date: headers['date'] || '',
      raw: raw,
    };
  }

  function escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function sanitizeHtml(html: string) {
    // remove script/style tags
    let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    out = out.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
    // remove on* attributes
    out = out.replace(/ on[\w-]+=\"[^"]*\"/gi, '');
    out = out.replace(/ on[\w-]+='[^']*'/gi, '');
    // remove javascript: URLs
    out = out.replace(/href=\"javascript:[^\"]*\"/gi, 'href="#"');
    out = out.replace(/src=\"javascript:[^\"]*\"/gi, '');
    if (out.length > MAX_BODY_CHARS) out = out.slice(0, MAX_BODY_CHARS) + '\n\n...body truncated...';
    return out;
  }

  function toSafeHtml(body: string) {
    if (!body) return { html: '', text: '' };
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(body);
    if (isHtml) {
      return { html: sanitizeHtml(body), text: escapeHtml(body).slice(0, MAX_PLAIN_CHARS) };
    }
    // plain text -> simple html conversion
    const escaped = escapeHtml(body).slice(0, MAX_PLAIN_CHARS);
    const html = `<pre style="white-space:pre-wrap">${escaped}</pre>`;
    return { html, text: body.slice(0, MAX_PLAIN_CHARS) };
  }

  // Internal IMAP fetch implementation
  async function fetchViaImap() {
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      // Establish connection
      let conn: Deno.Conn;
      if (imapSecurity === 'ssl') conn = await Deno.connectTls({ hostname: imapServer, port: imapPort });
      else if (imapSecurity === 'tls') {
        // try STARTTLS upgrade
        try {
          conn = await Deno.connect({ hostname: imapServer, port: imapPort });
          await conn.read(new Uint8Array(4096)).catch(() => {});
          await conn.write(encoder.encode('A0001 CAPABILITY\r\n'));
          await conn.read(new Uint8Array(4096)).catch(() => {});
          await conn.write(encoder.encode('A0002 STARTTLS\r\n'));
          const buf = new Uint8Array(4096);
          const n = await conn.read(buf).catch(() => 0);
          const res = n ? decoder.decode(buf.subarray(0, n)) : '';
          if (res.includes('A0002 OK')) {
            const startTls = (Deno as any).startTls;
            if (typeof startTls === 'function') {
              conn = await (Deno as any).startTls({ conn, hostname: imapServer });
            } else {
              try { conn.close(); } catch {}
              conn = await Deno.connectTls({ hostname: imapServer, port: imapPort });
            }
          } else {
            try { conn.close(); } catch {}
            conn = await Deno.connectTls({ hostname: imapServer, port: imapPort });
          }
        } catch {
          conn = await Deno.connectTls({ hostname: imapServer, port: imapPort });
        }
      } else {
        conn = await Deno.connect({ hostname: imapServer, port: imapPort });
      }

      // read helper
      let bufferLeftover = '';
      async function readUntilTag(tag: string) {
        let acc = bufferLeftover;
        const buf = new Uint8Array(8192);
        for (;;) {
          const n = await conn.read(buf);
          if (!n) break;
          acc += decoder.decode(buf.subarray(0, n));
          // handle literal
          const lit = acc.match(/\{(\d+)\}\r\n/);
          if (lit) {
            const l = parseInt(lit[1], 10);
            const litBuf = new Uint8Array(l);
            let read = 0;
            while (read < l) {
              const rn = await conn.read(litBuf.subarray(read));
              if (!rn) break;
              read += rn;
            }
            acc += decoder.decode(litBuf.subarray(0, read));
          }
          if (acc.includes(`\r\n${tag} OK`) || acc.includes(`\r\n${tag} NO`) || acc.includes(`\r\n${tag} BAD`)) break;
        }
        return acc;
      }

      let tagCount = 1;
      async function send(cmd: string) {
        const tag = `G${String(tagCount++).padStart(4, '0')}`;
        await conn.write(encoder.encode(`${tag} ${cmd}\r\n`));
        const res = await readUntilTag(tag);
        return res;
      }

      const loginRes = await send(`LOGIN "${email}" "${password}"`);
      if (loginRes.includes('NO') || loginRes.includes('BAD')) {
        try { conn.close(); } catch {}
        return { success: false, error: 'IMAP login failed' };
      }

      const selectRes = await send(`SELECT "${folder || 'INBOX'}"`);
      if (selectRes.includes('NO') || selectRes.includes('BAD')) {
        try { conn.close(); } catch {}
        return { success: false, error: `Failed to select folder ${folder}` };
      }

      const searchRes = await send('SEARCH ALL');
      const m = searchRes.match(/\* SEARCH (.*)\r\n/);
      const ids = m && m[1].trim() ? m[1].trim().split(/\s+/) : [];
      const recent = ids.slice(-limit);
      const out: any[] = [];

      for (const id of recent) {
        const hdrRes = await send(`FETCH ${id} (BODY[HEADER])`);
        const hdrLiteral = hdrRes.match(/\{(\d+)\}\r\n([\s\S]*)/);
        const rawHdr = hdrLiteral ? hdrLiteral[2].replace(/\r\n\)$/, '') : '';
        const parsed = parseHeaders(rawHdr || '');

        const bodyRes = await send(`FETCH ${id} (BODY[TEXT])`);
        const bodyLiteral = bodyRes.match(/\{(\d+)\}\r\n([\s\S]*)/);
        const rawBody = bodyLiteral ? bodyLiteral[2] : '';
        const safe = toSafeHtml(rawBody || '');

        out.push({ id, headers: parsed, body: safe.html, text: safe.text });
      }

      try { conn.close(); } catch {}
      return { success: true, emails: out };
    } catch (err: any) {
      return { success: false, error: err.message || 'IMAP fetch failed' };
    }
  }

  // POP3 fetch implementation
  async function fetchViaPop3() {
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let conn: Deno.Conn;
      if (imapSecurity === 'ssl' || imapPort === 995) conn = await Deno.connectTls({ hostname: imapServer, port: imapPort });
      else conn = await Deno.connect({ hostname: imapServer, port: imapPort });

      async function readLine(): Promise<string> {
        const buf = new Uint8Array(1);
        let line = '';
        for (;;) {
          const n = await conn.read(buf);
          if (!n) break;
          const ch = new TextDecoder().decode(buf);
          line += ch;
          if (line.endsWith('\r\n')) break;
        }
        return line;
      }

      // read greeting
      await readLine();
      // send USER
      await conn.write(encoder.encode(`USER ${email}\r\n`));
      await readLine();
      await conn.write(encoder.encode(`PASS ${password}\r\n`));
      const passRes = await readLine();
      if (!passRes.startsWith('+OK')) {
        try { conn.close(); } catch {}
        return { success: false, error: 'POP3 auth failed' };
      }

      // STAT to get count
      await conn.write(encoder.encode('STAT\r\n'));
      const stat = await readLine();
      const statMatch = stat.match(/\+OK\s+(\d+)\s+(\d+)/);
      const count = statMatch ? parseInt(statMatch[1], 10) : 0;
      const toFetch = [] as number[];
      for (let i = Math.max(1, count - limit + 1); i <= count; i++) toFetch.push(i);

      const emails: any[] = [];
      for (const idx of toFetch) {
        await conn.write(encoder.encode(`RETR ${idx}\r\n`));
        // read multiline until single dot line
        let data = '';
        for (;;) {
          const line = await readLine();
          if (line === '.\r\n' || line === '.\n') break;
          data += line;
        }
        // split headers/body
        const parts = data.split('\r\n\r\n');
        const rawHdr = parts[0] || '';
        const rawBody = parts.slice(1).join('\r\n\r\n') || '';
        const parsed = parseHeaders(rawHdr);
        const safe = toSafeHtml(rawBody);
        emails.push({ id: String(idx), headers: parsed, body: safe.html, text: safe.text });
      }

      await conn.write(encoder.encode('QUIT\r\n'));
      try { conn.close(); } catch {}
      return { success: true, emails };
    } catch (err: any) {
      return { success: false, error: err.message || 'POP3 fetch failed' };
    }
  }

  // Honor explicit incomingProtocol if provided, otherwise try IMAP then POP3 fallback
  const protocol = (config as any).incomingProtocol as string | undefined;
  if (protocol === 'pop3') {
    return await fetchViaPop3();
  }

  const imapRes = await fetchViaImap();
  if (imapRes.success) return imapRes;
  // fallback to POP3 if IMAP failed and port looks like POP3
  if (imapPort === 995 || imapPort === 110) {
    const popRes = await fetchViaPop3();
    if (popRes.success) return popRes;
  }
  return imapRes;
}

// ─── Handler ───

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, config, email, options } = await req.json();

    let result;

    switch (action) {
      case "test-connection":
        result = await testConnection(config);
        break;

      case "send-email":
        if (!email) {
          result = { success: false, error: "Email payload is required" };
        } else {
          result = await sendEmail(config, email);
        }
        break;

      case "fetch-emails":
        result = await fetchEmails(
          config,
          options || { folder: "INBOX", limit: 50 }
        );
        break;

      default:
        result = { success: false, error: `Unknown action: ${action}` };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
