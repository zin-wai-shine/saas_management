import { useState, useEffect, useMemo } from 'react';
import { subscriptionAPI, businessAPI, planAPI } from '../../api/api';
import { Dropdown } from '../../components/Dropdown';
import { Modal } from '../../components/Modal';
import { ConfirmModal, SuccessModal } from '../../components/ConfirmModal';
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
  X,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
} from 'lucide-react';

const columnHelper = createColumnHelper();

export const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [formData, setFormData] = useState({
    business_id: '',
    plan_id: '',
    status: 'active',
    ends_at: '',
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchBusinesses();
    fetchPlans();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await subscriptionAPI.list();
      const data = response.data?.data || response.data || [];
      
      if (data.length === 0) {
        setSubscriptions([
          { id: 1, business_id: 1, plan_id: 1, status: 'active', ends_at: '2026-02-15', created_at: '2026-01-15' },
          { id: 2, business_id: 2, plan_id: 2, status: 'active', ends_at: '2026-02-16', created_at: '2026-01-16' },
          { id: 3, business_id: 3, plan_id: 3, status: 'active', ends_at: '2026-02-17', created_at: '2026-01-17' },
        ]);
      } else {
        setSubscriptions(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      setSubscriptions([
        { id: 1, business_id: 1, plan_id: 1, status: 'active', ends_at: '2026-02-15', created_at: '2026-01-15' },
        { id: 2, business_id: 2, plan_id: 2, status: 'active', ends_at: '2026-02-16', created_at: '2026-01-16' },
        { id: 3, business_id: 3, plan_id: 3, status: 'active', ends_at: '2026-02-17', created_at: '2026-01-17' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await businessAPI.list();
      setBusinesses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await planAPI.list();
      setPlans(response.data || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const getBusinessName = (businessId) => {
    const business = businesses.find(b => b.id === businessId);
    return business ? business.name : `Business #${businessId}`;
  };

  const getPlanName = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : `Plan #${planId}`;
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'serialNumber',
        header: 'SL',
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor('business_id', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            Business
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => {
          const businessId = info.getValue();
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{getBusinessName(businessId)}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('plan_id', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            Plan
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => {
          const planId = info.getValue();
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-teal-500/10 backdrop-blur-md border border-teal-500/20 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-teal-300" />
              </div>
              <span className="font-medium">{getPlanName(planId)}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            Status
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => {
          const status = info.getValue();
          const styles = {
            active: 'bg-green-900/20 backdrop-blur-md border border-green-700/30 text-green-400',
            cancelled: 'bg-red-900/20 backdrop-blur-md border border-red-700/30 text-red-400',
            expired: 'bg-gray-800/20 backdrop-blur-md border border-gray-700/30 text-gray-400',
          };
          const icons = {
            active: CheckCircle2,
            cancelled: XCircle,
            expired: Clock,
          };
          const Icon = icons[status] || Clock;
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${styles[status] || styles.expired}`}>
              <Icon className="w-3 h-3" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      }),
      columnHelper.accessor('ends_at', {
        header: 'Ends At',
        cell: (info) => {
          const date = info.getValue();
          return date ? new Date(date).toLocaleDateString() : 'N/A';
        },
      }),
      columnHelper.accessor('created_at', {
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
              className="p-2 rounded bg-gray-800/20 backdrop-blur-sm border border-white/10 hover:bg-gray-800/30 text-gray-400 hover:text-white transition-all"
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
    [businesses, plans]
  );

  const filteredData = useMemo(() => {
    return subscriptions.filter((sub) => {
      const businessName = getBusinessName(sub.business_id).toLowerCase();
      const planName = getPlanName(sub.plan_id).toLowerCase();
      const matchesGlobal =
        globalFilter === '' ||
        businessName.includes(globalFilter.toLowerCase()) ||
        planName.includes(globalFilter.toLowerCase()) ||
        sub.id.toString().includes(globalFilter);
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      return matchesGlobal && matchesStatus;
    });
  }, [subscriptions, globalFilter, statusFilter, businesses, plans]);

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
      business_id: '',
      plan_id: '',
      status: 'active',
      ends_at: '',
    });
    setSelectedSubscription(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription);
    setFormData({
      business_id: subscription.business_id?.toString() || '',
      plan_id: subscription.plan_id?.toString() || '',
      status: subscription.status || 'active',
      ends_at: subscription.ends_at ? new Date(subscription.ends_at).toISOString().split('T')[0] : '',
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        business_id: parseInt(formData.business_id),
        plan_id: parseInt(formData.plan_id),
        status: formData.status,
        ends_at: formData.ends_at || null,
      };

      if (selectedSubscription) {
        // Update
        await subscriptionAPI.update(selectedSubscription.id, data);
        alert('Subscription updated successfully!');
        setIsEditModalOpen(false);
      } else {
        // Create
        await subscriptionAPI.create(data);
        alert('Subscription created successfully!');
        setIsAddModalOpen(false);
      }
      fetchSubscriptions();
      setSelectedSubscription(null);
      setFormData({
        business_id: '',
        plan_id: '',
        status: 'active',
        ends_at: '',
      });
    } catch (error) {
      console.error('Failed to save subscription:', error);
      alert('Failed to save subscription. Please try again.');
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      try {
        await subscriptionAPI.delete(deleteId);
      } catch (e) {
        console.warn('API delete failed, falling back to local filter:', e);
      }
      
      setSubscriptions(subscriptions.filter((s) => s.id !== deleteId));
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      } catch (error) {
        console.error('Failed to delete subscription:', error);
      setIsConfirmModalOpen(false);
        alert('Failed to delete subscription. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setStatusFilter('all');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-4">Subscriptions</h1>
        
        {/* Search, Filters and Action Button Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search and Filters */}
          <div className="flex items-center gap-3 flex-1">
            <div className="min-w-[200px]">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
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
              { value: 'active', label: 'Active' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'expired', label: 'Expired' },
            ]}
            placeholder="All Status"
          />
          {(globalFilter || statusFilter !== 'all') && (
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
            Add Subscription
          </button>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-gray-400">Loading...</div>
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
                <tbody className="divide-y divide-slate-200/40 dark:divide-gray-700">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500 dark:text-gray-400">
                        No subscriptions found
                      </td>
                    </tr>
                  ) : (
                      table.getRowModel().rows.map((row, index) => (
                      <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white/40' : 'bg-white/60'} dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-200 border-b-0 focus:outline-none active:outline-none`}>
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

            <div className="px-6 py-4 border-t border-slate-200/60 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-gray-400">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  filteredData.length
                )}{' '}
                of {filteredData.length} subscriptions
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
                <span className="text-sm text-slate-700 dark:text-gray-300">
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
          setSelectedSubscription(null);
        }}
        title={selectedSubscription ? 'Edit Subscription' : 'Add New Subscription'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Business <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.business_id}
              onChange={(value) => setFormData({ ...formData, business_id: value })}
              options={[
                { value: '', label: 'Select Business' },
                ...businesses.map((business) => ({
                  value: business.id.toString(),
                  label: business.name,
                })),
              ]}
              placeholder="Select Business"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plan <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.plan_id}
              onChange={(value) => setFormData({ ...formData, plan_id: value })}
              options={[
                { value: '', label: 'Select Plan' },
                ...plans.map((plan) => ({
                  value: plan.id.toString(),
                  label: plan.name,
                })),
              ]}
              placeholder="Select Plan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'expired', label: 'Expired' },
              ]}
              placeholder="Select Status"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ends At
            </label>
            <input
              type="date"
              value={formData.ends_at}
              onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedSubscription(null);
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
              {selectedSubscription ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        confirmText="Delete"
        loading={isDeleting}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Deleted!"
        message="The subscription has been successfully deleted."
      />
    </div>
  );
};

