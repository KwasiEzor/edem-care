# Plan Global d'Amélioration et de Mise en Production — Edem-Care

Ce document définit la stratégie pour finaliser le projet Edem-Care, corriger les problèmes structurels du système de réservation et préparer le lancement sur un domaine réel.

## 1. Analyse du Problème de Réservation ("The Big Issue")

**Symptôme :** Risque élevé de conflits de réservation et expérience utilisateur (UX) dégradée lors de la soumission finale.
**Causes identifiées :**
- **Décalage temporel (Race Condition) :** Entre le moment où l'utilisateur voit un créneau (Étape 2) et le moment où il soumet le formulaire (Étape 3, souvent 1-2 min plus tard), le créneau peut être pris par un autre utilisateur.
- **Absence de re-validation UI :** Le `BookingWizard` ne vérifie pas la disponibilité juste avant l'appel API `POST /api/booking`.
- **Identité Patient Fragile :** Le couplage automatique Téléphone/Email peut fusionner des comptes de manière erronée ou créer des doublons si les informations varient légèrement.
- **Fallback non-atomique :** Le code TypeScript de secours en cas d'échec de la fonction RPC Supabase n'est pas transactionnel.

### Solution "Triple-Lock" proposée :
1.  **Vérification de "Dernière Seconde" :** L'API `/api/booking` doit ré-exécuter `get_available_slots` à l'intérieur de la même transaction que l'insertion (déjà partiellement fait en RPC, mais à renforcer).
2.  **Verrouillage Temporaire (Optionnel/Futur) :** Possibilité d'implémenter un statut `reserved` de 10 minutes lors du passage à l'étape 3.
3.  **Hardening RPC :** Migration complète vers une logique 100% SQL pour la création patient + booking afin de garantir l'atomicité totale.

---

## 2. Plan d'Action par Modules (Approche TDD)

Chaque fonctionnalité sera développée selon le cycle : **Test (Fail) -> Code -> Test (Pass) -> Refactor**.

### A. Core & Sécurité (Priorité Haute)
- [ ] **Défis Anti-Robot Dynamiques :** Remplacer le "3+4=7" statique par un challenge généré côté serveur (ex: session-based ou crypté).
- [ ] **Gestion des Erreurs DAL :** Refactoriser `src/lib/dal` pour utiliser des objets de retour `{ data, error }` explicites au lieu de `null` ou `[]`.
- [ ] **Validation Timezone :** Forcer l'utilisation de `Europe/Brussels` pour tous les calculs de dates côté serveur afin d'éviter les décalages de minuit.

### B. Système de Réservation (Le "Big Issue")
- [ ] **Test de Concurrence :** Créer un test de charge (script `k6` ou vitest concurrent) qui tente de réserver le même créneau 10 fois simultanément.
- [ ] **Refonte `create_booking_atomic` :**
    - Améliorer la détection de patient existant (priorité exacte sur email ET téléphone).
    - Ajouter une vérification de conflit plus stricte.
- [ ] **Feedback UI Amélioré :** Gérer spécifiquement l'erreur 409 (Conflict) dans le Wizard pour proposer un retour immédiat à l'étape 2 avec un message clair.

### C. Expérience Patient & Admin
- [ ] **Modification/Annulation :** Implémenter les routes PATCH/DELETE pour les patients authentifiés.
- [ ] **Tableau de Bord Admin :** Finaliser les graphiques de `AnalyticsCharts` (actuellement des placeholders).
- [ ] **Notifications WhatsApp :** Activer les notifications de confirmation réelles via l'API Meta.

---

## 3. Workflow CI/CD & DevOps

### GitHub Actions (Nouveau)
Mise en place de `.github/workflows/main.yml` :
1.  **Lint & Type-check :** `npm run lint` et `tsc --noEmit`.
2.  **Tests Automatisés :** Exécution de `vitest` sur chaque Pull Request.
3.  **Build Validation :** `next build` pour s'assurer qu'aucune erreur de compilation n'existe.
4.  **Preview Deployments :** Intégration avec Vercel pour des liens de prévisualisation par branche.

### Préparation au Lancement (Main Domain)
- [ ] **Nettoyage des Placeholders :** Remplacer tous les numéros de téléphone et emails de test par les coordonnées réelles d'Edem-Care.
- [ ] **Configuration DNS :** Paramétrage du domaine final, SSL (Vercel), et redirection `www`.
- [ ] **Supabase Production :** Passer du projet "Staging" au projet "Production" avec les clés API définitives.
- [ ] **Vérification RGPD :** S'assurer que le bandeau de cookies et les mentions légales sont à jour.

---

## 4. Calendrier d'Exécution Estimé

| Phase | Durée | Focus |
| :--- | :--- | :--- |
| **Phase 1 : Hardening** | 2 jours | Booking Atomic, Concurrence, TDD Setup |
| **Phase 2 : Features** | 3 jours | Patient Space (Edit/Cancel), WhatsApp, Admin Charts |
| **Phase 3 : CI/CD** | 1 jour | GitHub Actions, Secrets, Environment Audit |
| **Phase 4 : Launch** | 1 jour | DNS, Placeholders, Smoke Tests, Go-Live |

---

## 5. Engagement Qualité (TDD)
Pour chaque bug critique (ex: double réservation) :
1.  **Reproduction :** Écrire un test `vitest` qui échoue en simulant le bug.
2.  **Correction :** Modifier le code (RPC ou API) jusqu'à ce que le test passe.
3.  **Non-régression :** Maintenir ces tests dans la suite CI/CD pour empêcher toute réapparition.
