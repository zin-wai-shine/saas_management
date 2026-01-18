# 🔐 Test Credentials and Fake Data

## Default Login Credentials

### Admin Account
- **Email**: `admin@saas.com`
- **Password**: `password123`
- **Role**: Admin
- **Access**: Full admin dashboard, can manage plans, businesses, websites

### Owner Accounts

#### Account 1
- **Email**: `john@example.com`
- **Password**: `password123`
- **Role**: Owner
- **Business**: JD Consulting

#### Account 2
- **Email**: `jane@example.com`
- **Password**: `password123`
- **Role**: Owner
- **Business**: Smith & Co. Marketing

#### Account 3
- **Email**: `bob@example.com`
- **Password**: `password123`
- **Role**: Owner
- **Business**: TechStart Solutions

## Sample Data Created

### Plans (3)
1. **Starter** - $29/month
   - 1 Website
   - Standard Support
   - Basic Analytics
   - Email Support

2. **Professional** - $79/month
   - 5 Websites
   - Priority Support
   - Advanced Analytics
   - Custom Domain
   - API Access

3. **Enterprise** - $199/month
   - Unlimited Websites
   - 24/7 Support
   - Enterprise Analytics
   - Custom Domains
   - API Access
   - Dedicated Manager
   - Custom Integrations

### Businesses (5)
1. **JD Consulting** (Active, Claimed)
   - Owner: john@example.com
   - Industry: Consulting
   - Status: Active

2. **Smith & Co. Marketing** (Active, Claimed)
   - Owner: jane@example.com
   - Industry: Marketing
   - Status: Active

3. **TechStart Solutions** (Active, Claimed)
   - Owner: bob@example.com
   - Industry: Technology
   - Status: Active

4. **Demo Restaurant** (Pending, Unclaimed)
   - Available for claiming
   - Industry: Food & Beverage

5. **Demo Fitness Center** (Pending, Unclaimed)
   - Available for claiming
   - Industry: Health & Fitness

### Websites (5)
1. JD Consulting - Professional Website (Approved)
2. Smith Marketing - Digital Agency (Approved)
3. TechStart Solutions - Tech Company (Approved)
4. Demo Restaurant - Claim This Site (Pending)
5. Demo Fitness Center - Claim This Site (Pending)

### Subscriptions (3)
- JD Consulting → Professional Plan
- Smith & Co. Marketing → Professional Plan
- TechStart Solutions → Enterprise Plan

## How to Use

### Login as Admin
1. Go to http://localhost:5173/login
2. Email: `admin@saas.com`
3. Password: `password123`
4. Access admin dashboard to manage everything

### Login as Owner
1. Go to http://localhost:5173/login
2. Use any owner email (e.g., `john@example.com`)
3. Password: `password123`
4. Access owner dashboard for your business

### Register New Account
1. Go to http://localhost:5173/register
2. Fill in your details
3. New account will be created as "owner" role

## Resetting/Re-seeding Data

To re-seed the database with fresh fake data:

```bash
# Stop containers
docker compose down

# Remove database volume (clears all data)
docker compose down -v

# Start again (will auto-seed)
docker compose up -d
```

Or manually trigger seeding:

```bash
# Set environment variable and restart backend
docker compose stop backend
docker compose up -d backend
```

## Security Note

⚠️ **These are test credentials only!**

- Change all passwords in production
- Use strong, unique passwords
- Never commit real credentials to version control
- Use environment variables for sensitive data

