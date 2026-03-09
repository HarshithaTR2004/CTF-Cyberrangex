require("dotenv").config();
const mongoose = require("mongoose");
const Challenge = require("../models/Challenge");

// Domain mapping
const DOMAINS = {
  "Web Exploitation": {
    categories: ["XSS", "SQL Injection", "CSRF", "IDOR", "File Upload", "Command Injection", "Authentication Bypass", "SSRF"],
  },
  "Cryptography": {
    categories: ["Classical Ciphers", "Modern Cryptography", "Hash Functions", "RSA", "AES", "Encoding"],
  },
  "Reverse Engineering": {
    categories: ["Binary Analysis", "Malware Analysis", "Code Obfuscation", "Packing", "Anti-Debugging"],
  },
  "Forensics": {
    categories: ["Memory Forensics", "Network Forensics", "File Forensics", "Steganography", "Log Analysis"],
  },
  "Binary Exploitation (Pwn)": {
    categories: ["Buffer Overflow", "ROP", "Format String", "Heap Exploitation", "Shellcode"],
  },
  "Active Directory Attacks": {
    categories: ["Kerberos", "LDAP", "NTLM", "Domain Enumeration", "Lateral Movement"],
    isVM: true,
  },
  "Linux Privilege Escalation": {
    categories: ["SUID", "Sudo", "Kernel Exploits", "Cron Jobs", "Environment Variables"],
    isVM: true,
  },
  "Full Machine Exploitation (Pentest Lab)": {
    categories: ["Reconnaissance", "Initial Access", "Persistence", "Privilege Escalation", "Lateral Movement", "Data Exfiltration"],
    isVM: true,
  },
};

// Generate 150 challenges (approximately 19 per domain, with some domains having 18-20)
// Distribution: ~6-7 easy, ~6-7 medium, ~6-7 hard per domain
function generateChallenges() {
  const challenges = [];
  let challengeId = 1;

  // Web Exploitation - 19 challenges
  const webChallenges = [
    // Easy (7)
    { title: "Reflected XSS Basics", category: "XSS", difficulty: "easy", points: 100, correctAnswer: "FLAG{reflected_xss_basic_001}", labPath: "/lab/xss-basic" },
    { title: "SQL Injection Login Bypass", category: "SQL Injection", difficulty: "easy", points: 100, correctAnswer: "FLAG{sqli_login_bypass_002}", labPath: "/lab/sqli-basic" },
    { title: "Basic CSRF Attack", category: "CSRF", difficulty: "easy", points: 100, correctAnswer: "FLAG{csrf_basic_003}", labPath: "/lab/csrf-basic" },
    { title: "IDOR in User Profiles", category: "IDOR", difficulty: "easy", points: 100, correctAnswer: "FLAG{idor_basic_004}", labPath: "/lab/idor-basic" },
    { title: "Unrestricted File Upload", category: "File Upload", difficulty: "easy", points: 100, correctAnswer: "FLAG{file_upload_basic_005}", labPath: "/lab/file-upload-basic" },
    { title: "Command Injection Basics", category: "Command Injection", difficulty: "easy", points: 100, correctAnswer: "FLAG{cmd_injection_basic_006}", labPath: "/lab/command-injection-basic" },
    { title: "JWT Token Manipulation", category: "Authentication Bypass", difficulty: "easy", points: 100, correctAnswer: "FLAG{jwt_bypass_007}", labPath: "/lab/auth-bypass-basic" },
    // Medium (6)
    { title: "Stored XSS Exploitation", category: "XSS", difficulty: "medium", points: 200, correctAnswer: "FLAG{stored_xss_medium_008}", labPath: "/lab/xss-medium" },
    { title: "UNION-Based SQL Injection", category: "SQL Injection", difficulty: "medium", points: 200, correctAnswer: "FLAG{union_sqli_medium_009}", labPath: "/lab/sqli-medium" },
    { title: "Advanced CSRF with Token Bypass", category: "CSRF", difficulty: "medium", points: 200, correctAnswer: "FLAG{csrf_advanced_010}", labPath: "/lab/csrf-medium" },
    { title: "IDOR in API Endpoints", category: "IDOR", difficulty: "medium", points: 200, correctAnswer: "FLAG{idor_api_medium_011}", labPath: "/lab/idor-medium" },
    { title: "File Upload with Filter Bypass", category: "File Upload", difficulty: "medium", points: 200, correctAnswer: "FLAG{file_upload_medium_012}", labPath: "/lab/file-upload-medium" },
    { title: "Command Injection with Encoding", category: "Command Injection", difficulty: "medium", points: 200, correctAnswer: "FLAG{cmd_injection_medium_013}", labPath: "/lab/command-injection-medium" },
    // Hard (6)
    { title: "DOM-Based XSS with Filter Bypass", category: "XSS", difficulty: "hard", points: 300, correctAnswer: "FLAG{dom_xss_hard_014}", labPath: "/lab/xss-hard" },
    { title: "Blind SQL Injection", category: "SQL Injection", difficulty: "hard", points: 300, correctAnswer: "FLAG{blind_sqli_hard_015}", labPath: "/lab/sqli-hard" },
    { title: "CSRF with SameSite Bypass", category: "CSRF", difficulty: "hard", points: 300, correctAnswer: "FLAG{csrf_samesite_hard_016}", labPath: "/lab/csrf-hard" },
    { title: "Complex IDOR Chain", category: "IDOR", difficulty: "hard", points: 300, correctAnswer: "FLAG{idor_chain_hard_017}", labPath: "/lab/idor-hard" },
    { title: "Polyglot File Upload", category: "File Upload", difficulty: "hard", points: 300, correctAnswer: "FLAG{polyglot_upload_hard_018}", labPath: "/lab/file-upload-hard" },
    { title: "Advanced Command Injection", category: "Command Injection", difficulty: "hard", points: 300, correctAnswer: "FLAG{cmd_injection_hard_019}", labPath: "/lab/command-injection-hard" },
  ];

  webChallenges.forEach(c => {
    challenges.push({
      ...c,
      domain: "Web Exploitation",
      description: generateDescription(c.category, c.difficulty, c.title),
      hints: generateHints(c.title, c.category, c.difficulty),
    });
  });

  // Cryptography - 19 challenges
  const cryptoChallenges = [
    // Easy (7)
    { title: "Caesar Cipher Decryption", category: "Classical Ciphers", difficulty: "easy", points: 100, correctAnswer: "FLAG{caesar_decrypt_020}" },
    { title: "Base64 Encoding/Decoding", category: "Encoding", difficulty: "easy", points: 100, correctAnswer: "FLAG{base64_decode_021}" },
    { title: "ROT13 Cipher", category: "Classical Ciphers", difficulty: "easy", points: 100, correctAnswer: "FLAG{rot13_solve_022}" },
    { title: "Hex to ASCII Conversion", category: "Encoding", difficulty: "easy", points: 100, correctAnswer: "FLAG{hex_to_ascii_023}" },
    { title: "Simple Substitution Cipher", category: "Classical Ciphers", difficulty: "easy", points: 100, correctAnswer: "FLAG{substitution_024}" },
    { title: "MD5 Hash Cracking", category: "Hash Functions", difficulty: "easy", points: 100, correctAnswer: "FLAG{md5_crack_025}" },
    { title: "Vigenère Cipher Basics", category: "Classical Ciphers", difficulty: "easy", points: 100, correctAnswer: "FLAG{vigenere_basic_026}" },
    // Medium (6)
    { title: "RSA Public Key Cryptography", category: "RSA", difficulty: "medium", points: 200, correctAnswer: "FLAG{rsa_medium_027}" },
    { title: "AES Encryption Analysis", category: "AES", difficulty: "medium", points: 200, correctAnswer: "FLAG{aes_analysis_028}" },
    { title: "Hash Collision Attack", category: "Hash Functions", difficulty: "medium", points: 200, correctAnswer: "FLAG{hash_collision_029}" },
    { title: "Advanced Vigenère Cipher", category: "Classical Ciphers", difficulty: "medium", points: 200, correctAnswer: "FLAG{vigenere_advanced_030}" },
    { title: "RSA Small Exponent Attack", category: "RSA", difficulty: "medium", points: 200, correctAnswer: "FLAG{rsa_small_e_031}" },
    { title: "AES Mode of Operation", category: "AES", difficulty: "medium", points: 200, correctAnswer: "FLAG{aes_mode_032}" },
    // Hard (6)
    { title: "RSA Private Key Recovery", category: "RSA", difficulty: "hard", points: 300, correctAnswer: "FLAG{rsa_private_key_033}" },
    { title: "AES Key Recovery", category: "AES", difficulty: "hard", points: 300, correctAnswer: "FLAG{aes_key_recovery_034}" },
    { title: "Modern Cryptography Challenge", category: "Modern Cryptography", difficulty: "hard", points: 300, correctAnswer: "FLAG{modern_crypto_035}" },
    { title: "Multi-Layer Cipher", category: "Classical Ciphers", difficulty: "hard", points: 300, correctAnswer: "FLAG{multi_layer_036}" },
    { title: "RSA Coppersmith Attack", category: "RSA", difficulty: "hard", points: 300, correctAnswer: "FLAG{coppersmith_037}" },
    { title: "AES Side-Channel Attack", category: "AES", difficulty: "hard", points: 300, correctAnswer: "FLAG{aes_sidechannel_038}" },
  ];

  cryptoChallenges.forEach(c => {
    challenges.push({
      ...c,
      domain: "Cryptography",
      description: generateDescription(c.category, c.difficulty, c.title),
      hints: generateHints(c.title, c.category, c.difficulty),
    });
  });

  // Reverse Engineering - 19 challenges
  const revChallenges = [
    // Easy (7)
    { title: "Basic Binary Analysis", category: "Binary Analysis", difficulty: "easy", points: 100, correctAnswer: "FLAG{binary_basic_039}" },
    { title: "String Extraction", category: "Binary Analysis", difficulty: "easy", points: 100, correctAnswer: "FLAG{strings_extract_040}" },
    { title: "Simple Obfuscation", category: "Code Obfuscation", difficulty: "easy", points: 100, correctAnswer: "FLAG{obfuscation_simple_041}" },
    { title: "Function Identification", category: "Binary Analysis", difficulty: "easy", points: 100, correctAnswer: "FLAG{function_id_042}" },
    { title: "Basic Malware Analysis", category: "Malware Analysis", difficulty: "easy", points: 100, correctAnswer: "FLAG{malware_basic_043}" },
    { title: "Simple Packing", category: "Packing", difficulty: "easy", points: 100, correctAnswer: "FLAG{packing_simple_044}" },
    { title: "Debug Symbols Analysis", category: "Binary Analysis", difficulty: "easy", points: 100, correctAnswer: "FLAG{debug_symbols_045}" },
    // Medium (6)
    { title: "Advanced Binary Analysis", category: "Binary Analysis", difficulty: "medium", points: 200, correctAnswer: "FLAG{binary_advanced_046}" },
    { title: "Anti-Debugging Bypass", category: "Anti-Debugging", difficulty: "medium", points: 200, correctAnswer: "FLAG{antidebug_bypass_047}" },
    { title: "Complex Obfuscation", category: "Code Obfuscation", difficulty: "medium", points: 200, correctAnswer: "FLAG{obfuscation_complex_048}" },
    { title: "Packed Binary Unpacking", category: "Packing", difficulty: "medium", points: 200, correctAnswer: "FLAG{unpack_binary_049}" },
    { title: "Malware Behavior Analysis", category: "Malware Analysis", difficulty: "medium", points: 200, correctAnswer: "FLAG{malware_behavior_050}" },
    { title: "Control Flow Analysis", category: "Binary Analysis", difficulty: "medium", points: 200, correctAnswer: "FLAG{control_flow_051}" },
    // Hard (6)
    { title: "Advanced Malware Reverse", category: "Malware Analysis", difficulty: "hard", points: 300, correctAnswer: "FLAG{malware_advanced_052}" },
    { title: "Multi-Layer Packing", category: "Packing", difficulty: "hard", points: 300, correctAnswer: "FLAG{multilayer_pack_053}" },
    { title: "Complex Anti-Debugging", category: "Anti-Debugging", difficulty: "hard", points: 300, correctAnswer: "FLAG{antidebug_complex_054}" },
    { title: "VM-Based Obfuscation", category: "Code Obfuscation", difficulty: "hard", points: 300, correctAnswer: "FLAG{vm_obfuscation_055}" },
    { title: "Polymorphic Code Analysis", category: "Binary Analysis", difficulty: "hard", points: 300, correctAnswer: "FLAG{polymorphic_056}" },
    { title: "Advanced Binary Exploitation", category: "Binary Analysis", difficulty: "hard", points: 300, correctAnswer: "FLAG{binary_exploit_057}" },
  ];

  revChallenges.forEach(c => {
    challenges.push({
      ...c,
      domain: "Reverse Engineering",
      description: generateDescription(c.category, c.difficulty, c.title),
      hints: generateHints(c.title, c.category, c.difficulty),
    });
  });

  // Forensics - 19 challenges
  const forensicsChallenges = [
    // Easy (7)
    { title: "Basic Log Analysis", category: "Log Analysis", difficulty: "easy", points: 100, correctAnswer: "FLAG{log_analysis_basic_058}", labPath: "/lab/forensics-basic" },
    { title: "File Metadata Extraction", category: "File Forensics", difficulty: "easy", points: 100, correctAnswer: "FLAG{metadata_extract_059}" },
    { title: "Simple Steganography", category: "Steganography", difficulty: "easy", points: 100, correctAnswer: "FLAG{stego_simple_060}" },
    { title: "Network Packet Analysis", category: "Network Forensics", difficulty: "easy", points: 100, correctAnswer: "FLAG{packet_analysis_061}" },
    { title: "Deleted File Recovery", category: "File Forensics", difficulty: "easy", points: 100, correctAnswer: "FLAG{deleted_recovery_062}" },
    { title: "Basic Memory Dump", category: "Memory Forensics", difficulty: "easy", points: 100, correctAnswer: "FLAG{memory_basic_063}", labPath: "/lab/forensics-medium" },
    { title: "Image Steganography", category: "Steganography", difficulty: "easy", points: 100, correctAnswer: "FLAG{image_stego_064}" },
    // Medium (6)
    { title: "Advanced Log Analysis", category: "Log Analysis", difficulty: "medium", points: 200, correctAnswer: "FLAG{log_advanced_065}" },
    { title: "Memory Forensics Analysis", category: "Memory Forensics", difficulty: "medium", points: 200, correctAnswer: "FLAG{memory_medium_066}", labPath: "/lab/forensics-medium" },
    { title: "Network Traffic Reconstruction", category: "Network Forensics", difficulty: "medium", points: 200, correctAnswer: "FLAG{network_reconstruct_067}" },
    { title: "Advanced Steganography", category: "Steganography", difficulty: "medium", points: 200, correctAnswer: "FLAG{stego_advanced_068}" },
    { title: "File System Analysis", category: "File Forensics", difficulty: "medium", points: 200, correctAnswer: "FLAG{filesystem_analysis_069}" },
    { title: "Timeline Analysis", category: "File Forensics", difficulty: "medium", points: 200, correctAnswer: "FLAG{timeline_070}" },
    // Hard (6)
    { title: "Advanced Memory Forensics", category: "Memory Forensics", difficulty: "hard", points: 300, correctAnswer: "FLAG{memory_advanced_071}", labPath: "/lab/forensics-hard" },
    { title: "Complex Network Analysis", category: "Network Forensics", difficulty: "hard", points: 300, correctAnswer: "FLAG{network_complex_072}" },
    { title: "Multi-Layer Steganography", category: "Steganography", difficulty: "hard", points: 300, correctAnswer: "FLAG{stego_multilayer_073}" },
    { title: "Encrypted File Recovery", category: "File Forensics", difficulty: "hard", points: 300, correctAnswer: "FLAG{encrypted_recovery_074}" },
    { title: "Advanced Timeline Correlation", category: "Log Analysis", difficulty: "hard", points: 300, correctAnswer: "FLAG{timeline_correlation_075}" },
    { title: "Complete Forensics Investigation", category: "File Forensics", difficulty: "hard", points: 300, correctAnswer: "FLAG{forensics_complete_076}", labPath: "/lab/forensics-hard" },
  ];

  forensicsChallenges.forEach(c => {
    challenges.push({
      ...c,
      domain: "Forensics",
      description: generateDescription(c.category, c.difficulty, c.title),
      hints: generateHints(c.title, c.category, c.difficulty),
    });
  });

  // Binary Exploitation (Pwn) - 19 challenges
  const pwnChallenges = [
    // Easy (7)
    { title: "Basic Buffer Overflow", category: "Buffer Overflow", difficulty: "easy", points: 100, correctAnswer: "FLAG{bof_basic_077}" },
    { title: "Stack Overflow Basics", category: "Buffer Overflow", difficulty: "easy", points: 100, correctAnswer: "FLAG{stack_overflow_078}" },
    { title: "Format String Basics", category: "Format String", difficulty: "easy", points: 100, correctAnswer: "FLAG{format_string_079}" },
    { title: "Simple ROP Chain", category: "ROP", difficulty: "easy", points: 100, correctAnswer: "FLAG{rop_simple_080}" },
    { title: "Basic Shellcode", category: "Shellcode", difficulty: "easy", points: 100, correctAnswer: "FLAG{shellcode_basic_081}" },
    { title: "Integer Overflow", category: "Buffer Overflow", difficulty: "easy", points: 100, correctAnswer: "FLAG{int_overflow_082}" },
    { title: "Stack Canary Bypass", category: "Buffer Overflow", difficulty: "easy", points: 100, correctAnswer: "FLAG{canary_bypass_083}" },
    // Medium (6)
    { title: "Advanced Buffer Overflow", category: "Buffer Overflow", difficulty: "medium", points: 200, correctAnswer: "FLAG{bof_advanced_084}" },
    { title: "ROP Chain Construction", category: "ROP", difficulty: "medium", points: 200, correctAnswer: "FLAG{rop_chain_085}" },
    { title: "Format String Exploitation", category: "Format String", difficulty: "medium", points: 200, correctAnswer: "FLAG{format_exploit_086}" },
    { title: "Heap Exploitation Basics", category: "Heap Exploitation", difficulty: "medium", points: 200, correctAnswer: "FLAG{heap_basic_087}" },
    { title: "Advanced Shellcode", category: "Shellcode", difficulty: "medium", points: 200, correctAnswer: "FLAG{shellcode_advanced_088}" },
    { title: "ASLR Bypass", category: "Buffer Overflow", difficulty: "medium", points: 200, correctAnswer: "FLAG{aslr_bypass_089}" },
    // Hard (6)
    { title: "Advanced ROP Exploitation", category: "ROP", difficulty: "hard", points: 300, correctAnswer: "FLAG{rop_advanced_090}" },
    { title: "Heap Exploitation Advanced", category: "Heap Exploitation", difficulty: "hard", points: 300, correctAnswer: "FLAG{heap_advanced_091}" },
    { title: "Complex Format String", category: "Format String", difficulty: "hard", points: 300, correctAnswer: "FLAG{format_complex_092}" },
    { title: "Multi-Stage Exploitation", category: "Buffer Overflow", difficulty: "hard", points: 300, correctAnswer: "FLAG{multistage_093}" },
    { title: "Advanced Shellcode Techniques", category: "Shellcode", difficulty: "hard", points: 300, correctAnswer: "FLAG{shellcode_tech_094}" },
    { title: "Complete Binary Exploitation", category: "Buffer Overflow", difficulty: "hard", points: 300, correctAnswer: "FLAG{pwn_complete_095}" },
  ];

  pwnChallenges.forEach(c => {
    challenges.push({
      ...c,
      domain: "Binary Exploitation (Pwn)",
      description: generateDescription(c.category, c.difficulty, c.title),
      hints: generateHints(c.title, c.category, c.difficulty),
    });
  });

  // Active Directory Attacks - 19 challenges (VM-based)
  const adChallenges = [
    // Easy (7)
    { title: "Domain Enumeration Basics", category: "Domain Enumeration", difficulty: "easy", points: 100, correctAnswer: "FLAG{ad_enum_basic_096}" },
    { title: "Kerberos Authentication", category: "Kerberos", difficulty: "easy", points: 100, correctAnswer: "FLAG{kerberos_basic_097}" },
    { title: "LDAP Query Basics", category: "LDAP", difficulty: "easy", points: 100, correctAnswer: "FLAG{ldap_basic_098}" },
    { title: "NTLM Hash Extraction", category: "NTLM", difficulty: "easy", points: 100, correctAnswer: "FLAG{ntlm_extract_099}" },
    { title: "Basic Lateral Movement", category: "Lateral Movement", difficulty: "easy", points: 100, correctAnswer: "FLAG{lateral_basic_100}" },
    { title: "User Enumeration", category: "Domain Enumeration", difficulty: "easy", points: 100, correctAnswer: "FLAG{user_enum_101}" },
    { title: "Group Policy Enumeration", category: "Domain Enumeration", difficulty: "easy", points: 100, correctAnswer: "FLAG{gpo_enum_102}" },
    // Medium (6)
    { title: "Kerberos Ticket Manipulation", category: "Kerberos", difficulty: "medium", points: 200, correctAnswer: "FLAG{kerberos_ticket_103}" },
    { title: "LDAP Injection", category: "LDAP", difficulty: "medium", points: 200, correctAnswer: "FLAG{ldap_injection_104}" },
    { title: "NTLM Relay Attack", category: "NTLM", difficulty: "medium", points: 200, correctAnswer: "FLAG{ntlm_relay_105}" },
    { title: "Advanced Lateral Movement", category: "Lateral Movement", difficulty: "medium", points: 200, correctAnswer: "FLAG{lateral_advanced_106}" },
    { title: "Pass-the-Hash Attack", category: "NTLM", difficulty: "medium", points: 200, correctAnswer: "FLAG{pass_hash_107}" },
    { title: "Domain Controller Access", category: "Domain Enumeration", difficulty: "medium", points: 200, correctAnswer: "FLAG{dc_access_108}" },
    // Hard (6)
    { title: "Golden Ticket Attack", category: "Kerberos", difficulty: "hard", points: 300, correctAnswer: "FLAG{golden_ticket_109}" },
    { title: "DCSync Attack", category: "LDAP", difficulty: "hard", points: 300, correctAnswer: "FLAG{dcsync_110}" },
    { title: "Advanced NTLM Attacks", category: "NTLM", difficulty: "hard", points: 300, correctAnswer: "FLAG{ntlm_advanced_111}" },
    { title: "Complete Domain Compromise", category: "Lateral Movement", difficulty: "hard", points: 300, correctAnswer: "FLAG{domain_compromise_112}" },
    { title: "Kerberos Delegation Abuse", category: "Kerberos", difficulty: "hard", points: 300, correctAnswer: "FLAG{delegation_abuse_113}" },
    { title: "Full AD Penetration", category: "Domain Enumeration", difficulty: "hard", points: 300, correctAnswer: "FLAG{ad_full_pen_114}" },
  ];

  adChallenges.forEach(c => {
    // Port mapping for AD VMs: easy=4260/2221/5903, medium=4270/2222/5904, hard=4280/2223/5905
    const portMap = {
      easy: { webTerminal: 4260, ssh: 2221, vnc: 5903 },
      medium: { webTerminal: 4270, ssh: 2222, vnc: 5904 },
      hard: { webTerminal: 4280, ssh: 2223, vnc: 5905 },
    };
    const ports = portMap[c.difficulty];
    challenges.push({
      ...c,
      domain: "Active Directory Attacks",
      description: generateDescription(c.category, c.difficulty, c.title),
      hints: generateHints(c.title, c.category, c.difficulty),
      vmFlag: c.correctAnswer, // VM flag is the same as correctAnswer for VM challenges
      vmConfig: {
        enabled: true,
        vmType: "linux",
        vmUrl: `vnc://localhost:${ports.vnc}`, // VNC access for full desktop
        sshAccess: `ssh user@localhost -p ${ports.ssh}`,
        webTerminal: `http://localhost:${ports.webTerminal}`, // Web terminal for iframe display
        resetEndpoint: `/api/vm/reset/ad/${c.difficulty}`,
        credentials: {
          username: "user",
          password: "password123",
        },
      },
    });
  });

  // Linux Privilege Escalation - 19 challenges (VM-based)
  const linuxPrivEscChallenges = [
    // Easy (7)
    { title: "SUID Binary Exploitation", category: "SUID", difficulty: "easy", points: 100, correctAnswer: "FLAG{suid_basic_115}" },
    { title: "Sudo Misconfiguration", category: "Sudo", difficulty: "easy", points: 100, correctAnswer: "FLAG{sudo_basic_116}" },
    { title: "Cron Job Exploitation", category: "Cron Jobs", difficulty: "easy", points: 100, correctAnswer: "FLAG{cron_basic_117}" },
    { title: "Environment Variable Abuse", category: "Environment Variables", difficulty: "easy", points: 100, correctAnswer: "FLAG{env_var_118}" },
    { title: "Writable /etc/passwd", category: "SUID", difficulty: "easy", points: 100, correctAnswer: "FLAG{passwd_writable_119}" },
    { title: "Basic Kernel Exploit", category: "Kernel Exploits", difficulty: "easy", points: 100, correctAnswer: "FLAG{kernel_basic_120}" },
    { title: "SUDO NOPASSWD", category: "Sudo", difficulty: "easy", points: 100, correctAnswer: "FLAG{sudo_nopasswd_121}" },
    // Medium (6)
    { title: "Advanced SUID Exploitation", category: "SUID", difficulty: "medium", points: 200, correctAnswer: "FLAG{suid_advanced_122}" },
    { title: "Sudo Command Injection", category: "Sudo", difficulty: "medium", points: 200, correctAnswer: "FLAG{sudo_injection_123}" },
    { title: "Cron Job Path Injection", category: "Cron Jobs", difficulty: "medium", points: 200, correctAnswer: "FLAG{cron_path_124}" },
    { title: "LD_PRELOAD Exploitation", category: "Environment Variables", difficulty: "medium", points: 200, correctAnswer: "FLAG{ld_preload_125}" },
    { title: "Kernel Module Exploitation", category: "Kernel Exploits", difficulty: "medium", points: 200, correctAnswer: "FLAG{kernel_module_126}" },
    { title: "Capabilities Abuse", category: "SUID", difficulty: "medium", points: 200, correctAnswer: "FLAG{capabilities_127}" },
    // Hard (6)
    { title: "Advanced Kernel Exploitation", category: "Kernel Exploits", difficulty: "hard", points: 300, correctAnswer: "FLAG{kernel_advanced_128}" },
    { title: "Complex SUID Chain", category: "SUID", difficulty: "hard", points: 300, correctAnswer: "FLAG{suid_chain_129}" },
    { title: "Sudo Buffer Overflow", category: "Sudo", difficulty: "hard", points: 300, correctAnswer: "FLAG{sudo_bof_130}" },
    { title: "Multi-Vector Privilege Escalation", category: "Environment Variables", difficulty: "hard", points: 300, correctAnswer: "FLAG{multi_vector_131}" },
    { title: "Complete System Compromise", category: "Kernel Exploits", difficulty: "hard", points: 300, correctAnswer: "FLAG{system_compromise_132}" },
    { title: "Advanced Linux Exploitation", category: "Cron Jobs", difficulty: "hard", points: 300, correctAnswer: "FLAG{linux_advanced_133}" },
  ];

  linuxPrivEscChallenges.forEach(c => {
    // Port mapping for Linux VMs: easy=4200/2220/5900, medium=4210/2230/5901, hard=4220/2240/5902
    const portMap = {
      easy: { webTerminal: 4200, ssh: 2220, vnc: 5900 },
      medium: { webTerminal: 4210, ssh: 2230, vnc: 5901 },
      hard: { webTerminal: 4220, ssh: 2240, vnc: 5902 },
    };
    const ports = portMap[c.difficulty];
    challenges.push({
      ...c,
      domain: "Linux Privilege Escalation",
      description: generateDescription(c.category, c.difficulty, c.title),
      hints: generateHints(c.title, c.category, c.difficulty),
      vmFlag: c.correctAnswer, // VM flag is the same as correctAnswer for VM challenges
      vmConfig: {
        enabled: true,
        vmType: "linux",
        vmUrl: `vnc://localhost:${ports.vnc}`, // VNC access for full desktop
        sshAccess: `ssh user@localhost -p ${ports.ssh}`,
        webTerminal: `http://localhost:${ports.webTerminal}`, // Web terminal for iframe display
        resetEndpoint: `/api/vm/reset/linux/${c.difficulty}`,
        credentials: {
          username: "user",
          password: "password123",
        },
      },
    });
  });

  // Full Machine Exploitation (Pentest Lab) - 17 challenges (VM-based) - to reach 150 total
  const pentestChallenges = [
    // Easy (6)
    { title: "Initial Reconnaissance", category: "Reconnaissance", difficulty: "easy", points: 100, correctAnswer: "FLAG{recon_basic_134}" },
    { title: "Port Scanning Basics", category: "Reconnaissance", difficulty: "easy", points: 100, correctAnswer: "FLAG{port_scan_135}" },
    { title: "Basic Initial Access", category: "Initial Access", difficulty: "easy", points: 100, correctAnswer: "FLAG{initial_access_136}" },
    { title: "Simple Persistence", category: "Persistence", difficulty: "easy", points: 100, correctAnswer: "FLAG{persistence_basic_137}" },
    { title: "Basic Privilege Escalation", category: "Privilege Escalation", difficulty: "easy", points: 100, correctAnswer: "FLAG{priv_esc_basic_138}" },
    { title: "Simple Data Exfiltration", category: "Data Exfiltration", difficulty: "easy", points: 100, correctAnswer: "FLAG{exfil_basic_139}" },
    // Medium (6)
    { title: "Advanced Reconnaissance", category: "Reconnaissance", difficulty: "medium", points: 200, correctAnswer: "FLAG{recon_advanced_140}" },
    { title: "Multi-Vector Initial Access", category: "Initial Access", difficulty: "medium", points: 200, correctAnswer: "FLAG{initial_multi_141}" },
    { title: "Advanced Persistence", category: "Persistence", difficulty: "medium", points: 200, correctAnswer: "FLAG{persistence_advanced_142}" },
    { title: "Complex Privilege Escalation", category: "Privilege Escalation", difficulty: "medium", points: 200, correctAnswer: "FLAG{priv_esc_complex_143}" },
    { title: "Lateral Movement Techniques", category: "Lateral Movement", difficulty: "medium", points: 200, correctAnswer: "FLAG{lateral_tech_144}" },
    { title: "Stealthy Data Exfiltration", category: "Data Exfiltration", difficulty: "medium", points: 200, correctAnswer: "FLAG{exfil_stealth_145}" },
    // Hard (5)
    { title: "Complete Penetration Test", category: "Reconnaissance", difficulty: "hard", points: 300, correctAnswer: "FLAG{pentest_complete_146}" },
    { title: "Advanced Persistence Mechanisms", category: "Persistence", difficulty: "hard", points: 300, correctAnswer: "FLAG{persistence_advanced_147}" },
    { title: "Full System Compromise", category: "Privilege Escalation", difficulty: "hard", points: 300, correctAnswer: "FLAG{system_full_148}" },
    { title: "Advanced Lateral Movement", category: "Lateral Movement", difficulty: "hard", points: 300, correctAnswer: "FLAG{lateral_advanced_149}" },
    { title: "Complete Red Team Exercise", category: "Data Exfiltration", difficulty: "hard", points: 300, correctAnswer: "FLAG{redteam_complete_150}" },
  ];

  pentestChallenges.forEach(c => {
    // Port mapping for Pentest VMs: easy=4230/2250/5906, medium=4240/2260/5907, hard=4250/2270/5908
    const portMap = {
      easy: { webTerminal: 4230, ssh: 2250, vnc: 5906 },
      medium: { webTerminal: 4240, ssh: 2260, vnc: 5907 },
      hard: { webTerminal: 4250, ssh: 2270, vnc: 5908 },
    };
    const ports = portMap[c.difficulty];
    challenges.push({
      ...c,
      domain: "Full Machine Exploitation (Pentest Lab)",
      description: generateDescription(c.category, c.difficulty, c.title),
      hints: generateHints(c.title, c.category, c.difficulty),
      vmFlag: c.correctAnswer, // VM flag is the same as correctAnswer for VM challenges
      vmConfig: {
        enabled: true,
        vmType: "linux",
        vmUrl: `vnc://localhost:${ports.vnc}`, // VNC access for full desktop
        sshAccess: `ssh user@localhost -p ${ports.ssh}`,
        webTerminal: `http://localhost:${ports.webTerminal}`, // Web terminal for iframe display
        resetEndpoint: `/api/vm/reset/pentest/${c.difficulty}`,
        credentials: {
          username: "user",
          password: "password123",
        },
      },
    });
  });

  return challenges;
}

function generateDescription(category, difficulty, title) {
  const baseDescriptions = {
    easy: `This is an ${difficulty} challenge in ${category}. Analyze the provided materials, identify the vulnerability or technique, and extract the flag.`,
    medium: `This is a ${difficulty} challenge in ${category}. You'll need to apply intermediate techniques and think creatively to solve this challenge.`,
    hard: `This is a ${difficulty} challenge in ${category}. This requires advanced knowledge, multiple steps, and deep understanding of the underlying concepts.`,
  };
  return baseDescriptions[difficulty] || `Solve this ${category} challenge to find the flag.`;
}

// Comprehensive hints mapping for all 150 challenges
function generateHints(title, category, difficulty) {
  const hintsMap = {
    // Web Exploitation (1-19)
    "Reflected XSS Basics": [
      "Look for user input that is reflected in the page without sanitization.",
      "Try injecting <script> tags in input fields.",
      "Check the page source to see how your input is displayed."
    ],
    "SQL Injection Login Bypass": [
      "Try using SQL comments (-- or #) to bypass password checks.",
      "Use ' OR '1'='1' as a username or password.",
      "Look for error messages that reveal database structure."
    ],
    "Basic CSRF Attack": [
      "CSRF attacks exploit the trust a site has in a user's browser.",
      "Create a malicious HTML form that submits to the target site.",
      "The attack happens when a logged-in user visits your malicious page."
    ],
    "IDOR in User Profiles": [
      "Try changing the user ID in the URL or request parameters.",
      "Access other users' resources by modifying identifiers.",
      "Check if authorization is properly implemented."
    ],
    "Unrestricted File Upload": [
      "Try uploading a file with a malicious extension like .php or .jsp.",
      "Check if the server executes uploaded files.",
      "Look for upload endpoints that don't validate file types."
    ],
    "Command Injection Basics": [
      "Try appending commands with ; or && after input.",
      "Test with commands like ; ls or && whoami.",
      "Look for system commands being executed with user input."
    ],
    "JWT Token Manipulation": [
      "Decode the JWT token to see its structure.",
      "Try changing the algorithm to 'none' or modify the payload.",
      "Look for weak secret keys used to sign tokens."
    ],
    "Stored XSS Exploitation": [
      "XSS payload is stored in the database and executed when viewed.",
      "Submit a script in a form field that gets displayed to other users.",
      "Check comment sections, user profiles, or message boards."
    ],
    "UNION-Based SQL Injection": [
      "Use UNION SELECT to extract data from other tables.",
      "First, determine the number of columns with ORDER BY.",
      "Then use UNION SELECT to retrieve sensitive information."
    ],
    "Advanced CSRF with Token Bypass": [
      "CSRF tokens can sometimes be predicted or reused.",
      "Try extracting the token from another page or request.",
      "Check if tokens are validated properly on the server side."
    ],
    "IDOR in API Endpoints": [
      "Test API endpoints by changing resource IDs.",
      "Use tools like Burp Suite or Postman to modify requests.",
      "Check if the API properly validates user permissions."
    ],
    "File Upload with Filter Bypass": [
      "Try double extensions like .php.jpg or .php%00.jpg.",
      "Use case variations like .PhP or .PHP.",
      "Bypass filters with null bytes or special characters."
    ],
    "Command Injection with Encoding": [
      "Try URL encoding, base64 encoding, or hex encoding.",
      "Use encoded payloads like %3B or \\x3b for semicolons.",
      "Test different encoding methods to bypass filters."
    ],
    "DOM-Based XSS with Filter Bypass": [
      "DOM XSS happens in the browser, not on the server.",
      "Check JavaScript code that manipulates the DOM.",
      "Look for eval(), innerHTML, or document.write() usage."
    ],
    "Blind SQL Injection": [
      "Use time-based or boolean-based techniques.",
      "Test with SLEEP() or conditional queries.",
      "Extract data one character at a time using comparisons."
    ],
    "CSRF with SameSite Bypass": [
      "SameSite cookies can be bypassed in certain scenarios.",
      "Try GET requests or form submissions from same-site pages.",
      "Check if the site allows cross-site requests in specific contexts."
    ],
    "Complex IDOR Chain": [
      "Chain multiple IDOR vulnerabilities together.",
      "Use one IDOR to gain access that enables another.",
      "Think about privilege escalation through IDOR."
    ],
    "Polyglot File Upload": [
      "Create a file that is valid in multiple formats.",
      "Combine file signatures to create polyglot files.",
      "Test with files that are both images and scripts."
    ],
    "Advanced Command Injection": [
      "Use command chaining with multiple operators.",
      "Try base64 encoding commands to bypass filters.",
      "Exploit environment variables or command substitution."
    ],
    // Cryptography (20-38)
    "Caesar Cipher Decryption": [
      "Caesar cipher shifts letters by a fixed number.",
      "Try all 26 possible shifts (ROT0 to ROT25).",
      "Look for common words or patterns in the decrypted text."
    ],
    "Base64 Encoding/Decoding": [
      "Base64 uses A-Z, a-z, 0-9, +, and / characters.",
      "Base64 strings often end with = or == padding.",
      "Use online tools or command-line base64 decoder."
    ],
    "ROT13 Cipher": [
      "ROT13 shifts each letter by 13 positions.",
      "ROT13 is its own inverse (apply twice to get original).",
      "Use ROT13 decoder or shift manually."
    ],
    "Hex to ASCII Conversion": [
      "Hexadecimal uses 0-9 and A-F characters.",
      "Convert each pair of hex digits to ASCII.",
      "Use hex to ASCII converter tools."
    ],
    "Simple Substitution Cipher": [
      "Each letter is replaced with another letter.",
      "Look for common letter frequencies (E, T, A are common).",
      "Try frequency analysis or substitution cipher solvers."
    ],
    "MD5 Hash Cracking": [
      "MD5 hashes are 32 hexadecimal characters.",
      "Use hash cracking tools like hashcat or online databases.",
      "Try common passwords or wordlists like rockyou.txt."
    ],
    "Vigenère Cipher Basics": [
      "Vigenère uses a keyword to shift letters.",
      "Find the keyword length using Kasiski examination.",
      "Decrypt each position using the corresponding keyword letter."
    ],
    "RSA Public Key Cryptography": [
      "RSA uses public and private key pairs.",
      "Factor the modulus (n) to find p and q.",
      "Use tools like factordb.com or factorization algorithms."
    ],
    "AES Encryption Analysis": [
      "AES is a block cipher with 128-bit blocks.",
      "Identify the mode of operation (ECB, CBC, etc.).",
      "Look for patterns or weaknesses in the encryption mode."
    ],
    "Hash Collision Attack": [
      "Hash collisions occur when two inputs produce the same hash.",
      "Look for weak hash functions like MD5 or SHA1.",
      "Use collision generation tools or known collision pairs."
    ],
    "Advanced Vigenère Cipher": [
      "Use frequency analysis on each position of the key.",
      "Try different keyword lengths and test decryptions.",
      "Look for repeating patterns to identify the key length."
    ],
    "RSA Small Exponent Attack": [
      "Small public exponents (like e=3) can be vulnerable.",
      "If e=3 and message is small, cube root might work.",
      "Use Chinese Remainder Theorem for multiple messages."
    ],
    "AES Mode of Operation": [
      "ECB mode shows patterns, CBC uses IVs.",
      "Identify the mode by analyzing ciphertext patterns.",
      "Exploit mode-specific vulnerabilities."
    ],
    "RSA Private Key Recovery": [
      "Factor the modulus to recover private key.",
      "Check for weak key generation (small primes, etc.).",
      "Use Wiener's attack for small private exponents."
    ],
    "AES Key Recovery": [
      "Look for key reuse or weak key generation.",
      "Try side-channel attacks or timing analysis.",
      "Check if keys are derived from weak sources."
    ],
    "Modern Cryptography Challenge": [
      "Combine multiple cryptographic techniques.",
      "Look for implementation flaws, not algorithm weaknesses.",
      "Check for padding oracle attacks or other advanced techniques."
    ],
    "Multi-Layer Cipher": [
      "Apply decryption in reverse order of encryption.",
      "Identify each layer (e.g., Base64, then ROT13, then hex).",
      "Decrypt one layer at a time until you get plaintext."
    ],
    "RSA Coppersmith Attack": [
      "Coppersmith's method works on small roots.",
      "Use when you have partial information about factors.",
      "Apply LLL algorithm for small solutions."
    ],
    "AES Side-Channel Attack": [
      "Side-channel attacks use timing or power consumption.",
      "Look for implementation that leaks information.",
      "Analyze timing differences or cache behavior."
    ],
    // Reverse Engineering (39-57)
    "Basic Binary Analysis": [
      "Use tools like file, strings, or objdump to analyze.",
      "Look for hardcoded strings or flags in the binary.",
      "Check the file type and architecture first."
    ],
    "String Extraction": [
      "Use the strings command to extract readable text.",
      "Look for flag patterns like FLAG{ or CTF{.",
      "Check both ASCII and Unicode strings."
    ],
    "Simple Obfuscation": [
      "Obfuscated code hides its true purpose.",
      "Try deobfuscation tools or manual analysis.",
      "Look for patterns that reveal the original logic."
    ],
    "Function Identification": [
      "Use disassemblers like IDA Pro or Ghidra.",
      "Look for function names or call patterns.",
      "Analyze the control flow to understand functionality."
    ],
    "Basic Malware Analysis": [
      "Run in a sandboxed environment first.",
      "Use static and dynamic analysis techniques.",
      "Look for network connections or file operations."
    ],
    "Simple Packing": [
      "Packed binaries are compressed or encrypted.",
      "Use unpacking tools like UPX or generic unpackers.",
      "Look for the original entry point after unpacking."
    ],
    "Debug Symbols Analysis": [
      "Debug symbols contain function and variable names.",
      "Use tools that can read debug information.",
      "Symbols make reverse engineering much easier."
    ],
    "Advanced Binary Analysis": [
      "Combine static and dynamic analysis.",
      "Use debuggers like GDB to trace execution.",
      "Look for anti-debugging or obfuscation techniques."
    ],
    "Anti-Debugging Bypass": [
      "Anti-debugging detects debugger presence.",
      "Patch out checks or use stealth debugging.",
      "Look for ptrace, timing checks, or environment detection."
    ],
    "Complex Obfuscation": [
      "Multiple layers of obfuscation require step-by-step analysis.",
      "Deobfuscate one layer at a time.",
      "Use automated tools or write custom deobfuscation scripts."
    ],
    "Packed Binary Unpacking": [
      "Identify the packer type first (UPX, ASPack, etc.).",
      "Use packer-specific unpacking tools.",
      "Dump the unpacked binary from memory during execution."
    ],
    "Malware Behavior Analysis": [
      "Monitor system calls and API usage.",
      "Use sandboxing tools like Cuckoo or Joe Sandbox.",
      "Look for persistence mechanisms or network activity."
    ],
    "Control Flow Analysis": [
      "Analyze how the program flows through different paths.",
      "Use control flow graphs to visualize execution.",
      "Look for conditional branches and loops."
    ],
    "Advanced Malware Reverse": [
      "Combine static, dynamic, and behavioral analysis.",
      "Look for command and control (C2) communication.",
      "Analyze encryption or obfuscation used by the malware."
    ],
    "Multi-Layer Packing": [
      "Unpack layers one at a time.",
      "Each layer may use a different packing technique.",
      "Dump memory after each unpacking stage."
    ],
    "Complex Anti-Debugging": [
      "Multiple anti-debugging techniques may be used.",
      "Bypass each technique individually.",
      "Use advanced debugging techniques or emulation."
    ],
    "VM-Based Obfuscation": [
      "VM-based obfuscation uses a virtual machine.",
      "Identify the VM interpreter and instruction set.",
      "Reverse the VM to understand the original code."
    ],
    "Polymorphic Code Analysis": [
      "Polymorphic code changes its appearance but not function.",
      "Look for the core logic that remains constant.",
      "Use pattern matching or behavioral analysis."
    ],
    "Advanced Binary Exploitation": [
      "Combine reverse engineering with exploitation techniques.",
      "Identify vulnerabilities like buffer overflows.",
      "Create exploits based on your analysis."
    ],
    // Forensics (58-76)
    "Basic Log Analysis": [
      "Look for suspicious entries or patterns in logs.",
      "Check timestamps and user activities.",
      "Search for keywords like 'flag', 'password', or 'admin'."
    ],
    "File Metadata Extraction": [
      "Use exiftool to extract metadata from files.",
      "Check EXIF data in images for hidden information.",
      "Look for author names, GPS coordinates, or timestamps."
    ],
    "Simple Steganography": [
      "Hidden data is embedded in images or files.",
      "Use tools like steghide, binwalk, or zsteg.",
      "Try different steganography techniques and tools."
    ],
    "Network Packet Analysis": [
      "Use Wireshark to analyze network packets.",
      "Look for HTTP requests, DNS queries, or unusual traffic.",
      "Follow TCP streams to reconstruct conversations."
    ],
    "Deleted File Recovery": [
      "Deleted files may still exist on disk.",
      "Use file recovery tools like testdisk or photorec.",
      "Check unallocated space or file system journals."
    ],
    "Basic Memory Dump": [
      "Memory dumps contain running process information.",
      "Use Volatility framework for memory analysis.",
      "Look for processes, network connections, or strings."
    ],
    "Image Steganography": [
      "Try LSB (Least Significant Bit) steganography.",
      "Use tools like steghide, outguess, or stegsolve.",
      "Check different color channels or bit planes."
    ],
    "Advanced Log Analysis": [
      "Correlate events across multiple log files.",
      "Look for attack patterns or suspicious sequences.",
      "Use log analysis tools or write custom scripts."
    ],
    "Memory Forensics Analysis": [
      "Use Volatility plugins to analyze memory.",
      "Look for malware, injected code, or hidden processes.",
      "Extract network connections and file handles."
    ],
    "Network Traffic Reconstruction": [
      "Reconstruct file transfers from network packets.",
      "Export objects from HTTP or FTP streams.",
      "Look for file signatures or magic bytes."
    ],
    "Advanced Steganography": [
      "Try multiple steganography techniques.",
      "Use statistical analysis to detect hidden data.",
      "Check for encrypted or password-protected steganography."
    ],
    "File System Analysis": [
      "Analyze file system structures and metadata.",
      "Look for deleted files, hidden partitions, or alternate data streams.",
      "Use file system analysis tools like Autopsy or FTK."
    ],
    "Timeline Analysis": [
      "Create a timeline of file system events.",
      "Look for files created, modified, or accessed around a specific time.",
      "Use tools like log2timeline or mactime."
    ],
    "Advanced Memory Forensics": [
      "Use advanced Volatility plugins and techniques.",
      "Analyze kernel objects, drivers, or rootkits.",
      "Look for code injection or hooking techniques."
    ],
    "Complex Network Analysis": [
      "Analyze encrypted or obfuscated network traffic.",
      "Decrypt TLS/SSL if keys are available.",
      "Look for protocol anomalies or covert channels."
    ],
    "Multi-Layer Steganography": [
      "Multiple steganography techniques may be used.",
      "Extract data from each layer sequentially.",
      "Try different tools for each steganography type."
    ],
    "Encrypted File Recovery": [
      "Recover encrypted files or extract encryption keys.",
      "Look for key material in memory dumps or logs.",
      "Try common passwords or key derivation methods."
    ],
    "Advanced Timeline Correlation": [
      "Correlate events from multiple sources.",
      "Combine log analysis with file system timelines.",
      "Look for cause-and-effect relationships between events."
    ],
    "Complete Forensics Investigation": [
      "Combine all forensics techniques.",
      "Create a comprehensive timeline of the incident.",
      "Document findings and chain of custody."
    ],
    // Binary Exploitation (77-95)
    "Basic Buffer Overflow": [
      "Buffer overflows occur when input exceeds buffer size.",
      "Overwrite return addresses to control execution flow.",
      "Use pattern generation tools to find offset."
    ],
    "Stack Overflow Basics": [
      "Stack overflows overwrite stack-based variables.",
      "Find the offset to the return address.",
      "Overwrite return address with shellcode address."
    ],
    "Format String Basics": [
      "Format string vulnerabilities use printf-like functions.",
      "Use %x to leak memory or %n to write memory.",
      "Exploit to read or write arbitrary memory."
    ],
    "Simple ROP Chain": [
      "ROP uses existing code (gadgets) to build exploits.",
      "Find useful gadgets using ROPgadget or ropper.",
      "Chain gadgets to execute desired functionality."
    ],
    "Basic Shellcode": [
      "Shellcode is machine code that spawns a shell.",
      "Inject shellcode into the target process.",
      "Jump to shellcode address to execute it."
    ],
    "Integer Overflow": [
      "Integer overflows occur when values exceed type limits.",
      "Use overflow to create unexpected values.",
      "Exploit arithmetic operations that don't check bounds."
    ],
    "Stack Canary Bypass": [
      "Stack canaries protect against buffer overflows.",
      "Leak the canary value first, then include it in your exploit.",
      "Or find ways to bypass canary checks."
    ],
    "Advanced Buffer Overflow": [
      "Combine multiple techniques for complex overflows.",
      "Deal with ASLR, NX, or other protections.",
      "Use information leaks to bypass protections."
    ],
    "ROP Chain Construction": [
      "Build complex ROP chains for multiple operations.",
      "Use gadgets to set up function arguments.",
      "Chain multiple function calls together."
    ],
    "Format String Exploitation": [
      "Use format strings to read or write memory.",
      "Exploit %n to write arbitrary values.",
      "Chain format string exploits for complex operations."
    ],
    "Heap Exploitation Basics": [
      "Heap exploits target dynamic memory allocation.",
      "Use use-after-free or double-free vulnerabilities.",
      "Manipulate heap metadata to gain control."
    ],
    "Advanced Shellcode": [
      "Advanced shellcode bypasses filters or restrictions.",
      "Use alphanumeric or encoded shellcode.",
      "Implement multi-stage shellcode for complex scenarios."
    ],
    "ASLR Bypass": [
      "ASLR randomizes memory addresses.",
      "Leak addresses to calculate base addresses.",
      "Use information leaks or partial overwrites."
    ],
    "Advanced ROP Exploitation": [
      "Build complex ROP chains with multiple gadgets.",
      "Use ROP to call library functions or syscalls.",
      "Bypass all protections using ROP techniques."
    ],
    "Heap Exploitation Advanced": [
      "Use advanced heap exploitation techniques.",
      "Exploit tcache, fastbins, or unsorted bins.",
      "Manipulate heap structures for arbitrary write."
    ],
    "Complex Format String": [
      "Combine format string exploits with other techniques.",
      "Use format strings to set up other exploits.",
      "Chain multiple format string writes."
    ],
    "Multi-Stage Exploitation": [
      "Break exploitation into multiple stages.",
      "Use first stage to leak information.",
      "Use subsequent stages to achieve final goal."
    ],
    "Advanced Shellcode Techniques": [
      "Use polymorphic or metamorphic shellcode.",
      "Implement anti-analysis techniques in shellcode.",
      "Create shellcode that adapts to the environment."
    ],
    "Complete Binary Exploitation": [
      "Combine all binary exploitation techniques.",
      "Bypass all modern protections (ASLR, NX, PIE, etc.).",
      "Create a reliable exploit for the target binary."
    ],
    // Active Directory Attacks (96-114) - VM-based
    "Domain Enumeration Basics": [
      "Use tools like enum4linux or ldapsearch.",
      "Enumerate users, groups, and computers.",
      "Look for interesting permissions or misconfigurations."
    ],
    "Kerberos Authentication": [
      "Kerberos uses tickets for authentication.",
      "Understand AS-REQ, TGS-REQ, and AP-REQ flows.",
      "Look for weak encryption or misconfigurations."
    ],
    "LDAP Query Basics": [
      "LDAP stores directory information.",
      "Use ldapsearch to query the directory.",
      "Look for sensitive information in LDAP attributes."
    ],
    "NTLM Hash Extraction": [
      "Extract NTLM hashes from memory or files.",
      "Use tools like Mimikatz or secretsdump.",
      "Look for hashes in SAM database or memory dumps."
    ],
    "Basic Lateral Movement": [
      "Move between systems in the network.",
      "Use credentials or hashes to access other machines.",
      "Look for shared credentials or weak permissions."
    ],
    "User Enumeration": [
      "Enumerate domain users and their properties.",
      "Use RPC, LDAP, or SMB enumeration.",
      "Look for users with interesting permissions."
    ],
    "Group Policy Enumeration": [
      "GPOs define security policies.",
      "Enumerate GPOs and their settings.",
      "Look for misconfigured policies or credentials."
    ],
    "Kerberos Ticket Manipulation": [
      "Manipulate Kerberos tickets for privilege escalation.",
      "Use tools like Rubeus or Impacket.",
      "Exploit ticket reuse or delegation."
    ],
    "LDAP Injection": [
      "LDAP injection exploits LDAP query construction.",
      "Inject LDAP filter syntax to bypass authentication.",
      "Use special characters like *, |, or &."
    ],
    "NTLM Relay Attack": [
      "Relay NTLM authentication to other services.",
      "Use tools like ntlmrelayx or Responder.",
      "Exploit SMB or LDAP relay vulnerabilities."
    ],
    "Advanced Lateral Movement": [
      "Use multiple techniques for lateral movement.",
      "Chain credential access with remote execution.",
      "Move through the network systematically."
    ],
    "Pass-the-Hash Attack": [
      "Use NTLM hashes directly without cracking.",
      "Use tools like pth-winexe or crackmapexec.",
      "Bypass password requirements with hash authentication."
    ],
    "Domain Controller Access": [
      "Gain access to domain controllers.",
      "Use DCSync or other techniques to extract credentials.",
      "Look for misconfigured permissions on DCs."
    ],
    "Golden Ticket Attack": [
      "Create forged Kerberos tickets with KRBTGT hash.",
      "Use DCSync to get KRBTGT hash.",
      "Generate tickets with ticketer or Rubeus."
    ],
    "DCSync Attack": [
      "DCSync replicates directory data.",
      "Requires specific permissions (DS-Replication-Get-Changes).",
      "Use secretsdump with DCSync rights to extract all hashes."
    ],
    "Advanced NTLM Attacks": [
      "Combine multiple NTLM attack techniques.",
      "Use NTLMv1 downgrade or relay attacks.",
      "Exploit NTLM authentication weaknesses."
    ],
    "Complete Domain Compromise": [
      "Achieve Domain Admin privileges.",
      "Chain multiple AD attack techniques.",
      "Use BloodHound to find attack paths."
    ],
    "Kerberos Delegation Abuse": [
      "Exploit unconstrained or constrained delegation.",
      "Use delegation to impersonate users.",
      "Look for services with delegation enabled."
    ],
    "Full AD Penetration": [
      "Complete compromise of Active Directory.",
      "Use all available AD attack techniques.",
      "Document the full attack chain."
    ],
    // Linux Privilege Escalation (115-133) - VM-based
    "SUID Binary Exploitation": [
      "Find SUID binaries with: find / -perm -4000 2>/dev/null",
      "SUID binaries run with owner's privileges.",
      "Exploit misconfigured SUID binaries to get root."
    ],
    "Sudo Misconfiguration": [
      "Check sudo permissions with: sudo -l",
      "Look for commands that can be run without password.",
      "Exploit sudo to execute commands as root."
    ],
    "Cron Job Exploitation": [
      "Check cron jobs in /etc/crontab and /var/spool/cron/",
      "Look for writable cron scripts or directories.",
      "Create malicious cron jobs to get root execution."
    ],
    "Environment Variable Abuse": [
      "Check PATH and LD_PRELOAD variables.",
      "Exploit programs that use environment variables unsafely.",
      "Hijack library loading with LD_PRELOAD."
    ],
    "Writable /etc/passwd": [
      "Check if /etc/passwd is writable: ls -la /etc/passwd",
      "Add a new root user to /etc/passwd.",
      "Use openssl to generate password hash."
    ],
    "Basic Kernel Exploit": [
      "Check kernel version: uname -a",
      "Find exploits for the specific kernel version.",
      "Compile and run kernel exploits carefully."
    ],
    "SUDO NOPASSWD": [
      "Check sudoers file for NOPASSWD entries.",
      "Exploit commands that can run without password.",
      "Use sudo to escalate to root privileges."
    ],
    "Advanced SUID Exploitation": [
      "Analyze custom SUID binaries for vulnerabilities.",
      "Use ltrace or strace to understand binary behavior.",
      "Look for command injection or path traversal."
    ],
    "Sudo Command Injection": [
      "Find sudo commands that accept user input.",
      "Inject commands through sudo arguments.",
      "Exploit wildcards or command substitution."
    ],
    "Cron Job Path Injection": [
      "Exploit cron jobs that use wildcards.",
      "Create files with names that get interpreted as commands.",
      "Use cron job execution to get root shell."
    ],
    "LD_PRELOAD Exploitation": [
      "LD_PRELOAD loads libraries before system libraries.",
      "Create malicious shared library.",
      "Exploit programs that run with sudo or SUID."
    ],
    "Kernel Module Exploitation": [
      "Exploit vulnerabilities in kernel modules.",
      "Load malicious kernel modules if possible.",
      "Use kernel exploits for privilege escalation."
    ],
    "Capabilities Abuse": [
      "Check capabilities with: getcap -r / 2>/dev/null",
      "Exploit binaries with dangerous capabilities.",
      "Use cap_setuid to get root privileges."
    ],
    "Advanced Kernel Exploitation": [
      "Use advanced kernel exploitation techniques.",
      "Bypass kernel protections like SMEP or SMAP.",
      "Exploit use-after-free or buffer overflows in kernel."
    ],
    "Complex SUID Chain": [
      "Chain multiple SUID exploits together.",
      "Use one SUID binary to modify another.",
      "Create complex exploit chains for root access."
    ],
    "Sudo Buffer Overflow": [
      "Exploit buffer overflow in sudo binary.",
      "Use ROP or shellcode techniques.",
      "Bypass modern protections in sudo."
    ],
    "Multi-Vector Privilege Escalation": [
      "Combine multiple privilege escalation techniques.",
      "Use information from one vector to exploit another.",
      "Systematically enumerate and exploit all vectors."
    ],
    "Complete System Compromise": [
      "Achieve full root access on the system.",
      "Establish persistence mechanisms.",
      "Document all exploitation steps."
    ],
    "Advanced Linux Exploitation": [
      "Use advanced Linux exploitation techniques.",
      "Bypass all security mechanisms.",
      "Create reliable exploits for the target system."
    ],
    // Full Machine Exploitation / Pentest Lab (134-150) - VM-based
    "Initial Reconnaissance": [
      "Start with network scanning and service enumeration.",
      "Use nmap to discover hosts and services.",
      "Identify potential attack vectors."
    ],
    "Port Scanning Basics": [
      "Use nmap to scan for open ports.",
      "Identify services running on discovered ports.",
      "Look for vulnerable service versions."
    ],
    "Basic Initial Access": [
      "Gain initial access to the target system.",
      "Exploit web vulnerabilities, default credentials, or misconfigurations.",
      "Establish a foothold in the network."
    ],
    "Simple Persistence": [
      "Maintain access after initial compromise.",
      "Create backdoor users or SSH keys.",
      "Set up cron jobs or scheduled tasks."
    ],
    "Basic Privilege Escalation": [
      "Escalate from user to root/administrator.",
      "Use common privilege escalation techniques.",
      "Exploit misconfigurations or vulnerabilities."
    ],
    "Simple Data Exfiltration": [
      "Extract sensitive data from the target.",
      "Use network connections or file transfers.",
      "Look for credentials, files, or databases."
    ],
    "Advanced Reconnaissance": [
      "Perform deep reconnaissance of the target.",
      "Use multiple tools and techniques.",
      "Gather comprehensive information about the target."
    ],
    "Multi-Vector Initial Access": [
      "Use multiple attack vectors for initial access.",
      "Combine web, network, and social engineering.",
      "Try different approaches until one succeeds."
    ],
    "Advanced Persistence": [
      "Implement multiple persistence mechanisms.",
      "Use rootkits, backdoors, or scheduled tasks.",
      "Ensure access survives system reboots."
    ],
    "Complex Privilege Escalation": [
      "Use advanced privilege escalation techniques.",
      "Chain multiple vulnerabilities together.",
      "Bypass modern security mechanisms."
    ],
    "Lateral Movement Techniques": [
      "Move between systems in the network.",
      "Use credentials, hashes, or exploits.",
      "Map the network and identify high-value targets."
    ],
    "Stealthy Data Exfiltration": [
      "Exfiltrate data without detection.",
      "Use encrypted channels or steganography.",
      "Mimic normal traffic patterns."
    ],
    "Complete Penetration Test": [
      "Perform a full penetration test.",
      "Cover all phases: recon, access, escalation, persistence.",
      "Document all findings and exploitation steps."
    ],
    "Advanced Persistence Mechanisms": [
      "Implement advanced persistence techniques.",
      "Use rootkits, bootkits, or firmware modifications.",
      "Make detection and removal difficult."
    ],
    "Full System Compromise": [
      "Achieve complete control of the target system.",
      "Compromise all security mechanisms.",
      "Establish full persistence and access."
    ],
    "Advanced Lateral Movement": [
      "Use advanced techniques for lateral movement.",
      "Exploit trust relationships and shared credentials.",
      "Move through the network systematically."
    ],
    "Complete Red Team Exercise": [
      "Execute a complete red team engagement.",
      "Simulate a real-world attack scenario.",
      "Document the full attack lifecycle."
    ]
  };

  // Return specific hints if available, otherwise return generic hints
  if (hintsMap[title]) {
    return hintsMap[title];
  }

  // Fallback to category and difficulty-based hints
  const genericHints = {
    easy: [
      "Start by examining the provided files or environment carefully.",
      "Look for common patterns or encoding schemes.",
      "Try basic tools and techniques first.",
    ],
    medium: [
      "This challenge requires combining multiple techniques.",
      "Think about how different components interact.",
      "Consider using specialized tools for this category.",
    ],
    hard: [
      "This challenge requires advanced knowledge and multiple steps.",
      "You may need to chain multiple vulnerabilities or techniques.",
      "Consider all possible attack vectors and think outside the box.",
    ],
  };
  return genericHints[difficulty] || ["Analyze the challenge carefully and apply your knowledge."];
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/cyberrangex");
    console.log("Connected to MongoDB");

    await Challenge.deleteMany({});
    console.log("Cleared existing challenges");

    const challenges = generateChallenges();
    await Challenge.insertMany(challenges);
    console.log(`✅ Seeded ${challenges.length} CTF challenges successfully`);

    // Print summary by domain
    const domainSummary = {};
    challenges.forEach(c => {
      if (!domainSummary[c.domain]) {
        domainSummary[c.domain] = { total: 0, easy: 0, medium: 0, hard: 0 };
      }
      domainSummary[c.domain].total++;
      domainSummary[c.domain][c.difficulty]++;
    });

    console.log("\n📊 Challenge Distribution:");
    Object.keys(domainSummary).forEach(domain => {
      const stats = domainSummary[domain];
      console.log(`  ${domain}: ${stats.total} total (${stats.easy} easy, ${stats.medium} medium, ${stats.hard} hard)`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding challenges:", error);
    process.exit(1);
  }
}

seed();
