# Linux VM Containers for CTF Challenges

This directory contains Docker configuration for Linux VMs used in VM-based CTF challenges.

## Overview

Each VM is a lightweight Ubuntu container with:
- **Web Terminal** (ttyd) - Accessible via browser on port 4200+
- **SSH Access** - For direct terminal access on port 22xx
- **Pre-configured user** - Username: `user`, Password: `password123`

## Port Mapping

### Linux Privilege Escalation
- **Easy**: Web Terminal `4200`, SSH `2220`
- **Medium**: Web Terminal `4210`, SSH `2230`
- **Hard**: Web Terminal `4220`, SSH `2240`

### Active Directory Attacks
- **Easy**: Web Terminal `4260`, SSH `2221`
- **Medium**: Web Terminal `4270`, SSH `2222`
- **Hard**: Web Terminal `4280`, SSH `2223`

### Full Machine Exploitation (Pentest Lab)
- **Easy**: Web Terminal `4230`, SSH `2250`
- **Medium**: Web Terminal `4240`, SSH `2260`
- **Hard**: Web Terminal `4250`, SSH `2270`

## Usage

### Start All VMs
```bash
docker compose up -d
```

### Start Specific VM
```bash
docker compose up -d vm-linux-easy
```

### Access Web Terminal
Open in browser: `http://localhost:4200` (or the appropriate port)

### Access via SSH
```bash
ssh user@localhost -p 2220
# Password: password123
```

### View Logs
```bash
# Linux/Mac/Windows PowerShell
docker compose logs -f vm-linux-easy

# Windows CMD
docker compose logs -f vm-linux-easy
```

### Stop VMs
```bash
docker compose down
```

### Rebuild VMs
```bash
docker compose build --no-cache
docker compose up -d
```

## Customization

To customize a VM for a specific challenge:
1. Create a new Dockerfile in `vms/` directory
2. Add the service to `docker-compose.yml`
3. Update the seed script with the new port mapping

## Troubleshooting

**Web terminal not accessible:**
- Check if the container is running: `docker ps`
- Check logs: `docker logs vm-linux-easy`
- Verify port is not in use: `netstat -an | grep 4200`

**SSH connection refused:**
- Ensure SSH service is running in container
- Check port mapping in docker-compose.yml
- Verify firewall settings

**Container won't start:**
- Check Docker logs: `docker compose logs`
- Verify Dockerfile syntax
- Ensure ports are not already in use
