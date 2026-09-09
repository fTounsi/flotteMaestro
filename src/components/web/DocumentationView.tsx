import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Printer,
  Compass,
  Navigation,
  Calendar,
  Cpu,
  Shield,
  Bell,
  FileText,
  Boxes,
  KeyRound,
  Fuel,
  Snowflake,
  Share2,
  Wrench,
  Receipt,
  Building2,
  Users,
  Sliders,
  Terminal,
  Smartphone,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
  Sparkles,
  Lock,
  Layers,
  FileCode,
  Download,
  Flame,
  Clock,
  Gauge
} from 'lucide-react';
import { NavigationTab, User } from '../../types/fleet';

interface DocumentationViewProps {
  onNavigateToTab?: (tab: NavigationTab) => void;
  currentUser?: User | null;
}

interface DocSection {
  id: string;
  tabId?: NavigationTab;
  category: 'core' | 'modules' | 'admin' | 'dev_mobile' | 'help';
  categoryTitle: string;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  accentColor: string;
  badge?: string;
  targetAudience: ('all' | 'driver' | 'manager' | 'admin')[];
  keywords: string[];
  content: {
    overview: string;
    keyFeatures: string[];
    howToUse: { step: string; instruction: string }[];
    telemetryMetrics?: string[];
    safetyAndSecurity?: string;
    proTip?: string;
    troubleshooting?: string;
  };
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'intro',
    category: 'core',
    categoryTitle: 'Démarrage & Architecture',
    title: 'Vue d\'Ensemble & Prise en Main',
    shortDesc: 'Découvrez l\'architecture globale de FlotteMaestro, les modes d\'affichage et la navigation.',
    icon: Compass,
    accentColor: 'text-emerald-500',
    badge: 'Essentiel',
    targetAudience: ['all', 'driver', 'manager', 'admin'],
    keywords: ['accueil', 'introduction', 'démarrage', 'prise en main', 'interface', 'mode web', 'mobile', 'raccourcis'],
    content: {
      overview:
        "FlotteMaestro est une plateforme d'exploitation de flotte et de télématique synchronisée de nouvelle génération. Conçue pour répondre aux exigences des transporteurs, loueurs de véhicules, exploitants logistiques et transporteurs sous température dirigée, elle fusionne la télémétrie GPS haute fréquence (Traccar/Teltonika), la gestion multi-locataire étanche, et des modules métiers autonomes (coupure moteur à distance, anti-siphonnage de carburant, HACCP et facturation kilométrique).",
      keyFeatures: [
        "Architecture Multi-Modes : Basculez en un clic entre la Console Web Bureau, l'Application Mobile Dédiée pour smartphone, le Simulateur iPhone/Android, et l'Explorateur API REST/WebSocket pour intégrations externes.",
        "Moteur de Synchronisation Télématique : Traitement temps réel des trames GPS, statut moteur (ACC/Ignition), odomètre réel, et jauges de carburant.",
        "Cloisonnement Multi-Organisations (Multi-Tenancy) : Chaque société cliente bénéficie de son périmètre étanche de véhicules, d'utilisateurs et de modules activés.",
        "Contrôle d'Accès Basé sur les Rôles (RBAC) : Permissions strictes pour Super Administrateurs, Gestionnaires de flotte, Chauffeurs et Observateurs.",
        "Prise en charge Multilingue Native : Bascule instantanée Français (FR), Anglais (EN) et Arabe (العربية)."
      ],
      howToUse: [
        {
          step: "Connexion & Sélection du Profil",
          instruction:
            "Connectez-vous avec vos identifiants ou utilisez les accès rapides de démonstration (Super Admin, Gestionnaire de Flotte, Chauffeur). Votre tenant de rattachement sera automatiquement synchronisé."
        },
        {
          step: "Navigation dans la Barre Latérale",
          instruction:
            "Utilisez la barre latérale gauche pour naviguer entre les opérations de flotte, les modules métiers et l'administration. Utilisez le raccourci clavier (Ctrl+B ou ⌘B) ou le bouton en haut à gauche pour replier la barre et maximiser l'espace cartographique."
        },
        {
          step: "Activation du Flux Télématique en Direct",
          instruction:
            "Vérifiez l'indicateur vert 'GPS STREAM.ACTIVE' dans la barre supérieure. Vous pouvez mettre en pause ou réactiver le flux télématique simulé à tout moment pour inspecter des états fixes."
        }
      ],
      proTip:
        "Vous pouvez utiliser le sélecteur de thème dans l'en-tête ou le bas de la barre latérale pour basculer à tout moment entre le mode Sombre haute lisibilité et le mode Clair lumineux."
    }
  },
  {
    id: 'live_tracking',
    tabId: 'live_tracking',
    category: 'core',
    categoryTitle: 'Opérations de Flotte',
    title: '1. Cartographie & Suivi GPS en Direct',
    shortDesc: 'Surveillance spatiale en temps réel, statuts opérationnels, clustering et télémesures des véhicules.',
    icon: Navigation,
    accentColor: 'text-emerald-500',
    badge: 'Temps Réel',
    targetAudience: ['all', 'manager', 'admin'],
    keywords: ['carte', 'gps', 'suivi', 'live', 'radar', 'vitesse', 'batterie', 'carburant', 'relais', 'plein écran', 'filtre'],
    content: {
      overview:
        "Le module de suivi en direct affiche la position instantanée de l'ensemble de votre flotte sur un fond de carte vectoriel interactif. Chaque véhicule transmet sa position GPS, sa vitesse instantanée, son cap (orientation), son statut moteur, ainsi que les télémesures de ses capteurs embarqués (température de caisse, jauge de carburant, tension de batterie et statut du coupe-circuit).",
      keyFeatures: [
        "Code Couleur des Statuts Véhicules : Vert = En mouvement (avec vitesse affichée), Ambre/Orange = Moteur tournant au ralenti (ACC ON, vitesse 0 km/h), Gris/Ardoise = Véhicule à l'arrêt contact coupé, Rouge = Hors-ligne ou alerte critique.",
        "Recherche & Filtres Avancés : Filtrage instantané par plaque d'immatriculation, marque, modèle, chauffeur assigné ou type de motorisation.",
        "Modes de Tri Intelligent : Classez vos véhicules par vitesse décroissante, niveau de carburant le plus bas (priorité au ravitaillement), statut opérationnel ou odomètre.",
        "Affichage des Géofences : Visualisez les périmètres de sécurité polygonaux et circulaires directement superposés sur la carte.",
        "Mode Plein Écran (Focus Mode) : Cliquez sur l'icône d'agrandissement pour passer en mode poste de contrôle 100% plein écran sans distraction."
      ],
      howToUse: [
        {
          step: "Localiser un véhicule spécifique",
          instruction:
            "Saisissez la plaque ou le nom du chauffeur dans la barre de recherche au-dessus de la liste. Cliquez sur la carte du véhicule pour centrer instantanément la carte et afficher le tracé récent."
        },
        {
          step: "Ouvrir la Fiche Télématique Complète",
          instruction:
            "Cliquez sur 'Détails Véhicule' pour ouvrir la console d'audit : découvrez les diagnostics moteur OBD-II, l'historique des entretiens et le terminal de commandes descendantes."
        },
        {
          step: "Ajouter un nouveau véhicule au parc",
          instruction:
            "Cliquez sur le bouton '+ Ajouter un Véhicule' pour ouvrir le catalogue constructeur avec décodage automatique de numéro VIN et assignation d'une balise GPS."
        }
      ],
      telemetryMetrics: [
        "Vitesse instantanée (km/h) et orientation de déplacement (boussole)",
        "Statut du contact d'allumage (Ignition ON / OFF)",
        "Niveau de carburant restant (% et litres estimés)",
        "Température de caisse frigorifique (°C avec voyant de conformité)",
        "Tension d'alimentation batterie principale et batterie interne de secours",
        "Odomètre cumulé et temps de fonctionnement moteur"
      ],
      proTip:
        "Double-cliquez sur n'importe quel marqueur de véhicule sur la carte pour zoomer directement sur son point de passage avec les détails de son conducteur."
    }
  },
  {
    id: 'trips',
    tabId: 'trips',
    category: 'core',
    categoryTitle: 'Opérations de Flotte',
    title: '2. Historique des Trajets & Replay Scrubber',
    shortDesc: 'Reconstitution chronologique des trajets passés, analyse des vitesses et export géospatial GPX / KML.',
    icon: Calendar,
    accentColor: 'text-blue-500',
    badge: 'GPX / KML',
    targetAudience: ['all', 'manager', 'admin'],
    keywords: ['trajets', 'historique', 'replay', 'itineraire', 'gpx', 'kml', 'vitesse', 'arrêts', 'scrubber', 'export'],
    content: {
      overview:
        "L'historique des trajets permet de reconstituer avec une précision chirurgicale n'importe quel déplacement effectué par un véhicule de la flotte sur une période donnée. Le lecteur de trajectoire dynamique (Replay Scrubber) anime le déplacement du véhicule le long de son itinéraire, en synchronisant l'indicateur de vitesse, les arrêts prolongés et la consommation de carburant.",
      keyFeatures: [
        "Lecteur d'Itinéraire Animé (Scrubber) : Contrôles multimédia complets (Lecture, Pause, Recommencer, Recherche manuelle sur la barre chronologique).",
        "Vitesses de Replay Variables : Choisissez votre vitesse de lecture : 1x (vitesse réelle), 2x, 5x ou 10x accéléré pour analyser des trajets de plusieurs centaines de kilomètres en quelques secondes.",
        "Colorimétrie Dynamique de la Trajectoire : Le tracé sur la carte change de couleur selon la vitesse enregistrée (Vert = vitesse normale fluide, Ambre = vitesse soutenue, Rouge = excès de vitesse ou accélération brutale).",
        "Détection Automatique des Arrêts : Identification claire des arrêts avec horodatage d'arrivée, de départ et durée totale d'immobilisation.",
        "Exports Géospatiaux Officiels (.GPX & .KML) : Téléchargement instantané des coordonnées précises du trajet au format GPX (compatible Garmin, Strava, récepteurs GPS) ou KML (compatible Google Earth, SIG et cartographie 3D)."
      ],
      howToUse: [
        {
          step: "Sélectionner le Véhicule et la Date",
          instruction:
            "Dans le panneau de gauche, choisissez le véhicule concerné dans le menu déroulant, puis cliquez sur l'un des trajets enregistrés dans la liste chronologique."
        },
        {
          step: "Lancer la Visualisation Replay",
          instruction:
            "Cliquez sur le bouton vert 'Lecture' ou faites glisser manuellement le curseur pour explorer un instant précis de la mission. Les compteurs de vitesse et de carburant s'actualisent en temps réel."
        },
        {
          step: "Exporter la Trajectoire",
          instruction:
            "Sous les commandes du lecteur, cliquez sur 'Exporter .GPX' pour obtenir le fichier XML standard GPS ou sur 'Exporter .KML' pour ouvrir et survoler le parcours en relief dans Google Earth."
        }
      ],
      proTip:
        "Les fichiers KML exportés intègrent la vitesse et l'horodatage de chaque point GPS, ce qui en fait une preuve indiscutable en cas de litige client ou de contestation d'infraction routière."
    }
  },
  {
    id: 'trackers',
    tabId: 'trackers',
    category: 'core',
    categoryTitle: 'Opérations de Flotte',
    title: '3. Balises GPS Matérielles & Passerelle Traccar',
    shortDesc: 'Gestion du parc de traceurs télématiques, numéros IMEI, protocoles de communication et commandes SMS/GPRS.',
    icon: Cpu,
    accentColor: 'text-indigo-500',
    badge: 'Hardware',
    targetAudience: ['manager', 'admin'],
    keywords: ['balise', 'tracker', 'imei', 'sim', 'traccar', 'teltonika', 'queclink', 'concox', 'protocole', 'downlink', 'commandes'],
    content: {
      overview:
        "Le module Balises GPS centralise la gestion de tout votre parc de matériel télématique. Compatible avec les protocoles Traccar standards de l'industrie (Teltonika, Queclink, Concox/Jimi, Suntech, Ruptela et boîtiers OBD-II), il assure le provisionnement des numéros IMEI, la supervision de la connectivité cellulaire (carte SIM M2M) et l'envoi de commandes descendantes (Downlink Commands).",
      keyFeatures: [
        "Prise en Charge Multi-Constructeurs : Intégrez en toute transparence des traceurs Teltonika FMC130/FMB920, Queclink GL300, Jimi IoT, et dongles OBD-II Plug & Play.",
        "Diagnostic Réseau Cellulaire : Surveillance de la qualité du signal GSM (RSSI en dBm), du statut d'enregistrement de la carte SIM et de la tension de la batterie interne de secours.",
        "Appairage & Permutation Simple : Associez ou réassignez une balise d'un véhicule à un autre en conservant l'historique télématique.",
        "Terminal de Commandes Descendantes (Downlink Terminal) : Envoyez des commandes sécurisées par GPRS/SMS directement au microcontrôleur du boîtier (ex: redémarrage à chaud, changement de période d'émission, armement du coupe-circuit)."
      ],
      howToUse: [
        {
          step: "Enregistrer une Nouvelle Balise",
          instruction:
            "Cliquez sur '+ Ajouter une Balise'. Renseignez l'IMEI à 15 chiffres, le modèle du matériel, le numéro de téléphone de la carte SIM M2M et le protocole réseau configuré."
        },
        {
          step: "Assigner la Balise à un Véhicule",
          instruction:
            "Dans le tableau, utilisez le menu de sélection 'Véhicule assigné' pour lier instantanément le traceur à un véhicule actif de votre organisation."
        },
        {
          step: "Tester la Liaison et Envoyer une Commande",
          instruction:
            "Cliquez sur le bouton 'Terminal' pour envoyer un ordre downlink (ex: commande 'setdigout 1' ou 'cpureset') et surveiller la réponse ACK du boîtier."
        }
      ],
      safetyAndSecurity:
        "Ne communiquez jamais les clés de chiffrement de commande ou les codes PIN de carte SIM dans des canaux non sécurisés. Les commandes critiques de coupure d'alimentation sont restreintes aux utilisateurs disposant des permissions d'administration."
    }
  },
  {
    id: 'geofences',
    tabId: 'geofences',
    category: 'core',
    categoryTitle: 'Opérations de Flotte',
    title: '4. Périmètres & Géofences Virtuelles',
    shortDesc: 'Définition de zones circulaires et polygonales, règles d\'accès, couloirs autorisés et couvre-feu.',
    icon: Shield,
    accentColor: 'text-amber-500',
    badge: 'Géozones',
    targetAudience: ['manager', 'admin'],
    keywords: ['geofence', 'geozone', 'perimetre', 'zone', 'cercle', 'polygone', 'couvre-feu', 'entree', 'sortie', 'vitesse'],
    content: {
      overview:
        "Les géofences (ou géozones) sont des périmètres spatiaux virtuels délimités sur la carte qui surveillent automatiquement les allées et venues de vos véhicules. Lorsqu'un véhicule franchit la frontière d'une géofence, le moteur d'événements déclenche immédiatement les alertes associées (SMS, e-mail, alarme sonore et notification push).",
      keyFeatures: [
        "Géofences Polygonales & Circulaires : Tracez des polygones complexes pour épouser les contours exacts d'un entrepôt, d'un port ou d'une zone industrielle, ou utilisez des cercles paramétrables au mètre près.",
        "Règles d'Entrée & Sortie : Définissez si l'alerte doit se déclencher au passage entrant, à la sortie de zone (détection de vol ou détournement) ou les deux.",
        "Limitation de Vitesse Intra-Zone : Imposez une vitesse maximale spécifique dans la zone (ex: 20 km/h sur site logistique privé) pour prévenir les accidents d'atelier.",
        "Plages Horaires & Couvre-Feu : Configurez des restrictions d'horaires pour détecter les déménagements de véhicules non autorisés pendant la nuit ou le week-end."
      ],
      howToUse: [
        {
          step: "Créer une Nouvelle Géofence",
          instruction:
            "Cliquez sur '+ Nouvelle Géofence' et choisissez entre le mode Cercle (centre + rayon) ou Polygone (dessinez les sommets sur la carte)."
        },
        {
          step: "Attribuer les Véhicules Surveillés",
          instruction:
            "Choisissez si la règle s'applique à tous les véhicules de l'organisation ou à un groupe spécifique (ex: camions frigorifiques de distribution urbaine)."
        },
        {
          step: "Activer les Notifications d'Alerte",
          instruction:
            "Sélectionnez le niveau de sévérité de l'alerte et activez le carillon d'urgence pour que le poste d'exploitation soit immédiatement notifié lors d'une infraction."
        }
      ],
      proTip:
        "Pour les sites portuaires et les zones aéroportuaires, utilisez des polygones à 6 ou 8 sommets afin d'éviter les fausses alertes causées par des véhicules circulant sur les autoroutes adjacentes."
    }
  },
  {
    id: 'alerts',
    tabId: 'alerts',
    category: 'core',
    categoryTitle: 'Opérations de Flotte',
    title: '5. Centre d\'Alertes & Triage d\'Incidents',
    shortDesc: 'Flux temps réel d\'événements critiques, détection de chocs, SOS, carillon sonore et protocole d\'acquittement.',
    icon: Bell,
    accentColor: 'text-rose-500',
    badge: 'Sécurité',
    targetAudience: ['all', 'manager', 'admin'],
    keywords: ['alertes', 'incidents', 'sos', 'choc', 'vol', 'carillon', 'triage', 'acquittement', 'critique', 'notification'],
    content: {
      overview:
        "Le Centre d'Alertes constitue le tour de contrôle de la sécurité de votre flotte. Dès qu'une anomalie est détectée (appui sur bouton panique SOS, dépassement de vitesse, collision/choc violent détecté par l'accéléromètre 3 axes de la balise, ou coupure de batterie), l'alerte est consignée en temps réel avec localisation géocodée et niveau de priorité.",
      keyFeatures: [
        "Classification par Sévérité : Rouge = Critique (urgence immédiate, vol, SOS chauffeur, choc grave), Ambre = Avertissement (dépassement de vitesse, température frigo déviante), Bleu = Information (contact mis, entrée de zone autorisée).",
        "Avertisseur Sonore Intégré : Un carillon bitonal d'urgence retentit sur le poste de travail de l'opérateur pour garantir qu'aucun incident critique ne passe inaperçu.",
        "Procédure de Triage & Acquittement : Les opérateurs peuvent consigner des notes de prise en charge (ex: 'Contact téléphonique établi avec le chauffeur, fausse alerte confirmée') et marquer l'incident comme résolu pour respecter l'audit de conformité.",
        "Filtres Multi-Critères : Filtrez la liste des alertes par statut (non lues, en cours, résolues), par sévérité ou par véhicule."
      ],
      howToUse: [
        {
          step: "Consulter une Alerte Entrante",
          instruction:
            "Cliquez sur la notification ou sur la ligne d'alerte dans la liste pour afficher l'emplacement exact de l'incident sur la carte miniature et la vitesse au moment de l'événement."
        },
        {
          step: "Acquitter et Traiter l'Incident",
          instruction:
            "Cliquez sur le bouton 'Résoudre l'incident'. Renseignez l'opérateur ayant traité le cas et saisissez les mesures prises dans le formulaire de traçabilité."
        },
        {
          step: "Couper le Son du Carillon",
          instruction:
            "Si vous souhaitez désactiver temporairement les avertissements sonores, cliquez sur le bouton sonore dans l'en-tête de la page des alertes."
        }
      ],
      safetyAndSecurity:
        "En cas d'alerte SOS Chauffeur ou d'alerte Déconnexion Batterie, contactez en priorité le chauffeur et géolocalisez le véhicule pour engager les mesures de sécurité ou contacter les forces de l'ordre."
    }
  },
  {
    id: 'reports',
    tabId: 'reports',
    category: 'core',
    categoryTitle: 'Opérations de Flotte',
    title: '6. Studio de Rapports & Bilan Kilométrique',
    shortDesc: 'Génération de bilans de synthèse, audit de productivité, analyses de consommation et exports PDF / CSV.',
    icon: FileText,
    accentColor: 'text-teal-500',
    badge: 'Analytique',
    targetAudience: ['manager', 'admin'],
    keywords: ['rapports', 'pdf', 'csv', 'statistiques', 'kilometrage', 'consommation', 'arrets', 'productivite', 'audit'],
    content: {
      overview:
        "Le Studio de Rapports transforme les millions de coordonnées télématiques brutes en indicateurs clés de performance (KPI) exploitables pour la direction financière et les exploitants de transport. Vous pouvez générer à la demande des synthèses kilométriques, des bilans de temps de conduite, et des audits d'écoconduite.",
      keyFeatures: [
        "Types de Rapports Prédéfinis : Synthèse kilométrique journalière, Temps de conduite effectif vs Temps d'arrêt moteur tournant, Rapport de consommation carburant, Journal d'infractions de vitesse et de géofence.",
        "Périodes Flexibles : Choisissez parmi les filtres rapides (Aujourd'hui, 7 derniers jours, Ce mois-ci) ou sélectionnez un intervalle de dates personnalisé au calendrier.",
        "Exports Professionnels : Téléchargez vos rapports au format PDF vectoriel prêt pour impression avec en-tête d'entreprise, ou au format CSV tabulaire pour intégration dans Microsoft Excel ou Google Sheets."
      ],
      howToUse: [
        {
          step: "Sélectionner le Modèle de Rapport",
          instruction:
            "Dans le panneau supérieur, choisissez le type de bilan souhaité (ex: 'Rapport Kilométrique & Temps d'Activité')."
        },
        {
          step: "Définir la Plage Temporelle et les Véhicules",
          instruction:
            "Sélectionnez la période d'analyse et cochez les véhicules ou sous-flottes concernés."
        },
        {
          step: "Générer et Exporter",
          instruction:
            "Cliquez sur 'Générer le Rapport'. Prévisualisez les graphiques récapitulatifs à l'écran puis cliquez sur 'Télécharger PDF' ou 'Exporter CSV'."
        }
      ],
      proTip:
        "Le rapport 'Temps d'Arrêt Moteur Tournant' permet d'identifier immédiatement les gaspillages de carburant lors des livraisons et d'économiser jusqu'à 15% sur votre facture énergétique."
    }
  },
  {
    id: 'car_rental',
    tabId: 'car_rental',
    category: 'modules',
    categoryTitle: 'Modules Métiers Spécialisés',
    title: '7. Location de Véhicules, Relais & Hub Historique',
    shortDesc: 'Contrats de location, états des lieux départ/retour, grand livre des cautions, historique des coupures relais GPRS et blacklist.',
    icon: KeyRound,
    accentColor: 'text-amber-500',
    badge: 'Location & Relais',
    targetAudience: ['manager', 'admin'],
    keywords: ['location', 'car rental', 'contrat', 'caution', 'etat des lieux', 'checkin', 'checkout', 'relais', 'coupure moteur', 'immobilizer', 'voucher', 'historique', 'gprs', 'blacklist', 'couvre-feu'],
    content: {
      overview:
        "Spécialement développé pour les agences de location de voitures et les loueurs courte/moyenne durée, ce module dématérialise l'intégralité du cycle locatif : de la réservation initiale jusqu'au retour avec calcul automatique des excédents. Il intègre désormais un Hub Historique & Audit Télématique complet assurant la traçabilité forensique de tous les ordres de coupure relais GPRS, l'archivage des contrats clôturés, le grand livre financier des cautions et la gestion de la solvabilité client.",
      keyFeatures: [
        "Gestion du Parc Locatif : Visualisation immédiate de l'état de votre flotte de location (Disponible, Loué, En Maintenance, Réservé, Relais Coupé).",
        "Édition de Contrats & Vouchers : Génération instantanée de contrats numérotés avec identité du locataire (CIN / Passeport, permis, téléphone), dates de début/fin, tarifs journaliers et franchise.",
        "Check-In & Check-Out Numérique : Relevé automatique de l'odomètre GPS et du niveau de carburant au départ et au retour. Calcul instantané des kilomètres excédentaires et des pénalités de carburant manquant.",
        "Hub Historique & Audit des Ordres Relais : Journal chronologique infalsifiable consignant chaque coupure et rétablissement de relais avec motif réglementaire (vol, non-paiement, couvre-feu), nom de l'opérateur, vitesse GPS, trame protocolaire descendante et coordonnées géographiques.",
        "Grand Livre des Cautions & Séquestres : Suivi en temps réel des dépôts de garantie bloqués par pré-autorisation bancaire ou espèces, avec imputation détaillée des pénalités (carburant, kilomètres, nettoyage) et libération en un clic.",
        "Fichier Locataires, Indice de Confiance & Blacklist : Dossier conducteur avec score de fiabilité sur 100, cumul des dépenses, historique des locations et mise sur liste noire en cas d'impayé ou de sinistre.",
        "Alertes Couvre-Feu & Infractions de Zone : Détection automatique des circulations nocturnes interdites (00h-05h) ou des franchissements de limites contractuelles, avec possibilité d'immobilisation d'urgence en 1 clic.",
        "Coupure Moteur Sécurisée (< 20 km/h) : Déclenchement de la commande de relais coupe-circuit à distance. Le système intègre une sécurité passive absolue : la coupure ne s'exécute que lorsque le véhicule ralentit sous la barre des 20 km/h pour prévenir tout accident sur route rapide.",
        "Export CSV & Certificats Imprimables : Téléchargement du journal d'audit des relais, des archives de contrats et impression du bon officiel de restitution A4."
      ],
      howToUse: [
        {
          step: "Créer une Nouvelle Réservation ou Contrat",
          instruction:
            "Cliquez sur '+ Nouveau Contrat de Location'. Sélectionnez le véhicule disponible, saisissez les informations du conducteur, la durée, le forfait kilométrique inclus et le montant de la caution bloquée."
        },
        {
          step: "Consulter le Hub Historique & Télécommandes Relais",
          instruction:
            "Basculez sur l'onglet 'Historique & Hub Relais' pour explorer les 5 sous-registres : Journal des Relais, Archives des Contrats, Cautions en Séquestre, Fichier Clients et Alertes Couvre-Feu."
        },
        {
          step: "Envoyer un Ordre de Coupure Direct depuis la Console",
          instruction:
            "Dans le Hub Historique, cliquez sur 'Commande Directe Relais'. Choisissez le véhicule, le motif réglementaire (impayé, zone interdite, vol), vérifiez le contrôle de vitesse sécurisé (< 20 km/h) et transmettez la commande GPRS chiffrée."
        },
        {
          step: "Réconcilier ou Libérer une Caution Client",
          instruction:
            "Dans le sous-onglet 'Grand Livre des Cautions', sélectionnez un dossier en attente et cliquez sur 'Réconcilier'. Vous pouvez soit libérer l'intégralité de la pré-autorisation bancaire, soit appliquer les pénalités décomptées."
        },
        {
          step: "Effectuer l'État des Lieux de Retour (Check-Out)",
          instruction:
            "Lorsque le client restitue le véhicule, cliquez sur 'Restituer'. Le système lit automatiquement le kilométrage et la jauge de carburant via la balise GPS, calcule les dépassements et clôture le contrat en générant automatiquement la facture."
        }
      ],
      safetyAndSecurity:
        "AVERTISSEMENT DE SÉCURITÉ : N'activez JAMAIS la coupure moteur sur un véhicule circulant à grande vitesse sur autoroute. Le garde-fou logiciel bride l'exécution sous 20 km/h, mais l'opérateur doit s'assurer que le véhicule est immobilisé ou en manœuvre à basse vitesse pour éviter toute perte d'assistance de freinage ou de direction."
    }
  },
  {
    id: 'fuel_intelligence',
    tabId: 'fuel_intelligence',
    category: 'modules',
    categoryTitle: 'Modules Métiers Spécialisés',
    title: '8. Fuel Intelligence & Anti-Siphonnage',
    shortDesc: 'Surveillance par sonde capacitive / CAN-bus, radar de vol à l\'arrêt, réconciliation des pleins et éco-conduite.',
    icon: Fuel,
    accentColor: 'text-rose-500',
    badge: 'Carburant',
    targetAudience: ['manager', 'admin'],
    keywords: ['carburant', 'fuel', 'vol', 'siphonnage', 'sonde', 'can-bus', 'pleins', 'station', 'eco-conduite', 'ralenti'],
    content: {
      overview:
        "Le module Fuel Intelligence apporte une réponse technologique radicale au fléau du vol de carburant et du siphonnage nocturne. En analysant en temps réel les données de la jauge CAN-bus ou d'une sonde capacitive/ultrasonique immergée dans le réservoir, l'algorithme différencie la consommation normale de la baisse anormale et alerte immédiatement le gestionnaire.",
      keyFeatures: [
        "Radar Anti-Siphonnage & Vol : Détection instantanée d'une perte brutale de niveau (> 5 litres en moins de 3 minutes moteur éteint). Localisation exacte du vol avec coordonnées GPS et horodatage.",
        "Calcul du Litrage Volé et Valeur Financière : Estimation automatique de la perte en litres et du préjudice monétaire en fonction du coût du litre.",
        "Registre de Réconciliation des Pleins : Chaque ravitaillement est détecté (hausse de la courbe de carburant) et comparé au volume de la facture de la station-service pour éliminer la fraude aux tickets de caisse.",
        "Scorecards Éco-Conduite Chauffeurs : Notation sur 100 mesurant l'efficacité énergétique, les accélérations excessives, les freinages brusques et le temps perdu au ralenti moteur tournant."
      ],
      howToUse: [
        {
          step: "Surveiller les Alertes de Vol de Carburant",
          instruction:
            "Consultez l'onglet 'Radar Siphonnage'. En cas de tentative de vol, la carte affiche un cercle d'incident rouge avec le volume siphonné, la plaque et la possibilité de couper le moteur à distance."
        },
        {
          step: "Auditer les Pleins de Carburant",
          instruction:
            "Dans l'onglet 'Registre des Pleins', vérifiez que le litrage avant/après plein correspond bien à la facture payée à la station-service."
        },
        {
          step: "Analyser les Scores d'Éco-Conduite",
          instruction:
            "Consultez l'onglet 'Éco-Conduite' pour identifier les chauffeurs vertueux et ceux nécessitant une formation à la conduite économique."
        }
      ],
      proTip:
        "En couplant le radar anti-siphonnage avec une géofence autour des parkings de nuit, vous recevez une alerte sonore instantanée dès que le bouchon de réservoir est forcé."
    }
  },
  {
    id: 'cold_chain',
    tabId: 'cold_chain',
    category: 'modules',
    categoryTitle: 'Modules Métiers Spécialisés',
    title: '9. Chaîne du Froid & Conformité HACCP/GDP',
    shortDesc: 'Sondes de température certifiées, alarmes de rupture de froid, journal d\'audit et certificats de transit officiels.',
    icon: Snowflake,
    accentColor: 'text-cyan-500',
    badge: 'HACCP',
    targetAudience: ['manager', 'admin'],
    keywords: ['froid', 'temperature', 'haccp', 'gdp', 'frigo', 'surgeles', 'pharma', 'alimentaire', 'certificat', 'excursion'],
    content: {
      overview:
        "Conçu pour l'industrie pharmaceutique, la distribution agroalimentaire et les grossistes en produits frais, ce module assure la traçabilité thermique ininterrompue de vos marchandises thermosensibles. Il garantit la conformité aux normes internationales HACCP (sécurité alimentaire) et GDP (Good Distribution Practices pour médicaments).",
      keyFeatures: [
        "Surveillance Thermique Multi-Sondes : Suivi simultané de compartiments à températures distinctes (Produits frais 0°C à +4°C, Surgelés -18°C à -25°C, Ambiant +15°C à +25°C).",
        "Détection Immédiate des Ruptures de Froid : Alarme instantanée dès qu'une sonde franchit le seuil critique configuré pendant plus de 10 minutes consécutives.",
        "Courbes Chronologiques de Température : Graphiques thermiques haute définition corrélés avec l'ouverture des portes de la caisse frigo.",
        "Génération de Certificats Officiels de Transit : Émission d'un certificat d'intégrité HACCP/GDP numéroté, signé numériquement et exportable en PDF pour remise au destinataire ou à l'inspecteur sanitaire."
      ],
      howToUse: [
        {
          step: "Visualiser la Température Actuelle des Caisses",
          instruction:
            "Le tableau de bord affiche chaque camion frigorifique avec sa jauge de température et son voyant vert (conforme) ou rouge (excursion thermique)."
        },
        {
          step: "Paramétrer les Seuils de Température",
          instruction:
            "Cliquez sur les paramètres d'un véhicule pour ajuster la plage de température minimale et maximale autorisée selon la marchandise transportée."
        },
        {
          step: "Télécharger un Certificat de Livraison HACCP",
          instruction:
            "À la fin de la mission de transport, cliquez sur 'Générer Certificat HACCP' pour obtenir le document officiel d'attestation de respect de la chaîne du froid."
        }
      ],
      safetyAndSecurity:
        "Toutes les données de température sont signées et infalsifiables, constituant une archive juridique opposable aux compagnies d'assurance en cas de litige sur marchandise avariée."
    }
  },
  {
    id: 'live_sharing',
    tabId: 'live_sharing',
    category: 'modules',
    categoryTitle: 'Modules Métiers Spécialisés',
    title: '10. Partage de Livraison en Direct & e-POD',
    shortDesc: 'Liens de tracking client sécurisés avec expiration, calcul d\'ETA dynamique et signature de livraison électronique.',
    icon: Share2,
    accentColor: 'text-indigo-500',
    badge: 'e-POD & ETA',
    targetAudience: ['driver', 'manager', 'admin'],
    keywords: ['partage', 'livraison', 'eta', 'tracking', 'client', 'lien', 'signature', 'epod', 'bon de livraison', 'preuve'],
    content: {
      overview:
        "Offrez à vos clients finaux (B2B ou B2C) une expérience de livraison digne des meilleurs standards mondiaux. Ce module permet de générer des liens de suivi éphémères et sécurisés sans que le client n'ait besoin d'installer une application. Le client visualise son colis en approche sur une carte épurée avec une estimation d'arrivée (ETA) en temps réel.",
      keyFeatures: [
        "Liens de Suivi Éphémères avec Expiration : Génération d'un lien unique valable pour une durée strictement encadrée (1 heure, 6 heures, 24 heures ou 48 heures).",
        "Calcul d'ETA Dynamique : Calcul automatique du temps restant et de la distance séparant le livreur de l'adresse de destination, actualisé avec le trafic routier.",
        "Protection de la Confidentialité Flotte : Le client ne voit que le véhicule assigné à sa livraison, et aucun autre véhicule de votre organisation.",
        "Preuve Électronique de Livraison (e-POD) : Enregistrement de la signature tactile du destinataire directement sur smartphone avec horodatage et géolocalisation certifiée."
      ],
      howToUse: [
        {
          step: "Générer un Lien de Partage Client",
          instruction:
            "Cliquez sur '+ Nouveau Lien de Suivi'. Sélectionnez le véhicule de livraison, renseignez l'adresse du client et la durée de validité du lien."
        },
        {
          step: "Transmettre au Client (SMS ou WhatsApp)",
          instruction:
            "Copiez le lien généré ou cliquez sur 'Envoyer par WhatsApp' pour que le destinataire puisse suivre l'approche de son colis sur son smartphone."
        },
        {
          step: "Valider la Livraison (e-POD)",
          instruction:
            "Lors de la remise du colis, le destinataire appose sa signature sur l'écran et la confirmation de livraison est automatiquement archivée."
        }
      ],
      proTip:
        "L'utilisation des liens de partage d'ETA réduit de plus de 40% les appels téléphoniques entrants des clients demandant 'Où se trouve ma commande ?'."
    }
  },
  {
    id: 'predictive_maintenance',
    tabId: 'predictive_maintenance',
    category: 'modules',
    categoryTitle: 'Modules Métiers Spécialisés',
    title: '11. Maintenance Prédictive & Diagnostic Moteur OBD-II',
    shortDesc: 'Décodage des codes défauts DTC, suivi des vidanges, plaquettes, distribution et alertes automatiques par e-mail.',
    icon: Wrench,
    accentColor: 'text-amber-500',
    badge: 'OBD-II',
    targetAudience: ['manager', 'admin'],
    keywords: ['maintenance', 'obd', 'dtc', 'moteur', 'panne', 'vidange', 'entretien', 'reparation', 'freins', 'courroie', 'e-mail'],
    content: {
      overview:
        "La Maintenance Prédictive vous aide à éradiquer les pannes coûteuses et les immobilisations imprévues. En exploitant les trames de diagnostic embarqué OBD-II / CAN-bus, la plateforme identifie les anomalies moteur avant même que le voyant 'Check Engine' n'apparaisse au tableau de bord, et planifie les entretiens périodiques selon le kilométrage réel.",
      keyFeatures: [
        "Scanner de Codes Défauts Moteur (DTC) : Décodage instantané des codes d'erreur standards (ex: P0300 - Ratés d'allumage détectés, P0420 - Efficacité catalytique, P0115 - Sonde de température de liquide de refroidissement).",
        "Calendrier d'Entretien Préventif : Configuration d'intervalles basés sur le kilométrage (ex: Vidange d'huile tous les 10 000 km, Plaquettes de frein à 30 000 km) ou le temps (Contrôle technique annuel).",
        "Alertes Automatiques par E-mail : Envoi automatique de notifications de révision imminente au chef d'atelier ou au gestionnaire de parc.",
        "Carnet d'Entretien Numérique : Journalisation de toutes les factures de garage, pièces changées et coûts cumulés par véhicule."
      ],
      howToUse: [
        {
          step: "Consulter la Santé Moteur d'un Véhicule",
          instruction:
            "Vérifiez l'état général dans la liste des véhicules. Si un code DTC est présent, cliquez sur 'Détails Diagnostic' pour obtenir la description détaillée et la sévérité de l'anomalie."
        },
        {
          step: "Créer un Nouvel Intervalle d'Entretien",
          instruction:
            "Cliquez sur 'Configurer un Intervalle'. Renseignez le libellé de l'opération, le kilométrage d'échéance et le seuil d'alerte anticipée (ex: prévenir 500 km avant)."
        },
        {
          step: "Consigner une Réparation Effectuée",
          instruction:
            "Après passage en atelier, cliquez sur 'Enregistrer Intervention' pour remettre à zéro le compteur de révision et archiver la facture du prestataire."
        }
      ],
      safetyAndSecurity:
        "Tout code défaut critique touchant au système de freinage (ABS/ESP) ou à la surchauffe moteur doit faire l'objet d'une immobilisation immédiate pour inspection atelier."
    }
  },
  {
    id: 'invoicing',
    tabId: 'invoicing',
    category: 'modules',
    categoryTitle: 'Modules Métiers Spécialisés',
    title: '12. Facturation à l\'Usage & Devis PDF',
    shortDesc: 'Tarification au kilomètre ou à l\'heure, mentions légales marocaines (ICE/IF/TVA), balance âgée et prévisualisation PDF.',
    icon: Receipt,
    accentColor: 'text-emerald-500',
    badge: 'Facturation',
    targetAudience: ['manager', 'admin'],
    keywords: ['facturation', 'invoicing', 'facture', 'pdf', 'devis', 'ice', 'tva', 'client', 'kilometre', 'forfait', 'paiement'],
    content: {
      overview:
        "Le module de Facturation à l'Usage automatise la valorisation financière de vos prestations de transport ou de location. Il calcule précisément les montants dus sur la base de la télémétrie réelle (kilomètres parcourus, heures de fonctionnement, jours de mise à disposition) et génère des factures professionnelles conformes à la réglementation fiscale.",
      keyFeatures: [
        "Grilles Tarifaires Multi-Modèles : Définissez des forfaits fixes journaliers, des tarifs kilométriques dégressifs, ou des suppléments de carburant et de nettoyage.",
        "Conformité Fiscale Marocaine & Internationale : Intégration complète des mentions obligatoires : ICE (Identifiant Commun de l'Entreprise), Identifiant Fiscal (IF), Taxe Professionnelle (TP), Registre de Commerce (RC), et calcul automatique de la TVA 20%.",
        "Prévisualisation & Impression PDF Plein Écran : Affichage du rendu final de la facture au format papier avec impression directe ou téléchargement PDF vectoriel.",
        "Suivi des Règlements & Balance Âgée : Gestion des statuts de règlement (Payée, En attente, En retard) et historique des encaissements."
      ],
      howToUse: [
        {
          step: "Enregistrer une Fiche Client",
          instruction:
            "Cliquez sur '+ Nouveau Client' et renseignez la raison sociale, l'adresse de facturation, l'e-mail et le numéro ICE de l'entreprise cliente."
        },
        {
          step: "Générer une Facture d'Usage",
          instruction:
            "Cliquez sur 'Émettre une Facture'. Sélectionnez le client, la période de facturation et les véhicules concernés. Le système intègre automatiquement les lignes kilométriques et les forfaits."
        },
        {
          step: "Prévisualiser et Imprimer la Facture",
          instruction:
            "Cliquez sur 'Aperçu Facture' pour ouvrir la visionneuse PDF grand format. Imprimez-la directement ou envoyez-la par e-mail en un clic."
        }
      ],
      proTip:
        "Toutes les opérations issues du module 'Location de Véhicules' (Check-out avec retenue sur caution ou frais de carburant) sont injectées automatiquement dans ce module de Facturation sans aucune double saisie manuelle."
    }
  },
  {
    id: 'organizations',
    tabId: 'organizations',
    category: 'admin',
    categoryTitle: 'Gouvernance & Administration',
    title: '13. Multi-Tenancy & Gestion des Organisations',
    shortDesc: 'Architecture multi-locataire étanche, forfaits d\'abonnement, quotas de flotte et passerelles télécom par société.',
    icon: Building2,
    accentColor: 'text-purple-500',
    badge: 'Multi-Tenant',
    targetAudience: ['admin'],
    keywords: ['organisation', 'tenant', 'multi-tenancy', 'abonnement', 'starter', 'enterprise', 'quotas', 'societe', 'filiale'],
    content: {
      overview:
        "FlotteMaestro est nativement multi-locataire (Multi-Tenant). Cette architecture permet à un éditeur de service ou à un grand groupe d'héberger des dizaines de filiales ou d'entreprises clientes indépendantes sur une même instance logicielle, avec une étanchéité absolue des bases de données et des permissions.",
      keyFeatures: [
        "Étanchéité Complète des Données : Un utilisateur d'une filiale ne peut en aucun cas visualiser les véhicules, trajets ou alertes d'une autre filiale.",
        "Forfaits & Quotas Configurables : Définissez pour chaque organisation son plan d'abonnement (Starter, Professional, Enterprise) avec des plafonds de véhicules, de traceurs et de comptes utilisateurs.",
        "Activation Granulaire des Modules Métiers : Choisissez pour chaque organisation les modules activés (ex: débloquer la Chaîne du Froid uniquement pour les transporteurs pharmaceutiques).",
        "Sélecteur de Tenant pour Super Administrateurs : Les Super Admins peuvent basculer instantanément d'une organisation à une autre dans la barre supérieure pour auditer ou assister les clients."
      ],
      howToUse: [
        {
          step: "Créer une Nouvelle Organisation",
          instruction:
            "En tant que Super Admin, cliquez sur '+ Créer une Organisation'. Renseignez le nom, la ville, le forfait souscrit et le quota maximal de véhicules autorisés."
        },
        {
          step: "Activer ou Désactiver des Modules",
          instruction:
            "Dans la fiche de l'organisation, cochez ou décochez les modules (Location, Carburant, Chaîne du Froid, Facturation) pour ajuster les fonctionnalités disponibles."
        }
      ],
      safetyAndSecurity:
        "Seuls les utilisateurs dotés du rôle 'Super Admin' ont la capacité de créer, modifier ou supprimer des organisations et de basculer entre les différents tenants."
    }
  },
  {
    id: 'users_rbac',
    tabId: 'users',
    category: 'admin',
    categoryTitle: 'Gouvernance & Administration',
    title: '14. Équipe, Permissions RBAC & Simulateur de Rôles',
    shortDesc: 'Gestion des utilisateurs, hiérarchie de rôles, matrice de permissions et bac à sable de simulation (Role Impersonation).',
    icon: Users,
    accentColor: 'text-pink-500',
    badge: 'RBAC',
    targetAudience: ['manager', 'admin'],
    keywords: ['utilisateurs', 'roles', 'rbac', 'permissions', 'impersonation', 'simulation', 'chauffeur', 'gestionnaire', 'securite'],
    content: {
      overview:
        "Le module RBAC (Role-Based Access Control) garantit que chaque collaborateur accède exclusivement aux fonctionnalités et aux données nécessaires à sa mission. Il intègre en exclusivité un simulateur de rôle (Role Impersonation Sandbox) permettant à l'administrateur de tester l'application exactement sous l'œil d'un chauffeur ou d'un gestionnaire sans modifier son compte réel.",
      keyFeatures: [
        "Hiérarchie de Rôles Standards : Super Admin (accès global), Propriétaire d'Organisation (Org Owner), Gestionnaire de Flotte (Fleet Manager), Chauffeur (Driver) et Observateur (Viewer).",
        "Matrice de Permissions Fines : Contrôle précis des droits : afficher la carte, modifier les véhicules, envoyer des commandes de coupure moteur, éditer les factures, etc.",
        "Sandbox de Simulation de Rôle : Cliquez sur 'Tester ce rôle' pour simuler instantanément la vue d'un autre profil. Un bandeau d'alerte violet apparaît en haut de l'écran avec un bouton de retour rapide.",
        "Gestion des Fiches Chauffeurs : Numéro de permis de conduire, date de validité de la visite médicale et historique d'assignation des véhicules."
      ],
      howToUse: [
        {
          step: "Inviter un Nouveau Membre",
          instruction:
            "Cliquez sur '+ Ajouter un Utilisateur'. Saisissez son nom, e-mail, téléphone et assignez-lui son rôle au sein de l'organisation."
        },
        {
          step: "Simuler un Rôle (Tester les Permissions)",
          instruction:
            "Sur n'importe quel rôle du tableau, cliquez sur 'Simuler la perspective'. La plateforme masque immédiatement les menus non autorisés pour vérifier le cloisonnement de l'interface."
        },
        {
          step: "Quitter la Simulation",
          instruction:
            "Cliquez sur 'Quitter le bac à sable' dans le bandeau supérieur pour restaurer instantanément vos droits d'administrateur."
        }
      ],
      safetyAndSecurity:
        "La simulation de rôle n'altère pas les données en base et applique strictement les règles d'étanchéité d'interface."
    }
  },
  {
    id: 'settings',
    tabId: 'settings',
    category: 'admin',
    categoryTitle: 'Gouvernance & Administration',
    title: '15. Paramètres Système & Hub de Protocoles Traccar',
    shortDesc: 'Configuration des ports d\'écoute des protocoles GPS, serveurs SMTP, passerelles SMS/WhatsApp et rétention des données.',
    icon: Sliders,
    accentColor: 'text-cyan-500',
    badge: 'Serveur Traccar',
    targetAudience: ['admin'],
    keywords: ['parametres', 'systeme', 'traccar', 'ports', 'teltonika', '5027', 'gt06', 'smtp', 'sms', 'whatsapp', 'retention'],
    content: {
      overview:
        "Destiné aux administrateurs techniques, ce panneau pilote les paramètres de bas niveau du serveur télématique Traccar et des services d'infrastructure : ports d'écoute des trames GPS binaires/textes, configuration des passerelles d'alerte (serveur mail SMTP, Twilio / WhatsApp) et politique d'archivage des données historiques.",
      keyFeatures: [
        "Ports d'Écoute des Protocoles Matériels : Port 5027 (Teltonika), Port 5023 (GT06/Concox), Port 5004 (Queclink), Port 5046 (Ruptela), Port 5013 (H02/Coban), Port 5170 (Freematics OBD-II).",
        "Passerelles SMS & WhatsApp : Paramétrage des identifiants Twilio, Infobip ou passerelle GSM locale pour l'envoi des alertes urgentes.",
        "Serveur de Messagerie SMTP : Configuration de l'hôte SMTP, port, chiffrement TLS/SSL et adresse d'expédition pour les rapports programmés et alertes de révision.",
        "Règles de Purge & Rétention : Définissez la durée de conservation des coordonnées GPS détaillées (ex: 90 jours, 180 jours, 365 jours) pour optimiser l'espace disque."
      ],
      howToUse: [
        {
          step: "Vérifier l'État des Écouteurs Réseau",
          instruction:
            "Consultez l'onglet 'Protocoles Télématiques' pour vous assurer que les ports d'écoute des traceurs de votre flotte sont bien actifs et fonctionnels."
        },
        {
          step: "Tester la Configuration E-mail",
          instruction:
            "Renseignez vos paramètres SMTP puis cliquez sur 'Envoyer un E-mail de Test' pour valider la communication avec votre serveur de messagerie."
        }
      ],
      safetyAndSecurity:
        "Toute modification des ports réseau ou des clés API de passerelle SMS nécessite un redémarrage des écouteurs de trames. Veillez à tester les changements en dehors des heures de pointe d'exploitation."
    }
  },
  {
    id: 'api_developer',
    category: 'dev_mobile',
    categoryTitle: 'Outils Développeur & Mobilité',
    title: '16. Explorateur API REST & WebSocket en Streaming',
    shortDesc: 'Documentation interactive OpenAPI 3.0 / Swagger, génération de jetons JWT et flux WebSocket pour intégrations ERP.',
    icon: Terminal,
    accentColor: 'text-violet-500',
    badge: 'OpenAPI 3.0',
    targetAudience: ['admin'],
    keywords: ['api', 'rest', 'websocket', 'swagger', 'openapi', 'jwt', 'developpeur', 'erp', 'odoo', 'sap', 'integration'],
    content: {
      overview:
        "L'Explorateur d'API offre aux développeurs et aux équipes DSI un environnement complet pour connecter FlotteMaestro à vos logiciels internes (ERP SAP, Odoo, Sage, TMS transport ou WMS entrepôt). Il comprend une documentation interactive conforme au standard OpenAPI 3.0 (Swagger) et un moniteur de flux WebSocket en direct.",
      keyFeatures: [
        "Documentation Interactive OpenAPI 3.0 : Testez en direct les requêtes HTTP (GET, POST, PUT, DELETE) sur les véhicules, les positions, les alertes et les rapports.",
        "Génération de Jetons JWT (Bearer Auth) : Créez des clés d'API sécurisées avec durée de validité et périmètre de permissions restreint.",
        "Flux WebSocket Temps Réel : Connectez-vous au flux bi-directionnel pour recevoir les coordonnées GPS dès qu'une balise émet, sans avoir à solliciter l'API en polling régulier.",
        "Snippets de Code Prêts à l'Emploi : Exemples de code fournis en cURL, JavaScript/TypeScript, Python et PHP."
      ],
      howToUse: [
        {
          step: "Basculer en Mode Développeur",
          instruction:
            "Dans la barre supérieure de l'application, cliquez sur l'onglet 'Mode Développeur' ou 'API' pour ouvrir le terminal interactif."
        },
        {
          step: "Exécuter une Requête de Test",
          instruction:
            "Choisissez un point de terminaison (ex: `GET /api/v1/vehicles`), puis cliquez sur 'Try it out' et 'Execute' pour inspecter le corps JSON de la réponse HTTP 200."
        },
        {
          step: "Inspecter le Flux WebSocket",
          instruction:
            "Dans le panneau de droite, visualisez les trames de télémétrie brutes défiler en temps réel avec latence et identifiant de paquet."
        }
      ],
      proTip:
        "Utilisez les Webhooks d'alerte pour notifier automatiquement votre progiciel de gestion (ERP) dès qu'un trajet de livraison est achevé avec son e-POD."
    }
  },
  {
    id: 'mobile_app',
    category: 'dev_mobile',
    categoryTitle: 'Outils Développeur & Mobilité',
    title: '17. Application Mobile Smartphone Chauffeur',
    shortDesc: 'Interface mobile tactile réactive, simulateur d\'écran pour smartphone et fonctionnalités dédiées aux conducteurs.',
    icon: Smartphone,
    accentColor: 'text-emerald-500',
    badge: 'PWA Mobile',
    targetAudience: ['driver', 'manager', 'all'],
    keywords: ['mobile', 'smartphone', 'application', 'chauffeur', 'conducteur', 'sos', 'simulateur', 'pwa', 'ios', 'android'],
    content: {
      overview:
        "L'Application Mobile FlotteMaestro est optimisée pour une utilisation nomade sur smartphones Android et iOS. Utilisable soit via l'URL autonome, soit testable directement sur PC grâce au Simulateur d'écran intégré, elle simplifie le quotidien du chauffeur en regroupant ses missions, sa check-list de départ et ses contacts d'urgence.",
      keyFeatures: [
        "Mode Autonome Dédié (Smartphone Native Feel) : Interface tactile fluide avec barre de navigation inférieure, grands boutons d'action et mode hors-ligne partiel.",
        "Bouton d'Urgence Panique SOS : En cas de danger, agression ou panne critique, un appui prolongé de 2 secondes sur le bouton rouge diffuse immédiatement l'alerte à la base avec position GPS précise.",
        "Check-list d'Inspection Avant Départ : Le conducteur vérifie l'état visuel du véhicule, l'éclairage, les pneus et le niveau d'huile avant d'entamer sa tournée.",
        "Simulateur de Smartphone sur Bureau : Les gestionnaires peuvent tester l'expérience conducteur directement depuis leur ordinateur via le simulateur d'iPhone/Pixel."
      ],
      howToUse: [
        {
          step: "Accéder au Mode Mobile",
          instruction:
            "Sur votre smartphone, ouvrez l'adresse de l'application. Sur ordinateur, cliquez sur 'Mobile App' ou 'Simulator' dans la barre d'en-tête supérieure."
        },
        {
          step: "Installer l'Application sur l'Écran d'Accueil (PWA)",
          instruction:
            "Dans votre navigateur mobile (Safari sur iOS ou Chrome sur Android), appuyez sur le bouton 'Partager' puis sélectionnez 'Ajouter à l'écran d'accueil' pour l'installer comme une application native."
        },
        {
          step: "Consulter la Feuille de Route",
          instruction:
            "Le conducteur visualise ses étapes de livraison du jour avec bouton de guidage GPS direct vers Google Maps ou Waze."
        }
      ],
      safetyAndSecurity:
        "L'application mobile interdit la manipulation complexe de menus pendant la conduite et préconise l'utilisation d'un support smartphone certifié."
    }
  },
  {
    id: 'faq_troubleshooting',
    category: 'help',
    categoryTitle: 'Support & Dépannage',
    title: '18. Guide de Dépannage & FAQ Technique',
    shortDesc: 'Réponses aux pannes courantes : balise hors-ligne, dérive GPS, coupure moteur inactive et configuration SMTP.',
    icon: HelpCircle,
    accentColor: 'text-amber-500',
    badge: 'Assistance',
    targetAudience: ['all', 'driver', 'manager', 'admin'],
    keywords: ['faq', 'depannage', 'probleme', 'panne', 'hors ligne', 'offline', 'relais', 'gps', 'sim', 'aide', 'support'],
    content: {
      overview:
        "Retrouvez ici les réponses rapides et les protocoles de résolution des incidents les plus fréquemment rencontrés par les gestionnaires de flotte et les équipes techniques sur le terrain.",
      keyFeatures: [
        "Diagnostic 'Véhicule Hors-Ligne' : Étapes de contrôle de l'antenne GPS, du fusible d'alimentation permanente 12V/24V et du forfait data M2M.",
        "Vérification de la Sécurité Coupure Moteur : Pourquoi la coupure reste parfois en statut 'Armée' tant que le véhicule n'a pas ralenti.",
        "Dérive GPS en Sous-Sol & Effet Multipath : Pourquoi les positions peuvent être imprécises à l'intérieur d'un parking souterrain fermé.",
        "Restauration d'Accès & Mots de Passe : Procédure de réinitialisation sécurisée par l'administrateur d'organisation."
      ],
      howToUse: [
        {
          step: "Problème : Une balise neuve n'apparaît pas en ligne",
          instruction:
            "Vérifiez que le code IMEI saisi dans l'application correspond exactement au numéro gravé sur l'étiquette du traceur. Assurez-vous que la carte SIM M2M est activée, que le code PIN a été désactivé (PIN 0000 ou sans PIN) et que l'APN de l'opérateur télécom a été configuré par SMS."
        },
        {
          step: "Problème : La coupure moteur ne s'est pas déclenchée immédiatement",
          instruction:
            "Il s'agit d'un comportement de sécurité normal : le garde-fou passif attend que la vitesse du véhicule descende en dessous de 20 km/h pour actionner le relais afin d'éviter tout accident. Dès que le véhicule ralentit à un feu rouge ou stationne, le relais s'ouvre."
        },
        {
          step: "Problème : Les e-mails d'alerte de maintenance n'arrivent pas",
          instruction:
            "Accédez au module 'Paramètres Système', vérifiez les identifiants de votre serveur SMTP (port 587 ou 465) et contrôlez que votre fournisseur de messagerie autorise l'envoi d'e-mails applicatifs."
        }
      ],
      proTip:
        "Conservez toujours une balise de secours déjà paramétrée dans votre stock technique pour remplacer un équipement défaillant en moins de 10 minutes lors d'un passage en atelier."
    }
  }
];

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  onNavigateToTab,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'driver' | 'manager' | 'admin'>('all');
  const [activeSectionId, setActiveSectionId] = useState<string>('intro');
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);

  // Filter sections based on search and audience
  const filteredSections = useMemo(() => {
    return DOC_SECTIONS.filter((sec) => {
      // Audience filter
      if (selectedAudience !== 'all' && !sec.targetAudience.includes(selectedAudience)) {
        return false;
      }
      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        sec.title.toLowerCase().includes(q) ||
        sec.shortDesc.toLowerCase().includes(q) ||
        sec.categoryTitle.toLowerCase().includes(q) ||
        sec.keywords.some((k) => k.toLowerCase().includes(q)) ||
        sec.content.overview.toLowerCase().includes(q) ||
        sec.content.keyFeatures.some((f) => f.toLowerCase().includes(q)) ||
        sec.content.howToUse.some((h) => h.step.toLowerCase().includes(q) || h.instruction.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedAudience]);

  // Find active section
  const currentSection = useMemo(() => {
    return (
      filteredSections.find((s) => s.id === activeSectionId) ||
      filteredSections[0] ||
      DOC_SECTIONS[0]
    );
  }, [filteredSections, activeSectionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setCopiedSectionId(sectionId);
    setTimeout(() => setCopiedSectionId(null), 2500);
  };

  // Group filtered sections by category for the sidebar menu
  const groupedSections = useMemo(() => {
    const groups: { [key: string]: DocSection[] } = {};
    filteredSections.forEach((sec) => {
      if (!groups[sec.categoryTitle]) {
        groups[sec.categoryTitle] = [];
      }
      groups[sec.categoryTitle].push(sec);
    });
    return groups;
  }, [filteredSections]);

  return (
    <div id="flottemaestro-documentation-hub" className="space-y-6 animate-fadeIn pb-12">
      {/* 1. HERO BANNER & SEARCH BAR */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-900 to-zinc-950 border border-slate-800 text-white p-6 sm:p-8 md:p-10 shadow-2xl">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>DOCUMENTATION OFFICIELLE & GUIDE UTILISATEUR</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Guide Complet de l'Application <span className="text-emerald-400">FlotteMaestro</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Manuel de référence exhaustif pour conducteurs, répartiteurs, gestionnaires de flotte et
            administrateurs. Maîtrisez chaque fonctionnalité, protocole télématique et module métier
            grâce à nos explications pas-à-pas en français.
          </p>

          {/* Search bar & quick filters */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une fonctionnalité (ex: relais, coupure, siphonnage, gpx, haccp, facture)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-white/10 px-2 py-0.5 rounded-lg"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Print button */}
            <button
              onClick={handlePrint}
              title="Imprimer ou enregistrer le guide au format PDF"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 transition-all shrink-0"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Imprimer / Exporter</span>
            </button>
          </div>

          {/* Audience Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Filtrer par Profil :
            </span>
            {(
              [
                { id: 'all', label: 'Tous les Profils' },
                { id: 'driver', label: 'Chauffeurs' },
                { id: 'manager', label: 'Gestionnaires de Flotte' },
                { id: 'admin', label: 'Administrateurs' }
              ] as const
            ).map((aud) => (
              <button
                key={aud.id}
                onClick={() => setSelectedAudience(aud.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedAudience === aud.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {aud.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN DOCUMENTATION WORKSPACE (SIDEBAR + CONTENT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sommaire / Chapters Navigation (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[28px] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Sommaire & Chapitres
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold">
                {filteredSections.length} chapitres
              </span>
            </div>

            {filteredSections.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-zinc-500 text-xs">
                Aucun chapitre ne correspond à votre recherche "{searchQuery}".
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-260px)] overflow-y-auto pr-1 scrollbar-thin">
                {(Object.entries(groupedSections) as [string, DocSection[]][]).map(([groupTitle, sections]) => (
                  <div key={groupTitle} className="space-y-1.5">
                    <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 font-mono px-2 pt-1">
                      {groupTitle}
                    </p>
                    {sections.map((sec) => {
                      const isSelected = sec.id === currentSection.id;
                      const IconComp = sec.icon;

                      return (
                        <button
                          key={sec.id}
                          onClick={() => setActiveSectionId(sec.id)}
                          className={`w-full text-left flex items-center gap-3 p-2.5 rounded-2xl transition-all text-xs font-semibold group ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-xs dark:bg-zinc-900 dark:text-white dark:border-zinc-700'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/50 border border-transparent'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                              isSelected
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 group-hover:scale-105'
                            }`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-bold leading-snug">{sec.title}</p>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-500 truncate">
                              {sec.shortDesc}
                            </p>
                          </div>
                          {sec.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
                              {sec.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Comprehensive Chapter Detail (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentSection && (
            <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-xs space-y-8 animate-in fade-in duration-200">
              {/* Chapter Header */}
              <div className="pb-6 border-b border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-mono">
                      {currentSection.categoryTitle}
                    </span>
                    {currentSection.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                        {currentSection.badge}
                      </span>
                    )}
                  </div>

                  {/* Action buttons: direct access & copy */}
                  <div className="flex items-center gap-2">
                    {currentSection.tabId && onNavigateToTab && (
                      <button
                        onClick={() => onNavigateToTab(currentSection.tabId!)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <span>Ouvrir ce Module</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <currentSection.icon className={`w-6 h-6 ${currentSection.accentColor}`} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {currentSection.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                      {currentSection.shortDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Vue d'ensemble & Objectifs Métiers */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Info className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Présentation Générale & Objectifs Métiers
                  </h3>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-900/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  {currentSection.content.overview}
                </div>
              </div>

              {/* 2. Fonctionnalités Clés & Capacités Télématiques */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Capacités Clés du Module
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentSection.content.keyFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 text-xs sm:text-sm text-slate-800 dark:text-zinc-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Mode Opératoire Pas-à-Pas (Comment utiliser) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Guide Pas-à-Pas d'Utilisation
                  </h3>
                </div>
                <div className="space-y-3">
                  {currentSection.content.howToUse.map((stepItem, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {stepItem.step}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 pl-8 leading-relaxed">
                        {stepItem.instruction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Télémesures & Métriques Associées (si applicables) */}
              {currentSection.content.telemetryMetrics && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Gauge className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      Métriques Télématiques Captées
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentSection.content.telemetryMetrics.map((met, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>{met}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Conseils d'Experts & Bonnes Pratiques */}
              {currentSection.content.proTip && (
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-300 space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>Conseil d'Expert (Pro-Tip)</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                    {currentSection.content.proTip}
                  </p>
                </div>
              )}

              {/* 6. Mises en Garde & Sécurité Critique */}
              {currentSection.content.safetyAndSecurity && (
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-300 space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Sécurité & Règlements d'Exploitation</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-rose-800 dark:text-rose-200">
                    {currentSection.content.safetyAndSecurity}
                  </p>
                </div>
              )}

              {/* Chapter Footer Navigation */}
              <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Audience cible : {currentSection.targetAudience.join(', ')}</span>
                </div>

                {currentSection.tabId && onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab(currentSection.tabId!)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <span>Lancer le Module ({currentSection.title})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
