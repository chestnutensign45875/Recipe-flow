import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const images = import.meta.glob('@/assets/*.jpg', { eager: true, as: 'url' });

interface Recipe {
  id: string;
  title: string;
  cuisine: { region: string; subregion: string };
  hero_image: string;
  total_time_min: number;
  difficulty: string;
  serves: number;
  diet: string[];
  mood_tags: string[];
  description: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipeId: string) => void;
}

export function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  const getImageSrc = (imageName: string) => {
    const foundImageKey = Object.keys(images).find(key => key.endsWith(`/${imageName}`));
    return foundImageKey ? images[foundImageKey] : images['/assets/masala-dosa-hero.jpg'];
  };

  const getDifficultyColor = (difficulty: string) => {
    const colorMap: Record<string, string> = {
      "Easy": "bg-timer-complete text-white",
      "Medium": "bg-timer-warning text-white", 
      "Hard": "bg-destructive text-destructive-foreground",
    };
    return colorMap[difficulty] || "bg-secondary";
  };

  const getCuisineGradient = (region: string, subregion: string) => {
    if (region === "Indian") {
      if (subregion.includes("South")) return "bg-gradient-coconut";
      if (subregion.includes("North")) return "bg-gradient-warm";
      return "bg-gradient-spice";
    }
    return "bg-gradient-global";
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-warm hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img 
          src={getImageSrc(recipe.hero_image)}
          alt={recipe.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className={cn(
          "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white",
          getCuisineGradient(recipe.cuisine.region, recipe.cuisine.subregion)
        )}>
          {recipe.cuisine.subregion}
        </div>
        <Badge 
          className={cn("absolute top-3 right-3", getDifficultyColor(recipe.difficulty))}
        >
          {recipe.difficulty}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.total_time_min} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Serves {recipe.serves}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>{recipe.mood_tags[0]}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {recipe.diet.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {recipe.diet.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{recipe.diet.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-gradient-saffron hover:opacity-90 transition-opacity"
          onClick={() => onSelect(recipe.id)}
        >
          Start Cooking 🍳
        </Button>
      </CardFooter>
    </Card>
  );
}