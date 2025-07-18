import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { FaRegUserCircle } from "react-icons/fa"
import { useAuth } from "../contexts/AuthProvider"
import { getMediaUrl } from "../utils/mediaUtils"

const BottomBar = ({ mainNavItems, hiddenNavItems, handleNavigation }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Safety checks for props
  const safeMainNavItems = Array.isArray(mainNavItems) ? mainNavItems : []
  const safeHiddenNavItems = Array.isArray(hiddenNavItems) ? hiddenNavItems : []

  // Get the 4 main buttons from mainNavItems (which should contain exactly 4 items)
  const mainButtons = safeMainNavItems.slice(0, Math.min(4, safeMainNavItems.length))

  // Check if a nav item is active
  const isActive = (item) => {
    if (!item || !item.path) return false
    if (location.pathname === item.path) return true
    if (item.pathPattern && new RegExp(item.pathPattern).test(location.pathname)) return true
    if (location.pathname === "/" && item.path === "/student") return true
    return false
  }

  // Safe navigation handler
  const safeHandleNavigation = (item) => {
    if (!item) return

    if (handleNavigation) {
      handleNavigation(item)
    } else if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
    }

    setDropdownOpen(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-lg border-t border-blue-100/50 z-50 pb-safe shadow-lg">
      <div className="flex h-16">
        {mainButtons.map((item) => (
          <button
            key={item.name || `nav-item-${Math.random()}`}
            onClick={() => safeHandleNavigation(item)}
            className={`
              flex-1 flex flex-col items-center justify-center relative transition-all duration-200
              ${isActive(item) ? "text-[#1360AB]" : "text-gray-500 hover:text-gray-700"}
            `}
          >
            <div
              className={`
              relative p-1.5 rounded-full transition-all duration-200
              ${isActive(item) ? "bg-blue-100/80" : "hover:bg-gray-100/80"}
            `}
            >
              {item.icon && (
                <item.icon
                  className={`
                  text-xl transition-all duration-200
                  ${isActive(item) ? "text-[#1360AB]" : "text-gray-500"}
                `}
                />
              )}
            </div>
            <span
              className={`
              text-[10px] mt-0.5 transition-all duration-200
              ${isActive(item) ? "font-medium" : ""}
            `}
            >
              {item.name || ""}
            </span>
            {item.badge > 0 && <div className="absolute top-0 right-1/3 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold flex items-center justify-center shadow-sm border border-white">{item.badge > 99 ? "99+" : item.badge}</div>}
          </button>
        ))}

        {/* Profile button */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`
              w-full h-full flex flex-col items-center justify-center relative transition-all duration-200
              ${dropdownOpen ? "text-[#1360AB]" : "text-gray-500 hover:text-gray-700"}
            `}
          >
            <div
              className={`
              relative p-0.5 rounded-full transition-all duration-200
              ${dropdownOpen ? "bg-blue-100/80" : "hover:bg-gray-100/80"}
            `}
            >
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center overflow-hidden
                ${dropdownOpen ? "border-2 border-[#1360AB]" : "border border-gray-200"}
                shadow-sm
              `}
              >
                {user?.profileImage ? (
                  <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-8 h-8 rounded-full object-cover" />
                ) : user?.name?.charAt(0).toUpperCase() ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1360AB] to-blue-700 text-white">
                    <span className="text-xs font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                ) : (
                  <FaRegUserCircle className="text-xl text-[#1360AB]" />
                )}
              </div>
            </div>
            <span
              className={`
              text-[10px] mt-0.5 transition-all duration-200
              ${dropdownOpen ? "font-medium text-[#1360AB]" : ""}
            `}
            >
              More
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 bg-black/30 z-40 animate-fadeIn" onClick={() => setDropdownOpen(false)}></div>
              <div className="fixed bottom-16 inset-x-0 bg-white/90 backdrop-blur-xl rounded-t-2xl shadow-xl z-50 py-3 border border-gray-200/70 bottom-menu-slide-up max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-center px-5 pb-2 mb-2 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800 text-sm">Menu</h3>
                  <button onClick={() => setDropdownOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="pb-safe">
                  {safeHiddenNavItems.map((item) => (
                    <div
                      key={item.name || `hidden-nav-${Math.random()}`}
                      onClick={() => safeHandleNavigation(item)}
                      className={`
                        flex items-center px-5 py-3.5 text-sm cursor-pointer transition-all duration-200
                        ${item.name === "Logout" ? "text-red-500 hover:bg-red-50 active:bg-red-100" : "text-gray-700 hover:bg-[#1360AB]/10 active:bg-[#1360AB]/20 hover:text-[#1360AB]"}
                      `}
                    >
                      {item.icon && (
                        <div
                          className={`
                          p-2.5 rounded-full mr-4 flex items-center justify-center
                          ${item.name === "Logout" ? "bg-red-100" : "bg-blue-100/80"}
                        `}
                        >
                          <item.icon
                            className={`
                              text-lg
                              ${item.name === "Logout" ? "text-red-500" : "text-[#1360AB]"}
                            `}
                          />
                        </div>
                      )}
                      <span className="font-medium">{item.name || ""}</span>
                      {item.badge > 0 && <div className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center shadow-sm">{item.badge > 99 ? "99+" : item.badge}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BottomBar
