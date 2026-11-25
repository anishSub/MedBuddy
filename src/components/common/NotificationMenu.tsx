'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/common/Icon';
import { useAuth } from '@/context/AuthContext';

export interface NotificationItem {
  id: string;
  type: 'medicine' | 'appointment' | 'record' | 'system';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const DEFAULT_PATIENT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'p1',
    type: 'medicine',
    title: 'Evening Medicine Reminder',
    message: 'Time to take Metformin 500 mg after dinner.',
    time: '10 mins ago',
    unread: true,
  },
  {
    id: 'p2',
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: 'Cardiology Review with Dr. Sushil Adhikari tomorrow at 10:30 AM.',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 'p3',
    type: 'record',
    title: 'New Lab Report Ready',
    message: 'HbA1c & Glucose Panel uploaded by Norvic Laboratory.',
    time: '3 hours ago',
    unread: false,
  },
  {
    id: 'p4',
    type: 'system',
    title: 'Weekly Health Adherence',
    message: 'Great job! You achieved 88% on-time medication adherence this week.',
    time: 'Yesterday',
    unread: false,
  },
];

const DEFAULT_DOCTOR_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'd1',
    type: 'appointment',
    title: 'Patient Checked In',
    message: 'Maya Gurung (#CT-1987) has checked in for 09:30 AM appointment.',
    time: 'Just now',
    unread: true,
  },
  {
    id: 'd2',
    type: 'appointment',
    title: 'Reschedule Requested',
    message: 'Sita Rai requested to reschedule 12:00 PM Endocrinology consultation.',
    time: '25 mins ago',
    unread: true,
  },
  {
    id: 'd3',
    type: 'record',
    title: 'New Clinical Upload',
    message: 'Patient Ramesh Sharma uploaded PA View Chest X-Ray.',
    time: '2 hours ago',
    unread: false,
  },
];

const DEFAULT_ADMIN_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'a1',
    type: 'system',
    title: 'Doctor License Pending',
    message: 'Dr. Pratik Manandhar submitted NMC 24871 license for verification.',
    time: '15 mins ago',
    unread: true,
  },
  {
    id: 'a2',
    type: 'appointment',
    title: 'Follow-up Queue Alert',
    message: '3 patients are pending follow-up call confirmations today.',
    time: '1 hour ago',
    unread: true,
  },
];

export function NotificationMenu({ className = '' }: { className?: string }) {
  const { user } = useAuth();
  const role = user?.role || 'Patient';

  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const initialList =
    role === 'Doctor'
      ? DEFAULT_DOCTOR_NOTIFICATIONS
      : role === 'Admin'
      ? DEFAULT_ADMIN_NOTIFICATIONS
      : DEFAULT_PATIENT_NOTIFICATIONS;

  const [items, setItems] = useState<NotificationItem[]>(initialList);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Update notification list when role changes
  useEffect(() => {
    setItems(
      role === 'Doctor'
        ? DEFAULT_DOCTOR_NOTIFICATIONS
        : role === 'Admin'
        ? DEFAULT_ADMIN_NOTIFICATIONS
        : DEFAULT_PATIENT_NOTIFICATIONS
    );
  }, [role]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const unreadCount = items.filter((i) => i.unread).length;

  const markAllAsRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const triggerDesktopNotification = async (customMsg?: string) => {
    const alertBody =
      customMsg ||
      (role === 'Doctor'
        ? 'Patient Maya Gurung has checked in for her 09:30 AM appointment.'
        : 'MedBuddy Reminder: Time to take Metformin 500 mg after meal!');

    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Browser notifications are not supported on this device.');
      return;
    }

    try {
      let currentPerm = Notification.permission;
      if (currentPerm === 'default') {
        currentPerm = await Notification.requestPermission();
        setPermission(currentPerm);
      }

      if (currentPerm === 'granted') {
        new Notification('MedBuddy Alert', {
          body: alertBody,
          icon: '/logo-robot.png',
        });
        showToast('Desktop alert sent! Check your system notification banner.');
      } else {
        showToast('Notification permission was blocked in your browser settings.');
      }
    } catch {
      showToast('Could not trigger notification.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        title="View Notifications & Reminders"
        className={`relative grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] shadow-xs transition hover:border-[#B9D8D5] hover:bg-[#F8FAFC] ${className}`}
      >
        <Icon name="bell" size={17} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F59E0B] ring-2 ring-white" />
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] sm:w-[380px] rounded-xl border border-[#E2E8F0] bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-[#0F172A]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-semibold text-[#0D9488]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-[#0D9488] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-[#F1F5F9]">
            {items.length === 0 ? (
              <div className="p-6 text-center text-[12px] text-[#94A3B8]">
                No notifications right now.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setItems((prev) =>
                      prev.map((i) => (i.id === item.id ? { ...i, unread: false } : i))
                    );
                  }}
                  className={`flex cursor-pointer items-start gap-3 p-3.5 transition hover:bg-[#F8FAFC] ${
                    item.unread ? 'bg-[#F0FDFA]/60' : 'bg-white'
                  }`}
                >
                  <div
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] ${
                      item.type === 'medicine'
                        ? 'bg-[#E0F2FE] text-[#0284C7]'
                        : item.type === 'appointment'
                        ? 'bg-[#FEF3C7] text-[#D97706]'
                        : item.type === 'record'
                        ? 'bg-[#DCFCE7] text-[#16A34A]'
                        : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    {item.type === 'medicine' ? (
                      <Icon name="clock" size={13} />
                    ) : item.type === 'appointment' ? (
                      <Icon name="calendar" size={13} />
                    ) : item.type === 'record' ? (
                      <Icon name="file" size={13} />
                    ) : (
                      <Icon name="bell" size={13} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[12px] font-semibold text-[#0F172A] truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] tabular-nums text-[#94A3B8] shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#64748B] leading-snug line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                  {item.unread && (
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0D9488] shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Push Trigger Bar */}
          <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-3 rounded-b-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#334155]">Desktop Push Alerts</p>
                <p className="text-[10px] text-[#94A3B8] truncate">
                  {permission === 'granted'
                    ? 'Active on this browser'
                    : 'Show real OS desktop banners'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerDesktopNotification()}
                className="flex items-center gap-1.5 rounded-md bg-[#0D9488] px-2.5 py-1.5 text-[10.5px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E] shrink-0"
              >
                <Icon name="bell" size={12} />
                Send Test Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating toast notification confirmation */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2.5 text-[12px] text-white shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <Icon name="check" size={14} className="text-[#34D399]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
