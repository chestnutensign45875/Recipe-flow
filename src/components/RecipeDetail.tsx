import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, Users, ChefHat, Play, CheckCircle, 
  ArrowLeft, Timer, Utensils 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveTimer } from "./TimerTray";

const images = import.meta.glob('@/assets/*.jpg', { eager: true, as: 'url' });

interface Recipe {
  id: string;
  title: string;
  cuisine: { region: string; subregion: string };
  hero_image: string;
  total_time_min: number;
  difficulty: string;
  serves: number;
  prerequisites: string[];
  diet: string[];
  mood_tags: string[];
  description: string;
  steps: Array<{
    index: number;
    emoji: string;
    title: string;
    text: string;
    image: string;
    timer_min: number;
    linked_ingredients: string[];
    youtube?: string;
  }>;
  ingredients: Array<{
    name: string;
    qty: number | string;
    unit: string;
    substitutions: string[];
  }>;
  nutritional_info: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
}

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onStartTimer: (timer: Omit<ActiveTimer, 'id'>) => void;
  activeTimers: ActiveTimer[];
}

export function RecipeDetail({ recipe, onBack, onStartTimer, activeTimers }: RecipeDetailProps) {
  const [completedPrereqs, setCompletedPrereqs] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const getImageSrc = (imageName: string) => {
    const imagePath = `/assets/${imageName}`;
    const imageKey = Object.keys(images).find(key => images[key].includes(imagePath));
    return imageKey ? images[imageKey] : images['/assets/masala-dosa-hero.jpg'];
  };

  const getCuisineGradient = (region: string, subregion: string) => {
    if (region === "Indian") {
      if (subregion.includes("South")) return "bg-gradient-coconut";
      if (subregion.includes("North")) return "bg-gradient-warm";
      return "bg-gradient-spice";
    }
    return "bg-gradient-global";
  };

  const togglePrereq = (index: number) => {
    const newCompleted = new Set(completedPrereqs);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedPrereqs(newCompleted);
  };

  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  const startStepTimer = (step: Recipe['steps'][0]) => {
    const timerName = `Step ${step.index}: ${step.title}`;
    const linkedIngredient = step.linked_ingredients[0];
    
    onStartTimer({
      name: timerName,
      totalSeconds: step.timer_min * 60,
      remainingSeconds: step.timer_min * 60,
      isRunning: true,
      stepIndex: step.index,
      linkedIngredient,
    });
  };

  const isTimerRunningForStep = (stepIndex: number) => {
    return activeTimers.some(timer => 
      timer.stepIndex === stepIndex && timer.remainingSeconds > 0
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                getCuisineGradient(recipe.cuisine.region, recipe.cuisine.subregion)
              )} />
              <span className="text-sm text-muted-foreground">
                {recipe.cuisine.subregion}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="relative">
            <img 
              src={getImageSrc(recipe.hero_image)}
              alt={recipe.title}
              className="w-full h-80 object-cover rounded-lg shadow-soft"
            />
            <div className={cn(
              "absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium",
              getCuisineGradient(recipe.cuisine.region, recipe.cuisine.subregion)
            )}>
              {recipe.difficulty}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-3">{recipe.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {recipe.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{recipe.total_time_min} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Serves {recipe.serves}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-primary" />
                  <span>{recipe.difficulty}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Dietary Information</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.diet.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {recipe.mood_tags.map((tag) => (
                  <Badge key={tag} className="bg-gradient-saffron text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-accent/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Nutritional Info (per serving)</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Calories: {recipe.nutritional_info.calories}</div>
                <div>Protein: {recipe.nutritional_info.protein}</div>
                <div>Carbs: {recipe.nutritional_info.carbs}</div>
                <div>Fat: {recipe.nutritional_info.fat}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Prerequisites & Ingredients */}
          <div className="space-y-6">
            {/* Prerequisites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipe.prerequisites.map((prereq, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={() => togglePrereq(index)}
                    >
                      <CheckCircle className={cn(
                        "h-4 w-4",
                        completedPrereqs.has(index) 
                          ? "text-timer-complete fill-current" 
                          : "text-muted-foreground"
                      )} />
                    </Button>
                    <span className={cn(
                      "text-sm",
                      completedPrereqs.has(index) && "line-through text-muted-foreground"
                    )}>
                      {prereq}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium capitalize">{ingredient.name}</div>
                      {ingredient.substitutions.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Alt: {ingredient.substitutions.join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {ingredient.qty} {ingredient.unit}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Cooking Steps */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Cooking Steps</h2>
              <Badge variant="outline">{recipe.steps.length} steps</Badge>
            </div>

            <div className="space-y-6">
              {recipe.steps.map((step, index) => (
                <Card key={step.index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full font-bold text-white",
                            completedSteps.has(step.index) 
                              ? "bg-timer-complete" 
                              : "bg-gradient-saffron"
                          )}>
                            {completedSteps.has(step.index) ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <span>{step.index}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">
                              {step.emoji} {step.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {step.text}
                            </p>
                            
                            {step.linked_ingredients.length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm font-medium mb-1">Key ingredients:</div>
                                <div className="flex flex-wrap gap-1">
                                  {step.linked_ingredients.map((ingredient) => (
                                    <Badge key={ingredient} variant="outline" className="text-xs">
                                      🥘 {ingredient}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            variant={completedSteps.has(step.index) ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => toggleStep(step.index)}
                          >
                            {completedSteps.has(step.index) ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Completed
                              </>
                            ) : (
                              "Mark Complete"
                            )}
                          </Button>

                          {step.timer_min > 0 && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-gradient-saffron hover:opacity-90"
                              onClick={() => startStepTimer(step)}
                              disabled={isTimerRunningForStep(step.index)}
                            >
                              <Timer className="h-4 w-4 mr-2" />
                              {isTimerRunningForStep(step.index) 
                                ? "Timer Running" 
                                : `Start ${step.timer_min}m Timer`
                              }
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <img 
                          src={getImageSrc(step.image)}
                          alt={`Step ${step.index}: ${step.title}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {step.timer_min > 0 && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            ⏲ {step.timer_min}m
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}