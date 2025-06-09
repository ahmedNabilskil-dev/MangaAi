import Link from "next/link";

const SidebarItem = ({
  icon,
  text,
  href,
  isActive,
  isSidebarOpen,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
  isActive: boolean;
  isSidebarOpen: boolean;
  onClick?: () => void;
}) => {
  // Component to render based on whether we have an href or onClick handler
  const ComponentToRender = href
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={href} className="w-full">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <button onClick={onClick} className="w-full text-left">
          {children}
        </button>
      );

  return (
    <ComponentToRender>
      <div
        className={`
          flex items-center p-3 my-1 rounded-lg cursor-pointer
          transition-all duration-200 ease-in-out
          ${isActive ? "bg-blue-100" : "hover:bg-gray-700"}
        `}
      >
        <div
          className={`flex items-center ${
            isSidebarOpen ? "justify-start" : "justify-center"
          } w-full`}
        >
          <div
            className={`text-xl text-white ${
              isActive ? "text-blue-800" : "text-white"
            }`}
          >
            {icon}
          </div>

          {isSidebarOpen && (
            <span
              className={`ml-3 font-medium text-white ${
                isActive ? "font-semibold text-blue-800" : "text-white"
              }`}
            >
              {text}
            </span>
          )}
        </div>
      </div>
    </ComponentToRender>
  );
};

export default SidebarItem;
