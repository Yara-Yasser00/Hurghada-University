# Hosting

## Backend — MonsterASP.NET
- Domain: `https://hur-uni.runasp.net`
- Publish the API and upload the contents of `publish/` into `\wwwroot` via FTP/SFTP.
- Set production connection string and JWT via `appsettings.Production.json` on the server (do not commit secrets).

## Frontends — Vercel
- Public site: `aurelia-university/`
- Dashboard: `Frontend/`
- Both call the API at `https://hur-uni.runasp.net`.

## Local secrets
Copy `appsettings.Development.json.example` to `appsettings.Development.json` and fill in your values.
