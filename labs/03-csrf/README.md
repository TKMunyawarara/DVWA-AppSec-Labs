# Vulnerability Assessment: Cross-Site Request Forgery (CSRF) & Defense Evolution

## Executive Summary
This assessment evaluates the progressive implementation of Cross-Site Request Forgery (CSRF) defenses in the Damn Vulnerable Web Application (DVWA) running in a containerized Linux laboratory. The evaluation spans three distinct security postures:
1. **Low Tier:** Complete absence of anti-automation and cross-origin state-change controls.
2. **Medium Tier:** Flawed heuristic validation relying on the HTTP `Referer` header.
3. **High Tier:** Synchronizer Token Pattern (Anti-CSRF Tokens) defeated via an XSS-to-CSRF client-side attack chain.

The final phase demonstrates an end-to-end exploit chain that bypasses the per-request anti-CSRF token mechanism without requiring console interaction, resulting in full administrative account takeover.

---

## Technical Analysis by Security Tier

### Tier 1: Low Security (No Origin or Token Verification)
* **Root Cause (CWE-352 / CWE-598):** The password-reset functionality accepts state-changing inputs via HTTP `GET` query parameters (`/vulnerabilities/csrf/?password_new=...`) without requiring an anti-CSRF token, current password validation, or SameSite cookie restrictions.
* **Exploitation:** Because web browsers implicitly attach ambient credentials (`Cookie: PHPSESSID=...`) to cross-origin requests, any cross-origin resource load (such as an `<img>` tag or direct URL navigation) automatically executes the state change within an active victim session.

### Tier 2: Medium Security (Flawed Referer Header Inspection)
* **Root Cause (CWE-293):** The backend relies on `stripos($_SERVER['HTTP_REFERER'], $_SERVER['SERVER_NAME'])` to verify origin legitimacy.
* **Exploitation:** The validation implements an unanchored substring search rather than strict origin comparison. An attacker hosting an exploit payload on an external port or server can satisfy the condition by controlling the directory structure or filename (e.g., `http://127.0.0.1:8000/127.0.0.1/index.html`).

### Tier 3: High Security (Synchronizer Token Bypass via XSS Chain)
* **Root Cause:** While the application implements a dynamic, per-request anti-CSRF token (`user_token`) stored in `$_SESSION`, the endpoint fails to require re-authentication (`password_current`) and still processes state-changing credentials over `GET`.
* **Exploitation & Same-Origin Policy (SOP) Mechanics:** 
  1. An external origin cannot directly read the anti-CSRF token from the application DOM due to Same-Origin Policy cross-origin read restrictions.
  2. The attacker injects a script tag via a DOM-based Cross-Site Scripting (XSS) vulnerability located on the target origin (`127.0.0.1:4280`).
  3. The injected script loads an external payload (`pwn.js`). Under browser execution rules, the script executes within the context of `http://127.0.0.1:4280`.
  4. The script issues a background `fetch()` request to `/vulnerabilities/csrf/`, parses the response DOM to harvest the dynamic `user_token`, and issues a second `fetch()` request submitting the forged password update with the valid token.

---

## Remediation & Defense-in-Depth

| Control Layer | Implementation Requirement |
| :--- | :--- |
| **HTTP Method** | Enforce `POST` or `PUT` for all state-changing endpoints. Reject query parameters in `GET` requests. |
| **Re-Authentication** | Require the victim to input their existing password (`password_current`) before processing updates. |
| **Cookie Hardening** | Set session cookies with `SameSite=Strict` or `SameSite=Lax`, `Secure`, and `HttpOnly`. |
| **Anti-CSRF Tokens** | Maintain cryptographically random, per-request Synchronizer Tokens validated strictly against server session state. |
| **Content Security Policy** | Enforce a strict CSP (e.g., `script-src 'self'`) to block the execution of unauthorized external scripts. |

---

## Mapping to Jinda Sentinel Architecture
* **Defensive Guardrails:** Jinda Sentinel API endpoints enforce strict `SameSite=Lax` cookies, require custom `Authorization: Bearer <token>` headers (which trigger preflight CORS options and cannot be sent via standard HTML forms), and reject sensitive `GET` parameter queries.
* **Detection Engineering:** Security logging pipeline monitors for rapid sequential requests where `user_token` mismatches occur, generating a `CSRF_TOKEN_MISMATCH` telemetry alert containing client IP, User-Agent, and `Referer` metadata.
