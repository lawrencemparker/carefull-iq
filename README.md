# CareFull IQ (Phase 2 – Working)

This zip contains a clean **Next.js App Router** project with the Phase 2 structure:

- `/home` (Dashboard) **includes “Welcome back” + “App Features”**
- `/caregivers` (Add + Manage Caregivers)
- `/clients` (Add + Manage Clients)
- `/daily-log` (Create log, or edit via `?edit=<id>`)
- `/logs` (Filter + expand + edit logs)

## Run

```bash
npm install
npm run dev
```

Then open:
- http://localhost:3000/home

## Windows notes (PowerShell / CMD)

If you ever need to clear Next build cache:

**PowerShell**
```powershell
Remove-Item -Recurse -Force .next
```

**CMD**
```bat
rmdir /s /q .next
```
