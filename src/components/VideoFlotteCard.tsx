import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface VideoFlotteCardProps {
  title: string;
  videoSrc: string;
  ariaLabel: string;
  vehicleType?: string;
  description?: string;
  className?: string;
}

export function VideoFlotteCard({
  title,
  videoSrc,
  ariaLabel,
  vehicleType,
  description,
  className,
}: VideoFlotteCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn("w-full relative", className)}
      style={{ perspective: 1500 }}
    >
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ z: 10 }}
      >
        <div className="relative group">
          {/* Card glow */}
          <motion.div
            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
            animate={{
              boxShadow: [
                "0 0 10px 2px hsl(var(--primary) / 0.1)",
                "0 0 20px 6px hsl(var(--primary) / 0.2)",
                "0 0 10px 2px hsl(var(--primary) / 0.1)",
              ],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror",
            }}
          />

          {/* Traveling light beams */}
          <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"
              animate={{
                left: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"],
              }}
              transition={{
                left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
                opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" },
                filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" },
              }}
            />
            <motion.div
              className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-70"
              animate={{
                top: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"],
              }}
              transition={{
                top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 },
                opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 },
                filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 },
              }}
            />
            <motion.div
              className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"
              animate={{
                right: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"],
              }}
              transition={{
                right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 },
                opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 },
                filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 },
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-70"
              animate={{
                bottom: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"],
              }}
              transition={{
                bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 },
                opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 },
                filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 },
              }}
            />
            {/* Corner glow spots */}
            <motion.div
              className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-primary/60 blur-[1px]"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.div
              className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-primary/70 blur-[2px]"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-primary/70 blur-[2px]"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", delay: 1 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-primary/60 blur-[1px]"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2.3, repeat: Infinity, repeatType: "mirror", delay: 1.5 }}
            />
          </div>

          {/* Border gradient */}
          <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Glass card + video */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-card/80 backdrop-blur-sm shadow-2xl">
            <div className="px-4 pt-4 pb-2 text-left space-y-0.5">
              <p className="font-display text-base font-semibold text-foreground">{title}</p>
              {vehicleType && (
                <p className="text-xs font-medium text-primary uppercase tracking-wider">
                  {vehicleType}
                </p>
              )}
            </div>
            {/* Vidéo agrandie + bordure LED pulsée */}
            <div className="relative px-3 pb-3">
              <motion.div
                className="relative rounded-xl overflow-hidden"
                animate={{
                  boxShadow: [
                    "inset 0 0 0 2px hsl(var(--primary) / 0.5), 0 0 12px hsl(var(--primary) / 0.25)",
                    "inset 0 0 0 2px hsl(var(--primary) / 0.9), 0 0 20px hsl(var(--primary) / 0.45), 0 0 30px hsl(var(--primary) / 0.2)",
                    "inset 0 0 0 2px hsl(var(--primary) / 0.5), 0 0 12px hsl(var(--primary) / 0.25)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              >
                <div className="aspect-[16/9] w-full overflow-hidden min-h-[240px] sm:min-h-[280px]">
                  <video
                    src={videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-[1.08]"
                    aria-label={ariaLabel}
                  />
                </div>
              </motion.div>
            </div>
            {description && (
              <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}
