# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Lacerta, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to report

> **Note**: Lacerta is pre-launch. A dedicated security email has not been set up yet. For now, please use the GitHub Security Advisory method below.

To create a private advisory:
1. Go to the [Security tab](../../security/advisories) of this repository
2. Click "New draft security advisory"
3. Fill in the details

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment**: within 48 hours
- **Initial assessment**: within 1 week
- **Fix timeline**: depends on severity, but we aim for:
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: next release

### Scope

The following are in scope:
- Authentication and authorization bypasses
- JWT token management issues
- Data leakage (PII, password hashes)
- GraphQL injection or abuse
- Cross-site scripting (XSS) or CSRF
- AI prompt injection leading to data exfiltration
- Dependency vulnerabilities

### Out of scope

- Social engineering attacks against users
- Denial of service via rate limiting (known limitation)
- Vulnerabilities in third-party services (report to them directly)

## Supported Versions

| Version | Supported |
|---------|-----------|
| main branch | Yes |
| Other branches | No |

Lacerta is pre-release software. Only the `main` branch receives security updates.
