import { useState, useMemo } from "react";
import { CuisineSelector } from "@/components/CuisineSelector";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeDetail } from "@/components/RecipeDetail";
import { TimerTray, ActiveTimer } from "@/components/TimerTray";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import recipesData from "@/data/recipes.json";

const Index = () => {
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedSubregion, setSelectedSubregion] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);

  const moods = [
    { name: "fast", emoji: "⚡", color: "bg-timer-warning" },
    { name: "lazy", emoji: "😌", color: "bg-timer-complete" },
    { name: "relax", emoji: "🧘", color: "bg-gradient-coconut" },
    { name: "enjoy", emoji: "🎉", color: "bg-gradient-warm" },
  ];

  const filteredRecipes = useMemo(() => {
    let filtered = recipesData.recipes;

    // Filter by cuisine
    if (selectedCuisine && selectedSubregion) {
      filtered = filtered.filter(recipe => 
        recipe.cuisine.region === selectedCuisine && 
        recipe.cuisine.subregion === selectedSubregion
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by mood
    if (moodFilter) {
      filtered = filtered.filter(recipe =>
        recipe.mood_tags.includes(moodFilter)
      );
    }

    return filtered;
  }, [selectedCuisine, selectedSubregion, searchQuery, moodFilter]);

  const selectedRecipeData = useMemo(() => {
    return recipesData.recipes.find(recipe => recipe.id === selectedRecipe);
  }, [selectedRecipe]);

  const handleCuisineSelect = (region: string, subregion: string | null) => {
    setSelectedCuisine(region || null);
    setSelectedSubregion(subregion);
    setSelectedRecipe(null);
  };

  const handleRecipeSelect = (recipeId: string) => {
    setSelectedRecipe(recipeId);
  };

  const handleBackToRecipes = () => {
    setSelectedRecipe(null);
  };

  const handleStartTimer = (timer: Omit<ActiveTimer, 'id'>) => {
    const newTimer: ActiveTimer = {
      ...timer,
      id: `timer-${Date.now()}-${Math.random()}`,
    };
    
    setActiveTimers(prev => [...prev, newTimer]);
    
    toast({
      title: "Timer Started! ⏰",
      description: `${timer.name} - ${Math.floor(timer.totalSeconds / 60)} minutes`,
    });
  };

  const handleTimerUpdate = (timerId: string, updates: Partial<ActiveTimer>) => {
    setActiveTimers(prev => 
      prev.map(timer => 
        timer.id === timerId ? { ...timer, ...updates } : timer
      )
    );
  };

  const handleTimerComplete = (timerId: string) => {
    const timer = activeTimers.find(t => t.id === timerId);
    if (timer) {
      toast({
        title: "Timer Complete! 🎉",
        description: `${timer.name} is ready!`,
        variant: "default",
      });
      
      handleTimerUpdate(timerId, { isRunning: false });
    }
  };

  const handleTimerRemove = (timerId: string) => {
    setActiveTimers(prev => prev.filter(timer => timer.id !== timerId));
  };

  if (selectedRecipeData) {
    return (
      <div className="min-h-screen bg-background flex">
        <RecipeDetail 
          recipe={selectedRecipeData}
          onBack={handleBackToRecipes}
          onStartTimer={handleStartTimer}
          activeTimers={activeTimers}
        />
        <TimerTray 
          timers={activeTimers}
          onTimerUpdate={handleTimerUpdate}
          onTimerComplete={handleTimerComplete}
          onTimerRemove={handleTimerRemove}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Cuisine Selector Sidebar */}
      <CuisineSelector 
        selectedCuisine={selectedCuisine}
        selectedSubregion={selectedSubregion}
        onCuisineSelect={handleCuisineSelect}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {selectedCuisine && selectedSubregion ? (
                    `${selectedSubregion} Recipes`
                  ) : (
                    "Discover Recipes"
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search recipes, ingredients..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Mood Filter */}
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-2">
                    {moods.map((mood) => (
                      <Button
                        key={mood.name}
                        variant={moodFilter === mood.name ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "text-xs",
                          moodFilter === mood.name && "bg-gradient-saffron"
                        )}
                        onClick={() => setMoodFilter(
                          moodFilter === mood.name ? null : mood.name
                        )}
                      >
                        {mood.emoji} {mood.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCuisine || moodFilter || searchQuery) && (
              <div className="flex items-center gap-2 mt-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2 flex-wrap">
                  {selectedCuisine && selectedSubregion && (
                    <Badge variant="secondary" className="gap-2">
                      {selectedSubregion}
                      <button 
                        onClick={() => handleCuisineSelect("", null)}
                        className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {moodFilter && (
                    <Badge variant="secondary" className="gap-2">
                      {moods.find(m => m.name === moodFilter)?.emoji} {moodFilter}
                      <button 
                        onClick={() => setMoodFilter(null)}
                        className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-2">
                      "{searchQuery}"
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Recipe Grid */}
        <main className="flex-1 container mx-auto px-6 py-8">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍽️</div>
              <h2 className="text-2xl font-bold mb-2">No recipes found</h2>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search terms
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setMoodFilter(null);
                  handleCuisineSelect("", null);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={handleRecipeSelect}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Timer Tray */}
      <TimerTray 
        timers={activeTimers}
        onTimerUpdate={handleTimerUpdate}
        onTimerComplete={handleTimerComplete}
        onTimerRemove={handleTimerRemove}
      />
    </div>
  );
};

export default Index;
