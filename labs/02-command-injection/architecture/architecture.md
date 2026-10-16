```markdown
# Execution Flow & Attack Architecture

[ Attacker / Browser ]
│
│ HTTP POST (ip = "127.0.0.1|cat /etc/passwd")
▼
┌─────────────────────────────────────────────────────────┐
│              DVWA Web Application (PHP)                 │
│                                                         │
│ 1. Receives raw input from $_REQUEST['ip']               │
│ 2. Passes input to str_replace() blacklist filter        │
│    - Checks for '| ' (pipe + space)                     │
│    - Match fails! Payload passed through unescaped.     │
│ 3. Concatenates string: 'ping -c 4 ' . $target          │
│ 4. Invokes shell_exec()                                 │
└─────────────────────────┬───────────────────────────────┘
│
│ System Shell Execution (/bin/sh)
▼
┌─────────────────────────────────────────────────────────┐
│                 Underlying Host OS                      │
│                                                         │
│ Executing: ping -c 4 127.0.0.1|cat /etc/passwd          │
│ - Command 1: ping -c 4 127.0.0.1 (Output piped)         │
│ - Command 2: cat /etc/passwd (Prints sensitive file)   │
└─────────────────────────┬───────────────────────────────┘
│
│ Standard Output (stdout)
▼
┌─────────────────────────────────────────────────────────┐
│         HTTP Response Returned to Attacker              │
│                                                         │
│ Contains ICMP statistics + full /etc/passwd content     │
└─────────────────────────────────────────────────────────┘
