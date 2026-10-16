# Vulnerability Report: OS Command Injection (DVWA)

## Executive Summary
During a targeted Web Application Security Assessment of the DVWA platform, an **OS Command Injection** vulnerability was identified across multiple security configurations (**Low**, **Medium**, and **High**). 

This vulnerability allows an attacker to manipulate user-supplied input passed to underlying operating system shell execution functions (`shell_exec`). Successful exploitation permits an unauthenticated or low-privileged attacker to execute arbitrary OS commands within the execution context of the web server (`www-data`), leading to system enumeration, sensitive file disclosure (`/etc/passwd`), and potential host compromise.

---

## Technical Details

| Attribute | Value |
| :--- | :--- |
| **Vulnerability Class** | OS Command Injection (CWE-78) |
| **Severity** | **Critical** (CVSS v3.1 Score: 9.8 - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`) |
| **Affected Component** | IP Address Input Parameter (`$_REQUEST['ip']`) |
| **Execution Context** | Linux Container (`www-data` service user) |

---

## Attack Breakdown & Level Analysis

### 1. Low Security Level
* **Root Cause:** Raw user input is concatenated directly into a system shell call (`ping -c 4 " . $target`) without input validation or escaping.
* **Exploitation:** Appending standard command separators such as `;` or `&&` allows secondary command execution.
* **Payload:** `127.0.0.1; cat /etc/passwd`
* **Evidence:** The application returned standard ping output followed by the full contents of `/etc/passwd`.

### 2. Medium Security Level
* **Root Cause:** Flawed Blacklist Defense. The application uses `str_replace()` to strip `&&` and `;`.
* **Bypass Strategy:** The developer omitted other valid Unix shell operators such as single pipes (`|`) and single ampersands (`&`).
* **Payload:** `127.0.0.1 | cat /etc/passwd` or `127.0.0.1 & whoami`
* **Evidence:** Piping the input bypassed the blacklist and successfully dumped system account details.

### 3. High Security Level
* **Root Cause:** Developer Typo in Blacklist Logic. The blacklist replacement array defined `'| ' => ''` (a pipe followed by an ASCII space).
* **Bypass Strategy:** Sending a single pipe directly adjacent to the command payload without whitespace bypasses string matching while remaining valid in Unix shells.
* **Payload:** `127.0.0.1|cat /etc/passwd`
* **Evidence:** The application executed the appended `cat` command, disclosing `/etc/passwd`.

### 4. Impossible Level (Remediation Analysis)
* **Defense Mechanism:** 
  1. Input is tokenized via `explode(".", $target)`.
  2. Each of the 4 octets is strictly checked using `is_numeric()`.
  3. The target IP string is reconstructed purely from integer octets prior to execution, stripping out all non-numeric characters and shell metacharacters.
  4. Anti-CSRF token verification (`checkToken()`) is enforced on request submission.

---

## Proof of Concept & Evidence
*(Include screenshot references stored in `./evidence/`)*

* **Low Level Exploitation:**  
  ![Low Level Evidence](./evidence/01-dvwa-low.png)

* **High Level Code Typo & Bypass:**  
  ![High Level Evidence](./evidence/05-high-success.png)

---

## Remediation & Secure Coding Guidance

### Primary Fix: Avoid System Shell Execution
Where possible, eliminate direct OS shell execution. Use native PHP functions or network libraries to test host reachability instead of invoking system binaries.

### Secondary Fix: Strict Input Validation (Allowlisting)
If shell execution is strictly required, validate input against a strict allowlist (e.g., enforcing an IP address format) using `filter_var()` or regular expressions:

```php
// Secure Allowlisting Example
$target =$_REQUEST['ip'];

if (filter_var($target, FILTER_VALIDATE_IP)) {
    // Escape argument safely as an additional layer of defense
    $safe_target = escapeshellarg($target);
    $cmd = shell_exec("ping -c 4 " . $safe_target);
    echo "<pre>{$cmd}</pre>";
} else {
    echo "<pre>ERROR: Invalid IP address format provided.</pre>";
}
