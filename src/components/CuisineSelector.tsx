import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import recipesData from "@/data/recipes.json";

interface CuisineSelectorProps {
  selectedCuisine: string | null;
  selectedSubregion: string | null;
  onCuisineSelect: (region: string, subregion: string | null) => void;
}

export function CuisineSelector({ selectedCuisine, selectedSubregion, onCuisineSelect }: CuisineSelectorProps) {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const getCuisineGradient = (color: string) => {
    const gradientMap: Record<string, string> = {
      "south-indian-green": "bg-gradient-coconut",
      "north-indian-warm": "bg-gradient-warm",
      "indian-curry": "bg-gradient-spice",
      "indian-chili": "bg-gradient-spice",
      "indian-tamarind": "bg-gradient-spice",
      "global-tomato": "bg-gradient-global",
      "global-teal": "bg-gradient-global",
      "global-basil": "bg-gradient-global",
    };
    return gradientMap[color] || "bg-gradient-saffron";
  };

  return (
    <div className="w-80 h-full bg-card border-r border-border p-4 sm:p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-saffron bg-clip-text text-transparent">
            RecipeFlow
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Cuisine-guided cooking</p>
        </div>
      </div>

      <div className="space-y-4">
        {recipesData.cuisines.map((cuisine) => (
          <Card key={cuisine.region} className="overflow-hidden">
            <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between p-3 sm:p-4 h-auto font-semibold",
                    expandedRegion === cuisine.region && "bg-accent"
                  )}
                  onClick={() => setExpandedRegion(
                    expandedRegion === cuisine.region ? null : cuisine.region
                  )}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-base sm:text-lg">{cuisine.region}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {cuisine.subregions.length} regions
                  </Badge>
                </Button>

              {expandedRegion === cuisine.region && (
                <div className="border-t bg-accent/30">
                  {cuisine.subregions.map((subregion) => (
                      <Button
                        key={subregion.name}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start p-3 sm:p-4 h-auto text-left rounded-none",
                          selectedCuisine === cuisine.region && 
                          selectedSubregion === subregion.name && 
                          "bg-primary/10 border-r-4 border-r-primary"
                        )}
                        onClick={() => onCuisineSelect(cuisine.region, subregion.name)}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 w-full">
                          <div className={cn(
                            "w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0",
                            getCuisineGradient(subregion.color)
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">{subregion.name}</div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {subregion.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => onCuisineSelect("", null)}
        >
          🌍 View All Recipes
        </Button>
      </div>
    </div>
  );
}