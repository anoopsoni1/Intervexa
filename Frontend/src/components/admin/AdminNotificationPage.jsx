import React, { useState, useEffect } from "react";
import NotificationComposer from "./NotificationComposer";
import UserSearchSelect from "./UserSearchSelect";
import AudienceSelector from "./AudienceSelector";
import { useDispatch, useSelector } from "react-redux";
import { sendToUser, sendToMultiple, broadcast, sendToAudience, getStats, getAudienceCounts } from "../../slices/adminNotification.slice";
import notificationService from "../../services/notificationService";

const AdminNotificationPage = () => {
  const dispatch = useDispatch();
  const { stats, audienceCounts } = useSelector((s) => s.adminNotifications || {});

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [audience, setAudience] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getAudienceCounts());
  }, [dispatch]);

  const handleSendToUser = async (formData) => {
    if (selectedUsers.length === 0) return alert("Select a target user first");
    setIsLoading(true);
    try {
      const payload = {
        targetUserId: selectedUsers[0]._id,
        ...formData,
      };
      await dispatch(sendToUser(payload)).unwrap();
      alert("Notification sent to user");
    } catch (err) {
      alert(err.message || "Failed to send notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToMultiple = async (formData) => {
    if (selectedUsers.length === 0) return alert("Select at least one user");
    setIsLoading(true);
    try {
      const payload = {
        userIds: selectedUsers.map((u) => u._id),
        ...formData,
      };
      await dispatch(sendToMultiple(payload)).unwrap();
      alert("Notifications sent");
    } catch (err) {
      alert(err.message || "Failed to send notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async (formData) => {
    if (!confirm("Are you sure you want to broadcast to all users?")) return;
    setIsLoading(true);
    try {
      await dispatch(broadcast(formData)).unwrap();
      alert("Broadcast sent");
    } catch (err) {
      alert(err.message || "Failed to broadcast");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToAudience = async (formData) => {
    setIsLoading(true);
    try {
      await dispatch(sendToAudience({ audience, ...formData })).unwrap();
      alert("Audience notification sent");
    } catch (err) {
      alert(err.message || "Failed to send to audience");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Notifications</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Compose Notification</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select User(s)</label>
              <UserSearchSelect multiple value={selectedUsers} onChange={setSelectedUsers} />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Or choose audience</label>
              <AudienceSelector value={audience} onChange={setAudience} />
            </div>

            <NotificationComposer
              onSubmit={handleSendToUser}
              isLoading={isLoading}
              submitButtonText="Send To Selected User"
            >
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => handleSendToMultiple()} className="px-4 py-2 bg-gray-100 rounded">Send To Selected Users</button>
                <button type="button" onClick={() => handleSendToAudience()} className="px-4 py-2 bg-gray-100 rounded">Send To Audience</button>
                <button type="button" onClick={() => handleBroadcast({ title: prompt('Title'), message: prompt('Message') })} className="px-4 py-2 bg-red-600 text-white rounded">Broadcast To All</button>
              </div>
            </NotificationComposer>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Notification History</h2>
            <p className="text-sm text-gray-500">Use the history table to view past notifications (coming soon).</p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Statistics</h3>
            <pre className="text-xs mt-2 bg-gray-50 p-2 rounded">{JSON.stringify(stats || {}, null, 2)}</pre>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Audience Counts</h3>
            <pre className="text-xs mt-2 bg-gray-50 p-2 rounded">{JSON.stringify(audienceCounts || {}, null, 2)}</pre>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminNotificationPage;
