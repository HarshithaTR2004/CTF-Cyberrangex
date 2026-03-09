FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install full desktop environment (XFCE) and VNC server
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    vim \
    nano \
    sudo \
    openssh-server \
    python3 \
    python3-pip \
    build-essential \
    xfce4 \
    xfce4-goodies \
    x11vnc \
    xvfb \
    dbus-x11 \
    tigervnc-standalone-server \
    tigervnc-common \
    firefox \
    thunar \
    xterm \
    && rm -rf /var/lib/apt/lists/*

# Install ttyd (web terminal) - download pre-built binary
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        curl -L https://github.com/tsl0922/ttyd/releases/download/1.7.3/ttyd.x86_64 -o /usr/local/bin/ttyd; \
    elif [ "$ARCH" = "aarch64" ]; then \
        curl -L https://github.com/tsl0922/ttyd/releases/download/1.7.3/ttyd.aarch64 -o /usr/local/bin/ttyd; \
    else \
        echo "Unsupported architecture: $ARCH" && exit 1; \
    fi && \
    chmod +x /usr/local/bin/ttyd

# Create a non-root user
RUN useradd -m -s /bin/bash user && \
    echo "user:password123" | chpasswd && \
    echo "user ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Create challenge directories
RUN mkdir -p /home/user/challenges /home/user/.vnc /root/challenges && \
    chown -R user:user /home/user

# Set up SSH
RUN mkdir /var/run/sshd && \
    echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config && \
    echo "PermitRootLogin no" >> /etc/ssh/sshd_config

# Create VNC startup script for user
RUN echo '#!/bin/bash\n\
export DISPLAY=:1\n\
Xvfb :1 -screen 0 1024x768x24 &\n\
sleep 2\n\
startxfce4 &\n\
sleep 2\n\
x11vnc -display :1 -nopw -listen 0.0.0.0 -xkb -forever -shared -rfbport 5900 &\n\
' > /start-vnc.sh && \
    chmod +x /start-vnc.sh && \
    chown user:user /start-vnc.sh

# Create flag setup script
RUN echo '#!/bin/bash\n\
# Create challenge flag files for all VM challenges\n\
mkdir -p /root/challenges /home/user/challenges\n\
\n\
# Linux PrivEsc flags (115-133)\n\
echo "FLAG{suid_basic_115}" > /root/challenges/115_flag.txt\n\
echo "FLAG{sudo_basic_116}" > /root/challenges/116_flag.txt\n\
echo "FLAG{cron_basic_117}" > /root/challenges/117_flag.txt\n\
echo "FLAG{env_var_118}" > /root/challenges/118_flag.txt\n\
echo "FLAG{passwd_writable_119}" > /root/challenges/119_flag.txt\n\
echo "FLAG{kernel_basic_120}" > /root/challenges/120_flag.txt\n\
echo "FLAG{sudo_nopasswd_121}" > /root/challenges/121_flag.txt\n\
echo "FLAG{suid_advanced_122}" > /root/challenges/122_flag.txt\n\
echo "FLAG{sudo_injection_123}" > /root/challenges/123_flag.txt\n\
echo "FLAG{cron_path_124}" > /root/challenges/124_flag.txt\n\
echo "FLAG{ld_preload_125}" > /root/challenges/125_flag.txt\n\
echo "FLAG{kernel_module_126}" > /root/challenges/126_flag.txt\n\
echo "FLAG{capabilities_127}" > /root/challenges/127_flag.txt\n\
echo "FLAG{kernel_advanced_128}" > /root/challenges/128_flag.txt\n\
echo "FLAG{suid_chain_129}" > /root/challenges/129_flag.txt\n\
echo "FLAG{sudo_bof_130}" > /root/challenges/130_flag.txt\n\
echo "FLAG{multi_vector_131}" > /root/challenges/131_flag.txt\n\
echo "FLAG{system_compromise_132}" > /root/challenges/132_flag.txt\n\
echo "FLAG{linux_advanced_133}" > /root/challenges/133_flag.txt\n\
\n\
# AD Attack flags (96-114)\n\
echo "FLAG{ad_enum_basic_096}" > /root/challenges/096_flag.txt\n\
echo "FLAG{kerberos_basic_097}" > /root/challenges/097_flag.txt\n\
echo "FLAG{ldap_basic_098}" > /root/challenges/098_flag.txt\n\
echo "FLAG{ntlm_extract_099}" > /root/challenges/099_flag.txt\n\
echo "FLAG{lateral_basic_100}" > /root/challenges/100_flag.txt\n\
echo "FLAG{user_enum_101}" > /root/challenges/101_flag.txt\n\
echo "FLAG{gpo_enum_102}" > /root/challenges/102_flag.txt\n\
echo "FLAG{kerberos_ticket_103}" > /root/challenges/103_flag.txt\n\
echo "FLAG{ldap_injection_104}" > /root/challenges/104_flag.txt\n\
echo "FLAG{ntlm_relay_105}" > /root/challenges/105_flag.txt\n\
echo "FLAG{lateral_advanced_106}" > /root/challenges/106_flag.txt\n\
echo "FLAG{pass_hash_107}" > /root/challenges/107_flag.txt\n\
echo "FLAG{dc_access_108}" > /root/challenges/108_flag.txt\n\
echo "FLAG{golden_ticket_109}" > /root/challenges/109_flag.txt\n\
echo "FLAG{dcsync_110}" > /root/challenges/110_flag.txt\n\
echo "FLAG{ntlm_advanced_111}" > /root/challenges/111_flag.txt\n\
echo "FLAG{domain_compromise_112}" > /root/challenges/112_flag.txt\n\
echo "FLAG{delegation_abuse_113}" > /root/challenges/113_flag.txt\n\
echo "FLAG{ad_full_pen_114}" > /root/challenges/114_flag.txt\n\
\n\
# Pentest Lab flags (134-150)\n\
echo "FLAG{recon_basic_134}" > /root/challenges/134_flag.txt\n\
echo "FLAG{port_scan_135}" > /root/challenges/135_flag.txt\n\
echo "FLAG{initial_access_136}" > /root/challenges/136_flag.txt\n\
echo "FLAG{persistence_basic_137}" > /root/challenges/137_flag.txt\n\
echo "FLAG{priv_esc_basic_138}" > /root/challenges/138_flag.txt\n\
echo "FLAG{exfil_basic_139}" > /root/challenges/139_flag.txt\n\
echo "FLAG{recon_advanced_140}" > /root/challenges/140_flag.txt\n\
echo "FLAG{initial_multi_141}" > /root/challenges/141_flag.txt\n\
echo "FLAG{persistence_advanced_142}" > /root/challenges/142_flag.txt\n\
echo "FLAG{priv_esc_complex_143}" > /root/challenges/143_flag.txt\n\
echo "FLAG{lateral_tech_144}" > /root/challenges/144_flag.txt\n\
echo "FLAG{exfil_stealth_145}" > /root/challenges/145_flag.txt\n\
echo "FLAG{pentest_complete_146}" > /root/challenges/146_flag.txt\n\
echo "FLAG{persistence_advanced_147}" > /root/challenges/147_flag.txt\n\
echo "FLAG{system_full_148}" > /root/challenges/148_flag.txt\n\
echo "FLAG{lateral_advanced_149}" > /root/challenges/149_flag.txt\n\
echo "FLAG{redteam_complete_150}" > /root/challenges/150_flag.txt\n\
\n\
# Create welcome message\n\
echo "Welcome to the Linux VM Challenge Environment!" > /home/user/welcome.txt\n\
echo "Flag files are located in /root/challenges/ and /home/user/challenges/" >> /home/user/welcome.txt\n\
echo "Use '\''find / -name \"*flag*\" 2>/dev/null'\'' to search for flags" >> /home/user/welcome.txt\n\
echo "Common locations: /root/flag.txt, /home/user/flag.txt, /root/challenges/" >> /home/user/welcome.txt\n\
\n\
# Copy flags to user directory for easy access\n\
cp /root/challenges/* /home/user/challenges/ 2>/dev/null || true\n\
\n\
# Set permissions\n\
chown -R user:user /home/user/*\n\
chmod 644 /root/challenges/*.txt 2>/dev/null || true\n\
chmod 644 /home/user/challenges/*.txt 2>/dev/null || true\n\
' > /setup-flags.sh && \
    chmod +x /setup-flags.sh

# Create a startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start SSH server\n\
service ssh start\n\
\n\
# Start DBus for XFCE\n\
mkdir -p /var/run/dbus\n\
dbus-daemon --system --fork\n\
\n\
# Setup flag files\n\
/setup-flags.sh\n\
\n\
# Start VNC server (run as user)\n\
su - user -c "DISPLAY=:1 /start-vnc.sh" &\n\
\n\
# Start ttyd web terminal (bind to all interfaces, port 4200)\n\
su - user -c "ttyd -p 4200 -i 0.0.0.0 bash" &\n\
\n\
# Wait a moment for services to start\n\
sleep 3\n\
\n\
# Keep container running\n\
tail -f /dev/null' > /start.sh && \
    chmod +x /start.sh

# Expose ports: SSH, Web Terminal, VNC
EXPOSE 22 4200 5900

# Start the services
CMD ["/start.sh"]
