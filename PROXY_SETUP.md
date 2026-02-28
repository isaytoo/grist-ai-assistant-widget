# Déployer votre propre Proxy pour le Widget AI Assistant

Ce guide explique comment déployer votre propre proxy pour garder vos clés API privées.

## Pourquoi un proxy ?

Les APIs comme Claude (Anthropic) ne supportent pas CORS, ce qui empêche les appels directs depuis un navigateur. Le proxy fait le relais entre le widget et l'API.

## Option 1 : Déployer sur Vercel (gratuit)

### Étapes

1. **Forker le repo**
   ```bash
   git clone https://github.com/isaytoo/grist-ai-assistant-widget.git
   cd grist-ai-assistant-widget
   ```

2. **Créer un compte Vercel** (gratuit)
   - Aller sur https://vercel.com
   - Se connecter avec GitHub

3. **Déployer**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

4. **Configurer le widget**
   - Dans le widget, entrer votre URL Vercel dans "Proxy URL"
   - Exemple : `https://mon-proxy-ai.vercel.app`

### Structure des fichiers proxy

```
api/
├── ai.js      # Proxy pour les APIs AI (Claude, Groq, etc.)
└── grist.js   # Proxy pour l'API Grist
```

## Option 2 : Utiliser des providers CORS-compatibles (sans proxy)

Certains providers AI supportent CORS et peuvent être appelés directement :

| Provider | CORS | Gratuit | Notes |
|----------|------|---------|-------|
| **Groq** | ✅ Oui | ✅ Gratuit | Très rapide, modèles Llama/Mixtral |
| **Perplexity** | ✅ Oui | ❌ Payant | Recherche web intégrée |
| Claude | ❌ Non | ❌ Payant | Nécessite un proxy |
| OpenAI | ❌ Non | ❌ Payant | Nécessite un proxy |

**Recommandation** : Utilisez **Groq** si vous ne voulez pas de proxy. C'est gratuit et très performant.

## Sécurité

### Ce qui est protégé
- ✅ Transport HTTPS (chiffré en transit)
- ✅ Clés stockées localement dans votre navigateur (localStorage)
- ✅ Pas de logs des clés sur le proxy par défaut

### Responsabilités
- Si vous utilisez le proxy par défaut (grist-ai-assistant-widget.vercel.app), vos clés transitent par ce serveur
- Si vous déployez votre propre proxy, vous avez le contrôle total

## Support

Pour toute question : https://gristup.fr
