"use client";

import { motion } from "framer-motion";
import type { TapeEvent, TheaterStage } from "@/lib/types";
import { TAPE_PREFIX_COLORS, THEATER_NODES } from "@/lib/types";

interface IntentTheaterProps {
  theaterStage: TheaterStage;
  tapeEvents: TapeEvent[];
}

export function IntentTheater({ theaterStage, tapeEvents }: IntentTheaterProps) {
  const progress = theaterStage / (THEATER_NODES.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/20"
    >
      <div className="border-b border-white/10 px-4 py-3">
        <p className="font-heading text-sm font-semibold tracking-tight text-white">
          Watch the intent in flight
        </p>
      </div>

      <div className="px-4 py-6">
        {/* Horizontal timeline — SVG pathLength fill */}
        <div className="relative mb-8 px-1">
          <svg
            className="absolute left-0 right-0 top-4 h-2 w-full"
            viewBox="0 0 400 4"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="timelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9945FF" />
                <stop offset="100%" stopColor="#14F195" />
              </linearGradient>
            </defs>
            <path
              d="M 8 2 L 392 2"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              fill="none"
            />
            <motion.path
              d="M 8 2 L 392 2"
              stroke="url(#timelineGrad)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          <div className="relative flex justify-between">
            {THEATER_NODES.map((label, i) => {
              const stage = i as TheaterStage;
              const isComplete = theaterStage > stage;
              const isActive = theaterStage === stage;
              const isPending = theaterStage < stage;

              return (
                <div
                  key={label}
                  className="flex w-[18%] flex-col items-center gap-2"
                >
                  <motion.div
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2"
                    animate={
                      isActive
                        ? {
                            borderColor: "rgba(153, 69, 255, 0.8)",
                            boxShadow: [
                              "0 0 0 0 rgba(153, 69, 255, 0.4)",
                              "0 0 0 8px rgba(153, 69, 255, 0)",
                            ],
                          }
                        : isComplete
                          ? {
                              borderColor: "transparent",
                              background:
                                "linear-gradient(135deg, #FF6B9D 0%, #F0B90B 100%)",
                            }
                          : {
                              borderColor: "rgba(255,255,255,0.15)",
                              background: "transparent",
                            }
                    }
                    transition={
                      isActive
                        ? { duration: 1.5, repeat: Infinity }
                        : { duration: 0.3 }
                    }
                  >
                    {isComplete && (
                      <span className="text-[10px] font-bold text-white">✓</span>
                    )}
                    {isPending && (
                      <span className="h-2 w-2 rounded-full bg-white/20" />
                    )}
                    {isActive && (
                      <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195]" />
                    )}
                  </motion.div>
                  <span
                    className={`text-center font-mono text-[9px] leading-tight ${
                      isPending ? "text-muted/50" : "text-muted"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tape feed */}
        <div className="max-h-40 space-y-1.5 overflow-y-auto">
          {tapeEvents.length === 0 && (
            <p className="font-mono text-[11px] text-muted/50">
              Waiting for events…
            </p>
          )}
          {tapeEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="font-mono text-[11px] leading-relaxed"
            >
              <span
                style={{ color: TAPE_PREFIX_COLORS[event.prefix] }}
                className="mr-2"
              >
                [{event.prefix}]
              </span>
              <span className="text-white/75">{event.message}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
