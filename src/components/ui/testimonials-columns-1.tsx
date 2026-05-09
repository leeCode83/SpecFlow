"use client";
import React from "react";
import { motion } from "motion/react";

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  initials: string;
};

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ quote, author, role, initials }, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between whitespace-normal text-left max-w-xs w-full shadow-xl">
                  <p className="text-slate-300 text-base leading-relaxed italic mb-8">
                    "{quote}"
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-10 h-10 shrink-0 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold text-sm border border-slate-700">
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="font-bold text-slate-200 tracking-tight leading-5 truncate">{author}</div>
                      <div className="leading-5 text-sm text-slate-500 tracking-tight truncate">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
