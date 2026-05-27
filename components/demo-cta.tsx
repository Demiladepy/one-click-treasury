"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DemoCta() {
  return (
    <section className="relative z-10 px-6 py-24 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl rounded-2xl p-[1px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(153, 69, 255, 0.4) 0%, rgba(20, 241, 149, 0.3) 100%)",
        }}
      >
        <div className="rounded-[15px] bg-surface px-8 py-12 text-center md:px-16 md:py-16">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Hands-on
          </p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            See the architecture execute on mainnet
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-base">
            The live demo walks quote → approve → open → poll — with an Intent
            Theater timeline and a technical deep-dive sheet. Base USDC in,
            exact-output USDC on Arbitrum out.
          </p>
          <Button asChild variant="primary" size="lg" className="mt-8 font-heading">
            <Link href="/buy" className="gap-2">
              Open the interactive demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
