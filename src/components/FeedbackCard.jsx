import React, { useState } from "react"
import { HiAnnotation, HiUser, HiCalendar, HiClock, HiEye, HiReply, HiTrash, HiPencilAlt, HiMail } from "react-icons/hi"
import { feedbackApi } from "../services/feedbackApi"
import FeedbackReplyModal from "./FeedbackReplyModal"
import FeedbackFormModal from "./student/feedback/FeedbackFormModal"
import { useAuth } from "../contexts/AuthProvider"

const FeedbackCard = ({ feedback, refresh, isStudentView = false }) => {
  const { canAccess } = useAuth()

  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState(feedback.status)
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const isPending = status === "Pending"

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    return status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
  }

  const handleToggleSeen = async () => {
    const newStatus = status === "Pending" ? "Seen" : "Pending"
    if (newStatus === "Pending" && feedback.reply) {
      const confirm = window.confirm("Are you sure you want to mark this feedback as Pending. This will remove the reply. Do you want to proceed?")
      if (!confirm) return
    } else {
      const confirm = window.confirm(`Are you sure you want to mark this feedback as ${newStatus}?`)
      if (!confirm) return
    }
    try {
      setIsUpdating(true)
      const response = await feedbackApi.updateFeedbackStatus(feedback._id, newStatus)
      if (response.success) {
        setStatus(newStatus)
        refresh()
      } else {
        alert("Failed to update feedback status")
      }
    } catch (error) {
      console.error("Error updating feedback status:", error)
      alert("An error occurred while updating feedback status")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReply = async (replyText) => {
    try {
      setIsUpdating(true)
      const response = await feedbackApi.replyToFeedback(feedback._id, replyText)
      if (response.success) {
        setStatus("Seen")
        refresh()
      } else {
        alert("Failed to submit reply")
      }
    } catch (error) {
      console.error("Error replying to feedback:", error)
      alert("An error occurred while replying to feedback")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this feedback?")
    if (!confirm) return

    try {
      setIsUpdating(true)
      const response = await feedbackApi.deleteFeedback(feedback._id)
      if (response.success) {
        refresh()
      } else {
        alert("Failed to delete feedback")
      }
    } catch (error) {
      console.error("Error deleting feedback:", error)
      alert("An error occurred while deleting feedback")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEdit = async (updateFeedback) => {
    try {
      setIsUpdating(true)
      const response = await feedbackApi.updateFeedback(feedback._id, updateFeedback)
      if (response.success) {
        refresh()
        return true
      } else {
        alert("Failed to update feedback")
        return false
      }
    } catch (error) {
      console.error("Error updating feedback:", error)
      alert("An error occurred while updating feedback")
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
            <HiAnnotation size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base md:text-lg line-clamp-1">{feedback.title}</h3>
            <span className="text-xs text-gray-500">ID: {feedback._id.substring(0, 8)}</span>
          </div>
        </div>
        {!isStudentView && canAccess("feedback", "view") && (
          <div className="flex items-center">
            {feedback.userId.profileImage ? (
              <img src={feedback.userId.profileImage} alt={feedback.userId.name} className="w-10 h-10 rounded-full object-cover mr-2 border border-gray-200" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <HiUser className="text-[#1360AB]" size={20} />
              </div>
            )}
            <div className="mr-2">
              <p className="text-sm font-medium text-gray-800">{feedback.userId.name}</p>
              <p className="text-xs text-gray-600 flex items-center">
                <HiMail className="mr-1" size={12} />
                {feedback.userId.email}
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(status)}`}>{status}</span>
          </div>
        )}
        {isStudentView && canAccess("feedback", "view") && <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(status)}`}>{status}</span>}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center flex-wrap">
          <div className="flex items-center mr-4 mb-1">
            <HiCalendar className="text-[#1360AB] text-opacity-70 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700">{formatDate(feedback.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <HiClock className="text-[#1360AB] text-opacity-70 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-700">{formatTime(feedback.createdAt)}</span>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg min-h-[80px]">
          <p className="text-sm text-gray-700">{feedback.description}</p>
        </div>

        {feedback.reply && (
          <div className="mt-3">
            <div className="flex items-center mb-2">
              <HiReply className="text-[#1360AB] mr-2" />
              <h4 className="font-medium text-[#1360AB]">Staff Reply</h4>
            </div>
            <div className="bg-[#E4F1FF] p-3 rounded-lg border-l-4 border-[#1360AB]">
              <p className="text-sm text-gray-700">{feedback.reply}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end space-x-3">
        {!isStudentView && canAccess("feedback", "react") && status === "Pending" && !feedback.reply && (
          <>
            <button onClick={() => setIsReplyModalOpen(true)} className="flex items-center px-4 py-2 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b87] transition-all duration-300">
              <HiReply className="mr-2" /> Reply
            </button>
            <button onClick={handleToggleSeen} disabled={isUpdating} className="flex items-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300">
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <HiEye className="mr-2" /> Mark as Seen
                </>
              )}
            </button>
          </>
        )}

        {!isStudentView && canAccess("feedback", "react") && status === "Seen" && (
          <>
            <button onClick={() => setIsReplyModalOpen(true)} className="flex items-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300">
              <HiReply className="mr-2" /> {feedback.reply ? "Edit Reply" : "Add Reply"}
            </button>
            <button onClick={handleToggleSeen} disabled={isUpdating} className="flex items-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300">
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <HiEye className="mr-2" /> Mark as Pending
                </>
              )}
            </button>
          </>
        )}

        {isStudentView && canAccess("feedback", "react") && isPending && (
          <>
            <button onClick={() => setIsEditModalOpen(true)} className="flex items-center px-4 py-2 bg-[#E4F1FF] text-[#1360AB] rounded-lg hover:bg-[#1360AB] hover:text-white transition-all duration-300">
              <HiPencilAlt className="mr-2" /> Edit
            </button>
            <button onClick={handleDelete} disabled={isUpdating} className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300">
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <HiTrash className="mr-2" /> Delete
                </>
              )}
            </button>
          </>
        )}
      </div>

      <FeedbackReplyModal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)} feedback={feedback} onReply={handleReply} />

      <FeedbackFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEdit} initialData={feedback} isEditing={true} />
    </div>
  )
}

export default FeedbackCard
