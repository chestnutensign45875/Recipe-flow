import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, Play, Pause, Square, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActiveTimer {
  id: string;
  name: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  stepIndex: number;
  linkedIngredient?: string;
}

interface TimerTrayProps {
  timers: ActiveTimer[];
  onTimerUpdate: (timerId: string, updates: Partial<ActiveTimer>) => void;
  onTimerComplete: (timerId: string) => void;
  onTimerRemove: (timerId: string) => void;
}

export function TimerTray({ timers, onTimerUpdate, onTimerComplete, onTimerRemove }: TimerTrayProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      
      timers.forEach((timer) => {
        if (timer.isRunning && timer.remainingSeconds > 0) {
          const newRemaining = Math.max(0, timer.remainingSeconds - 1);
          onTimerUpdate(timer.id, { remainingSeconds: newRemaining });
          
          if (newRemaining === 0) {
            onTimerComplete(timer.id);
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timers, onTimerUpdate, onTimerComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerStatus = (timer: ActiveTimer) => {
    if (timer.remainingSeconds === 0) return 'complete';
    if (timer.remainingSeconds <= 30) return 'warning';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-timer-complete border-timer-complete bg-timer-complete/10';
      case 'warning': return 'text-timer-warning border-timer-warning bg-timer-warning/10';
      default: return 'text-timer-active border-timer-active bg-timer-active/10';
    }
  };

  if (timers.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 max-h-96 overflow-y-auto">
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Active Timers</h3>
            <Badge variant="secondary">{timers.length}</Badge>
          </div>

          <div className="space-y-3">
            {timers.map((timer) => {
              const status = getTimerStatus(timer);
              return (
                <Card key={timer.id} className={cn("p-3 border", getStatusColor(status))}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{timer.name}</div>
                      {timer.linkedIngredient && (
                        <div className="text-xs text-muted-foreground">
                          🥘 {timer.linkedIngredient}
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "text-xl font-mono font-bold",
                      status === 'complete' && "animate-pulse-timer"
                    )}>
                      {formatTime(timer.remainingSeconds)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => onTimerUpdate(timer.id, { isRunning: !timer.isRunning })}
                      disabled={timer.remainingSeconds === 0}
                    >
                      {timer.isRunning ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => onTimerUpdate(timer.id, { 
                        remainingSeconds: timer.totalSeconds,
                        isRunning: false 
                      })}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onTimerRemove(timer.id)}
                    >
                      <Square className="h-3 w-3" />
                    </Button>

                    {status === 'complete' && (
                      <Badge className="bg-timer-complete text-white animate-bounce-timer">
                        Done! 🎉
                      </Badge>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-1 mt-2">
                    <div 
                      className={cn(
                        "h-1 rounded-full transition-all duration-1000",
                        status === 'complete' ? 'bg-timer-complete' :
                        status === 'warning' ? 'bg-timer-warning' : 'bg-timer-active'
                      )}
                      style={{ 
                        width: `${((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100}%` 
                      }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}