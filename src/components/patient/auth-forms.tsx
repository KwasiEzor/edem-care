"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signInPatient, signUpPatient } from "@/lib/patient/session";
import { ForgotPasswordDialog } from "./forgot-password-dialog";
import { Progress } from "@/components/ui/progress";

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 15;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  return Math.min(100, score);
}

function getStrengthColor(score: number) {
  if (score < 40) return "bg-red-500";
  if (score < 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function getStrengthLabel(score: number) {
  if (score < 40) return "Faible";
  if (score < 70) return "Moyen";
  return "Fort";
}

export function AuthForms() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const [loginState, setLoginState] = useState({ email: "", password: "" });
  const [signupState, setSignupState] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const passwordStrength = getPasswordStrength(signupState.password);

  const handleLogin = async () => {
    setIsSubmitting(true);
    const { error } = await signInPatient(loginState);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Connexion réussie !");
    setLoginState({ email: "", password: "" });
  };

  const handleSignup = async () => {
    if (passwordStrength < 40) {
      toast.error("Le mot de passe est trop faible");
      return;
    }
    setIsSubmitting(true);
    const { error } = await signUpPatient({
      email: signupState.email,
      password: signupState.password,
      name: signupState.name,
      phone: signupState.phone,
    });
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Inscription enregistrée, confirmez votre email.");
    setSignupState({ name: "", email: "", password: "", phone: "" });
  };

  return (
    <>
      <Tabs defaultValue="login">
        <TabsList className="w-full">
          <TabsTrigger value="login" className="flex-1">
            Connexion
          </TabsTrigger>
          <TabsTrigger value="signup" className="flex-1">
            Inscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <div className="mt-4 space-y-4">
            <Input
              value={loginState.email}
              onChange={(e) =>
                setLoginState({ ...loginState, email: e.target.value })
              }
              type="email"
              placeholder="Email"
            />
            <div className="relative">
              <Input
                value={loginState.password}
                onChange={(e) =>
                  setLoginState({ ...loginState, password: e.target.value })
                }
                type={showLoginPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="pr-10"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-custom hover:text-ink transition-colors"
                aria-label={
                  showLoginPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showLoginPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-forest hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <Button
              className="w-full rounded-full bg-forest text-white"
              onClick={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Se connecter"
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="signup">
          <div className="mt-4 space-y-4">
            <Input
              value={signupState.name}
              onChange={(e) =>
                setSignupState({ ...signupState, name: e.target.value })
              }
              placeholder="Votre nom"
            />
            <Input
              value={signupState.email}
              onChange={(e) =>
                setSignupState({ ...signupState, email: e.target.value })
              }
              type="email"
              placeholder="Email"
            />
            <Input
              value={signupState.phone}
              onChange={(e) =>
                setSignupState({ ...signupState, phone: e.target.value })
              }
              placeholder="Téléphone"
            />
            <div className="space-y-2">
              <div className="relative">
                <Input
                  value={signupState.password}
                  onChange={(e) =>
                    setSignupState({
                      ...signupState,
                      password: e.target.value,
                    })
                  }
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-custom hover:text-ink transition-colors"
                  aria-label={
                    showSignupPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showSignupPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {signupState.password && (
                <div className="space-y-1">
                  <Progress
                    value={passwordStrength}
                    className={`h-1.5 ${getStrengthColor(passwordStrength)}`}
                  />
                  <p className="text-xs text-muted-custom">
                    Force : {getStrengthLabel(passwordStrength)}
                  </p>
                </div>
              )}
            </div>
            <Button
              className="w-full rounded-full border border-forest text-forest"
              variant="outline"
              onClick={handleSignup}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Créer un compte"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </>
  );
}
