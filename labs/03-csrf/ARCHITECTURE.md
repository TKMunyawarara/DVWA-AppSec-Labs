Markdown
# Architecture & Attack Flow Topology

## High-Level SOP Boundary & Exploitation Flow

                  [ ATTACKER INFRASTRUCTURE ]
                               │
                  Host: 127.0.0.1:8000 (Python)
                  Payload: /pwn.js
                               │
Victim clicks link            │ 3. Browser fetches
with DOM XSS payload          │    remote script
│
▼
┌────────────────────────────────────────────────────────────────────────┐
│                        VICTIM BROWSER CONTEXT                          │
│                                                                        │
│  Target Origin: http://127.0.0.1:4280 (DVWA Container)                │
│                                                                        │
│  [ Step A: Script Injection ]                                          │
│  Location: /vulnerabilities/xss_d/#           │
│  Execution Scope: Inherits origin http://127.0.0.1:4280                │
│                                                                        │
│  [ Step B: SOP Bypass via Same-Origin Execution ]                      │
│  pwn.js issues fetch('/vulnerabilities/csrf/')                         │
│  ├── Ambient Cookie: PHPSESSID attached automatically                  │
│  └── SOP Rule: Cross-origin read PERMITTED (Same Scheme/Host/Port)     │
│                                                                        │
│  [ Step C: Token Extraction ]                                          │
│  DOMParser extracts: <input type="hidden" name="user_token" ...>       │
│                                                                        │
│  [ Step D: Forged State Change Submission ]                            │
│  pwn.js issues fetch('/vulnerabilities/csrf/?password_new=...&token')  │
│  └── Server verifies token & session match -> State Updated            │
└──────────────────────────────────┬─────────────────────────────────────┘
│
│ 4. HTTP 200 OK (Password Changed)
▼
[ DVWA BACKEND APPLICATION ]
Apache / PHP (Port 4280)


## Security Mechanism Evaluation Matrix

| Level | Server Defense Logic | Primary Bypass Vector | SOP Impact |
| :--- | :--- | :--- | :--- |
| **Low** | None (Cookies only) | Cross-origin `GET` trigger (`<img>`, link) | SOP allows cross-origin writes/requests; cookies attached by default. |
| **Medium** | `stripos($_SERVER['HTTP_REFERER'], '127.0.0.1')` | Path/subdomain containing IP string hosted on external port | `Referer` header manipulation satisfies substring criteria. |
| **High** | Cryptographic `user_token` checked per session | Chained DOM XSS payload on identical origin | SOP blocks external cross-origin token reads, but same-origin XSS reads the DOM. |
| **Impossible** | `user_token` + `POST` + `password_current` | None (Current password required) | Re-authentication stops automated headless execution even under XSS. |
