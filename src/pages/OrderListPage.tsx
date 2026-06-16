import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ClipboardList, RotateCcw, RotateCcwSquare, CheckCircle2, XCircle, Inbox, Calendar, FileText, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useRepairStore } from '../store/useRepairStore';
import { REPAIR_STATUS_LABELS, REPAIR_STATUS_COLORS, RepairStatus } from '../types';

const STEP_ROUTE_MAP: Record<number, string> = {
  1: '/register',
  2: '/inspection',
  3: '/quote',
  4: '/confirm',
  5: '/followup'
};

type FilterType = RepairStatus | 'all' | 'today' | 'overdue';

interface StatCard {
  key: FilterType;
  label: string;
  icon: typeof Calendar;
  color: string;
  bgColor: string;
  borderColor: string;
}

const STAT_CARDS: StatCard[] = [
  { key: 'today', label: '今天新增', icon: Calendar, color: 'text-primary-600', bgColor: 'bg-primary-50', borderColor: 'border-primary-200' },
  { key: 'quoted', label: '报价中', icon: FileText, color: 'text-coral-600', bgColor: 'bg-coral-50', borderColor: 'border-coral-200' },
  { key: 'confirmed', label: '待客户确认', icon: Clock, color: 'text-warning-600', bgColor: 'bg-warning-50', borderColor: 'border-warning-200' },
  { key: 'abandoned', label: '已放弃', icon: XCircle, color: 'text-danger-600', bgColor: 'bg-danger-50', borderColor: 'border-danger-200' },
  { key: 'completed', label: '已完成', icon: CheckCircle, color: 'text-success-600', bgColor: 'bg-success-50', borderColor: 'border-success-200' },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  const {
    getOrderList,
    getFilteredOrderList,
    getStatistics,
    checkOverdueFollowUps,
    loadOrder,
    deleteOrder,
    restoreFromAbandon,
    createAndSwitchOrder,
    order: currentOrder,
    saveCurrentOrder
  } = useRepairStore();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const statistics = useMemo(() => getStatistics(), [getStatistics]);
  const overdueIds = useMemo(() => checkOverdueFollowUps(), [checkOverdueFollowUps]);
  const allOrders = getOrderList();

  const displayOrders = useMemo(() => {
    if (activeFilter === 'all') return allOrders;
    return getFilteredOrderList(activeFilter);
  }, [activeFilter, allOrders, getFilteredOrderList]);

  const handleCreateOrder = () => {
    saveCurrentOrder();
    createAndSwitchOrder();
    navigate('/register');
  };

  const handleLoadOrder = (orderId: string) => {
    saveCurrentOrder();
    loadOrder(orderId);
    const snapshot = useRepairStore.getState().orders[orderId];
    if (snapshot) {
      const step = snapshot.order.currentStep;
      const route = STEP_ROUTE_MAP[step] || '/register';
      navigate(route);
    }
  };

  const handleRestore = (orderId: string, target: 'quote' | 'followup') => {
    restoreFromAbandon(orderId, target);
    const route = target === 'quote' ? '/quote' : '/followup';
    navigate(route);
  };

  const handleDelete = (orderId: string) => {
    if (deleteConfirmId === orderId) {
      deleteOrder(orderId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(orderId);
    }
  };

  const getFilterLabel = (filter: FilterType): string => {
    if (filter === 'all') return '全部';
    if (filter === 'today') return '今天新增';
    if (filter === 'overdue') return '跟进提醒';
    return REPAIR_STATUS_LABELS[filter];
  };

  const getStatCount = (key: FilterType): number => {
    if (key === 'today') return statistics.today;
    if (key === 'overdue') return statistics.overdue;
    return statistics[key as keyof typeof statistics] || 0;
  };

  const overdueOrders = useMemo(() => 
    allOrders.filter(o => overdueIds.includes(o.order.id)),
    [allOrders, overdueIds]
  );

  if (allOrders.length === 0) {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <div className="card text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mx-auto mb-6">
            <Inbox size={36} className="text-primary-400" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-800 mb-3">
            暂无维修单
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            点击下方按钮创建第一张维修单
          </p>
          <button
            onClick={handleCreateOrder}
            className="w-full btn-primary"
          >
            <Plus size={18} />
            新建维修单
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="fade-in-up stagger-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-coral-500 flex items-center justify-center shadow-lg shadow-primary-200">
              <ClipboardList className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-neutral-800">维修单列表</h1>
              <p className="text-sm text-neutral-500">共 {allOrders.length} 张维修单</p>
            </div>
          </div>
          <button
            onClick={handleCreateOrder}
            className="btn-primary text-sm"
          >
            <Plus size={16} />
            新建
          </button>
        </div>
      </div>

      <div className="mb-6 fade-in-up stagger-1">
        <h2 className="text-lg font-semibold text-neutral-800 mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
          门店看板
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {STAT_CARDS.map((card) => {
            const count = getStatCount(card.key);
            const isActive = activeFilter === card.key;
            const Icon = card.icon;
            
            return (
              <button
                key={card.key}
                onClick={() => setActiveFilter(isActive ? 'all' : card.key)}
                className={`p-3 rounded-2xl border-2 transition-all ${
                  isActive
                    ? `${card.bgColor} ${card.borderColor} ring-2 ring-offset-2 ring-primary-300`
                    : `bg-white border-neutral-100 hover:${card.bgColor} hover:${card.borderColor}`
                }`}
              >
                <div className={`w-8 h-8 rounded-xl ${card.bgColor} flex items-center justify-center mx-auto mb-2`}>
                  <Icon size={16} className={card.color} />
                </div>
                <p className={`text-2xl font-bold ${card.color} mb-1`}>{count}</p>
                <p className="text-xs text-neutral-500">{card.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {overdueOrders.length > 0 && (
        <div className="mb-6 fade-in-up stagger-2">
          <div className="p-4 bg-danger-50 rounded-2xl border border-danger-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-danger-500 flex-shrink-0" />
              <h3 className="font-semibold text-danger-700">跟进提醒</h3>
              <span className="ml-auto text-xs bg-danger-100 text-danger-600 px-2 py-0.5 rounded-full">
                {overdueOrders.length} 条待跟进
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {overdueOrders.map((snapshot) => {
                const { order } = snapshot;
                const overdueLog = snapshot.followupRecord.communicationLogs.find(
                  log => log.nextFollowUpDate && log.nextFollowUpDate <= new Date().toISOString().split('T')[0]
                );
                
                return (
                  <div
                    key={order.id}
                    onClick={() => handleLoadOrder(order.id)}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-danger-100 cursor-pointer hover:border-danger-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-danger-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-800 text-sm truncate">
                          {order.customerName || '未填写姓名'}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {order.phoneModel || '未填写型号'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className={`chip text-xs ${REPAIR_STATUS_COLORS[order.status]}`}>
                        {REPAIR_STATUS_LABELS[order.status]}
                      </span>
                      {overdueLog && (
                        <p className="text-xs text-danger-500 mt-1">
                          下次联系: {overdueLog.nextFollowUpDate}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 fade-in-up stagger-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
            <h2 className="text-lg font-semibold text-neutral-800">
              {activeFilter === 'all' ? '全部维修单' : getFilterLabel(activeFilter)}
            </h2>
            <span className="text-sm text-neutral-400">({displayOrders.length})</span>
          </div>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-sm text-primary-500 hover:text-primary-600"
            >
              查看全部
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {displayOrders.length === 0 ? (
          <div className="card text-center py-12">
            <Inbox size={48} className="text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">暂无{getFilterLabel(activeFilter)}的维修单</p>
          </div>
        ) : (
          displayOrders.map((snapshot, index) => {
            const { order, followupRecord } = snapshot;
            const isActive = currentOrder.id === order.id;
            const isAbandoned = order.status === 'abandoned';
            const isCompleted = order.status === 'completed';
            const isDeleting = deleteConfirmId === order.id;
            const hasOverdue = overdueIds.includes(order.id);

            return (
              <div
                key={order.id}
                className={`card fade-in-up mb-0 ${
                  isActive ? 'border-2 border-primary-300 shadow-lg shadow-primary-100' : ''
                } ${isAbandoned ? 'border-l-4 border-l-danger-400' : ''} ${
                  isCompleted ? 'border-l-4 border-l-success-400' : ''
                } ${hasOverdue && !isAbandoned && !isCompleted ? 'ring-2 ring-danger-300 ring-offset-2' : ''}`}
                style={{ animationDelay: `${(index + 1) * 80}ms` }}
              >
                <div
                  className={`flex items-start justify-between ${
                    !isAbandoned && !isCompleted ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    if (!isAbandoned && !isCompleted) {
                      handleLoadOrder(order.id);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`chip text-xs ${REPAIR_STATUS_COLORS[order.status]}`}>
                        {REPAIR_STATUS_LABELS[order.status]}
                      </span>
                      {isActive && (
                        <span className="chip text-xs bg-primary-500 text-white">当前</span>
                      )}
                      {hasOverdue && (
                        <span className="chip text-xs bg-danger-500 text-white">需跟进</span>
                      )}
                    </div>

                    <h3 className="font-semibold text-neutral-800 text-base truncate">
                      {order.customerName || '未填写姓名'}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      {order.phoneModel || '未填写型号'}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </p>

                    {isAbandoned && followupRecord.abandonRecord && (
                      <div className="mt-3 p-3 bg-danger-50 rounded-xl border border-danger-100">
                        <p className="text-xs text-danger-600 font-medium mb-1">放弃原因</p>
                        <p className="text-sm text-danger-700">{followupRecord.abandonRecord.reason}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-danger-500">
                            检修费: ¥{followupRecord.abandonRecord.inspectionFee}
                          </span>
                          <span className="text-xs text-danger-400">
                            {new Date(followupRecord.abandonRecord.abandonedAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-3 p-3 bg-success-50 rounded-xl border border-success-100 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-success-500 flex-shrink-0" />
                        <span className="text-sm text-success-700">维修已完成</span>
                        {followupRecord.completedAt && (
                          <span className="text-xs text-success-400 ml-auto">
                            {new Date(followupRecord.completedAt).toLocaleString('zh-CN')}
                          </span>
                        )}
                      </div>
                    )}

                    {hasOverdue && !isAbandoned && !isCompleted && (
                      <div className="mt-3 p-3 bg-warning-50 rounded-xl border border-warning-100 flex items-center gap-2">
                        <AlertCircle size={16} className="text-warning-500 flex-shrink-0" />
                        <span className="text-sm text-warning-700">有待跟进的沟通记录</span>
                      </div>
                    )}

                    {!isAbandoned && !isCompleted && (
                      <div className="mt-3">
                        <button
                          className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                        >
                          继续处理 → {getFilterLabel(order.status as RepairStatus)}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order.id);
                    }}
                    className={`ml-3 p-2 rounded-xl transition-colors flex-shrink-0 ${
                      isDeleting
                        ? 'bg-danger-500 text-white'
                        : 'text-neutral-300 hover:text-danger-500 hover:bg-danger-50'
                    }`}
                  >
                    {isDeleting ? (
                      <span className="text-xs font-medium">确认删除</span>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>

                {isAbandoned && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100">
                    <button
                      onClick={() => handleRestore(order.id, 'quote')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-coral-50 text-coral-600 hover:bg-coral-100 transition-colors"
                    >
                      <RotateCcw size={15} />
                      恢复到报价
                    </button>
                    <button
                      onClick={() => handleRestore(order.id, 'followup')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                    >
                      <RotateCcwSquare size={15} />
                      恢复到复检
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {deleteConfirmId && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setDeleteConfirmId(null)}
        />
      )}

      <div className="pb-8" />
    </div>
  );
}
