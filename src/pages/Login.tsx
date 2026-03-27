import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";

const PASSWORD_MIN_LENGTH = 8;

function messageForFirebaseAuthCode(code: string | undefined): string {
  if (!code) return "Google sign-in did not complete. Please try again.";
  const map: Record<string, string> = {
    "auth/popup-closed-by-user": "The sign-in window was closed before finishing.",
    "auth/cancelled-popup-request": "Another sign-in attempt is already in progress.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups for this site and try again.",
    "auth/account-exists-with-different-credential": "An account already exists with the same email using a different sign-in method.",
    "auth/credential-already-in-use": "This Google account is already linked to another user.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/unauthorized-domain": "This domain is not authorized for sign-in. Contact support.",
    "auth/operation-not-allowed": "Google sign-in is not enabled for this project.",
  };
  return map[code] ?? `Sign-in failed (${code.replace("auth/", "")}). Please try again.`;
}

function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

type PasswordChecks = ReturnType<typeof getPasswordChecks>;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const Login = () => {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, signup, loginWithGoogle, getLastGoogleSignInErrorCode } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const signupPasswordValid = useMemo(
    () => Object.values(passwordChecks).every(Boolean),
    [passwordChecks],
  );
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignupMode) {
      if (!signupPasswordValid) {
        setError("Password does not meet all requirements.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    const success = isSignupMode
      ? await signup(name.trim(), email, password)
      : await login(email, password);

    if (success) navigate("/");
    if (!success) {
      setError(
        isSignupMode
          ? "An account with this email already exists."
          : "Invalid email or password."
      );
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    const success = await loginWithGoogle();
    if (success) navigate("/");
    if (!success) setError(messageForFirebaseAuthCode(getLastGoogleSignInErrorCode()));
    setGoogleLoading(false);
  };

  const ruleItems: { key: keyof PasswordChecks; label: string }[] = [
    { key: "minLength", label: `At least ${PASSWORD_MIN_LENGTH} characters` },
    { key: "uppercase", label: "At least one uppercase letter" },
    { key: "lowercase", label: "At least one lowercase letter" },
    { key: "number", label: "At least one number" },
    { key: "special", label: "At least one special character" },
  ];

  const backdropOrbs = [
    { className: "w-72 h-72 top-[8%] left-[8%] bg-primary/20", duration: 10, delay: 0 },
    { className: "w-96 h-96 bottom-[6%] left-[22%] bg-primary/10", duration: 12, delay: 0.8 },
    { className: "w-64 h-64 top-[26%] right-[10%] bg-primary/15", duration: 11, delay: 0.3 },
    { className: "w-80 h-80 bottom-[10%] right-[20%] bg-primary/10", duration: 13, delay: 1.1 },
  ];

  const particles = Array.from({ length: 12 }).map((_, i) => ({
    key: i,
    left: 6 + (i * 7) % 88,
    top: 10 + (i * 11) % 76,
    size: i % 3 === 0 ? 9 : 6,
    duration: 3 + (i % 4),
    delay: i * 0.2,
  }));

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center bg-background relative overflow-x-hidden overflow-y-auto px-4 py-8 sm:py-12">
      {/* Animated backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.22),transparent_38%),radial-gradient(circle_at_82%_68%,hsl(var(--primary)/0.14),transparent_42%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--background)/0.95))]" />
      <motion.div
        className="absolute -top-16 left-1/4 h-80 w-[38rem] rounded-[40px] bg-secondary/45"
        initial={{ rotate: -22, x: -24, y: -10 }}
        animate={{ x: [0, 16, 0], y: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{ transform: "rotate(-22deg)" }}
      />
      <motion.div
        className="absolute top-[30%] right-[8%] h-64 w-[20rem] rounded-[40px] bg-secondary/40"
        initial={{ rotate: -28, x: 0 }}
        animate={{ x: [0, -14, 0], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        style={{ transform: "rotate(-28deg)" }}
      />
      <motion.div
        className="absolute bottom-[7%] left-[18%] h-40 w-[16rem] rounded-[40px] bg-secondary/35"
        initial={{ rotate: -28, x: 0 }}
        animate={{ x: [0, 12, 0], y: [0, -7, 0] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        style={{ transform: "rotate(-28deg)" }}
      />

      {backdropOrbs.map((orb) => (
        <motion.div
          key={orb.className}
          className={`absolute rounded-full blur-3xl ${orb.className}`}
          animate={{ y: [0, -14, 0], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
        />
      ))}

      {particles.map((dot) => (
        <motion.span
          key={dot.key}
          className="absolute rounded-full bg-foreground/20"
          style={{ left: `${dot.left}%`, top: `${dot.top}%`, width: dot.size, height: dot.size }}
          animate={{ y: [0, -6, 0], opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: dot.duration, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
        />
      ))}

      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn(
          "w-full max-w-md relative z-10 my-auto rounded-xl border backdrop-blur-md",
          isSignupMode
            ? "bg-card/95 border-primary/35 shadow-[0_18px_70px_rgba(0,0,0,0.45),0_0_0_1px_hsl(var(--primary)/0.22)] p-5 sm:p-7"
            : "bg-card/92 border-primary/25 shadow-[0_16px_60px_rgba(0,0,0,0.4),0_0_0_1px_hsl(var(--primary)/0.16)] p-6 sm:p-8"
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-xl",
            isSignupMode
              ? "ring-1 ring-primary/25 shadow-[inset_0_1px_0_hsl(var(--primary)/0.2)]"
              : "ring-1 ring-primary/15 shadow-[inset_0_1px_0_hsl(var(--primary)/0.15)]"
          )}
        />
        <div className={`flex flex-col items-center ${isSignupMode ? "mb-5" : "mb-8"}`}>
          <img
            src={logo}
            alt="Logo"
            className={`object-contain ${isSignupMode ? "w-28 h-28 mb-2" : "w-36 h-36 mb-4"}`}
          />
          <h1 className={`font-bold text-foreground ${isSignupMode ? "text-[1.35rem] tracking-tight" : "text-2xl"}`}>ZentrovAI</h1>
          <p className={`text-muted-foreground ${isSignupMode ? "text-[12px] mt-0.5" : "text-sm mt-1"}`}>
            AI Intelligence Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className={isSignupMode ? "space-y-2.5" : "space-y-4"}>
          {isSignupMode ? (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className={cn(
                  "focus:border-primary",
                  isSignupMode ? "bg-background/80 border-border/70 text-foreground placeholder:text-muted-foreground/80" : "bg-secondary/50 border-border/50"
                )}
              />
            </div>
          ) : null}
          <div>
            <label className={`text-muted-foreground block ${isSignupMode ? "text-xs mb-1" : "text-sm mb-1.5"}`}>Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className={cn(
                "focus:border-primary",
                isSignupMode
                  ? "bg-background/80 border-border/70 text-foreground placeholder:text-muted-foreground/80"
                  : "bg-background/75 border-border/70 text-foreground placeholder:text-muted-foreground/80"
              )}
            />
          </div>
          <div>
            <label className={`text-muted-foreground block ${isSignupMode ? "text-xs mb-1" : "text-sm mb-1.5"}`}>Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={cn(
                "focus:border-primary",
                isSignupMode
                  ? "bg-background/80 border-border/70 text-foreground placeholder:text-muted-foreground/80"
                  : "bg-background/75 border-border/70 text-foreground placeholder:text-muted-foreground/80"
              )}
              autoComplete={isSignupMode ? "new-password" : "current-password"}
            />
          </div>
          {isSignupMode ? (
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5 rounded-md border border-primary/25 bg-background/70 px-2 py-1.5 sm:px-2.5 sm:py-2"
              aria-live="polite"
            >
              {ruleItems.map(({ key, label }) => {
                const ok = passwordChecks[key];
                return (
                  <li key={key} className="flex items-start gap-1.5 text-[11px] leading-snug">
                    {ok ? (
                      <Check className="w-3 h-3 shrink-0 mt-px text-success" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <X className="w-3 h-3 shrink-0 mt-px text-muted-foreground/70" strokeWidth={2} aria-hidden />
                    )}
                    <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {isSignupMode ? (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-background/80 border-border/70 text-foreground placeholder:text-muted-foreground/80 focus:border-primary"
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 ? (
                <p
                  className={`text-[11px] mt-1 ${passwordsMatch ? "text-success" : "text-destructive"}`}
                  role="status"
                >
                  {passwordsMatch ? "Passwords match." : "Passwords do not match."}
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            className={`w-full ${isSignupMode ? "mt-1 h-10 text-sm font-semibold shadow-[0_6px_24px_hsl(var(--primary)/0.3)]" : "mt-2 h-10 text-sm font-semibold shadow-[0_6px_20px_hsl(var(--primary)/0.2)]"}`}
            disabled={
              loading ||
              googleLoading ||
              (isSignupMode && (!signupPasswordValid || !passwordsMatch))
            }
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading
              ? isSignupMode
                ? "Creating account..."
                : "Signing in..."
              : isSignupMode
                ? "Create Account"
                : "Sign In"}
          </Button>
        </form>

        {!isSignupMode ? (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-border/70 bg-background/75 hover:bg-secondary/70 text-foreground"
              disabled={loading || googleLoading}
              onClick={handleGoogle}
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <GoogleIcon className="w-5 h-5 mr-2 shrink-0" />
              )}
              Continue with Google
            </Button>
          </>
        ) : null}

        <p className={`text-muted-foreground text-center ${isSignupMode ? "text-[11px] mt-4" : "text-xs mt-6"}`}>
          {isSignupMode ? "Already have an account?" : "Need an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignupMode((prev) => !prev);
              setError("");
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-primary hover:underline"
          >
            {isSignupMode ? "Sign in" : "Sign up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
