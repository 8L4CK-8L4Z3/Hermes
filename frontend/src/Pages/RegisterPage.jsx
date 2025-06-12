import Logo from "@/Components/custom/Logo";
import { RegisterForm } from "@/Components/custom/RegisterForm";
import RegisterCover from "@/Assets/RegisterCover.png"

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={RegisterCover}
          alt="Register cover image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
