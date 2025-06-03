import { useState, useEffect } from "react"
import { FaUserTie, FaPlus } from "react-icons/fa"
import FilterTabs from "../../common/FilterTabs"
import SearchBar from "../../common/SearchBar"
import NoResults from "../../common/NoResults"
import WardenCard from "../wardens/WardenCard"
import AddWardenModal from "../wardens/AddWardenModal"
import WardenStats from "../wardens/WardenStats"
import { filterWardens } from "../../../utils/adminUtils"
import { WARDEN_FILTER_TABS } from "../../../constants/adminConstants"
import { adminApi } from "../../../services/apiService"
import { useAdmin } from "../../../contexts/AdminProvider"

const StaffManagement = ({ staffType = "warden" }) => {
  const isWarden = staffType === "warden"
  const isAssociateWarden = staffType === "associateWarden"
  const isHostelSupervisor = staffType === "hostelSupervisor"

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [staffList, setStaffList] = useState([])

  const filteredStaff = filterWardens(staffList, filterStatus, searchTerm)

  const staffTitle = isWarden ? "Warden" : isAssociateWarden ? "Associate Warden" : "Hostel Supervisor"

  const fetchStaff = async () => {
    try {
      const response = isWarden ? await adminApi.getAllWardens() : isAssociateWarden ? await adminApi.getAllAssociateWardens() : await adminApi.getAllHostelSupervisors()
      setStaffList(response || [])
    } catch (error) {
      console.error(`Error fetching ${staffTitle.toLowerCase()}s:`, error)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [staffType])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">{staffTitle} Management</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-[#1360AB] text-white flex items-center px-4 py-2.5 rounded-xl hover:bg-[#0F4C81] transition-all duration-300 shadow-sm hover:shadow-md">
          <FaPlus className="mr-2" /> Add {staffTitle}
        </button>
      </header>

      <WardenStats wardens={staffList} staffType={staffType} />

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto overflow-x-auto pb-2">
          <FilterTabs tabs={WARDEN_FILTER_TABS} activeTab={filterStatus} setActiveTab={setFilterStatus} />
        </div>
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={`Search ${staffTitle.toLowerCase()}s by name or hostel`} className="w-full sm:w-64 md:w-72" />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredStaff.map((staff) => (
          <WardenCard key={staff.id} warden={staff} staffType={staffType} onUpdate={() => fetchStaff()} onDelete={() => fetchStaff()} />
        ))}
      </div>

      {filteredStaff.length === 0 && <NoResults icon={<FaUserTie className="text-gray-300 text-3xl" />} message={`No ${staffTitle.toLowerCase()}s found`} suggestion="Try changing your search or filter criteria" />}

      <AddWardenModal show={showAddModal} staffType={staffType} onClose={() => setShowAddModal(false)} onAdd={fetchStaff} />
    </div>
  )
}

export default StaffManagement
