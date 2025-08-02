import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"
import { getApiLanguageParameter } from "@/utils/language-utils"
import { motion } from "framer-motion"
import { fetchMindMap, MindMapResponse, MindMapNode, Source } from "@/services/api"
import { LoadingOverlay } from "./loading-overlay"

interface MindMapModalProps {
  isOpen: boolean
  onClose: () => void
  topic: string
  searchId?: string | number
  language?: string
  onSearch?: (question: string) => void // Add callback for search functionality
}

// Helper function to map color keys to hex colors
const getColorForKey = (colorKey: string): string => {
  const colorMap: Record<string, string> = {
    'blue': '#3B82F6',
    'pink': '#EC4899',
    'emerald': '#10B981',
    'cyan': '#06B6D4',
    'amber': '#D97706',
    'indigo': '#4F46E5',
    'purple': '#8B5CF6',
    'red': '#EF4444',
    'green': '#10B981',
    'yellow': '#F59E0B',
    'orange': '#F97316',
    'teal': '#14B8A6',
    'violet': '#8B5CF6',
  }
  
  return colorMap[colorKey] || '#8B5CF6' // Default to purple if color not found
}

export const MindMapModal = ({ isOpen, onClose, topic, searchId, language, onSearch }: MindMapModalProps) => {
  // Get language from i18n if not provided
  const { i18n } = useTranslation();
  const fullLanguageName = language || getApiLanguageParameter(i18n.language);
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mindMapData, setMindMapData] = useState<MindMapResponse | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()

  // Fetch mindmap data when modal opens and searchId is available
  useEffect(() => {
    console.log("MindMapModal useEffect triggered with:", {
      isOpen,
      searchId,
      language,
      fullLanguageName,
      topic
    });
    
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      
      const fetchData = async () => {
        // Only attempt API call if searchId is available
        if (searchId) {
          console.log(`MindMapModal: Fetching mindmap data for ID=${searchId}, language=${fullLanguageName}`);
          
          try {
            const data = await fetchMindMap(searchId, fullLanguageName);
            console.log('MindMapModal: Successfully fetched mindmap data:', data);
            setMindMapData(data);
          } catch (err) {
            console.error('Failed to fetch mindmap:', err);
            setError(t('modals.mindMap.error'));
            // Continue with fallback topics despite error
          }
        } else {
          console.log('MindMapModal: No searchId provided, using fallback topics for:', topic);
          // We'll use fallback topics since no searchId is available
        }
        
        // Always finish loading, even if no API call was made
        setIsLoading(false);
      };
      
      fetchData();
    }
  }, [isOpen, searchId, language, fullLanguageName, topic, t])

  // Function to handle question clicks - now with search functionality
  const handleQuestionClick = (question: string, subtopic: string) => {
    // Show toast notification
    toast({
      title: t('modals.mindMap.explorationTitle'),
      description: `${subtopic}: ${question}`,
      duration: 3000,
    })
    
    // Call the search function if provided
    if (onSearch) {
      // Close the modal first
      onClose()
      // Trigger search with a small delay to allow modal to close
      setTimeout(() => {
        onSearch(question)
      }, 300)
    }
  }

  // Fallback topic data structure (in case API data is not available)
  const fallbackTopics = [
    {
      emoji: "📚",
      title: "Explanation",
      desc: t('modals.mindMap.facets.explanation'),
      questions: [`Apa definisi ${topic} yang tepat?`, `Mengapa ${topic} penting dipelajari?`, `Bagaimana konsep dasar ${topic}?`],
      color: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-700"
    },
    {
      emoji: "📜",
      title: "Interpretation",
      desc: t('modals.mindMap.facets.interpretation'),
      questions: [`Bagaimana menginterpretasikan ${topic}?`, `Apa makna dari ${topic}?`, `Bagaimana menjelaskan ${topic} dengan sederhana?`],
      color: "bg-pink-50",
      border: "border-pink-300",
      text: "text-pink-700"
    },
    {
      emoji: "🔍",
      title: "Perspective",
      desc: t('modals.mindMap.facets.perspective'),
      questions: [`Bagaimana pandangan berbeda tentang ${topic}?`, `Siapa tokoh penting dalam ${topic}?`, `Apa kontroversi dalam ${topic}?`],
      color: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-700"
    },
    {
      emoji: "⚙️",
      title: "Application",
      desc: t('modals.mindMap.facets.application'),
      questions: [`Bagaimana cara menerapkan ${topic}?`, `Apa contoh aplikasi ${topic} dalam kehidupan?`, `Bagaimana ${topic} berfungsi?`],
      color: "bg-cyan-50",
      border: "border-cyan-300",
      text: "text-cyan-700"
    },
    {
      emoji: "💡",
      title: "Empathy",
      desc: t('modals.mindMap.facets.empathy'),
      questions: [`Bagaimana ${topic} mempengaruhi perasaan?`, `Apa dampak emosional dari ${topic}?`, `Bagaimana orang merasakan tentang ${topic}?`],
      color: "bg-amber-50",
      border: "border-amber-300",
      text: "text-amber-700"
    },
    {
      emoji: "🚀",
      title: "Self-Knowledge",
      desc: t('modals.mindMap.facets.selfKnowledge'),
      questions: [`Bagaimana ${topic} mempengaruhi diri saya?`, `Apa yang dapat saya pelajari dari ${topic}?`, `Mengapa ${topic} penting bagi pengembangan diri?`],
      color: "bg-indigo-50",
      border: "border-indigo-300",
      text: "text-indigo-700"
    }
  ]
  
  // Map API facets to display properties (colors, emojis, etc.)
  const facetDisplayMap: Record<string, {emoji: string, color: string, border: string, text: string, desc: string}> = {
    "Explanation": {
      emoji: "📚",
      color: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-700",
      desc: t('modals.mindMap.facets.explanation')
    },
    "Interpretation": {
      emoji: "📜",
      color: "bg-pink-50",
      border: "border-pink-300",
      text: "text-pink-700",
      desc: t('modals.mindMap.facets.interpretation')
    },
    "Application": {
      emoji: "⚙️",
      color: "bg-cyan-50",
      border: "border-cyan-300",
      text: "text-cyan-700",
      desc: t('modals.mindMap.facets.application')
    },
    "Perspective": {
      emoji: "🔍",
      color: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-700",
      desc: t('modals.mindMap.facets.perspective')
    },
    "Empathy": {
      emoji: "💡",
      color: "bg-amber-50",
      border: "border-amber-300",
      text: "text-amber-700",
      desc: t('modals.mindMap.facets.empathy')
    },
    "Self-Knowledge": {
      emoji: "🚀",
      color: "bg-indigo-50",
      border: "border-indigo-300",
      text: "text-indigo-700",
      desc: t('modals.mindMap.facets.selfKnowledge')
    }
  }
  
  // Generate topics from API data or use fallback if not available
  const getTopics = () => {
    console.log("MindMapModal: getTopics() called, mindMapData=", mindMapData)
    
    if (mindMapData?.mindmap?.nodes && Array.isArray(mindMapData.mindmap.nodes) && mindMapData.mindmap.nodes.length > 0) {
      console.log("MindMapModal: Using API data with", mindMapData.mindmap.nodes.length, "nodes")
      return mindMapData.mindmap.nodes.map((node) => {
        const display = facetDisplayMap[node.facet] || {
          emoji: "🔮",
          color: "bg-purple-50",
          border: "border-purple-300",
          text: "text-purple-700",
          desc: t('modals.mindMap.importantAspect')
        }
        
        return {
          emoji: display.emoji,
          title: node.facet,
          desc: display.desc,
          questions: node.subquestions,
          explanation: node.explanation,
          color: display.color,
          border: display.border,
          text: display.text
        }
      })
    }
    
    console.log("MindMapModal: Using fallback topics")
    return fallbackTopics
  }
  
  const topics = getTopics()
  
  // Split topics into top and bottom rows
  const halfLength = Math.ceil(topics.length / 2)
  const topTopics = topics.slice(0, halfLength)
  const bottomTopics = topics.slice(halfLength)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? "max-w-screen max-h-screen w-screen h-screen m-0 rounded-none" 
            : "max-w-5xl w-full h-[750px]"
        } bg-white transition-all duration-300 overflow-hidden`}
      >
        {isLoading && <LoadingOverlay isVisible={true} message={t('modals.mindmap.loadingMindmap')} />}
        
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🗺️</span> {t('modals.mindMap.title', { topic })}
          </DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-slate-600 hover:bg-slate-100"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {/* {mindMapData ? <span className="ml-1 text-xs text-green-600">API</span> : <span className="ml-1 text-xs text-amber-600">Fallback</span>} */}
            </Button>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-600 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>
        
        {/* Mind Map Content */}
        <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="min-h-[600px] relative max-w-5xl mx-auto">
            {/* SVG layer for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1 }}>
              <defs>
                {/* Generate dynamic gradients for each topic */}
                {topTopics.map((topic, index) => {
                  // Extract color from the topic's text class (e.g., "text-blue-700" -> "#3B82F6")
                  const colorKey = topic.text.replace('text-', '').replace('-700', '')
                  const endColor = getColorForKey(colorKey)
                  
                  return (
                    <linearGradient
                      key={`gradient-top-${index}`}
                      id={`gradient-top-${index}`}
                      x1="0%" y1="0%"
                      x2="100%" y2="0%"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor={endColor} />
                    </linearGradient>
                  )
                })}
                
                {bottomTopics.map((topic, index) => {
                  const colorKey = topic.text.replace('text-', '').replace('-700', '')
                  const endColor = getColorForKey(colorKey)
                  
                  return (
                    <linearGradient
                      key={`gradient-bottom-${index}`}
                      id={`gradient-bottom-${index}`}
                      x1="0%" y1="0%"
                      x2="100%" y2="0%"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor={endColor} />
                    </linearGradient>
                  )
                })}
                
                {/* Arrow marker for line endings */}
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#8B5CF6" />
                </marker>
              </defs>
              
              {/* Top connections - dynamically generated based on number of topics */}
              {topTopics.map((topic, index) => {
                // Calculate path based on number of topics and current index
                const topicCount = topTopics.length
                const spreadFactor = topicCount > 1 ? 50 / (topicCount - 1) : 0
                const xPosition = topicCount === 1 ? 50 : index * spreadFactor + 25
                
                // Create the curved path
                const path = `M 50% 50% Q ${xPosition}% 35%, ${xPosition}% 20%`
                
                return (
                  <path
                    key={`top-path-${index}`}
                    d={path}
                    stroke={`url(#gradient-top-${index})`}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    markerEnd="url(#arrow)"
                  />
                )
              })}
              
              {/* Bottom connections - dynamically generated based on number of topics */}
              {bottomTopics.map((topic, index) => {
                // Calculate path based on number of topics and current index
                const topicCount = bottomTopics.length
                const spreadFactor = topicCount > 1 ? 50 / (topicCount - 1) : 0
                const xPosition = topicCount === 1 ? 50 : index * spreadFactor + 25
                
                // Create the curved path
                const path = `M 50% 50% Q ${xPosition}% 65%, ${xPosition}% 80%`
                
                return (
                  <path
                    key={`bottom-path-${index}`}
                    d={path}
                    stroke={`url(#gradient-bottom-${index})`}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    markerEnd="url(#arrow)"
                  />
                )
              })}
            </svg>
            
            {/* Top row of topics */}
            <div className="flex flex-wrap justify-around mb-4 md:mb-4 pt-4 relative" style={{ zIndex: 2 }}>
              {topTopics.map((topic, index) => (
                <TopicCard
                  key={`top-${index}`}
                  topic={topic}
                  position="top"
                  index={index}
                  onClick={handleQuestionClick}
                />
              ))}
            </div>
            
            {/* Center topic */}
            <div className="flex justify-center items-center mb-4 md:mb-4 relative" style={{ zIndex: 3 }}>
              <motion.div
                className="bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 rounded-xl p-5 text-center w-64 shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, boxShadow: ["0px 0px 0px rgba(139, 92, 246, 0)", "0px 0px 20px rgba(139, 92, 246, 0.3)", "0px 0px 0px rgba(139, 92, 246, 0)"] }}
                transition={{
                  duration: 0.4,
                  boxShadow: {
                    repeat: Infinity,
                    duration: 3
                  }
                }}
              >
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-bold text-purple-800 text-lg">{topic}</div>
                <div className="text-sm text-purple-600 mt-1">
                  {/* Center topic */}
                  {t('modals.mindMap.mainTopic')}
                </div>
              </motion.div>
            </div>
            
            {/* Bottom row of topics */}
            <div className="flex flex-wrap justify-around relative pb-4" style={{ zIndex: 2 }}>
              {bottomTopics.map((topic, index) => (
                <TopicCard
                  key={`bottom-${index}`}
                  topic={topic}
                  position="bottom"
                  index={index}
                  onClick={handleQuestionClick}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer with sources */}
        <div className="pt-2 border-t text-xs text-gray-500">
          <div className="text-center mb-1">
            <span>{t('modals.mindMap.aspectsNote', { count: topics.length })}</span>
          </div>
          
          {/* Sources */}
          {mindMapData?.mindmap?.sources && Array.isArray(mindMapData.mindmap.sources) && mindMapData.mindmap.sources.length > 0 && (
            <div className="text-xs text-gray-500 px-4 pb-1">
              <span className="font-medium">{t('modals.mindMap.sources')}</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {mindMapData.mindmap.sources.slice(0, 3).map((source, idx) => (
                  <a
                    key={idx}
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate max-w-[200px]"
                  >
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// TopicCard component for consistent rendering of topic cards
interface TopicCardProps {
  topic: {
    emoji: string
    title: string
    desc: string
    questions: string[]
    explanation?: string
    color: string
    border: string
    text: string
  }
  position: 'top' | 'bottom'
  index: number
  onClick: (question: string, subtopic: string) => void
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, position, index, onClick }) => {
  // Add translation hook
  const { t } = useTranslation();
  
  // Animation delay based on position and index
  const delay = position === 'top' ? index * 0.1 : 0.3 + (index * 0.1)
  
  // Determine styles for different positions and screen sizes
  const getPositionStyles = () => {
    // For mobile (stacked vertically)
    if (position === 'top') {
      return {
        mobile: 'mb-4',
        desktop: 'md:mb-0'
      }
    } else {
      return {
        mobile: 'mt-4',
        desktop: 'md:mt-0'
      }
    }
  }
  
  const posStyles = getPositionStyles()
  
  return (
    <motion.div
      className={`${topic.color} ${topic.border} border-2 rounded-lg p-4 shadow-sm w-64 ${posStyles.mobile} ${posStyles.desktop}`}
      initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderColor: topic.text.replace('text', 'border')
      }}
    >
      <div className="text-center mb-3">
        <motion.div
          className="text-2xl mb-1 inline-block"
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {topic.emoji}
        </motion.div>
        <div className={`font-semibold text-sm ${topic.text}`}>{topic.title}</div>
        <div className="text-xs text-gray-600">{topic.desc}</div>
        
        {/* Show brief explanation with expand option */}
        {topic.explanation && (
          <div className="mt-1 text-xs text-gray-700 group relative">
            <div className="italic line-clamp-2">
              "{topic.explanation}"
            </div>
            <ExplanationModal
              topic={topic}
              trigger={
                <button className="mt-1 text-xs text-primary hover:underline focus:outline-none">
                  {t('modals.mindMap.readMore')}
                </button>
              }
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2 mt-3">
        {topic.questions.map((question, qIndex) => (
          <motion.button
            key={qIndex}
            className={`w-full text-left text-xs p-2 rounded ${topic.color} hover:brightness-95 border border-opacity-20 ${topic.border} transition-all`}
            whileHover={{
              scale: 1.02,
              y: -1,
              backgroundColor: topic.text.replace('text', 'bg').replace('700', '50')
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(question, topic.title)}
          >
            <div className="flex items-center">
              <span className="mr-1">❓</span>
              <span className="font-medium text-gray-700">{question}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// Create a proper React-based modal component for explanations
interface ExplanationModalProps {
  topic: {
    title: string;
    explanation?: string;
    questions: string[];
  };
  trigger: React.ReactNode;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({ topic, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  
  // Create a ref to track if we're currently closing
  const isClosingRef = React.useRef(false);
  
  // Handler to open the modal
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };
  
  // Handler to close the modal safely
  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Set closing flag
    isClosingRef.current = true;
    
    // Close the modal
    setIsOpen(false);
    
    // Store all links on the page
    const allLinks = document.querySelectorAll('a, button');
    const originalClickHandlers: WeakMap<Element, EventListenerOrEventListenerObject> = new WeakMap();
    const originalPointerEvents: WeakMap<Element, string> = new WeakMap();
    
    // Temporarily disable all links and buttons by capturing their events
    allLinks.forEach(link => {
      // Cast to HTMLElement to access style property
      const htmlLink = link as HTMLElement;
      
      // Store original pointer-events style
      originalPointerEvents.set(link, htmlLink.style.pointerEvents);
      
      // Disable pointer events
      htmlLink.style.pointerEvents = 'none';
      
      // Add a temporary event listener that stops all clicks
      const blockHandler = (evt: Event) => {
        evt.preventDefault();
        evt.stopPropagation();
        return false;
      };
      
      link.addEventListener('click', blockHandler, true);
      originalClickHandlers.set(link, blockHandler);
    });
    
    // Create a comprehensive click blocker element
    const blocker = document.createElement('div');
    blocker.setAttribute('aria-hidden', 'true');
    blocker.setAttribute('data-purpose', 'click-blocker-during-modal-transition');
    blocker.className = 'fixed inset-0';
    blocker.style.zIndex = '99999'; // Super high z-index
    blocker.style.cursor = 'default';
    blocker.style.pointerEvents = 'all'; // Catch all pointer events
    blocker.style.touchAction = 'none'; // Disable touch actions
    blocker.style.userSelect = 'none'; // Prevent selection
    
    // Block ALL possible input events at the capture phase
    const allEvents = [
      'click', 'mousedown', 'mouseup', 'touchstart', 'touchend',
      'touchmove', 'pointerdown', 'pointerup', 'pointermove',
      'keydown', 'keyup', 'keypress', 'contextmenu'
    ];
    
    const blockHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };
    
    // Add all event listeners
    allEvents.forEach(eventName => {
      blocker.addEventListener(eventName, blockHandler, true);
    });
    
    document.body.appendChild(blocker);
    
    // Remove the blocker and restore links after a delay
    setTimeout(() => {
      // Remove blocker
      if (document.body.contains(blocker)) {
        document.body.removeChild(blocker);
      }
      
      // Re-enable all links and buttons
      allLinks.forEach(link => {
        // Cast to HTMLElement to access style property
        const htmlLink = link as HTMLElement;
        
        // Restore original pointer-events style
        htmlLink.style.pointerEvents = originalPointerEvents.get(link) || '';
        
        // Remove our temporary handler
        const handler = originalClickHandlers.get(link);
        if (handler) {
          link.removeEventListener('click', handler as EventListener, true);
        }
      });
      
      isClosingRef.current = false;
    }, 500); // Longer timeout for safety
  };
  
  return (
    <>
      {/* Clone the trigger element and attach our handler */}
      {React.cloneElement(trigger as React.ReactElement, {
        onClick: handleOpen,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen(e as unknown as React.MouseEvent);
          }
        }
      })}
      
      {/* Use Portal to render outside the component tree */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !isClosingRef.current) {
            handleClose();
          }
        }}
      >
        <DialogContent className="bg-white p-6 rounded-lg max-w-md max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold mb-2">
              {topic.title}
            </DialogTitle>
          </DialogHeader>
          
          {/* Explanation text */}
          {topic.explanation && (
            <p className="text-sm mb-4">
              {topic.explanation}
            </p>
          )}
          
          {/* Questions section */}
          <h4 className="text-sm font-medium mt-4 mb-2">
            {t('modals.mindMap.relatedQuestions')}
          </h4>
          
          {/* Questions list */}
          <ul className="space-y-1">
            {topic.questions.map((q, idx) => (
              <li key={idx} className="text-xs">
                {q}
              </li>
            ))}
          </ul>
          
          {/* Close button that uses our safe close handler */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleClose();
              }}
              className="px-5 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary/90 shadow-lg w-[120px]"
            >
              {t('modals.mindMap.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};