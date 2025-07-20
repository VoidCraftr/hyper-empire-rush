import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Zap, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  reward: {
    coins?: number;
    clickPower?: number;
    autoSell?: number;
  };
  category: 'sales' | 'upgrades' | 'level' | 'special';
  unlocked: boolean;
  progress: number;
}

interface GameStats {
  totalSales: number;
  totalUpgrades: number;
  level: number;
  comboCount: number;
}

interface AchievementSystemProps {
  stats: GameStats;
  onRewardClaimed: (reward: { coins?: number; clickPower?: number; autoSell?: number }) => void;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ stats, onRewardClaimed }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_sale',
      title: 'First Sale',
      description: 'Make your first sale',
      icon: <DollarSign className="w-4 h-4" />,
      requirement: 1,
      reward: { coins: 50 },
      category: 'sales',
      unlocked: false,
      progress: 0
    },
    {
      id: 'sales_100',
      title: 'Rising Entrepreneur',
      description: 'Reach $100 in total sales',
      icon: <Target className="w-4 h-4" />,
      requirement: 100,
      reward: { coins: 200, clickPower: 1 },
      category: 'sales',
      unlocked: false,
      progress: 0
    },
    {
      id: 'sales_1000',
      title: 'Business Mogul',
      description: 'Reach $1,000 in total sales',
      icon: <Trophy className="w-4 h-4" />,
      requirement: 1000,
      reward: { coins: 500, autoSell: 10 },
      category: 'sales',
      unlocked: false,
      progress: 0
    },
    {
      id: 'sales_10000',
      title: 'Tech Empire',
      description: 'Reach $10,000 in total sales',
      icon: <Star className="w-4 h-4" />,
      requirement: 10000,
      reward: { coins: 2000, clickPower: 3 },
      category: 'sales',
      unlocked: false,
      progress: 0
    },
    {
      id: 'first_upgrade',
      title: 'Upgrader',
      description: 'Purchase your first upgrade',
      icon: <Zap className="w-4 h-4" />,
      requirement: 1,
      reward: { coins: 100 },
      category: 'upgrades',
      unlocked: false,
      progress: 0
    },
    {
      id: 'upgrades_10',
      title: 'Optimization Expert',
      description: 'Purchase 10 upgrades',
      icon: <Target className="w-4 h-4" />,
      requirement: 10,
      reward: { coins: 300, autoSell: 5 },
      category: 'upgrades',
      unlocked: false,
      progress: 0
    },
    {
      id: 'level_5',
      title: 'Experienced Seller',
      description: 'Reach level 5',
      icon: <Star className="w-4 h-4" />,
      requirement: 5,
      reward: { coins: 400, clickPower: 2 },
      category: 'level',
      unlocked: false,
      progress: 0
    },
    {
      id: 'level_10',
      title: 'Master Merchant',
      description: 'Reach level 10',
      icon: <Trophy className="w-4 h-4" />,
      requirement: 10,
      reward: { coins: 1000, clickPower: 5 },
      category: 'level',
      unlocked: false,
      progress: 0
    }
  ]);

  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  useEffect(() => {
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      try {
        setAchievements(JSON.parse(savedAchievements));
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }
    }
  }, []);

  useEffect(() => {
    let updated = false;
    const updatedAchievements = achievements.map(achievement => {
      let progress = 0;
      let shouldUnlock = false;

      switch (achievement.category) {
        case 'sales':
          progress = Math.min(stats.totalSales, achievement.requirement);
          shouldUnlock = stats.totalSales >= achievement.requirement;
          break;
        case 'upgrades':
          progress = Math.min(stats.totalUpgrades, achievement.requirement);
          shouldUnlock = stats.totalUpgrades >= achievement.requirement;
          break;
        case 'level':
          progress = Math.min(stats.level, achievement.requirement);
          shouldUnlock = stats.level >= achievement.requirement;
          break;
      }

      if (!achievement.unlocked && shouldUnlock) {
        updated = true;
        setNewlyUnlocked(prev => [...prev, achievement.id]);
        
        // Show achievement notification
        toast.success(`🏆 Achievement Unlocked: ${achievement.title}!`, {
          description: achievement.description,
          duration: 4000,
        });

        // Give reward
        onRewardClaimed(achievement.reward);

        return { ...achievement, unlocked: true, progress: achievement.requirement };
      }

      if (achievement.progress !== progress) {
        updated = true;
        return { ...achievement, progress };
      }

      return achievement;
    });

    if (updated) {
      setAchievements(updatedAchievements);
      localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
    }
  }, [stats, achievements, onRewardClaimed]);

  // Clear newly unlocked after showing animation
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      const timer = setTimeout(() => {
        setNewlyUnlocked([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales': return <DollarSign className="w-4 h-4" />;
      case 'upgrades': return <Zap className="w-4 h-4" />;
      case 'level': return <Star className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min((achievement.progress / achievement.requirement) * 100, 100);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <Card className="p-4 card-glow">
      <div className="space-y-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Achievements</h3>
          </div>
          <Badge variant="secondary">
            {unlockedCount}/{totalCount}
          </Badge>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                achievement.unlocked
                  ? 'bg-card border-primary/50 shadow-glow-primary'
                  : 'bg-muted/30 border-muted'
              } ${
                newlyUnlocked.includes(achievement.id)
                  ? 'animate-pulse border-accent shadow-glow-accent'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${
                      achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </h4>
                    {achievement.unlocked && (
                      <Trophy className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.requirement}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(achievement)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {achievement.unlocked && (
                    <div className="text-xs text-accent font-medium">
                      Reward: {achievement.reward.coins && `+$${achievement.reward.coins}`}
                      {achievement.reward.clickPower && ` +${achievement.reward.clickPower} Click Power`}
                      {achievement.reward.autoSell && ` +${achievement.reward.autoSell} Auto-Sell`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AchievementSystem;