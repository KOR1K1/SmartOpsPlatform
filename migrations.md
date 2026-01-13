# Database Migrations Guide

This document describes the database migration strategy, rollback procedures, and testing approach for the SmartOps Platform.

## Overview

The project uses **Prisma Migrate** for database schema management. Prisma automatically versions migrations and tracks applied migrations in the `_prisma_migrations` table.

## Migration Workflow

### Creating a New Migration

1. **Modify the schema** (`apps/api/prisma/schema.prisma`)
2. **Create migration**:
   ```bash
   cd apps/api
   npm run prisma:migrate -- --name descriptive_migration_name
   ```
3. **Review the generated SQL** in `prisma/migrations/YYYYMMDDHHMMSS_descriptive_migration_name/migration.sql`
4. **Test the migration** in development before committing

### Applying Migrations

#### Development
```bash
cd apps/api
npm run prisma:migrate
```

#### Production (via Docker)
Migrations are automatically applied on container startup via `entrypoint.sh`:
```bash
npx prisma migrate deploy
```

#### Manual Production Deployment
```bash
cd apps/api
npx prisma migrate deploy
```

## Migration Rollback Strategy

### Understanding Prisma Migrations

Prisma Migrate does **not** support automatic rollback like some other migration tools. Instead, you must create a **new migration** that reverses the changes.

### Rollback Procedures

#### Option 1: Create a Reverse Migration (Recommended)

1. **Identify the migration to rollback**:
   ```bash
   cd apps/api
   npx prisma migrate status
   ```

2. **Check migration history**:
   ```bash
   # View applied migrations
   npx prisma migrate status
   ```

3. **Create a reverse migration**:
   - Manually modify `schema.prisma` to revert the changes
   - Create a new migration:
     ```bash
     npm run prisma:migrate -- --name rollback_previous_migration_name
     ```
   - Review and test the reverse migration

4. **Apply the rollback**:
   ```bash
   npm run prisma:migrate
   ```

#### Option 2: Manual SQL Rollback (Emergency Only)

⚠️ **Warning**: Only use this in emergencies when a migration has caused critical issues.

1. **Identify the problematic migration**:
   ```bash
   npx prisma migrate status
   ```

2. **Manually execute reverse SQL**:
   - Connect to the database
   - Execute SQL to reverse the changes
   - Mark the migration as rolled back:
     ```sql
     DELETE FROM "_prisma_migrations" 
     WHERE migration_name = 'YYYYMMDDHHMMSS_problematic_migration';
     ```

3. **Update schema.prisma** to match the current database state

4. **Create a new migration** to sync:
   ```bash
   npm run prisma:migrate -- --name sync_after_manual_rollback
   ```

### Rollback Scripts

The following npm scripts are available:

```bash
# Check migration status
npm run prisma:migrate:status

# View migration history
npm run prisma:migrate:history

# Reset database (⚠️ DESTRUCTIVE - development only)
npm run prisma:migrate:reset
```

## Migration Testing Strategy

### Pre-Deployment Testing

1. **Test in Development**:
   ```bash
   # Create migration
   npm run prisma:migrate -- --name test_migration
   
   # Verify schema changes
   npx prisma studio
   
   # Run application tests
   npm test
   ```

2. **Test Rollback**:
   ```bash
   # Create reverse migration
   # Apply it
   # Verify database state
   ```

3. **Test in Staging**:
   - Deploy to staging environment
   - Run migration: `npx prisma migrate deploy`
   - Verify application functionality
   - Test rollback procedure if needed

### Migration Checklist

Before deploying a migration to production:

- [ ] Migration tested in development
- [ ] Migration tested in staging (if available)
- [ ] Rollback procedure documented and tested
- [ ] Database backup created (production only)
- [ ] Migration SQL reviewed for:
  - [ ] Data loss risks
  - [ ] Performance impact (indexes, constraints)
  - [ ] Lock duration (for large tables)
- [ ] Application code updated to match schema
- [ ] Deployment plan documented
- [ ] Rollback plan documented

### Testing Large Migrations

For migrations that modify large tables:

1. **Test on production-like data volume**:
   - Use staging with production data copy
   - Measure execution time
   - Identify potential locks

2. **Consider migration strategy**:
   - **Additive migrations** (adding columns): Usually safe
   - **Destructive migrations** (dropping columns): Require careful planning
   - **Data migrations**: May require custom scripts

3. **Use transactions** when possible:
   - Prisma migrations run in transactions by default
   - Large migrations may need to be split

## Migration Versioning

Prisma automatically versions migrations using timestamps:
- Format: `YYYYMMDDHHMMSS_migration_name`
- Example: `20240113120000_add_user_email_index`

### Migration Naming Convention

Use descriptive names:
- ✅ `add_user_email_index`
- ✅ `create_knowledge_documents_table`
- ✅ `add_soft_delete_to_tasks`
- ❌ `migration1`
- ❌ `fix`
- ❌ `update`

## Production Deployment

### Safe Deployment Process

1. **Create database backup**:
   ```bash
   # PostgreSQL backup
   pg_dump -h host -U user -d smartops > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Deploy application code** (with new migration files)

3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Verify migration success**:
   ```bash
   npx prisma migrate status
   ```

5. **Monitor application** for errors

### Rollback in Production

If a migration causes issues:

1. **Stop the application** (if critical)

2. **Assess the situation**:
   - Check application logs
   - Check database state
   - Determine if rollback is necessary

3. **Execute rollback**:
   - Follow "Option 1: Create a Reverse Migration" above
   - Or use "Option 2: Manual SQL Rollback" if urgent

4. **Restore from backup** (if data corruption occurred):
   ```bash
   psql -h host -U user -d smartops < backup_YYYYMMDD_HHMMSS.sql
   ```

## Best Practices

1. **Always test migrations** in development first
2. **Review generated SQL** before applying
3. **Keep migrations small and focused** (one logical change per migration)
4. **Never modify applied migrations** - create new ones instead
5. **Document complex migrations** with comments in migration.sql
6. **Use transactions** for data safety
7. **Backup before production migrations**
8. **Test rollback procedures** before production deployment
9. **Monitor migration execution time** in production
10. **Version control all migrations** - never delete migration files

## Troubleshooting

### Migration Fails to Apply

1. Check database connection
2. Verify migration SQL syntax
3. Check for conflicting migrations
4. Review database logs

### Migration Applied but Schema Mismatch

1. Run `npx prisma migrate resolve --applied <migration_name>` if migration was applied manually
2. Or create a new migration to sync: `npm run prisma:migrate -- --name sync_schema`

### Need to Reset Development Database

⚠️ **Development only**:
```bash
npm run prisma:migrate:reset
npm run prisma:seed
```

## Related Documentation

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Database Schema Documentation](./database.md)
- [Environment Variables](./environment-variables.md)
