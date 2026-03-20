"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { resetPatientPassword } from "@/lib/patient/session";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
}: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Veuillez entrer votre adresse email");
      return;
    }
    setLoading(true);
    const { error } = await resetPatientPassword(email);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
    toast.success("Email de réinitialisation envoyé !");
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setEmail("");
      setSent(false);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Mot de passe oublié
          </DialogTitle>
          <DialogDescription>
            Entrez votre email pour recevoir un lien de réinitialisation.
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="rounded-full bg-forest/10 p-3">
              <Mail className="h-6 w-6 text-forest" />
            </div>
            <p className="text-sm text-muted-custom">
              Si un compte existe avec cette adresse, vous recevrez un email
              avec les instructions de réinitialisation.
            </p>
            <Button
              variant="outline"
              className="mt-2 rounded-full"
              onClick={() => handleClose(false)}
            >
              Fermer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <Button
              className="w-full rounded-full bg-forest text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Envoyer le lien"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
