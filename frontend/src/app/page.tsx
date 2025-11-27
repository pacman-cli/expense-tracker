"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap, Brain, Wallet, BarChart3, Repeat, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  
  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        {/* Floating orbs with parallax */}
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          style={{ y: y2, opacity }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                TakaTrack
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">AI-Powered Financial Intelligence</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                Master Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-500 animate-gradient">
                  Financial Destiny
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Experience the future of personal finance. Real-time tracking, AI insights, and predictive analytics in one stunning interface.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-12 px-8 border-white/10 hover:bg-white/5 hover:text-foreground transition-all">
                    View Demo
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/5">
                <div>
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold">৳50L+</div>
                  <div className="text-sm text-muted-foreground">Tracked</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold">4.9/5</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </motion.div>

            {/* 3D Card Stack */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block h-[600px] perspective-1000"
            >
              {/* Card 1: Savings */}
              <motion.div
                className="absolute top-10 right-10 w-80 p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl z-10"
                animate={{
                  y: [0, -15, 0],
                  rotateX: [0, 5, 0],
                  rotateY: [0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">+12.5%</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                  <h3 className="text-2xl font-bold">৳1,24,500</h3>
                </div>
                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[75%]" />
                </div>
              </motion.div>

              {/* Card 2: AI Insight */}
              <motion.div
                className="absolute top-40 left-10 w-80 p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl z-20"
                animate={{
                  y: [0, 20, 0],
                  rotateX: [0, -5, 0],
                  rotateY: [0, 5, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                    <Brain className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">New Insight</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Smart Budget Alert</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Based on your spending patterns, you can save ৳5,000 more this month by reducing dining out.
                  </p>
                </div>
              </motion.div>

              {/* Card 3: Analytics */}
              <motion.div
                className="absolute bottom-20 right-20 w-80 p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl z-30"
                animate={{
                  y: [0, -10, 0],
                  rotateX: [0, 2, 0],
                  rotateY: [0, -2, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-end gap-2 h-24">
                  {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm overflow-hidden relative group">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-500 group-hover:bg-blue-400"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-24 border-t border-white/5">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything you need to <span className="text-primary">excel</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful features designed to give you complete control over your financial life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered Insights",
                desc: "Get personalized recommendations to optimize your spending.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500/20"
              },
              {
                icon: Shield,
                title: "Bank-Grade Security",
                desc: "Your data is encrypted with state-of-the-art security protocols.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20"
              },
              {
                icon: Zap,
                title: "Real-Time Sync",
                desc: "Transactions update instantly across all your devices.",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20"
              },
              {
                icon: Globe,
                title: "Multi-Currency",
                desc: "Track expenses in any currency with real-time conversion.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20"
              },
              {
                icon: Repeat,
                title: "Smart Automation",
                desc: "Automate recurring bills and savings transfers effortlessly.",
                color: "text-pink-400",
                bg: "bg-pink-500/10",
                border: "border-pink-500/20"
              },
              {
                icon: BarChart3,
                title: "Deep Analytics",
                desc: "Visualize your financial health with interactive charts.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
                border: "border-cyan-500/20"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-2xl border ${feature.border} bg-slate-900/50 hover:bg-slate-800/50 transition-colors group cursor-default`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-24">
          <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-16 text-center lg:px-12 lg:py-24">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Ready to take control?
              </h2>
              <p className="text-xl text-white/80 mb-10">
                Join thousands of users who are already building a better financial future with TakaTrack.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 text-lg h-12 px-8">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg h-12 px-8 bg-transparent">
                    Contact Sales
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex items-center justify-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-slate-950">
          <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-lg">TakaTrack</span>
              </div>
              <div className="flex gap-8 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                <Link href="#" className="hover:text-primary transition-colors">Support</Link>
                <Link href="#" className="hover:text-primary transition-colors">Blog</Link>
              </div>
              <div className="text-sm text-muted-foreground">
                © 2025 TakaTrack. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
