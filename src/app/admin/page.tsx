'use client';

import React, { useState, useEffect } from 'react';

// Estilos para animações customizadas
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { 
      opacity: 0; 
      transform: scale(0.9) translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Gift, 
  LogOut, 
  Trash2, 
  Plus, 
  Edit2, 
  Phone,
  Calendar,
  Upload,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Filter,
  Lock,
  User,
  ArrowUp,
  ArrowDown,
  Check
} from 'lucide-react';
import { GuestService } from '@/services/guestService';
import { RSVPService } from '@/services/rsvpService';
import { AuthService } from '@/services/authService';
import { GiftService } from '@/services/giftService';
import { SupabaseGuest, SupabaseRSVP, SupabaseGift } from '@/lib/supabase';

// Tipos locais para evitar problemas de importação
interface RSVP extends SupabaseRSVP {
  companions?: SupabaseGuest[];
}

interface AdminGift {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  link?: string;
  isReserved: boolean;
  isAvailable: boolean;
  reservedBy?: string;
  reservedAt?: string;
  order: number;
}

// Funções auxiliares locais
const logoutAdmin = async () => {
  await AuthService.logout();
};

const getRSVPs = async (): Promise<RSVP[]> => {
  try {
    const rsvps = await RSVPService.getAllRSVPs();
    return rsvps;
  } catch (error) {
    console.error('Erro ao carregar RSVPs:', error);
    return [];
  }
};

const deleteRSVP = async (id: string): Promise<boolean> => {
  try {
    return await RSVPService.deleteRSVP(id);
  } catch (error) {
    console.error('Erro ao deletar RSVP:', error);
    return false;
  }
};

// Função para carregar presentes do Supabase
const loadGifts = async (): Promise<SupabaseGift[]> => {
  try {
    const gifts = await GiftService.getAllGifts();
    return gifts.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  } catch (error) {
    console.error('Erro ao carregar presentes:', error);
    return [];
  }
};

// Função para converter SupabaseGift para AdminGift (compatibilidade com UI)
const convertToAdminGift = (gift: SupabaseGift): AdminGift => {
  return {
    id: gift.id || '',
    name: gift.name,
    description: gift.description,
    price: gift.price.toString(),
    category: gift.category || 'Outros',
    image: gift.image || '',
    link: gift.link,
    isReserved: gift.purchased,
    isAvailable: !gift.purchased,
    reservedBy: gift.reserved_by_name,
    reservedAt: gift.purchased ? gift.created_at : undefined,
    order: gift.order_index || 0
  };
};


// Modal para adicionar/editar presente
function GiftModal({ 
  gift,
  onSave, 
  onCancel 
}: { 
  gift?: AdminGift;
  onSave: () => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: gift?.name || '',
    description: gift?.description || '',
    price: gift?.price || '',
    category: gift?.category || 'Cozinha',
    image: gift?.image || '',
    link: gift?.link || '',
    isAvailable: gift?.isAvailable ?? true,
    order: gift?.order?.toString() || ''
  });
  const [imagePreview, setImagePreview] = useState<string>(gift?.image || '');

  const categories = [
    'Cozinha',
    'Eletrodomésticos',
    'Outros'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (gift) {
        // Atualizar presente existente
        const updateData: Partial<SupabaseGift> = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: formData.image,
          link: formData.link,
          purchased: gift.isReserved
        };
        
        // Só atualizar order_index se foi alterado
        if (formData.order && parseInt(formData.order) !== gift.order) {
          updateData.order_index = parseInt(formData.order);
        }
        
        await GiftService.updateGift(gift.id, updateData);
      } else {
        // Criar novo presente
        await GiftService.createGift({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: formData.image,
          link: formData.link,
          purchased: false,
          order_index: formData.order ? parseInt(formData.order) : Date.now() // Usar order definido ou timestamp
        });
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar presente:', error);
      alert('Erro ao salvar presente. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {gift ? 'Editar Presente' : 'Adicionar Novo Presente'}
            </h3>
            <p className="text-gray-600">Preencha as informações do presente</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {imagePreview && (
              <div className="text-center">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-xl mx-auto border border-gray-200"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Presente *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço *
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="R$ 50,00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link do Produto
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="https://exemplo.com/produto"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                rows={3}
                placeholder="Descrição do presente..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Escolher arquivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordem na Lista
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Posição na lista (opcional)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Deixe em branco para adicionar no final da lista
              </p>
            </div>

            {/* <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status de Disponibilidade
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAvailable: true })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    formData.isAvailable
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Disponível
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAvailable: false })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    !formData.isAvailable
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <EyeOff className="w-4 h-4" />
                  Indisponível
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.isAvailable 
                  ? 'O presente estará visível e selecionável pelos convidados'
                  : 'O presente ficará oculto e não poderá ser selecionado'
                }
              </p>
            </div> */}
            
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                {gift ? 'Salvar Alterações' : 'Adicionar Presente'}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Componente Toast para notificações rápidas
function Toast({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose 
}: {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getToastColors = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className={`${getToastColors()} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md`}>
        {type === 'success' && <Check className="w-5 h-5" />}
        {type === 'error' && <Trash2 className="w-5 h-5" />}
        {type === 'info' && <Eye className="w-5 h-5" />}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Modal de confirmação personalizado
function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}) {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="w-8 h-8 text-red-600" />,
          bgColor: 'bg-red-100',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl',
          iconBg: 'bg-red-100 animate-pulse'
        };
      case 'info':
        return {
          icon: <Check className="w-8 h-8 text-green-600" />,
          bgColor: 'bg-green-100',
          buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl',
          iconBg: 'bg-green-100'
        };
      default: // warning
        return {
          icon: <EyeOff className="w-8 h-8 text-orange-600" />,
          bgColor: 'bg-orange-100',
          buttonColor: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 shadow-lg hover:shadow-xl',
          iconBg: 'bg-orange-100'
        };
    }
  };

  const { icon, buttonColor, iconBg } = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-slideIn">
        <div className="p-6">
          {/* Ícone */}
          <div className="flex items-center justify-center mb-4">
            <div className={`${iconBg} p-3 rounded-full`}>
              {icon}
            </div>
          </div>
          
          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>
          
          {/* Mensagem */}
          <div className="text-gray-600 text-center mb-6 whitespace-pre-line">
            {message.split('**').map((part, index) => 
              index % 2 === 0 ? (
                <span key={index}>{part}</span>
              ) : (
                <strong key={index} className="font-bold text-gray-900">{part}</strong>
              )
            )}
          </div>
          
          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 ${buttonColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'rsvps' | 'gifts'>('rsvps');
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [gifts, setGifts] = useState<AdminGift[]>([]);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [editingGift, setEditingGift] = useState<AdminGift | null>(null);
  
  // Estados para o modal de confirmação
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);

  // Estados para toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showToast, setShowToast] = useState(false);
  
  // Estados para drag and drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Estados para acompanhantes e filtros
  const [expandedRsvps, setExpandedRsvps] = useState<Set<string>>(new Set());
  const [giftFilter, setGiftFilter] = useState<'all' | 'available' | 'reserved'>('all');
  
  const router = useRouter();

  // Função utilitária para mostrar confirmações
  const showConfirmation = (
    title: string, 
    message: string, 
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'warning',
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ) => {
    setConfirmData({
      title,
      message,
      onConfirm: () => {
        setShowConfirmModal(false);
        setConfirmData(null);
        onConfirm();
      },
      onCancel: () => {
        setShowConfirmModal(false);
        setConfirmData(null);
      },
      confirmText,
      cancelText,
      type
    });
    setShowConfirmModal(true);
  };

  // Função utilitária para mostrar toast
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  useEffect(() => {
    console.log(' Iniciando carregamento dos dados do dashboard...');
    loadRSVPsWithCompanions();
    loadGiftData();
  }, []);

  const loadGiftData = async () => {
    const supabaseGifts = await loadGifts();
    const adminGifts = supabaseGifts.map(convertToAdminGift);
    setGifts(adminGifts);
  };

  const loadRSVPsWithCompanions = async () => {
    try {
      console.log('?? Carregando RSVPs...');
      const rsvpsData = await getRSVPs();
      console.log('?? RSVPs encontrados:', rsvpsData.length, rsvpsData);
      
      const rsvpsWithCompanions = await Promise.all(
        rsvpsData.map(async (rsvp) => {
          if (!rsvp.id) return { ...rsvp, companions: [] };
          const companions = await GuestService.getGuestsByRSVPId(rsvp.id);
          console.log(`?? Acompanhantes para ${rsvp.name}:`, companions.length, companions);
          return { ...rsvp, companions };
        })
      );
      console.log('? RSVPs com acompanhantes:', rsvpsWithCompanions);
      setRsvps(rsvpsWithCompanions);
    } catch (error) {
      console.error('? Erro ao carregar RSVPs com acompanhantes:', error);
    }
  };  const handleLogout = async () => {
    await logoutAdmin();
    window.location.reload();
  };

  const handleDeleteRSVP = async (id: string) => {
    const rsvp = rsvps.find(r => r.id === id);
    const guestName = rsvp?.name || 'esta confirmação';
    
    const executeDelete = async () => {
      const success = await deleteRSVP(id);
      if (success) {
        await loadRSVPsWithCompanions();
        showToastMessage(`Confirmação de "${guestName}" foi excluída com sucesso.`, 'success');
      } else {
        showToastMessage('Erro ao excluir confirmação. Tente novamente.', 'error');
      }
    };

    showConfirmation(
      'Excluir Confirmação',
      `Tem certeza que deseja excluir a confirmação de "${guestName}"?\n\nEsta ação não pode ser desfeita.`,
      executeDelete,
      'danger',
      'Excluir',
      'Cancelar'
    );
  };

  const toggleRSVPExpansion = (id: string) => {
    const newExpanded = new Set(expandedRsvps);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRsvps(newExpanded);
  };

  const handleDeleteGift = async (id: string) => {
    const gift = gifts.find(g => g.id === id);
    const giftName = gift?.name || 'este presente';
    
    const executeDelete = async () => {
      try {
        await GiftService.deleteGift(id);
        await loadGiftData();
        
        showToastMessage(`Presente "${giftName}" foi excluído com sucesso.`, 'success');
      } catch (error) {
        console.error('Erro ao excluir presente:', error);
        showToastMessage('Erro ao excluir presente. Tente novamente.', 'error');
      }
    };

    showConfirmation(
      'Excluir Presente',
      `Tem certeza que deseja excluir o presente "${giftName}"?\n\nEsta ação não pode ser desfeita.`,
      executeDelete,
      'danger',
      'Excluir',
      'Cancelar'
    );
  };

  const handleEditGift = (gift: AdminGift) => {
    setEditingGift(gift);
    setShowGiftModal(true);
  };

  const handleSaveGift = async () => {
    setShowGiftModal(false);
    setEditingGift(null);
    await loadGiftData();
  };

  const handleCancelGift = () => {
    setShowGiftModal(false);
    setEditingGift(null);
  };

  const handleToggleGiftAvailability = async (gift: AdminGift) => {
    console.log('🔄 Solicitando alteração de disponibilidade:', gift.name, 'Reservado:', gift.isReserved);
    
    // Se o presente estiver reservado, permitir "disponibilizar novamente"
    const action = gift.isReserved ? 'disponibilizar novamente' : 'marcar como comprado';
    const newStatus = gift.isReserved ? 'DISPONÍVEL' : 'COMPRADO';
    const type = gift.isReserved ? 'info' : 'warning';
    
    const title = gift.isReserved ? 'Disponibilizar Presente' : 'Marcar como Comprado';
    const message = `Deseja ${action} o presente "${gift.name}"?\n\nStatus atual: ${gift.isReserved ? 'COMPRADO' : 'DISPONÍVEL'}\n**Novo status: ${newStatus}**`;
    
    const executeAction = async () => {
      try {
        console.log('✅ Usuário confirmou. Alterando status...');
        
        await GiftService.updateGift(gift.id, {
          purchased: !gift.isReserved
        });
        await loadGiftData();

        const successMessage = gift.isReserved
          ? `Presente "${gift.name}" foi disponibilizado novamente com sucesso!`
          : `Presente "${gift.name}" foi marcado como "reservado" com sucesso!`;
        
        console.log('✅', successMessage);
        
        // Mostrar toast de sucesso
        showToastMessage(successMessage, 'success');
      } catch (error) {
        console.error('Erro ao atualizar disponibilidade do presente:', error);
        showToastMessage('Erro ao atualizar presente. Tente novamente.', 'error');
      }
    };

    showConfirmation(title, message, executeAction, type, 'Confirmar', 'Cancelar');
  };

  // Funções de drag and drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newGifts = [...gifts];
    const draggedGift = newGifts[draggedIndex];
    
    // Remove o item da posição original
    newGifts.splice(draggedIndex, 1);
    
    // Insere o item na nova posição
    newGifts.splice(dropIndex, 0, draggedGift);
    
    // Atualiza o estado local
    setGifts(newGifts);
    
    // Salva a nova ordem no Supabase
    try {
      await Promise.all(
        newGifts.map((gift, index) => 
          GiftService.updateGift(gift.id, { order_index: index + 1 })
        )
      );
    } catch (error) {
      console.error('Erro ao reordenar presentes:', error);
      // Reverte o estado local em caso de erro
      await loadGiftData();
    }
    
    setDragOverIndex(null);
  };

  const moveGiftUp = async (giftId: string) => {
    const giftIndex = gifts.findIndex(g => g.id === giftId);
    if (giftIndex <= 0) return; // Já é o primeiro ou não encontrado

    const newGifts = [...gifts];
    const temp = newGifts[giftIndex];
    newGifts[giftIndex] = newGifts[giftIndex - 1];
    newGifts[giftIndex - 1] = temp;
    
    setGifts(newGifts);
    
    try {
      await Promise.all(
        newGifts.map((gift, index) => 
          GiftService.updateGift(gift.id, { order_index: index + 1 })
        )
      );
    } catch (error) {
      console.error('Erro ao reordenar presentes:', error);
      await loadGiftData();
    }
  };

  const moveGiftDown = async (giftId: string) => {
    const giftIndex = gifts.findIndex(g => g.id === giftId);
    if (giftIndex >= gifts.length - 1) return; // Já é o último ou não encontrado

    const newGifts = [...gifts];
    const temp = newGifts[giftIndex];
    newGifts[giftIndex] = newGifts[giftIndex + 1];
    newGifts[giftIndex + 1] = temp;
    
    setGifts(newGifts);
    
    try {
      await Promise.all(
        newGifts.map((gift, index) => 
          GiftService.updateGift(gift.id, { order_index: index + 1 })
        )
      );
    } catch (error) {
      console.error('Erro ao reordenar presentes:', error);
      await loadGiftData();
    }
  };

  const confirmingCount = rsvps.filter(rsvp => rsvp.attendance === 'sim').length;
  const totalGuests = rsvps
    .filter(rsvp => rsvp.attendance === 'sim')
    .reduce((sum, rsvp) => {
      // Contar o convidado principal + acompanhantes
      const companionsCount = rsvp.companions ? rsvp.companions.length : 0;
      return sum + 1 + companionsCount; // 1 (principal) + acompanhantes
    }, 0);
  const availableGifts = gifts.filter(gift => gift.isAvailable).length;
  const reservedGifts = gifts.filter(gift => gift.isReserved).length;

  // Filtrar presentes baseado no filtro selecionado
  const filteredGifts = gifts.filter(gift => {
    if (giftFilter === 'available') return gift.isAvailable && !gift.isReserved;
    if (giftFilter === 'reserved') return gift.isReserved;
    return true; // 'all'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="text-center py-12 px-4 sm:py-16 relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
        <div className="mb-6">
          <img 
            src="/images/Monograma YC.png" 
            alt="Monograma Carol & Yuri" 
            className="h-38 w-auto mx-auto"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
          Área Administrativa
        </h1>
        <p className="text-gray-600">Chá de Cozinha</p>
      </header>

      {/* Stats Cards */}
      <section className="px-4 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmações</p>
                <p className="text-2xl font-bold text-gray-900">{confirmingCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Convidados</p>
                <p className="text-2xl font-bold text-gray-900">{totalGuests}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Presentes Comprados</p>
                <p className="text-2xl font-bold text-gray-900">{reservedGifts}/{gifts.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Tabs - Estilo mais clean */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('rsvps')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all ${
                  activeTab === 'rsvps'
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Confirmações ({rsvps.length})
              </button>
              <button
                onClick={() => setActiveTab('gifts')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all ${
                  activeTab === 'gifts'
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Lista de Presentes ({gifts.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'rsvps' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Confirmações de Presença</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confirmação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Convidados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rsvps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Users className="w-12 h-12 text-gray-300 mb-4" />
                          <p>Nenhuma confirmação ainda</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rsvps.map((rsvp) => (
                      <React.Fragment key={rsvp.id}>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rsvp.companions && rsvp.companions.length > 0 && rsvp.id && (
                              <button
                                onClick={() => toggleRSVPExpansion(rsvp.id!)}
                                className="text-gray-400 hover:text-gray-600"
                                title={expandedRsvps.has(rsvp.id!) ? 'Ocultar acompanhantes' : 'Mostrar acompanhantes'}
                              >
                                {expandedRsvps.has(rsvp.id!) ? 
                                  <ChevronUp className="w-5 h-5" /> : 
                                  <ChevronDown className="w-5 h-5" />
                                }
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rsvp.name} {rsvp.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rsvp.cpf}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              {rsvp.whatsapp}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              rsvp.attendance === 'sim'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {rsvp.attendance === 'sim' ? 'Confirmado' : 'Não vai'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(() => {
                              const companionsCount = rsvp.companions ? rsvp.companions.length : 0;
                              const totalPeople = 1 + companionsCount; // 1 (principal) + acompanhantes
                              return (
                                <div>
                                  <span>{totalPeople} pessoa{totalPeople !== 1 ? 's' : ''}</span>
                                  {companionsCount > 0 && (
                                    <span className="ml-2 text-xs text-gray-600">
                                      (1 + {companionsCount} acompanhante{companionsCount !== 1 ? 's' : ''})
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {rsvp.created_at ? new Date(rsvp.created_at).toLocaleDateString('pt-BR') : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {rsvp.id && (
                              <button
                                onClick={() => handleDeleteRSVP(rsvp.id!)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Excluir confirmação"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                        
                        {/* Linha expandida para acompanhantes */}
                        {rsvp.id && expandedRsvps.has(rsvp.id) && rsvp.companions && rsvp.companions.length > 0 && (
                          <tr className="bg-gray-50">
                            <td></td>
                            <td colSpan={6} className="px-6 py-4">
                              <div className="ml-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Acompanhantes:</h4>
                                <div className="space-y-2">
                                  {rsvp.companions.map((companion, index) => (
                                    <div key={companion.id} className="flex items-center space-x-4 text-sm text-gray-600">
                                      <span className="font-medium">{index + 1}.</span>
                                      <span><strong>Nome:</strong> {companion.name} {companion.last_name}</span>
                                      <span><strong>CPF:</strong> {companion.cpf}</span>
                                      <span><strong>WhatsApp:</strong> {companion.whatsapp}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'gifts' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            {/* Botão adicionar presente */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setShowGiftModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar Presente
              </button>
            </div>

            {/* Lista de presentes */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Lista de Presentes</h3>
                
                {/* Filtro de status */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={giftFilter}
                    onChange={(e) => setGiftFilter(e.target.value as 'all' | 'available' | 'reserved')}
                    className="text-sm border border-gray-300 rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="all">Todos ({gifts.length})</option>
                    <option value="available">Disponíveis ({availableGifts})</option>
                    <option value="reserved">Reservados ({reservedGifts})</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {giftFilter === 'all' && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 flex items-center font-medium">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Use o lápis para editar um item ou as setas para reordená-lo rapidamente!
                    </p>
                  </div>
                )}

                {filteredGifts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="flex flex-col items-center">
                      <Gift className="w-12 h-12 text-gray-300 mb-4" />
                      <p>
                        {gifts.length === 0 
                          ? 'Nenhum presente cadastrado' 
                          : `Nenhum presente ${giftFilter === 'available' ? 'disponível' : 'reservado'}`
                        }
                      </p>
                      {gifts.length === 0 && (
                        <button
                          onClick={() => setShowGiftModal(true)}
                          className="mt-4 text-gray-600 hover:text-blue-800 font-medium"
                        >
                          Adicionar primeiro presente
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  filteredGifts.map((gift, filteredIndex) => {
                    const originalIndex = gifts.findIndex(g => g.id === gift.id);
                    const isDragEnabled = giftFilter === 'all'; // Só permite drag quando mostra todos
                    const isFirst = originalIndex === 0;
                    const isLast = originalIndex === gifts.length - 1;
                    
                    return (
                      <div key={gift.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-3">
                          <div className="flex items-center space-x-3">
                            <img 
                              alt={gift.name} 
                              className="w-12 h-12 object-cover rounded-lg" 
                              src={GiftService.getImageUrl(gift.image)}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-gift.svg';
                              }}
                              crossOrigin="anonymous"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">{gift.name}</h3>
                              <p className="text-sm text-gray-500">R$ {Number(gift.price || 0).toFixed(2)}</p>
                              {gift.link && (
                                <a 
                                  href={gift.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  🔗 Ver produto
                                </a>
                              )}
                              <span className={`inline-block px-2 py-1 rounded text-xs ${
                                gift.isReserved 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {gift.isReserved ? 'Comprado' : 'Disponível'}
                              </span>
                              {gift.isReserved && gift.reservedBy && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Reservado por: {gift.reservedBy}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {/* Botão para alterar status do presente */}
                            <button
                              onClick={() => handleToggleGiftAvailability(gift)}
                              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm ${
                                gift.isReserved 
                                  ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md' 
                                  : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-md'
                              }`}
                              title={gift.isReserved ? 'Clique para remover a reserva e disponibilizar novamente' : 'Clique para marcar como comprado'}
                            >
                              {gift.isReserved ? (
                                <>
                                  <Eye className="w-4 h-4" />
                                  Tornar Disponível
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  Marcar Comprado
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleEditGift(gift)}
                              className="p-3 rounded-lg transition-all duration-200 touch-manipulation border bg-green-50 text-green-600 hover:bg-green-100 active:bg-green-200 border-green-200 shadow-sm hover:shadow-md active:scale-95 hover:border-green-300"
                              title="Editar presente (incluindo posição)"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteGift(gift.id)}
                              className="p-3 rounded-lg transition-all duration-200 touch-manipulation border bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 border-red-200 shadow-sm hover:shadow-md active:scale-95 hover:border-red-300"
                              title="Excluir presente"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            
                            {isDragEnabled && (
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() => moveGiftUp && moveGiftUp(gift.id)}
                                  disabled={isFirst}
                                  className={`p-3 rounded-lg transition-all duration-200 touch-manipulation border ${
                                    isFirst 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 border-blue-200 shadow-sm hover:shadow-md active:scale-95 hover:border-blue-300'
                                  }`}
                                  title={isFirst ? "Já está no topo" : "Mover para cima"}
                                >
                                  <ChevronUp className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => moveGiftDown && moveGiftDown(gift.id)}
                                  disabled={isLast}
                                  className={`p-3 rounded-lg transition-all duration-200 touch-manipulation border ${
                                    isLast 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 border-blue-200 shadow-sm hover:shadow-md active:scale-95 hover:border-blue-300'
                                  }`}
                                  title={isLast ? "Já está no final" : "Mover para baixo"}
                                >
                                  <ChevronDown className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg px-4 py-3 font-bold border border-gray-300 shadow-sm min-w-[50px] text-center">
                              #{originalIndex + 1}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal para adicionar/editar presente */}
      {showGiftModal && (
        <GiftModal
          gift={editingGift || undefined}
          onSave={handleSaveGift}
          onCancel={handleCancelGift}
        />
      )}

      {/* Modal de confirmação personalizado */}
      {showConfirmModal && confirmData && (
        <ConfirmModal
          isOpen={showConfirmModal}
          title={confirmData.title}
          message={confirmData.message}
          onConfirm={confirmData.onConfirm}
          onCancel={confirmData.onCancel}
          confirmText={confirmData.confirmText}
          cancelText={confirmData.cancelText}
          type={confirmData.type}
        />
      )}

      {/* Toast de notificação */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Estilos para animações */}
      <style jsx>{styles}</style>
    </div>
  );
}

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verifica se já está logado usando AuthService
    const isAuth = AuthService.isAuthenticated();
    if (isAuth) {
      setIsAuthenticated(true);
    }
    
    // Limpar qualquer erro inicial
    setError('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await AuthService.login({ username, password });
      
      if (result.success && result.user) {
        setIsAuthenticated(true);
      } else {
        setError(result.message || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro no servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acesso Administrativo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Chá de Cozinha - Carol & Yuri
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-500 focus:border-pink-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
