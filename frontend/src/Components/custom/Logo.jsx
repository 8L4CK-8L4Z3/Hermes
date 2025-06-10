import LogoSVG from "@/Assets/Logo.svg";

export function Logo() {
  return (
    <a href="/" className="flex items-center gap-2 font-medium">
      <img src={LogoSVG} alt="Logo" className="h-6 w-6" />
      <span className="text-lg font-semibold">Hermes</span>
    </a>
  );
}
