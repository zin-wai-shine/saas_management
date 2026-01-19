import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
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
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    try {
      await notificationAPI.delete(id);
      showToast('Notification deleted successfully', 'success');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      showToast('Failed to delete notification', 'error');
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
      columnHelper.accessor('id', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-400"
          >
            ID
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => info.getValue(),
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
              className="p-1.5 rounded bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-400 hover:bg-teal-500/30 transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(info.row.original.id);
              }}
              className="p-1.5 rounded bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-400 hover:bg-gray-800/40 transition-colors"
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
      <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80 border-b border-white/10">
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
            <tbody className="divide-y divide-white/5">
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
                    className="hover:bg-white/5 transition-colors cursor-pointer border-b-0 focus:outline-none active:outline-none"
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
        <div className="px-4 py-3 flex items-center justify-between border-t border-white/10 bg-gray-800/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-400 hover:bg-gray-800/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-400 hover:bg-gray-800/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-400 hover:bg-gray-800/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-400 hover:bg-gray-800/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        title={selectedNotification?.subject || 'Notification'}
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">From</label>
              <p className="text-white">
                {selectedNotification.from_user_name || (
                  <span className="text-gray-400 italic">System</span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">To</label>
              <p className="text-white">
                {selectedNotification.user_name || (
                  <span className="text-gray-400 italic">All Admins</span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <p className="text-white">{selectedNotification.type || 'message'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
              <p className="text-white whitespace-pre-wrap">{selectedNotification.message}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
              <p className="text-gray-400">
                {new Date(selectedNotification.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-400 hover:bg-teal-500/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer toasts={toasts} />
    </div>
  );
};

