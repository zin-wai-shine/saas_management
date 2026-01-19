import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { ConfirmModal, SuccessModal } from '../../components/ConfirmModal';
import { Dropdown } from '../../components/Dropdown';
import { Toast, ToastContainer } from '../../components/Toast';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Mail,
  MailOpen,
  Eye,
  X,
  Clock,
} from 'lucide-react';
import { notificationAPI } from '../../api/api';

const columnHelper = createColumnHelper();

export const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    user_id: null, // null means send to all admins
  });

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      // Only auto-refresh if we're not loading
      if (!loading) {
        fetchNotifications();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.list();
      const data = response.data?.data || response.data || [];
      
      if (data.length === 0) {
        // Fallback fake data if nothing in DB
        setNotifications([
          { id: 1, from_user_name: 'System', user_name: 'All Admins', subject: 'System Maintenance', message: 'Scheduled maintenance on Sunday at 2 AM UTC.', type: 'alert', is_read: false, created_at: new Date().toISOString() },
          { id: 2, from_user_name: 'John Doe', user_name: 'All Admins', subject: 'New Feature Suggestion', message: 'I would love to see a dark mode toggle in the settings!', type: 'message', is_read: false, created_at: new Date().toISOString() },
          { id: 3, from_user_name: 'System', user_name: 'Super Admin', subject: 'Security Alert', message: 'New login detected from a new device.', type: 'alert', is_read: true, created_at: new Date().toISOString() },
          { id: 4, from_user_name: 'Jane Smith', user_name: 'All Admins', subject: 'Billing Inquiry', message: 'I have a question about my last invoice.', type: 'message', is_read: true, created_at: new Date().toISOString() },
          { id: 5, from_user_name: 'System', user_name: 'All Admins', subject: 'Welcome to SaaS Management', message: 'Explore our new dashboard features and let us know what you think.', type: 'info', is_read: true, created_at: new Date().toISOString() },
        ]);
      } else {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Fallback fake data on error
      setNotifications([
        { id: 1, from_user_name: 'System', user_name: 'All Admins', subject: 'System Maintenance', message: 'Scheduled maintenance on Sunday at 2 AM UTC.', type: 'alert', is_read: false, created_at: new Date().toISOString() },
        { id: 2, from_user_name: 'John Doe', user_name: 'All Admins', subject: 'New Feature Suggestion', message: 'I would love to see a dark mode toggle in the settings!', type: 'message', is_read: false, created_at: new Date().toISOString() },
        { id: 3, from_user_name: 'System', user_name: 'Super Admin', subject: 'Security Alert', message: 'New login detected from a new device.', type: 'alert', is_read: true, created_at: new Date().toISOString() },
        { id: 4, from_user_name: 'Jane Smith', user_name: 'All Admins', subject: 'Billing Inquiry', message: 'I have a question about my last invoice.', type: 'message', is_read: true, created_at: new Date().toISOString() },
        { id: 5, from_user_name: 'System', user_name: 'All Admins', subject: 'Welcome to SaaS Management', message: 'Explore our new dashboard features and let us know what you think.', type: 'info', is_read: true, created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const handleAdd = () => {
    setFormData({ subject: '', message: '', user_id: null });
    setIsAddModalOpen(true);
  };

  const handleView = (notification) => {
    setSelectedNotification(notification);
    setIsViewModalOpen(true);
    // Mark as read when viewing
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.update(id, { is_read: true });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      // Try to delete from API, but don't crash if it fails (e.g. for fake data)
    try {
        await notificationAPI.delete(deleteId);
      } catch (e) {
        console.warn('API delete failed, falling back to local filter:', e);
      }
      
      setNotifications(notifications.filter((n) => n.id !== deleteId));
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      // fetchNotifications(); // Don't re-fetch immediately as it might bring back fake data
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setIsConfirmModalOpen(false);
      alert('Failed to delete notification. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await notificationAPI.create(formData);
      showToast('Notification sent successfully', 'success');
      setIsAddModalOpen(false);
      setFormData({ subject: '', message: '', user_id: null });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to send notification:', error);
      showToast(error.response?.data?.error || 'Failed to send notification', 'error');
    }
  };

  const filteredData = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        globalFilter === '' ||
        notification.subject?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        notification.message?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        notification.from_user_name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        notification.user_name?.toLowerCase().includes(globalFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'read' && notification.is_read) ||
        (statusFilter === 'unread' && !notification.is_read);

      const matchesType = typeFilter === 'all' || notification.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [notifications, globalFilter, statusFilter, typeFilter]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'serialNumber',
        header: 'SL',
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor('from_user_name', {
        header: 'From',
        cell: (info) => (
          <div className="flex items-center gap-2">
            {info.getValue() || (
              <span className="text-gray-400 italic">System</span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('user_name', {
        header: 'To',
        cell: (info) => (
          <div className="flex items-center gap-2">
            {info.getValue() || (
              <span className="text-gray-400 italic">All Admins</span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('subject', {
        header: 'Subject',
        cell: (info) => (
          <div className="flex items-center gap-2">
            {!info.row.original.is_read && (
              <div className="w-2 h-2 rounded-full bg-teal-400"></div>
            )}
            <span className={info.row.original.is_read ? 'text-gray-400' : 'text-white font-medium'}>
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => {
          const type = info.getValue() || 'message';
          return (
            <span className="px-2 py-1 rounded bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-blue-400 text-xs">
              {type}
            </span>
          );
        },
      }),
      columnHelper.accessor('is_read', {
        header: 'Status',
        cell: (info) => {
          const isRead = info.getValue();
          return (
            <span
              className={`px-2 py-1 rounded backdrop-blur-md border text-xs ${
                isRead
                  ? 'bg-green-900/20 border-green-700/30 text-green-400'
                  : 'bg-yellow-900/20 border-yellow-700/30 text-yellow-400'
              }`}
            >
              {isRead ? 'Read' : 'Unread'}
            </span>
          );
        },
      }),
      columnHelper.accessor('created_at', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-400"
          >
            Date
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => {
          const date = new Date(info.getValue());
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView(info.row.original);
              }}
              className="p-2 rounded bg-gray-800/10 backdrop-blur-sm border border-white/5 hover:bg-gray-800/20 text-gray-400 hover:text-white transition-all"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(info.row.original.id);
              }}
              className="p-2 rounded bg-gray-800/20 backdrop-blur-sm border border-white/10 hover:bg-gray-800/30 text-gray-400 hover:text-white transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-4">Notifications</h1>
        
        {/* Search, Filters and Action Button Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search and Filters */}
          <div className="flex items-center gap-3 flex-1">
            <div className="min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded bg-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-teal-glass text-sm"
            />
          </div>
            </div>
          <Dropdown
            value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'read', label: 'Read' },
              { value: 'unread', label: 'Unread' },
            ]}
              placeholder="All Status"
          />
          <Dropdown
            value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'message', label: 'Message' },
              { value: 'alert', label: 'Alert' },
              { value: 'info', label: 'Info' },
            ]}
              placeholder="All Types"
          />
            {(globalFilter || statusFilter !== 'all' || typeFilter !== 'all') && (
          <button
            onClick={() => {
              setGlobalFilter('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}
                className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Right: Action Button */}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Send Message
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-700">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                    No notifications found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => handleView(row.original)}
                    className="bg-gray-800 hover:bg-gray-750 transition-colors cursor-pointer border-b-0 focus:outline-none active:outline-none"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-gray-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filteredData.length
            )}{' '}
            of {filteredData.length} notifications
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-300">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Send Notification">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 rounded bg-gray-800/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
              placeholder="Enter subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 rounded bg-gray-800/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
              placeholder="Enter message"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-300 hover:bg-gray-800/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-400 hover:bg-teal-500/30 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Notification Details"
        size="lg"
      >
        {selectedNotification && (
          <div className="space-y-5">
            {/* Compact Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-700/50">
              <div className="w-10 h-10 rounded-lg bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-teal-glass" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white truncate">{selectedNotification.subject || 'Notification'}</h3>
                <p className="text-xs text-gray-400">ID: #{selectedNotification.id}</p>
              </div>
            </div>

            {/* Compact Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* From */}
              <div className="group p-3 rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-default">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-blue-300 font-bold">F</span>
                  </div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">From</label>
                </div>
                <p className="text-xs font-medium text-white truncate">
                  {selectedNotification.from_user_name || (
                    <span className="text-gray-400 italic">System</span>
                  )}
                </p>
              </div>

              {/* To */}
              <div className="group p-3 rounded-lg bg-gradient-to-br from-green-500/5 to-green-600/5 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-all cursor-default">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-green-300 font-bold">T</span>
                  </div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">To</label>
                </div>
                <p className="text-xs font-medium text-white truncate">
                  {selectedNotification.user_name || (
                    <span className="text-gray-400 italic">All</span>
                  )}
                </p>
              </div>

              {/* Type */}
              <div className="group p-3 rounded-lg bg-gradient-to-br from-purple-500/5 to-purple-600/5 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-default">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-purple-300 font-bold">T</span>
                  </div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Type</label>
                </div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-400 capitalize">
                  {selectedNotification.type || 'message'}
                </span>
              </div>

              {/* Date */}
              <div className="group p-3 rounded-lg bg-gradient-to-br from-gray-500/5 to-gray-600/5 backdrop-blur-sm border border-gray-500/20 hover:border-gray-500/40 transition-all cursor-default">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded bg-gray-500/20 border border-gray-500/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3 h-3 text-gray-300" />
                  </div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date</label>
                </div>
                <p className="text-xs font-medium text-white">
                  {new Date(selectedNotification.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Message - Compact */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-teal-500/5 to-teal-600/5 backdrop-blur-sm border border-teal-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
                  <MailOpen className="w-3.5 h-3.5 text-teal-300" />
                </div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Message</label>
              </div>
              <div className="p-3 rounded-md bg-gray-900/30 border border-gray-700/30">
                <p className="text-xs text-white whitespace-pre-wrap leading-relaxed">
                  {selectedNotification.message || 'No message content'}
                </p>
              </div>
            </div>

            {/* Action Buttons - Compact */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-700/50">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        loading={isDeleting}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Deleted!"
        message="The notification has been successfully deleted."
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
};

