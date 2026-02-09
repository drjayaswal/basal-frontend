import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full z-10 bg-black backdrop-blur-md border-t border-white/13 fixed bottom-0 left-0 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 md:px-8">
        <div className="flex flex-col gap-y-3 md:flex-row md:justify-between md:items-center">
          <nav className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-1">
            <Link
              href="https://github.com/drjayaswal/basal-frontend/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] p-2 md:text-[10px] hover:bg-teal-700 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              Frontend
            </Link>
            <Link
              href="https://github.com/drjayaswal/basal-backend/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] p-2 md:text-[10px] hover:bg-teal-700 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              Backend
            </Link>
            <Link
              href="https://github.com/drjayaswal/basal-ml-server/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] p-2 md:text-[10px] hover:bg-teal-700 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              ML Server
            </Link>
            <Link
              href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] p-2 md:text-[10px] hover:bg-pink-700 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              API Status
            </Link>
            <Link
              href="/developers"
              className="text-[9px] p-2 md:text-[10px] hover:bg-indigo-700 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              Developers
            </Link>
            <Link
              href="/feedback"
              className="text-[9px] p-2 md:text-[10px] hover:bg-sky-700 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              Feedback
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
