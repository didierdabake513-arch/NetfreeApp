# Netfree — React Native

## Prérequis

1. **Node.js** — https://nodejs.org (version LTS)
2. **JDK 17** — https://adoptium.net
3. **Android Studio** — pour l'émulateur Android
4. **VS Code** avec l'extension "React Native Tools"

## Installation

```bash
# 1. Installer les dépendances
cd netfree_rn
npm install

# 2. Lancer le backend FastAPI (dans un autre terminal)
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload

# 3. Lancer l'app Android
npx react-native run-android

# ou iOS (Mac uniquement)
npx react-native run-ios
```

## Structure

```
netfree_rn/
├── App.js                        Point d'entrée + navigation
└── src/
    ├── context/
    │   └── UserContext.js        État global (Mo, pubs, eSIM)
    ├── screens/
    │   ├── HomeScreen.js         Écran principal
    │   ├── OtherScreens.js       Stats, Pubs, Compte
    │   └── DeviceCheckScreen.js  Vérification compatibilité
    └── services/
        ├── LocalDatabase.js      SQLite sur le téléphone
        ├── ApiService.js         Communication backend
        └── DeviceCheckService.js Détection eSIM / Android version
```

## Prochaines étapes

1. **AdMob** — installer `react-native-google-mobile-ads`
   ```bash
   npm install react-native-google-mobile-ads
   ```
   Remplacer le `Alert.alert` simulé dans HomeScreen.js par un vrai `RewardedAd`

2. **Gigs eSIM API** — remplir `GIGS_API_KEY` dans `backend/.env`

3. **Vrai téléphone** — changer l'URL dans ApiService.js :
   ```js
   const BASE_URL = 'http://192.168.X.X:8000'; // IP locale de ton PC
   ```
