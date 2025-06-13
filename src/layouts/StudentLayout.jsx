import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaUser, FaClipboardList, FaSignOutAlt, FaSearch, FaCalendarAlt, FaBell, FaUserFriends, FaIdCard } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import { useAuth } from "../contexts/AuthProvider"
import { HiAnnotation } from "react-icons/hi"
import { useEffect, useState } from "react"
import { notificationApi } from "../services/notificationApi"

const StudentLayout = () => {
  const navigate = useNavigate()
  const { logout } = useAuth ? useAuth() : { logout: () => {} }

  const [notificationsCount, setNotificationsCount] = useState(0)

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?")
    if (!confirmLogout) return

    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  useEffect(() => {
    const fetchNotificationsCount = async () => {
      try {
        const data = await notificationApi.getActiveNotificationsCount()
        setNotificationsCount(data.activeCount || 0)
      } catch (error) {
        console.error("Failed to fetch notifications count:", error)
      }
    }

    fetchNotificationsCount()
  }, [])

  const navItems = [
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/student" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/student/complaints" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/student/lost-and-found" },
    { name: "Events", icon: FaCalendarAlt, section: "main", path: "/student/events" },
    { name: "Visitors", icon: FaUserFriends, section: "main", path: "/student/visitors" },
    { name: "Feedbacks", icon: HiAnnotation, section: "main", path: "/student/feedbacks" },
    { name: "Notifications", icon: FaBell, section: "main", path: "/student/notifications", badge: notificationsCount },
    { name: "Security", icon: FaUser, section: "main", path: "/student/security" },
    { name: "ID Card", icon: FaIdCard, section: "main", path: "/student/id-card" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/student/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <div className="flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 min-h-screen">
      <Sidebar navItems={navItems} />
      <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
        <Outlet />
      </div>
    </div>
  )
}

export default StudentLayout
