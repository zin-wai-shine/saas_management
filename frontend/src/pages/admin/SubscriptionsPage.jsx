import { useState, useEffect, useMemo } from 'react';
import { subscriptionAPI } from '../../api/api';
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
} from 'lucide-react';

const columnHelper = createColumnHelper();

export const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.list();
      setSubscriptions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('business_id', {
        header: 'Business ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('plan_id', {
        header: 'Plan ID',
        cell: (info) => info.getValue(),
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
            active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            expired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
          };
          const icons = {
            active: CheckCircle2,
            cancelled: XCircle,
            expired: Clock,
          };
          const Icon = icons[status] || Clock;
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.expired}`}>
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
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(info.row.original.id)}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
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
    return subscriptions.filter((sub) => {
      const matchesGlobal = globalFilter === '' || sub.id.toString().includes(globalFilter);
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      return matchesGlobal && matchesStatus;
    });
  }, [subscriptions, globalFilter, statusFilter]);

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

  const handleEdit = async (subscription) => {
    const newStatus = window.prompt('Enter new status (active/cancelled/expired):', subscription.status);
    if (newStatus && ['active', 'cancelled', 'expired'].includes(newStatus.toLowerCase())) {
      try {
        await subscriptionAPI.update(subscription.id, { status: newStatus.toLowerCase() });
        setSubscriptions(subscriptions.map(s => s.id === subscription.id ? { ...s, status: newStatus.toLowerCase() } : s));
        alert('Subscription updated successfully!');
      } catch (error) {
        console.error('Failed to update subscription:', error);
        alert('Failed to update subscription. Please try again.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) {
      try {
        await subscriptionAPI.delete(id);
        setSubscriptions(subscriptions.filter((s) => s.id !== id));
        alert('Subscription deleted successfully!');
      } catch (error) {
        console.error('Failed to delete subscription:', error);
        alert('Failed to delete subscription. Please try again.');
      }
    }
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setStatusFilter('all');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Subscriptions</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-glass to-teal-light text-white rounded-xl hover:shadow-medium transition-all duration-300 transform hover:scale-105 shadow-soft">
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200/60 dark:border-gray-600 rounded-xl bg-white/80 backdrop-blur-sm dark:bg-gray-700 text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-glass focus:border-teal-glass transition-all"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200/60 dark:border-gray-600 rounded-xl bg-white/80 backdrop-blur-sm dark:bg-gray-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass focus:border-teal-glass transition-all shadow-soft"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
          {(globalFilter || statusFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
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
                      <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white/40' : 'bg-white/60'} dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all duration-200`}>
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
                  className="p-2 rounded-xl border border-slate-200/60 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/80 dark:hover:bg-gray-700 hover:shadow-soft transition-all"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 rounded-xl border border-slate-200/60 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/80 dark:hover:bg-gray-700 hover:shadow-soft transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-700 dark:text-gray-300">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-2 rounded-xl border border-slate-200/60 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/80 dark:hover:bg-gray-700 hover:shadow-soft transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="p-2 rounded-xl border border-slate-200/60 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/80 dark:hover:bg-gray-700 hover:shadow-soft transition-all"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

