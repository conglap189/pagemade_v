# Configuration Files

This folder contains all environment and configuration files.

## Files

### Environment Files
- **`.env.example`** - Template for environment variables (safe to commit)
- **`.env.local`** - Local development environment (DO NOT COMMIT)
- **`.env.production`** - Production environment (DO NOT COMMIT)

### Server Configuration
- **`nginx_subdomain.conf`** - Nginx configuration for subdomain support

## Usage

### Setup for Development
```bash
# Copy example to local
cp .env.example .env.local

# Edit with your values
nano .env.local

# Run application
cd ..
python run.py --local
```

### Setup for Production
```bash
# Copy example to production
cp .env.example .env.production

# Edit with production values
nano .env.production

# Run application
cd ..
python run.py
```

## Security Notes

⚠️ **NEVER commit `.env.local` or `.env.production` to git!**

These files contain sensitive credentials:
- Database passwords
- OAuth secrets
- API keys
- Session secrets

The `.gitignore` already excludes these files.
