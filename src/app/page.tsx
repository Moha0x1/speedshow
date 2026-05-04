"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { motion } from "framer-motion";
import { Activity, Gamepad2, House, Radio, ShieldCheck } from "lucide-react";

const trustPoints = [
  { label: "Test real", value: "Latencia, subida y descarga en vivo" },
  { label: "Lectura clara", value: "Te dice si vas bien o no para tu caso" },
  { label: "Sin humo", value: "Nada de metrics bonitos sin contexto" },
];

const useCases = [
  {
    title: "Casa",
    detail: "Videollamadas, Netflix, varias personas conectadas y Wi-Fi compartido.",
    icon: House,
  },
  {
    title: "Streaming",
    detail: "Twitch, YouTube, subidas de video y directos sin tirones.",
    icon: Radio,
  },
  {
    title: "Gaming",
    detail: "Ping, jitter y perdida para rankeds, shooters y cloud gaming.",
    icon: Gamepad2,
  },
];

const reasons = [
  "Te enseña si el problema es velocidad, latencia o la red cargada.",
  "Traduce el test a casos reales: casa, directos y partidas.",
  "Se siente rapido y simple, no como un panel tecnico eterno.",
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main className="flex-grow w-full">
        <section className="relative overflow-hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-8 pt-10 md:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-8"
            >
              <div className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                    <Activity className="h-3.5 w-3.5" />
                    test real en segundos
                  </div>

                  <h2 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">
                    Tu internet,
                    <br />
                    clara. Sin humo.
                  </h2>

                  <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-slate-300 md:text-lg">
                    Mira rapido si tu conexion va bien para casa, para emitir en Twitch o YouTube y para jugar sin tirones.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                      Descarga y subida reales
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                      Ping y jitter con contexto
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                      Hecho para gente normal
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {trustPoints.map((point, index) => (
                    <motion.div
                      key={point.label}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * index }}
                      className="rounded-[1.5rem] border border-white/8 bg-black/25 p-4"
                    >
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">{point.label}</div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{point.value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {useCases.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.05 }}
                  className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-4">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">elige tu test</p>
              <h3 className="mt-2 text-2xl font-black text-white md:text-3xl">Haz el test que de verdad te importa</h3>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 md:block">
              Primero casa, luego streaming o gaming
            </div>
          </div>

          <SpeedTestTool />
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 pt-6">
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  por que engancha
                </div>
                <h3 className="mt-4 text-2xl font-black text-white md:text-3xl">
                  Menos ruido.
                  <br />
                  Mas decisiones utiles.
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted md:text-base">
                  La gente no quiere un panel de ingenieria. Quiere saber si su red esta bien, que falla y que haria yo despues.
                </p>
              </div>

              <div className="grid gap-3">
                {reasons.map((reason, index) => (
                  <div
                    key={reason}
                    className="flex items-start gap-4 rounded-[1.25rem] border border-white/8 bg-black/20 p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-slate-950">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
