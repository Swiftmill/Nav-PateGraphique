# Pâte Graphique

Pâte Graphique est un navigateur Electron ultra-personnalisable, pensé pour offrir une expérience comparable aux cadors modernes (Opera GX, Brave, Vivaldi) tout en laissant la main sur chaque pixel de l’interface.

## Pourquoi Electron + Vite + React ?

* **Chromium natif** : Electron embarque Chromium et permet donc un support immédiat des extensions Chrome Web Store et de toutes les API Web récentes.
* **Écosystème** : Vite + React offrent une productivité maximale pour créer une interface totalement modulable. Le hot-reload accélère le développement des thèmes et mods.
* **Interopérabilité** : Electron facilite l’intégration de services bas niveau (gestionnaire de mots de passe via Keytar, adblock natif, proxy VPN, etc.) sans sacrifier la compatibilité multiplateforme.

## Prérequis

* Node.js 18+
* npm 9+
* Windows 10/11 64 bits (pour générer l’exécutable `.exe`).
* Pour macOS / Linux : disposer des toolchains système classiques (Xcode CLT / build-essential).

## Installation

```bash
npm install
```

## Lancer en mode développement

```bash
npm run dev
```

* L’interface renderer est servie via Vite (`http://localhost:5173`).
* Le process principal Electron est lancé en parallèle avec hot reload TypeScript.

## Construire les bundles

### Builder le renderer et le main process

```bash
npm run build
```

### Générer l’exécutable Windows (portable + NSIS)

```bash
npm run package
```

Le binaire principal est produit dans `dist/` sous le nom `Pâte Graphique-<version>-x64.exe`.

### Générer pour toutes les plateformes (AppImage, deb, macOS dmg/pkg)

```bash
npm run package:all
```

> ⚠️ Les builds macOS nécessitent un environnement macOS (codesign / notarisation). Les builds Linux requièrent les paquets `rpm` ou `dpkg` selon la cible.

## Structure du projet

```
.
├── config/                # Configuration globale (config.json)
├── dist/                  # Sorties de build (générées)
├── electron-builder.yml   # Configuration packaging multi-plateformes
├── mods/                  # Mods embarqués par défaut (ex: sample)
├── src/
│   ├── common/            # Types et helpers partagés
│   ├── main/              # Process principal Electron (services, IPC, gestion onglets)
│   ├── preload/           # Ponts sécurisés entre main et renderer
│   └── renderer/          # Interface React + Vite
├── themes/                # Thèmes CSS (defaut + custom)
├── user-scripts/          # Scripts/Styles utilisateurs injectés dans les pages
└── vpn/                   # Emplacement pour profils VPN additionnels
```

## Fonctionnalités majeures

### Gestion d’onglets avancée
* Onglets illimités, drag & drop, fermeture rapide.
* Détachement d’onglet en nouvelle fenêtre.
* Mode split-screen avec répartition gauche/droite (bouton `⧉` dans la barre d’onglets), retour au plein écran avec `⇱`.
* Groupes et sessions : sauvegarde/restauration automatique (Electron Store).

### Personnalisation totale
* **Thèmes** : CSS injecté dynamiquement (`themes/<nom>/theme.css`). Appliquer via la sidebar ou `config.json`.
* **Mods** : déposer un dossier `mods/<mon-mod>/` avec `index.html`, `style.css`, `script.js`. Recharge via la sidebar.
* **User scripts** : déposer `.js`/`.css` dans `user-scripts/`, recharger avec `window.pateGraphique.userScripts.reload()`.
* **Config JSON** : activer/désactiver chaque module, définir les serveurs VPN, moteurs de recherche, limites de performance, etc.

### Vie privée & sécurité
* Bloqueur de pubs et trackers (`@cliqz/adblocker-electron` + EasyList/EasyPrivacy/Fanboy).
* Gestionnaire de mots de passe chiffré via Keytar et master password (activable dans `config.json`).
* Extensions Chrome (`.crx`) installables.
* Mode Gaming / Focus : limitation CPU/RAM, suspension d’onglets, stats temps réel.

### Interface et productivité
* Sidebar customisable : notes, téléchargements, sessions, VPN, thèmes, mods, mots de passe.
* Page nouvel onglet animée + widgets (RSS, stats système).
* Lecteur PiP (Picture-in-Picture) accessible via l’API `browserViewAPI`.
* Gestionnaire de téléchargements intégré.

## Personnaliser l’UI

### Créer un thème
1. Dupliquer `themes/default/` -> `themes/mon-theme/`.
2. Modifier `theme.css` (variables CSS + styles globaux).
3. Mettre à jour `config/config.json` → `"activeTheme": "mon-theme"`.
4. Depuis l’interface : Sidebar → Thèmes → saisir le nom → **Appliquer**.

### Ajouter un mod
1. Créer `mods/mon-mod/index.html`, `style.css`, `script.js`.
2. Dans l’interface : Sidebar → Mods → **Recharger les mods**.
3. Les mods sont injectés dans la page renderer et peuvent remplacer des zones via DOM.

### Scripts utilisateurs
1. Déposer vos scripts `.js` et styles `.css` dans `user-scripts/`.
2. `window.pateGraphique.userScripts.reload()` (console devtools) ou relancer l’app.
3. Les scripts sont injectés dans chaque `BrowserView` dès son initialisation.

## Configurer le VPN / Proxy

`config/config.json` → section `vpn` :

```json
"vpn": {
  "enabled": true,
  "autoConnect": false,
  "servers": [
    { "name": "Paris - FR", "host": "fr.example.net", "port": 1080, "type": "socks5" },
    { "name": "Tokyo - JP", "host": "jp.example.net", "port": 1080, "type": "socks5", "username": "user", "password": "pass" }
  ]
}
```

Les serveurs sont accessibles via la sidebar (module VPN). L’IPC configure le proxy Electron (`session.setProxy`).

## Activer/désactiver les modules

`config/config.json` expose toutes les options :

* `privacy.adBlocker`, `privacy.trackerBlocker`
* `mods.enabled`, `mods.autoReload`
* `themes.activeTheme`
* `performance.gamingMode` / `focusMode`
* `extensions.allowChromeExtensions`

Modifier puis relancer l’application (ou utiliser les panneaux de configuration intégrés lorsqu’ils existent).

## Sessions & sauvegardes

* Les onglets ouverts sont sauvegardés automatiquement dans `electron-store`.
* `SessionManager` (sidebar) permet une sauvegarde manuelle immédiate.

## Gestion des mots de passe

* Activez le master password via `config.security.masterPasswordPrompt`.
* Le coffre utilise Keytar et stocke dans le gestionnaire sécurisé du système.
* UI dédiée dans la sidebar → "PASSWORDS".

## Extensions Chrome (.crx)

1. Téléchargez le `.crx` depuis le Chrome Web Store.
2. Menu : glisser-déposer le fichier dans l’application ou utilisez une commande personnalisée `window.pateGraphique.extensions.install('C:/path/extension.crx')`.

## Scripts & commandes utiles

* `npm run lint` : lint TypeScript/React.
* `npm run package` : build + package Windows.
* `npm run package:all` : build + package multi plateformes.

## MacOS / Linux

* **macOS** : exécuter `npm run package:all` sur une machine macOS. L’icône et le bundle sont configurés via `electron-builder.yml`.
* **Linux** : la commande génère AppImage et `.deb`. Installer `libx11-dev`, `libxkbfile-dev`, `libsecret-1-dev` pour Keytar.

## Aller plus loin

* Ajoutez vos propres panneaux à la sidebar en créant un mod React.
* Pilotez l’app via IPC personnalisé : ajoutez des canaux dans `src/preload/index.ts` + handlers dans `src/main/main.ts`.
* Contribuez à l’optimisation (limitation de processus Chromium, réglages GPU) via `config/general`.

Bon hacking avec **Pâte Graphique** !
