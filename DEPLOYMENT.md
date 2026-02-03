# GitHub Actions & Deployment Guide

## Overview

The ETH Kompetenzraster PWA is designed to work seamlessly with GitHub Actions for automated testing, building, and deployment.

## GitHub Actions Workflows

### 1. Test & Validate (`test.yml`)

**Triggers:** Every push and pull request  
**Duration:** ~2-3 minutes

**Validation Checks:**
- ✅ JSON format validation (all module files)
- ✅ HTML structure integrity
- ✅ JavaScript syntax and required functions
- ✅ XSS vulnerability scanning
- ✅ CSS completeness (variables, Dark Mode, etc.)
- ✅ Documentation presence

**Failure Criteria:**
- Invalid JSON in any module
- Missing HTML elements
- Missing critical JavaScript functions
- XSS vulnerabilities detected
- Missing CSS variables or Dark Mode support
- Documentation incomplete

### 2. Build & Package (`build.yml`)

**Triggers:** Push to main branch or version tags  
**Duration:** ~1-2 minutes

**Build Steps:**
1. Version extraction (from tag or timestamp)
2. ZIP package creation
3. Checksum generation (SHA-256)
4. Release notes generation
5. GitHub Release creation (on version tags)

**Outputs:**
- `eth-kompetenzraster-pwa-v*.zip` (deployment package)
- `CHECKSUMS.txt` (integrity verification)
- `RELEASE_NOTES.md` (change documentation)

## Setup Instructions

### 1. Create GitHub Repository

```bash
# Initialize repository
git init eth-kompetenzraster-pwa
cd eth-kompetenzraster-pwa
git add .
git commit -m "Initial commit: ETH Kompetenzraster PWA"
git branch -M main
git remote add origin https://github.com/yourusername/eth-kompetenzraster-pwa.git
git push -u origin main
```

### 2. Configure GitHub Settings

#### Enable GitHub Pages
1. Go to **Settings > Pages**
2. Select **Deploy from a branch**
3. Choose branch: **main**
4. Folder: **/docs**
5. Save

#### Create GitHub Secrets (if needed)
1. Go to **Settings > Secrets and variables > Actions**
2. No secrets required for public PWA
3. (Optional) Add for future integrations:
   - `DEPLOY_KEY`: SSH key for deployment
   - `SLACK_WEBHOOK`: For Slack notifications

### 3. Version Tags & Releases

```bash
# Create version tag
git tag -a v2.0 -m "ETH PWA v2.0 - Production Release"
git push origin v2.0

# GitHub will automatically:
# 1. Run build workflow
# 2. Create ZIP package
# 3. Generate release notes
# 4. Publish GitHub Release
```

## Deployment Options

### Option 1: GitHub Pages (Recommended)

**Setup:**
```bash
# Already configured in workflows
# Your PWA will be available at:
# https://yourusername.github.io/eth-kompetenzraster-pwa/docs/app/
```

**Pros:**
- ✅ Free hosting
- ✅ HTTPS included
- ✅ Automatic updates
- ✅ Easy subdomain setup

**Cons:**
- Public repository only
- Limited to static files

### Option 2: Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy PWA files
COPY docs ./

# Install http-server globally
RUN npm install -g http-server

# Expose port
EXPOSE 3000

# Serve app
CMD ["http-server", "-p", "3000", "-c-1"]
```

**Build & Run:**
```bash
docker build -t eth-kompetenzraster-pwa .
docker run -p 3000:3000 eth-kompetenzraster-pwa
```

### Option 3: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eth-pwa
spec:
  replicas: 2
  selector:
    matchLabels:
      app: eth-pwa
  template:
    metadata:
      labels:
        app: eth-pwa
    spec:
      containers:
      - name: eth-pwa
        image: eth-kompetenzraster-pwa:v2.0
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /app/index.html
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
```

### Option 4: Nginx Deployment

```nginx
server {
    listen 80;
    server_name eth-kompetenzraster.example.com;
    
    root /var/www/eth-pwa/docs;
    index app/index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Service Worker cache control
    location /app/sw.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
    
    # Static assets (long cache)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # App files (no cache)
    location /app/ {
        try_files $uri $uri/ /app/index.html;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
}
```

## CI/CD Pipeline Flow

```
Push to main
    ↓
Test & Validate (test.yml)
    ├─ JSON validation
    ├─ HTML structure check
    ├─ JavaScript syntax check
    ├─ Security scan (XSS)
    ├─ CSS validation
    └─ Documentation check
    ↓
Success → Build & Package (build.yml)
    ├─ Version extraction
    ├─ ZIP creation
    ├─ Checksum generation
    ├─ Release notes
    └─ GitHub Release (if tagged)
    ↓
Deploy (GitHub Pages)
    ↓
Available at:
    https://yourusername.github.io/eth-kompetenzraster-pwa/docs/app/
```

## Monitoring & Debugging

### View Workflow Runs
1. Go to **Actions** tab in GitHub
2. Click workflow name to see history
3. Click run to see details

### Debugging Failed Workflows

```bash
# Download logs
git log --oneline | head -10

# Re-run specific workflow
# (Use GitHub UI: Re-run jobs)

# Check local validation
bash .github/workflows/test.yml  # Not actually executable
python3 -m json.tool docs/data/modules.json  # Manual validation
```

### Common Issues

**Issue: ZIP is too large**
```bash
# Reduce size (remove backups/old files)
rm -f docs/app/*-backup.*
git add . && git commit -m "Cleanup"
```

**Issue: Workflow timeout**
```bash
# Increase timeout in workflow YAML
timeout-minutes: 10  # Default is 6
```

**Issue: Release notes not generated**
```bash
# Ensure tag format: v2.0, v1.0.1, etc.
git tag -a v2.0 -m "Release v2.0"
git push origin v2.0
```

## Security Best Practices

### 1. Use HTTPS
```nginx
# Force HTTPS redirect
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ...
}
```

### 2. Content Security Policy
```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

### 3. Regular Updates
- Keep workflows updated
- Monitor security advisories
- Test new browser versions

## Performance Optimization

### Gzip Compression
```nginx
gzip on;
gzip_types text/plain text/css application/javascript;
gzip_min_length 1000;
```

### Browser Caching Strategy
```
/app/index.html → Cache: max-age=0 (always fresh)
/app/*.js, *.css → Cache: max-age=31536000 (1 year)
/modules/* → Cache: max-age=604800 (1 week)
```

### Monitor Performance
```bash
# Use Lighthouse CI
npm install -g @lhci/cli@latest

# Run audit
lhci autorun
```

## Disaster Recovery

### Backup Strategy
```bash
# Automated backups (GitHub)
# Repos are backed up automatically

# Manual backup
git clone https://github.com/yourusername/eth-kompetenzraster-pwa.git backup-$(date +%Y%m%d)
```

### Rollback to Previous Version
```bash
# View tags
git tag -l

# Checkout previous version
git checkout v1.9
git push origin HEAD:rollback-branch

# Manually deploy from rollback-branch
```

## Monitoring & Alerts

### GitHub Actions Status Badge
```markdown
[![Tests](https://github.com/yourusername/eth-kompetenzraster-pwa/actions/workflows/test.yml/badge.svg)](...)
[![Build](https://github.com/yourusername/eth-kompetenzraster-pwa/actions/workflows/build.yml/badge.svg)](...)
```

### Email Notifications
1. GitHub Settings > Notifications
2. Watch repository
3. Get notifications on workflow failures

### Slack Integration (Optional)
```yaml
- name: Notify Slack on failure
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -d '{"text":"ETH PWA build failed"}'
```

## Support & Maintenance

- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for features
- **Contact**: barbara.lacara@sl.ethz.ch (ETH Zurich)

---

**Document Version**: 2.0  
**Last Updated**: 2026-02-03  
**Maintained By**: ETH Zurich
