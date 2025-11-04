"use client";

import React, { useState, useEffect } from 'react';
import { GiftService } from '@/services/giftService';
import { SupabaseGift } from '@/lib/supabase';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { Search, Gift, User, ExternalLink, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function Presentes() {
  const [gifts, setGifts] = useState<SupabaseGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<SupabaseGift | null>(null);
  const [reserverName, setReserverName] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservedGift, setReservedGift] = useState<SupabaseGift | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const itemsPerPage = 10;

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

  useEffect(() => {
    // Carregar presentes do Supabase
    const loadGifts = async () => {
      try {
        setLoading(true);
        const giftsData = await GiftService.getAllGifts();
        setGifts(giftsData);
      } catch (error) {
        console.error('Erro ao carregar presentes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGifts();
  }, []);

  // Categorias dinâmicas baseadas nos presentes cadastrados
  const categories = gifts.length > 0 ? 
    ['Todos', ...Array.from(new Set(gifts.map(gift => gift.category).filter(cat => cat !== undefined)))] : 
    ['Todos'];

  // Filtrar presentes
  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gift.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || gift.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Ordenar presentes por preço
  const sortedGifts = [...filteredGifts].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.price - b.price;
    } else if (sortOrder === 'desc') {
      return b.price - a.price;
    }
    return 0; // Manter ordem original se sortOrder for 'none'
  });

  // Calcular paginação
  const totalPages = Math.ceil(sortedGifts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGifts = sortedGifts.slice(startIndex, endIndex);

  // Resetar página quando filtros mudarem
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortOrder]);

  const handleReserve = (gift: SupabaseGift) => {
    setSelectedGift(gift);
    setShowReserveModal(true);
  };

  const confirmReservation = async () => {
    if (selectedGift && selectedGift.id && reserverName.trim()) {
      try {
        // Atualizar presente no Supabase
        await GiftService.updateGift(selectedGift.id, {
          purchased: true,
          reserved_by_name: reserverName.trim(),
        });
        
        // Atualizar a lista local
        const giftsData = await GiftService.getAllGifts();
        setGifts(giftsData);
        
        // Guardar o presente reservado para exibir no modal de sucesso
        setReservedGift(selectedGift);
        
        // Fecha o modal de reserva e abre o modal de sucesso
        setShowReserveModal(false);
        setShowSuccessModal(true);
        setSelectedGift(null);
        setReserverName('');
      } catch (error) {
        console.error('Erro ao reservar presente:', error);
        alert('Erro ao reservar presente. Tente novamente.');
      }
    }
  };

const cancelReservation = () => {
  setShowReserveModal(false);
  setSelectedGift(null);
  setReserverName('');
};

const closeSuccessModal = () => {
  setShowSuccessModal(false);
  setReservedGift(null);
};

const openProductLink = () => {
  if (reservedGift?.link) {
    window.open(reservedGift.link, '_blank', 'noopener,noreferrer');
  }
};

return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Lista de Presentes"
        subtitle="As escolhas foram feitas baseadas no nosso gosto pessoal, mas também servem de referência para outros produtos"
      />

      {/* Search and Filter */}
      <section className="px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar presentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Control */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {sortedGifts.length} {sortedGifts.length === 1 ? 'presente' : 'presentes'}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Ordenar por preço:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? 'none' : 'asc')}
                className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'none' && (
                  <>
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Padrão</span>
                  </>
                )}
                {sortOrder === 'asc' && (
                  <>
                    <ArrowUp className="w-4 h-4" />
                    <span>Menor preço</span>
                  </>
                )}
                {sortOrder === 'desc' && (
                  <>
                    <ArrowDown className="w-4 h-4" />
                    <span>Maior preço</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gifts Grid */}
      <section className="px-4 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          {loading ? (
            <div className="space-y-4">
              {/* Loading Skeleton */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-xl border p-4 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
              <div className="text-center py-4">
                <div className="inline-flex items-center space-x-2 text-gray-600">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  <span>Carregando presentes...</span>
                </div>
              </div>
            </div>
          ) : sortedGifts.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum presente encontrado</p>
            </div>
          ) : (
            <>
              {paginatedGifts.map((gift) => (
            <div
              key={gift.id}
              className={`bg-white rounded-xl border p-4 transition-opacity ${
                gift.purchased ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {gift.image ? (
                    <img 
                      src={gift.image} 
                      alt={gift.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Gift className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {gift.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {gift.description}
                  </p>
                  {gift.link && (
                    <a 
                      href={gift.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-3 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver detalhes do produto
                    </a>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800">
                      {formatCurrency(gift.price)}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {gift.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {gift.purchased ? (
                  <div className="text-center py-2">
                    <div className="text-sm text-gray-500 mb-1">
                      ✓ Presente já reservado
                    </div>
                    {gift.reserved_by_name && (
                      <div className="text-xs text-gray-400">
                        por {gift.reserved_by_name}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleReserve(gift)}
                    className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                  >
                    Reservar Presente
                  </button>
                )}
              </div>
            </div>
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 pt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-gray-800 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      {/* Modal de Reserva */}
      {showReserveModal && selectedGift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Reservar Presente
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800">{selectedGift.name}</h4>
              <p className="text-sm text-gray-600">{selectedGift.description}</p>
              <p className="text-lg font-bold text-gray-800 mt-2">{formatCurrency(selectedGift.price)}</p>
            </div>

            <div className="mb-4">
              <label htmlFor="reserverName" className="block text-sm font-medium text-gray-700 mb-2">
                Seu nome
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="reserverName"
                  value={reserverName}
                  onChange={(e) => setReserverName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Digite seu nome"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelReservation}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReservation}
                disabled={!reserverName.trim()}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sucesso */}
      {showSuccessModal && reservedGift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            {/* Ícone de sucesso */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🥳 Presente Reservado!
            </h3>
            
            <p className="text-gray-600 mb-6">
              Parabéns! Você reservou este presente para o casal.
            </p>

            <p className="text-gray-600 mb-6">
              👉🏻 A reserva garante que ninguém mais escolherá este item da lista, mas não finaliza a compra.
            </p>

            <p className="text-gray-600 mb-2">
              🎁 Para concluir a compra e presentear os noivos, utilize o botão "Ver Produto na Loja" abaixo para ser direcionado(a) ao link da Shopee, ou adquira um produto similar em qualquer loja física ou online de sua preferência.
            </p>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800">{reservedGift.name}</h4>
              <p className="text-sm text-gray-600">{reservedGift.description}</p>
              <p className="text-lg font-bold text-gray-800 mt-2">{formatCurrency(reservedGift.price)}</p>
            </div>

            <div className="space-y-3">
              {reservedGift.link && (
                <button
                  onClick={openProductLink}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Ver Produto na Loja</span>
                </button>
              )}
              
              <button
                onClick={closeSuccessModal}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                Continuar Navegando
              </button>
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}
