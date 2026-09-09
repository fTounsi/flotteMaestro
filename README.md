# 🚗 FlotteMaestro — Multi-Tenant Fleet Management & IoT Telematics Platform

> **Enterprise-grade multi-tenant Fleet Management System** built for modern logistics, car rental agencies, cold-chain transport, and field service operations. Features real-time GPS tracking, remote immobilizer control, AI fuel intelligence, automated PDF invoicing, and responsive PWA mobile applications.

---

## 📑 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Technology Stack](#-technology-stack)
3. [Database Schema & ERD](#-database-schema--erd)
4. [Docker Deployment on VPS (Step-by-Step)](#-docker-deployment-on-vps-step-by-step)
5. [Hardware GPS Tracker Configuration](#-hardware-gps-tracker-configuration)
6. [SSL & Reverse Proxy Setup (Certbot)](#-ssl--reverse-proxy-setup-certbot)
7. [Database Backup & Maintenance](#-database-backup--maintenance)
8. [Environment Variables Reference](#-environment-variables-reference)

---

## 🏛 Architecture Overview

```text
               +-------------------------------------------------------------+
               |                       INTERNET / CLIENTS                    |
               +-------------------------------------------------------------+
                        |                                           |
                 HTTPS / WSS (:443)                         GPS Telemetry (:5001-5023)
                        |                                           |
                        v                                           v
         +-----------------------------+             +-------------------------------+
         |    Nginx Reverse Proxy      |             |   Traccar / GPS Ingestion     |
         |  (SSL, Gzip, Caching, SPA)  |             | (Teltonika, Coban, Concox...) |
         +-----------------------------+             +-------------------------------+
            |                       |                               |
     Static UI Assets          REST & WS /ws                        |
            |                       |                               |
            v                       v                               v
   +-----------------+    +-------------------+           +-------------------+
   |   Web / Mobile  |    |  Node API Gateway |<--------->|       Redis 7     |
   |   PWA Clients   |    |    & Websockets   |  Pub/Sub  | (Live Ingestion)  |
   +-----------------+    +-------------------+           +-------------------+
                                    |                               |
                                    +--------------+----------------+
                                                   |
                                                   v
                                     +---------------------------+
                                     |   PostgreSQL 16 + PostGIS |
                                     | (TimescaleDB Telemetry)   |
                                     +---------------------------+
```

---

## 🛠 Technology Stack

- **Frontend & Mobile**: React 19, TypeScript, Tailwind CSS, Leaflet + MarkerCluster, Lucide Icons, Motion.
- **Database Engine**: PostgreSQL 16 with PostGIS extension for spatial queries (geofencing, polyline distance).
- **Time-Series Telemetry**: Indexed partition tables (TimescaleDB ready) for high-frequency GPS coordinate storage.
- **Real-Time Pub/Sub**: Redis 7 for sub-second position broadcasting, rate limiting, and caching.
- **Hardware Protocols**: Native ingestion support for Teltonika (Code 8/16), Coban (GPS103), Concox (GT06), Queclink, Ruptela, and Suntech.
- **Containerization**: Multi-stage Docker & Docker Compose with automated database bootstrapping.

---

## 🗄 Database Schema & ERD

The complete SQL schema is located in [`docker/database/init-schema.sql`](./docker/database/init-schema.sql).

### Core Schema Modules

| Category | Table Name | Purpose |
| :--- | :--- | :--- |
| **Tenancy** | `organizations` | Multi-tenant tenant accounts, active plan, enabled feature flags |
| **Tenancy** | `subscription_plans` | Tier limits (vehicle limit, retention days, add-on features) |
| **Auth** | `users`, `user_sessions`, `api_keys` | RBAC authentication, JWT refresh tokens, API keys |
| **Assets** | `fleets`, `vehicles`, `drivers` | Fleet division, vehicle specifications, assigned drivers |
| **Telematics** | `trackers`, `tracker_commands` | Hardware IMEI, SIM ICCID, protocol, remote GPRS/SMS commands |
| **Tracking** | `gps_positions`, `trips`, `fleet_stops` | Time-series GPS telemetry, ignition trips, idle duration logs |
| **Geofences** | `geofences`, `alert_rules`, `alerts` | Circular/Polygon spatial zones, event triggers, triage logs |
| **Car Rental** | `rental_contracts`, `rental_reservations` | Check-in/out, digital signatures, damage inspections |
| **Car Rental** | `rental_customers`, `relay_command_logs` | Customer ratings, blacklist, remote relay engine cut-off log |
| **Fuel AI** | `fuel_incidents`, `refuel_records` | Siphon theft alerts, abnormal loss detection, fuel receipts |
| **Cold Chain** | `cold_chain_excursions`, `haccp_certificates`| Dual-zone temperature excursions, HACCP compliance PDFs |
| **Live Sharing**| `shareable_live_links`, `delivery_pods` | Temporary customer tracking links, Electronic POD signatures |
| **Maintenance**| `maintenance_intervals`, `dtc_diagnostic_codes` | Odometer/calendar service schedules, OBD-II CAN trouble codes |
| **Billing** | `billing_client_profiles`, `invoices` | Automated B2B fleet invoicing, PDF tax invoice generation |

---

## 🚀 Docker Deployment on VPS (Step-by-Step)

Follow these steps to deploy FlotteMaestro onto any Ubuntu 22.04 or 24.04 LTS VPS (Hetzner, DigitalOcean, OVH, AWS, Linode).

### Step 1: Connect to VPS & Install Docker

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install prerequisite utilities
sudo apt install -y curl git ufw fail2ban

# Install Docker Engine & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Enable Docker without root
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

### Step 2: Configure VPS Firewall (UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow Web Traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow GPS Tracker Ports (TCP & UDP)
sudo ufw allow 5001/tcp  # Teltonika
sudo ufw allow 5001/udp
sudo ufw allow 5002/tcp  # Coban
sudo ufw allow 5023/tcp  # Concox
sudo ufw allow 5004/tcp  # Queclink
sudo ufw allow 5013/tcp  # Suntech

# Enable Firewall
sudo ufw enable
```

### Step 3: Clone Repository & Configure Environment

```bash
# Clone the repository
git clone https://github.com/your-username/flottemaestro.git /opt/flottemaestro
cd /opt/flottemaestro

# Create your production environment file
cp .env.docker.example .env

# Edit .env with your secure passwords & domain
nano .env
```

### Step 4: Build & Launch with Docker Compose

```bash
# Start all containers in the background (App, PostgreSQL, Redis)
docker compose up -d --build

# Inspect running containers
docker compose ps

# Check logs
docker compose logs -f app
```

The database schema in `docker/database/init-schema.sql` is **automatically executed** on the first launch of PostgreSQL.

---

## 📡 Hardware GPS Tracker Configuration

Configure your hardware GPS tracker to send data to your VPS IP or Domain:

| Device Brand | Model Examples | Port | Ingestion Protocol | Recommended Command |
| :--- | :--- | :--- | :--- | :--- |
| **Teltonika** | FMB920, FMC130, FMM130 | `5001` | Teltonika Code 8 / Code 16 | `setparam 2004:YOUR_VPS_IP;2005:5001;2006:0` |
| **Coban** | GPS103A/B, TK103, GPS303 | `5002` | Coban ASCII / GPRS | `adminip123456 YOUR_VPS_IP 5002` |
| **Concox / Jimi** | GT06N, WeTrack2, VL03 | `5023` | GT06 Binary | `SERVER,1,YOUR_VPS_IP,5023,0#` |
| **Queclink** | GV200, GV300, GL300 | `5004` | Queclink ASCII @ACK | `AT+GTSRI=...` |
| **Suntech** | ST310U, ST340LC | `5013` | Suntech ST300 | `ST300CMD;...;YOUR_VPS_IP;5013` |

---

## 🔒 SSL & Reverse Proxy Setup (Certbot)

To secure your installation with free Let's Encrypt SSL certificates:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install certificate for your domain
sudo certbot certonly --standalone -d fleet.yourdomain.com

# Mount certificates into your Nginx container (or use Host Nginx)
```

---

## 💾 Database Backup & Maintenance

### Automated Daily PostgreSQL Backup Script

Create `/opt/flottemaestro/scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/flottemaestro/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# Execute pg_dump inside the docker container
docker compose exec -T postgres pg_dump -U flotte_admin -d flottemaestro | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Keep only the last 14 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
```

Add to cron (`crontab -e`):

```bash
0 3 * * * /bin/bash /opt/flottemaestro/scripts/backup.sh >> /var/log/flotte_backup.log 2>&1
```

### Restoring a Database Backup

```bash
gunzip -c /opt/flottemaestro/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | docker compose exec -T postgres psql -U flotte_admin -d flottemaestro
```

---

## ⚙️ Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT_HTTP` | `80` | External HTTP ingress port |
| `PORT_HTTPS` | `443` | External HTTPS ingress port |
| `DB_NAME` | `flottemaestro` | PostgreSQL database name |
| `DB_USER` | `flotte_admin` | Database username |
| `DB_PASSWORD` | `flotte_secure_password_2026` | Secure database password |
| `REDIS_PASSWORD` | `redis_secure_password_2026` | Redis authentication password |
| `JWT_SECRET` | *(Random 32+ chars)* | Secret used to sign user access tokens |
| `VITE_API_URL` | `https://yourdomain.com/api` | API Endpoint passed to frontend |
| `VITE_WS_URL` | `wss://yourdomain.com/ws` | WebSocket URL for live telemetry stream |

---

## 👥 Default Master Admin Credentials

When the database is first initialized using `init-schema.sql`:

- **Email**: `admin@flottemaestro.com`
- **Password**: `admin123`
- **Demo PIN**: `1234`
- **Organization**: `Atlas Logistics & Car Rental SA`

*(⚠️ Make sure to update the password immediately after logging into production!)*

---

## 📄 License & Support

Proprietary enterprise software. For enterprise customization, Traccar protocol gateways, and dedicated hosting assistance, contact your system administrator.
