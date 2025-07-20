import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Smartphone,
  Monitor,
  Gamepad2,
  Headphones,
  Zap,
  DollarSign,
  Trophy,
  Target,
  Sparkles,
  Gift,
  Clock,
  TrendingUp,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  icon: React.ReactNode;
  basePrice: number;
  sellPrice: number;
  upgradeLevel: number;
  upgradeCost: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  currentProgress: number;
  completed: boolean;
  reward: number;
  icon: React.ReactNode;
}

interface GameState {
  coins: number;
  totalSales: number;
  clickPower: number;
  autoSellPower: number;
  level: number;
  experience: number;
  experienceToNext: number;
  prestigePoints: number;
  gameTime: number;
  isPaused: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

const EnhancedTechStore: React.FC = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    coins: 0,
    totalSales: 0,
    clickPower: 1,
    autoSellPower: 0,
    level: 0,
    experience: 0,
    experienceToNext: 100,
    prestigePoints: 0,
    gameTime: 0,
    isPaused: false,
    soundEnabled: true,
    musicEnabled: true,
  });

  const [products, setProducts] = useState<Product[]>([
    {
      id: "smartphone",
      name: "Smartphones",
      icon: <Smartphone className="w-6 h-6" />,
      basePrice: 10,
      sellPrice: 15,
      upgradeLevel: 1,
      upgradeCost: 50,
      rarity: "common",
    },
    {
      id: "monitor",
      name: "Gaming Monitor",
      icon: <Monitor className="w-6 h-6" />,
      basePrice: 25,
      sellPrice: 40,
      upgradeLevel: 1,
      upgradeCost: 150,
      rarity: "rare",
    },
    {
      id: "gamepad",
      name: "Gaming Controller",
      icon: <Gamepad2 className="w-6 h-6" />,
      basePrice: 15,
      sellPrice: 25,
      upgradeLevel: 1,
      upgradeCost: 100,
      rarity: "common",
    },
    {
      id: "headphones",
      name: "Gaming Headset",
      icon: <Headphones className="w-6 h-6" />,
      basePrice: 20,
      sellPrice: 35,
      upgradeLevel: 1,
      upgradeCost: 120,
      rarity: "epic",
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_sale",
      title: "First Sale!",
      description: "Make your first sale",
      requirement: 1,
      currentProgress: 0,
      completed: false,
      reward: 50,
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: "sales_milestone",
      title: "Sales Master",
      description: "Reach $1000 in total sales",
      requirement: 1000,
      currentProgress: 0,
      completed: false,
      reward: 200,
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: "level_up",
      title: "Power Up",
      description: "Reach level 5",
      requirement: 5,
      currentProgress: 0,
      completed: false,
      reward: 100,
      icon: <Zap className="w-4 h-4" />,
    },
  ]);

  const [coinAnimations, setCoinAnimations] = useState<
    Array<{ id: number; amount: number; x: number; y: number }>
  >([]);
  const [screenShake, setScreenShake] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboCount, setComboCount] = useState(0);
  const [dailyBonus, setDailyBonus] = useState<number | null>(null);
  const [criticalHit, setCriticalHit] = useState(false);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(
    null
  );

  // Sound effects using Web Audio API
  const playSound = (
    frequency: number,
    duration: number,
    type: "sine" | "square" | "sawtooth" = "sine"
  ) => {
    if (!gameState.soundEnabled || !audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(
      frequency,
      audioContextRef.current.currentTime
    );
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContextRef.current.currentTime + duration
    );

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext)();
  }, []);

  // Game time tracker
  useEffect(() => {
    if (!gameState.isPaused) {
      const interval = setInterval(() => {
        setGameState((prev) => ({ ...prev, gameTime: prev.gameTime + 1 }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.isPaused]);

  // Daily bonus check
  useEffect(() => {
    const lastBonus = localStorage.getItem("lastDailyBonus");
    const today = new Date().toDateString();
    if (lastBonus !== today) {
      const bonus = Math.floor(Math.random() * 500) + 100;
      setDailyBonus(bonus);
    }
  }, []);

  // Auto-sell effect
  useEffect(() => {
    if (gameState.autoSellPower > 0 && !gameState.isPaused) {
      const interval = setInterval(() => {
        const autoEarnings = gameState.autoSellPower;
        setGameState((prev) => ({
          ...prev,
          coins: prev.coins + autoEarnings,
          totalSales: prev.totalSales + autoEarnings,
        }));

        // Update achievements
        updateAchievements(autoEarnings);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.autoSellPower, gameState.isPaused]);

  // Level up effect
  useEffect(() => {
    if (gameState.experience >= gameState.experienceToNext) {
      setGameState((prev) => ({
        ...prev,
        level: prev.level + 1,
        experience: prev.experience - prev.experienceToNext,
        experienceToNext: Math.floor(prev.experienceToNext * 1.5),
        clickPower: prev.clickPower + 1,
      }));

      playSound(800, 0.3);

      toast.success(`🎉 Level ${gameState.level + 1}! Click power increased!`, {
        duration: 3000,
      });

      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 100);

      // Check level achievements
      updateAchievements(0, "level");
    }
  }, [gameState.experience, gameState.experienceToNext]);

  // Combo reset effect
  useEffect(() => {
    const comboTimeout = setTimeout(() => {
      setComboMultiplier(1);
      setComboCount(0);
    }, 2000);

    return () => clearTimeout(comboTimeout);
  }, [comboCount]);

  const updateAchievements = (earnings: number, type: string = "sales") => {
    setAchievements((prev) =>
      prev.map((achievement) => {
        if (achievement.completed) return achievement;

        let newProgress = achievement.currentProgress;

        if (achievement.id === "first_sale" && earnings > 0) {
          newProgress = 1;
        } else if (achievement.id === "sales_milestone" && type === "sales") {
          newProgress = gameState.totalSales + earnings;
        } else if (achievement.id === "level_up" && type === "level") {
          newProgress = gameState.level + 1;
        }

        const completed = newProgress >= achievement.requirement;

        if (completed && !achievement.completed) {
          setGameState((prev) => ({
            ...prev,
            coins: prev.coins + achievement.reward,
          }));
          setShowAchievement({ ...achievement, completed: true });
          playSound(1000, 0.5);
          setTimeout(() => setShowAchievement(null), 3000);
        }

        return {
          ...achievement,
          currentProgress: newProgress,
          completed,
        };
      })
    );
  };

  const claimDailyBonus = () => {
    if (dailyBonus) {
      setGameState((prev) => ({ ...prev, coins: prev.coins + dailyBonus }));
      localStorage.setItem("lastDailyBonus", new Date().toDateString());
      playSound(600, 0.4);
      setDailyBonus(null);
    }
  };

  const addedCoinAnimationStyle = useRef(false);
  useEffect(() => {
    if (!addedCoinAnimationStyle.current) {
      const style = document.createElement("style");
      style.textContent = `
        @keyframes coinFloat {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-50px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
      addedCoinAnimationStyle.current = true;
    }
  }, []);

  const sellProduct = useCallback(
    (product: Product, event: React.MouseEvent) => {
      event.preventDefault();
      if (gameState.isPaused) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Critical hit chance (10%)
      const isCritical = Math.random() < 0.1;
      const criticalMultiplier = isCritical ? 2 : 1;

      const earnings = Math.floor(
        product.sellPrice *
          gameState.clickPower *
          comboMultiplier *
          criticalMultiplier
      );
      const experience = Math.floor(earnings * 0.1);

      // Update combo
      setComboCount((prev) => prev + 1);
      if (comboCount > 0 && comboCount % 5 === 0) {
        setComboMultiplier((prev) => Math.min(prev + 0.5, 5));
      }

      // Critical hit effects
      if (isCritical) {
        setCriticalHit(true);
        setTimeout(() => setCriticalHit(false), 300);
        playSound(1200, 0.3, "square");
      } else {
        playSound(440, 0.2);
      }

      // Add coin animation
      const animationId = Date.now() + Math.random();
      // Update coin animations with limit
      setCoinAnimations((prev) => {
        const newAnim = { id: animationId, amount: earnings, x, y };
        return [...prev.slice(-9), newAnim]; // Keep only last 10 animations
      });

      setTimeout(() => {
        setCoinAnimations((prev) =>
          prev.filter((anim) => anim.id !== animationId)
        );
      }, 800);

      // Update game state
      setGameState((prev) => ({
        ...prev,
        coins: prev.coins + earnings,
        totalSales: prev.totalSales + earnings,
        experience: prev.experience + experience,
      }));

      // Update achievements
      updateAchievements(earnings);

      // Big sale screen shake (only for very large sales)
      if (earnings > 200) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 150);
      }

      // Random positive messages
      const messages = [
        `💰 +$${earnings}!`,
        `🔥 Great sale!`,
        `⚡ Combo x${comboMultiplier.toFixed(1)}!`,
        `🎯 Perfect!`,
      ];

      if (Math.random() > 0.7) {
        toast.success(messages[Math.floor(Math.random() * messages.length)], {
          duration: 1000,
        });
      }
    },
    [gameState.clickPower, comboMultiplier, comboCount, gameState.isPaused]
  );

  const upgradeProduct = useCallback(
    (productId: string) => {
      if (gameState.isPaused) return;

      setProducts((prev) =>
        prev.map((product) => {
          if (
            product.id === productId &&
            gameState.coins >= product.upgradeCost
          ) {
            setGameState((prevState) => ({
              ...prevState,
              coins: prevState.coins - product.upgradeCost,
              autoSellPower:
                prevState.autoSellPower + Math.floor(product.sellPrice * 0.1),
            }));

            toast.success(`🚀 ${product.name} upgraded! +Auto-sell`, {
              duration: 2000,
            });

            playSound(660, 0.3, "sawtooth");

            return {
              ...product,
              upgradeLevel: product.upgradeLevel + 1,
              sellPrice: Math.floor(product.sellPrice * 1.3),
              upgradeCost: Math.floor(product.upgradeCost * 1.8),
            };
          }
          return product;
        })
      );
    },
    [gameState.coins, gameState.isPaused]
  );

  const prestigeReset = () => {
    const prestigeGain = Math.floor(gameState.level / 10);
    if (prestigeGain === 0) return;

    setGameState((prev) => ({
      ...prev,
      coins: 0,
      totalSales: 0,
      clickPower: 1 + prestigeGain,
      autoSellPower: 0,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      prestigePoints: prev.prestigePoints + prestigeGain,
    }));

    setProducts((prev) =>
      prev.map((product) => ({
        ...product,
        upgradeLevel: 1,
        sellPrice: product.basePrice * 1.5,
        upgradeCost: Math.floor(product.upgradeCost / 2),
      }))
    );

    playSound(220, 1, "sawtooth");
  };

  const togglePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400 border-gray-400";
      case "rare":
        return "text-blue-400 border-blue-400";
      case "epic":
        return "text-purple-400 border-purple-400";
      case "legendary":
        return "text-yellow-400 border-yellow-400";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num}`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div
      className={`min-h-screen p-4 ${screenShake ? "animate-bounce" : ""} ${
        criticalHit ? "bg-yellow-500/5" : ""
      } transition-all duration-100`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Daily Bonus Modal */}
        {dailyBonus && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 text-center space-y-4 border-yellow-400">
              <Gift className="w-16 h-16 mx-auto text-yellow-400" />
              <h2 className="text-2xl font-bold">Daily Bonus!</h2>
              <p className="text-xl">+{formatNumber(dailyBonus)}</p>
              <Button
                onClick={claimDailyBonus}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Claim Reward!
              </Button>
            </Card>
          </div>
        )}

        {/* Achievement Notification */}
        {showAchievement && (
          <div className="fixed top-4 right-4 z-50">
            <Card className="p-4 border-green-400 bg-green-900/20 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="text-green-400">{showAchievement.icon}</div>
                <div>
                  <h3 className="font-bold text-green-400">
                    Achievement Unlocked!
                  </h3>
                  <p className="text-sm">{showAchievement.title}</p>
                  <p className="text-xs text-green-300">
                    +{formatNumber(showAchievement.reward)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Game Controls */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Hyper Hustler
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setGameState((prev) => ({
                  ...prev,
                  soundEnabled: !prev.soundEnabled,
                }))
              }
            >
              {gameState.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={togglePause}>
              {gameState.isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
            {gameState.level >= 10 && (
              <Button
                variant="outline"
                size="sm"
                onClick={prestigeReset}
                className="text-yellow-400 border-yellow-400"
              >
                <Star className="w-4 h-4 mr-1" />
                Prestige
              </Button>
            )}
          </div>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 border border-blue-400/30 bg-blue-900/10">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Coins</p>
                <p className="text-xl font-bold text-yellow-400">
                  {formatNumber(gameState.coins)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-purple-400/30 bg-purple-900/10">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Level {gameState.level}</p>
                <Progress
                  value={
                    (gameState.experience / gameState.experienceToNext) * 100
                  }
                  className="h-2 mt-1"
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-green-400/30 bg-green-900/10">
            <div>
              <p className="text-sm text-gray-400">Click Power</p>
              <p className="text-xl font-bold text-green-400">
                {gameState.clickPower}x
              </p>
            </div>
          </Card>

          <Card className="p-4 border border-red-400/30 bg-red-900/10">
            <div>
              <p className="text-sm text-gray-400">Auto/sec</p>
              <p className="text-xl font-bold text-red-400">
                {formatNumber(gameState.autoSellPower)}
              </p>
            </div>
          </Card>

          <Card className="p-4 border border-cyan-400/30 bg-cyan-900/10">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-sm text-gray-400">Play Time</p>
                <p className="text-xs font-bold text-cyan-400">
                  {formatTime(gameState.gameTime)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Combo Indicator */}
        {comboCount > 0 && (
          <div className="text-center mb-4">
            <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 rounded-lg shadow-lg animate-pulse">
              <span className="text-lg font-bold text-white">
                🔥 COMBO {comboCount} • {comboMultiplier.toFixed(1)}x
                MULTIPLIER!
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Products */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`p-4 relative overflow-hidden border-2 ${getRarityColor(
                    product.rarity
                  )} hover:scale-105 transition-all duration-200 ${
                    gameState.isPaused ? "opacity-50" : ""
                  }`}
                >
                  {/* Coin Animations */}
                  {coinAnimations.map((animation) => (
                    <div
                      key={animation.id}
                      className="absolute pointer-events-none text-yellow-400 font-bold text-lg z-10"
                      style={{
                        left: animation.x,
                        top: animation.y,
                        animation: "coinFloat 0.8s ease-out forwards",
                        willChange: "transform, opacity",
                      }}
                    >
                      +${animation.amount}
                    </div>
                  ))}

                  <div className="text-center space-y-3">
                    <div className="flex justify-center text-primary">
                      {product.icon}
                    </div>

                    <h3 className="font-bold">{product.name}</h3>
                    <div
                      className={`text-sm ${getRarityColor(product.rarity)}`}
                    >
                      Level {product.upgradeLevel} • {product.rarity}
                    </div>

                    <Button
                      variant="default"
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      onClick={(event) => sellProduct(product, event)}
                      disabled={gameState.isPaused}
                    >
                      SELL{" "}
                      {formatNumber(product.sellPrice * gameState.clickPower)}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => upgradeProduct(product.id)}
                      disabled={
                        gameState.coins < product.upgradeCost ||
                        gameState.isPaused
                      }
                    >
                      ⬆️ Upgrade ({formatNumber(product.upgradeCost)})
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Achievements Panel */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border ${
                      achievement.completed
                        ? "border-green-400 bg-green-900/20"
                        : "border-gray-600 bg-gray-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={
                          achievement.completed
                            ? "text-green-400"
                            : "text-gray-400"
                        }
                      >
                        {achievement.icon}
                      </div>
                      <h4 className="font-bold text-sm">{achievement.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Progress
                        value={
                          (achievement.currentProgress /
                            achievement.requirement) *
                          100
                        }
                        className="flex-1 h-2 mr-2"
                      />
                      <span className="text-xs text-yellow-400">
                        +{formatNumber(achievement.reward)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.min(
                        achievement.currentProgress,
                        achievement.requirement
                      )}
                      /{achievement.requirement}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stats Summary */}
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Statistics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Sales:</span>
                  <span className="font-bold">
                    {formatNumber(gameState.totalSales)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prestige Points:</span>
                  <span className="font-bold text-yellow-400">
                    {gameState.prestigePoints}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed Achievements:</span>
                  <span className="font-bold text-green-400">
                    {achievements.filter((a) => a.completed).length}/
                    {achievements.length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          {gameState.autoSellPower > 0 && (
            <p className="text-green-400">
              💫 Auto-earning: {formatNumber(gameState.autoSellPower)}/sec
            </p>
          )}
          {gameState.isPaused && (
            <p className="text-yellow-400 font-bold">⏸️ GAME PAUSED</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTechStore;
