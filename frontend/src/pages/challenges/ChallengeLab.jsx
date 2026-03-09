import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { AuthContext } from "../../auth/AuthContext";
import "./challengeLab.css";

function getApproachText(challenge) {
  if (!challenge) return "";

  const { category, difficulty } = challenge;
  const isHardBase64 =
    difficulty === "hard" &&
    typeof challenge.description === "string" &&
    challenge.description.toLowerCase().includes("base64");

  if (isHardBase64) {
    return "Identify that this is a Base64 decoding task. Copy the string into a Base64 decoder (or use a command-line tool), decode it, then normalize the result to lowercase as requested before submitting.";
  }

  switch (category) {
    case "XSS":
      if (difficulty === "easy") {
        return "Exploit the reflected XSS vulnerability in the lab. Inject a script payload in the name parameter. Once you see the flag displayed, copy it exactly (including FLAG{...}) and submit it.";
      }
      if (difficulty === "medium") {
        return "Recall what the XSS acronym expands to and format it exactly as requested (hyphen-separated, lowercase). Pay attention to spelling and separators.";
      }
      return "For harder XSS challenges, carefully follow the instructions about decoding or formatting. Think about typical XSS types (reflected, stored, DOM-based) and how the challenge text hints at them.";

    case "SQL Injection":
      if (difficulty === "easy") {
        return "Think about what SQL stands for. Submit the three-letter abbreviation in lowercase as requested.";
      }
      if (difficulty === "medium") {
        return "Focus on what UNION-based injections allow you to do in SQL. Identify the missing verb in the sentence and submit just that word in lowercase.";
      }
      return "For harder SQL Injection challenges, decode any encoded text first and then relate it to common SQLi techniques such as UNION, error-based, or blind SQLi before submitting.";

    case "CSRF":
      if (difficulty === "easy") {
        return "Recall the full form of CSRF and extract the acronym from it. Submit the four letters in lowercase.";
      }
      if (difficulty === "medium") {
        return "Pay attention to the phrase 'Request Forgery'. The key noun that describes the attack is your answer, normalized to lowercase.";
      }
      return "For harder CSRF challenges, expect to decode a helper string or think about CSRF protections like tokens. Decode first, then normalize the result as instructed.";

    case "IDOR":
      if (difficulty === "easy") {
        return "Remember what IDOR stands for and provide the four-letter acronym in lowercase.";
      }
      if (difficulty === "medium") {
        return "Think about what is being changed in the URL or request (for example, IDs or identifiers). The description hints at a short plural noun to submit.";
      }
      return "For hard IDOR challenges, decode any encoded identifier name and relate it to accessing unauthorized resources before entering the final value.";

    case "File Upload":
      if (difficulty === "easy") {
        return "Think of the most common server-side extension used for web shells in examples. Submit only the three-letter extension.";
      }
      if (difficulty === "medium") {
        return "Consider which metadata field (content type) is checked during file uploads. The missing word is the common four-letter term for that type.";
      }
      return "For hard file upload challenges, decode the provided string and treat the decoded phrase as the value to submit, following any formatting instructions.";

    case "Command Injection":
      if (difficulty === "easy") {
        return "Remember the standard abbreviation for the operating system. Submit those two letters in lowercase.";
      }
      if (difficulty === "medium") {
        return "The phrase '_____ injection' points directly to the missing word. Replace the blank with the type of injection described by the category.";
      }
      return "For hard command injection tasks, decode the short encoded string first and then submit the decoded acronym in lowercase.";

    case "Authentication Bypass":
      if (difficulty === "easy") {
        return "Recall what JSON Web Token is shortened to. Submit that three-letter acronym in lowercase.";
      }
      if (difficulty === "medium") {
        return "Think about what is being validated during login. The missing word is a singular form related to usernames and passwords.";
      }
      return "For the hard challenge, decode the encoded phrase for a well-known attack related to sessions, then submit it in the exact lowercase/underscore format requested.";

    case "Forensics":
      if (difficulty === "easy") {
        return "Consider what basic format log files are usually stored in. The missing word is the simple format type.";
      }
      if (difficulty === "medium") {
        return "Focus on what kind of dump you analyze to find malware in RAM. The missing word is the type of dump being analyzed.";
      }
      return "For hard forensics tasks, decode the provided string, then normalize the decoded word (which matches the category name) before submitting.";

    default:
      return "Read the description slowly and pay attention to any words in ALL CAPS or explicit instructions about formatting. Use the hints if you get stuck, then enter exactly what is requested.";
  }
}

export default function ChallengeLab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null); // Store verification token

  // Build lab URL if labPath exists
  // Labs are served from backend root (not /api), so we need to extract base URL
  const getLabBaseUrl = () => {
    const apiBase = api.defaults.baseURL || "http://localhost:5000/api";
    // Remove /api suffix to get backend base URL
    if (apiBase.includes("/api")) {
      return apiBase.replace("/api", "").replace(/\/$/, "");
    }
    // Fallback to localhost if no base URL configured
    return apiBase || "http://localhost:5000";
  };

  // Get VM web terminal URL for embedding
  const getVMWebTerminalUrl = () => {
    if (challenge?.vmConfig?.webTerminal) {
      // Extract port from webTerminal URL (e.g., http://localhost:4200)
      const url = challenge.vmConfig.webTerminal;
      // Return the URL directly for iframe embedding
      return url;
    }
    return null;
  };

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/challenges/${id}`);
      setChallenge(res.data);
      // Store verification token if provided (for non-lab challenges)
      if (res.data.verificationToken) {
        setVerificationToken(res.data.verificationToken);
      }
    } catch (err) {
      toast.error("Failed to load challenge");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async (flag, verificationToken) => {
    try {
      const res = await api.post(`/challenges/${id}/submit`, { 
        answer: flag,
        verificationToken: verificationToken 
      });

      if (res.data.status === "correct") {
        setMessage("Challenge solved! Points awarded automatically.");
        toast.success(`Challenge completed! +${res.data.xpAwarded} XP`);
        // Refresh challenge to show completion status
        fetchChallenge();
      } else if (res.data.status === "completed") {
        setMessage("Challenge already completed.");
        toast.info("You've already completed this challenge.");
      } else {
        setMessage(res.data.msg || "Incorrect flag.");
        toast.error(res.data.msg || "Incorrect flag.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Error submitting flag.";
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Listen for completion messages from lab iframe
  useEffect(() => {
    if (!challenge?.labPath) return;

    const handleMessage = async (event) => {
      // Security: Only accept messages from same origin (our backend)
      const labBaseUrl = getLabBaseUrl();
      const eventOrigin = event.origin;
      const expectedOrigin = labBaseUrl.replace(/\/$/, "");

      // More lenient origin check - allow same protocol and host
      const originHost = new URL(eventOrigin).host;
      const expectedHost = new URL(expectedOrigin).host;

      if (originHost !== expectedHost) {
        console.warn("Rejected message from unauthorized origin:", eventOrigin);
        return;
      }

      if (event.data && event.data.type === "CHALLENGE_SOLVED" && event.data.challengeId === id) {
        const flag = event.data.flag || event.data.answer;
        const token = event.data.verificationToken;
        console.log('[ChallengeLab] Received CHALLENGE_SOLVED message:', { flag, token, challengeId: event.data.challengeId });
        if (flag) {
          // Store token from lab
          if (token) {
            console.log('[ChallengeLab] Storing verification token:', token);
            setVerificationToken(token);
          } else {
            console.warn('[ChallengeLab] No verification token received from lab!');
          }
          // Automatically submit the flag with verification token
          setAnswer(flag);
          await handleAutoSubmit(flag, token);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge, id]);

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setMessage("Please enter your answer.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      // Include verification token if available
      // For lab challenges: token comes from lab postMessage
      // For non-lab challenges: token comes from challenge GET response
      const res = await api.post(`/challenges/${id}/submit`, { 
        answer,
        verificationToken: verificationToken
      });

      if (res.data.status === "correct") {
        setMessage("Correct! Reward granted.");
        toast.success(`${res.data.msg} +${res.data.xpAwarded} XP`);
      } else if (res.data.status === "completed") {
        setMessage("Already completed.");
        toast.info(res.data.msg);
      } else {
        setMessage(res.data.msg);
        toast.error(res.data.msg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Server error during answer submission.";
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyColors = {
    easy: "#10b981",
    medium: "#f59e0b",
    hard: "#ef4444",
  };

  const difficultyLabels = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };

  if (loading) {
    return (
      <div className="lab-container">
        <div className="loading-spinner">Loading challenge...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="lab-container">
        <div className="error-message">Challenge not found</div>
      </div>
    );
  }

  const approachText = getApproachText(challenge);
  const isAdminLike = user?.role === "admin" || user?.role === "instructor";
  const isHardBase64 =
    challenge.difficulty === "hard" &&
    typeof challenge.description === "string" &&
    challenge.description.toLowerCase().includes("base64");
  const canRevealSolution =
    isAdminLike && isHardBase64 && Boolean(challenge.correctAnswer);

  // Build lab URL with userId and challengeId for verification token generation
  // Use user.id or user._id as fallback
  // This will be recalculated when user or challenge changes
  const userId = user?.id || user?._id || '';
  const labUrl = challenge?.labPath && userId
    ? `${getLabBaseUrl()}${challenge.labPath}?challengeId=${id}&userId=${userId}` 
    : challenge?.labPath
    ? `${getLabBaseUrl()}${challenge.labPath}?challengeId=${id}`
    : null;
  const vmConfig = challenge?.vmConfig;
  const isVMChallenge = vmConfig?.enabled;
  
  // Determine what to display in the right panel
  const getRightPanelUrl = () => {
    if (isVMChallenge) {
      // For VM challenges, always show web terminal embedded in the app
      // Web terminal provides the best integrated experience
      return vmConfig.webTerminal || null;
    }
    return labUrl;
  };
  
  const rightPanelUrl = getRightPanelUrl();
  // Show right panel for VM challenges (with web terminal) or lab challenges
  const shouldShowRightPanel = rightPanelUrl || (isVMChallenge && vmConfig?.webTerminal);

  // Get domain route for back button
  const getDomainRoute = () => {
    if (!challenge?.domain) return "/ctf";
    const domainMap = {
      "Web Exploitation": "web-exploitation",
      "Cryptography": "cryptography",
      "Reverse Engineering": "reverse-engineering",
      "Forensics": "forensics",
      "Binary Exploitation (Pwn)": "binary-exploitation",
      "Active Directory Attacks": "active-directory",
      "Linux Privilege Escalation": "linux-privilege-escalation",
      "Full Machine Exploitation (Pentest Lab)": "full-machine-exploitation",
    };
    return `/ctf/${domainMap[challenge.domain] || "web-exploitation"}`;
  };

  return (
    <div className={`lab-container ${!rightPanelUrl && !shouldShowRightPanel ? "centered" : ""}`}>
      <div className="lab-left">
        <div className="lab-header">
          <button type="button" className="back-btn" onClick={() => navigate(getDomainRoute())}>
            ← Back to Domain
          </button>
          <h1 className="lab-title">{challenge.title}</h1>
        </div>

        <div className="lab-badges">
          <span
            className="difficulty-badge"
            style={{
              backgroundColor: `${difficultyColors[challenge.difficulty]}20`,
              color: difficultyColors[challenge.difficulty],
            }}
          >
            {difficultyLabels[challenge.difficulty]}
          </span>
          <span className="category-badge">{challenge.category}</span>
          {challenge.domain && (
            <span className="domain-badge">{challenge.domain}</span>
          )}
          <span className="points-badge">{challenge.points} XP</span>
          {isVMChallenge && (
            <span className="vm-badge-lab" title="VM-Based Challenge">
              🖥️ VM Required
            </span>
          )}
        </div>

        <div className="lab-section">
          <h3>Description</h3>
          <p className="lab-description">{challenge.description}</p>
        </div>

        {approachText && (
          <div className="lab-section">
            <h3>How to approach</h3>
            <p className="lab-description">{approachText}</p>
          </div>
        )}

        {isVMChallenge && (
          <div className="lab-section vm-info-section">
            <h3>🖥️ Virtual Machine Information</h3>
            <div className="vm-details">
              <p className="lab-description">
                <strong>VM Type:</strong> {vmConfig.vmType || "Not specified"}
              </p>
              
              {vmConfig.credentials && (
                <div className="vm-credentials-box">
                  <p className="lab-description">
                    <strong>Credentials:</strong>
                  </p>
                  <p className="lab-description">
                    <strong>Username:</strong> <code className="credential-code">{vmConfig.credentials.username || "user"}</code>
                  </p>
                  <p className="lab-description">
                    <strong>Password:</strong> <code className="credential-code">{vmConfig.credentials.password || "password123"}</code>
                  </p>
                </div>
              )}

              {vmConfig.sshAccess && (
                <div className="vm-access-box">
                  <p className="lab-description">
                    <strong>SSH Access:</strong>
                  </p>
                  <code className="ssh-command">{vmConfig.sshAccess}</code>
                  <p className="lab-description vm-note">
                    Use this command in your terminal to SSH into the Linux VM.
                  </p>
                </div>
              )}

              {vmConfig.webTerminal && (
                <p className="lab-description">
                  <strong>Web Terminal:</strong>{" "}
                  <a href={vmConfig.webTerminal} target="_blank" rel="noopener noreferrer" className="vm-link">
                    {vmConfig.webTerminal}
                  </a>
                </p>
              )}

              {vmConfig.vmUrl && (
                <div className="vm-access-box">
                  <p className="lab-description">
                    <strong>VNC Desktop Access:</strong>{" "}
                    <a href={vmConfig.vmUrl} target="_blank" rel="noopener noreferrer" className="vm-link">
                      {vmConfig.vmUrl}
                    </a>
                  </p>
                  <p className="lab-description vm-note">
                    Connect using a VNC client (like TigerVNC, RealVNC, or your browser) to access the full Linux desktop environment.
                  </p>
                </div>
              )}

              {challenge.vmFlag && (
                <div className="vm-flag-info-box">
                  <p className="lab-description">
                    <strong>📋 VM Flag Location:</strong> The flag is stored inside the VM. Once you solve the challenge, find the flag file and submit it.
                  </p>
                  <p className="lab-description vm-note">
                    <strong>Note:</strong> The VM flag is different from the challenge answer. You need to find the flag file inside the VM (typically in /root/flag.txt or /home/user/flag.txt) and submit that value.
                  </p>
                </div>
              )}

              <p className="lab-description vm-instructions">
                <strong>Instructions:</strong> This challenge requires access to a full Linux virtual machine with desktop environment. 
                {vmConfig.vmUrl ? " Use VNC to access the full desktop, SSH for terminal access, or the web terminal for quick access." : vmConfig.sshAccess ? " Use SSH to connect, or use the web terminal if available." : " Use the provided access method to connect to the VM."}
                {" "}Once connected, exploit the vulnerability or solve the challenge to find the VM flag stored inside the system.
              </p>

              {vmConfig.resetEndpoint && (
                <button
                  type="button"
                  className="vm-reset-btn"
                  onClick={async () => {
                    try {
                      await api.post(vmConfig.resetEndpoint);
                      toast.success("VM reset successfully");
                    } catch (err) {
                      toast.error("Failed to reset VM");
                    }
                  }}
                >
                  Reset VM State
                </button>
              )}
            </div>
          </div>
        )}

        {challenge.hints && challenge.hints.length > 0 && (
          <div className="lab-section">
            <h3>Hints</h3>
            <ul className="tips-list">
              {challenge.hints.map((hint, idx) => (
                <li key={idx}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {canRevealSolution && (
          <div className="lab-section">
            <h3>Admin tools</h3>
            <p className="lab-description">
              This section is only visible to admins and instructors. Use it to
              verify solutions or create write-ups; do not expose it to
              students in demos.
            </p>
            {!showSolution ? (
              <button
                type="button"
                className="solution-toggle-btn"
                onClick={() => setShowSolution(true)}
              >
                Reveal solution
              </button>
            ) : (
              <div className="solution-box">
                <h4>Correct answer</h4>
                <p className="lab-description">
                  Enter this exact value in the answer box to solve this
                  challenge:
                </p>
                <p className="lab-description">
                  <code>{challenge.correctAnswer}</code>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="lab-section answer-section">
          <h3>Your Answer</h3>
          <p className="lab-description">
            {isVMChallenge
              ? "Complete the challenge in the virtual machine environment, then paste the flag below."
              : labUrl
              ? "Exploit the vulnerability in the lab environment, then paste the flag below."
              : "Enter the answer (flag, key, or value) defined by the challenge."}
          </p>
          <input
            className="answer-input"
            type="text"
            placeholder={labUrl ? "FLAG{...}" : "Type your answer..."}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button
            onClick={submitAnswer}
            disabled={submitting}
            className="submit-btn"
          >
            {submitting ? "Checking..." : "Submit Answer"}
          </button>
          {message && (
            <div
              className={`submit-message ${
                message.includes("Correct") || message.includes("Already completed") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {shouldShowRightPanel && (
        <div className="lab-right">
          <div className="lab-frame-header">
            <span className="frame-title" title={isVMChallenge ? "Virtual Machine Environment" : "Interactive Lab Environment"}>
              {isVMChallenge ? "🖥️ Linux VM" : "Lab"}
            </span>
            {rightPanelUrl && (
              <a
                href={rightPanelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="open-new-tab"
              >
                Open in new tab
              </a>
            )}
          </div>
          {isVMChallenge ? (
            <div className="vm-container">
              {rightPanelUrl ? (
                <iframe
                  src={rightPanelUrl}
                  className="lab-iframe vm-iframe"
                  title="Linux Virtual Machine - Web Terminal"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation"
                  allow="fullscreen"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div className="vm-placeholder">
                  <div className="vm-placeholder-content">
                    <div className="vm-placeholder-icon">🖥️</div>
                    <h3>Linux Virtual Machine</h3>
                    <p>Connecting to VM...</p>
                    {vmConfig.sshAccess && (
                      <>
                        <p>Or use SSH to connect:</p>
                        <code className="vm-ssh-display">{vmConfig.sshAccess}</code>
                      </>
                    )}
                    {vmConfig.credentials && (
                      <div className="vm-credentials-display">
                        <p><strong>Username:</strong> {vmConfig.credentials.username}</p>
                        <p><strong>Password:</strong> {vmConfig.credentials.password}</p>
                      </div>
                    )}
                    <p className="vm-placeholder-note">
                      The VM web terminal will be displayed here once connected.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            labUrl && (
              <iframe
                src={labUrl}
                className="lab-iframe"
                title="Challenge Lab"
                sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                key={labUrl}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
