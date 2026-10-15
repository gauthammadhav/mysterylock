import React from "react";
import { FlaskConical, Landmark, TrendingDown, Binary, ArrowUpRight } from "lucide-react";

export function UseCasesSection() {
  const cases = [
    {
      discipline: "Natural Sciences",
      icon: FlaskConical,
      headline: "The Anomaly at Cryo-Station 7",
      topic: "Chemical Kinetics & Thermodynamics",
      scenario:
        "Students inspect anomalous pressure and temperature spikes in an industrial reactor to determine whether an unauthorized catalyst contaminated the vessel.",
      evidence: ["Gas Chromatography", "Pressure Logs", "Arrhenius Energy Calculations"],
    },
    {
      discipline: "History & Political Science",
      icon: Landmark,
      headline: "The Midnight Treaty Cable of 1914",
      topic: "Diplomatic History & Source Verification",
      scenario:
        "Students examine conflicting diplomatic telegrams and ambassador diaries to uncover which foreign ministry altered the official transcript prior to mobilization.",
      evidence: ["Diplomatic Cables", "Cipher Logs", "Eyewitness Memoirs"],
    },
    {
      discipline: "Business & Finance",
      icon: TrendingDown,
      headline: "Forensic Audit at Apex Logistics",
      topic: "Financial Accounting & Ratio Analysis",
      scenario:
        "Students analyze cash flow statements, inventory turnover ratios, and warehouse shipment logs to uncover whether revenue was artificially accelerated.",
      evidence: ["10-K Filings", "Inventory Audits", "Accounts Receivable Aging"],
    },
    {
      discipline: "Computer Science & Mathematics",
      icon: Binary,
      headline: "The Distributed Hash Table Deadlock",
      topic: "Systems Architecture & Concurrency",
      scenario:
        "Students analyze node latency metrics and mutex lock traces to isolate the race condition that caused a cascading cluster partition.",
      evidence: ["Thread Dumps", "Network Latency Graphs", "Mutex Lock Traces"],
    },
  ];

  return (
    <section className="bg-[#FFFFFF] py-20 lg:py-28 border-b border-[#E4E9E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold tracking-widest text-[#287A52] uppercase mb-3">
            Versatile Across Disciplines
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#153D2E] mb-6">
            Adaptable to any subject with defensible reasoning.
          </h2>
          <p className="text-[17px] text-[#68736B] leading-relaxed">
            From high school biology to graduate-level finance, Mystery Learning converts any structured curriculum into engaging investigative case studies.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cases.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-3xl bg-[#FAFBF8] border border-[#E4E9E3] hover:border-[#287A52]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-[#287A52] bg-[#F3F7F1] px-2.5 py-1 rounded-md border border-[#DCEBDD]">
                      {c.discipline}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E4E9E3] flex items-center justify-center text-[#287A52]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#153D2E] mb-1">
                    {c.headline}
                  </h3>
                  <div className="text-xs font-semibold text-[#287A52] mb-3">
                    Curriculum Focus: {c.topic}
                  </div>
                  <p className="text-sm text-[#68736B] leading-relaxed mb-6">
                    {c.scenario}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E4E9E3]">
                  <div className="text-xs font-bold text-[#153D2E] uppercase mb-2">
                    Evidence Cards Grounded in Coursework:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.evidence.map((e, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-[#FFFFFF] text-[#68736B] border border-[#E4E9E3]"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
