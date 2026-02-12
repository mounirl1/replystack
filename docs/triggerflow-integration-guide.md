# Guide d'Integration TriggerFlow <> ReplyStack

> Ce document est destiné au projet TriggerFlow. Il contient toutes les informations
> techniques pour intégrer l'API ReplyStack et permettre la gestion centralisée des
> avis clients directement depuis TriggerFlow.
>
> **Version :** 2.0 — Mise à jour Sprint 3 (Février 2026)

## 1. Vue d'ensemble

### Qu'est-ce que ReplyStack ?

ReplyStack est une plateforme SaaS de gestion et de réponse automatisée aux avis clients.
Elle offre :
- **Génération de réponses IA** adaptées au ton, à la langue et au contexte
- **Centralisation des avis** depuis Google, TripAdvisor, Booking, Airbnb
- **Analytics de sentiment** (positif/négatif/neutre, thèmes)
- **Synchronisation Google Business Profile** via OAuth (lecture/réponse automatique)
- **Scraping premium** via Apify pour TripAdvisor, Booking et Airbnb
- **Génération en masse** (bulk) de réponses IA
- **Publication de réponses** sur Google via API
- **Alertes** instantanées et récapitulatives sur avis négatifs
- **Multi-établissements** avec stats agrégées par groupe

### Pourquoi intégrer ?

TriggerFlow peut offrir à ses utilisateurs la gestion des avis en white-label :
- Les utilisateurs TriggerFlow accèdent aux fonctionnalités ReplyStack **sans créer de compte ReplyStack**
- L'authentification est transparente : TriggerFlow valide ses propres tokens
- Les données (locations, avis, connexions) sont cloisonnées par utilisateur TriggerFlow
- **Quota illimité** : Les utilisateurs TriggerFlow ont un quota de génération IA illimité (le billing est géré côté TriggerFlow)

### Architecture d'intégration

```
┌─────────────────────┐          ┌─────────────────────────┐
│   TriggerFlow       │          │   ReplyStack API        │
│                     │          │                         │
│  ┌───────────┐      │  Token   │  ┌───────────────────┐  │
│  │ Frontend  │──────┼──Bearer──┼─→│ ValidateTF Token  │  │
│  └───────────┘      │          │  │   Middleware       │  │
│                     │          │  └────────┬──────────┘  │
│  ┌───────────┐      │  Verify  │           │             │
│  │ Auth API  │←─────┼──Token───┼───────────┘             │
│  │ /api/auth │      │          │  GET /api/auth/user     │
│  │  /user    │      │          │                         │
│  └───────────┘      │          │  ┌───────────────────┐  │
│                     │          │  │ TriggerFlow       │  │
│                     │          │  │ Controller        │  │
│                     │          │  │ (24 endpoints)    │  │
│                     │          │  └───────────────────┘  │
└─────────────────────┘          └─────────────────────────┘
```

**Flux d'authentification :**
1. L'utilisateur est connecté à TriggerFlow (a un Bearer token TriggerFlow)
2. TriggerFlow frontend appelle l'API ReplyStack avec ce Bearer token
3. Le middleware ReplyStack appelle `GET {TRIGGERFLOW_API_URL}/api/auth/user` avec le même token
4. TriggerFlow valide le token et retourne les données utilisateur
5. ReplyStack crée/met à jour un utilisateur local et traite la requête

---

## 2. Prérequis : Endpoint d'authentification TriggerFlow

### CE QUE TRIGGERFLOW DOIT EXPOSER

ReplyStack a besoin que TriggerFlow expose **un seul endpoint** pour valider les tokens :

```
GET /api/auth/user
Authorization: Bearer {token_utilisateur_triggerflow}
Accept: application/json
```

**Réponse attendue (200 OK) :**
```json
{
  "id": 42,
  "email": "user@example.com",
  "firstname": "John",
  "lastname": "Doe"
}
```

> **Note :** Le champ `name` est composé de `firstname + " " + lastname` côté ReplyStack.
> Les champs `firstname` et `lastname` sont acceptés. Si seul `name` est fourni, il est utilisé directement.

**Réponse en cas de token invalide (401) :**
```json
{
  "message": "Unauthenticated."
}
```

### Champs requis

| Champ       | Type   | Requis | Description                                   |
|-------------|--------|--------|-----------------------------------------------|
| `id`        | int    | Oui    | ID unique de l'utilisateur TriggerFlow         |
| `email`     | string | Oui    | Email de l'utilisateur                         |
| `firstname` | string | Non    | Prénom                                         |
| `lastname`  | string | Non    | Nom de famille                                 |
| `name`      | string | Non    | Nom affiché (alternatif à firstname+lastname)  |

> **Quota illimité :** Aucun champ `plan` n'est nécessaire. Les utilisateurs TriggerFlow
> ont un quota de génération IA illimité. Le billing est entièrement géré côté TriggerFlow.

### Configuration ReplyStack

ReplyStack est configuré avec ces variables d'environnement :

```env
TRIGGERFLOW_API_URL=https://app.triggerflow.com   # URL de base de l'API TriggerFlow
TRIGGERFLOW_API_KEY=tf-api-key-xxx                # Clé API (réservé usage futur)
```

### Cache des tokens

ReplyStack **cache les résultats de validation pendant 5 minutes** pour éviter de surcharger
l'API TriggerFlow. Cela signifie :
- Un token validé restera valide pendant 5 min côté ReplyStack même si révoqué côté TriggerFlow
- En cas de besoin, ReplyStack peut invalider le cache manuellement

---

## 3. API ReplyStack pour TriggerFlow

### Base URL

```
Production : https://api.reply-stack.app/api/triggerflow
```

### Authentification

Toutes les routes TriggerFlow utilisent le Bearer token TriggerFlow :

```
Authorization: Bearer {token_utilisateur_triggerflow}
Accept: application/json
Content-Type: application/json
```

### Rate limiting

- **60 requêtes par minute** par IP/token
- **Génération de réponses IA** : quota illimité pour les utilisateurs TriggerFlow

### Vue d'ensemble des endpoints (24)

| Section | Méthode | Route | Description |
|---------|---------|-------|-------------|
| **Locations** | POST | `/locations/sync` | Créer/mettre à jour un établissement |
| | DELETE | `/locations/{externalId}` | Supprimer un établissement |
| **Reviews** | GET | `/locations/{externalId}/reviews` | Lister les avis (pagination, filtres avancés) |
| | GET | `/locations/{externalId}/stats` | Statistiques détaillées |
| | PATCH | `/reviews/{reviewId}` | Mettre à jour le statut d'un avis |
| | POST | `/reviews/{reviewId}/reply` | Publier une réponse sur Google |
| **Connections** | GET | `/locations/{externalId}/connections` | Lister les connexions |
| | POST | `/locations/{externalId}/connections` | Créer/mettre à jour une connexion |
| | GET | `/locations/{externalId}/connections/{id}` | Détail d'une connexion |
| | PATCH | `/locations/{externalId}/connections/{id}` | Modifier une connexion |
| | DELETE | `/locations/{externalId}/connections/{id}` | Supprimer une connexion |
| | POST | `/locations/{externalId}/connections/{id}/sync` | Déclencher le sync d'une connexion |
| | POST | `/locations/{externalId}/sync-all` | Sync de toutes les connexions actives |
| **Alerts** | GET | `/locations/{externalId}/alerts` | Lire la config des alertes |
| | PUT | `/locations/{externalId}/alerts` | Modifier la config des alertes |
| **Replies** | POST | `/replies/generate` | Générer une réponse IA |
| | POST | `/replies/bulk-generate` | Générer des réponses IA en masse |
| **Group** | GET | `/facilities/children` | Lister les établissements de l'utilisateur |
| | GET | `/facilities/group-platforms` | Plateformes agrégées du groupe |
| **Google** | GET | `/google/auth-url` | URL d'autorisation Google OAuth |
| | POST | `/google/callback` | Callback Google OAuth |

---

### 3.1 Locations (Etablissements)

#### `POST /api/triggerflow/locations/sync`

Crée ou met à jour un établissement. Si `external_id` existe déjà, c'est une mise à jour.
Les champs non fournis lors d'une mise à jour conservent leur valeur actuelle.

**Request :**
```json
{
  "external_id": "facility-123",
  "name": "Hotel Le Marais",
  "address": "15 Rue du Temple, 75004 Paris",
  "default_tone": "friendly",
  "default_language": "fr"
}
```

| Champ              | Type   | Requis | Valeurs                                          |
|--------------------|--------|--------|--------------------------------------------------|
| `external_id`      | string | Oui    | ID unique de l'établissement dans TriggerFlow     |
| `name`             | string | Oui    | Nom de l'établissement                            |
| `address`          | string | Non    | Adresse complète                                  |
| `default_tone`     | string | Non    | `professional`, `friendly`, `formal`, `casual`    |
| `default_language` | string | Non    | Code langue ISO (ex: `fr`, `en`, `es`) ou `auto`  |

**Response (200) :**
```json
{
  "message": "Location synced successfully",
  "location": {
    "id": 1,
    "user_id": 5,
    "name": "Hotel Le Marais",
    "address": "15 Rue du Temple, 75004 Paris",
    "external_facility_id": "facility-123",
    "external_source": "triggerflow",
    "default_tone": "friendly",
    "default_language": "fr",
    "created_at": "2026-02-12T10:00:00.000000Z",
    "updated_at": "2026-02-12T10:00:00.000000Z"
  }
}
```

---

#### `DELETE /api/triggerflow/locations/{externalId}`

Supprime un établissement et toutes ses données associées (avis, connexions).

**Response (200) :**
```json
{
  "message": "Location deleted successfully"
}
```

**Response (404) :**
```json
{
  "message": "Location not found"
}
```

---

### 3.2 Avis (Reviews)

#### `GET /api/triggerflow/locations/{externalId}/reviews`

Récupère les avis d'un établissement avec **pagination standard** et filtres avancés.

**Query parameters :**

| Param                | Type     | Description                                                       |
|----------------------|----------|-------------------------------------------------------------------|
| `platform`           | string   | Filtrer par plateforme unique                                     |
| `platforms[]`        | string[] | Filtrer par plusieurs plateformes (ex: `platforms[]=google&platforms[]=booking`) |
| `status`             | string   | Filtrer par statut (`pending`, `replied`, `ignored`)              |
| `rating`             | int      | Filtrer par note normalisée exacte (1-5)                          |
| `ratings[]`          | int[]    | Filtrer par plusieurs notes (ex: `ratings[]=1&ratings[]=2`)       |
| `has_reply`          | boolean  | Filtrer par présence/absence de réponse (`true` ou `false`)       |
| `search`             | string   | Recherche texte libre (auteur, contenu, titre, commentaires, réponse) |
| `from_date`          | string   | Avis publiés après cette date (ISO 8601)                          |
| `to_date`            | string   | Avis publiés avant cette date (ISO 8601)                          |
| `sort_by`            | string   | Tri : `review_date` (défaut), `rating`, `created_at`             |
| `sort_order`         | string   | Ordre : `desc` (défaut), `asc`                                   |
| `per_page`           | int      | Nombre d'avis par page (défaut: 20, max: 100)                    |
| `page`               | int      | Page courante (défaut: 1)                                        |
| `filter_location_ids[]` | int[] | Filtrer par IDs de locations (pour les groupes multi-établissements) |

**Response (200) :**
```json
{
  "reviews": [
    {
      "id": 42,
      "location_id": 1,
      "review_connection_id": 3,
      "platform": "google",
      "external_id": "review-abc-123",
      "author_name": "Marie D.",
      "author_avatar": null,
      "rating": 4,
      "normalized_rating": 4,
      "title": null,
      "content": "Excellent séjour, personnel très accueillant.",
      "positive_comment": null,
      "negative_comment": null,
      "language": "fr",
      "published_at": "2026-02-10T14:30:00.000000Z",
      "status": "pending",
      "reply": null,
      "reply_date": null,
      "can_reply": true,
      "reviewer_country": null,
      "stay_date": null,
      "room_type": null,
      "traveler_type": null,
      "has_reply": false,
      "full_comment": "Excellent séjour, personnel très accueillant.",
      "connection_label": "Profil Google principal",
      "platform_url": null,
      "created_at": "2026-02-10T15:00:00.000000Z",
      "updated_at": "2026-02-10T15:00:00.000000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 20,
    "total": 56
  }
}
```

**Champs enrichis par review :**

| Champ              | Description                                                           |
|--------------------|-----------------------------------------------------------------------|
| `normalized_rating`| Note normalisée 1-5 (Booking 1-10→1-5, TripAdvisor 1-50→1-5)        |
| `title`            | Titre de l'avis (si disponible, surtout Booking)                      |
| `positive_comment` | Commentaire positif séparé (Booking spécifique)                       |
| `negative_comment` | Commentaire négatif séparé (Booking spécifique)                       |
| `reply`            | Réponse du propriétaire                                               |
| `reply_date`       | Date de la réponse                                                    |
| `can_reply`        | `true` si la réponse peut être publiée via API (Google uniquement)    |
| `has_reply`        | `true` si le champ `reply` n'est pas vide                             |
| `full_comment`     | Combine `positive_comment` + `negative_comment` pour Booking, sinon `content` |
| `connection_label` | Label de la connexion associée                                        |
| `reviewer_country` | Pays du reviewer (Booking, TripAdvisor)                               |
| `stay_date`        | Date de séjour (Booking)                                              |
| `room_type`        | Type de chambre (Booking)                                             |
| `traveler_type`    | Type de voyageur (Booking, TripAdvisor)                               |

**Pagination standard :**
- Utilisez `page` pour naviguer entre les pages
- `current_page` indique la page courante
- `last_page` indique le nombre total de pages
- `total` indique le nombre total d'avis

---

#### `GET /api/triggerflow/locations/{externalId}/stats`

Récupère les statistiques détaillées d'un établissement.

**Query parameters :**

| Param            | Type    | Description                                                 |
|------------------|---------|-------------------------------------------------------------|
| `include_group`  | boolean | Si `true`, inclut les stats agrégées de tous les établissements |

**Response (200) :**
```json
{
  "stats": {
    "total_reviews": 156,
    "average_rating": 4.12,
    "rating_distribution": {
      "1": 5,
      "2": 10,
      "3": 15,
      "4": 48,
      "5": 78
    },
    "reviews_with_reply": 120,
    "reviews_without_reply": 36,
    "reply_rate": 76.92,
    "recent_reviews_count": 23,
    "pending_count": 36,
    "replied_count": 120,
    "positive_count": 98,
    "negative_count": 15
  },
  "by_platform": [
    {
      "platform": "google",
      "total": 85,
      "avg_rating": 4.3
    },
    {
      "platform": "booking",
      "total": 71,
      "avg_rating": 3.9,
      "avg_original_rating": 7.8
    }
  ]
}
```

**Avec `include_group=true` :**
```json
{
  "stats": { "..." },
  "by_platform": [ "..." ],
  "by_facility": [
    {
      "location_id": 1,
      "name": "Hotel A",
      "total_reviews": 80,
      "avg_rating": 4.2,
      "reply_rate": 85.0
    },
    {
      "location_id": 2,
      "name": "Hotel B",
      "total_reviews": 76,
      "avg_rating": 3.9,
      "reply_rate": 70.0
    }
  ]
}
```

**Notes :**
- `rating_distribution` : répartition des notes normalisées (1-5)
- `reply_rate` : pourcentage d'avis avec une réponse propriétaire
- `recent_reviews_count` : nombre d'avis des 30 derniers jours
- `positive_count` : avis avec normalized_rating >= 4
- `negative_count` : avis avec normalized_rating <= 2
- `avg_original_rating` : uniquement pour Booking (échelle 1-10 originale)
- `by_facility` : uniquement si `include_group=true` et l'utilisateur a plus d'un établissement

---

#### `PATCH /api/triggerflow/reviews/{reviewId}`

Met à jour le statut d'un avis.

**Request :**
```json
{
  "status": "replied"
}
```

| Champ    | Type   | Requis | Valeurs                           |
|----------|--------|--------|-----------------------------------|
| `status` | string | Oui    | `pending`, `replied`, `ignored`   |

**Response (200) :**
```json
{
  "message": "Review updated successfully",
  "review": { "..." }
}
```

---

#### `POST /api/triggerflow/reviews/{reviewId}/reply`

Publie une réponse sur Google Business Profile. **Uniquement pour les avis Google avec `can_reply: true`**.

**Request :**
```json
{
  "comment": "Merci Marie pour votre retour ! Nous sommes ravis que le séjour vous ait plu."
}
```

| Champ     | Type   | Requis | Description                    |
|-----------|--------|--------|--------------------------------|
| `comment` | string | Oui    | Texte de la réponse (max 4096) |

**Response (200) :**
```json
{
  "message": "Reply posted successfully",
  "review": { "..." }
}
```

**Erreurs possibles :**

| Code | Message | Cause |
|------|---------|-------|
| 404  | Review not found | L'avis n'existe pas ou n'appartient pas à l'utilisateur |
| 422  | Reply posting is only supported for Google reviews | L'avis n'est pas Google |
| 422  | This review cannot receive replies via API | `can_reply` est `false` |
| 500  | Failed to post reply | Erreur API Google |

---

### 3.3 Connexions (Review Connections)

Les connexions lient un établissement à une plateforme d'avis. Deux types :

| Type  | Plateformes                          | Fonctionnement                          |
|-------|--------------------------------------|-----------------------------------------|
| OAuth | Google                               | Token OAuth = lecture + réponse auto    |
| URL   | TripAdvisor, Booking, Airbnb         | URL de la page = scraping via Apify     |

#### `GET /api/triggerflow/locations/{externalId}/connections`

Liste les connexions d'un établissement.

**Response (200) :**
```json
{
  "connections": [
    {
      "id": 3,
      "platform": "google",
      "is_active": true,
      "platform_url": null,
      "platform_name": "Google Business",
      "label": "Profil principal",
      "last_synced_at": "2026-02-12T08:00:00Z",
      "sync_error": null,
      "apify_enabled": false,
      "has_oauth": true,
      "is_sync_locked": false,
      "sync_locked_until": null,
      "reviews_count": 85
    }
  ]
}
```

---

#### `POST /api/triggerflow/locations/{externalId}/connections`

Crée ou met à jour une connexion. L'upsert se fait sur la paire `(location_id, platform)`.

**Request :**
```json
{
  "platform": "tripadvisor",
  "platform_url": "https://www.tripadvisor.fr/Hotel_Review-g123-d456.html",
  "platform_name": "TripAdvisor",
  "label": "Page TripAdvisor principale",
  "is_active": true
}
```

| Champ           | Type    | Requis | Valeurs                                        |
|-----------------|---------|--------|------------------------------------------------|
| `platform`      | string  | Oui    | `google`, `booking`, `tripadvisor`, `airbnb`   |
| `platform_url`  | url     | Non    | URL de la page de l'établissement              |
| `platform_name` | string  | Non    | Nom affiché pour la connexion                  |
| `label`         | string  | Non    | Label personnalisé                             |
| `is_active`     | boolean | Non    | Activer/désactiver (défaut: true)              |

**Response (200) :**
```json
{
  "message": "Connection saved successfully",
  "connection": { "..." }
}
```

---

#### `GET /api/triggerflow/locations/{externalId}/connections/{connectionId}`

Détail d'une connexion avec métriques.

**Response (200) :**
```json
{
  "connection": {
    "id": 3,
    "platform": "google",
    "is_active": true,
    "platform_url": null,
    "platform_name": "Google Business",
    "label": "Profil principal",
    "last_synced_at": "2026-02-12T08:00:00Z",
    "sync_error": null,
    "apify_enabled": false,
    "has_oauth": true,
    "is_sync_locked": false,
    "sync_locked_until": null,
    "reviews_count": 85,
    "average_rating": 4.3,
    "is_configured": true,
    "needs_reconnect": false
  }
}
```

| Champ             | Description                                              |
|-------------------|----------------------------------------------------------|
| `average_rating`  | Note moyenne normalisée des avis de cette connexion      |
| `is_configured`   | `true` si une URL ou un token OAuth valide est configuré |
| `needs_reconnect` | `true` si Google OAuth token est expiré                  |

---

#### `PATCH /api/triggerflow/locations/{externalId}/connections/{connectionId}`

Modifie une connexion.

**Request :**
```json
{
  "is_active": false,
  "label": "Nouveau label",
  "platform_url": "https://..."
}
```

| Champ          | Type    | Requis | Description                    |
|----------------|---------|--------|--------------------------------|
| `is_active`    | boolean | Non    | Activer/désactiver             |
| `label`        | string  | Non    | Label personnalisé             |
| `platform_url` | url     | Non    | URL de la page                 |

**Response (200) :**
```json
{
  "message": "Connection updated successfully",
  "connection": { "..." }
}
```

---

#### `DELETE /api/triggerflow/locations/{externalId}/connections/{connectionId}`

Supprime une connexion.

**Response (200) :**
```json
{
  "message": "Connection deleted successfully"
}
```

---

#### `POST /api/triggerflow/locations/{externalId}/connections/{connectionId}/sync`

Déclenche la synchronisation d'une connexion spécifique.

**Response (200) :**
```json
{
  "message": "Sync started",
  "connection_id": 3
}
```

**Response (409) — Sync déjà en cours :**
```json
{
  "message": "Sync is already in progress",
  "sync_locked_until": "2026-02-12T10:15:00Z"
}
```

**Notes :**
- Un sync lock de **15 minutes** empêche les appels simultanés
- La connexion doit être active (`is_active: true`)
- Pour Google : nécessite un token OAuth valide
- Pour TripAdvisor/Booking/Airbnb : nécessite `apify_enabled: true`

---

#### `POST /api/triggerflow/locations/{externalId}/sync-all`

Déclenche la synchronisation de toutes les connexions actives d'un établissement.

**Response (200) :**
```json
{
  "message": "Sync initiated",
  "results": [
    { "connection_id": 3, "platform": "google", "status": "started" },
    { "connection_id": 7, "platform": "tripadvisor", "status": "started" },
    { "connection_id": 8, "platform": "booking", "status": "skipped", "reason": "Sync already in progress" }
  ]
}
```

---

### 3.4 Alertes

#### `GET /api/triggerflow/locations/{externalId}/alerts`

Lit la configuration des alertes pour un établissement.

**Response (200) :**
```json
{
  "alerts": {
    "alerts_enabled": true,
    "alert_email": "manager@hotel.com",
    "alert_slack_webhook": "***configured***",
    "alert_negative_threshold": 3,
    "alert_negative_window_days": 7,
    "alert_sentiment_threshold": 0.3,
    "alert_on_1_star": true,
    "alert_on_2_star": true,
    "alert_on_negative_trend": false,
    "alert_on_theme_spike": false,
    "alert_recap_frequency": "weekly",
    "alert_recap_emails": "manager@hotel.com;director@hotel.com"
  }
}
```

---

#### `PUT /api/triggerflow/locations/{externalId}/alerts`

Modifie la configuration des alertes.

**Request :**
```json
{
  "alerts_enabled": true,
  "alert_email": "manager@hotel.com",
  "alert_on_1_star": true,
  "alert_on_2_star": true,
  "alert_recap_frequency": "weekly",
  "alert_recap_emails": "manager@hotel.com;director@hotel.com"
}
```

| Champ                        | Type    | Description                                                    |
|------------------------------|---------|----------------------------------------------------------------|
| `alerts_enabled`             | boolean | Activer/désactiver les alertes                                 |
| `alert_email`                | email   | Email pour les alertes instantanées                            |
| `alert_slack_webhook`        | url     | Webhook Slack pour les alertes                                 |
| `alert_negative_threshold`   | int     | Nombre d'avis négatifs avant alerte (1-10)                     |
| `alert_negative_window_days` | int     | Fenêtre en jours pour le seuil (1-90)                          |
| `alert_sentiment_threshold`  | float   | Seuil de sentiment (0-1)                                       |
| `alert_on_1_star`            | boolean | Alerte instantanée sur chaque avis 1 étoile                   |
| `alert_on_2_star`            | boolean | Alerte instantanée sur chaque avis 2 étoiles                  |
| `alert_on_negative_trend`    | boolean | Alerte sur tendance négative                                   |
| `alert_on_theme_spike`       | boolean | Alerte sur pic thématique                                      |
| `alert_recap_frequency`      | string  | Fréquence du récap : `none`, `daily`, `weekly`, `monthly`     |
| `alert_recap_emails`         | string  | Emails pour le récap (séparés par `;`)                         |

**Response (200) :**
```json
{
  "message": "Alert settings updated successfully"
}
```

---

### 3.5 Génération de réponses IA

#### `POST /api/triggerflow/replies/generate`

Génère une réponse IA pour un avis client. **Quota illimité** pour les utilisateurs TriggerFlow.

**Request :**
```json
{
  "review_content": "Excellent séjour, personnel très accueillant !",
  "review_rating": 5,
  "review_author": "Marie D.",
  "platform": "google",
  "tone": "friendly",
  "language": "fr",
  "external_location_id": "facility-123"
}
```

| Champ                  | Type   | Requis | Description                                      |
|------------------------|--------|--------|--------------------------------------------------|
| `review_content`       | string | Oui    | Contenu de l'avis (max 5000 caractères)          |
| `review_rating`        | int    | Oui    | Note de l'avis (1-5)                             |
| `review_author`        | string | Non    | Nom de l'auteur (défaut: "Customer")             |
| `platform`             | string | Oui    | Plateforme d'origine                             |
| `tone`                 | string | Non    | `professional`, `warm`, `casual`, `luxury`, `dynamic` |
| `language`             | string | Non    | Langue (ISO) ou `auto` pour détection            |
| `external_location_id` | string | Non    | ID externe de l'établissement pour le contexte   |

**Response (200) :**
```json
{
  "reply": "Merci beaucoup Marie pour votre retour chaleureux ! ...",
  "tone": "friendly",
  "language": "fr",
  "tokens_used": 127
}
```

---

#### `POST /api/triggerflow/replies/bulk-generate`

Génère des réponses IA en masse pour plusieurs avis. Maximum **50 avis** par requête.

**Request :**
```json
{
  "review_ids": [1, 2, 3, 4, 5],
  "tone": "friendly",
  "language": "auto",
  "custom_prompt": "Mentionner notre nouvelle terrasse"
}
```

| Champ           | Type   | Requis | Description                                     |
|-----------------|--------|--------|-------------------------------------------------|
| `review_ids`    | int[]  | Oui    | IDs des reviews (1-50)                          |
| `tone`          | string | Non    | Ton pour toutes les réponses                    |
| `language`      | string | Non    | Langue pour toutes les réponses (ou `auto`)     |
| `custom_prompt` | string | Non    | Instructions supplémentaires (max 500 car.)     |

**Response (200) :**
```json
{
  "results": [
    {
      "review_id": 1,
      "success": true,
      "reply": "Merci pour votre avis...",
      "error": null
    },
    {
      "review_id": 2,
      "success": false,
      "reply": null,
      "error": "Review not found or not accessible"
    }
  ],
  "total_requested": 5,
  "total_generated": 4,
  "total_failed": 1
}
```

**Notes :**
- Chaque review doit appartenir à une location de l'utilisateur
- Les erreurs individuelles n'interrompent pas le traitement des autres avis
- `custom_prompt` permet d'ajouter du contexte supplémentaire (ex: promotion en cours)

---

### 3.6 Group / Multi-Facility

#### `GET /api/triggerflow/facilities/children`

Liste tous les établissements TriggerFlow de l'utilisateur.

**Response (200) :**
```json
{
  "facilities": [
    {
      "id": 1,
      "external_id": "facility-100",
      "name": "Hotel Le Marais",
      "address": "15 Rue du Temple, Paris",
      "reviews_count": 85
    },
    {
      "id": 2,
      "external_id": "facility-200",
      "name": "Hotel Bastille",
      "address": "42 Rue de la Roquette, Paris",
      "reviews_count": 71
    }
  ]
}
```

---

#### `GET /api/triggerflow/facilities/group-platforms`

Retourne les plateformes actives agrégées sur tous les établissements.

**Response (200) :**
```json
{
  "platforms": [
    { "platform": "google", "connection_count": 3 },
    { "platform": "booking", "connection_count": 2 },
    { "platform": "tripadvisor", "connection_count": 3 }
  ]
}
```

---

### 3.7 Google OAuth (connexion Google Business)

Pour connecter un compte Google Business Profile et permettre la synchronisation
automatique des avis Google + la publication des réponses via l'API Google.

#### `GET /api/triggerflow/google/auth-url`

Obtient l'URL d'autorisation Google OAuth.

**Query parameters :**

| Param                  | Type   | Requis | Description                              |
|------------------------|--------|--------|------------------------------------------|
| `external_location_id` | string | Oui    | ID externe de l'établissement TriggerFlow |
| `redirect_uri`         | url    | Non    | URL de retour après autorisation Google   |

**Response (200) :**
```json
{
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

**Flux OAuth :**
1. TriggerFlow appelle `GET /api/triggerflow/google/auth-url?external_location_id=facility-123`
2. TriggerFlow redirige l'utilisateur vers `auth_url`
3. L'utilisateur autorise l'accès à son compte Google Business
4. Google redirige vers le `redirect_uri` avec `?code=xxx&state=xxx`
5. TriggerFlow appelle `POST /api/triggerflow/google/callback` avec le code et le state

---

#### `POST /api/triggerflow/google/callback`

Échange le code d'autorisation Google contre des tokens d'accès.

**Request :**
```json
{
  "code": "4/0AY0e-g7xxx...",
  "state": "eyJsb2NhdGlvbl9pZCI6MX0=",
  "redirect_uri": "https://app.triggerflow.com/oauth/google/callback"
}
```

| Champ          | Type   | Requis | Description                              |
|----------------|--------|--------|------------------------------------------|
| `code`         | string | Oui    | Code d'autorisation Google               |
| `state`        | string | Oui    | State parameter retourné par Google      |
| `redirect_uri` | url    | Non    | Doit correspondre à celui utilisé pour l'auth URL |

**Response (200) :**
```json
{
  "message": "Google account connected successfully",
  "connection_id": 3
}
```

---

## 4. Codes d'erreur communs

| Code | Signification                                              |
|------|------------------------------------------------------------|
| 200  | Succès                                                     |
| 401  | Token invalide ou manquant                                 |
| 404  | Établissement/avis/connexion non trouvé(e)                 |
| 409  | Conflit (sync déjà en cours)                               |
| 422  | Erreur de validation (champs manquants/invalides)          |
| 500  | Erreur serveur (ex: API Google indisponible)               |
| 503  | Integration TriggerFlow non configurée côté ReplyStack     |

### Format des erreurs de validation (422)

```json
{
  "message": "Validation failed",
  "errors": {
    "external_id": ["The external id field is required."],
    "name": ["The name field is required."]
  }
}
```

---

## 5. Synchronisation des avis

### Google Business Profile (OAuth)
- Synchronisation automatique toutes les heures via un job planifié
- Les avis sont récupérés via l'API Google My Business
- Les réponses peuvent être publiées directement sur Google (`POST /reviews/{id}/reply`)
- Chaque avis Google a `can_reply: true` et un `google_review_id` pour le reply posting

### TripAdvisor, Booking, Airbnb (Apify)
- Scraping premium toutes les 6 heures via Apify
- Doit être activé par un super-admin ReplyStack
- L'URL de la plateforme doit être fournie dans la connexion (`platform_url`)

### Normalisation des notes

Les notes sont normalisées sur une échelle 1-5 dans le champ `normalized_rating` :

| Plateforme   | Échelle originale | Formule de normalisation        |
|-------------|-------------------|---------------------------------|
| Google      | 1-5               | Identique                       |
| TripAdvisor | 1-5 ou 1-50       | Division par 10 si > 5          |
| Booking     | 1-10              | Division par 2, arrondi         |
| Airbnb      | 1-5               | Identique                       |

Le champ `rating` conserve toujours la note originale.

### Données enrichies par plateforme

| Champ              | Google | TripAdvisor | Booking | Airbnb |
|--------------------|--------|-------------|---------|--------|
| `title`            |        | ✓           | ✓       |        |
| `positive_comment` |        |             | ✓       |        |
| `negative_comment` |        |             | ✓       |        |
| `reviewer_country` |        | ✓           | ✓       | ✓      |
| `stay_date`        |        | ✓           | ✓       |        |
| `room_type`        |        |             | ✓       |        |
| `traveler_type`    |        | ✓           | ✓       |        |
| `reply`            | ✓      | ✓           | ✓       | ✓      |
| `can_reply`        | ✓      |             |         |        |

### Flux de synchronisation

```
1. TriggerFlow sync une location  → POST /locations/sync
2. TriggerFlow crée une connexion → POST /locations/{id}/connections
3. (Si Google) Initier OAuth      → GET /google/auth-url + POST /google/callback
4. (Si Apify) Super-admin active  → apify_enabled = true
5. Sync manuel (optionnel)        → POST /locations/{id}/connections/{id}/sync
6. Les avis arrivent              → GET /locations/{id}/reviews
7. Générer des réponses IA        → POST /replies/generate (ou /bulk-generate)
8. (Si Google) Publier la réponse → POST /reviews/{id}/reply
9. Consulter les stats            → GET /locations/{id}/stats
```

---

## 6. Exemple complet d'intégration (cURL)

### Étape 1 : Sync d'un établissement

```bash
curl -X POST https://api.reply-stack.app/api/triggerflow/locations/sync \
  -H "Authorization: Bearer {TF_USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "external_id": "hotel-001",
    "name": "Hotel Le Marais",
    "address": "15 Rue du Temple, Paris",
    "default_tone": "friendly",
    "default_language": "fr"
  }'
```

### Étape 2 : Créer une connexion TripAdvisor

```bash
curl -X POST https://api.reply-stack.app/api/triggerflow/locations/hotel-001/connections \
  -H "Authorization: Bearer {TF_USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "platform": "tripadvisor",
    "platform_url": "https://www.tripadvisor.fr/Hotel_Review-g123-d456.html",
    "platform_name": "TripAdvisor",
    "label": "Page TripAdvisor"
  }'
```

### Étape 3 : Récupérer les avis (avec filtres)

```bash
curl -X GET "https://api.reply-stack.app/api/triggerflow/locations/hotel-001/reviews?platform=tripadvisor&status=pending&sort_by=rating&sort_order=asc&per_page=10" \
  -H "Authorization: Bearer {TF_USER_TOKEN}" \
  -H "Accept: application/json"
```

### Étape 4 : Générer une réponse IA

```bash
curl -X POST https://api.reply-stack.app/api/triggerflow/replies/generate \
  -H "Authorization: Bearer {TF_USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "review_content": "Service décevant, chambre pas propre.",
    "review_rating": 2,
    "review_author": "Jean P.",
    "platform": "tripadvisor",
    "tone": "professional",
    "language": "fr",
    "external_location_id": "hotel-001"
  }'
```

### Étape 5 : Générer des réponses en masse

```bash
curl -X POST https://api.reply-stack.app/api/triggerflow/replies/bulk-generate \
  -H "Authorization: Bearer {TF_USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "review_ids": [1, 2, 3, 4, 5],
    "tone": "friendly",
    "language": "auto",
    "custom_prompt": "Mentionner notre nouvelle terrasse"
  }'
```

### Étape 6 : Publier une réponse sur Google

```bash
curl -X POST https://api.reply-stack.app/api/triggerflow/reviews/42/reply \
  -H "Authorization: Bearer {TF_USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "comment": "Merci pour votre avis ! Nous prenons note de vos remarques."
  }'
```

### Étape 7 : Consulter les stats

```bash
curl -X GET "https://api.reply-stack.app/api/triggerflow/locations/hotel-001/stats?include_group=true" \
  -H "Authorization: Bearer {TF_USER_TOKEN}" \
  -H "Accept: application/json"
```

### Étape 8 : Configurer les alertes

```bash
curl -X PUT https://api.reply-stack.app/api/triggerflow/locations/hotel-001/alerts \
  -H "Authorization: Bearer {TF_USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "alerts_enabled": true,
    "alert_on_1_star": true,
    "alert_on_2_star": true,
    "alert_email": "manager@hotel.com",
    "alert_recap_frequency": "weekly",
    "alert_recap_emails": "manager@hotel.com;director@hotel.com"
  }'
```

---

## 7. Migration depuis TriggerFlow

### Correspondance des données

| TriggerFlow                  | ReplyStack                           |
|------------------------------|--------------------------------------|
| `facility.id`               | `location.external_facility_id`      |
| `facility.name`             | `location.name`                      |
| `facility.address`          | `location.address`                   |
| `Review.rating` (1-10 Booking) | `Review.rating` (original) + `Review.normalized_rating` (1-5) |
| `ReviewConnection`          | `ReviewConnection` (même structure)  |
| `Review.owner_reply`        | `Review.reply`                       |
| `Review.owner_reply_date`   | `Review.reply_date`                  |

### Association CRM

L'association avis → client CRM reste dans TriggerFlow. TriggerFlow maintient une table
de mapping locale :

```
triggerflow.review_customer_map
├── review_id_rs (int)       → ID du review dans ReplyStack
├── customer_id_tf (int)     → ID du client dans TriggerFlow CRM
└── created_at (timestamp)
```

Le frontend TriggerFlow utilise `review.id` retourné par l'API ReplyStack pour faire
la jointure avec son mapping CRM local.

---

## 8. Ce que TriggerFlow doit implémenter

### 8.1 Prérequis (MUST)

1. **Endpoint `GET /api/auth/user`** : Doit retourner les données utilisateur quand
   appelé avec un Bearer token valide. Format : `{ id, email, firstname, lastname }`.

### 8.2 Frontend TriggerFlow (SHOULD)

Pour offrir une expérience intégrée, TriggerFlow devrait implémenter :

1. **Page de gestion des avis par établissement**
   - Liste les avis via `GET /locations/{id}/reviews` avec pagination standard
   - Affiche les filtres avancés (plateformes, statuts, notes, recherche texte, dates)
   - Bouton "Générer une réponse" sur chaque avis pending
   - Bouton "Générer en masse" pour sélection multiple → `POST /replies/bulk-generate`
   - Pour les avis Google avec `can_reply: true` : bouton "Publier" → `POST /reviews/{id}/reply`

2. **Configuration des connexions par établissement**
   - CRUD complet des connexions (`GET/POST/PATCH/DELETE /locations/{id}/connections/{id}`)
   - Pour Google : bouton "Connecter Google" → flux OAuth
   - Pour TripAdvisor/Booking/Airbnb : champ URL de la page
   - Affichage du sync lock status et bouton "Synchroniser maintenant"

3. **Dashboard stats**
   - Stats détaillées via `GET /locations/{id}/stats`
   - Distribution des notes, taux de réponse, tendances
   - Vue multi-établissement via `include_group=true`

4. **Configuration des alertes**
   - Interface de gestion des alertes via `GET/PUT /locations/{id}/alerts`
   - Configuration du récap hebdomadaire/mensuel

5. **Vue multi-établissement**
   - Liste des établissements via `GET /facilities/children`
   - Plateformes agrégées via `GET /facilities/group-platforms`

6. **Synchronisation automatique des établissements**
   - À la création/modification d'un établissement TriggerFlow : `POST /locations/sync`
   - À la suppression : `DELETE /locations/{externalId}`

---

## 9. Epic BMAD : Intégration ReplyStack (côté TriggerFlow)

### Epic : Intégration ReplyStack v2 - Gestion complète des avis

**Objectif :** Migrer la gestion des avis TriggerFlow vers l'API ReplyStack v2 (24 endpoints).

---

#### STORY-TF-001 : Endpoint d'authentification SSO (MUST - 2 points)

**En tant que** système ReplyStack,
**je veux** pouvoir valider les tokens TriggerFlow,
**afin de** authentifier les utilisateurs TriggerFlow sans double inscription.

**Critères d'acceptation :**
- AC-001: `GET /api/auth/user` retourne `{ id, email, firstname, lastname }` avec un Bearer token valide
- AC-002: `GET /api/auth/user` retourne 401 avec un token invalide ou expiré
- AC-003: L'endpoint est performant (< 100ms)

---

#### STORY-TF-002 : Service client ReplyStack API v2 (MUST - 5 points)

**En tant que** développeur TriggerFlow,
**je veux** un service client pour les 24 endpoints ReplyStack v2,
**afin de** centraliser les appels API.

**Critères d'acceptation :**
- AC-001: Service client avec méthodes pour chaque endpoint (locations, reviews, connections, alerts, replies, facilities)
- AC-002: Gestion automatique du Bearer token
- AC-003: Gestion des erreurs (401, 404, 409, 422) avec messages appropriés
- AC-004: Retry automatique sur erreurs réseau (timeout, 5xx)

---

#### STORY-TF-003 : Sync établissements (MUST - 3 points)

- À la création/modification d'un établissement : `POST /locations/sync`
- À la suppression : `DELETE /locations/{externalId}`

---

#### STORY-TF-004 : Page gestion des avis v2 (MUST - 8 points)

- Pagination standard (page/per_page au lieu de cursor)
- Filtres avancés : plateformes multiples, notes, has_reply, recherche texte
- Tri configurable (date, note)
- Affichage des champs enrichis (normalized_rating, full_comment, reply, can_reply)
- Bouton "Publier sur Google" pour les avis éligibles

---

#### STORY-TF-005 : Connexions CRUD + Sync (MUST - 5 points)

- CRUD complet : list, create, show, update, delete
- Sync individuel et sync-all
- Affichage sync lock status

---

#### STORY-TF-006 : Génération en masse (SHOULD - 5 points)

- Interface de sélection multiple d'avis
- Appel `POST /replies/bulk-generate` avec review_ids
- Affichage des résultats par avis (succès/échec)
- Support du custom_prompt

---

#### STORY-TF-007 : Publication Google reply (SHOULD - 3 points)

- Bouton "Publier" sur les avis Google avec `can_reply: true`
- Appel `POST /reviews/{id}/reply`
- Gestion des erreurs Google API

---

#### STORY-TF-008 : Dashboard stats v2 (SHOULD - 3 points)

- Rating distribution (graphique en barres)
- Taux de réponse
- Vue multi-établissement (by_facility)
- Booking : affichage note originale (1-10)

---

#### STORY-TF-009 : Alertes et récaps (COULD - 3 points)

- Interface de configuration des alertes
- Configuration du récap (fréquence, emails)

---

#### STORY-TF-010 : Table de mapping CRM (MUST - 2 points)

- Créer table `review_customer_map` (review_id_rs, customer_id_tf)
- Associer les avis ReplyStack aux clients TriggerFlow CRM
- Interface d'association dans la page avis

---

#### STORY-TF-011 : Tests et validation (MUST - 3 points)

- Tests unitaires du service client
- Tests d'intégration du flux complet
- Tests de gestion d'erreurs

---

### Résumé de l'epic

| Story        | Titre                          | Points | Priorité |
|-------------|--------------------------------|--------|----------|
| STORY-TF-001 | Endpoint authentification SSO  | 2      | MUST     |
| STORY-TF-002 | Service client API v2          | 5      | MUST     |
| STORY-TF-003 | Sync des établissements        | 3      | MUST     |
| STORY-TF-004 | Page gestion des avis v2       | 8      | MUST     |
| STORY-TF-005 | Connexions CRUD + Sync         | 5      | MUST     |
| STORY-TF-006 | Génération en masse            | 5      | SHOULD   |
| STORY-TF-007 | Publication Google reply       | 3      | SHOULD   |
| STORY-TF-008 | Dashboard stats v2             | 3      | SHOULD   |
| STORY-TF-009 | Alertes et récaps              | 3      | COULD    |
| STORY-TF-010 | Table de mapping CRM           | 2      | MUST     |
| STORY-TF-011 | Tests et validation            | 3      | MUST     |
| **Total**   |                                | **42** |          |

**Sprint recommandé :** 3 sprints de 2 semaines
- **Sprint 1 (MUST)** : TF-001 + TF-002 + TF-003 + TF-010 = 12 points
- **Sprint 2 (MUST)** : TF-004 + TF-005 + TF-011 = 16 points
- **Sprint 3 (SHOULD/COULD)** : TF-006 + TF-007 + TF-008 + TF-009 = 14 points

---

## 10. Variables d'environnement TriggerFlow

```env
# URL de base de l'API ReplyStack
REPLYSTACK_API_URL=https://api.reply-stack.app

# Redirect URI pour le flux OAuth Google (optionnel)
REPLYSTACK_GOOGLE_REDIRECT_URI=https://app.triggerflow.com/oauth/google/callback
```

---

## 11. Contact et support

- **API ReplyStack** : https://api.reply-stack.app
- **Documentation API** : ce fichier
- **Super-admin** : Pour activer Apify sur les connexions, contacter l'équipe ReplyStack
