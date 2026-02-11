import { cn } from "@/lib/utils";

export const AnimatedButton = ({ 
    onClick, 
    label, 
    Icon, 
    rotateIcon = false 
  }: { 
    onClick: () => void, 
    label: string, 
    Icon: any, 
    rotateIcon?: boolean 
  }) => (
    <button
      onClick={onClick}
      className="group/btn cursor-pointer relative flex items-center justify-between overflow-hidden px-8 py-4 font-bold text-white transition-all duration-500 hover:bg-indigo-700"
    >
      <span className="relative z-10 transition-all duration-500 group-hover/btn:tracking-widest mr-4">
        {label}
      </span>
      <div className="relative flex items-center overflow-hidden h-6 w-6 px-1">
        <Icon
          className={cn(
            "transform transition-all duration-500 -translate-x-full scale-150 opacity-0 absolute",
            "group-hover/btn:translate-x-0 group-hover/btn:opacity-100",
            rotateIcon && "group-hover/btn:rotate-90"
          )}
        />
        <Icon
          className={cn(
            "transition-all duration-500 opacity-100  scale-150",
            "group-hover/btn:translate-x-full group-hover/btn:opacity-0"
          )}
        />
      </div>
      <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover/btn:translate-x-full" />
    </button>
  );