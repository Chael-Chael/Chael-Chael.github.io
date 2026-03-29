/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Zap, Users, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    description: 'Get started with Claude for basic tasks and exploration.',
    price: '$0',
    priceDetail: 'Free forever',
    features: [
      'Access to Claude models',
      'Limited daily message limit',
      'Web-based interface',
      'Standard response speeds'
    ],
    buttonText: 'Start for free',
    buttonHref: '#',
    highlight: false,
    icon: Globe
  },
  {
    name: 'Pro',
    description: 'Everything in Free, plus early access to new features and higher limits.',
    price: '$20',
    priceDetail: 'per user / month',
    features: [
      'Access to Claude 3.5 Sonnet & Opus',
      '5x more usage than Free',
      'Early access to new features',
      'Priority response speeds'
    ],
    buttonText: 'Get Pro',
    buttonHref: '#',
    highlight: true,
    icon: Zap
  },
  {
    name: 'Team',
    description: 'Collaborative features for small to medium organizations.',
    price: '$30',
    priceDetail: 'per user / month (min 5 users)',
    features: [
      'Everything in Pro plus...',
      'Increased usage limits',
      'Centralized billing & admin',
      'Collaborative Projects'
    ],
    buttonText: 'Get Team',
    buttonHref: '#',
    highlight: false,
    icon: Users
  },
  {
    name: 'Enterprise',
    description: 'Advanced security, control, and support for large organizations.',
    price: 'Custom',
    priceDetail: 'Contact sales for pricing',
    features: [
      'Everything in Team plus...',
      'SSO and identity management',
      'Audit logs & compliance',
      'Priority global support'
    ],
    buttonText: 'Contact Sales',
    buttonHref: '#',
    highlight: false,
    icon: Shield
  }
];

const faqs = [
  {
    question: "Is there a free trial for Claude Pro?",
    answer: "Claude.com remains free to use within certain usage limits. Claude Pro is a paid subscription that provides 5x more usage than the free tier and early access to new features."
  },
  {
    question: "How do usage limits work?",
    answer: "Every plan has a message limit. If you reach your limit, your messages will be queued or you'll be asked to wait until your limit resets. Claude Pro offers significantly higher limits than the Free tier."
  },
  {
    question: "Do you offer discounts for non-profits?",
    answer: "We support the non-profit community. Please contact our sales team to discuss enterprise and non-profit pricing options."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time from your account settings. You will continue to have access until the end of your billing period."
  }
];

const PricingPage = () => {
  
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header Section with Premium Illustration */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-24 relative">
          {/* Background Gradient Blur */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-b from-accent/5 to-transparent blur-3xl -z-10 rounded-full"></div>
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-left"
          >
            <h2 className="text-accent font-tiempos-headline tracking-widest text-sm uppercase font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-accent"></span>
              Plans & Pricing
            </h2>
            <h1 className="text-5xl md:text-7xl font-tiempos-headline font-medium mb-8 leading-[1.1] text-balance">
              Building the future <br />
              <span className="text-accent italic">together.</span>
            </h1>
            <p className="max-w-xl text-xl text-neutral-500 font-serif leading-relaxed mb-10">
              PRISM is designed to empower researchers and teams to showcase their 
              intellectual footprint with a premium, configuration-driven experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-primary text-background rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
              >
                Get Started
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-background border border-neutral-200 dark:border-neutral-800 rounded-full font-bold hover:bg-neutral-50 dark:hover:bg-neutral-200 transition-all font-serif italic"
              >
                View Documentation
              </motion.button>
            </div>
          </motion.div>

          {/* Premium Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 p-4 bg-background/30 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden group">
              <img 
                src="/pricing_hero.png" 
                alt="PRISM AI Illustration" 
                className="w-full h-auto rounded-2xl transform transition-transform duration-700 group-hover:scale-110"
              />
              {/* Glass Overlay Elements */}
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl p-3 border border-white/20 rounded-xl shadow-lg animate-pulse">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div className="absolute bottom-8 left-8 bg-white/20 backdrop-blur-2xl px-4 py-2 border border-white/20 rounded-full shadow-lg text-[10px] font-bold tracking-widest text-primary uppercase">
                High Performance
              </div>
            </div>
            {/* Background Decorative Rings */}
            <div className="absolute inset-0 -z-10 animate-spin-slow">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-accent/10 rounded-full scale-110"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-primary/5 rounded-full scale-125"></div>
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-300 ${
                plan.highlight 
                  ? 'border-accent shadow-xl bg-background ring-1 ring-accent/20' 
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-100/50 hover:border-neutral-300 dark:hover:border-neutral-200'
              }`}
            >
              <div className="p-8 flex-grow">
                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center ${
                  plan.highlight ? 'bg-accent/10' : 'bg-neutral-100 dark:bg-neutral-800'
                }`}>
                  <plan.icon className={`w-6 h-6 ${plan.highlight ? 'text-accent' : 'text-neutral-500'}`} />
                </div>
                
                <h3 className="text-2xl font-tiempos-headline font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-serif min-h-[3rem] mb-6 leading-relaxed">
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-4xl font-tiempos-headline font-bold tracking-tight">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-neutral-500 ml-1">/mo</span>}
                </div>
                
                <div className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-6 flex items-center gap-2">
                  <div className="h-[1px] flex-grow bg-neutral-200 dark:bg-neutral-800"></div>
                  <span>WHAT&apos;S INCLUDED</span>
                  <div className="h-[1px] flex-grow bg-neutral-200 dark:bg-neutral-800"></div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`mt-1 p-0.5 rounded-full ${plan.highlight ? 'bg-accent/10 border border-accent/20' : 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'}`}>
                        <Check className={`w-3.5 h-3.5 ${plan.highlight ? 'text-accent' : 'text-neutral-400'}`} />
                      </div>
                      <span className="text-sm font-serif text-neutral-600 dark:text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-8 pt-0">
                <Link 
                  href={plan.buttonHref}
                  className={`w-full py-4 px-6 rounded-full inline-flex items-center justify-center font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                    plan.highlight 
                      ? 'bg-accent text-neutral-50 border border-accent shadow-md hover:shadow-lg hover:shadow-accent/20' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {plan.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                {plan.priceDetail && (
                  <p className="mt-4 text-center text-xs text-neutral-400 font-serif">
                    {plan.priceDetail}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison / Value Prop Section */}
        <section className="mb-24 py-16 bg-neutral-50/50 dark:bg-neutral-100/50 rounded-3xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="relative px-8 md:px-16 flex flex-col items-center">
            <h2 className="text-3xl font-tiempos-headline text-center font-bold mb-12">Built for teams of all sizes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-background shadow-inner flex items-center justify-center mb-6 border border-neutral-200 dark:border-neutral-700">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-tiempos-headline font-semibold mb-3">Enterprise Grade Security</h3>
                <p className="text-neutral-500 font-serif text-sm leading-relaxed">
                  SOC 2 Type II compliance and enterprise-level controls for data protection.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-background shadow-inner flex items-center justify-center mb-6 border border-neutral-200 dark:border-neutral-700">
                  <Globe className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-tiempos-headline font-semibold mb-3">Global Availability</h3>
                <p className="text-neutral-500 font-serif text-sm leading-relaxed">
                  Deploy across over 150 regions with edge networks and high-availability systems.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-background shadow-inner flex items-center justify-center mb-6 border border-neutral-200 dark:border-neutral-700">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-tiempos-headline font-semibold mb-3">Lightning Fast</h3>
                <p className="text-neutral-500 font-serif text-sm leading-relaxed">
                  Sub-millisecond latency for real-time interactions and dynamic experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-20 px-4">
          <h2 className="text-3xl font-tiempos-headline font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-background hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <h4 className="text-lg font-tiempos-headline font-bold mb-2 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  {faq.question}
                </h4>
                <p className="text-neutral-500 font-serif leading-relaxed text-sm ml-4.5">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Footer Link / CTA */}
        <div className="text-center pt-10 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-400 font-serif mb-6">Need something more tailored? Let&apos;s talk about your needs.</p>
          <Link 
            href="/contact"
            className="inline-flex items-center text-accent hover:text-accent-light font-semibold transition-colors group"
          >
            Get in touch with us
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
