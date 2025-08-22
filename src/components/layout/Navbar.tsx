import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/logopogo_logo_transparent.png"
            alt="LogoPogo"
            width={55}
            height={55}
            priority
            className="rounded-lg" 
          />
          <span className="font-bold text-2xl leading-none">LogoPogo</span>
        </Link>
      </div>
    </nav>
  );
}
