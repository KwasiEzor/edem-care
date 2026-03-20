"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  updatePatientProfile,
  updatePatientPassword,
} from "@/lib/patient/session";

interface ProfileTabProps {
  session: Session;
}

export function ProfileTab({ session }: ProfileTabProps) {
  const user = session.user;
  const metadata = user.user_metadata ?? {};

  const [name, setName] = useState(metadata.full_name ?? "");
  const [phone, setPhone] = useState(metadata.phone ?? "");
  const [saving, setSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updatePatientProfile({
      full_name: name,
      phone,
    });
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profil mis à jour");
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setChangingPassword(true);
    const { error } = await updatePatientPassword(passwordForm.newPassword);
    setChangingPassword(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Mot de passe modifié");
    setPasswordForm({ newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-8">
      {/* Profile info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-forest">
          Informations personnelles
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nom complet</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user.email ?? ""} disabled className="opacity-60" />
          <p className="text-xs text-muted-custom">
            L&apos;email ne peut pas être modifié ici.
          </p>
        </div>
        <Button
          className="rounded-full bg-forest text-white"
          onClick={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>

      {/* Change password */}
      <div className="space-y-4 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-forest">
          Modifier le mot de passe
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nouveau mot de passe</Label>
            <Input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Confirmer</Label>
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
        </div>
        <Button
          variant="outline"
          className="rounded-full border-forest/40 text-forest"
          onClick={handleChangePassword}
          disabled={changingPassword}
        >
          {changingPassword ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Lock className="h-4 w-4 mr-2" />
          )}
          Changer le mot de passe
        </Button>
      </div>
    </div>
  );
}
