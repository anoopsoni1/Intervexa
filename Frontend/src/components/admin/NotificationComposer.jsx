import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Send } from "lucide-react";
import adminNotificationService from "../../services/adminNotificationService";
import UserSearchSelect from "./UserSearchSelect";
import AudienceSelector from "./AudienceSelector";

const SEND_MODES = {
  USER: "user",
  MULTIPLE: "multiple",
  BROADCAST: "broadcast",
  AUDIENCE: "audience",
};

/**
 * NotificationComposer Component
 * Admin interface for sending notifications to users
 */
const NotificationComposer = ({ onSuccess }) => {
  const [mode, setMode] = useState(SEND_MODES.BROADCAST);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    actionUrl: "",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedAudience, setSelectedAudience] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const notificationTypes = [
    { value: "info", label: "Info", color: "blue" },
    { value: "success", label: "Success", color: "green" },
    { value: "warning", label: "Warning", color: "amber" },
    { value: "error", label: "Error", color: "red" },
    { value: "admin", label: "Admin", color: "purple" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (mode === SEND_MODES.USER && selectedUsers.length === 0) {
      newErrors.users = "Please select a user";
    }
    if (mode === SEND_MODES.MULTIPLE && selectedUsers.length === 0) {
      newErrors.users = "Please select at least one user";
    }
    if (mode === SEND_MODES.AUDIENCE && !selectedAudience) {
      newErrors.audience = "Please select an audience segment";
    }

    if (formData.actionUrl && !isValidUrl(formData.actionUrl)) {
      newErrors.actionUrl = "Invalid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (e) {
        console.log(e);
      return false;
     
      
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        ...(formData.actionUrl && { actionUrl: formData.actionUrl }),
      };

      let result;
      if (mode === SEND_MODES.USER) {
        await adminNotificationService.sendToUser({
          ...payload,
          targetUserId: selectedUsers[0]._id,
        });
        result = `Notification sent to ${selectedUsers[0].FirstName}`;
      } else if (mode === SEND_MODES.MULTIPLE) {
        await adminNotificationService.sendToMultiple({
          ...payload,
          userIds: selectedUsers.map((u) => u._id),
        });
        result = `Notification sent to ${selectedUsers.length} users`;
      } else if (mode === SEND_MODES.BROADCAST) {
        await adminNotificationService.broadcast(payload);
        result = "Broadcast notification sent to all users";
      } else if (mode === SEND_MODES.AUDIENCE) {
        await adminNotificationService.sendToAudience({
          ...payload,
          audience: selectedAudience,
        });
        result = `Notification sent to ${selectedAudience} segment`;
      }

      setSuccessMessage(result);
      setFormData({ title: "", message: "", type: "info", actionUrl: "" });
      setSelectedUsers([]);
      setSelectedAudience("");

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setErrors({ submit: err.message || "Failed to send notification" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-green-400"
        >
          ✓ {successMessage}
        </motion.div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400">{errors.submit}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Send Mode Selection */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Send To</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(SEND_MODES).map(([key, value]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`py-3 px-4 rounded-lg font-medium text-sm transition-all border-2 ${
                  mode === value
                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                    : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                }`}
              >
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* User/Audience Selection */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
          {mode === SEND_MODES.USER && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">
                Select User
              </h3>
              <UserSearchSelect
                multiple={false}
                value={selectedUsers}
                onChange={setSelectedUsers}
              />
              {errors.users && (
                <p className="text-red-400 text-sm mt-2">{errors.users}</p>
              )}
            </div>
          )}

          {mode === SEND_MODES.MULTIPLE && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">
                Select Users
              </h3>
              <UserSearchSelect
                multiple={true}
                value={selectedUsers}
                onChange={setSelectedUsers}
              />
              {selectedUsers.length > 0 && (
                <p className="text-slate-400 text-xs mt-2">
                  {selectedUsers.length} user(s) selected
                </p>
              )}
              {errors.users && (
                <p className="text-red-400 text-sm mt-2">{errors.users}</p>
              )}
            </div>
          )}

          {mode === SEND_MODES.AUDIENCE && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">
                Select Audience Segment
              </h3>
              <AudienceSelector
                value={selectedAudience}
                onChange={setSelectedAudience}
              />
              {errors.audience && (
                <p className="text-red-400 text-sm mt-2">{errors.audience}</p>
              )}
            </div>
          )}

          {mode === SEND_MODES.BROADCAST && (
            <div className="text-center py-6">
              <p className="text-slate-400">
                This notification will be sent to all users
              </p>
            </div>
          )}
        </div>

        {/* Notification Content */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., 'New AI Resume Features Available'"
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-800 border transition-colors ${
                errors.title
                  ? "border-red-500"
                  : "border-slate-600 focus:border-indigo-500"
              } text-white placeholder-slate-500 focus:outline-none`}
              maxLength={200}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {formData.title.length}/200
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Write your notification message..."
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-800 border transition-colors h-32 resize-none ${
                errors.message
                  ? "border-red-500"
                  : "border-slate-600 focus:border-indigo-500"
              } text-white placeholder-slate-500 focus:outline-none`}
              maxLength={1000}
            />
            {errors.message && (
              <p className="text-red-400 text-sm mt-1">{errors.message}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {formData.message.length}/1000
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {notificationTypes.map((typeOption) => (
                <button
                  key={typeOption.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: typeOption.value,
                    }))
                  }
                  className={`py-2 px-3 rounded-lg font-medium text-sm transition-all border-2 ${
                    formData.type === typeOption.value
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                      : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {typeOption.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Action URL (Optional)
            </label>
            <input
              type="text"
              name="actionUrl"
              value={formData.actionUrl}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-800 border transition-colors ${
                errors.actionUrl
                  ? "border-red-500"
                  : "border-slate-600 focus:border-indigo-500"
              } text-white placeholder-slate-500 focus:outline-none`}
            />
            {errors.actionUrl && (
              <p className="text-red-400 text-sm mt-1">{errors.actionUrl}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Users will navigate to this URL when clicking the notification
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Notification
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default NotificationComposer;

