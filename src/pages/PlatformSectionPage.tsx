import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import React from "react";

interface PlatformSectionPageProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const PlatformSectionPage = ({ title, description, children }: PlatformSectionPageProps) => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto space-y-4 sm:space-y-6 w-full min-w-0"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words">{title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            ZentrovAI Intelligence Platform
          </p>
        </div>

        <section className="glass-card p-4 sm:p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          <p className="text-xs text-muted-foreground mt-3">
            This section includes an interactive demo so you can test the core workflow directly.
          </p>
        </section>

        {children ? <section className="glass-card p-4 sm:p-6 min-w-0">{children}</section> : null}
      </motion.div>
    </DashboardLayout>
  );
};

export default PlatformSectionPage;
