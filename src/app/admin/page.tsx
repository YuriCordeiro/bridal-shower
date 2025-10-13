'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, User, Eye, EyeOff, Users, Gift, LogOut, Trash2, Plus, Edit2, ChevronUp, ChevronDown, ArrowUp, ArrowDown, Phone, MessageSquare, CreditCard, Calendar } from 'lucide-react';
import { RSVPService } from '@/services/rsvpService';
import { GiftService } from '@/services/giftService';
import { AuthService } from '@/services/authService';
import { SupabaseStorageService } from '@/services/supabaseStorageService';
import { SupabaseRSVP, SupabaseGift } from '@/lib/supabase';

// Componente do Dashboard
function AdminDashboard() {
  const [currentView, setCurrentView] = useState<'rsvps' | 'gifts' | 'users'>('rsvps');
  const [rsvps, setRsvps] = useState<SupabaseRSVP[]>([]);
  const [gifts, setGifts] = useState<SupabaseGift[]>([]);
  const [editingGift, setEditingGift] = useState<SupabaseGift | null>(null);
  const [showAddGift, setShowAddGift] = useState(false);

  // Função para formatar valores monetários em BRL
  const formatCurrency = (value: string | number): string => {
    if (!value) return 'R$ 0,00';
    
    // Converter para número se for string
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Verificar se é um número válido
    if (isNaN(numericValue)) return 'R$ 0,00';
    
    // Formatar como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  };

  // Componente para Adicionar Novo Presente
  const AddGiftForm = ({ onSave, onCancel }: { 
    onSave: () => void; 
    onCancel: () => void; 
  }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: '',
      link: '',
      image: '',
      category: 'Cozinha'
    });

    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [isUploadedFile, setIsUploadedFile] = useState(false); // Novo estado para rastrear se é arquivo
    const [uploadSuccess, setUploadSuccess] = useState(false); // Novo estado para feedback de sucesso

    const categories = [
      'Cozinha',
      'Eletrodomésticos',
      'Outros'
    ];

    const handleImageUpload = async (file: File) => {
      setUploadingImage(true);
      
      try {
        // Usar Supabase Storage em vez de API local
        const result = await SupabaseStorageService.uploadImage(file);

        if (result.success && result.imageUrl) {
          setFormData(prev => ({ ...prev, image: result.imageUrl || '' }));
          setPreviewImage(result.imageUrl);
          setIsUploadedFile(true); // Marcar como arquivo enviado
          setUploadSuccess(true); // Mostrar feedback de sucesso
          // Limpar mensagem de sucesso após 3 segundos
          setTimeout(() => setUploadSuccess(false), 3000);
        } else {
          alert(result.error || 'Erro ao enviar imagem');
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao enviar imagem');
      } finally {
        setUploadingImage(false);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };

    const handleRemoveImage = async () => {
      // Se a imagem está no Supabase Storage, deletar ela
      if (isUploadedFile && formData.image && formData.image.includes('supabase')) {
        try {
          await SupabaseStorageService.deleteImage(formData.image);
        } catch (error) {
          console.error('Erro ao deletar imagem:', error);
        }
      }
      
      setPreviewImage('');
      setFormData(prev => ({ ...prev, image: '' }));
      setIsUploadedFile(false); // Resetar estado de arquivo
      setUploadSuccess(false); // Resetar mensagem de sucesso
    };

    const handleUrlChange = (url: string) => {
      setFormData({ ...formData, image: url });
      setPreviewImage(url);
      setIsUploadedFile(false); // Marcar como URL, não arquivo
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.name || !formData.price) {
        alert('Por favor, preencha pelo menos o título e o valor do presente.');
        return;
      }

      try {
        const newGiftData: Omit<SupabaseGift, 'id' | 'created_at'> = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          link: formData.link,
          image: formData.image || 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', // Imagem padrão
          purchased: false,
          order_index: gifts.length,
          category: formData.category
        };

        // Salvar no Supabase
        const savedGift = await GiftService.createGift(newGiftData);
        
        if (savedGift) {
          // Atualizar lista local
          const updatedGifts = [...gifts, savedGift];
          setGifts(updatedGifts);
          
          alert('Presente cadastrado com sucesso!');
          onSave();
        } else {
          alert('Erro ao cadastrar presente. Tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao cadastrar presente:', error);
        alert('Erro ao cadastrar presente. Tente novamente.');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">➕ Adicionar Novo Presente</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🎁 Título do Presente *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Jogo de Panelas Antiaderente"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💰 Valor *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 299.90"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔗 Link do Presente
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemplo.com/produto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📝 Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Descreva o presente em detalhes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🏷️ Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Seção de Upload de Imagem */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🖼️ Imagem do Presente
              </label>
              
              {/* Upload de Arquivo */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploadingImage}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${uploadingImage ? 'opacity-50' : ''}`}
                >
                  <div className="p-3 bg-gray-100 rounded-full">
                    📷
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {uploadingImage ? 'Enviando...' : 'Clique para enviar uma imagem'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG ou GIF até 5MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Feedback de Upload */}
              {uploadSuccess && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center">
                    ✅ Imagem carregada com sucesso!
                  </p>
                </div>
              )}

              {/* Preview da Imagem */}
              {(previewImage || formData.image) && (
                <div className="mt-3">
                  <img
                    src={previewImage || formData.image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    🗑️ Remover imagem
                  </button>
                </div>
              )}

              {/* Campo URL alternativo */}
              <div className={`pt-2 border-t border-gray-200 ${isUploadedFile ? 'opacity-50' : ''}`}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {isUploadedFile ? 'Arquivo enviado (remova a imagem para usar URL):' : 'Ou insira uma URL de imagem:'}
                </label>
                <input
                  type="text"
                  value={isUploadedFile ? '' : formData.image}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  disabled={isUploadedFile}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={uploadingImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ Cadastrar Presente
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar RSVPs do Supabase
      const rsvpData = await RSVPService.getAllRSVPs();
      setRsvps(rsvpData);

      // Carregar presentes do Supabase
      const giftData = await GiftService.getAllGifts();
      setGifts(giftData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do Supabase. Verifique sua conexão.');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    window.location.reload();
  };

  const handleDeleteRsvp = async (id: string) => {
    try {
      const success = await RSVPService.deleteRSVP(id);
      if (success) {
        setRsvps(rsvps.filter(rsvp => rsvp.id !== id));
      } else {
        alert('Erro ao excluir RSVP');
      }
    } catch (error) {
      console.error('Erro ao excluir RSVP:', error);
      alert('Erro ao excluir RSVP');
    }
  };

  const handleDeleteGift = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este presente? Esta ação não pode ser desfeita.')) {
      try {
        const success = await GiftService.deleteGift(id);
        if (success) {
          setGifts(gifts.filter(gift => gift.id !== id));
        } else {
          alert('Erro ao excluir presente');
        }
      } catch (error) {
        console.error('Erro ao excluir presente:', error);
        alert('Erro ao excluir presente');
      }
    }
  };

  const handleMakeAvailable = async (id: string) => {
    if (confirm('Tem certeza que deseja disponibilizar este presente novamente?')) {
      try {
        const success = await GiftService.updateGift(id, {
          purchased: false,
          reserved_by_name: '',
        });
        if (success) {
          // Atualizar a lista local
          const updatedGifts = await GiftService.getAllGifts();
          setGifts(updatedGifts);
          alert('Presente disponibilizado com sucesso!');
        } else {
          alert('Erro ao disponibilizar presente');
        }
      } catch (error) {
        console.error('Erro ao disponibilizar presente:', error);
        alert('Erro ao disponibilizar presente');
      }
    }
  };

  // Funções de reordenação para mobile/desktop
  const moveGiftUp = (index: number) => {
    if (index === 0) return; // Já está no topo
    
    console.log(`Movendo presente ${gifts[index].name} para cima (posição ${index} -> ${index - 1})`);
    
    const newGifts = [...gifts];
    // Trocar posições
    [newGifts[index - 1], newGifts[index]] = [newGifts[index], newGifts[index - 1]];
    
    // Atualizar as ordens baseado nas novas posições
    const reorderedGifts = newGifts.map((gift, idx) => ({
      ...gift,
      order: idx
    }));
    
    console.log('Nova ordem:', reorderedGifts.map(g => g.name));
    
    setGifts(reorderedGifts);
    
    // Forçar atualização da UI
    setTimeout(() => {
      setGifts([...reorderedGifts]);
    }, 100);
  };

  const moveGiftDown = (index: number) => {
    if (index === gifts.length - 1) return; // Já está no final
    
    console.log(`Movendo presente ${gifts[index].name} para baixo (posição ${index} -> ${index + 1})`);
    
    const newGifts = [...gifts];
    // Trocar posições
    [newGifts[index], newGifts[index + 1]] = [newGifts[index + 1], newGifts[index]];
    
    // Atualizar as ordens baseado nas novas posições
    const reorderedGifts = newGifts.map((gift, idx) => ({
      ...gift,
      order: idx
    }));
    
    console.log('Nova ordem:', reorderedGifts.map(g => g.name));
    
    setGifts(reorderedGifts);
    
    // Forçar atualização da UI
    setTimeout(() => {
      setGifts([...reorderedGifts]);
    }, 100);
  };
  // Estatísticas rápidas
  const confirmedRsvps = rsvps.filter(rsvp => rsvp.attendance === 'sim').length;
  const totalGuests = rsvps.filter(rsvp => rsvp.attendance === 'sim').reduce((total) => total, 0);
  const purchasedGifts = gifts.filter(gift => gift.purchased).length;

  // Função para atualizar a ordem de um presente
  const updateGiftOrder = async (giftId: string, newOrder: number) => {
    const currentGift = gifts.find(g => g.id === giftId);
    if (!currentGift) return;

    // Validar se a nova ordem é válida
    const maxOrder = gifts.length - 1;
    if (newOrder < 0 || newOrder > maxOrder) {
      alert(`A posição deve estar entre 1 e ${gifts.length}`);
      return;
    }

    try {
      // Atualizar no Supabase
      const updatedGift = await GiftService.updateGift(giftId, { order_index: newOrder });
      
      if (updatedGift) {
        // Criar nova lista reordenada
        const otherGifts = gifts.filter(g => g.id !== giftId);
        const giftWithNewOrder = { ...currentGift, order_index: newOrder };
        
        // Inserir o presente na nova posição
        const newGifts = [...otherGifts];
        newGifts.splice(newOrder, 0, giftWithNewOrder);
        
        // Reajustar todas as ordens
        const reorderedGifts = newGifts.map((gift, index) => ({
          ...gift,
          order_index: index
        }));

        setGifts(reorderedGifts);
        
        console.log(`Presente "${currentGift.name}" movido para posição ${newOrder + 1}`);
      } else {
        alert('Erro ao reordenar presente');
      }
    } catch (error) {
      console.error('Erro ao reordenar presente:', error);
      alert('Erro ao reordenar presente');
    }
  };

  // Componente de Edição de Presente
  const EditGiftForm = ({ gift, onSave, onCancel }: { 
    gift: SupabaseGift; 
    onSave: () => void; 
    onCancel: () => void; 
  }) => {
    const [formData, setFormData] = useState({
      name: gift.name,
      description: gift.description,
      price: gift.price.toString(),
      image: gift.image,
      link: gift.link || '',
      purchased: gift.purchased,
      order_index: (gift.order_index + 1).toString(), // Mostrar posição baseada em 1
      category: gift.category || 'Cozinha'
    });

    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>(gift.image || '');
    const [isUploadedFile, setIsUploadedFile] = useState(false); // Estado para rastrear se é arquivo
    const [uploadSuccess, setUploadSuccess] = useState(false); // Estado para feedback de sucesso

    const handleImageUpload = async (file: File) => {
      setUploadingImage(true);
      
      try {
        // Deletar imagem antiga se existir no Supabase
        if (formData.image && formData.image.includes('supabase')) {
          try {
            await SupabaseStorageService.deleteImage(formData.image);
          } catch (error) {
            console.error('Erro ao deletar imagem antiga:', error);
          }
        }

        // Usar Supabase Storage em vez de API local
        const result = await SupabaseStorageService.uploadImage(file);

        if (result.success && result.imageUrl) {
          setFormData(prev => ({ ...prev, image: result.imageUrl || '' }));
          setPreviewImage(result.imageUrl);
          setIsUploadedFile(true); // Marcar como arquivo enviado no EditGiftForm
          setUploadSuccess(true); // Mostrar feedback de sucesso
          // Limpar mensagem de sucesso após 3 segundos
          setTimeout(() => setUploadSuccess(false), 3000);
        } else {
          alert(result.error || 'Erro ao enviar imagem');
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao enviar imagem');
      } finally {
        setUploadingImage(false);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };

    const handleRemoveImage = async () => {
      // Se a imagem está no Supabase Storage, deletar ela
      if (isUploadedFile && formData.image && formData.image.includes('supabase')) {
        try {
          await SupabaseStorageService.deleteImage(formData.image);
        } catch (error) {
          console.error('Erro ao deletar imagem:', error);
        }
      }
      
      setPreviewImage('');
      setFormData(prev => ({ ...prev, image: '' }));
      setIsUploadedFile(false); // Resetar estado de arquivo no EditGiftForm
      setUploadSuccess(false); // Resetar mensagem de sucesso
    };

    const handleUrlChange = (url: string) => {
      setFormData({ ...formData, image: url });
      setPreviewImage(url);
      setIsUploadedFile(false); // Marcar como URL, não arquivo no EditGiftForm
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const newOrder = parseInt(formData.order_index) - 1; // Converter para índice baseado em 0
      if (isNaN(newOrder) || newOrder < 0 || newOrder >= gifts.length) {
        alert(`A posição deve ser um número entre 1 e ${gifts.length}`);
        return;
      }

      // Atualizar dados do presente
      const updatedGift: SupabaseGift = {
        ...gift,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        link: formData.link,
        purchased: formData.purchased,
        order_index: newOrder,
        category: formData.category
      };

      // Se a ordem mudou, reordenar
      if (updatedGift.order_index !== gift.order_index) {
        updateGiftOrder(gift.id!, updatedGift.order_index);
      } else {
        // Atualizar o presente no Supabase
        try {
          const savedGift = await GiftService.updateGift(gift.id!, {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            image: formData.image,
            link: formData.link,
            purchased: formData.purchased,
            category: formData.category
          });

          if (savedGift) {
            // Atualizar lista local
            const updatedGifts = gifts.map(g => g.id === gift.id ? savedGift : g);
            setGifts(updatedGifts);
            alert('Presente atualizado com sucesso!');
          } else {
            alert('Erro ao atualizar presente. Tente novamente.');
            return;
          }
        } catch (error) {
          console.error('Erro ao atualizar presente:', error);
          alert('Erro ao atualizar presente. Tente novamente.');
          return;
        }
      }

      onSave();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Editar Presente</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Presente
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔗 Link do Presente
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemplo.com/produto"
              />
            </div>

            {/* Seção de Upload de Imagem */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🖼️ Imagem do Presente
              </label>
              
              {/* Upload de Arquivo */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploadingImage}
                  className="hidden"
                  id="image-upload-edit"
                />
                <label
                  htmlFor="image-upload-edit"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${uploadingImage ? 'opacity-50' : ''}`}
                >
                  <div className="p-3 bg-gray-100 rounded-full">
                    📷
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {uploadingImage ? 'Enviando...' : 'Clique para enviar uma nova imagem'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG ou GIF até 5MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Preview da Imagem */}
              {(previewImage || formData.image) && (
                <div className="mt-3">
                  <img
                    src={previewImage || formData.image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    🗑️ Remover imagem
                  </button>
                </div>
              )}

              {/* Campo URL alternativo */}
              <div className={`pt-2 border-t border-gray-200 ${isUploadedFile ? 'opacity-50' : ''}`}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {isUploadedFile ? 'Arquivo enviado (remova a imagem para usar URL):' : 'Ou insira uma URL de imagem:'}
                </label>
                <input
                  type="text"
                  value={isUploadedFile ? '' : formData.image}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  disabled={isUploadedFile}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cozinha">Cozinha</option>
                <option value="Eletrodomésticos">Eletrodomésticos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            {/* Campo de Posição - NOVO */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                📍 Posição na Lista (1 a {gifts.length})
              </label>
              <input
                type="number"
                min="1"
                max={gifts.length}
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
              <p className="text-xs text-blue-600 mt-1">
                💡 Posição atual: {gift.order_index + 1}. Digite um novo número para reordenar.
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="purchased"
                checked={formData.purchased}
                onChange={(e) => setFormData({ ...formData, purchased: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="purchased" className="ml-2 text-sm text-gray-700">
                Presente já foi comprado
              </label>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={uploadingImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar Alterações
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Administrativo
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmações</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedRsvps}</p>
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
                <p className="text-2xl font-bold text-gray-900">{purchasedGifts}/{gifts.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setCurrentView('rsvps')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                currentView === 'rsvps'
                  ? 'bg-gray-50 text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Confirmações</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentView('gifts')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                currentView === 'gifts'
                  ? 'bg-gray-50 text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Lista de Presentes</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {currentView === 'rsvps' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Confirmações de Presença</h2>
            </div>
            <div className="p-6">
              {rsvps.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma confirmação ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rsvps.map((rsvp) => (
                    <div key={rsvp.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* Header com nome e status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{rsvp.name}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                rsvp.attendance === 'sim' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {rsvp.attendance === 'sim' ? '✓ Confirmado' : '✗ Não virá'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => rsvp.id && handleDeleteRsvp(rsvp.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir confirmação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Informações de contato */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Telefone</p>
                            <p className="text-sm text-gray-900">{rsvp.whatsapp}</p>
                          </div>
                        </div>
                        
                        {rsvp.whatsapp && rsvp.whatsapp !== rsvp.whatsapp && (
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <MessageSquare className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">WhatsApp</p>
                              <p className="text-sm text-gray-900">{rsvp.whatsapp}</p>
                            </div>
                          </div>
                        )}
                        
                        {rsvp.cpf && (
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">CPF</p>
                              <p className="text-sm text-gray-900">{rsvp.cpf}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Confirmado em</p>
                            <p className="text-sm text-gray-900">
                              {new Date(rsvp.created_at || '').toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Mensagem se houver */}
                      {rsvp.message && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-2">Mensagem</p>
                          <p className="text-sm text-blue-800 italic">&ldquo;{rsvp.message}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Presentes</h2>
              <button
                onClick={() => setShowAddGift(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Presente
              </button>
            </div>
            <div className="p-6">
              {gifts.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum presente cadastrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 flex items-center font-medium">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Use o lápis para editar um item ou as setas para reordená-lo rapidamente!
                    </p>
                  </div>
                  {gifts.map((gift, index) => (
                    <div key={gift.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={gift.image} 
                            alt={gift.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{gift.name}</h3>
                            <p className="text-sm text-gray-500">{formatCurrency(gift.price)}</p>
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
                              gift.purchased 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {gift.purchased ? 'Comprado' : 'Disponível'}
                            </span>
                            {gift.purchased && gift.reserved_by_name && (
                              <p className="text-xs text-gray-600 mt-1">
                                Reservado por: {gift.reserved_by_name}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Controles de reordenação */}
                        <div className="flex items-center space-x-3">
                          {/* Botão para disponibilizar presente novamente */}
                          {gift.purchased && (
                            <button
                              onClick={() => gift.id && handleMakeAvailable(gift.id)}
                              className="p-3 rounded-lg transition-all duration-200 touch-manipulation border bg-orange-50 text-orange-600 hover:bg-orange-100 active:bg-orange-200 border-orange-200 shadow-sm hover:shadow-md active:scale-95 hover:border-orange-300"
                              title="Disponibilizar presente novamente"
                            >
                              <Gift className="w-5 h-5" />
                            </button>
                          )}

                          {/* Botão de Edição */}
                          <button
                            onClick={() => setEditingGift(gift)}
                            className="p-3 rounded-lg transition-all duration-200 touch-manipulation border bg-green-50 text-green-600 hover:bg-green-100 active:bg-green-200 border-green-200 shadow-sm hover:shadow-md active:scale-95 hover:border-green-300"
                            title="Editar presente (incluindo posição)"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>

                          {/* Botão de Exclusão */}
                          <button
                            onClick={() => gift.id && handleDeleteGift(gift.id)}
                            className="p-3 rounded-lg transition-all duration-200 touch-manipulation border bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 border-red-200 shadow-sm hover:shadow-md active:scale-95 hover:border-red-300"
                            title="Excluir presente"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          {/* Botões de movimentação - maiores para mobile */}
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => moveGiftUp(index)}
                              disabled={index === 0}
                              className={`p-3 rounded-lg transition-all duration-200 touch-manipulation border ${
                                index === 0 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 border-blue-200 shadow-sm hover:shadow-md active:scale-95 hover:border-blue-300'
                              }`}
                              title={index === 0 ? "Já está no topo" : "Mover para cima"}
                            >
                              <ChevronUp className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => moveGiftDown(index)}
                              disabled={index === gifts.length - 1}
                              className={`p-3 rounded-lg transition-all duration-200 touch-manipulation border ${
                                index === gifts.length - 1 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 border-blue-200 shadow-sm hover:shadow-md active:scale-95 hover:border-blue-300'
                              }`}
                              title={index === gifts.length - 1 ? "Já está no final" : "Mover para baixo"}
                            >
                              <ChevronDown className="w-5 h-5" />
                            </button>
                          </div>
                          
                          {/* Indicador de posição */}
                          <div className="text-sm text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg px-4 py-3 font-bold border border-gray-300 shadow-sm min-w-[50px] text-center">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {editingGift && (
        <EditGiftForm 
          gift={editingGift}
          onSave={() => setEditingGift(null)}
          onCancel={() => setEditingGift(null)}
        />
      )}

      {/* Modal de Adicionar Presente */}
      {showAddGift && (
        <AddGiftForm 
          onSave={() => setShowAddGift(false)}
          onCancel={() => setShowAddGift(false)}
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
        // Salvar sessão
        AuthService.saveSession(result.user);
        setIsAuthenticated(true);
      } else {
        setError(result.message || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro interno. Tente novamente.');
    }

    setIsLoading(false);
  };

  // Se autenticado, mostra o dashboard
  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Área Administrativa
          </h1>
          <p className="text-gray-600">
            Chá de Cozinha - Carol & Yuri
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Voltar para o site principal
          </Link>
        </div>
      </div>
    </div>
  );
}
