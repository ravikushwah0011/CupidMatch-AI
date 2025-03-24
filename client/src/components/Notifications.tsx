
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes } from '@fortawesome/free-solid-svg-icons';

interface Notification {
  id: number;
  type: 'like' | 'message' | 'video';
  userId: number;
  userName: string;
  timestamp: string;
}

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<Notification[]>([]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800"
      >
        <FontAwesomeIcon icon={faBell} className="text-xl" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <button onClick={() => setIsOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No new notifications</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="p-4 border-b hover:bg-gray-50">
                  <p className="font-medium">{notification.userName}</p>
                  <p className="text-sm text-gray-600">
                    {notification.type === 'like' && 'liked your profile'}
                    {notification.type === 'message' && 'sent you a message'}
                    {notification.type === 'video' && 'requested a video call'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
