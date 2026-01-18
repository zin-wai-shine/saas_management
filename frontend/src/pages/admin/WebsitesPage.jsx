import { useState, useEffect, useMemo } from 'react';
import { websiteAPI } from '../../api/api';
import { Modal } from '../../components/Modal';
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
  Globe,
  Eye,
  Save,
} from 'lucide-react';

const columnHelper = createColumnHelper();

export const WebsitesPage = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [demoFilter, setDemoFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    theme_name: 'professional',
    status: 'pending',
    is_demo: false,
    is_claimed: false,
    content: '{}',
  });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await websiteAPI.list();
      setWebsites(response.data || []);
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      setWebsites([]);
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
      columnHelper.accessor('title', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            Title
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => (
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-teal-glass" />
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('theme_name', {
        header: 'Theme',
        cell: (info) => (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const styles = {
            approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
          };
          return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      }),
      columnHelper.accessor('is_demo', {
        header: 'Type',
        cell: (info) => (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              info.getValue()
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            }`}
          >
            {info.getValue() ? 'Demo' : 'Live'}
          </span>
        ),
      }),
      columnHelper.accessor('is_claimed', {
        header: 'Claimed',
        cell: (info) => (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              info.getValue()
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {info.getValue() ? 'Yes' : 'No'}
          </span>
        ),
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
              onClick={() => handleView(info.row.original)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
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
    return websites.filter((website) => {
      const matchesGlobal =
        globalFilter === '' || website.title.toLowerCase().includes(globalFilter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || website.status === statusFilter;
      const matchesDemo =
        demoFilter === 'all' ||
        (demoFilter === 'demo' && website.is_demo) ||
        (demoFilter === 'live' && !website.is_demo);
      return matchesGlobal && matchesStatus && matchesDemo;
    });
  }, [websites, globalFilter, statusFilter, demoFilter]);

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

  const handleView = (website) => {
    setSelectedWebsite(website);
    setIsViewModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      theme_name: 'professional',
      status: 'pending',
      is_demo: false,
      is_claimed: false,
      content: '{}',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (website) => {
    setSelectedWebsite(website);
    setFormData({
      title: website.title || '',
      theme_name: website.theme_name || 'professional',
      status: website.status || 'pending',
      is_demo: website.is_demo || false,
      is_claimed: website.is_claimed || false,
      content: typeof website.content === 'string' ? website.content : JSON.stringify(website.content || {}),
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      try {
        await websiteAPI.delete(id);
        setWebsites(websites.filter((w) => w.id !== id));
        alert('Website deleted successfully!');
      } catch (error) {
        console.error('Failed to delete website:', error);
        alert('Failed to delete website. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let content;
      try {
        content = JSON.parse(formData.content);
      } catch {
        content = {};
      }

      const data = {
        title: formData.title,
        theme_name: formData.theme_name,
        status: formData.status,
        is_demo: formData.is_demo,
        is_claimed: formData.is_claimed,
        content: content,
      };

      if (selectedWebsite) {
        // Update
        await websiteAPI.update(selectedWebsite.id, data);
        alert('Website updated successfully!');
        setIsEditModalOpen(false);
      } else {
        // Create
        await websiteAPI.create(data);
        alert('Website created successfully!');
        setIsAddModalOpen(false);
      }
      fetchWebsites();
      setSelectedWebsite(null);
      setFormData({
        title: '',
        theme_name: 'professional',
        status: 'pending',
        is_demo: false,
        is_claimed: false,
        content: '{}',
      });
    } catch (error) {
      console.error('Failed to save website:', error);
      alert('Failed to save website. Please try again.');
    }
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setStatusFilter('all');
    setDemoFilter('all');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Websites</h1>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-glass to-teal-light text-white rounded-xl hover:shadow-medium transition-all duration-300 transform hover:scale-105 shadow-soft transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Website
        </button>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search websites..."
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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={demoFilter}
            onChange={(e) => setDemoFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200/60 dark:border-gray-600 rounded-xl bg-white/80 backdrop-blur-sm dark:bg-gray-700 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass focus:border-teal-glass transition-all shadow-soft"
          >
            <option value="all">All Types</option>
            <option value="demo">Demo</option>
            <option value="live">Live</option>
          </select>
          {(globalFilter || statusFilter !== 'all' || demoFilter !== 'all') && (
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
                        No websites found
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
                of {filteredData.length} websites
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

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Website Details" size="lg">
        {selectedWebsite && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.theme_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.is_demo ? 'Demo' : 'Live'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Claimed</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedWebsite.is_claimed ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(selectedWebsite.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
              <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-auto max-h-40">
                {JSON.stringify(selectedWebsite.content, null, 2)}
              </pre>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedWebsite);
                }}
                className="px-4 py-2 bg-gradient-to-r from-teal-glass to-teal-light text-white rounded-xl hover:shadow-medium transition-all duration-300 transform hover:scale-105 shadow-soft transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedWebsite(null);
        }}
        title={selectedWebsite ? 'Edit Website' : 'Add New Website'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
              placeholder="Enter website title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Theme <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.theme_name}
              onChange={(e) => setFormData({ ...formData, theme_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
            >
              <option value="professional">Professional</option>
              <option value="modern">Modern</option>
              <option value="tech">Tech</option>
              <option value="restaurant">Restaurant</option>
              <option value="fitness">Fitness</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_demo}
                onChange={(e) => setFormData({ ...formData, is_demo: e.target.checked })}
                className="w-4 h-4 text-teal-glass rounded focus:ring-teal-glass"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Demo Website</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_claimed}
                onChange={(e) => setFormData({ ...formData, is_claimed: e.target.checked })}
                className="w-4 h-4 text-teal-glass rounded focus:ring-teal-glass"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Claimed</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content (JSON)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-glass font-mono text-sm"
              placeholder='{"sections": ["hero", "about"]}'
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedWebsite(null);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-glass to-teal-light text-white rounded-xl hover:shadow-medium transition-all duration-300 transform hover:scale-105 shadow-soft transition-colors"
            >
              <Save className="w-4 h-4" />
              {selectedWebsite ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
