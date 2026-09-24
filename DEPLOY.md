# Deploy checklist — Hurghada University

## Recommended architecture (current plan)

| Layer | Host | Why |
|-------|------|-----|
| API (.NET 10) | **MonsterASP** `https://hur-uni.runasp.net` | Native ASP.NET + SQL Server hosting |
| Public site (Angular) | **Vercel** | Static SPA + CDN |
| Dashboard (Angular) | **Vercel** (2nd project) | Same |

This is the right split for this stack.  
**Better upload method for the API than raw FTP:** MonsterASP **WebDeploy** (Visual Studio Publish profile) or **File Manager ZIP unzip** into `\wwwroot`.

### Optional simpler alternative
Host **API + both SPAs** on MonsterASP only (one origin). Fewer CORS issues, but no Vercel CDN. Use only if you want one domain and less config.

---

## Not production-ready until these are done

1. **Upload API**  
   Contents of `Backend/src/HurghadaUniversity.API/publish/` → MonsterASP `\wwwroot`  
   (or unzip `publish-api.zip` there with overwrite + restart)

2. **Set .NET 10** in MonsterASP panel → **Restart**

3. **Secrets on the server only** (already inside your local `publish/appsettings.Production.json`):  
   - SQL connection string  
   - JWT Key (long random)  
   Never commit these to GitHub.

4. **Deploy both Angular apps on Vercel** (Root Directory):  
   - `aurelia-university` → output `dist/aurelia-university/browser`  
   - `Frontend` → output `dist/hurghada-university/browser`

5. **Wire real URLs** after Vercel gives you domains:  
   - Update `Cors:Origins` on the server  
   - `aurelia-university/.../environment.prod.ts` → `dashboardUrl`  
   - `Frontend/.../environment.prod.ts` → `publicSiteUrl`  
   Then rebuild/redeploy the frontends.

6. **Smoke tests**  
   - `https://hur-uni.runasp.net/health`  
   - `https://hur-uni.runasp.net/api/public/site`  
   - Site loads and can call the API  
   - Login → dashboard works cross-origin

---

## Known issues (honest)

| Issue | Status |
|-------|--------|
| GitHub repo | Done |
| API publish folder / zip | Ready locally |
| FTP from this machine | Unreliable → use WebFTP / WebDeploy |
| Vercel CLI upload | Network failures → use Vercel Dashboard + GitHub |
| Placeholder Vercel hostnames in env | Must replace with real project URLs |
| Free plan 256 MB RAM | OK for demo; watch memory under load |
| `Co-authored-by: Cursor` on commits | Auto-added by the editor; strip only with your approval (history rewrite) |

---

## GitHub
https://github.com/AboAls3od/Hurghada-University

## Local secrets template
Copy `appsettings.Development.json.example` → `appsettings.Development.json` (gitignored).
