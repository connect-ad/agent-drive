# Testing AgentDisk

A literal walkthrough for someone with no context. Fifteen minutes end to end.

Everything below is the **development** deployment. Nothing here touches production,
which has never been deployed.

| | |
|---|---|
| Website | **https://app-dev.agentdisk.io** |
| API | `https://api-dev.agentdisk.io` — JSON only; every path returns `{"error":…}` in a browser, which is correct |
| MCP | `https://api-dev.agentdisk.io/mcp` |

---

## Part 1 — Sign up and look around

**1. Open https://app-dev.agentdisk.io**

You should see the landing page: nav across the top (Docs · Pricing · Sign in ·
Get started), a hero, and pricing further down. Click **Docs**, **Pricing**,
**Terms** and **Privacy** — all four are real pages, not placeholders.

**2. Click "Get started".**

Sign up with **Continue with Google** (fastest), **Continue with GitHub**, or
email and password. All three work. If you use email, you'll get a verification
message — you can carry on without clicking it, but you won't be able to be
*invited* to somebody else's workspace until you do.

**3. You land in a workspace called "My Workspace".**

It was created for you at signup. You should see the dashboard with **Storage
used 0 B**, **Files 0**, **Requests** a small real number, and **Agents —**.

> The em dash on Agents is deliberate. Agent counting has no endpoint yet, and
> showing a plausible number would make you doubt the ones next to it.

**4. Click every item in the left sidebar.** Files, Activity, Agents, API keys,
MCP connection, Webhooks, Usage, Settings. Every screen loads and every list is
genuinely empty — there is no sample data anywhere in this product.

---

## Part 2 — The thing it's actually for

**5. Sidebar → Agents → "Create agent".**

Name it `research-bot`. Names take letters, numbers, dots, dashes and
underscores — a name with a slash is refused, because agent names appear in
permission paths.

It'll show **No credential**. That's right: an agent without a key can't do
anything.

**6. Sidebar → API keys → "Create key".**

- Name: `bot key`
- Agent: `research-bot`
- Permissions: tick **Read**, **List**, **Write**
- Create.

**7. Copy the key now.** It starts `ask_live_`. This is the only time you will
ever see it — we store a hash, not the key. Click "I've copied my key".

**8. Use it.** In a terminal:

```bash
export AGENTDISK_KEY="ask_live_…"     # what you just copied

curl -s https://api-dev.agentdisk.io/v1/whoami \
  -H "Authorization: Bearer $AGENTDISK_KEY"
```

You should see `"type": "agent"` and your workspace name. **That is the product
working**: an autonomous identity, holding a credential scoped to one workspace,
that a human minted and can revoke.

**9. Upload a file as the agent:**

```bash
curl -s -X POST https://api-dev.agentdisk.io/v1/files \
  -H "Authorization: Bearer $AGENTDISK_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"path\":\"/reports/hello.txt\",\"mimeType\":\"text/plain\",
       \"content\":\"$(printf 'written by an agent' | base64)\"}"
```

**10. Go back to the browser → Files.** `hello.txt` is there, and the row shows
it was written by an agent rather than by you.

**11. Try something the key isn't allowed to do:**

```bash
curl -s -X DELETE https://api-dev.agentdisk.io/v1/files/<id> \
  -H "Authorization: Bearer $AGENTDISK_KEY"
```

`403`. You didn't tick Delete. The key cannot exceed what you granted it, and
nothing about that is enforced in the UI — it's enforced in the API.

**12. Sidebar → Activity.** Every step above is listed, with which agent did it.

---

## Part 3 — Uploading from the browser

**13. Files → drag a file onto the page**, or use the **Upload** button.

Try one **under 1 MB** and one **over 1 MB**. Both work, by different routes:
small files travel through the API, large ones go straight to storage with a
progress bar. Neither should fail.

**14. Usage** now shows real storage used against your plan's limit.

---

## Part 4 — Working with somebody else

You need a second account. Use a different browser or a private window.

**15. In the second browser, sign up** with another address. Note it down.

**16. Back in the first browser: Settings → Members → "Add member".**

Enter the second address, role **Reader**, add.

- If it says *"has an account but has not verified that address yet"* — go and
  click the verification link in the second account's inbox, then retry. That
  check exists so somebody who typed your colleague's address into a signup form
  can't receive an invitation meant for them.
- If it says *"No AgentDisk account for …"* — they haven't signed up yet.

**17. In the second browser, reload.** They can now see the workspace, the files,
and the activity — and there is no Upload button, no Create key, no Add member.
Reader means read.

**18. Back in the first browser: Members → Remove**, leaving *"Also revoke every
API key they created here"* ticked. They lose access on their next request.

---

## Part 5 — Connect a real MCP client

**19. Add this to your MCP client's config** (Claude Desktop, or any client that
speaks Streamable HTTP):

```json
{
  "mcpServers": {
    "agentdisk": {
      "url": "https://api-dev.agentdisk.io/mcp",
      "headers": { "Authorization": "Bearer ask_live_…" }
    }
  }
}
```

**20. Ask it to list your files.** It should call `list_files` and come back with
`hello.txt`.

**21. Ask it to delete something.** It will tell you it has no tool for that —
because your key has no Delete permission, `delete_file` was never offered to it.
An agent doesn't merely get refused; it never learns the tool exists.

---

## Part 6 — Billing

**22. Settings → Billing → "Set up billing".**

You land on Stripe's own hosted portal, in **test mode**. Card `4242 4242 4242
4242`, any future expiry, any CVC.

There is deliberately no card form inside AgentDisk. Everything past "who is this
account" happens on Stripe's page.

---

## What isn't built

Told plainly so you don't spend time hunting for it:

- **Webhook deliveries.** You can register an endpoint and it is stored; nothing
  is sent to it yet. The screen says so.
- **The admin panel** (`admin.agentdisk.io`) — staff tooling, not customer-facing.
- **Editable plans and pricing** — needs the admin panel to be worth anything.
- **Full-text search inside files.** Search covers names, paths, captions and
  tags, and the API says which fields it looked at so an empty result isn't
  mistaken for "no such file".
- **Production.** Everything here is dev. `app.agentdisk.io` does not exist.

---

## If something breaks

Every error response carries a `requestId` like `req_01M1X…`. Send that — it
finds the exact request in the logs. From the browser, open the console (F12);
the same ID appears in any red banner.

---

## How much of this was verified, and how

Being precise about this, because "it should work" and "I watched it work" are
different claims.

**Verified by running it against the live deployment:** every `curl` in Parts 2
and 3 — signup through the identity API, workspace creation, agent creation, key
minting, `whoami` as the agent, inline upload, a 2 MB presigned upload
round-tripped and checked byte-for-byte, the `403` on an ungranted permission,
the members flow including the unverified-address refusal, the Stripe portal
session returning a real URL, and the MCP endpoint answering `initialize`.

**Verified by test, not by hand:** MCP tool filtering by scope, the webhook
signature rejections, and the billing write-block. These have tests that exercise
the real code paths; nobody has clicked through them.

**Not verified by me — this is what needs your hands:** every step that requires
a browser. I cannot click a Google or GitHub consent screen, drag a file onto a
page, or drive an MCP client. Parts 1, 4, 5 and 6 are written from the code and
the API behaviour, and step 13's drag-and-drop in particular has never been
exercised by a human.

If any of those differ from what's written here, that's the guide being wrong,
not you.
