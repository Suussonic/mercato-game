import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      // Header
      appName: "Mercato Game",
      
      // Welcome Section
      welcomeTitle: "Bienvenue au Mercato Game",
      howToPlay: "Comment jouer :",
      viewRules: "Voir les règles",
      step1Title: "1. Créer ou rejoindre une room :",
      step1Content: "Créez une room publique ou privée (avec mot de passe) • Partagez le code de la room avec vos amis • Rejoignez une room existante avec son code",
      step2Title: "2. Configuration de la partie (Chef uniquement) :",
      step2Content: "Choisissez un thème (Dragon Ball, etc.) • Sélectionnez les arcs et personnages à inclure • Définissez le nombre de tours • Définissez combien de personnages chaque joueur peut avoir • Choisissez la durée de chaque tour • Fixez la mise de départ pour tous les joueurs",
      step3Title: "3. Déroulement du jeu :",
      step3Content: "À chaque tour, un personnage apparaît aléatoirement • Les joueurs placent leurs mises (sans dépasser leur solde) • Vous pouvez vous coucher à tout moment • Le joueur avec la mise la plus élevée remporte le personnage • Les personnages gagnés sont affichés sous votre nom",
      step4Title: "4. Fin de partie :",
      step4Content: "Après tous les tours ou si le chef termine la partie • Tous les joueurs votent pour désigner le vainqueur • Vous avez 60 secondes pour voter (ou dès que tout le monde a voté)",
      createOwnDataset: "Créer son propre Dataset",
      
      // Create Room
      createRoom: "Créer une Room",
      yourName: "Votre nom",
      enterYourName: "Entrez votre nom",
      privateRoom: "Room privée",
      password: "Mot de passe",
      createRoomButton: "Créer la Room",
      
      // Join Room
      joinRoom: "Rejoindre une Room",
      roomCode: "Code de la Room",
      enterCode: "Entrez le code (ex: 7HI3NX)",
      joinButton: "Rejoindre",
      
      // Waiting Room
      waitingRoom: "Salle d'Attente",
      shareCode: "Partagez ce code avec vos amis :",
      copyCode: "Copier le code",
      privateRoomTag: "Room Privée",
      needPassword: "Ils devront aussi entrer le mot de passe",
      players: "Joueurs",
      host: "Chef",
      configureGame: "Configurer la Partie",
      waitingForHost: "En attente que le chef démarre la configuration...",
      
      // Game Config
      gameConfig: "Configuration de la Partie",
      theme: "Thème",
      selectTheme: "Sélectionnez un thème",
      arcs: "Arcs (cocher un arc sélectionne automatiquement ses personnages)",
      characters: "Personnages (tous affichés, décochez pour exclure)",
      numberOfTurns: "Nombre de tours",
      charactersPerPlayer: "Personnages par joueur (max)",
      turnDuration: "Durée du tour (secondes)",
      startingBalance: "Mise de départ",
      startGame: "Démarrer la Partie",
      
      // Game Board
      turn: "Tour",
      currentBet: "Votre Mise",
      availableBalance: "Solde disponible",
      placeBet: "Placer la Mise",
      fold: "Se Coucher",
      folded: "Vous vous êtes couché pour ce tour",
      maxBet: "Mise maximale",
      currentBetTag: "Mise",
      foldedTag: "Couché",
      endGame: "Terminer la Partie",
      nextTurn: "Passer au Tour Suivant",
      
      // Voting
      results: "Résultats",
      votingPhase: "Phase de Vote",
      winner: "est le vainqueur !",
      votes: "votes",
      voteForWinner: "Votez pour le vainqueur",
      selectPlayer: "Sélectionnez le joueur que vous pensez mérite de gagner :",
      confirmVote: "Confirmer mon Vote",
      voted: "Vous avez voté ! En attente des autres joueurs...",
      leaderboard: "Classement",
      finalBalance: "Solde final",
      charactersCount: "personnages",
      
      // Common
      chef: "Chef",
      close: "Fermer",
      charactersLabel: "Personnages",
      enterBet: "Entrez votre mise",
      
      // Messages
      roomCreated: "Room créée avec le code:",
      errorCreatingRoom: "Erreur lors de la création de la room",
      roomNotFound: "Room introuvable",
      invalidPassword: "Mot de passe invalide",
      gameAlreadyStarted: "La partie a déjà commencé",
      joinedRoom: "Vous avez rejoint la room !",
      errorJoining: "Erreur lors de la connexion",
      roomFoundPrivate: "Cette room est privée, entrez le mot de passe",
      roomFound: "Room trouvée ! Vous pouvez rejoindre.",
      codeCopied: "Code copié dans le presse-papier !",
      selectThemeError: "Veuillez sélectionner un thème",
      selectCharacterError: "Veuillez sélectionner au moins un personnage",
      enterValidBet: "Veuillez entrer une mise valide",
      betTooHigh: "Mise trop élevée",
      betPlaced: "placée",
      roomNotFoundDescription: "Cette room n'existe pas ou vous n'y êtes pas connecté",
      backToHome: "Retour à l'accueil",
      
      // Footer
      githubRepository: "Dépôt GitHub",
    }
  },
  en: {
    translation: {
      // Header
      appName: "Mercato Game",
      
      // Welcome Section
      welcomeTitle: "Welcome to Mercato Game",
      howToPlay: "How to play:",
      viewRules: "View rules",
      step1Title: "1. Create or join a room:",
      step1Content: "Create a public or private room (with password) • Share the room code with your friends • Join an existing room with its code",
      step2Title: "2. Game configuration (Host only):",
      step2Content: "Choose a theme (Dragon Ball, etc.) • Select arcs and characters to include • Set the number of turns • Set how many characters each player can have • Choose the duration of each turn • Set the starting balance for everyone",
      step3Title: "3. Gameplay:",
      step3Content: "Each turn, a character appears randomly • Players place their bets (without exceeding their balance) • You can fold at any time • The player with the highest bet wins the character • Won characters are displayed under your name",
      step4Title: "4. End of game:",
      step4Content: "After all turns or if the host ends the game • All players vote to designate the winner • You have 60 seconds to vote (or as soon as everyone has voted)",
      createOwnDataset: "Create your own dataset",
      
      // Create Room
      createRoom: "Create a Room",
      yourName: "Your name",
      enterYourName: "Enter your name",
      privateRoom: "Private room",
      password: "Password",
      createRoomButton: "Create Room",
      
      // Join Room
      joinRoom: "Join a Room",
      roomCode: "Room Code",
      enterCode: "Enter code (ex: 7HI3NX)",
      joinButton: "Join",
      
      // Waiting Room
      waitingRoom: "Waiting Room",
      shareCode: "Share this code with your friends:",
      copyCode: "Copy code",
      privateRoomTag: "Private Room",
      needPassword: "They will also need to enter the password",
      players: "Players",
      host: "Host",
      configureGame: "Configure Game",
      waitingForHost: "Waiting for the host to start configuration...",
      
      // Game Config
      gameConfig: "Game Configuration",
      theme: "Theme",
      selectTheme: "Select a theme",
      arcs: "Arcs (checking an arc automatically selects its characters)",
      characters: "Characters (all displayed, uncheck to exclude)",
      numberOfTurns: "Number of turns",
      charactersPerPlayer: "Characters per player (max)",
      turnDuration: "Turn duration (seconds)",
      startingBalance: "Starting balance",
      startGame: "Start Game",
      
      // Game Board
      turn: "Turn",
      currentBet: "Your Bet",
      availableBalance: "Available balance",
      placeBet: "Place Bet",
      fold: "Fold",
      folded: "You folded for this turn",
      maxBet: "Maximum bet",
      currentBetTag: "Bet",
      foldedTag: "Folded",
      endGame: "End Game",
      nextTurn: "Next Turn",
      
      // Voting
      results: "Results",
      votingPhase: "Voting Phase",
      winner: "is the winner!",
      votes: "votes",
      voteForWinner: "Vote for the winner",
      selectPlayer: "Select the player you think deserves to win:",
      confirmVote: "Confirm my Vote",
      voted: "You voted! Waiting for other players...",
      leaderboard: "Leaderboard",
      finalBalance: "Final balance",
      charactersCount: "characters",
      
      // Common
      chef: "Host",
      close: "Close",
      charactersLabel: "Characters",
      enterBet: "Enter your bet",
      
      // Messages
      roomCreated: "Room created with code:",
      errorCreatingRoom: "Error creating room",
      roomNotFound: "Room not found",
      invalidPassword: "Invalid password",
      gameAlreadyStarted: "Game already started",
      joinedRoom: "You joined the room!",
      errorJoining: "Connection error",
      roomFoundPrivate: "This room is private, enter the password",
      roomFound: "Room found! You can join.",
      codeCopied: "Code copied to clipboard!",
      selectThemeError: "Please select a theme",
      selectCharacterError: "Please select at least one character",
      enterValidBet: "Please enter a valid bet",
      betTooHigh: "Bet too high",
      betPlaced: "placed",
      
      // Room Page
      roomNotFoundDescription: "This room does not exist or you are not connected to it",
      backToHome: "Back to home",
      
      // Footer
      githubRepository: "GitHub Repository",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
