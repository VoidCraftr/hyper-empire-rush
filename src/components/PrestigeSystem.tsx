import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Crown, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface PrestigeBonus {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  currentLevel: number;
  effect: string;
}

interface PrestigeSystemProps {
  gameState: {
    level: number;
    totalSales: number;
    coins: number;
  };
  onPrestige: (bonuses: PrestigeBonus[]) => void;
}

const PrestigeSystem: React.FC<PrestigeSystemProps> = ({ gameState, onPrestige }) => {
  const [prestigePoints, setPrestigePoints] = useState(() => {
    const saved = localStorage.getItem('prestigePoints');
    return saved ? parseInt(saved) : 0;
  });

  const [prestigeLevel, setPrestigeLevel] = useState(() => {
    const saved = localStorage.getItem('prestigeLevel');
    return saved ? parseInt(saved) : 0;
  });

  const [bonuses, setBonuses] = useState<PrestigeBonus[]>(() => {
    const saved = localStorage.getItem('prestigeBonuses');
    return saved ? JSON.parse(saved) : [
      {
        id: 'click_power',
        name: 'Click Master',
        description: 'Increases base click power',
        cost: 1,
        maxLevel: 10,
        currentLevel: 0,
        effect: '+1 click power per level'
      },
      {
        id: 'auto_sell_boost',
        name: 'Automation Expert',
        description: 'Boosts auto-sell efficiency',
        cost: 2,
        maxLevel: 5,
        currentLevel: 0,
        effect: '+50% auto-sell per level'
      },
      {
        id: 'exp_multiplier',
        name: 'Fast Learner',
        description: 'Increases XP gain',
        cost: 3,
        maxLevel: 5,
        currentLevel: 0,
        effect: '+25% XP gain per level'
      },
      {
        id: 'starting_coins',
        name: 'Rich Start',
        description: 'Start with more coins',
        cost: 2,
        maxLevel: 8,
        currentLevel: 0,
        effect: '+$500 starting coins per level'
      }
    ];
  });

  const [showConfirm, setShowConfirm] = useState(false);

  const canPrestige = gameState.level >= 10 && gameState.totalSales >= 5000;
  const prestigePointsToGain = Math.floor(gameState.level / 2) + Math.floor(gameState.totalSales / 1000);

  const handlePrestige = () => {
    if (!canPrestige) return;

    const newPrestigePoints = prestigePoints + prestigePointsToGain;
    const newPrestigeLevel = prestigeLevel + 1;

    setPrestigePoints(newPrestigePoints);
    setPrestigeLevel(newPrestigeLevel);
    
    localStorage.setItem('prestigePoints', newPrestigePoints.toString());
    localStorage.setItem('prestigeLevel', newPrestigeLevel.toString());

    onPrestige(bonuses);
    setShowConfirm(false);

    toast.success(`🌟 Prestige ${newPrestigeLevel}! Gained ${prestigePointsToGain} Prestige Points!`, {
      duration: 4000,
    });
  };

  const upgradeBonu = (bonusId: string) => {
    const bonus = bonuses.find(b => b.id === bonusId);
    if (!bonus || bonus.currentLevel >= bonus.maxLevel) return;

    const cost = bonus.cost * (bonus.currentLevel + 1);
    if (prestigePoints < cost) return;

    const updatedBonuses = bonuses.map(b => {
      if (b.id === bonusId) {
        return { ...b, currentLevel: b.currentLevel + 1 };
      }
      return b;
    });

    setBonuses(updatedBonuses);
    setPrestigePoints(prestigePoints - cost);
    
    localStorage.setItem('prestigeBonuses', JSON.stringify(updatedBonuses));
    localStorage.setItem('prestigePoints', (prestigePoints - cost).toString());

    toast.success(`⭐ ${bonus.name} upgraded to level ${bonus.currentLevel + 1}!`);
  };

  const getBonusCost = (bonus: PrestigeBonus) => {
    return bonus.cost * (bonus.currentLevel + 1);
  };

  if (showConfirm) {
    return (
      <Card className="p-6 card-glow">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold">Prestige Confirmation</h3>
          
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Are you sure you want to prestige? This will:
            </p>
            <div className="bg-destructive/20 p-3 rounded-lg">
              <p className="text-destructive font-medium">• Reset your level, coins, and upgrades</p>
              <p className="text-destructive font-medium">• Reset all products to level 1</p>
            </div>
            <div className="bg-accent/20 p-3 rounded-lg">
              <p className="text-accent font-medium">• Gain {prestigePointsToGain} Prestige Points</p>
              <p className="text-accent font-medium">• Keep all achievements and prestige bonuses</p>
              <p className="text-accent font-medium">• Unlock prestige-only features</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePrestige}
              className="flex-1"
            >
              Prestige Now
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 card-glow">
      <div className="space-y-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Prestige System</h3>
          </div>
          <Badge variant="secondary">
            Level {prestigeLevel}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground">Prestige Points</p>
            <p className="text-lg font-bold text-accent">{prestigePoints}</p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground">Next Gain</p>
            <p className="text-lg font-bold text-secondary">+{prestigePointsToGain}</p>
          </div>
        </div>

        {canPrestige ? (
          <Button
            variant="neon"
            onClick={() => setShowConfirm(true)}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Prestige for {prestigePointsToGain} Points
          </Button>
        ) : (
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Unlock at Level 10 + $5,000 total sales
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Current: Level {gameState.level}, ${Math.floor(gameState.totalSales)} sales
            </p>
          </div>
        )}

        {/* Prestige Bonuses */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Star className="w-4 h-4" />
            Prestige Bonuses
          </h4>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {bonuses.map((bonus) => (
              <div key={bonus.id} className="p-3 bg-card rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{bonus.name}</h5>
                  <Badge variant={bonus.currentLevel > 0 ? "default" : "outline"}>
                    {bonus.currentLevel}/{bonus.maxLevel}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {bonus.description}
                </p>
                
                <p className="text-xs text-accent mb-3">
                  {bonus.effect}
                </p>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => upgradeBonu(bonus.id)}
                  disabled={
                    bonus.currentLevel >= bonus.maxLevel ||
                    prestigePoints < getBonusCost(bonus)
                  }
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Upgrade ({getBonusCost(bonus)} PP)
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PrestigeSystem;