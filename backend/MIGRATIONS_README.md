# Database Migrations with golang-migrate

This project uses [golang-migrate](https://github.com/golang-migrate/migrate) for database schema management. This is the recommended approach for managing database changes in production applications.

## Migration Files

All migration files are located in the `migrations/` directory:

- `*.up.sql` - Migration to apply (creates/alters tables)
- `*.down.sql` - Rollback migration (reverses the up migration)

## Current Migrations

1. `000001_create_users_table` - Creates users table
2. `000002_create_businesses_table` - Creates businesses table
3. `000003_create_websites_table` - Creates websites table (includes URL column)
4. `000004_create_plans_table` - Creates plans table
5. `000005_create_subscriptions_table` - Creates subscriptions table
6. `000006_create_domains_table` - Creates domains table
7. `000007_create_invoices_table` - Creates invoices table
8. `000008_create_payments_table` - Creates payments table

## Automatic Migrations

Migrations run **automatically** when you start the backend server:

```bash
cd backend
go run main.go
```

The server will:
1. Connect to the database
2. Check the current migration version
3. Apply any pending migrations
4. Log the results

## Manual Migration Commands

You can also run migrations manually using the `migrate` CLI tool.

### Install migrate CLI

**macOS:**
```bash
brew install golang-migrate
```

**Linux:**
```bash
curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.1/migrate.linux-amd64.tar.gz | tar xvz
sudo mv migrate /usr/local/bin/migrate
```

**Or download from:** https://github.com/golang-migrate/migrate/releases

### Using migrate CLI

**Check current version:**
```bash
cd backend
migrate -path migrations -database "postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable" version
```

**Apply all pending migrations:**
```bash
migrate -path migrations -database "postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable" up
```

**Rollback last migration:**
```bash
migrate -path migrations -database "postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable" down 1
```

**Rollback to specific version:**
```bash
migrate -path migrations -database "postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable" down 3
```

**Go to specific version:**
```bash
migrate -path migrations -database "postgres://zinwaishine:takerisknow@localhost:5432/saas_management?sslmode=disable" goto 5
```

## Creating New Migrations

To create a new migration:

```bash
# Create migration files (in migrations/ directory)
migrate create -ext sql -dir migrations -seq add_new_column_to_users

# This creates:
# migrations/000009_add_new_column_to_users.up.sql
# migrations/000009_add_new_column_to_users.down.sql
```

Then edit the `.up.sql` and `.down.sql` files with your SQL.

**Example `.up.sql`:**
```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(50);
```

**Example `.down.sql`:**
```sql
ALTER TABLE users DROP COLUMN phone;
```

## Best Practices

1. **Always write both up and down migrations** - This enables safe rollbacks
2. **Keep migrations small and focused** - One logical change per migration
3. **Test migrations locally** - Test both up and down migrations
4. **Never modify existing migration files** - Create new migrations for changes
5. **Use transactions** - PostgreSQL supports DDL in transactions (most of the time)
6. **Backup before production** - Always backup the database before running migrations in production

## Production Considerations

- **Separate migration job**: In production, many teams run migrations separately (via CI/CD or a dedicated migration job) before deploying the application
- **Zero-downtime deployments**: Design migrations that can run while the application is running (e.g., add column, then populate, then make it required)
- **Version control**: All migration files should be in version control (git)

## Troubleshooting

**Migration fails with "no change":**
- This means the database is already at the latest version - this is normal and safe

**Migration fails with connection error:**
- Check database credentials in your connection string
- Ensure PostgreSQL is running
- Verify database exists and user has proper permissions

**Need to force migration version:**
```bash
migrate -path migrations -database "postgres://..." force 5
```
⚠️ Use `force` carefully - it can cause issues if used incorrectly

