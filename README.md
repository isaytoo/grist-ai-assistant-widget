# Grist AI Assistant Widget

Un widget Grist qui utilise l'IA pour créer automatiquement des tables, colonnes, formules Python et insérer des données.

## Fonctionnalités

- 🤖 **Assistant IA conversationnel** : Décrivez en français ce que vous voulez créer
- 📊 **Création automatique de tables** : Génère des tables avec les colonnes appropriées
- 🧮 **Formules Python intelligentes** : Claude génère les formules Grist/Python
- 📝 **Insertion de données** : Peut insérer des données d'exemple
- ⚡ **Exécution en un clic** : Validez et exécutez toutes les actions dans Grist

## Installation

1. **Héberger le widget** :
   ```bash
   # Sur votre serveur ou Vercel/Netlify
   cp index.html /var/www/html/grist-ai-assistant.html
   ```

2. **Ajouter dans Grist** :
   - Ouvrir votre document Grist
   - `Add Widget` → `Custom` → `Enter URL`
   - Coller l'URL du fichier hébergé

## Configuration

Dans le widget, configurez les 4 éléments suivants :

1. **URL Grist** : `https://grist.example.com`
2. **Clé API Grist** : Settings → API Key → `gristapi...`
3. **ID Document** : Visible dans l'URL du document
4. **Clé API Claude** : `sk-ant-...` (anthropic.com)

## Utilisation

### Exemples de demandes

```
Crée une table Projets avec colonnes: nom, budget, chef_projet, statut, et une colonne rentabilité qui calcule (budget - cout) / budget * 100
```

```
Ajoute une table Clients avec nom, email, téléphone, et insère 5 clients fictifs
```

```
Crée un tableau de bord avec ventes mensuelles et formules de totaux et moyennes
```

### Types de colonnes supportés

- `Text` : Texte libre
- `Numeric` : Nombres
- `Bool` : Booléens (Vrai/Faux)
- `Date` : Dates
- `Choice` : Listes déroulantes
- `Any` : Type flexible

### Formules Python

Le widget génère des formules Python compatibles Grist :

```python
# Calculs simples
$budget * $quantite

# Conditions
IF($statut == "payé", $montant, 0)

# Agrégations
$Items.SUM($montant)

# Dates
TODAY() - $date_creation

# Texte
CONCAT($prenom, " ", $nom)
```

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Utilisateur   │───▶│  Widget JS   │───▶│  Claude API     │
│   (français)    │    │              │    │  (analyse)      │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Grist API      │
                       │  (exécution)    │
                       └─────────────────┘
```

## Sécurité

- Les clés API sont stockées localement dans le navigateur
- Aucune donnée n'est envoyée à des serveurs tiers
- Communication directe avec les APIs Grist et Claude

## Développement

Le widget utilise :
- HTML5/CSS3 moderne
- JavaScript vanilla (pas de dépendances)
- API REST Grist
- API Claude (Anthropic)

## Licence

Apache 2.0 - voir fichier LICENSE

## Support

Pour toute question ou amélioration :
- GitHub : https://github.com/isaytoo/grist-ai-assistant-widget
- Email : admin@gristup.fr
