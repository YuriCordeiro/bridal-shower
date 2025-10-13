'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Gift, 
  LogOut, 
  Trash2, 
  Plus, 
  Edit2, 
  Check,
  Phone,
  MessageCircle,
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
  ArrowDown
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
const isAdminLoggedIn = () => {
  return AuthService.isAuthenticated();
};

const logoutAdmin = () => {
  AuthService.logout();
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

// Componente de linha arrastável para presente
function DraggableGiftRow({ 
  gift, 
  index,
  onEdit,
  onDelete,
  onToggleAvailability,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  dragOverIndex,
  isDragEnabled = true,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  totalItems
}: {
  gift: AdminGift;
  index: number;
  onEdit: (gift: AdminGift) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (gift: AdminGift) => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
  dragOverIndex: number | null;
  isDragEnabled?: boolean;
  onMoveUp?: (giftId: string) => void;
  onMoveDown?: (giftId: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
  totalItems?: number;
}) {
  return (
    <tr 
      key={gift.id}
      draggable={isDragEnabled}
      onDragStart={() => isDragEnabled && onDragStart(index)}
      onDragEnd={isDragEnabled ? onDragEnd : undefined}
      onDragOver={(e) => isDragEnabled && onDragOver(e, index)}
      onDrop={(e) => isDragEnabled && onDrop(e, index)}
      className={`transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95 bg-blue-50 border-2 border-blue-300 border-dashed' : ''
      } ${
        dragOverIndex === index ? 'border-t-4 border-pink-500 bg-blue-25' : ''
      } hover:bg-gray-50 ${isDragEnabled ? 'cursor-move hover:shadow-md' : 'cursor-default'}`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex flex-col items-center space-y-1">
          <span className="text-sm font-medium text-gray-900">
            {gift.order || index + 1}
          </span>
          {isDragEnabled && (
            <div className="flex flex-col space-y-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp && onMoveUp(gift.id);
                }}
                disabled={isFirst}
                className={`p-0.5 rounded text-xs ${
                  isFirst 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Mover para cima"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown && onMoveDown(gift.id);
                }}
                disabled={isLast}
                className={`p-0.5 rounded text-xs ${
                  isLast 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Mover para baixo"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`mr-3 p-1 rounded transition-all duration-150 ${
            isDragEnabled 
              ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-grab active:cursor-grabbing' 
              : 'text-gray-300 cursor-not-allowed'
          }`}>
            <GripVertical className="w-4 h-4" />
          </div>
          {gift.image && (
            <img className="h-10 w-10 rounded-xl object-cover mr-4" src={gift.image} alt="" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
              {gift.name}
              {gift.link && (
                <a 
                  href={gift.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-800"
                  title="Ver produto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {gift.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">{gift.description}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {gift.category}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {gift.price}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-1">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            gift.isReserved
              ? 'bg-green-100 text-green-800'
              : gift.isAvailable 
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {gift.isReserved ? 'Reservado' : gift.isAvailable ? 'Disponível' : 'Indisponível'}
          </span>
          {gift.isReserved && gift.reservedBy && (
            <div className="text-xs text-gray-500">
              <User className="w-3 h-3 inline mr-1" />
              {gift.reservedBy}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleAvailability(gift);
            }}
            className={`p-1 ${gift.isAvailable ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}`}
            title={gift.isAvailable ? 'Tornar indisponível' : 'Tornar disponível'}
          >
            {gift.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(gift);
            }}
            className="text-gray-600 hover:text-blue-900 p-1"
            title="Editar presente"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(gift.id);
            }}
            className="text-red-600 hover:text-red-900 p-1"
            title="Excluir presente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

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
        const updateData: any = {
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

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                Produto disponível para escolha
              </label>
            </div>
            
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

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'rsvps' | 'gifts'>('rsvps');
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [gifts, setGifts] = useState<AdminGift[]>([]);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [editingGift, setEditingGift] = useState<AdminGift | null>(null);
  
  // Estados para drag and drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Estados para acompanhantes e filtros
  const [expandedRsvps, setExpandedRsvps] = useState<Set<string>>(new Set());
  const [giftFilter, setGiftFilter] = useState<'all' | 'available' | 'reserved'>('all');
  
  const router = useRouter();

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
  };  const handleLogout = () => {
    logoutAdmin();
    window.location.reload();
  };

  const handleDeleteRSVP = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta confirmação?')) {
      const success = await deleteRSVP(id);
      if (success) {
        await loadRSVPsWithCompanions();
      } else {
        alert('Erro ao excluir confirmação. Tente novamente.');
      }
    }
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
    if (confirm('Tem certeza que deseja excluir este presente?')) {
      try {
        await GiftService.deleteGift(id);
        await loadGiftData();
      } catch (error) {
        console.error('Erro ao excluir presente:', error);
        alert('Erro ao excluir presente. Tente novamente.');
      }
    }
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

  const toggleGiftAvailability = async (gift: AdminGift) => {
    try {
      await GiftService.updateGift(gift.id, {
        purchased: !gift.isReserved
      });
      await loadGiftData();
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade do presente:', error);
      alert('Erro ao atualizar presente. Tente novamente.');
    }
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
        <p className="text-gray-600">Chá de Cozinha - Carol & Yuri</p>
      </header>

      {/* Stats Cards */}
      <section className="px-4 mb-6 sm:mb-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">
            Estatísticas do Evento
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">Confirmados</p>
                  <p className="text-gray-600 text-sm sm:text-base">{confirmingCount} pessoas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">Total de Convidados</p>
                  <p className="text-gray-600 text-sm sm:text-base">{totalGuests} pessoas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">Presentes Disponíveis</p>
                  <p className="text-gray-600 text-sm sm:text-base">{availableGifts} itens</p>
                </div>
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
              
              {gifts.length > 0 && (
                <div className="text-sm flex items-center gap-2">
                  <GripVertical className="w-4 h-4" />
                  {giftFilter === 'all' ? (
                    <span className="text-gray-500">?? Arraste os presentes pela alça para reordenar a lista</span>
                  ) : (
                    <span className="text-amber-600">?? Para reordenar os presentes, selecione "Todos" no filtro acima</span>
                  )}
                </div>
              )}
            </div>

            {/* Lista de presentes */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
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
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          #
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3 h-3 text-gray-400" />
                          Presente
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status / Reservado por
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGifts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
                        </td>
                      </tr>
                    ) : (
                      filteredGifts.map((gift, filteredIndex) => {
                        const originalIndex = gifts.findIndex(g => g.id === gift.id);
                        const isDragEnabled = giftFilter === 'all'; // Só permite drag quando mostra todos
                        return (
                          <DraggableGiftRow
                            key={gift.id}
                            gift={gift}
                            index={originalIndex}
                            onEdit={handleEditGift}
                            onDelete={handleDeleteGift}
                            onToggleAvailability={toggleGiftAvailability}
                            onDragStart={isDragEnabled ? handleDragStart : () => {}}
                            onDragEnd={isDragEnabled ? handleDragEnd : () => {}}
                            onDragOver={isDragEnabled ? handleDragOver : () => {}}
                            onDrop={isDragEnabled ? handleDrop : () => {}}
                            isDragging={isDragEnabled && draggedIndex === originalIndex}
                            dragOverIndex={isDragEnabled ? dragOverIndex : null}
                            isDragEnabled={isDragEnabled}
                            onMoveUp={isDragEnabled ? moveGiftUp : undefined}
                            onMoveDown={isDragEnabled ? moveGiftDown : undefined}
                            isFirst={originalIndex === 0}
                            isLast={originalIndex === gifts.length - 1}
                            totalItems={gifts.length}
                          />
                        );
                      })
                    )}
                  </tbody>
                </table>
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
        AuthService.saveSession(result.user);
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
