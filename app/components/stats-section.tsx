"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, Cpu, Download, Users, Globe, Zap } from "lucide-react";

interface Stat {
  icon: typeof Shield;
  value: number;
  suffix: string;
  label: string;
  gradient: string;
}

const stats: Stat[] = [
  {
    icon: Download,
    value: 10000,
    suffix: "+",
    label: "Downloads",
    gradient: "from-primary to-blue-400",
  },
  {
    icon: Users,
    value: 6,
    suffix: "",
    label: "AI Apps Available",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    icon: Shield,
    value: 100,
    suffix: "%",
    label: "Private & Offline",
    gradient: "from-emerald-500 to-green-400",
  },
  {
    icon: Cpu,
    value: 0,
    suffix: "",
    label: "Cloud Dependency",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    icon: Zap,
    value: 60,
    suffix: "×",
    label: "Faster Than Cloud",
    gradient: "from-cyan-500 to-blue-400",
  },
  {
    icon: Globe,
    value: 24,
    suffix: "/7",
    label: "No Internet Needed",
    gradient: "from-pink-500 to-rose-400",
  },
];

function useCountUp(target: number, inView: boolean, duration = 1600) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    if (target === 0) {
      setCount(0);
      return;
    }

    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return count;
}

function StatCard({ stat, inView }: { stat: Stat; inView: boolean }) {
  const count = useCountUp(stat.value, inView);
  const Icon = stat.icon;

  const formatted =
    stat.value >= 10000
      ? `${(count / 1000).toFixed(count >= stat.value ? 0 : 1)}K`
      : `${count}`;

  return (
    <div className="group relative flex flex-col items-center gap-3 rounded-2xl glass p-6 transition-all duration-300 hover:scale-105">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {formatted}
          {stat.suffix}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
      </div>
    </div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative px-6 py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
