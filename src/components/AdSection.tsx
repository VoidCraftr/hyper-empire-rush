import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, X, Gift, Zap, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface AdReward {
  type: 'coins' | 'boost' | 'xp';
  amount: number;
  duration?: number; // for boosts in seconds
}

interface AdSectionProps {
  onRewardClaimed: (reward: AdReward) => void;
  gameLevel: number;
}

const AdSection: React.FC<AdSectionProps> = ({ onRewardClaimed, gameLevel }) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCooldown, setAdCooldown] = useState(0);
  const [dailyAdsWatched, setDailyAdsWatched] = useState(0);
  const [currentAdReward, setCurrentAdReward] = useState<AdReward | null>(null);

  // Reset daily ads at midnight
  useEffect(() => {
    const lastReset = localStorage.getItem('lastAdReset');
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
      setDailyAdsWatched(0);
      localStorage.setItem('lastAdReset', today);
      localStorage.setItem('dailyAdsWatched', '0');
    } else {
      const saved = localStorage.getItem('dailyAdsWatched');
      setDailyAdsWatched(saved ? parseInt(saved) : 0);
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (adCooldown > 0) {
      const timer = setTimeout(() => setAdCooldown(adCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [adCooldown]);

  const generateReward = (): AdReward => {
    const baseReward = Math.max(50, gameLevel * 25);
    const rewards: AdReward[] = [
      { type: 'coins', amount: baseReward * 2 },
      { type: 'coins', amount: baseReward * 3 },
      { type: 'boost', amount: 2, duration: 300 }, // 5 min 2x boost
      { type: 'boost', amount: 3, duration: 180 }, // 3 min 3x boost
      { type: 'xp', amount: gameLevel * 10 },
    ];
    
    return rewards[Math.floor(Math.random() * rewards.length)];
  };

  const startAd = () => {
    if (dailyAdsWatched >= 10) {
      toast.error('🎬 Daily ad limit reached! Come back tomorrow');
      return;
    }

    const reward = generateReward();
    setCurrentAdReward(reward);
    setIsWatchingAd(true);
  };

  const watchAd = () => {
    if (!currentAdReward) return;

    // Simulate ad watching (3 seconds)
    setTimeout(() => {
      setIsWatchingAd(false);
      onRewardClaimed(currentAdReward);
      
      const newCount = dailyAdsWatched + 1;
      setDailyAdsWatched(newCount);
      localStorage.setItem('dailyAdsWatched', newCount.toString());
      
      setAdCooldown(60); // 1 minute cooldown
      setCurrentAdReward(null);

      let message = '';
      switch (currentAdReward.type) {
        case 'coins':
          message = `💰 +$${currentAdReward.amount} coins!`;
          break;
        case 'boost':
          message = `⚡ ${currentAdReward.amount}x earnings for ${Math.floor((currentAdReward.duration || 0) / 60)} minutes!`;
          break;
        case 'xp':
          message = `🌟 +${currentAdReward.amount} XP!`;
          break;
      }
      
      toast.success(message, { duration: 3000 });
    }, 3000);
  };

  const closeAd = () => {
    setIsWatchingAd(false);
    setCurrentAdReward(null);
    setAdCooldown(30); // Short cooldown for closing ad
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isWatchingAd && currentAdReward) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <Card className="p-6 max-w-md w-full mx-4 text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={closeAd}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold">Watching Ad...</h3>
            <div className="bg-muted rounded-full h-2">
              <div className="bg-gradient-primary h-2 rounded-full animate-pulse w-full"></div>
            </div>
            
            <div className="text-muted-foreground">
              Reward Preview:
              <div className="mt-2 p-3 bg-card rounded-lg">
                {currentAdReward.type === 'coins' && (
                  <div className="flex items-center gap-2 justify-center">
                    <DollarSign className="w-5 h-5 text-coin" />
                    <span className="font-bold text-coin">+${currentAdReward.amount}</span>
                  </div>
                )}
                {currentAdReward.type === 'boost' && (
                  <div className="flex items-center gap-2 justify-center">
                    <Zap className="w-5 h-5 text-accent" />
                    <span className="font-bold text-accent">
                      {currentAdReward.amount}x for {Math.floor((currentAdReward.duration || 0) / 60)}min
                    </span>
                  </div>
                )}
                {currentAdReward.type === 'xp' && (
                  <div className="flex items-center gap-2 justify-center">
                    <Gift className="w-5 h-5 text-secondary" />
                    <span className="font-bold text-secondary">+{currentAdReward.amount} XP</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="neon"
              onClick={watchAd}
              className="w-full"
            >
              Claim Reward
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-4 card-glow">
      <div className="text-center space-y-3">
        <div className="flex items-center gap-2 justify-center">
          <Play className="w-5 h-5 text-primary" />
          <h3 className="font-bold">Free Rewards</h3>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Ads watched today: {dailyAdsWatched}/10
        </div>
        
        {adCooldown > 0 ? (
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Next ad in:</div>
            <div className="text-lg font-bold text-accent">{formatTime(adCooldown)}</div>
          </div>
        ) : dailyAdsWatched >= 10 ? (
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Come back tomorrow!</div>
          </div>
        ) : (
          <Button
            variant="neon"
            onClick={startAd}
            className="w-full"
            disabled={adCooldown > 0 || dailyAdsWatched >= 10}
          >
            <Play className="w-4 h-4 mr-2" />
            Watch Ad for Reward
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AdSection;