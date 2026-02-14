import { motion } from "framer-motion";

interface FuelGaugeProps {
  fuelLevel: number;
  shake: boolean;
}

const getFuelColor = (level: number) => {
  if (level <= 30) return "from-red-600 via-red-500 to-red-400";
  if (level <= 70) return "from-yellow-600 via-yellow-500 to-yellow-400";
  return "from-green-600 via-green-500 to-green-400";
};

const getFuelGlow = (level: number) => {
  if (level <= 30) return "shadow-[0_0_16px_rgba(239,68,68,0.6),0_0_32px_rgba(239,68,68,0.3)]";
  if (level <= 70) return "shadow-[0_0_16px_rgba(250,204,21,0.5),0_0_32px_rgba(250,204,21,0.25)]";
  return "shadow-[0_0_16px_rgba(74,222,128,0.6),0_0_32px_rgba(74,222,128,0.3)]";
};

const getFuelPulse = (level: number) => {
  if (level <= 30) return { opacity: [0.6, 1, 0.6], scale: [1, 1.02, 1] };
  return {};
};

const FuelGauge = ({ fuelLevel, shake }: FuelGaugeProps) => (
  <motion.div
    className="flex flex-col items-center gap-2 relative z-20"
    animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    <span className="text-[10px] sm:text-xs font-fredoka font-bold text-white/70 tracking-wider uppercase drop-shadow-md">
      Fuel
    </span>
    
    <div className="relative">
      {/* Outer glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-cyan-400/10 to-blue-400/10 rounded-full blur-xl" />
      
      {/* Main gauge container */}
      <div className="relative w-7 h-40 sm:w-8 sm:h-48 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md rounded-full border-2 border-white/25 overflow-hidden shadow-xl">
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none" />
        
        {/* Fuel level with gradient and glow */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t ${getFuelColor(fuelLevel)} ${getFuelGlow(fuelLevel)}`}
          initial={false}
          animate={{ 
            height: `${fuelLevel}%`,
            ...getFuelPulse(fuelLevel)
          }}
          transition={{ 
            height: { duration: 0.6, ease: "easeOut" },
            opacity: { duration: 1, repeat: fuelLevel <= 30 ? Infinity : 0 },
            scale: { duration: 1, repeat: fuelLevel <= 30 ? Infinity : 0 }
          }}
        >
          {/* Fuel shine effect */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
            }}
          />
          
          {/* Animated bubbles in fuel */}
          {fuelLevel > 0 && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/40 rounded-full blur-[0.5px]"
                  style={{
                    left: `${20 + i * 25}%`,
                    bottom: "5%",
                  }}
                  animate={{
                    y: [0, -100 - i * 20],
                    opacity: [0.4, 0.7, 0],
                    scale: [1, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Gauge measurement marks */}
        {[25, 50, 75].map((mark) => (
          <div
            key={mark}
            className="absolute left-0 right-0 flex items-center"
            style={{ bottom: `${mark}%` }}
          >
            <div className="w-full h-[1px] bg-white/20" />
            <div className="absolute -right-1 w-2 h-[1px] bg-white/30" />
          </div>
        ))}

        {/* Glass reflection overlay */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none opacity-30"
          style={{
            background: "linear-gradient(110deg, rgba(255,255,255,0.4) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.2) 100%)",
          }}
        />
      </div>
    </div>

    {/* Percentage display */}
    <motion.div
      className="relative"
      animate={fuelLevel <= 30 ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.6, repeat: fuelLevel <= 30 ? Infinity : 0 }}
    >
      <div className="absolute inset-0 bg-white/10 rounded-full blur-md" />
      <span className={`relative text-[10px] sm:text-xs font-fredoka font-bold px-2 py-0.5 rounded-full ${
        fuelLevel <= 30 ? "text-red-400" : fuelLevel <= 70 ? "text-yellow-400" : "text-green-400"
      } drop-shadow-lg`}>
        {fuelLevel}%
      </span>
    </motion.div>
  </motion.div>
);

export default FuelGauge;
