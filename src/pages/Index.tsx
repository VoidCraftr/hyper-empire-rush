import TechStore from "@/components/TechStore";
import heroImage from "@/assets/tech-store-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-4 neon-glow bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ⚡ HYPER HUSTLE ⚡
          </h1>
          <p className="text-xl text-primary-glow font-semibold">
            Build Your Tech Empire • Tap to Profit • Level Up Fast!
          </p>
        </div>
      </div>

      {/* Game Component */}
      <TechStore />
    </div>
  );
};

export default Index;
