# CodeSync

Real-time collaborative code editor — a minimal CodeSandbox Live / Google Docs experience for code. Multiple people edit the same project simultaneously with conflict-free CRDT sync, live colored cursors, chat, voice, version history, and an instant HTML preview.

## Features

### Core (MVP)
- **Conflict-free sync** — Yjs CRDT merges concurrent edits without conflicts
- **Peer-synced** — Real-time sync over WebSocket (works across browsers and networks)
- **Live cursors** — See every collaborator's cursor and selection in color
- **Online users** — Sidebar with avatars, names, and presence
- **Live preview** — Sandpack renders HTML/CSS/JS in an isolated iframe
- **No login** — Random name + color assigned automatically (editable)

### Extended
- **Multi-file project** — Tabbed editor for `index.html`, `styles.css`, `script.js` (+ add files)
- **Room chat** — Text chat synced via Yjs
- **Voice chat** — WebRTC audio mesh with Yjs signaling
- **Version history** — Save named snapshots and restore previous states
- **Undo / Redo** — Per-user undo for the active file (`Y.UndoManager`)
- **Persistence** — Auto-saves room state to JSON via API (survives refresh)
- **Read-only mode** — Share `?view=1` links for viewers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router), TypeScript |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| CRDT | Yjs + `y-monaco` binding |
| Transport | `y-websocket` (public demo relay: `wss://demos.yjs.dev/ws`) |
| Preview | `@codesandbox/sandpack-react` |
| Persistence | Next.js API routes + JSON files (`data/rooms/`) |
| Styling | Tailwind CSS |
| State | Zustand |

## Why Yjs / CRDT?

Traditional real-time editing uses Operational Transformation (OT) — complex to implement correctly. **CRDTs** let every client apply edits locally and merge them deterministically. Yjs handles this for shared text, and `y-monaco` wires it directly into Monaco Editor.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Create new room**, then open the same room URL in a second tab.

### Quick test

1. Create a room on the home page
2. Copy the room link and open in another tab
3. Type in one tab — changes appear instantly in the other
4. Try chat, file tabs, save a version snapshot
5. Copy the **view link** for read-only access

### Read-only mode

Append `?view=1` to any room URL:

```
/room/abc123?view=1
```

## Project Structure

```
app/
  page.tsx                         # Landing
  room/[roomId]/page.tsx           # Room workspace
  api/rooms/[roomId]/route.ts      # Persistence API
components/
  editor/                          # Monaco + file tabs + undo
  preview/                         # Sandpack live preview
  chat/                            # Room chat
  room/                            # Header, users, voice, versions
  ui/                              # Identity + username badge
lib/
  yjs-provider.ts                  # Yjs doc, files, chat, versions
  persistence.ts                   # Load/save room state
  voice-chat.ts                    # WebRTC voice mesh
  room-context.tsx                 # Room provider
  store.ts                         # Zustand state
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Limitations

- Sync works best with small groups (demo WebSocket relay is shared/public)
- Voice chat uses a simple mesh topology (best for small groups)
- Persistence stores state as JSON files locally (`data/rooms/`) — use Redis/S3 for production
- Undo/redo applies to **your own edits** on the active file

## Tags

`real-time` · `CRDT` · `collaborative-editor` · `pair-programming` · `yjs` · `monaco-editor` · `nextjs`

## Author

**AmirHossein Ramroudi**

- Email: [ahramroudi1@gmail.com](mailto:ahramroudi1@gmail.com)
- GitHub: [@theAHR](https://github.com/theAHR)
- LinkedIn: [in/theahr](https://linkedin.com/in/theahr)
- Telegram: [@theAHR](https://t.me/theAHR)

## License

MIT
