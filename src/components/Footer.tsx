export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#08080a] py-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 sm:px-6 md:flex-row md:items-center md:justify-between md:px-12">
        <div className="flex flex-col gap-1.5">
          <span className="font-display text-base font-semibold tracking-[0.22em] text-[#f4f4f0]">
            R &amp; L STUDIO
          </span>
          <p className="font-mono-tabular text-xs text-[#71717a]">
            We don&apos;t just build software. We build digital experiences.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono-tabular text-xs tracking-[0.14em] text-[#a1a1aa]"
        >
          <a href="#work" className="py-1 hover:text-[#e5a93c] transition-colors">
            WORK
          </a>
          <a href="#process" className="py-1 hover:text-[#e5a93c] transition-colors">
            PROCESS
          </a>
          <a href="#services" className="py-1 hover:text-[#e5a93c] transition-colors">
            SERVICES
          </a>
          <a href="#studio" className="py-1 hover:text-[#e5a93c] transition-colors">
            STUDIO
          </a>
          <a href="#contact" className="py-1 hover:text-[#e5a93c] transition-colors">
            CONTACT
          </a>
        </nav>

        <p className="font-mono-tabular text-xs text-[#71717a]">
          © {new Date().getFullYear()} R &amp; L STUDIO
        </p>
      </div>
    </footer>
  );
}
