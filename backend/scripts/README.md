# Backend Scripts

This folder contains all operational scripts organized by purpose.

## Structure

```
scripts/
├── deployment/     # Production deployment scripts
├── setup/          # Initial setup and installation
├── maintenance/    # Maintenance and cleanup tasks
└── utils/          # Utility scripts and tools
```

## Deployment Scripts (`deployment/`)

### `deploy_production.sh`
Deploy application to production server.

### `redeploy_keep_database.sh`
Redeploy application while preserving database data.

### `upload_and_redeploy.sh`
Upload code changes and redeploy.

### `fix_editor_production.sh`
Fix editor issues in production environment.

## Setup Scripts (`setup/`)

### `setup.sh`
Main setup script for fresh installation.
```bash
./scripts/setup/setup.sh
```

### `setup_redis.sh`
Install and configure Redis cache server.
```bash
./scripts/setup/setup_redis.sh
```

## Maintenance Scripts (`maintenance/`)

### `cleanup_migration.sh`
Clean up old migration files and database backups.
```bash
./scripts/maintenance/cleanup_migration.sh
```

## Utility Scripts (`utils/`)

### `manage_admin.py`
Manage admin users (create, delete, list).
```bash
python scripts/utils/manage_admin.py --help
```

### `migrate_subdomain.py`
Migrate subdomain configurations.
```bash
python scripts/utils/migrate_subdomain.py
```

## Usage Tips

### Make Scripts Executable
```bash
chmod +x scripts/deployment/*.sh
chmod +x scripts/setup/*.sh
chmod +x scripts/maintenance/*.sh
```

### Run from Backend Root
All scripts should be run from `/backend/` directory:
```bash
cd /home/helios/ver1.1/backend
./scripts/setup/setup.sh
```
