// Core React imports
import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { getApiLanguageParameter } from "@/utils/language-utils"
import { API_ENDPOINTS, API_BASE_URL, LIBRARY_URL, buildApiUrl } from "@/config/api.config"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Custom Components
import { PageLayout } from "@/components/page-layout"
import { OfflineIndicator } from "@/components/offline-indicator"
import { LanguageSwitcher } from "@/components/language-switcher"
import FlashcardLearning from "@/components/flashcard-learning"
import { MindMapModal } from "@/components/mind-map-modal"
import { FiveWhysPresentation } from "@/components/five-whys-presentation"
import { LessonPlanGenerator } from "@/components/lesson-plan-generator"
import { LoadingOverlay } from "@/components/loading-overlay"
import { LanguagePersistenceTest } from "@/components/language-persistence-test"
import { ELIxModal } from "@/components/elix-modal"

// Icons
import {
  Search, BookOpen, Send, Sparkles, ArrowLeft, Star, Clock, FileText, Bot, User,
  Volume2, Copy, ExternalLink, Globe, Languages, Eye, Mic, Filter, Quote,
  ChevronDown, ChevronRight, ChevronUp, Play, Pause, RotateCcw, Bookmark, Share2,
  Download, Zap, Target, Brain, CreditCard, HelpCircle, MessageSquare, Lightbulb,
  BookmarkCheck, Calculator, PenTool, Repeat, MapPin, Clock3, BarChart3, Settings,
  GraduationCap, Menu, X, Ruler, Edit3, ChevronUp as ChevronUpIcon
} from "lucide-react"

// API Search Response Interface
interface ApiSearchResponse {
  id: string;
  search_result: ApiSearchResult[];
}

// API Search Result Interface
interface ApiSearchResult {
  link: string;
  score: number;
  title: string;
  bookTitle: string;
  wordCount: number;
  description: string | {
    b?: string[];
    "#text": string;
  };
}

// API Search Summary Response Interface
interface ApiSearchSummaryResponse {
  id: string;
  search_summary: {
    answer: string;
    sources: Array<{
      link: string;
      title: string;
    }>;
  };
}

// Transformed Search Result Interface for UI
interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  translatedSnippet?: string;
  source: string;
  confidence: number;
  readTime?: string;
  contentType?: string;
  lastUpdated?: string;
  imageUrl?: string;
  tags?: string[];
  relatedTopics?: string[];
  link: string;
}

// Mock search results with rich content
const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    title: "Kalkulus - Pengantar Matematika Lanjut",
    snippet: "Kalkulus adalah cabang matematika yang mempelajari perubahan dan akumulasi. Terdiri dari kalkulus diferensial (turunan) dan kalkulus integral...",
    translatedSnippet: "Calculus is a branch of mathematics that studies change and accumulation. It consists of differential calculus (derivatives) and integral calculus...",
    source: "Wikipedia Bahasa Indonesia",
    confidence: 98,
    readTime: "8 min read",
    contentType: "article",
    lastUpdated: "2 hari lalu",
    imageUrl: "/api/placeholder/300/200",
    tags: ["matematika", "kalkulus", "turunan", "integral"],
    relatedTopics: ["Limit", "Turunan", "Integral", "Fungsi"],
    link: "/content/wikipedia_id/Kalkulus"
  },
  {
    id: "2",
    title: "Introduction to Calculus - Khan Academy",
    snippet: "Learn the fundamentals of calculus including limits, derivatives, and integrals through interactive lessons and practice problems...",
    translatedSnippet: "Pelajari dasar-dasar kalkulus termasuk limit, turunan, dan integral melalui pelajaran interaktif dan soal latihan...",
    source: "Khan Academy Math",
    confidence: 94,
    readTime: "Video 12 min",
    contentType: "video",
    lastUpdated: "1 minggu lalu",
    imageUrl: "/api/placeholder/300/200",
    tags: ["calculus", "derivatives", "integrals", "mathematics"],
    relatedTopics: ["Functions", "Graphs", "Applications"],
    link: "/content/khan_academy/Calculus"
  },
  {
    id: "3",
    title: "Sejarah Perkembangan Kalkulus",
    snippet: "Kalkulus dikembangkan secara independen oleh Isaac Newton dan Gottfried Wilhelm Leibniz pada abad ke-17. Penemuan ini merevolusi matematika...",
    translatedSnippet: "Calculus was independently developed by Isaac Newton and Gottfried Wilhelm Leibniz in the 17th century. This discovery revolutionized mathematics...",
    source: "Project Gutenberg",
    confidence: 89,
    readTime: "15 min read",
    contentType: "article",
    lastUpdated: "3 hari lalu",
    imageUrl: "/api/placeholder/300/200",
    tags: ["sejarah", "newton", "leibniz", "matematika"],
    relatedTopics: ["Isaac Newton", "Leibniz", "Sejarah Matematika"],
    link: "/content/gutenberg/Sejarah_Kalkulus"
  }
]

// Trending searches using translation keys
const getTrendingSearches = (t: any) => [
  t('explorePage.trendingTopics.plantPhotosynthesis'),
  t('explorePage.trendingTopics.bloodCirculation'),
  t('explorePage.trendingTopics.indonesianIndependence'),
  t('explorePage.trendingTopics.quadraticEquations'),
  t('explorePage.trendingTopics.gravityPlanetaryMotion'),
  t('explorePage.trendingTopics.atomicStructure')
]

// Subject topics by category using translation keys
const getSubjectTopics = (t: any) => ({
  matematika: [
    t('explorePage.subjectCategories.mathematics.quadraticEquations'),
    t('explorePage.subjectCategories.mathematics.calculus'),
    t('explorePage.subjectCategories.mathematics.geometry'),
    t('explorePage.subjectCategories.mathematics.statistics'),
    t('explorePage.subjectCategories.mathematics.linearAlgebra'),
    t('explorePage.subjectCategories.mathematics.trigonometry'),
    t('explorePage.subjectCategories.mathematics.logarithms'),
    t('explorePage.subjectCategories.mathematics.matrices'),
    t('explorePage.subjectCategories.mathematics.functionLimits'),
    t('explorePage.subjectCategories.mathematics.integrals'),
    t('explorePage.subjectCategories.mathematics.differentials'),
    t('explorePage.subjectCategories.mathematics.probability')
  ],
  sains: [
    t('explorePage.subjectCategories.science.plantPhotosynthesis'),
    t('explorePage.subjectCategories.science.bloodCirculation'),
    t('explorePage.subjectCategories.science.evolution'),
    t('explorePage.subjectCategories.science.ecosystems'),
    t('explorePage.subjectCategories.science.genetics'),
    t('explorePage.subjectCategories.science.cellularRespiration'),
    t('explorePage.subjectCategories.science.nervousSystem'),
    t('explorePage.subjectCategories.science.mitosisMeiosis'),
    t('explorePage.subjectCategories.science.naturalSelection'),
    t('explorePage.subjectCategories.science.foodChain'),
    t('explorePage.subjectCategories.science.digestiveSystem'),
    t('explorePage.subjectCategories.science.hormones')
  ],
  sejarah: [
    t('explorePage.subjectCategories.history.indonesianIndependence'),
    t('explorePage.subjectCategories.history.worldWarII'),
    t('explorePage.subjectCategories.history.industrialRevolution'),
    t('explorePage.subjectCategories.history.majapahitKingdom'),
    t('explorePage.subjectCategories.history.reformation'),
    t('explorePage.subjectCategories.history.independenceProclamation'),
    t('explorePage.subjectCategories.history.diponegoroWar'),
    t('explorePage.subjectCategories.history.youthPledge'),
    t('explorePage.subjectCategories.history.asiaAfricaConference'),
    t('explorePage.subjectCategories.history.newOrder'),
    t('explorePage.subjectCategories.history.sriwijayaKingdom')
  ],
  geografi: [
    t('explorePage.subjectCategories.geography.tectonicPlates'),
    t('explorePage.subjectCategories.geography.tropicalClimate'),
    t('explorePage.subjectCategories.geography.topographicMaps'),
    t('explorePage.subjectCategories.geography.volcanoes'),
    t('explorePage.subjectCategories.geography.longestRivers'),
    t('explorePage.subjectCategories.geography.continentsOceans'),
    t('explorePage.subjectCategories.geography.weatherClimate'),
    t('explorePage.subjectCategories.geography.soilRocks'),
    t('explorePage.subjectCategories.geography.rainForests'),
    t('explorePage.subjectCategories.geography.populationDistribution'),
    t('explorePage.subjectCategories.geography.urbanization'),
    t('explorePage.subjectCategories.geography.globalization')
  ],
  fisika: [
    t('explorePage.subjectCategories.physics.gravityPlanetaryMotion'),
    t('explorePage.subjectCategories.physics.newtonsLaws'),
    t('explorePage.subjectCategories.physics.electromagneticWaves'),
    t('explorePage.subjectCategories.physics.relativity'),
    t('explorePage.subjectCategories.physics.quantumMechanics'),
    t('explorePage.subjectCategories.physics.kineticEnergy'),
    t('explorePage.subjectCategories.physics.momentum'),
    t('explorePage.subjectCategories.physics.thermodynamics'),
    t('explorePage.subjectCategories.physics.optics'),
    t('explorePage.subjectCategories.physics.electricityMagnetism'),
    t('explorePage.subjectCategories.physics.harmonicMotion'),
    t('explorePage.subjectCategories.physics.fluids')
  ],
  kimia: [
    t('explorePage.subjectCategories.chemistry.atomicStructure'),
    t('explorePage.subjectCategories.chemistry.chemicalBonds'),
    t('explorePage.subjectCategories.chemistry.redoxReactions'),
    t('explorePage.subjectCategories.chemistry.periodicTable'),
    t('explorePage.subjectCategories.chemistry.thermochemistry'),
    t('explorePage.subjectCategories.chemistry.acidsBases'),
    t('explorePage.subjectCategories.chemistry.electrolysis'),
    t('explorePage.subjectCategories.chemistry.chemicalEquilibrium'),
    t('explorePage.subjectCategories.chemistry.reactionRate'),
    t('explorePage.subjectCategories.chemistry.organicChemistry'),
    t('explorePage.subjectCategories.chemistry.stoichiometry'),
    t('explorePage.subjectCategories.chemistry.solutions')
  ]
})

// Quick suggestions using translation keys
const getQuickSuggestions = (t: any) => [
  { icon: "🧮", text: t('explore.subjects.mathematics'), category: "matematika" },
  { icon: "🔬", text: t('explore.subjects.science'), category: "sains" },
  { icon: "🏛️", text: t('explore.subjects.history'), category: "sejarah" },
  { icon: "🌍", text: t('explore.subjects.geography'), category: "geografi" },
  { icon: "💡", text: t('explore.subjects.physics'), category: "fisika" },
  { icon: "🧪", text: t('explore.subjects.chemistry'), category: "kimia" },
  { icon: "🎲", text: t('explore.subjects.random'), category: "random" }
]

const Explore = () => {
  const { t, i18n } = useTranslation()

  // Make i18n-based data reactive to language changes
  const trendingSearches = useMemo(() => getTrendingSearches(t), [t, i18n.language])
  const subjectTopics = useMemo(() => getSubjectTopics(t), [t, i18n.language])
  const quickSuggestions = useMemo(() => getQuickSuggestions(t), [t, i18n.language])

  // Search related state
  const [searchQuery, setSearchQuery] = useState("")
  const [executedSearchQuery, setExecutedSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedResult, setSelectedResult] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState(0)

  // Function to reset search when home or logo is clicked
  const resetSearch = () => {
    setSearchQuery("")
    setExecutedSearchQuery("")
    setSearchResults([])
    setSearchError(null)
    setSearchTime(0)
    setSelectedResult(null)
    
    // Clear search summary data
    setSearchSummaryData(null)
    setIsLoadingSearchSummary(false)
    setSearchSummaryError(null)
    setSummaryAccordionOpen("")
    
    // Reset flashcard state
    setShowFlashcards(false)
    setFlashcardKey(`flashcard-reset-${Date.now()}`)
    
    // Ensure the URL is reset when navigating via logo
    // This helps maintain consistent state for search functionality
    window.history.pushState({}, '', '/');
  }

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  // Use i18n.language instead of a separate state
  // Get full language name for API calls using the utility function
  const currentLanguage = getApiLanguageParameter(i18n.language)
  const [currentSearchId, setCurrentSearchId] = useState<string | number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFloatingSidebarOpen, setIsFloatingSidebarOpen] = useState(false)
  const [showFeatureMenu, setShowFeatureMenu] = useState<string | null>(null)
  const [showAISummary, setShowAISummary] = useState<string | null>(null)
  const [summariesData, setSummariesData] = useState<Record<string, string>>({})
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({})
  
  // Search summary state
  const [searchSummaryData, setSearchSummaryData] = useState<ApiSearchSummaryResponse | null>(null)
  const [isLoadingSearchSummary, setIsLoadingSearchSummary] = useState(false)
  const [searchSummaryError, setSearchSummaryError] = useState<string | null>(null)
  const [summaryAccordionOpen, setSummaryAccordionOpen] = useState<string>("")

  // Learning tools state
  const [activeTool, setActiveTool] = useState<string>("")
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [flashcardKey, setFlashcardKey] = useState<string>("initial")
  const [showMindMap, setShowMindMap] = useState(false)
  const [showFiveWhys, setShowFiveWhys] = useState(false)
  const [showLessonPlan, setShowLessonPlan] = useState(false)
  const [showELIx, setShowELIx] = useState(false)

  // Q&A mode state
  const [isQAMode, setIsQAMode] = useState(false)
  const [qaMessages, setQaMessages] = useState<Array<{ id: number, type: 'user' | 'ai', message: string, timestamp: Date }>>([])
  const [qaInput, setQaInput] = useState("")

  // Constants and utility functions
  const availableTools = [
    { name: "5 Whys", icon: Brain },
    { name: "Flashcards", icon: CreditCard },
    { name: "Quiz", icon: HelpCircle },
    { name: "Mind Map", icon: MapPin },
    { name: "Summary", icon: FileText },
    { name: "Simple", icon: Lightbulb },
    { name: "Practice", icon: PenTool },
    { name: "Timeline", icon: Clock3 },
    { name: "Solver", icon: Calculator }
  ]

  // Topic selection utilities
  const getDisplayedTopics = () => {
    if (selectedCategory === "all") {
      return trendingSearches
    } else if (selectedCategory === "random") {
      return Object.values(subjectTopics)
        .flat()
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)
    } else {
      return subjectTopics[selectedCategory as keyof typeof subjectTopics] || []
    }
  }

  const handleSubjectClick = (category: string) => {
    setSelectedCategory(category)
  }

  // Search functionality is now only triggered by form submission
  // No automatic search when typing

  // Function to transform API results to our UI format
  const transformApiResultsToUIFormat = (apiResults: ApiSearchResult[]): SearchResult[] => {
    return apiResults.map((result, index) => {
      // Extract description text, handling both string and object formats
      const descriptionText = typeof result.description === 'string'
        ? result.description
        : result.description["#text"] || '';
      
      // Format bolded text (if available) for UI presentation
      // const highlightedText = typeof result.description === 'object' && result.description.b
      //   ? result.description.b.join(', ')
      //   : '';
        
      return {
        id: result.link.replace(/[^\w]/g, '_'), // Use link as ID (sanitized)
        title: result.title,
        snippet: descriptionText,
        translatedSnippet: '', // API doesn't provide this directly
        source: result.bookTitle,
        confidence: Math.round(result.score * 100), // Convert score to percentage
        readTime: `${Math.ceil(result.wordCount / 200)} min read`, // Rough estimate based on word count
        contentType: "article",
        // tags: highlightedText.split(',').map(t => t.trim()).filter(t => t), // Create tags from bold text
        relatedTopics: [], // We don't have related topics from API
        link: result.link
      };
    });
  };
  
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear results if search query is empty
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    // Clear previous search summary data to ensure a new one is fetched
    setSearchSummaryData(null)
    setIsLoadingSearchSummary(false)
    setSearchSummaryError(null)
    setSummaryAccordionOpen("")
    
    setIsSearching(true)
    setSearchError(null)
    setExecutedSearchQuery(searchQuery)
    
    // Generate a new flashcard key for this search to ensure fresh component
    setFlashcardKey(`flashcard-${Date.now()}`)
    
    // No need to reset summary state again (already done above)
    
    // Start timing the search
    const startTime = performance.now()
    
    try {
      // Encode the search query for URL
      const encodedQuery = encodeURIComponent(searchQuery);
      
      // Make the API call with full language name using our centralized config
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.SEARCH, {
          language: currentLanguage,
          query: encodedQuery
        })
      );
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const apiResponse: ApiSearchResponse = await response.json();
      
      // Store the search ID for use with other features
      setCurrentSearchId(apiResponse.id); // apiResponse.id is a string
      
      // Transform API results to our UI format
      const transformedResults = transformApiResultsToUIFormat(apiResponse.search_result);
      
      // For debugging - remove in production
      console.log("Search completed, results:", transformedResults.length);
      
      // Use mock results if API returns empty (for development/testing)
      const finalResults = transformedResults.length > 0 ? transformedResults : mockSearchResults;
      
      // Calculate search time in seconds
      const endTime = performance.now()
      const timeInSeconds = ((endTime - startTime) / 1000).toFixed(2)
      setSearchTime(parseFloat(timeInSeconds))
      
      // Set search results and clear loading state together to prevent race condition
      setSearchResults(finalResults);
      setIsSearching(false);
      
      // Always fetch search summary if we have results
      if (finalResults.length > 0) {
        // Don't open the summary accordion yet - keep it closed by default
        // It will be opened automatically when summary is loaded
        
        if (transformedResults.length > 0 && apiResponse.id) {
          // We have real results and a real search ID - use it
          fetchSearchSummary(apiResponse.id);
        } else {
          // We're using mock results - make a new search request to get a real search ID
          // This ensures we always call the real API for summary
          console.log("Making a new search request to get a valid search ID for summary");
          
          try {
            // Create a new search with the same query to get a valid search ID
            const newSearchResponse = await fetch(
              buildApiUrl(API_ENDPOINTS.SEARCH, {
                language: currentLanguage,
                query: encodedQuery
              })
            );
            
            if (newSearchResponse.ok) {
              const newApiResponse: ApiSearchResponse = await newSearchResponse.json();
              if (newApiResponse.id) {
                console.log("Got new search ID for summary:", newApiResponse.id);
                fetchSearchSummary(newApiResponse.id);
              } else {
                throw new Error("No search ID in new search response");
              }
            } else {
              throw new Error(`New search failed with status: ${newSearchResponse.status}`);
            }
          } catch (summarySearchError) {
            console.error("Error getting search ID for summary:", summarySearchError);
            setSearchSummaryError(t('explorePage.search.failedSummary'));
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(t('explorePage.search.error'));
      setSearchResults([]);
      setSearchTime(0);
      setIsSearching(false);
    }
  }

  const handleVoiceSearch = () => {
    setIsListening(!isListening)
    // In real app, implement speech recognition
  }

  // Content interaction handlers
  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result.id)
    // Navigate to content with translation overlay
    window.open(`${LIBRARY_URL}${result.link}?translated=true&lang=${currentLanguage}`, '_blank')
  }
  
  const handleOriginalContentClick = (result: SearchResult) => {
    // Navigate to original content
    window.open(`${LIBRARY_URL}${result.link}`, '_blank')
  }

  // Learning tools handlers
  const toggleTool = (toolName: string) => {
    setActiveTool(prev => prev === toolName ? '' : toolName)
  }

  const handleFeatureAction = (action: string, result: any) => {
    console.log(`${action} for:`, result.title)
    setShowFeatureMenu(null)

    // In real app, these would trigger respective features
    switch (action) {
      case 'deep-thinking': break // Generate 5 whys questions
      case 'flashcards': break // Generate flashcards from content
      case 'quiz': break // Generate quiz questions
      case 'mind-map': break // Generate mind map
      case 'summary': break // Generate AI summary
      case 'explain-simple': break // Explain in simple terms
    }
  }

  // Q&A Mode functionality
  const startQAMode = () => {
    setIsQAMode(true)
    // Add initial greeting message
    setQaMessages([{
      id: Date.now(),
      type: 'ai' as const,
      message: t('explorePage.qa.greeting', { topic: executedSearchQuery }),
      timestamp: new Date()
    }])
  }

  const handleQASubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qaInput.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      message: qaInput,
      timestamp: new Date()
    }
    setQaMessages(prev => [...prev, userMessage])
    setQaInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai' as const,
        message: t('explorePage.qa.simulatedResponse', { topic: executedSearchQuery, question: qaInput }),
        timestamp: new Date()
      }
      setQaMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  // Function to fetch article summary from API
  const fetchArticleSummary = async (result: SearchResult) => {
    // Skip if we already have the summary or if it's currently loading
    if (summariesData[result.id] || loadingSummaries[result.id]) return;
    
    // Mark this summary as loading
    setLoadingSummaries(prev => ({
      ...prev,
      [result.id]: true
    }));

    try {
      // Construct API URL using our centralized config
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.ARTICLE_SUMMARY, {
          language: currentLanguage,
          articleUrl: result.link
        })
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Parse JSON response with the updated structure { summary: string }
      const data = await response.json();
      const summaryText = data.summary || t('explorePage.summary.unavailable');
      
      // Store the summary
      setSummariesData(prev => ({
        ...prev,
        [result.id]: summaryText
      }));
      
      console.log(`Fetched summary for: ${result.title}`);
    } catch (error) {
      console.error('Error fetching article summary:', error);
      // Store error message as summary
      setSummariesData(prev => ({
        ...prev,
        [result.id]: t('explorePage.search.failedSummary')
      }));
    } finally {
      // Clear loading state
      setLoadingSummaries(prev => ({
        ...prev,
        [result.id]: false
      }));
    }
  };

  // Function to fetch search summary from API
  const fetchSearchSummary = async (searchId: string | number) => {
    // Always fetch new summary data for each search - remove skip condition
    setIsLoadingSearchSummary(true);
    setSearchSummaryError(null);

    try {
      // Always call the real API for search summary
      // Construct API URL using our centralized config
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.SEARCH_SUMMARY, {
          id: searchId.toString(),
          language: currentLanguage
        })
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Parse JSON response
      const data: ApiSearchSummaryResponse = await response.json();
      
      // Validate the data structure
      if (!data || !data.search_summary) {
        console.error('Search summary data invalid:', data);
        throw new Error('Invalid search summary data structure');
      }
      
      // Store the search summary
      setSearchSummaryData(data);
      
      // Auto-open the accordion when summary is completed
      setSummaryAccordionOpen("summary");
      
      console.log(`Fetched search summary for ID: ${searchId}`, data);
    } catch (error) {
      console.error('Error fetching search summary:', error);
      setSearchSummaryError(t('explorePage.search.failedSummary'));
      
      // Ensure the accordion is open to show the error
      setSummaryAccordionOpen("summary");
    } finally {
      setIsLoadingSearchSummary(false);
    }
  };

  // Simple markdown renderer for summary text
  const renderMarkdownText = (text: string) => {
    // Handle undefined or null text
    if (!text) {
      return <p className="text-muted-foreground">No content available</p>;
    }
    
    // Simple markdown parsing for basic formatting
    return text
      .split('\n')
      .map((line, index) => {
        // Handle bold text **text**
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Handle italic text *text*
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Handle bullet points
        if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
          return (
            <li key={index} className="ml-4" dangerouslySetInnerHTML={{ __html: line.replace(/^[\*\-]\s*/, '') }} />
          );
        }
        // Handle empty lines as breaks
        if (line.trim() === '') {
          return <br key={index} />;
        }
        // Regular paragraphs
        return (
          <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: line }} />
        );
      });
  };

  // Render helper components to organize the UI
  const renderHeroSearch = () => (
    <section className="py-8 sm:py-12 text-center space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground px-4">
          {t('explore.title')}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          {t('explore.subtitle')}
        </p>
      </div>

      {/* Enhanced Search Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto px-4 sm:px-0">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative">
            <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            <Input
              placeholder={t('explore.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 sm:pl-16 pr-20 sm:pr-20 h-12 sm:h-16 text-base sm:text-lg rounded-2xl border-2 border-border/50 bg-card shadow-xl focus:border-primary focus:shadow-2xl transition-all"
            />
            <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
              {/* <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleVoiceSearch}
                className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl transition-all ${isListening
                    ? 'bg-destructive text-destructive-foreground animate-pulse'
                    : 'hover:bg-muted'
                  }`}
              >
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button> */}
              <Button
                type="submit"
                disabled={!searchQuery.trim() || isSearching}
                className="h-8 px-3 sm:h-10 sm:px-6 rounded-xl font-semibold text-sm sm:text-base"
              >
                {isSearching ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="inline">{t('explorePage.search.button')}</span>
                )}
                {/* {!isSearching && <span className="sm:hidden">🔍</span>} */}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Quick Topic Suggestions - only hide when we have actual search results */}
      {searchResults.length === 0 && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in px-4 sm:px-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant={selectedCategory === suggestion.category ? "default" : "outline"}
                className={`h-20 sm:h-24 flex-col gap-1 sm:gap-2 hover:shadow-lg hover:border-primary/30 hover:scale-105 transition-all group text-center ${selectedCategory === suggestion.category ? "ring-2 ring-primary/20" : ""
                  }`}
                onClick={() => handleSubjectClick(suggestion.category)}
              >
                <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                <span className="text-xs sm:text-sm font-medium leading-tight">{suggestion.text}</span>
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {selectedCategory === "all" ? t('explore.popularTopics') :
                  selectedCategory === "random" ? t('explore.randomTopics') :
                    t('explore.subjectTopics', { subject: quickSuggestions.find(s => s.category === selectedCategory)?.text })}
              </h3>
              <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto px-4 sm:px-0">
                {getDisplayedTopics().map((search, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(search);
                      // Automatically trigger search after setting the query
                      setTimeout(() => {
                        const event = new Event('submit', { bubbles: true, cancelable: true });
                        const form = document.querySelector('form');
                        if (form) {
                          form.dispatchEvent(event);
                          console.log("Auto-triggered search for topic:", search);
                        } else {
                          console.error("Search form not found");
                        }
                      }, 50); // Slightly longer timeout to ensure state is updated
                    }}
                    className="rounded-full hover:scale-105 transition-transform text-sm h-7 sm:h-8 px-3 sm:px-4"
                  >
                    <Quote className="h-3 w-3 mr-1 inline" />
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )

  const renderResultSummary = () => (
    <section className="mb-2">
      {/* Main Search Results Summary */}
      <div className="mb-8">
        <div className="space-y-4">
          {searchResults.length > 0 ? (
            <Accordion
              type="single"
              collapsible
              value={summaryAccordionOpen}
              onValueChange={setSummaryAccordionOpen}
              className="w-full"
            >
              <AccordionItem value="summary" className="border-none">
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
                  {/* Header as AccordionTrigger */}
                  <AccordionTrigger
                    className={`hover:no-underline w-full px-4 sm:px-8 py-3 sm:py-4 ${isLoadingSearchSummary ? 'pointer-events-none opacity-70' : ''}`}
                    disabled={isLoadingSearchSummary}
                  >
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <Sparkles className="h-5 w-5 text-primary shrink-0" />
                      <h2 className="font-semibold text-lg sm:text-xl flex-1 text-left overflow-hidden">
                        {t('explorePage.summary.title')}{" "}
                        <span
                          className="text-primary inline-block max-w-[80%] align-bottom"
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "inline-block",
                            verticalAlign: "bottom"
                          }}
                          title={executedSearchQuery}
                        >
                           {executedSearchQuery}
                        </span>
                      </h2>
                      
                      {/* Status indicators */}
                      <div className="flex items-center gap-2 ml-auto mt-1 sm:mt-0">
                        {isLoadingSearchSummary && (
                          <div className="flex space-x-1 items-center">
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        )}
                        <span className={`text-sm ${isLoadingSearchSummary ? 'text-muted-foreground' :
                          searchSummaryError ? 'text-destructive' :
                          searchSummaryData ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          {isLoadingSearchSummary ? t('explorePage.search.loadingSummary') :
                           searchSummaryError ? t('explorePage.search.failedSummary') :
                           searchSummaryData ? t('explorePage.search.completeSummary') : t('explorePage.search.basicSummary')}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>

                  {/* Content */}
                  <AccordionContent className="px-4 sm:p-8 sm:py-1 py-1 pt-0">
                    <div className="border-t border-border/50 pt-4 mt-0 space-y-4">
                      {searchSummaryError ? (
                        <div className="text-center py-4">
                          <p className="text-destructive font-medium mb-2">
                            {searchSummaryError}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Silakan periksa koneksi anda dan coba lagi
                          </p>
                        </div>
                      ) : searchSummaryData && searchSummaryData.search_summary ? (
                        <div className="space-y-4">
                          <div className="prose prose-sm max-w-none text-foreground text-left">
                            {renderMarkdownText(searchSummaryData.search_summary.answer)}
                          </div>

                          {/* Sources Section */}
                          <div className="space-y-3 pt-4 border-t border-border/50">
                            <h4 className="font-semibold text-foreground flex items-center gap-2 text-md">
                              <Globe className="h-4 w-4 text-primary" />
                              {t('explorePage.summary.sources')}
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {searchSummaryData.search_summary.sources.map((source, index) => (
                                <li key={index} className="flex items-center gap-2 w-full">
                                  <div className="h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0"></div>
                                  <span
                                    className="text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer text-left"
                                    onClick={() => window.open(`${LIBRARY_URL}${source.link}`, '_blank')}
                                    title={source.title}
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "block"
                                    }}
                                  >
                                    {source.title}
                                  </span>
                                  <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Attribution */}
                          <div className="flex items-center justify-end p-2 border-t">
                            <span className="text-xs text-muted-foreground">{t('explorePage.summary.generatedBy')}</span>
                          </div>
                        </div>
                      ) : isLoadingSearchSummary ? (
                        <div className="text-center py-4">
                          <div className="flex space-x-2 justify-center items-center">
                            <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{t('explorePage.search.loadingSummary')}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="prose prose-sm max-w-none text-foreground">
                            {searchResults[0] ?
                              renderMarkdownText(searchResults[0].translatedSnippet || searchResults[0].snippet) :
                              <p className="text-muted-foreground">{t('explorePage.search.noContent')}</p>
                            }
                          </div>

                          {/* Fallback Sources Section */}
                          <div className="space-y-3 pt-4 border-t border-border/50">
                            <h4 className="font-semibold text-foreground flex items-center gap-2 text-md">
                              <Globe className="h-4 w-4 text-primary" />
                              {t('explorePage.summary.sources')}
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {searchResults.slice(0, 3).map((result, index) => (
                                <li key={index} className="flex items-center gap-2 w-full">
                                  <div className="h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0"></div>
                                  <span
                                    className="text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer flex-1"
                                    onClick={() => handleResultClick(result)}
                                    title={result.title}
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "block"
                                    }}
                                  >
                                    {result.title}
                                  </span>
                                  <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Attribution */}
                          <div className="flex items-center justify-end pt-2">
                            <span className="text-xs text-muted-foreground">{t('explorePage.generatedBy')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </div>
              </AccordionItem>
            </Accordion>
          ) : searchError ? (
            <div className="p-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
              <div className="text-center py-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-destructive font-medium">
                  {searchError}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {t('explorePage.search.checkConnection')}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
              <div className="text-center py-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  {t('explorePage.search.startSearching')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section - Cleaner Layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{t('explorePage.search.results')}</h3>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="gap-2 sm:w-auto invisible"
        >
          {/* Translation button removed */}
        </Button>
      </div>
    </section>
  )

  const renderFloatingTools = () => (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Toggle Button - Always Visible */}
      <Button
        size="sm"
        onClick={() => setIsFloatingSidebarOpen(!isFloatingSidebarOpen)}
        className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group relative"
      >
        {isFloatingSidebarOpen ? (
          <ChevronDown className="h-6 w-6 text-white" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="text-white"
          >
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
              <path d="M3 21h4L20 8a1.5 1.5 0 0 0-4-4L3 17zM14.5 5.5l4 4" />
              <path d="M12 8L7 3L3 7l5 5M7 8L5.5 9.5M16 12l5 5l-4 4l-5-5m4 1l-1.5 1.5" />
            </g>
          </svg>
        )}
      </Button>

      {/* Collapsible Tools */}
      <div className="absolute bottom-16 right-0 space-y-3">
        {[
          // { icon: FileText, label: "Rangkuman", color: "bg-indigo-600" },
          { icon: MapPin, label: "Mind Map", color: "bg-pink-600" },
          { icon: CreditCard, label: "Flashquiz", color: "bg-orange-600" },
          // { icon: Brain, label: "5 Whys Analysis", color: "bg-purple-600" },
          { icon: Lightbulb, label: "ELIx", color: "bg-emerald-600" },
          // { icon: Play, label: "Pembelajaran Interaktif", color: "bg-green-600" },
          // { icon: Eye, label: "Gambaran Umum", color: "bg-blue-600" }
        ].map((item, index) => (
          <div
            key={index}
            className="group"
            style={{
              transform: `translateY(${isFloatingSidebarOpen ? 0 : 100}px)`,
              opacity: isFloatingSidebarOpen ? 1 : 0,
              pointerEvents: isFloatingSidebarOpen ? 'auto' : 'none',
              transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
              transitionDelay: isFloatingSidebarOpen ? `${index * 100}ms` : '0ms'
            }}
          >
            <div className="flex items-center justify-end gap-3">
              {/* Hover Label */}
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0">
                <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[8px] border-transparent border-l-background/95"></div>
                </div>
              </div>

              {/* Icon Button */}
              <Button
                size="sm"
                className={`h-12 w-12 rounded-full ${item.color} hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-white/20 cursor-pointer`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(`Clicked ${item.label}`);
                  if (item.label === "5 Whys Analysis") setShowFiveWhys(true);
                  else if (item.label === "Flashcards") {
                    setFlashcardKey(`flashcard-${currentSearchId}-${Date.now()}`);
                    setShowFlashcards(true);
                  }
                  else if (item.label === "Flashquiz") {
                    setFlashcardKey(`flashcard-${currentSearchId}-${Date.now()}`);
                    setShowFlashcards(true);
                  }
                  else if (item.label === "Mind Map") {
                    console.log("Opening Mind Map with searchId:", currentSearchId);
                    
                    // If we don't have a searchId but we have a search query, try to get a searchId first
                    if (!currentSearchId && executedSearchQuery) {
                      setIsSearching(true);
                      
                      (async () => {
                        try {
                          console.log("No searchId available, creating one for mindmap with query:", executedSearchQuery);
                          const encodedQuery = encodeURIComponent(executedSearchQuery);
                          
                          const response = await fetch(
                            buildApiUrl(API_ENDPOINTS.SEARCH, {
                              language: currentLanguage,
                              query: encodedQuery
                            })
                          );
                          
                          if (response.ok) {
                            const apiResponse: ApiSearchResponse = await response.json();
                            console.log("Created new searchId for mindmap:", apiResponse.id);
                            
                            // Set the searchId and then open the mindmap
                            setCurrentSearchId(apiResponse.id);
                            setShowMindMap(true);
                          } else {
                            console.error("Failed to create searchId for mindmap");
                            // Still open the mindmap, it will use fallback topics
                            setShowMindMap(true);
                          }
                        } catch (error) {
                          console.error("Error creating searchId for mindmap:", error);
                          // Still open the mindmap with fallback topics
                          setShowMindMap(true);
                        } finally {
                          setIsSearching(false);
                        }
                      })();
                    } else {
                      // Just open the mindmap with existing searchId or fallback topics
                      setShowMindMap(true);
                    }
                  }
                  else if (item.label === "ELIx") setShowELIx(true);
                  else if (item.label === "Pembelajaran Interaktif") setShowFlashcards(true);
                  else if (item.label === "Rangkuman") startQAMode();
                }}
              >
                <item.icon className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Helper function to render search results
  const renderSearchResults = () => {
    if (searchResults.length === 0) return null;

    return (
      <section className="pb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
            {t('explorePage.search.showing').replace('{{count}}', searchResults.length.toLocaleString()).replace('{time}', isSearching ? '...' : searchTime.toString())}
          </div>
          <div className="flex items-center gap-2"></div>
        </div>

        <div className="space-y-6">
          {searchResults.map((result) => (
            <Card
              key={result.id}
              className={`p-3 sm:p-6 hover:shadow-lg transition-all border-l-4 w-full ${selectedResult === result.id ? 'border-l-primary shadow-lg' : 'border-l-transparent hover:border-l-primary/60'
                }`}
            >
              <div className="space-y-4">
                {/* Result Header */}
                <div className="flex items-start justify-between gap-4 w-full">
                  <div className="flex-1 space-y-2 w-full max-w-full">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground text-left">
                      <BookOpen className="h-4 w-4 shrink-0" />
                      <span className="truncate">{result.source}</span>
                      <span className="hidden xs:inline">•</span>
                      {/* <span>{result.readTime}</span> */}
                      <Badge variant="outline" className="text-xs">
                        {result.confidence}% match
                      </Badge>
                    </div>
                    <div
                      className="cursor-pointer w-full overflow-hidden block"
                      onClick={() => handleResultClick(result)}
                    >
                      <h3
                        className="text-lg sm:text-xl font-medium text-primary hover:underline text-left w-full"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "block"
                        }}
                        title={result.title}
                      >
                        {result.title}
                      </h3>
                      <div className="w-full overflow-hidden block">
                        <span
                          className="text-sm text-muted-foreground block text-left"
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "block"
                          }}
                          title={result.link}
                        >
                          {result.link}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="space-y-3">
                  <p className="text-muted-foreground leading-relaxed text-left cursor-pointer line-clamp-4 sm:line-clamp-none" onClick={() => handleResultClick(result)}>
                    {result.snippet}
                  </p>
                </div>

                {/* Tags and Related Topics */}
                <div className="space-y-3">
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-2 pt-3 border-t">
                  <Button
                    size="sm"
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => {
                      // Toggle summary display
                      const newSummaryState = showAISummary === result.id ? null : result.id;
                      setShowAISummary(newSummaryState);
                      
                      // If opening the summary and we don't have the data yet, fetch it
                      if (newSummaryState && !summariesData[result.id]) {
                        fetchArticleSummary(result);
                      }
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    {t('explorePage.actions.readSummary')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => handleOriginalContentClick(result)}
                  >
                    <Globe className="h-4 w-4" />
                    {t('explorePage.actions.openArticle')}
                  </Button>
                  {/* {result.contentType === 'video' && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Play className="h-4 w-4" />
                      Tonton Video
                    </Button>
                  )} */}
                  {/* <div className="ml-auto flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div> */}
                </div>

                {/* AI Summary Display */}
                {showAISummary === result.id && (
                  <div className="mt-3 p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Sparkles className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-semibold text-primary">{t('explorePage.summary.title')}</span>
                    </div>
                    <div className="space-y-3">
                      {loadingSummaries[result.id] ? (
                        <div className="py-4 flex flex-col items-center justify-center">
                          <div className="flex space-x-2 justify-center items-center">
                            <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{t('explorePage.search.loadingSummary')}</p>
                        </div>
                      ) : summariesData[result.id] ? (
                        <p className="text-sm leading-relaxed text-foreground text-left">
                          {summariesData[result.id]}
                        </p>
                      ) : (
                        <p className="text-sm leading-relaxed text-foreground text-left">
                          {t('explorePage.summary.unavailable')}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex gap-2">
                          {/* Copy button removed */}
                        </div>
                        <span className="text-xs text-muted-foreground">{t('explorePage.summary.generatedBy')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  // Helper function to render loading state
  const renderLoadingState = () => {
    if (!isSearching || !searchQuery) return null;

    return (
      <section className="py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <PageLayout
      headerVariant="default"
      logoTo="/"
      onLogoClick={resetSearch}
      navItems={[
        { label: 'nav.home', to: '/' },
        // { label: 'nav.about', to: '/about-lentera' },
        {
          label: 'nav.library',
          to: LIBRARY_URL || '/library',
          isExternal: Boolean(LIBRARY_URL)
        }
      ]}
    >
      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isSearching && !!searchQuery} message={t('loading.messages.searching')} />
      {/* Main Content Container */}
      <div className="container max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4">
        {/* Hero Search Section */}
        {renderHeroSearch()}

        {/* Results Summary Section (only when search results exist) */}
        {searchResults.length > 0 && renderResultSummary()}
      </div>

      {/* Search Results Section */}
      <div className="container max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4">
        {renderSearchResults()}
        {renderLoadingState()}
      </div>

      {/* Enhanced Q&A Interface */}
      {isQAMode && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] flex gap-4">
            {/* Main Chat Panel */}
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('explorePage.qa.assistant')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('explorePage.qa.exploring', { topic: searchQuery })}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsQAMode(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {qaMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className={message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                          {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>

                      <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                        <div
                          className={`p-4 rounded-2xl ${message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted border'
                            }`}
                        >
                          <p className="text-sm leading-relaxed">{message.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {message.type === 'ai' && (
                              <div className="flex gap-1">
                                {/* Copy button removed */}
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI Follow-up Actions */}
                        {message.type === 'ai' && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button size="sm" variant="outline" className="text-xs h-7 rounded-full">
                              <Lightbulb className="h-3 w-3 mr-1" />
                              {t('explorePage.qa.suggestionButtons.explainSimpler')}
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-7 rounded-full">
                              <FileText className="h-3 w-3 mr-1" />
                              {t('explorePage.qa.suggestionButtons.giveExamples')}
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-7 rounded-full">
                              <Brain className="h-3 w-3 mr-1" />
                              {t('explorePage.qa.suggestionButtons.deeperAnalysis')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Input Form */}
                <div className="border-t bg-muted/30 p-4">
                  <form onSubmit={handleQASubmit} className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('explorePage.qa.placeholder')}
                        value={qaInput}
                        onChange={(e) => setQaInput(e.target.value)}
                        className="flex-1 rounded-xl border-2 focus:border-primary/50"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!qaInput.trim()}
                        className="rounded-xl px-4 h-10"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Smart Question Suggestions */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">{t('explorePage.qa.suggestions')}</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          t('explorePage.questionSuggestions.practicalApplications'),
                          t('explorePage.questionSuggestions.commonMistakes'),
                          t('explorePage.questionSuggestions.dailyApplications'),
                          t('explorePage.questionSuggestions.prerequisites'),
                          t('explorePage.questionSuggestions.compareWithOtherConcepts'),
                          t('explorePage.questionSuggestions.simpleAnalogy')
                        ].map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs rounded-full h-7 hover:bg-primary hover:text-primary-foreground"
                            onClick={() => setQaInput(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Context & Tools Sidebar */}
            <Card className="w-80 flex flex-col">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-base">{t('explorePage.qa.contextPanel.title')}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 p-4 space-y-4">
                {/* Current Topic Context */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('explorePage.qa.contextPanel.activeTopic')}</h4>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{executedSearchQuery}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('explorePage.search.showing', { count: searchResults.length, time: '' }).replace('()', '')}
                    </p>
                  </div>
                </div>

                {/* Related Sources */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('explorePage.qa.contextPanel.relatedSources')}</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {searchResults.slice(0, 3).map((result, index) => (
                      <div key={index} className="p-2 bg-muted/50 rounded text-xs">
                        <p
                          className="font-medium"
                          title={result.title}
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "block"
                          }}
                        >
                          {result.title}
                        </p>
                        <p
                          className="text-muted-foreground"
                          title={result.source}
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "block"
                          }}
                        >
                          {result.source}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Learning Tools */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('explorePage.qa.contextPanel.learningTools')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="h-auto flex-col gap-1 p-2">
                      <CreditCard className="h-3 w-3" />
                      <span className="text-xs">{t('explore.tools.flashcards')}</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-auto flex-col gap-1 p-2">
                      <HelpCircle className="h-3 w-3" />
                      <span className="text-xs">{t('explore.tools.quiz')}</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-auto flex-col gap-1 p-2">
                      <Brain className="h-3 w-3" />
                      <span className="text-xs">{t('explore.tools.fiveWhys')}</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-auto flex-col gap-1 p-2">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs">{t('explore.tools.mindMap')}</span>
                    </Button>
                  </div>
                </div>

                {/* Conversation Stats */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('explorePage.qa.contextPanel.sessionStats')}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <div className="font-medium">{qaMessages.length}</div>
                      <div className="text-muted-foreground">{t('explorePage.qa.messages')}</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <div className="font-medium">{Math.floor(qaMessages.length / 2)}</div>
                      <div className="text-muted-foreground">{t('explorePage.qa.questions')}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Render Floating Tools - only visible after search */}
      {searchResults.length > 0 && renderFloatingTools()}

      {/* Flashcard Learning Mode */}
      {showFlashcards && (
        <div className="fixed inset-0 z-50">
          <FlashcardLearning
            key={flashcardKey}
            topic={executedSearchQuery}
            searchId={currentSearchId}
            onClose={() => {
              setShowFlashcards(false);
              // Clear any previous search ID associated with the flashcards
              // This forces a complete refresh next time they're opened
              console.log("Closing flashcards, cleaning up state");
            }}
          />
        </div>
      )}

      {/* Mind Map Modal */}
      {showMindMap && (
        <MindMapModal
          isOpen={showMindMap}
          onClose={() => setShowMindMap(false)}
          topic={executedSearchQuery}
          searchId={currentSearchId}
          // Adding debug info
          onSearch={(question) => {
            // Set the search query
            setSearchQuery(question);
            // Close the mindmap modal
            setShowMindMap(false);
            // Automatically trigger search after setting the query
            setTimeout(() => {
              const event = new Event('submit', { bubbles: true, cancelable: true });
              const form = document.querySelector('form');
              if (form) {
                form.dispatchEvent(event);
                console.log("Auto-triggered search from Mind Map for:", question);
              } else {
                console.error("Search form not found for Mind Map search");
              }
            }, 150); // Slightly longer timeout to ensure modal is closed and state is updated
          }}
        />
      )}

      {/* 5 Whys Presentation */}
      {showFiveWhys && (
        <FiveWhysPresentation
          isOpen={showFiveWhys}
          onClose={() => setShowFiveWhys(false)}
          topic={executedSearchQuery}
          searchResults={searchResults}
          selectedResult={selectedResult}
        />
      )}

      {/* Lesson Plan Generator */}
      {showLessonPlan && (
        <LessonPlanGenerator
          isOpen={showLessonPlan}
          onClose={() => setShowLessonPlan(false)}
          topic={executedSearchQuery}
          searchResults={searchResults}
          selectedResult={selectedResult}
        />
      )}

      {/* ELIx Modal */}
      {showELIx && (
        <ELIxModal
          isOpen={showELIx}
          onClose={() => setShowELIx(false)}
          topic={executedSearchQuery || t('common.adult')}
          summary={searchSummaryData?.search_summary?.answer || ""}
        />
      )}
    </PageLayout>
  )
}

export default Explore