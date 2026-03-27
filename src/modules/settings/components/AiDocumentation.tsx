import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Bot,
  Sparkles,
  MessageSquare,
  Database,
  Code,
  Globe,
  Zap,
  Search,
  Clock,
  BarChart3,
  Users,
  FileText,
  Settings,
  Mic,
  Volume2,
  AtSign,
  Slash,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Network,
  Activity,
  Map,
  Share2,
  UserPlus,
  Calendar
} from "lucide-react";

interface AiDocumentationProps {
  language: 'en' | 'fr';
}

const aiDocumentation = {
  en: {
    title: "AI Assistant Documentation",
    subtitle: "Complete guide to the AI-powered assistant features in FlowService",

    overview: {
      title: "AI Assistant Overview",
      description: "FlowService includes an intelligent AI assistant that helps users navigate the application, answer questions about features, create tasks, and fetch real-time business data. The assistant is context-aware and supports both English and French.",

      features: [
        { name: "Natural Language Queries", description: "Ask questions in natural language about your business data" },
        { name: "Context Awareness", description: "Assistant knows which page you're on and provides relevant suggestions" },
        { name: "Real-time Data Fetching", description: "Query live data from offers, sales, contacts, dispatches, and more" },
        { name: "Task Creation", description: "Create tasks directly from chat using natural language" },
        { name: "Entity Creation", description: "Create contacts, installations, and articles via slash commands" },
        { name: "Voice Input", description: "Speak your questions using built-in speech recognition" },
        { name: "Text-to-Speech", description: "Listen to AI responses with text-to-speech support" },
        { name: "User Mentions", description: "Mention team members with @username in messages" },
        { name: "Conversation History", description: "Access and continue previous conversations" },
        { name: "Bilingual Support", description: "Full support for English and French interactions" }
      ]
    },

    architecture: {
      title: "Technical Architecture",
      diagram: `┌─────────────────────────────────────────────────────────────────┐
│                    AI ASSISTANT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    FRONTEND (React)                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │ AiAssistant  │  │   Voice      │  │  Slash Commands   │  │ │
│  │  │   Sidebar    │  │   Input      │  │  & Mentions       │  │ │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   AI SERVICE LAYER                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │ aiAssistant  │  │  aiData      │  │  contextAwareness │  │ │
│  │  │  Service     │  │  Service     │  │     Service       │  │ │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌──────────────────────────┼──────────────────────────────────┐ │
│  │                          ▼                                   │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │  OpenRouter  │  │  FlowService │  │  Knowledge Base   │  │ │
│  │  │    API       │  │   Backend    │  │  (Context File)   │  │ │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │ │
│  │                    EXTERNAL SERVICES                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘`,
      components: [
        {
          name: "AiAssistantSidebar",
          path: "src/components/ai-assistant/AiAssistantSidebar.tsx",
          description: "Main sidebar component with chat interface, voice controls, and slash commands"
        },
        {
          name: "aiAssistantService",
          path: "src/services/ai/aiAssistantService.ts",
          description: "Handles streaming communication with OpenRouter API"
        },
        {
          name: "aiDataService",
          path: "src/services/ai/aiDataService.ts",
          description: "Fetches real-time data from backend APIs for AI responses"
        },
        {
          name: "contextAwareness",
          path: "src/services/ai/contextAwareness.ts",
          description: "Provides page context and suggestions based on current route"
        },
        {
          name: "ai-assistant-context",
          path: "src/config/ai-assistant-context.ts",
          description: "Knowledge base with complete app documentation for AI responses"
        }
      ]
    },

    dataQueries: {
      title: "Available Data Queries",
      description: "The AI can fetch real-time data using natural language. Here are all supported query types:",
      categories: [
        {
          name: "Business Overview",
          queries: [
            { trigger: "show me stats / give me summary", function: "getDashboardSummary", description: "Complete overview of all modules" },
            { trigger: "weekly performance / this week", function: "getWeeklyPerformance", description: "Weekly KPI summary with sales, offers, dispatches" },
            { trigger: "recent activity / what happened", function: "getRecentActivity", description: "Activity feed across all modules" }
          ]
        },
        {
          name: "Sales & Offers",
          queries: [
            { trigger: "how many offers / offers stats", function: "getOffersStats", description: "Offer count by status with total value" },
            { trigger: "how many sales / sales stats", function: "getSalesStats", description: "Sales count by status with revenue" },
            { trigger: "conversion rate / win rate", function: "getConversionRate", description: "Offer-to-sale conversion analysis" },
            { trigger: "sales pipeline / pipeline value", function: "getPipelineValue", description: "Pipeline breakdown with weighted forecast" },
            { trigger: "revenue trends / monthly revenue", function: "getMonthlyRevenueTrends", description: "6-month revenue trend analysis" }
          ]
        },
        {
          name: "Contacts & Customers",
          queries: [
            { trigger: "how many contacts / customers count", function: "getContactsCount", description: "Total contact count" },
            { trigger: "customer stats / top customers", function: "getCustomerStats", description: "Customer breakdown and top revenue generators" }
          ]
        },
        {
          name: "Field Operations",
          queries: [
            { trigger: "service orders / work orders", function: "getServiceOrdersStats", description: "Service order status breakdown" },
            { trigger: "how many dispatches / dispatch stats", function: "getDispatchesStats", description: "Dispatch overview by status and priority" },
            { trigger: "today dispatches / scheduled today", function: "getTodaysDispatches", description: "Today's scheduled dispatches" },
            { trigger: "technician workload / who is busy", function: "getTechnicianWorkload", description: "Weekly workload distribution by technician" },
            { trigger: "top technicians / best performer", function: "getTopTechnicians", description: "Technician performance ranking" }
          ]
        },
        {
          name: "Team & Availability",
          queries: [
            { trigger: "who is working / team availability", function: "getTechniciansNotWorkingToday", description: "Team availability status for today" },
            { trigger: "is @name working today", function: "checkUserWorkingToday", description: "Check specific user's availability" },
            { trigger: "how many users / team size", function: "getUsersStats", description: "User and technician counts" }
          ]
        },
        {
          name: "Inventory & Installations",
          queries: [
            { trigger: "how many articles / inventory", function: "getArticlesCount", description: "Article breakdown by type" },
            { trigger: "low stock / stock alert", function: "getLowStockAlerts", description: "Items that need reordering" },
            { trigger: "installations / equipment", function: "getInstallationsStats", description: "Installation stats by status and category" },
            { trigger: "expiring warranty / warranty status", function: "getExpiringWarranties", description: "Warranty expiration tracking" },
            { trigger: "upcoming maintenance / maintenance due", function: "getUpcomingMaintenance", description: "Preventive maintenance schedule" }
          ]
        },
        {
          name: "Tasks & Projects",
          queries: [
            { trigger: "my tasks today / what should I do", function: "getTodaysTasks", description: "Today's tasks grouped by priority" },
            { trigger: "all my tasks / pending tasks", function: "getAllDailyTasks", description: "Complete task list across dates" },
            { trigger: "overdue / late tasks", function: "getOverdueTasks", description: "Tasks past their due date" },
            { trigger: "urgent / priority items", function: "getUrgentItems", description: "High priority items needing attention" },
            { trigger: "projects overview / active projects", function: "getProjectsStats", description: "Project status breakdown" }
          ]
        },
        {
          name: "Task Actions",
          queries: [
            { trigger: "mark [task] as done / complete [task]", function: "markTaskComplete", description: "Mark a specific task as complete" }
          ]
        }
      ]
    },

    contextAwareness: {
      title: "Context Awareness System",
      description: "The AI assistant is aware of the user's current page and provides relevant suggestions and context-specific help.",
      pages: [
        { route: "/dashboard", context: "Main dashboard - KPIs, revenue charts, recent activity" },
        { route: "/dashboard/contacts", context: "Customer management - create, edit, tag contacts" },
        { route: "/dashboard/offers", context: "Quotes and proposals with discount and tax support" },
        { route: "/dashboard/sales", context: "Sales pipeline with stage tracking" },
        { route: "/field/service-orders", context: "Work orders with jobs and materials" },
        { route: "/field/dispatcher", context: "Visual scheduling board for job assignment" },
        { route: "/field/dispatches", context: "Technician assignments with time/expense tracking" },
        { route: "/field/installations", context: "Equipment tracking with warranty management" },
        { route: "/dashboard/tasks", context: "Task management with priorities and assignments" },
        { route: "/dashboard/settings", context: "System configuration and preferences" }
      ]
    },

    slashCommands: {
      title: "Slash Commands",
      description: "Type / in the chat to access quick commands for navigation and entity creation.",
      commands: [
        { command: "/task", description: "Create a new task from the chat" },
        { command: "/newcontact", description: "Open inline contact creation form" },
        { command: "/newinstallation", description: "Open inline installation creation form" },
        { command: "/newarticle", description: "Open inline article creation form" },
        { command: "/calendar", description: "Navigate to calendar view" },
        { command: "/contacts", description: "Navigate to contacts page" },
        { command: "/installations", description: "Navigate to installations page" },
        { command: "/articles", description: "Navigate to articles catalog" }
      ]
    },

    knowledgeBase: {
      title: "Knowledge Base",
      description: "The AI has comprehensive knowledge about all FlowService features including:",
      topics: [
        "Complete Offer lifecycle (Created → Sent → Negotiation → Accepted/Rejected/Expired)",
        "Sale Order lifecycle with automatic behaviors",
        "Service Order workflow and job management",
        "Dispatch lifecycle with all 7 status stages",
        "Discount calculations (percentage and fixed amount)",
        "Tax (TVA) calculations and invoice generation",
        "Preventive maintenance scheduling",
        "Warranty tracking and alerts",
        "Time entry types and expense management",
        "PDF document customization options",
        "User roles and permissions (RBAC)",
        "Multi-language support (EN/FR)",
        "All navigation routes and page descriptions",
        "Map-based visualization of jobs and installations",
        "Public form sharing and submissions",
        "AI data query patterns (80+ queries)"
      ]
    },

    mapFeatures: {
      title: "Map Features",
      description: "Interactive map views for visualizing jobs, technicians, and installations.",
      views: [
        {
          name: "Dispatcher Map",
          route: "/field/dispatcher (Map tab)",
          features: [
            "Visual display of all jobs with location data",
            "Color-coded markers by priority (Red=Urgent, Yellow=In Progress, Green=Completed, Blue=Normal)",
            "Click markers to view job details",
            "Shows technician assignments with initials",
            "Automatic map centering based on job locations",
            "Dark/light theme support"
          ]
        },
        {
          name: "Installation Map",
          route: "/field/installations",
          features: [
            "View all installations on a map",
            "Filter by customer, status, or category",
            "Click to edit or view installation details"
          ]
        },
        {
          name: "Contact Map",
          route: "/dashboard/contacts (Map view)",
          features: [
            "Display contacts with addresses on map",
            "Quick navigation to customer locations"
          ]
        }
      ],
      technology: {
        library: "Leaflet (open-source)",
        tiles: "OpenStreetMap (free, no API key)",
        features: ["Responsive design", "Marker clustering", "Dark mode support"]
      }
    },

    publicForms: {
      title: "Public Forms & Sharing",
      description: "Share forms externally without requiring login. Collect responses from customers, partners, or anyone with the link.",
      features: [
        "No login required for submitters",
        "Theme support (dark/light mode)",
        "Language toggle (EN/FR)",
        "Submitter info capture (optional name/email)",
        "Customizable Thank You page",
        "Conditional messages based on answers",
        "Optional redirect to external URL"
      ],
      howTo: [
        "Form must be in 'Released' (Active) status",
        "Click the globe/share icon or menu → 'Make Public'",
        "System generates unique public URL slug",
        "Share the URL: /public/forms/{slug}"
      ],
      thankYouRules: {
        title: "Thank You Page Rules",
        description: "Create conditional messages based on form answers",
        examples: [
          "Show 'Excellent!' if rating > 4",
          "Show 'We'll improve' if rating < 3",
          "Redirect to referral page if satisfied"
        ]
      }
    },

    dispatchAssignment: {
      title: "Dispatch Assignment via AI",
      description: "Use natural language to assign dispatches to technicians.",
      commands: [
        { trigger: "assign dispatch DISP-001 to Ahmed", action: "Opens assignment preview" },
        { trigger: "assign DISP-001 to Ahmed at 9:00", action: "Assigns with specific time" },
        { trigger: "confirm assign DISP-001 to Ahmed at 9:00", action: "Executes assignment" },
        { trigger: "who should I assign DISP-001 to", action: "Suggests best technician" },
        { trigger: "who is available for DISP-001", action: "Shows available technicians" }
      ],
      smartFeatures: [
        "Checks technician availability (leave, day off, workload)",
        "Suggests best time slot based on existing schedule",
        "Warns if technician is overloaded",
        "Provides preview before execution",
        "Requires confirmation for actual assignment"
      ]
    },

    voiceFeatures: {
      title: "Voice Features",
      description: "The assistant supports both speech input and text-to-speech output.",
      input: {
        title: "Voice Input (Speech-to-Text)",
        features: [
          "Click microphone button to start voice input",
          "Supports English (en-US) and French (fr-FR) based on app language",
          "Real-time transcription displayed in input field",
          "Automatically stops when silence detected",
          "Works in all modern browsers with WebSpeech API support"
        ]
      },
      output: {
        title: "Text-to-Speech Output",
        features: [
          "Click speaker icon on any AI response to hear it",
          "Adapts voice language based on detected response language",
          "Click again to stop playback",
          "Uses browser's built-in speech synthesis"
        ]
      }
    },

    apiIntegration: {
      title: "API Integration",
      description: "How the AI service connects to external AI providers.",
      details: {
        provider: "OpenRouter",
        model: "tngtech/deepseek-r1t-chimera:free",
        features: [
          "Streaming responses for real-time display",
          "Multiple API key fallback for reliability",
          "Automatic language detection (EN/FR)",
          "Rate limiting with user-friendly messages",
          "Error handling with graceful degradation"
        ],
        configuration: `// API Configuration (aiAssistantService.ts)
const OPENROUTER_CONFIG = {
  apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  primaryModel: 'tngtech/deepseek-r1t-chimera:free',
  siteName: 'FlowService',
  siteUrl: window.location.origin
};`
      }
    },

    conversationHistory: {
      title: "Conversation History",
      description: "The assistant stores conversation history for continuity and reference.",
      features: [
        "Conversations stored via backend API (/api/AiChat)",
        "Automatic title generation from first message",
        "Pin important conversations for quick access",
        "Archive old conversations",
        "Delete individual or all conversations",
        "Search through conversation history",
        "Continue previous conversations seamlessly"
      ],
      api: {
        endpoints: [
          { method: "GET", path: "/api/AiChat/conversations", description: "List all conversations with pagination" },
          { method: "GET", path: "/api/AiChat/conversations/{id}", description: "Get conversation with messages" },
          { method: "POST", path: "/api/AiChat/conversations", description: "Create new conversation" },
          { method: "PATCH", path: "/api/AiChat/conversations/{id}", description: "Rename conversation" },
          { method: "DELETE", path: "/api/AiChat/conversations/{id}", description: "Delete conversation" },
          { method: "POST", path: "/api/AiChat/messages", description: "Add message to conversation" }
        ]
      }
    },

    entityCreation: {
      title: "Entity Creation from Chat",
      description: "Create business entities directly within the chat interface using inline forms or natural language.",
      entities: [
        {
          type: "Contact",
          fields: ["firstName", "lastName", "email", "phone", "company", "position", "address"],
          slashCommand: "/newcontact"
        },
        {
          type: "Installation",
          fields: ["name", "serialNumber", "model", "contactId", "location", "warrantyEnd"],
          slashCommand: "/newinstallation"
        },
        {
          type: "Article",
          fields: ["name", "type (material/service)", "reference", "price", "sellPrice", "stock"],
          slashCommand: "/newarticle"
        },
        {
          type: "Task",
          fields: ["title", "description", "priority", "dueDate"],
          trigger: "Natural language: 'create task to...'"
        }
      ],
      services: [
        { name: "aiEntityCreationService", path: "src/services/ai/aiEntityCreationService.ts" },
        { name: "aiTaskCreationService", path: "src/services/ai/aiTaskCreationService.ts" }
      ]
    },

    boundaries: {
      title: "AI Boundaries & Restrictions",
      description: "The AI is configured with strict boundaries to stay focused on FlowService functionality.",
      restrictions: [
        "Only answers questions about FlowService application",
        "Will not answer general knowledge questions",
        "Will not help with coding or programming problems",
        "Will not write creative content or stories",
        "Will not discuss news, politics, or entertainment",
        "Declines to bypass restrictions with polite redirects",
        "Handles spam and abuse with standard responses"
      ],
      offTopicResponse: "I'm FlowService's assistant and can only help with questions about this application. How can I help you with FlowService today?"
    },

    addingFeatures: {
      title: "How to Extend AI Features",
      description: "Guide for developers to add new AI capabilities.",
      steps: [
        {
          title: "Adding a New Data Query",
          code: `// 1. Add query function to aiDataService.ts
async getNewDataType(): Promise<DataQueryResult> {
  try {
    const response = await yourApi.getData();
    return {
      success: true,
      data: \`📊 **Data Overview**:\\n- Count: **\${response.count}**\`
    };
  } catch (error) {
    return { success: false, data: '', error: 'Could not fetch data' };
  }
}

// 2. Add pattern to DATA_QUERY_PATTERNS array
{ patterns: ['trigger phrase', 'autre phrase'], query: 'getNewDataType' }`
        },
        {
          title: "Adding Page Context",
          code: `// Add to routeContextMap in contextAwareness.ts
'/your/route': {
  pageName: 'Your Page',
  pageDescription: 'Description of what this page does',
  suggestions: [
    'Helpful question 1?',
    'Helpful question 2?'
  ]
}`
        },
        {
          title: "Adding Knowledge",
          code: `// Add documentation to APP_DOCUMENTATION in ai-assistant-context.ts
// Follow existing format with markdown headers and sections

### New Feature Section
**What it is**: Description of the feature
**How to use**:
1. Step one
2. Step two
**Status options**: List of possible statuses`
        }
      ]
    }
  },

  fr: {
    title: "Documentation de l'Assistant IA",
    subtitle: "Guide complet des fonctionnalités de l'assistant IA dans FlowService",

    overview: {
      title: "Vue d'ensemble de l'Assistant IA",
      description: "FlowService inclut un assistant IA intelligent qui aide les utilisateurs à naviguer dans l'application, répondre aux questions sur les fonctionnalités, créer des tâches et récupérer des données métier en temps réel. L'assistant est conscient du contexte et supporte l'anglais et le français.",

      features: [
        { name: "Requêtes en Langage Naturel", description: "Posez des questions en langage naturel sur vos données métier" },
        { name: "Conscience du Contexte", description: "L'assistant sait sur quelle page vous êtes et fournit des suggestions pertinentes" },
        { name: "Récupération de Données en Temps Réel", description: "Interrogez les données en direct des offres, ventes, contacts, dispatches, etc." },
        { name: "Création de Tâches", description: "Créez des tâches directement depuis le chat en langage naturel" },
        { name: "Création d'Entités", description: "Créez des contacts, installations et articles via les commandes slash" },
        { name: "Entrée Vocale", description: "Parlez vos questions grâce à la reconnaissance vocale intégrée" },
        { name: "Synthèse Vocale", description: "Écoutez les réponses IA avec le support text-to-speech" },
        { name: "Mentions Utilisateurs", description: "Mentionnez les membres de l'équipe avec @nomutilisateur" },
        { name: "Historique des Conversations", description: "Accédez et continuez les conversations précédentes" },
        { name: "Support Bilingue", description: "Support complet pour les interactions en anglais et français" }
      ]
    },

    architecture: {
      title: "Architecture Technique",
      diagram: `┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE ASSISTANT IA                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    FRONTEND (React)                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │ AiAssistant  │  │   Entrée     │  │  Commandes Slash  │  │ │
│  │  │   Sidebar    │  │   Vocale     │  │   & Mentions      │  │ │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   COUCHE SERVICES IA                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │ aiAssistant  │  │  aiData      │  │  contextAwareness │  │ │
│  │  │  Service     │  │  Service     │  │     Service       │  │ │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌──────────────────────────┼──────────────────────────────────┐ │
│  │                          ▼                                   │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │  OpenRouter  │  │  FlowService │  │  Base de          │  │ │
│  │  │    API       │  │   Backend    │  │  Connaissances    │  │ │
│  │  └──────────────┘  └──────────────┘  └───────────────────┘  │ │
│  │                    SERVICES EXTERNES                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘`,
      components: [
        {
          name: "AiAssistantSidebar",
          path: "src/components/ai-assistant/AiAssistantSidebar.tsx",
          description: "Composant principal avec interface chat, contrôles vocaux et commandes slash"
        },
        {
          name: "aiAssistantService",
          path: "src/services/ai/aiAssistantService.ts",
          description: "Gère la communication streaming avec l'API OpenRouter"
        },
        {
          name: "aiDataService",
          path: "src/services/ai/aiDataService.ts",
          description: "Récupère les données en temps réel depuis les APIs backend"
        },
        {
          name: "contextAwareness",
          path: "src/services/ai/contextAwareness.ts",
          description: "Fournit le contexte de page et suggestions basées sur la route actuelle"
        },
        {
          name: "ai-assistant-context",
          path: "src/config/ai-assistant-context.ts",
          description: "Base de connaissances avec documentation complète de l'app"
        }
      ]
    },

    dataQueries: {
      title: "Requêtes de Données Disponibles",
      description: "L'IA peut récupérer des données en temps réel en langage naturel. Voici tous les types de requêtes supportés:",
      categories: [
        {
          name: "Vue d'Ensemble Métier",
          queries: [
            { trigger: "donne-moi des stats / résumé", function: "getDashboardSummary", description: "Vue complète de tous les modules" },
            { trigger: "performance semaine / cette semaine", function: "getWeeklyPerformance", description: "Résumé KPI hebdomadaire" },
            { trigger: "activité récente / que s'est-il passé", function: "getRecentActivity", description: "Fil d'activité tous modules" }
          ]
        },
        {
          name: "Ventes & Offres",
          queries: [
            { trigger: "combien d'offres / stats offres", function: "getOffersStats", description: "Compte des offres par statut" },
            { trigger: "combien de ventes / stats ventes", function: "getSalesStats", description: "Compte des ventes avec revenus" },
            { trigger: "taux de conversion", function: "getConversionRate", description: "Analyse conversion offre-vente" },
            { trigger: "pipeline / prévisions", function: "getPipelineValue", description: "Répartition pipeline avec forecast" },
            { trigger: "tendances revenus / chiffre d'affaires", function: "getMonthlyRevenueTrends", description: "Analyse tendances sur 6 mois" }
          ]
        }
      ]
    },

    contextAwareness: {
      title: "Système de Conscience du Contexte",
      description: "L'assistant IA est conscient de la page actuelle de l'utilisateur et fournit des suggestions pertinentes.",
      pages: [
        { route: "/dashboard", context: "Tableau de bord principal - KPIs, graphiques revenus, activité récente" },
        { route: "/dashboard/contacts", context: "Gestion clients - créer, modifier, taguer les contacts" },
        { route: "/dashboard/offers", context: "Devis et propositions avec remises et taxes" },
        { route: "/dashboard/sales", context: "Pipeline de ventes avec suivi des étapes" },
        { route: "/field/service-orders", context: "Ordres de service avec travaux et matériaux" },
        { route: "/field/dispatcher", context: "Tableau de planification visuel pour assignation des travaux" },
        { route: "/field/dispatches", context: "Assignations techniciens avec suivi temps/dépenses" },
        { route: "/field/installations", context: "Suivi équipements avec gestion garantie" },
        { route: "/dashboard/tasks", context: "Gestion des tâches avec priorités et assignations" },
        { route: "/dashboard/settings", context: "Configuration système et préférences" }
      ]
    },

    slashCommands: {
      title: "Commandes Slash",
      description: "Tapez / dans le chat pour accéder aux commandes rapides de navigation et création d'entités.",
      commands: [
        { command: "/task", description: "Créer une nouvelle tâche depuis le chat" },
        { command: "/newcontact", description: "Ouvrir le formulaire de création de contact" },
        { command: "/newinstallation", description: "Ouvrir le formulaire de création d'installation" },
        { command: "/newarticle", description: "Ouvrir le formulaire de création d'article" },
        { command: "/calendar", description: "Naviguer vers le calendrier" },
        { command: "/contacts", description: "Naviguer vers la page contacts" },
        { command: "/installations", description: "Naviguer vers les installations" },
        { command: "/articles", description: "Naviguer vers le catalogue articles" }
      ]
    },

    knowledgeBase: {
      title: "Base de Connaissances",
      description: "L'IA a une connaissance complète de toutes les fonctionnalités FlowService incluant:",
      topics: [
        "Cycle de vie complet des Offres (Brouillon → Envoyé → Négociation → Accepté/Refusé/Expiré)",
        "Cycle de vie des Commandes de Vente avec comportements automatiques",
        "Workflow des Ordres de Service et gestion des travaux",
        "Cycle de vie des Dispatches avec les 7 statuts",
        "Calculs de remises (pourcentage et montant fixe)",
        "Calculs de taxes (TVA) et génération de factures",
        "Planification de maintenance préventive",
        "Suivi des garanties et alertes",
        "Types d'entrées de temps et gestion des dépenses",
        "Options de personnalisation des documents PDF",
        "Rôles et permissions utilisateurs (RBAC)",
        "Support multi-langues (EN/FR)",
        "Toutes les routes de navigation et descriptions de pages",
        "Visualisation cartographique des travaux et installations",
        "Partage de formulaires publics et soumissions",
        "Modèles de requêtes de données IA (80+ requêtes)"
      ]
    },

    mapFeatures: {
      title: "Fonctionnalités Carte",
      description: "Vues cartographiques interactives pour visualiser les travaux, techniciens et installations.",
      views: [
        {
          name: "Carte Répartiteur",
          route: "/field/dispatcher (onglet Carte)",
          features: [
            "Affichage visuel de tous les travaux avec données de localisation",
            "Marqueurs colorés par priorité (Rouge=Urgent, Jaune=En cours, Vert=Terminé, Bleu=Normal)",
            "Cliquer sur les marqueurs pour voir les détails du travail",
            "Affiche les affectations des techniciens avec initiales",
            "Centrage automatique basé sur les localisations des travaux",
            "Support thème clair/sombre"
          ]
        },
        {
          name: "Carte Installations",
          route: "/field/installations",
          features: [
            "Voir toutes les installations sur une carte",
            "Filtrer par client, statut ou catégorie",
            "Cliquer pour modifier ou voir les détails"
          ]
        },
        {
          name: "Carte Contacts",
          route: "/dashboard/contacts (vue Carte)",
          features: [
            "Afficher les contacts avec adresses sur la carte",
            "Navigation rapide vers les emplacements clients"
          ]
        }
      ],
      technology: {
        library: "Leaflet (open-source)",
        tiles: "OpenStreetMap (gratuit, pas de clé API)",
        features: ["Design responsive", "Regroupement de marqueurs", "Support mode sombre"]
      }
    },

    publicForms: {
      title: "Formulaires Publics & Partage",
      description: "Partagez des formulaires en externe sans connexion requise. Collectez des réponses de clients, partenaires ou toute personne avec le lien.",
      features: [
        "Pas de connexion requise pour les répondants",
        "Support du thème (mode clair/sombre)",
        "Changement de langue (EN/FR)",
        "Capture infos répondant (nom/email optionnel)",
        "Page de remerciement personnalisable",
        "Messages conditionnels basés sur les réponses",
        "Redirection optionnelle vers URL externe"
      ],
      howTo: [
        "Le formulaire doit être en statut 'Publié' (Actif)",
        "Cliquer sur l'icône globe/partage ou menu → 'Rendre Public'",
        "Le système génère un slug URL public unique",
        "Partager l'URL: /public/forms/{slug}"
      ],
      thankYouRules: {
        title: "Règles Page de Remerciement",
        description: "Créer des messages conditionnels basés sur les réponses",
        examples: [
          "Afficher 'Excellent!' si note > 4",
          "Afficher 'Nous allons améliorer' si note < 3",
          "Rediriger vers page parrainage si satisfait"
        ]
      }
    },

    dispatchAssignment: {
      title: "Affectation Dispatch via IA",
      description: "Utilisez le langage naturel pour affecter des dispatches aux techniciens.",
      commands: [
        { trigger: "affecter dispatch DISP-001 à Ahmed", action: "Ouvre aperçu affectation" },
        { trigger: "affecter DISP-001 à Ahmed à 9:00", action: "Affecte avec heure spécifique" },
        { trigger: "confirmer affectation DISP-001 à Ahmed à 9:00", action: "Exécute l'affectation" },
        { trigger: "à qui affecter DISP-001", action: "Suggère le meilleur technicien" },
        { trigger: "qui est disponible pour DISP-001", action: "Affiche techniciens disponibles" }
      ],
      smartFeatures: [
        "Vérifie la disponibilité du technicien (congé, jour de repos, charge)",
        "Suggère le meilleur créneau selon le planning existant",
        "Avertit si technicien surchargé",
        "Fournit aperçu avant exécution",
        "Requiert confirmation pour affectation réelle"
      ]
    },

    voiceFeatures: {
      title: "Fonctionnalités Vocales",
      description: "L'assistant supporte l'entrée vocale et la synthèse vocale.",
      input: {
        title: "Entrée Vocale (Speech-to-Text)",
        features: [
          "Cliquez sur le bouton microphone pour démarrer l'entrée vocale",
          "Supporte l'anglais (en-US) et le français (fr-FR) selon la langue de l'app",
          "Transcription en temps réel affichée dans le champ de saisie",
          "S'arrête automatiquement quand le silence est détecté",
          "Fonctionne dans tous les navigateurs modernes avec l'API WebSpeech"
        ]
      },
      output: {
        title: "Synthèse Vocale (Text-to-Speech)",
        features: [
          "Cliquez sur l'icône haut-parleur sur toute réponse IA pour l'écouter",
          "Adapte la langue de la voix selon la langue de la réponse détectée",
          "Cliquez à nouveau pour arrêter la lecture",
          "Utilise la synthèse vocale intégrée du navigateur"
        ]
      }
    },

    apiIntegration: {
      title: "Intégration API",
      description: "Comment le service IA se connecte aux fournisseurs IA externes.",
      details: {
        provider: "OpenRouter",
        model: "tngtech/deepseek-r1t-chimera:free",
        features: [
          "Réponses streaming pour affichage en temps réel",
          "Fallback avec plusieurs clés API pour fiabilité",
          "Détection automatique de langue (EN/FR)",
          "Limitation de débit avec messages conviviaux",
          "Gestion d'erreurs avec dégradation gracieuse"
        ],
        configuration: `// Configuration API (aiAssistantService.ts)
const OPENROUTER_CONFIG = {
  apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  primaryModel: 'tngtech/deepseek-r1t-chimera:free',
  siteName: 'FlowService',
  siteUrl: window.location.origin
};`
      }
    },

    conversationHistory: {
      title: "Historique des Conversations",
      description: "L'assistant stocke l'historique des conversations pour continuité et référence.",
      features: [
        "Conversations stockées via API backend (/api/AiChat)",
        "Génération automatique du titre depuis le premier message",
        "Épingler les conversations importantes pour accès rapide",
        "Archiver les anciennes conversations",
        "Supprimer conversations individuelles ou toutes",
        "Rechercher dans l'historique des conversations",
        "Continuer les conversations précédentes de façon fluide"
      ],
      api: {
        endpoints: [
          { method: "GET", path: "/api/AiChat/conversations", description: "Liste toutes les conversations avec pagination" },
          { method: "GET", path: "/api/AiChat/conversations/{id}", description: "Obtenir conversation avec messages" },
          { method: "POST", path: "/api/AiChat/conversations", description: "Créer nouvelle conversation" },
          { method: "PATCH", path: "/api/AiChat/conversations/{id}", description: "Renommer conversation" },
          { method: "DELETE", path: "/api/AiChat/conversations/{id}", description: "Supprimer conversation" },
          { method: "POST", path: "/api/AiChat/messages", description: "Ajouter message à conversation" }
        ]
      }
    },

    entityCreation: {
      title: "Création d'Entités depuis le Chat",
      description: "Créez des entités métier directement dans l'interface chat via des formulaires inline ou langage naturel.",
      entities: [
        {
          type: "Contact",
          fields: ["prénom", "nom", "email", "téléphone", "entreprise", "poste", "adresse"],
          slashCommand: "/newcontact"
        },
        {
          type: "Installation",
          fields: ["nom", "numSérie", "modèle", "contactId", "emplacement", "finGarantie"],
          slashCommand: "/newinstallation"
        },
        {
          type: "Article",
          fields: ["nom", "type (matériel/service)", "référence", "prix", "prixVente", "stock"],
          slashCommand: "/newarticle"
        },
        {
          type: "Tâche",
          fields: ["titre", "description", "priorité", "dateÉchéance"],
          trigger: "Langage naturel: 'créer une tâche pour...'"
        }
      ],
      services: [
        { name: "aiEntityCreationService", path: "src/services/ai/aiEntityCreationService.ts" },
        { name: "aiTaskCreationService", path: "src/services/ai/aiTaskCreationService.ts" }
      ]
    },

    boundaries: {
      title: "Limites & Restrictions de l'IA",
      description: "L'IA est configurée avec des limites strictes pour rester focalisée sur les fonctionnalités FlowService.",
      restrictions: [
        "Répond uniquement aux questions sur l'application FlowService",
        "Ne répondra pas aux questions de culture générale",
        "Ne fera pas d'aide au codage ou programmation",
        "N'écrira pas de contenu créatif ou histoires",
        "Ne discutera pas d'actualités, politique ou divertissement",
        "Refuse de contourner les restrictions avec des redirections polies",
        "Gère le spam et abus avec des réponses standard"
      ],
      offTopicResponse: "Je suis l'assistant FlowService et ne peux aider qu'avec les questions sur cette application. Comment puis-je vous aider avec FlowService aujourd'hui?"
    },

    addingFeatures: {
      title: "Comment Étendre les Fonctionnalités IA",
      description: "Guide pour développeurs pour ajouter de nouvelles capacités IA.",
      steps: [
        {
          title: "Ajouter une Nouvelle Requête de Données",
          code: `// 1. Ajouter fonction de requête dans aiDataService.ts
async getNewDataType(): Promise<DataQueryResult> {
  try {
    const response = await yourApi.getData();
    return {
      success: true,
      data: \`📊 **Aperçu Données**:\\n- Compte: **\${response.count}**\`
    };
  } catch (error) {
    return { success: false, data: '', error: 'Impossible de récupérer les données' };
  }
}

// 2. Ajouter pattern au tableau DATA_QUERY_PATTERNS
{ patterns: ['phrase déclencheur', 'other phrase'], query: 'getNewDataType' }`
        },
        {
          title: "Ajouter Contexte de Page",
          code: `// Ajouter à routeContextMap dans contextAwareness.ts
'/votre/route': {
  pageName: 'Votre Page',
  pageDescription: 'Description de ce que fait cette page',
  suggestions: [
    'Question utile 1?',
    'Question utile 2?'
  ]
}`
        },
        {
          title: "Ajouter des Connaissances",
          code: `// Ajouter documentation à APP_DOCUMENTATION dans ai-assistant-context.ts
// Suivre le format existant avec headers markdown et sections

### Section Nouvelle Fonctionnalité
**Qu'est-ce que c'est**: Description de la fonctionnalité
**Comment utiliser**:
1. Étape une
2. Étape deux
**Options de statut**: Liste des statuts possibles`
        }
      ]
    }
  }
};

export function AiDocumentation({ language }: AiDocumentationProps) {
  const content = aiDocumentation[language];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Bot className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle>{content.overview.title}</CardTitle>
              <CardDescription className="mt-1">{content.overview.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {content.overview.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-sm">{feature.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            {content.architecture.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre">
            {content.architecture.diagram}
          </pre>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3 text-sm">{language === 'en' ? 'Components' : 'Composants'}</h4>
            <div className="space-y-2">
              {content.architecture.components.map((comp, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{comp.name}</Badge>
                  </div>
                  <code className="text-xs text-primary mt-1 block">{comp.path}</code>
                  <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {content.dataQueries.title}
          </CardTitle>
          <CardDescription>{content.dataQueries.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {content.dataQueries.categories.map((category, catIndex) => (
              <AccordionItem key={catIndex} value={`query-${catIndex}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category.queries.length}</Badge>
                    {category.name}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {category.queries.map((query, qIndex) => (
                      <div key={qIndex} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {query.trigger}
                            </code>
                            <p className="text-xs text-muted-foreground mt-1">{query.description}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {query.function}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Slash Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Slash className="h-5 w-5" />
            {content.slashCommands.title}
          </CardTitle>
          <CardDescription>{content.slashCommands.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {content.slashCommands.commands.map((cmd, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <code className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                  {cmd.command}
                </code>
                <span className="text-sm text-muted-foreground">{cmd.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Context Awareness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {content.contextAwareness.title}
          </CardTitle>
          <CardDescription>{content.contextAwareness.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {content.contextAwareness.pages.map((page, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                <code className="text-xs bg-muted px-2 py-1 rounded shrink-0">{page.route}</code>
                <span className="text-sm text-muted-foreground">{page.context}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {content.knowledgeBase.title}
          </CardTitle>
          <CardDescription>{content.knowledgeBase.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2">
            {content.knowledgeBase.topics.map((topic, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{topic}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Map Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            {content.mapFeatures.title}
          </CardTitle>
          <CardDescription>{content.mapFeatures.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.mapFeatures.views.map((view, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{view.name}</Badge>
                <code className="text-xs text-muted-foreground">{view.route}</code>
              </div>
              <ul className="space-y-1">
                {view.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-success mt-1 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">{language === 'en' ? 'Technology' : 'Technologie'}</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{content.mapFeatures.technology.library}</Badge>
              <Badge variant="outline">{content.mapFeatures.technology.tiles}</Badge>
              {content.mapFeatures.technology.features.map((f, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Forms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-success" />
            {content.publicForms.title}
          </CardTitle>
          <CardDescription>{content.publicForms.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            {content.publicForms.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">{language === 'en' ? 'How to Make a Form Public' : 'Comment Rendre un Formulaire Public'}</h4>
            <ol className="space-y-1">
              {content.publicForms.howTo.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="shrink-0 text-xs">{i + 1}</Badge>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <Separator />

          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <h5 className="font-semibold text-sm mb-2">{content.publicForms.thankYouRules.title}</h5>
            <p className="text-xs text-muted-foreground mb-2">{content.publicForms.thankYouRules.description}</p>
            <ul className="space-y-1">
              {content.publicForms.thankYouRules.examples.map((ex, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Lightbulb className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dispatch Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {content.dispatchAssignment.title}
          </CardTitle>
          <CardDescription>{content.dispatchAssignment.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {content.dispatchAssignment.commands.map((cmd, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded shrink-0">
                  {cmd.trigger}
                </code>
                <span className="text-sm text-muted-foreground">{cmd.action}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">{language === 'en' ? 'Smart Features' : 'Fonctionnalités Intelligentes'}</h4>
            <ul className="space-y-1">
              {content.dispatchAssignment.smartFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Zap className="h-3 w-3 text-warning mt-1 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Voice Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            {content.voiceFeatures.title}
          </CardTitle>
          <CardDescription>{content.voiceFeatures.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <Mic className="h-4 w-4" />
              {content.voiceFeatures.input.title}
            </h4>
            <ul className="space-y-1">
              {content.voiceFeatures.input.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-success mt-1 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4" />
              {content.voiceFeatures.output.title}
            </h4>
            <ul className="space-y-1">
              {content.voiceFeatures.output.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-success mt-1 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* API Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            {content.apiIntegration.title}
          </CardTitle>
          <CardDescription>{content.apiIntegration.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{language === 'en' ? 'Provider' : 'Fournisseur'}: {content.apiIntegration.details.provider}</Badge>
            <Badge variant="secondary">{language === 'en' ? 'Model' : 'Modèle'}: {content.apiIntegration.details.model}</Badge>
          </div>

          <ul className="space-y-1">
            {content.apiIntegration.details.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Zap className="h-3 w-3 text-warning mt-1 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre">
            {content.apiIntegration.details.configuration}
          </pre>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {content.conversationHistory.title}
          </CardTitle>
          <CardDescription>{content.conversationHistory.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-1">
            {content.conversationHistory.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-success mt-1 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">{language === 'en' ? 'API Endpoints' : 'Endpoints API'}</h4>
            <div className="space-y-1">
              {content.conversationHistory.api.endpoints.map((ep, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge className={`w-14 justify-center ${ep.method === 'GET' ? 'bg-primary' :
                      ep.method === 'POST' ? 'bg-success' :
                        ep.method === 'PATCH' ? 'bg-warning' :
                          'bg-destructive'
                    }`}>
                    {ep.method}
                  </Badge>
                  <code className="text-primary">{ep.path}</code>
                  <span className="text-muted-foreground">- {ep.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {content.entityCreation.title}
          </CardTitle>
          <CardDescription>{content.entityCreation.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {content.entityCreation.entities.map((entity, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{entity.type}</Badge>
                  {entity.slashCommand && (
                    <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {entity.slashCommand}
                    </code>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {entity.fields.map((field, j) => (
                    <Badge key={j} variant="outline" className="text-xs">{field}</Badge>
                  ))}
                </div>
                {entity.trigger && (
                  <p className="text-xs text-muted-foreground mt-2">{entity.trigger}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Boundaries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {content.boundaries.title}
          </CardTitle>
          <CardDescription>{content.boundaries.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-1">
            {content.boundaries.restrictions.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-3 w-3 text-warning mt-1 shrink-0" />
                {r}
              </li>
            ))}
          </ul>

          <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
            <p className="text-sm text-foreground">
              <strong>{language === 'en' ? 'Off-topic response:' : 'Réponse hors-sujet:'}</strong><br />
              "{content.boundaries.offTopicResponse}"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Developer Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            {content.addingFeatures.title}
          </CardTitle>
          <CardDescription>{content.addingFeatures.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {content.addingFeatures.steps.map((step, i) => (
              <AccordionItem key={i} value={`step-${i}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{i + 1}</Badge>
                    {step.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre max-h-64 overflow-y-auto">
                    {step.code}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

export default AiDocumentation;
