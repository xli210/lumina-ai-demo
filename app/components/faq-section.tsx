"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What GPU do I need to run these apps?",
    answer:
      "Most of our apps require an NVIDIA GPU with at least 6 GB of VRAM (e.g., GTX 1660 or newer). For best results with image and video generation, we recommend 8 GB+ VRAM (RTX 3060 or higher). Streaming DiT mode in Nano ImageEdit allows GPUs with less than 12 GB VRAM to run advanced models.",
  },
  {
    question: "Is my data really private?",
    answer:
      "Yes — 100%. All AI processing happens locally on your machine. No images or videos ever leave your computer. There are no cloud APIs, no telemetry, and no data collection. Your creations are entirely yours.",
  },
  {
    question: "Do I need an internet connection?",
    answer:
      "Only for the initial setup: downloading the app, activating your license, and downloading AI models. After that, everything runs completely offline. Perfect for air-gapped environments and fieldwork.",
  },
  {
    question: "How does the licensing work?",
    answer:
      "Each license key activates on one machine. Free products give you a permanent license at no cost. Paid products like Nano ImageEdit and Nano VideoGen offer a 14-day free trial, after which you can purchase a one-time lifetime license — no subscriptions ever.",
  },
  {
    question: "Can I switch my license to a new computer?",
    answer:
      "Yes. You can deactivate your license from the current machine and reactivate it on a new one. If you no longer have access to the old machine, you can use the force-takeover option (available once every 30 days) to transfer your license.",
  },
  {
    question: "What operating systems are supported?",
    answer:
      "Currently, all apps are available for Windows 10/11 (64-bit) with NVIDIA GPU support via CUDA. macOS and Linux support is on our roadmap — stay tuned for updates.",
  },
  {
    question: "Are updates really free forever?",
    answer:
      "Yes. Every license — free or paid — includes lifetime updates. As we release new AI models, features, and performance improvements, you get them automatically at no extra cost.",
  },
  {
    question: "What if I need help or have a problem?",
    answer:
      "You can reach us through the contact form on our website or via email. We typically respond within 24 hours. Our community also shares tips and solutions in our online forums.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="relative px-6 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            FAQ
          </p>
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Everything you need to know about our local AI apps.
          </p>
        </div>

        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="glass rounded-2xl border-0 px-6 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline sm:text-lg py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
