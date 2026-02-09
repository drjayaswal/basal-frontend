"use client";

import { Cog, Github, Linkedin, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { devData } from "@/lib/const";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useRouter } from "next/navigation";

const Developers = () => {
  const router = useRouter();
  return (
    <div>
      <div className="max-w-4xl mx-auto text-center mb-19.5 relative z-10">
        <h1 className="text-4xl md:text-4xl font-bold text-white tracking-tight">
          Built by Developers for Recruiters
        </h1>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {devData.map((dev, index) => (
          <div
            key={index}
            className="group relative p-8 transition-all duration-300"
          >
            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-8">
              <div className="relative shrink-0">
                <div
                  className={`absolute -inset-1 bg-indigo-500 group-hover:opacity-100 opacity-20 transition-opacity rounded-[4rem]`}
                ></div>
                <Image
                  src={dev.image}
                  alt={dev.name}
                  quality={100}
                  width={120}
                  height={120}
                  className="relative border-4 border-black w-28 h-28 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all bg-slate-900 shadow-inner"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white">{dev.name}</h3>

                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {dev.bio}
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="default"
                    className="bg-white hover:bg-indigo-500 hover:text-white text-black rounded-none h-9 px-4 text-xs font-bold transition-all"
                    onClick={() => window.open(dev.github, "_blank")}
                  >
                    <Github size={14} className="mr-2" />
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-transparent text-white border-0 hover:bg-indigo-500 hover:text-white rounded-none h-9 px-4 text-xs font-bold transition-all"
                    onClick={() => window.open(dev.linkedin, "_blank")}
                  >
                    <Linkedin size={14} className="mr-2 fill-white" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="bg-black w-fit flex items-center px-3 py-1.75">
          <AnimatedButton
            label="CONTRIBUTION"
            onClick={() =>
              window.open(
                "https://github.com/drjayaswal/basal-docker.git",
                "_blank",
              )
            }
            Icon={Github}
          />
        </div>
        <div className="bg-black w-fit flex items-center px-3 py-1.75">
          <AnimatedButton
            label="Settings"
            onClick={() => router.push("/settings")}
            Icon={Cog}
            rotateIcon
          />
          <AnimatedButton
            label="Services"
            onClick={() => router.push("/services")}
            Icon={Wrench}
          />
        </div>
      </div>
    </div>
  );
};

export default Developers;
