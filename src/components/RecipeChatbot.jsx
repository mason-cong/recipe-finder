import React, { useState, useRef, useEffect } from 'react';
import { Send, ChefHat, Loader2 } from 'lucide-react';

export default function RecipeChatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you find the perfect recipe. Tell me what you\'re in the mood for - a protein, cuisine style, dietary needs, or just describe what you want!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const messagesEndRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);
  
  // Replace this with your actual Spoonacular API key
  const spoonacularKey = 'YOUR_SPOONAf32bbf8eb1f34ed59658185c44fee18f';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchSpoonacular = async (query, filters = {}) => {
    try {
      const params = new URLSearchParams({
        apiKey: spoonacularKey,
        query: query,
        number: 6,
        addRecipeInformation: true,
        ...filters
      });

      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?${params}`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Spoonacular API error:', error);
      return [];
    }
  };

  const extractSearchParams = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Expanded cuisine list
    const cuisines = {
      'italian': ['italian', 'pasta', 'pizza', 'risotto'],
      'chinese': ['chinese', 'stir fry', 'wok', 'szechuan'],
      'mexican': ['mexican', 'tacos', 'burrito', 'enchilada', 'quesadilla'],
      'indian': ['indian', 'curry', 'tikka', 'masala', 'biryani'],
      'japanese': ['japanese', 'sushi', 'ramen', 'teriyaki', 'miso'],
      'thai': ['thai', 'pad thai', 'tom yum'],
      'french': ['french', 'crepe', 'quiche'],
      'greek': ['greek', 'gyro', 'souvlaki', 'tzatziki'],
      'korean': ['korean', 'kimchi', 'bibimbap'],
      'vietnamese': ['vietnamese', 'pho', 'banh mi'],
      'american': ['american', 'burger', 'bbq', 'southern'],
      'mediterranean': ['mediterranean', 'hummus', 'falafel'],
      'middle eastern': ['middle eastern', 'shawarma', 'kebab'],
      'spanish': ['spanish', 'paella', 'tapas'],
      'caribbean': ['caribbean', 'jerk'],
      'african': ['african', 'moroccan', 'ethiopian']
    };
    
    // Expanded protein list
    const proteins = {
      'chicken': ['chicken', 'poultry'],
      'beef': ['beef', 'steak', 'ground beef'],
      'pork': ['pork', 'bacon', 'ham', 'sausage'],
      'fish': ['fish', 'cod', 'tilapia', 'tuna'],
      'salmon': ['salmon'],
      'shrimp': ['shrimp', 'prawn'],
      'seafood': ['seafood', 'crab', 'lobster', 'clam', 'mussel', 'scallop'],
      'tofu': ['tofu', 'tempeh', 'seitan'],
      'turkey': ['turkey'],
      'lamb': ['lamb'],
      'duck': ['duck'],
      'eggs': ['egg', 'eggs', 'omelette', 'frittata']
    };
    
    // Expanded diet types
    const diets = {
      'vegetarian': ['vegetarian', 'veggie'],
      'vegan': ['vegan', 'plant-based', 'plant based'],
      'gluten-free': ['gluten free', 'gluten-free', 'celiac'],
      'dairy-free': ['dairy free', 'dairy-free', 'lactose free'],
      'keto': ['keto', 'ketogenic', 'low carb'],
      'paleo': ['paleo', 'caveman'],
      'pescatarian': ['pescatarian', 'fish only'],
      'whole30': ['whole30', 'whole 30']
    };
    
    // Expanded meal types
    const mealTypes = {
      'breakfast': ['breakfast', 'brunch'],
      'lunch': ['lunch'],
      'dinner': ['dinner', 'supper'],
      'snack': ['snack', 'appetizer', 'side'],
      'dessert': ['dessert', 'sweet', 'cake', 'cookie', 'pie'],
      'soup': ['soup', 'stew', 'chowder'],
      'salad': ['salad'],
      'drink': ['drink', 'smoothie', 'shake', 'beverage']
    };
    
    // Cooking methods and descriptors
    const methods = {
      'quick': ['quick', 'fast', 'easy', '30 minutes', 'weeknight'],
      'slow': ['slow cooker', 'crock pot', 'slow cooked'],
      'baked': ['baked', 'roasted', 'oven'],
      'grilled': ['grilled', 'barbecue', 'bbq'],
      'fried': ['fried', 'deep fried', 'pan fried'],
      'healthy': ['healthy', 'light', 'nutritious', 'clean'],
      'comfort': ['comfort food', 'hearty', 'filling'],
      'spicy': ['spicy', 'hot', 'fiery'],
      'creamy': ['creamy', 'rich']
    };
    
    // Helper function to find matches
    const findMatch = (categories) => {
      for (const [key, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => message.includes(keyword))) {
          return key;
        }
      }
      return null;
    };
    
    // Extract all parameters
    const cuisine = findMatch(cuisines);
    const protein = findMatch(proteins);
    const diet = findMatch(diets);
    const type = findMatch(mealTypes);
    const method = findMatch(methods);
    
    // Build smart search query
    let searchTerms = [];
    
    // Prioritize protein and main ingredients
    if (protein) searchTerms.push(protein);
    
    // Add specific dishes if mentioned
    const specificDishes = message.match(/\b(pasta|pizza|burger|salad|sandwich|wrap|bowl|curry|soup|stir fry|noodles|rice)\b/);
    if (specificDishes) searchTerms.push(specificDishes[0]);
    
    // Add cuisine if no specific dish mentioned
    if (cuisine && !specificDishes) searchTerms.push(cuisine);
    
    // Add method descriptors
    if (method) searchTerms.push(method);
    
    // If we found nothing specific, use key nouns from the message
    if (searchTerms.length === 0) {
      const words = message.split(' ').filter(w => w.length > 3);
      if (words.length > 0) {
        searchTerms = words.slice(0, 2); // Take first 2 meaningful words
      } else {
        searchTerms = [userMessage]; // Use full message as fallback
      }
    }
    
    const searchQuery = searchTerms.join(' ');
    
    return { searchQuery, cuisine, diet, type, protein, method };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Extract search parameters from user message
      const { searchQuery, cuisine, diet, type, protein, method } = extractSearchParams(userMessage);
      
      // Build filters for Spoonacular
      const filters = {};
      if (cuisine) filters.cuisine = cuisine;
      if (diet) filters.diet = diet;
      if (type) filters.type = type;
      
      // Search Spoonacular
      const foundRecipes = await searchSpoonacular(searchQuery, filters);
      setRecipes(foundRecipes);
      
      // Store context for refinements
      setConversationContext(prev => [...prev, { query: userMessage, recipes: foundRecipes }]);

      // Generate contextual response
      let response = '';
      if (foundRecipes.length > 0) {
        const description = [];
        if (method) description.push(method);
        if (cuisine) description.push(cuisine);
        if (protein) description.push(protein);
        if (diet) description.push(diet);
        if (type) description.push(type);
        
        if (description.length > 0) {
          response = `Great choice! I found ${foundRecipes.length} ${description.join(' ')} recipes for you.`;
        } else {
          response = `I found ${foundRecipes.length} recipes for "${searchQuery}". Take a look!`;
        }
      } else {
        response = `Hmm, I couldn't find recipes for that. Try something like "quick chicken dinner" or "vegetarian pasta" for better results!`;
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response 
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble searching for recipes. Please try again!' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110"
        >
          <ChefHat className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6" />
              <h2 className="font-semibold">Recipe Assistant</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-orange-600 rounded-full p-1 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* Recipe Cards */}
            {recipes.length > 0 && (
              <div className="space-y-2">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">
                        {recipe.title}
                      </h3>
                      <a
                        href={`https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-')}-${recipe.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline text-xs"
                      >
                        View Recipe →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  <span className="text-gray-600 text-sm">Searching recipes...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What would you like to cook?"
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}