# Hosting

## GitHub
Repository: https://github.com/AboAls3od/Hurghada-University

## Backend — MonsterASP.NET
1. On your PC, publish is ready at:
   `Backend/src/HurghadaUniversity.API/publish/`
   (or use `publish-api.zip` next to it)
2. Open WebFTP: https://webftp.monsterasp.net
3. Login with your MonsterASP FTP user
4. Upload **all contents** of `publish/` into `\wwwroot` (extract the zip there)
5. In MonsterASP panel: set **.NET** version to **10.x**, then **Restart** the site
6. API URL: `https://hur-uni.runasp.net`
7. Health check: `https://hur-uni.runasp.net/health`

Do **not** upload `appsettings.Development.json`. Production settings must live only on the server.

## Frontends — Vercel
Projects are linked to the GitHub repo. From Vercel dashboard (or CLI when network is stable):

### Public site (`aurelia-university`)
- Root Directory: `aurelia-university`
- Build Command: `npm run build`
- Output Directory: `dist/aurelia-university/browser`
- Framework: Other

### Dashboard (`Frontend`)
- Root Directory: `Frontend`
- Build Command: `npm run build`
- Output Directory: `dist/hurghada-university/browser`
- Framework: Other

After you get the real Vercel URLs, add them to MonsterASP `appsettings.Production.json` → `Cors:Origins`, and update:
- `aurelia-university/src/environments/environment.prod.ts` → `dashboardUrl`
- `Frontend/src/environments/environment.prod.ts` → `publicSiteUrl`

## Local secrets
Copy `appsettings.Development.json.example` → `appsettings.Development.json` (gitignored).
