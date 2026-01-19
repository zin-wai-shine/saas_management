import { useState, useMemo } from 'react';
import { Modal } from '../../components/Modal';
import { ConfirmModal, SuccessModal } from '../../components/ConfirmModal';
import { Dropdown } from '../../components/Dropdown';
import { Switch } from '../../components/Switch';
import { ToastContainer } from '../../components/Toast';
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
  Settings,
  UserPlus,
  Shield,
  Save,
  Edit,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Users,
  Globe,
  CreditCard,
  ShoppingCart,
  DollarSign,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Eye,
  Search,
} from 'lucide-react';

const columnHelper = createColumnHelper();

// Permission definitions for each feature
const PERMISSIONS = [
  { id: 'dashboard_view', label: 'View Dashboard', icon: LayoutDashboard },
  { id: 'dashboard_users_metric', label: 'View Total Users Metric', icon: Users },
  { id: 'dashboard_revenue_metric', label: 'View Revenue Metric', icon: DollarSign },
  { id: 'dashboard_subscriptions_metric', label: 'View Active Subscriptions Metric', icon: ShoppingCart },
  { id: 'dashboard_growth_metric', label: 'View Growth Rate Metric', icon: Activity },
  { id: 'dashboard_revenue_chart', label: 'View Revenue Overview Chart', icon: LayoutDashboard },
  { id: 'dashboard_category_chart', label: 'View Category Performance Chart', icon: LayoutDashboard },
  { id: 'dashboard_activity_table', label: 'View Recent Activity Table', icon: LayoutDashboard },
  { id: 'users_view', label: 'View Users', icon: Users },
  { id: 'users_create', label: 'Create Users', icon: Users },
  { id: 'users_edit', label: 'Edit Users', icon: Users },
  { id: 'users_delete', label: 'Delete Users', icon: Users },
  { id: 'websites_view', label: 'View Websites', icon: Globe },
  { id: 'websites_create', label: 'Create Websites', icon: Globe },
  { id: 'websites_edit', label: 'Edit Websites', icon: Globe },
  { id: 'websites_delete', label: 'Delete Websites', icon: Globe },
  { id: 'plans_view', label: 'View Plans', icon: CreditCard },
  { id: 'plans_create', label: 'Create Plans', icon: CreditCard },
  { id: 'plans_edit', label: 'Edit Plans', icon: CreditCard },
  { id: 'plans_delete', label: 'Delete Plans', icon: CreditCard },
  { id: 'subscriptions_view', label: 'View Subscriptions', icon: ShoppingCart },
  { id: 'subscriptions_create', label: 'Create Subscriptions', icon: ShoppingCart },
  { id: 'subscriptions_edit', label: 'Edit Subscriptions', icon: ShoppingCart },
  { id: 'subscriptions_delete', label: 'Delete Subscriptions', icon: ShoppingCart },
  { id: 'settings_view', label: 'View Settings', icon: Settings },
  { id: 'settings_manage', label: 'Manage Settings', icon: Settings },
  { id: 'roles_manage', label: 'Manage Roles', icon: Shield },
  { id: 'subadmins_create', label: 'Create Sub-Admins', icon: UserPlus },
];

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full access to all features',
      permissions: PERMISSIONS.map(p => p.id),
      isDefault: true,
    },
    {
      id: 2,
      name: 'Content Manager',
      description: 'Can manage websites and content',
      permissions: [
        'dashboard_view',
        'dashboard_revenue_chart',
        'dashboard_category_chart',
        'dashboard_activity_table',
        'websites_view',
        'websites_create',
        'websites_edit',
      ],
      isDefault: false,
    },
    {
      id: 3,
      name: 'Support Staff',
      description: 'Can view and edit users',
      permissions: [
        'dashboard_view',
        'dashboard_users_metric',
        'dashboard_subscriptions_metric',
        'dashboard_activity_table',
        'users_view',
        'users_edit',
        'subscriptions_view',
      ],
      isDefault: false,
    },
  ]);
  
  const [subAdmins, setSubAdmins] = useState([
    {
      id: 1,
      name: 'John Manager',
      email: 'john@example.com',
      role: 'Content Manager',
      roleId: 2,
      status: 'active',
    },
    {
      id: 2,
      name: 'Jane Support',
      email: 'jane@example.com',
      role: 'Support Staff',
      roleId: 3,
      status: 'active',
    },
  ]);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSubAdminModalOpen, setIsSubAdminModalOpen] = useState(false);
  const [isViewPermissionsModalOpen, setIsViewPermissionsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'role' or 'subadmin'
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });
  const [subAdminFormData, setSubAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
  });

  // Filter states for Sub-Admins table
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration: 3000 }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleTogglePermission = (permissionId) => {
    const newPermissions = roleFormData.permissions.includes(permissionId)
      ? roleFormData.permissions.filter(p => p !== permissionId)
      : [...roleFormData.permissions, permissionId];
    setRoleFormData({ ...roleFormData, permissions: newPermissions });
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setRoleFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleFormData.name.trim()) {
      addToast('Please enter a role name', 'error');
      return;
    }

    if (selectedRole) {
      // Update existing role
      setRoles(roles.map(r => 
        r.id === selectedRole.id 
          ? { ...r, ...roleFormData }
          : r
      ));
      addToast('Role updated successfully', 'success');
    } else {
      // Create new role
      const newRole = {
        id: roles.length + 1,
        ...roleFormData,
        isDefault: false,
      };
      setRoles([...roles, newRole]);
      addToast('Role created successfully', 'success');
    }
    setIsRoleModalOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = (roleId) => {
    setDeleteId(roleId);
    setDeleteType('role');
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      // Artificial delay for cool loading effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (deleteType === 'role') {
        setRoles(roles.filter(r => r.id !== deleteId));
      } else {
        setSubAdmins(subAdmins.filter(a => a.id !== deleteId));
      }
      
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Failed to delete:', error);
      addToast('Failed to delete. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const handleCreateSubAdmin = () => {
    setSubAdminFormData({
      name: '',
      email: '',
      password: '',
      roleId: '',
    });
    setIsSubAdminModalOpen(true);
  };

  const handleSaveSubAdmin = () => {
    if (!subAdminFormData.name || !subAdminFormData.email || !subAdminFormData.password || !subAdminFormData.roleId) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    const role = roles.find(r => r.id === parseInt(subAdminFormData.roleId));
    const newSubAdmin = {
      id: subAdmins.length + 1,
      name: subAdminFormData.name,
      email: subAdminFormData.email,
      role: role.name,
      roleId: parseInt(subAdminFormData.roleId),
      status: 'active',
    };
    setSubAdmins([...subAdmins, newSubAdmin]);
    setIsSubAdminModalOpen(false);
    setSubAdminFormData({ name: '', email: '', password: '', roleId: '' });
    addToast('Sub-admin created successfully', 'success');
  };

  const groupedPermissions = PERMISSIONS.reduce((acc, permission) => {
    const category = permission.id.split('_')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  // Define columns for roles table
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
            Role Name
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => {
          const role = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{info.getValue()}</span>
              {role.isDefault && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-900/20 backdrop-blur-md border border-blue-700/30 text-blue-400">
                  Default
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => <span className="text-gray-300">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const role = info.row.original;
          return (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewingRole(role);
                  setIsViewPermissionsModalOpen(true);
                }}
                className="p-2 rounded bg-gray-800/20 backdrop-blur-sm border border-white/10 hover:bg-gray-800/30 text-gray-400 hover:text-white transition-all"
                title="View Permissions"
              >
                <Eye className="w-4 h-4" />
              </button>
              {!role.isDefault && (
                <>
                  <button
                    onClick={() => handleEditRole(role)}
                    className="p-2 rounded bg-gray-800/20 backdrop-blur-sm border border-white/10 hover:bg-gray-800/30 text-gray-400 hover:text-white transition-all"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="p-2 rounded bg-gray-800/20 backdrop-blur-sm border border-white/10 hover:bg-gray-800/30 text-gray-400 hover:text-white transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    []
  );

  // Setup roles table
  const rolesTable = useReactTable({
    data: roles,
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

  // Filter Sub-Admins data
  const filteredSubAdmins = useMemo(() => {
    return subAdmins.filter((admin) => {
      const matchesGlobal =
        globalFilter === '' ||
        admin.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        admin.email.toLowerCase().includes(globalFilter.toLowerCase());
      const matchesRole = roleFilter === 'all' || admin.role === roleFilter || admin.roleId === parseInt(roleFilter);
      const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
      return matchesGlobal && matchesRole && matchesStatus;
    });
  }, [subAdmins, globalFilter, roleFilter, statusFilter]);

  // Define columns for Sub-Admins table
  const subAdminColumns = useMemo(
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
        cell: (info) => <span className="text-gray-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => {
          const role = info.getValue();
          return (
            <span className="px-2.5 py-1 rounded text-xs font-medium bg-blue-900/20 backdrop-blur-md border border-blue-700/30 text-blue-400">
              {role}
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
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                status === 'active'
                  ? 'bg-green-900/20 backdrop-blur-md border border-green-700/30 text-green-400'
                  : 'bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-400'
              }`}
            >
              {status === 'active' ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const admin = info.row.original;
          return (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Handle edit sub-admin
                  setSubAdminFormData({
                    name: admin.name,
                    email: admin.email,
                    password: '',
                    roleId: admin.roleId.toString(),
                  });
                  setIsSubAdminModalOpen(true);
                }}
                className="p-2 rounded bg-gray-800/20 backdrop-blur-sm border border-white/10 hover:bg-gray-800/30 text-gray-400 hover:text-white transition-all"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setDeleteId(admin.id);
                  setDeleteType('subadmin');
                  setIsConfirmModalOpen(true);
                }}
                className="p-2 rounded bg-gray-800/20 backdrop-blur-sm border border-white/10 hover:bg-gray-800/30 text-gray-400 hover:text-white transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      }),
    ],
    [subAdmins]
  );

  // Setup Sub-Admins table
  const subAdminsTable = useReactTable({
    data: filteredSubAdmins,
    columns: subAdminColumns,
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

  const clearSubAdminFilters = () => {
    setGlobalFilter('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Settings & Management</h1>
          <p className="text-gray-400 text-sm">Manage roles, permissions, and sub-administrators</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'roles'
                ? 'text-teal-glass border-b-2 border-teal-glass'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab('subadmins')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'subadmins'
                ? 'text-teal-glass border-b-2 border-teal-glass'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Sub-Admins
          </button>
        </div>

        {/* Roles & Permissions Tab */}
        {activeTab === 'roles' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Roles & Permissions</h2>
              <button
                onClick={handleCreateRole}
                className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Role
              </button>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 border-b border-gray-700">
                    {rolesTable.getHeaderGroups().map((headerGroup) => (
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
                    {rolesTable.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500 dark:text-gray-400">
                          No roles found
                        </td>
                      </tr>
                    ) : (
                      rolesTable.getRowModel().rows.map((row, index) => (
                        <tr
                          key={row.id}
                          className={`${index % 2 === 0 ? 'bg-white/40' : 'bg-white/60'} dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-200 border-b-0 focus:outline-none active:outline-none`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-white"
                            >
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
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {rolesTable.getState().pagination.pageIndex * rolesTable.getState().pagination.pageSize + 1} to{' '}
                  {Math.min(
                    (rolesTable.getState().pagination.pageIndex + 1) * rolesTable.getState().pagination.pageSize,
                    roles.length
                  )}{' '}
                  of {roles.length} roles
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rolesTable.setPageIndex(0)}
                    disabled={!rolesTable.getCanPreviousPage()}
                    className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rolesTable.previousPage()}
                    disabled={!rolesTable.getCanPreviousPage()}
                    className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-300">
                    Page {rolesTable.getState().pagination.pageIndex + 1} of {rolesTable.getPageCount()}
                  </span>
                  <button
                    onClick={() => rolesTable.nextPage()}
                    disabled={!rolesTable.getCanNextPage()}
                    className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rolesTable.setPageIndex(rolesTable.getPageCount() - 1)}
                    disabled={!rolesTable.getCanNextPage()}
                    className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Admins Tab */}
        {activeTab === 'subadmins' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white mb-4">Sub-Administrators</h2>
              
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
                      ...roles.filter(r => !r.isDefault).map(r => ({ value: r.id.toString(), label: r.name })),
                    ]}
                    placeholder="All Roles"
                  />
                  <Dropdown
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ]}
                    placeholder="All Status"
                  />
                  {(globalFilter || roleFilter !== 'all' || statusFilter !== 'all') && (
                    <button
                      onClick={clearSubAdminFilters}
                      className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Right: Action Button */}
                <button
                  onClick={handleCreateSubAdmin}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Sub-Admin
                </button>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 border-b border-gray-700">
                    {subAdminsTable.getHeaderGroups().map((headerGroup) => (
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
                    {subAdminsTable.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={subAdminColumns.length} className="px-6 py-8 text-center text-slate-500 dark:text-gray-400">
                          No sub-admins found
                        </td>
                      </tr>
                    ) : (
                      subAdminsTable.getRowModel().rows.map((row, index) => (
                        <tr
                          key={row.id}
                          className={`${index % 2 === 0 ? 'bg-white/40' : 'bg-white/60'} dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-200 border-b-0 focus:outline-none active:outline-none`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-white"
                            >
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
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {subAdminsTable.getState().pagination.pageIndex * subAdminsTable.getState().pagination.pageSize + 1} to{' '}
                  {Math.min(
                    (subAdminsTable.getState().pagination.pageIndex + 1) * subAdminsTable.getState().pagination.pageSize,
                    filteredSubAdmins.length
                  )}{' '}
                  of {filteredSubAdmins.length} sub-admins
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => subAdminsTable.setPageIndex(0)}
                    disabled={!subAdminsTable.getCanPreviousPage()}
                    className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => subAdminsTable.previousPage()}
                    disabled={!subAdminsTable.getCanPreviousPage()}
                    className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-300">
                    Page {subAdminsTable.getState().pagination.pageIndex + 1} of {subAdminsTable.getPageCount()}
                  </span>
                  <button
                    onClick={() => subAdminsTable.nextPage()}
                    disabled={!subAdminsTable.getCanNextPage()}
                    className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => subAdminsTable.setPageIndex(subAdminsTable.getPageCount() - 1)}
                    disabled={!subAdminsTable.getCanNextPage()}
                    className="p-2 rounded border border-white/10 bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedRole(null);
        }}
        title={selectedRole ? 'Edit Role' : 'Create Role'}
        size="6col"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={roleFormData.name}
              onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="Enter role name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={roleFormData.description}
              onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="Enter role description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Permissions
            </label>
            <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-700 rounded p-4 bg-gray-800/50">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-sm font-semibold text-white mb-3 capitalize">{category} Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {perms.map((permission) => {
                      const Icon = permission.icon;
                      const isChecked = roleFormData.permissions.includes(permission.id);
                      return (
                        <div
                          key={permission.id}
                          className={`flex items-center justify-between p-3 rounded transition-all ${
                            isChecked
                              ? 'bg-teal-glass/10 border border-teal-glass/30'
                              : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300 truncate">{permission.label}</span>
                          </div>
                          <Switch
                            checked={isChecked}
                            onChange={() => {
                              handleTogglePermission(permission.id);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                setIsRoleModalOpen(false);
                setSelectedRole(null);
              }}
              className="px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRole}
              className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {selectedRole ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Permissions Modal */}
      <Modal
        isOpen={isViewPermissionsModalOpen}
        onClose={() => {
          setIsViewPermissionsModalOpen(false);
          setViewingRole(null);
        }}
        title={viewingRole ? `Permissions - ${viewingRole.name}` : 'View Permissions'}
        size="large"
      >
        {viewingRole && (
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-400">{viewingRole.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                {viewingRole.permissions.length} permission(s) assigned
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-sm font-semibold text-white mb-3 capitalize">{category} Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {perms.map((permission) => {
                      const Icon = permission.icon;
                      const hasPermission = viewingRole.permissions.includes(permission.id);
                      return (
                        <div
                          key={permission.id}
                          className={`flex items-center gap-3 p-3 rounded transition-all ${
                            hasPermission
                              ? 'bg-teal-glass/10 border border-teal-glass/30'
                              : 'bg-gray-700/50 border border-gray-600 opacity-50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${hasPermission ? 'text-teal-glass' : 'text-gray-500'}`} />
                          <span className={`text-sm flex-1 min-w-0 truncate ${hasPermission ? 'text-gray-300' : 'text-gray-500'}`}>
                            {permission.label}
                          </span>
                          {hasPermission && (
                            <CheckCircle2 className="w-4 h-4 text-teal-glass flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setIsViewPermissionsModalOpen(false);
                  setViewingRole(null);
                }}
                className="px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Sub-Admin Modal */}
      <Modal
        isOpen={isSubAdminModalOpen}
        onClose={() => setIsSubAdminModalOpen(false)}
        title="Create Sub-Administrator"
        size="medium"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subAdminFormData.name}
              onChange={(e) => setSubAdminFormData({ ...subAdminFormData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={subAdminFormData.email}
              onChange={(e) => setSubAdminFormData({ ...subAdminFormData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={subAdminFormData.password}
              onChange={(e) => setSubAdminFormData({ ...subAdminFormData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={subAdminFormData.roleId}
              onChange={(value) => setSubAdminFormData({ ...subAdminFormData, roleId: value })}
              options={roles
                .filter(r => !r.isDefault)
                .map(r => ({ value: r.id.toString(), label: r.name }))}
              placeholder="Select role"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => setIsSubAdminModalOpen(false)}
              className="px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSubAdmin}
              className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Create Sub-Admin
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm/Success Modals */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteType === 'role' ? 'Role' : 'Sub-Admin'}`}
        message={`Are you sure you want to delete this ${deleteType === 'role' ? 'role' : 'sub-admin'}? This action cannot be undone.`}
        confirmText="Delete"
        loading={isDeleting}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Deleted!"
        message={`The ${deleteType === 'role' ? 'role' : 'sub-admin'} has been successfully deleted.`}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

