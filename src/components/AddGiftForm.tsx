// Versão simplificada do AddGiftForm apenas com criação manual

import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface AddGiftFormProps {
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
}

// Função para salvar presente no localStorage (precisa ser importada do dashboard)
declare function saveAdminGift(gift: FormData & { isReserved: boolean }): void;

export function AddGiftForm({ onSave, onCancel }: AddGiftFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: 'Cozinha',
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const categories = [
    'Cozinha',
    'Eletrodomésticos',
    'Outros'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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
    saveAdminGift({
      ...formData,
      isReserved: false
    });
    onSave();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Adicionar Novo Presente</h3>
        <p className="text-gray-600">Preencha as informações do presente</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview da imagem */}
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
            {imageFile && (
              <span className="text-sm text-gray-600">{imageFile.name}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Adicionar Presente
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
  );
}
