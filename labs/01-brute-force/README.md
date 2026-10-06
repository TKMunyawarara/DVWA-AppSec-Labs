# DVWA Brute Force Lab

## Overview

This lab demonstrates authentication brute-force testing against the Damn Vulnerable Web Application (DVWA).

The lab was performed at two security levels:

- Low
- High

The objective was to understand how authentication brute-force attacks work, how automated tools can be used to test them, and how CSRF/session protections affect automated attacks.

---

## Target

```text
http://127.0.0.1:4280

Target endpoint:

/vulnerabilities/brute/

All testing was performed against a locally hosted DVWA instance.

Objectives
Analyze the DVWA brute-force functionality.
Identify the authentication request.
Perform password brute forcing with Burp Intruder.
Perform command-line brute forcing with Hydra.
Perform username and password fuzzing with WFuzz.
Identify and troubleshoot false positives.
Test the brute-force functionality at DVWA High.
Understand the effect of CSRF tokens on automated attacks.
Configure a Burp macro for token retrieval.
Configure Burp Session Handling Rules.
Perform a CSRF-aware Cluster Bomb attack.
Document evidence and lessons learned.
Tools
Tool	Purpose
Burp Suite	HTTP interception and automated testing
Burp Intruder	Brute-force attacks
Burp Proxy	Request interception
Burp Macro	CSRF token retrieval
Burp Session Handling	Dynamic token/session management
Hydra	Command-line brute forcing
WFuzz	Web fuzzing
Metasploit wordlists	Username/password payloads
DVWA	Vulnerable target
Firefox	Browser testing
Lab 1 — DVWA Low Security
1. Request Analysis

The initial authentication request was:

GET /vulnerabilities/brute/?username=admin&password=password&Login=Login HTTP/1.1

The important parameters were:

username
password
Login

DVWA returned the following failure message when authentication failed:

Username and/or password incorrect.

This message was used as the failure indicator during automated testing.

2. Burp Intruder — Password Brute Force

The request was intercepted using Burp Proxy and sent to Intruder.

The password parameter was selected as the payload position:

GET /vulnerabilities/brute/?username=admin&password=§PASSWORD§&Login=Login

A small test password list was used:

admin
123456
letmein
qwerty
password1
Password
password

Grep-Match was configured using:

incorrect

The successful credential identified during testing was:

admin:password
Result

The Low-security implementation allowed repeated authentication attempts without an effective brute-force protection mechanism.

3. Hydra

The same vulnerability was tested using Hydra.

Command:

hydra -l admin -P /home/opareta/jinda_bible/Lab/Appsec/dvwa/bruteforce/passwords.txt -s 4280 127.0.0.1 http-get-form "/vulnerabilities/brute/:username=^USER^&password=^PASS^&Login=Login:F=Username and/or password incorrect."
Important options
-l admin

Specifies the username.

-P passwords.txt

Specifies the password wordlist.

-s 4280

Specifies the target port.

http-get-form

Specifies the HTTP GET form module.

^USER^

Hydra username placeholder.

^PASS^

Hydra password placeholder.

F=Username and/or password incorrect.

Defines the failure condition.

4. Hydra False Positives

The initial Hydra attack produced multiple apparent valid credentials.

This was investigated as a false-positive issue.

The problem demonstrated an important lesson:

Automated tools depend on accurately reproducing the application's request and session state.

The browser's session information was required for reliable testing.

The relevant cookie structure was:

Cookie: PHPSESSID=<SESSION>; security=low

Sensitive session values are intentionally not documented in this repository.

5. WFuzz — Password Fuzzing

WFuzz was used to fuzz the password parameter.

wfuzz -c -w "/home/opareta/jinda_bible/Lab/Appsec/dvwa/bruteforce/passwords.txt" \
-H "Cookie: PHPSESSID=<SESSION>; security=low" \
"http://127.0.0.1:4280/vulnerabilities/brute/?username=admin&password=FUZZ&Login=Login"

The payload position was:

FUZZ

which replaced the password.

6. WFuzz — Username Fuzzing

Username enumeration was also tested.

wfuzz -c -w "/home/opareta/jinda_bible/Lab/Appsec/dvwa/bruteforce/users.txt" \
-H "Cookie: PHPSESSID=<SESSION>; security=low" \
"http://127.0.0.1:4280/vulnerabilities/brute/?username=FUZZ&password=password&Login=Login"

Here:

FUZZ = username

This demonstrated that brute-force testing can target both authentication parameters.

7. WFuzz — Username + Password

A two-payload fuzzing attack was then performed.

wfuzz -c --hs "incorrect" \
-z file,users.txt \
-z file,/usr/share/seclists/Passwords/Common-Credentials/probable-v2_top-1575.txt \
-H "Cookie: PHPSESSID=<SESSION>; security=low" \
"http://127.0.0.1:4280/vulnerabilities/brute/?username=FUZZ&password=FUZ2Z&Login=Login"

Payloads:

FUZZ  → username
FUZ2Z → password

The failure message was hidden using:

--hs "incorrect"

This allowed potentially successful responses to stand out from normal failed responses.

Lab 2 — DVWA High Security

The DVWA security level was changed from Low to High.

The High implementation introduced a dynamic CSRF token:

user_token

The authentication request therefore required more than just:

username
password

The request also needed a valid token:

user_token=<FRESH_TOKEN>
8. Initial High-Security Attack

A normal automated brute-force attack initially failed.

Even the known valid password was being identified as a failed attempt.

This demonstrated that the problem was not necessarily the password list.

The application was now maintaining additional state through the CSRF token.

9. Burp Macro

A Burp Macro was configured to retrieve a fresh token.

The macro used the intercepted DVWA request to obtain the current token from the application's response.

The token parameter was configured as:

user_token

The purpose of the macro was:

Request
   ↓
Receive response
   ↓
Extract fresh user_token
   ↓
Use token in next request
10. Burp Session Handling Rule

A Session Handling Rule was created:

Rule 1

The macro was assigned to this rule.

The configuration included:

Macro execution
Custom parameter handling
user_token
Tolerate URL mismatch
Intruder scope
Suite URL scope

The rule was restricted to Intruder so that normal browsing traffic was not unnecessarily affected.

11. Cluster Bomb Attack

The final brute-force attack used Burp Intruder's:

Cluster bomb

attack type.

Two payload positions were configured:

Payload 1 → username
Payload 2 → password

The attack therefore tested combinations such as:

admin + password1
admin + 123456
admin + qwerty
admin + password
...

The CSRF token was handled separately by Burp's Session Handling Rule.

12. Grep-Match

Grep-Match was configured with:

incorrect

DVWA's failure response contained:

Username and/or password incorrect.

Therefore:

incorrect = 1

indicated that the failure message was present.

A response where:

incorrect = 0

was considered interesting and required manual verification.

Grep-Match was used as an indicator rather than as the actual authentication mechanism.

13. Baseline Requests

The following option was disabled:

Make unmodified baseline requests

This was not required for the attack because the objective was to test the configured username/password payload combinations.

14. Final Result

The High-security brute-force attack succeeded after configuring Burp to correctly handle the application's changing CSRF token.

The final workflow was:

Username Payload
       +
Password Payload
       │
       ▼
Burp Intruder
       │
       ▼
Session Handling Rule
       │
       ▼
Burp Macro
       │
       ▼
Fresh CSRF Token
       │
       ▼
Updated Request
       │
       ▼
DVWA
       │
       ▼
Grep-Match
       │
       ▼
Potential Successful Login
Key Findings
Finding 1 — Unrestricted Authentication Attempts

DVWA Low allowed repeated authentication attempts without effective brute-force protection.

Impact:

An attacker could automate large numbers of username/password attempts.

Finding 2 — Username Enumeration

The application could be tested for valid usernames independently from passwords.

Impact:

An attacker may be able to reduce the authentication attack space by identifying valid accounts.

Finding 3 — CSRF Protection Increased Attack Complexity

DVWA High introduced a dynamic user_token.

This prevented simple replay of a previously captured authentication request.

However, CSRF protection alone does not necessarily prevent brute-force attacks.

With appropriate session/token handling, automated testing was still possible.

Security Recommendations

A production application should implement multiple layers of authentication protection:

Rate limiting
Account lockout or progressive delays
CAPTCHA/risk-based authentication controls where appropriate
MFA
Strong password policies
Detection of repeated authentication failures
IP/device reputation controls
Monitoring and alerting
Secure CSRF token implementation
Generic authentication error messages
Protection against username enumeration

CSRF protection should be treated as a separate control from brute-force protection.

Lessons Learned

This lab demonstrated that effective application security testing requires more than running an automated tool.

Key lessons:

Understand the HTTP request before automating it.
Identify the application's success and failure conditions.
Verify automated-tool results manually.
Watch for false positives.
Maintain the correct session state.
Understand how CSRF tokens affect automated requests.
Use macros/session handling when application state changes.
Choose the correct Intruder attack type for multiple parameters.
Use response characteristics to identify interesting results.
Document the methodology, not just the final result.
