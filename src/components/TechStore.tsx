import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Monitor, Gamepad2, Headphones, Zap, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  icon: React.ReactNode;
  basePrice: number;
  sellPrice: number;
  upgradeLevel: number;
  upgradeCost: number;
}

interface GameState {
  coins: number;
  totalSales: number;
  clickPower: number;
  autoSellPower: number;
  level: number;
  experience: number;
  experienceToNext: number;
}

const TechStore: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    coins: 0,
    totalSales: 0,
    clickPower: 1,
    autoSellPower: 0,
    level: 1,
    experience: 0,
    experienceToNext: 100
  });

  const [products, setProducts] = useState<Product[]>([
    {
      id: 'smartphone',
      name: 'Smartphones',
      icon: <Smartphone className="w-6 h-6" />,
      basePrice: 10,
      sellPrice: 15,
      upgradeLevel: 1,
      upgradeCost: 50
    },
    {
      id: 'monitor',
      name: 'Gaming Monitor',
      icon: <Monitor className="w-6 h-6" />,
      basePrice: 25,
      sellPrice: 40,
      upgradeLevel: 1,
      upgradeCost: 150
    },
    {
      id: 'gamepad',
      name: 'Gaming Controller',
      icon: <Gamepad2 className="w-6 h-6" />,
      basePrice: 15,
      sellPrice: 25,
      upgradeLevel: 1,
      upgradeCost: 100
    },
    {
      id: 'headphones',
      name: 'Gaming Headset',
      icon: <Headphones className="w-6 h-6" />,
      basePrice: 20,
      sellPrice: 35,
      upgradeLevel: 1,
      upgradeCost: 120
    }
  ]);

  const [coinAnimations, setCoinAnimations] = useState<Array<{ id: number; amount: number; x: number; y: number }>>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboCount, setComboCount] = useState(0);

  // Auto-sell effect
  useEffect(() => {
    if (gameState.autoSellPower > 0) {
      const interval = setInterval(() => {
        const autoEarnings = gameState.autoSellPower;
        setGameState(prev => ({
          ...prev,
          coins: prev.coins + autoEarnings,
          totalSales: prev.totalSales + autoEarnings
        }));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameState.autoSellPower]);

  // Level up effect
  useEffect(() => {
    if (gameState.experience >= gameState.experienceToNext) {
      setGameState(prev => ({
        ...prev,
        level: prev.level + 1,
        experience: prev.experience - prev.experienceToNext,
        experienceToNext: Math.floor(prev.experienceToNext * 1.5),
        clickPower: prev.clickPower + 1
      }));
      
      toast.success(`🎉 Level ${gameState.level + 1}! Click power increased!`, {
        duration: 3000,
      });
      
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 300);
    }
  }, [gameState.experience, gameState.experienceToNext, gameState.level]);

  // Combo reset effect
  useEffect(() => {
    const comboTimeout = setTimeout(() => {
      setComboMultiplier(1);
      setComboCount(0);
    }, 2000);
    
    return () => clearTimeout(comboTimeout);
  }, [comboCount]);

  const sellProduct = useCallback((product: Product, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const earnings = Math.floor(product.sellPrice * gameState.clickPower * comboMultiplier);
    const experience = Math.floor(earnings * 0.1);
    
    // Update combo
    setComboCount(prev => prev + 1);
    if (comboCount > 0 && comboCount % 5 === 0) {
      setComboMultiplier(prev => Math.min(prev + 0.5, 5));
    }
    
    // Add coin animation
    const animationId = Date.now() + Math.random();
    setCoinAnimations(prev => [...prev, { id: animationId, amount: earnings, x, y }]);
    
    // Remove animation after completion
    setTimeout(() => {
      setCoinAnimations(prev => prev.filter(anim => anim.id !== animationId));
    }, 800);
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + earnings,
      totalSales: prev.totalSales + earnings,
      experience: prev.experience + experience
    }));
    
    // Big sale screen shake
    if (earnings > 100) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 300);
    }
    
    // Random positive messages
    const messages = [
      `💰 +$${earnings}!`,
      `🔥 Great sale!`,
      `⚡ Combo x${comboMultiplier.toFixed(1)}!`,
      `🎯 Perfect!`
    ];
    
    if (Math.random() > 0.7) {
      toast.success(messages[Math.floor(Math.random() * messages.length)], {
        duration: 1000,
      });
    }
  }, [gameState.clickPower, comboMultiplier, comboCount]);

  const upgradeProduct = useCallback((productId: string) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId && gameState.coins >= product.upgradeCost) {
        setGameState(prevState => ({
          ...prevState,
          coins: prevState.coins - product.upgradeCost,
          autoSellPower: prevState.autoSellPower + Math.floor(product.sellPrice * 0.1)
        }));
        
        toast.success(`🚀 ${product.name} upgraded! +Auto-sell`, {
          duration: 2000,
        });
        
        return {
          ...product,
          upgradeLevel: product.upgradeLevel + 1,
          sellPrice: Math.floor(product.sellPrice * 1.3),
          upgradeCost: Math.floor(product.upgradeCost * 1.8)
        };
      }
      return product;
    }));
  }, [gameState.coins]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num}`;
  };

  return (
    <div className={`min-h-screen p-4 ${screenShake ? 'screen-shake' : ''}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 card-glow">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-coin" />
              <div>
                <p className="text-sm text-muted-foreground">Coins</p>
                <p className="text-xl font-bold neon-glow">{formatNumber(gameState.coins)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 card-glow">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Level {gameState.level}</p>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(gameState.experience / gameState.experienceToNext) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 card-glow">
            <div>
              <p className="text-sm text-muted-foreground">Click Power</p>
              <p className="text-xl font-bold text-accent neon-glow">{gameState.clickPower}x</p>
            </div>
          </Card>
          
          <Card className="p-4 card-glow">
            <div>
              <p className="text-sm text-muted-foreground">Auto-Sell/sec</p>
              <p className="text-xl font-bold text-secondary neon-glow">
                {formatNumber(gameState.autoSellPower)}
              </p>
            </div>
          </Card>
        </div>

        {/* Combo Indicator */}
        {comboCount > 0 && (
          <div className="text-center mb-4">
            <div className="inline-block bg-gradient-accent px-4 py-2 rounded-lg neon-glow pop-in">
              <span className="text-lg font-bold">
                🔥 COMBO {comboCount} • {comboMultiplier.toFixed(1)}x MULTIPLIER!
              </span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4 relative overflow-hidden card-glow hover:scale-105 transition-transform duration-200">
              {/* Coin Animations */}
              {coinAnimations
                .filter(anim => anim.x >= 0 && anim.y >= 0)
                .map((animation) => (
                  <div
                    key={animation.id}
                    className="absolute pointer-events-none coin-bounce text-coin font-bold text-lg z-10"
                    style={{
                      left: animation.x,
                      top: animation.y,
                    }}
                  >
                    +${animation.amount}
                  </div>
                ))}
              
              <div className="text-center space-y-3">
                <div className="flex justify-center text-primary neon-glow">
                  {product.icon}
                </div>
                
                <h3 className="font-bold text-foreground">{product.name}</h3>
                <div className="text-sm text-muted-foreground">
                  Level {product.upgradeLevel}
                </div>
                
                <Button
                  variant="neon"
                  size="lg"
                  className="w-full pulse-glow"
                  onClick={(event) => sellProduct(product, event)}
                >
                  SELL {formatNumber(product.sellPrice * gameState.clickPower)}
                </Button>
                
                <Button
                  variant="game"
                  size="sm"
                  className="w-full"
                  onClick={() => upgradeProduct(product.id)}
                  disabled={gameState.coins < product.upgradeCost}
                >
                  ⬆️ Upgrade ({formatNumber(product.upgradeCost)})
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="mt-6 text-center text-muted-foreground">
          <p>Total Sales: {formatNumber(gameState.totalSales)}</p>
          {gameState.autoSellPower > 0 && (
            <p className="text-accent">💫 Auto-earning: {formatNumber(gameState.autoSellPower)}/sec</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechStore;