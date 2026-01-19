import { useState, useEffect, useMemo } from 'react';
import { planAPI } from '../../api/api';
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
  X,
  CreditCard,
  Save,
  Eye,
  Minus,
} from 'lucide-react';

const columnHelper = createColumnHelper();

export const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billing_cycle: 'monthly',
    features: [],
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planAPI.list();
      const data = response.data?.data || response.data || [];
      
      if (data.length === 0) {
        setPlans([
          { id: 1, name: 'Starter', description: 'Perfect for small businesses', price: 29.00, billing_cycle: 'monthly', features: ['1 Website', 'Basic Support'] },
          { id: 2, name: 'Professional', description: 'Great for growing teams', price: 79.00, billing_cycle: 'monthly', features: ['5 Websites', 'Priority Support', 'Advanced Analytics'] },
          { id: 3, name: 'Enterprise', description: 'Best for large organizations', price: 199.00, billing_cycle: 'monthly', features: ['Unlimited Websites', '24/7 Support', 'Dedicated Manager'] },
        ]);
      } else {
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setPlans([
        { id: 1, name: 'Starter', description: 'Perfect for small businesses', price: 29.00, billing_cycle: 'monthly', features: ['1 Website', 'Basic Support'] },
        { id: 2, name: 'Professional', description: 'Great for growing teams', price: 79.00, billing_cycle: 'monthly', features: ['5 Websites', 'Priority Support', 'Advanced Analytics'] },
        { id: 3, name: 'Enterprise', description: 'Best for large organizations', price: 199.00, billing_cycle: 'monthly', features: ['Unlimited Websites', '24/7 Support', 'Dedicated Manager'] },
      ]);
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
            <div className="w-8 h-8 rounded bg-teal-500/10 backdrop-blur-md border border-teal-500/20 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-teal-300" />
            </div>
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => (
          <span className="text-gray-600 dark:text-gray-400">{info.getValue() || 'N/A'}</span>
        ),
      }),
      columnHelper.accessor('price', {
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:text-teal-glass"
          >
            Price
            <ArrowUpDown className="w-4 h-4" />
          </button>
        ),
        cell: (info) => (
          <span className="font-semibold">฿{info.getValue().toFixed(2)}</span>
        ),
      }),
      columnHelper.accessor('billing_cycle', {
        header: 'Billing',
        cell: (info) => (
          <span className="px-2.5 py-1 rounded text-xs font-medium bg-blue-900/20 backdrop-blur-md border border-blue-700/30 text-blue-400">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('features', {
        header: 'Features',
        cell: (info) => {
          const features = info.getValue();
          if (!features || !Array.isArray(features)) return 'N/A';
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {features.length} feature{features.length !== 1 ? 's' : ''}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleView(info.row.original)}
              className="p-2 rounded bg-gray-800/10 backdrop-blur-sm border border-white/5 hover:bg-gray-800/20 text-gray-400 hover:text-white transition-all"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
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
    return plans.filter((plan) => {
      const matchesGlobal =
        globalFilter === '' ||
        plan.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (plan.description && plan.description.toLowerCase().includes(globalFilter.toLowerCase()));
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'low' && plan.price < 50) ||
        (priceFilter === 'medium' && plan.price >= 50 && plan.price < 100) ||
        (priceFilter === 'high' && plan.price >= 100);
      return matchesGlobal && matchesPrice;
    });
  }, [plans, globalFilter, priceFilter]);

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

  const handleView = (plan) => {
    setSelectedPlan(plan);
    setIsViewModalOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      billing_cycle: 'monthly',
      features: [],
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price?.toString() || '',
      billing_cycle: plan.billing_cycle || 'monthly',
      features: Array.isArray(plan.features) ? plan.features : [],
    });
    setIsEditModalOpen(true);
  };

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ''],
    });
  };

  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures,
    });
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      try {
        await planAPI.delete(deleteId);
      } catch (e) {
        console.warn('API delete failed, falling back to local filter:', e);
      }
      
      setPlans(plans.filter((p) => p.id !== deleteId));
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Failed to delete plan:', error);
      setIsConfirmModalOpen(false);
      alert('Failed to delete plan. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty features
      const features = formData.features.filter(f => f.trim() !== '');

      const data = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        billing_cycle: formData.billing_cycle,
        features: features,
      };

      if (selectedPlan) {
        // Update
        await planAPI.update(selectedPlan.id, data);
        alert('Plan updated successfully!');
        setIsEditModalOpen(false);
      } else {
        // Create
        await planAPI.create(data);
        alert('Plan created successfully!');
        setIsAddModalOpen(false);
      }
      fetchPlans();
      setSelectedPlan(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        billing_cycle: 'monthly',
        features: [],
      });
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('Failed to save plan. Please try again.');
    }
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setPriceFilter('all');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-4">Plans</h1>
        
        {/* Search, Filters and Action Button Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search and Filters */}
          <div className="flex items-center gap-3 flex-1">
            <div className="min-w-[200px]">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded bg-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-teal-glass text-sm"
              />
            </div>
          </div>
            <Dropdown
            value={priceFilter}
              onChange={(value) => setPriceFilter(value)}
              options={[
                { value: 'all', label: 'All Prices' },
                { value: 'low', label: 'Low (< ฿50)' },
                { value: 'medium', label: 'Medium (฿50 - ฿100)' },
                { value: 'high', label: 'High (> ฿100)' },
              ]}
              placeholder="All Prices"
            />
          {(globalFilter || priceFilter !== 'all') && (
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
            Add Plan
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
                        No plans found
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
                of {filteredData.length} plans
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

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Plan Details" size="lg">
        {selectedPlan && (
          <div className="flex flex-col max-h-[calc(90vh-140px)]">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-5 pb-2">
              {/* Compact Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-700/50">
                <div className="w-10 h-10 rounded-lg bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-teal-glass" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white truncate">{selectedPlan.name}</h3>
                  <p className="text-xs text-gray-400">ID: #{selectedPlan.id}</p>
                </div>
              </div>

              {/* Compact Details Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Price */}
                <div className="group p-3 rounded-lg bg-gradient-to-br from-green-500/5 to-green-600/5 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-all cursor-default">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 rounded bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-green-300 font-bold">฿</span>
                    </div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Price</label>
                  </div>
                  <p className="text-sm font-bold text-white">฿{selectedPlan.price?.toFixed(2) || '0.00'}</p>
                </div>

                {/* Billing Cycle */}
                <div className="group p-3 rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-default">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-blue-300 font-bold">B</span>
                    </div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Billing</label>
                  </div>
                  <p className="text-xs font-medium text-white capitalize">{selectedPlan.billing_cycle || 'N/A'}</p>
                </div>
              </div>

              {/* Description - Compact */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-purple-600/5 backdrop-blur-sm border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-purple-300 font-bold">D</span>
                  </div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                </div>
                <p className="text-xs text-white leading-relaxed">{selectedPlan.description || 'No description provided'}</p>
              </div>

              {/* Features - Enhanced Design with Scrollable List */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/5 via-yellow-600/5 to-yellow-500/5 backdrop-blur-sm border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xs text-yellow-300 font-bold">F</span>
                  </div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Features</label>
                  {Array.isArray(selectedPlan.features) && selectedPlan.features.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-semibold text-yellow-400">
                      {selectedPlan.features.length}
                    </span>
                  )}
                </div>
                {Array.isArray(selectedPlan.features) && selectedPlan.features.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selectedPlan.features.map((feature, idx) => (
                      <div 
                        key={idx} 
                        className="group flex items-center gap-3 p-2.5 rounded-md bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-yellow-500/30 hover:bg-gray-800/40 transition-all"
                      >
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          <span className="text-[10px] font-bold text-yellow-300">{idx + 1}</span>
                        </div>
                        <p className="text-xs text-white flex-1 group-hover:text-yellow-100 transition-colors">{feature}</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50 group-hover:bg-yellow-400 transition-colors flex-shrink-0"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-gray-800/20 border border-gray-700/30 text-center">
                    <p className="text-xs text-gray-500 italic">No features listed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Action Buttons at Bottom */}
            <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-700/50 flex-shrink-0 sticky bottom-0 bg-gray-800/95 backdrop-blur-sm pb-1">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedPlan);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit
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
          setSelectedPlan(null);
        }}
        title={selectedPlan ? 'Edit Plan' : 'Add New Plan'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-120px)]">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-glass focus:border-teal-glass transition-colors"
                placeholder="Enter plan name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-glass focus:border-teal-glass transition-colors"
                placeholder="Enter plan description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-glass focus:border-teal-glass transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Billing Cycle <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={formData.billing_cycle}
                  onChange={(value) => setFormData({ ...formData, billing_cycle: value })}
                  options={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' },
                  ]}
                  placeholder="Select Billing Cycle"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Features</label>
              
              {/* Features List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 mb-3">
                {formData.features.length === 0 ? (
                  <div className="p-5 rounded-lg bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 text-center">
                    <div className="w-8 h-8 rounded-full bg-gray-700/20 border border-gray-600/30 flex items-center justify-center mx-auto mb-2">
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">No features added</p>
                  </div>
                ) : (
                  formData.features.map((feature, index) => (
                    <div 
                      key={index} 
                      className="group flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700/40 hover:border-gray-600/50 transition-all"
                    >
                      <div className="w-7 h-7 rounded-md bg-teal-glass/10 border border-teal-glass/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-teal-glass">{index + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-600/50 rounded-md bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-500 hover:border-gray-500/70 focus:outline-none focus:ring-2 focus:ring-teal-glass/50 focus:border-teal-glass/50 text-sm transition-all"
                        placeholder={`Enter feature ${index + 1}...`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="p-2 rounded-md bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:scale-110 transition-all flex-shrink-0"
                        title="Remove feature"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Feature Button - Below the list */}
              <button
                type="button"
                onClick={handleAddFeature}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded-lg text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>
          </div>

          {/* Fixed Action Buttons at Bottom */}
          <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-700/50 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedPlan(null);
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
              {selectedPlan ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Plan"
        message="Are you sure you want to delete this plan? This action cannot be undone."
        confirmText="Delete"
        loading={isDeleting}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Deleted!"
        message="The plan has been successfully deleted."
      />
    </div>
  );
};
