import { Loader2 } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <div>
      <div className="z-1000 min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    </div>
  );
}

export { Spinner };
