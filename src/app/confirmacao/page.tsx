"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Users, MessageSquare, CreditCard, MessageCircle, Plus, Trash2, User, Phone } from "lucide-react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { RSVPService } from "@/services/rsvpService";
import { GuestService } from "@/services/guestService";
import { SupabaseRSVP, SupabaseGuest } from "@/lib/supabase";

const formatCPF = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, "");
  
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return numbers.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  } else if (numbers.length <= 9) {
    return numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  } else {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  }
};

const formatWhatsApp = (whatsapp: string): string => {
  const numbers = whatsapp.replace(/\D/g, "");
  
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return numbers.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  } else if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }
};

interface GuestForm {
  name: string;
  whatsapp: string;
  cpf: string;
}

export default function ConfirmacaoPage() {
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    cpf: "",
    attendance: "" as "sim" | "nao" | "",
    message: ""
  });
  const [guestCount, setGuestCount] = useState(0);
  const [guests, setGuests] = useState<GuestForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [nameError, setNameError] = useState("");
  const [guestNameErrors, setGuestNameErrors] = useState<string[]>([]);
  const router = useRouter();

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const handleWhatsAppChange = (value: string) => {
    const formatted = formatWhatsApp(value);
    setFormData(prev => ({ ...prev, whatsapp: formatted }));
  };

  const validateFullName = (name: string): boolean => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;
    
    // Dividir o nome em palavras e filtrar palavras vazias
    const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);
    
    // Deve ter pelo menos 2 partes (nome e sobrenome)
    return nameParts.length >= 2;
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    
    // Validar em tempo real apenas se o campo não estiver vazio
    if (value.trim() && !validateFullName(value)) {
      setNameError("Informe nome e sobrenome");
    } else {
      setNameError("");
    }
  };

  // Função para atualizar quantidade de acompanhantes
  const handleGuestCountChange = (count: number) => {
    setGuestCount(count);
    
    // Ajustar array de acompanhantes
    const newGuests = Array(count).fill(null).map((_, index) => 
      guests[index] || { name: "", whatsapp: "", cpf: "" }
    );
    setGuests(newGuests);
    
    // Inicializar array de erros de nome
    setGuestNameErrors(Array(count).fill(""));
  };

  // Função para atualizar dados de um acompanhante específico
  const handleGuestChange = (index: number, field: keyof GuestForm, value: string) => {
    const newGuests = [...guests];
    if (field === 'cpf') {
      newGuests[index] = { ...newGuests[index], [field]: formatCPF(value) };
    } else if (field === 'whatsapp') {
      newGuests[index] = { ...newGuests[index], [field]: formatWhatsApp(value) };
    } else if (field === 'name') {
      newGuests[index] = { ...newGuests[index], [field]: value };
      
      // Validar nome em tempo real
      const newErrors = [...guestNameErrors];
      if (value.trim() && !validateFullName(value)) {
        newErrors[index] = "Informe nome e sobrenome";
      } else {
        newErrors[index] = "";
      }
      setGuestNameErrors(newErrors);
    } else {
      newGuests[index] = { ...newGuests[index], [field]: value };
    }
    setGuests(newGuests);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.cpf || !formData.attendance) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        setIsSubmitting(false);
        return;
      }

      if (!validateFullName(formData.name)) {
        alert("Por favor, informe seu nome completo (nome e sobrenome).");
        setIsSubmitting(false);
        return;
      }

      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      const rsvpData: Omit<SupabaseRSVP, 'id' | 'created_at'> = {
        name: firstName,
        last_name: lastName,
        whatsapp: formData.whatsapp,
        cpf: formData.cpf,
        attendance: formData.attendance,
        message: formData.message || undefined
      };

      const result = await RSVPService.createRSVP(rsvpData);
      
      if (result) {
        // Se há acompanhantes e o convidado vai participar, salvar os acompanhantes
        if (formData.attendance === 'sim' && guestCount > 0) {
          // Validar dados dos acompanhantes
          for (let i = 0; i < guests.length; i++) {
            const guest = guests[i];
            if (!guest.name || !guest.cpf) {
              alert(`Por favor, preencha todos os campos obrigatórios do acompanhante ${i + 1}.`);
              setIsSubmitting(false);
              return;
            }
            if (!validateFullName(guest.name)) {
              alert(`Por favor, informe o nome completo do acompanhante ${i + 1} (nome e sobrenome).`);
              setIsSubmitting(false);
              return;
            }
          }

          // Preparar dados dos acompanhantes para salvar
          const guestData = guests.map(guest => {
            const nameParts = guest.name.trim().split(/\s+/);
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ");
            
            return {
              rsvp_id: result.id!,
              name: firstName,
              last_name: lastName,
              whatsapp: guest.whatsapp || formData.whatsapp, // Usar WhatsApp do convidado principal se não informado
              cpf: guest.cpf
            };
          });

          const guestResult = await GuestService.createGuests(guestData);
          
          if (!guestResult) {
            alert("RSVP criado, mas houve erro ao salvar os acompanhantes. Tente novamente.");
            setIsSubmitting(false);
            return;
          }
        }

        setShowSuccess(true);
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        alert("Erro ao salvar sua confirmação. Tente novamente.");
      }

    } catch (error) {
      console.error("Erro ao salvar confirmação:", error);
      alert("Erro ao salvar sua confirmação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header title="Confirmação de Presença" />
        <div className="flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Confirmação Enviada!
              </h1>
              <p className="text-gray-600 mb-6">
                Obrigada por confirmar sua presença/ausência! Estamos muito animados para celebrar este momento.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-800 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Redirecionando para a pagina inicial...
              </p>
            </div>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <Header title="Confirmação de Presença" />
      
      <main className="px-4 py-4 sm:py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${
                      nameError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-gray-500'
                    }`}
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>
                {nameError && (
                  <p className="text-red-500 text-sm mt-1">{nameError}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Digite seu nome e sobrenome completos
                </p>
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleWhatsAppChange(e.target.value)}
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                  CPF *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleCPFChange(e.target.value)}
                    maxLength={14}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Necessario para organizacao do evento
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Você vai participar do chá de cozinha? *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="attendance"
                      value="sim"
                      checked={formData.attendance === "sim"}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        attendance: e.target.value as "sim" | "nao" 
                      }))}
                      className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                    />
                    <span className="ml-3 text-gray-700">
                      Sim, estarei presente!
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="attendance"
                      value="nao"
                      checked={formData.attendance === "nao"}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        attendance: e.target.value as "sim" | "nao" 
                      }))}
                      className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                    />
                    <span className="ml-3 text-gray-700">
                      Infelizmente não poderei ir
                    </span>
                  </label>
                </div>
              </div>

              {/* Seção de Acompanhantes - só aparece se a pessoa vai comparecer */}
              {formData.attendance === "sim" && (
                <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quantos acompanhantes você trará?
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => handleGuestCountChange(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value={0}>Apenas eu</option>
                    <option value={1}>Eu + 1 acompanhante</option>
                    <option value={2}>Eu + 2 acompanhantes</option>
                    <option value={3}>Eu + 3 acompanhantes</option>
                    <option value={4}>Eu + 4 acompanhantes</option>
                  </select>

                  {/* Formulário dos Acompanhantes */}
                  {guestCount > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Dados dos Acompanhantes
                      </h3>
                      {guests.map((guest: GuestForm, index: number) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">
                            Acompanhante {index + 1}
                          </h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome Completo *
                              </label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                  type="text"
                                  value={guest.name}
                                  onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${
                                    guestNameErrors[index] 
                                      ? "border-red-300 focus:ring-red-500" 
                                      : "border-gray-200 focus:ring-gray-500"
                                  }`}
                                  placeholder="Nome do acompanhante"
                                />
                              </div>
                              {guestNameErrors[index] && (
                                <p className="text-red-500 text-sm mt-1">{guestNameErrors[index]}</p>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  WhatsApp
                                </label>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  <input
                                    type="tel"
                                    value={guest.whatsapp}
                                    onChange={(e) => handleGuestChange(index, 'whatsapp', e.target.value)}
                                    maxLength={15}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="(11) 99999-9999"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  CPF *
                                </label>
                                <div className="relative">
                                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  <input
                                    type="text"
                                    value={guest.cpf}
                                    onChange={(e) => handleGuestChange(index, 'cpf', e.target.value)}
                                    maxLength={14}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="000.000.000-00"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem (Opcional)
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                    placeholder="Deixe uma mensagem carinhosa para os noivos..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-800 text-white py-3 sm:py-4 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    <span>Confirmar Presença</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
      
      <div className="h-4 sm:h-8"></div>
      <Navigation />
    </div>
  );
}