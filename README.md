# Grist AI Assistant Widget

A Grist widget that uses AI to automatically create tables, columns, Python formulas, and insert data.

## Features

- 🤖 **Conversational AI Assistant** : Describe in natural language what you want to create
- 📊 **Automatic Table Creation** : Generates tables with appropriate columns
- 🧮 **Smart Python Formulas** : Claude generates Grist/Python formulas
- 📝 **Data Insertion** : Can insert sample data
- ⚡ **One-Click Execution** : Validate and execute all actions in Grist

## Installation

1. **Host the widget** :
   ```bash
   # On your server or Vercel/Netlify
   cp index.html /var/www/html/grist-ai-assistant.html
   ```

2. **Add to Grist** :
   - Open your Grist document
   - `Add Widget` → `Custom` → `Enter URL`
   - Paste the hosted file URL

## Configuration

In the widget, configure the 4 following elements:

1. **Grist URL** : `https://grist.example.com`
2. **Grist API Key** : Settings → API Key → `gristapi...`
3. **Document ID** : Visible in the document URL
4. **Claude API Key** : `sk-ant-...` (anthropic.com)

## Usage

### Example Requests

**English:**
```
Create a Projects table with columns: name, budget, project_manager, status, and a profitability column that calculates (budget - cost) / budget * 100
```

```
Add a Customers table with name, email, phone, and insert 5 sample customers
```

```
Create a dashboard with monthly sales and total/average formulas
```

**French:**
```
Crée une table Projets avec colonnes: nom, budget, chef_projet, statut, et une colonne rentabilité qui calcule (budget - cout) / budget * 100
```

```
Ajoute une table Clients avec nom, email, téléphone, et insère 5 clients fictifs
```

```
Crée un tableau de bord avec ventes mensuelles et formules de totaux et moyennes
```

### Supported Column Types

- `Text` : Free text
- `Numeric` : Numbers
- `Bool` : Booleans (True/False)
- `Date` : Dates
- `Choice` : Dropdown lists
- `Any` : Flexible type

### Python Formulas

The widget generates Grist-compatible Python formulas:

```python
# Simple calculations
$budget * $quantity

# Conditions
IF($status == "paid", $amount, 0)

# Aggregations
$Items.SUM($amount)

# Dates
TODAY() - $creation_date

# Text
CONCAT($first_name, " ", $last_name)
```

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│     User        │───▶│  Widget JS   │───▶│  Claude API     │
│  (natural lang) │    │              │    │  (analysis)      │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Grist API      │
                       │  (execution)    │
                       └─────────────────┘
```

## Security

- API keys are stored locally in the browser
- No data is sent to third-party servers
- Direct communication with Grist and Claude APIs

## Development

The widget uses:
- Modern HTML5/CSS3
- Vanilla JavaScript (no dependencies)
- Grist REST API
- Claude API (Anthropic)

## License

Apache 2.0 - see LICENSE file

## Support

For any questions or improvements:
- GitHub : https://github.com/isaytoo/grist-ai-assistant-widget
- Email : admin@gristup.fr
