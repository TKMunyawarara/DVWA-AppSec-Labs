# DVWA AppSec Labs

A hands-on application security laboratory documenting practical web application security testing using Damn Vulnerable Web Application (DVWA).

The purpose of this repository is to document vulnerabilities, attack techniques, tooling, HTTP requests, testing methodology, evidence, and security lessons learned through controlled local labs.

> ⚠️ All testing documented in this repository is performed against intentionally vulnerable applications running in my own local lab environment.

---

## Labs

| # | Lab | Topics | Status |
|---|---|---|---|
| 01 | Brute Force | Burp Intruder, Hydra, WFuzz, CSRF, Session Handling | ✅ Complete |
| 02 | Command Injection | Coming soon | ✅ Complete |
| 03 | XSS | Coming soon | ⏳ |
| 04 | SQL Injection | Coming soon | ⏳ |
| 05 | File Inclusion | Coming soon | ⏳ |

---

## Environment

- Kali Linux
- DVWA
- Burp Suite
- Hydra
- WFuzz
- Firefox
- Docker
- Metasploit wordlists
- SecLists

---

## Repository Structure

```text
DVWA-AppSec-Labs/
│
├── README.md
├── .gitignore
│
└── labs/
    └── 01-brute-force/
        ├── README.md
        ├── commands/
        │   └── commands.md
        ├── evidence/
        │   ├── 01-dvwa-low.png
        │   ├── 02-burp-low.png
        │   ├── 03-hydra.png
        │   ├── 04-wfuzz.png
        │   ├── 05-dvwa-high.png
        │   ├── 06-burp-macro.png
        │   └── 07-success.png
        └── diagrams/
            └── architecture.md
