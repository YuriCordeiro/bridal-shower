'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  GripVertical
} from 'lucide-react';

// Tipos locais para evitar problemas de importação
interface RSVP {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  attendance: 'sim' | 'nao';
  guests: number;
  message?: string;
  submittedAt: string;
  createdAt: string;
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
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('bridal-shower-admin-logged') === 'true';
};

const logoutAdmin = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('bridal-shower-admin-logged');
};

const getRSVPs = (): RSVP[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('bridal-shower-rsvps');
  return stored ? JSON.parse(stored) : [];
};

const deleteRSVP = (id: string): void => {
  if (typeof window === 'undefined') return;
  const rsvps = getRSVPs();
  const filtered = rsvps.filter(rsvp => rsvp.id !== id);
  localStorage.setItem('bridal-shower-rsvps', JSON.stringify(filtered));
};

const getAdminGifts = (): AdminGift[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('bridal-shower-admin-gifts');
  const gifts = stored ? JSON.parse(stored) : [];
  return gifts.sort((a: AdminGift, b: AdminGift) => (a.order || 0) - (b.order || 0));
};

const saveAdminGift = (gift: Omit<AdminGift, 'id' | 'order'>): void => {
  if (typeof window === 'undefined') return;
  const gifts = getAdminGifts();
  const maxOrder = gifts.length > 0 ? Math.max(...gifts.map(g => g.order || 0)) : 0;
  const newGift: AdminGift = {
    ...gift,
    id: Date.now().toString(),
    order: maxOrder + 1
  };
  gifts.push(newGift);
  localStorage.setItem('bridal-shower-admin-gifts', JSON.stringify(gifts));
};

const updateAdminGift = (id: string, updates: Partial<AdminGift>): void => {
  if (typeof window === 'undefined') return;
  const gifts = getAdminGifts();
  const index = gifts.findIndex(gift => gift.id === id);
  if (index !== -1) {
    gifts[index] = { ...gifts[index], ...updates };
    localStorage.setItem('bridal-shower-admin-gifts', JSON.stringify(gifts));
  }
};

const reorderAdminGifts = (reorderedGifts: AdminGift[]): void => {
  if (typeof window === 'undefined') return;
  const giftsWithNewOrder = reorderedGifts.map((gift, index) => ({
    ...gift,
    order: index + 1
  }));
  localStorage.setItem('bridal-shower-admin-gifts', JSON.stringify(giftsWithNewOrder));
};

const deleteAdminGift = (id: string): void => {
  if (typeof window === 'undefined') return;
  const gifts = getAdminGifts();
  const filtered = gifts.filter(gift => gift.id !== id);
  localStorage.setItem('bridal-shower-admin-gifts', JSON.stringify(filtered));
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
  dragOverIndex
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
}) {
  return (
    <tr 
      key={gift.id}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        dragOverIndex === index ? 'border-t-2 border-blue-500' : ''
      } hover:bg-gray-50 cursor-move`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="mr-3 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4" />
          </div>
          {gift.image && (
            <img className="h-10 w-10 rounded-lg object-cover mr-4" src={gift.image} alt="" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
              {gift.name}
              {gift.link && (
                <a 
                  href={gift.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
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
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          gift.isReserved
            ? 'bg-green-100 text-green-800'
            : gift.isAvailable 
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {gift.isReserved ? 'Reservado' : gift.isAvailable ? 'Disponível' : 'Indisponível'}
        </span>
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
            className="text-blue-600 hover:text-blue-900 p-1"
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
    isAvailable: gift?.isAvailable ?? true
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (gift) {
      updateAdminGift(gift.id, {
        ...formData,
        isReserved: gift.isReserved
      });
    } else {
      saveAdminGift({
        ...formData,
        isReserved: false
      });
    }
    onSave();
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
                  className="w-32 h-32 object-cover rounded-lg mx-auto border border-gray-200"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Descrição do presente..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                Produto disponível para escolha
              </label>
            </div>
            
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                {gift ? 'Salvar Alterações' : 'Adicionar Presente'}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'rsvps' | 'gifts'>('rsvps');
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [gifts, setGifts] = useState<AdminGift[]>([]);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [editingGift, setEditingGift] = useState<AdminGift | null>(null);
  
  // Estados para drag and drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin');
      return;
    }
    setRsvps(getRSVPs());
    setGifts(getAdminGifts());
  }, [router]);

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin');
  };

  const handleDeleteRSVP = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta confirmação?')) {
      deleteRSVP(id);
      setRsvps(getRSVPs());
    }
  };

  const handleDeleteGift = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este presente?')) {
      deleteAdminGift(id);
      setGifts(getAdminGifts());
    }
  };

  const handleEditGift = (gift: AdminGift) => {
    setEditingGift(gift);
    setShowGiftModal(true);
  };

  const handleSaveGift = () => {
    setShowGiftModal(false);
    setEditingGift(null);
    setGifts(getAdminGifts());
  };

  const handleCancelGift = () => {
    setShowGiftModal(false);
    setEditingGift(null);
  };

  const toggleGiftAvailability = (gift: AdminGift) => {
    updateAdminGift(gift.id, { isAvailable: !gift.isAvailable });
    setGifts(getAdminGifts());
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

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
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
    
    // Salva a nova ordem
    reorderAdminGifts(newGifts);
    
    setDragOverIndex(null);
  };

  const confirmingCount = rsvps.filter(rsvp => rsvp.attendance === 'sim').length;
  const totalGuests = rsvps
    .filter(rsvp => rsvp.attendance === 'sim')
    .reduce((sum, rsvp) => sum + rsvp.guests, 0);
  const availableGifts = gifts.filter(gift => gift.isAvailable).length;
  const reservedGifts = gifts.filter(gift => gift.isReserved).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600">Chá de Cozinha - Carol & Yuri</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-gray-900">{confirmingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Convidados</p>
                <p className="text-2xl font-bold text-gray-900">{totalGuests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Gift className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Presentes Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">{availableGifts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Check className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Presentes Reservados</p>
                <p className="text-2xl font-bold text-gray-900">{reservedGifts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('rsvps')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rsvps'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Confirmações ({rsvps.length})
              </button>
              <button
                onClick={() => setActiveTab('gifts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'gifts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lista de Presentes ({gifts.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'rsvps' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Confirmações de Presença</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
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
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Users className="w-12 h-12 text-gray-300 mb-4" />
                          <p>Nenhuma confirmação ainda</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rsvps.map((rsvp) => (
                      <tr key={rsvp.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rsvp.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {rsvp.whatsapp || rsvp.phone}
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
                          {rsvp.guests} pessoa{rsvp.guests !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(rsvp.createdAt || rsvp.submittedAt).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteRSVP(rsvp.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Excluir confirmação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'gifts' && (
          <div>
            {/* Botão adicionar presente */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setShowGiftModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Presente
              </button>
              
              {gifts.length > 0 && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <GripVertical className="w-4 h-4" />
                  Arraste os presentes para reordenar
                </div>
              )}
            </div>

            {/* Lista de presentes */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lista de Presentes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Presente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gifts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <Gift className="w-12 h-12 text-gray-300 mb-4" />
                            <p>Nenhum presente cadastrado</p>
                            <button
                              onClick={() => setShowGiftModal(true)}
                              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Adicionar primeiro presente
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      gifts.map((gift, index) => (
                        <DraggableGiftRow
                          key={gift.id}
                          gift={gift}
                          index={index}
                          onEdit={handleEditGift}
                          onDelete={handleDeleteGift}
                          onToggleAvailability={toggleGiftAvailability}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          isDragging={draggedIndex === index}
                          dragOverIndex={dragOverIndex}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

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
