import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ClipboardList, RotateCcw, RotateCcwSquare, CheckCircle2, XCircle, Inbox } from 'lucide-react';
import { useRepairStore } from '../store/useRepairStore';
import { REPAIR_STATUS_LABELS, REPAIR_STATUS_COLORS } from '../types';

const STEP_ROUTE_MAP: Record<number, string> = {
  1: '/register',
  2: '/inspection',
  3: '/quote',
  4: '/confirm',
  5: '/followup'
};

export default function OrderListPage() {
  const navigate = useNavigate();
  const {
    getOrderList,
    loadOrder,
    deleteOrder,
    restoreFromAbandon,
    createAndSwitchOrder,
    order: currentOrder,
    saveCurrentOrder
  } = useRepairStore();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const orders = getOrderList();

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

  if (orders.length === 0) {
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
              <p className="text-sm text-neutral-500">共 {orders.length} 张维修单</p>
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

      <div className="space-y-4">
        {orders.map((snapshot, index) => {
          const { order, followupRecord } = snapshot;
          const isActive = currentOrder.id === order.id;
          const isAbandoned = order.status === 'abandoned';
          const isCompleted = order.status === 'completed';
          const isDeleting = deleteConfirmId === order.id;

          return (
            <div
              key={order.id}
              className={`card fade-in-up mb-0 ${
                isActive ? 'border-2 border-primary-300 shadow-lg shadow-primary-100' : ''
              } ${isAbandoned ? 'border-l-4 border-l-danger-400' : ''} ${
                isCompleted ? 'border-l-4 border-l-success-400' : ''
              }`}
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`chip text-xs ${REPAIR_STATUS_COLORS[order.status]}`}>
                      {REPAIR_STATUS_LABELS[order.status]}
                    </span>
                    {isActive && (
                      <span className="chip text-xs bg-primary-500 text-white">当前</span>
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
        })}
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
