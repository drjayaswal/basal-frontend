
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full z-50 bg-black backdrop-blur-md border-t border-white fixed bottom-0 left-0 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 md:px-8">
        <div className="flex flex-col gap-y-3 md:flex-row md:justify-between md:items-center">

          <nav className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-1">
            <Link
              href="https://github.com/drjayaswal/biasbreaker-frontend/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] p-2 md:text-[10px] hover:bg-indigo-500 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              Frontend
            </Link>
                        <Link
              href="https://github.com/drjayaswal/biasbreaker-backend/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] p-2 md:text-[10px] hover:bg-indigo-500 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              Backend
            </Link>
                        <Link
              href="https://github.com/drjayaswal/biasbreaker-ml-server/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] p-2 md:text-[10px] hover:bg-indigo-500 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              ML Server
            </Link>
            <Link
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] p-2 md:text-[10px] hover:bg-indigo-500 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              API Status
            </Link>
            <Link
              href="/developers"
              className="text-[9px] p-2 md:text-[10px] hover:bg-indigo-500 text-white transition-colors uppercase tracking-tighter whitespace-nowrap"
            >
              Developers
            </Link>
          </nav>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;