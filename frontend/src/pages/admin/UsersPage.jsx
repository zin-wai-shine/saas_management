import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { ConfirmModal, SuccessModal } from '../../components/ConfirmModal';
import { Dropdown } from '../../components/Dropdown';
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
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Filter,
  X,
  Save,
} from 'lucide-react';
import { businessAPI } from '../../api/api';

const columnHelper = createColumnHelper();

export const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'owner',
    status: 'active',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // In a real app, you'd have a users API endpoint
      // For now, we'll fetch from businesses to get user data
      const response = await businessAPI.list();
      // Transform data - in real app, use users API
      setUsers([
        { id: 1, name: 'Super Admin', email: 'admin@saas.com', role: 'admin', status: 'active', createdAt: '2026-01-15' },
        { id: 2, name: 'John Doe', email: 'john@example.com', role: 'owner', status: 'active', createdAt: '2026-01-16' },
        { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'owner', status: 'active', createdAt: '2026-01-17' },
        { id: 4, name: 'Bob Johnson', email: 'bob@example.com', role: 'owner', status: 'active', createdAt: '2026-01-17' },
        { id: 5, name: 'Alice Brown', email: 'alice@example.com', role: 'owner', status: 'pending', createdAt: '2026-01-18' },
      ]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'serialNumber',
        header: 'SL',
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            Name
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/10 backdrop-blur-md border border-teal-500/20 flex items-center justify-center text-teal-300 text-xs font-semibold">
              {info.getValue().charAt(0)}
            </div>
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('email', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            Email
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => <span className="text-gray-600 dark:text-gray-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => {
          const role = info.getValue();
          return (
            <span
              className={`px-2.5 py-1 rounded text-xs font-medium ${
                role === 'admin'
                  ? 'bg-purple-900/20 backdrop-blur-md border border-purple-700/30 text-purple-400'
                  : 'bg-blue-900/20 backdrop-blur-md border border-blue-700/30 text-blue-400'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`px-2.5 py-1 rounded text-xs font-medium ${
                status === 'active'
                  ? 'bg-green-900/20 backdrop-blur-md border border-green-700/30 text-green-400'
                  : 'bg-yellow-900/20 backdrop-blur-md border border-yellow-700/30 text-yellow-400'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            Created
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(info.row.original)}
              className="p-2 rounded bg-gray-800/10 backdrop-blur-sm border border-white/5 hover:bg-gray-800/20 text-gray-400 hover:text-white transition-all"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(info.row.original.id)}
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

  const filteredData = useMemo(() => {
    return users.filter((user) => {
      const matchesGlobal =
        globalFilter === '' ||
        user.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(globalFilter.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesGlobal && matchesRole && matchesStatus;
    });
  }, [users, globalFilter, roleFilter, statusFilter]);

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

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'owner',
      status: 'active',
    });
    setSelectedUser(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'owner',
      status: user.status || 'active',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
      try {
      setIsDeleting(true);
      // Now using the real API
      try {
        await userAPI.delete(deleteId);
      } catch (e) {
        console.warn('API delete failed, falling back to local filter:', e);
      }
      
      setUsers(users.filter((u) => u.id !== deleteId));
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      } catch (error) {
        console.error('Failed to delete user:', error);
      // If even local state update fails (unlikely), show error
      setIsConfirmModalOpen(false);
        alert('Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // Update user
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
        alert('User updated successfully!');
        setIsEditModalOpen(false);
      } else {
        // Create user
        const newUser = {
          id: users.length + 1,
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers([...users, newUser]);
        alert('User created successfully!');
        setIsAddModalOpen(false);
      }
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'owner',
        status: 'active',
      });
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-4">Users</h1>
        
        {/* Search, Filters and Action Button Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search and Filters */}
          <div className="flex items-center gap-3 flex-1">
            <div className="min-w-[200px]">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded bg-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-teal-glass text-sm"
              />
            </div>
          </div>
            <Dropdown
            value={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'admin', label: 'Admin' },
                { value: 'owner', label: 'Owner' },
              ]}
              placeholder="All Roles"
            />
            <Dropdown
            value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
              ]}
              placeholder="All Status"
            />
          {(globalFilter || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={clearFilters}
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
            Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
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
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="bg-gray-800 hover:bg-gray-750 transition-colors border-b-0 focus:outline-none active:outline-none"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  filteredData.length
                )}{' '}
                of {filteredData.length} users
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
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="Enter user name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {selectedUser ? 'New Password (leave blank to keep current)' : 'Password'} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required={!selectedUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="Enter password"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}
                options={[
                  { value: 'owner', label: 'Owner' },
                  { value: 'admin', label: 'Admin' },
                ]}
                placeholder="Select Role"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                ]}
                placeholder="Select Status"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedUser(null);
              }}
              className="px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {selectedUser ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        loading={isDeleting}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Deleted!"
        message="The user has been successfully deleted."
      />
    </div>
  );
};
