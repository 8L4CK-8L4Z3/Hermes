import logo from "@/Assets/Logo.svg"
const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <img src={logo} alt="Hermes Logo" className="w-8 h-8" />
      <span className="text-xl font-medium text-gray-900">Hermes</span>
    </div>
  )
}

export default Logo
