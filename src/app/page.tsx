"use client";

import React from 'react';
import Link from 'next/link';
import { Gift, Calendar, MapPin, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { EventService } from '@/services/eventService';

export default function Home() {
  const [eventDetails, setEventDetails] = React.useState({
    date: '',
    time: '',
    location: '',
    address: ''
  });
  const [loading, setLoading] = React.useState(true);

  // Função para formatar data no formato brasileiro
  const formatBrazilianDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      
      const dayOfWeek = daysOfWeek[date.getDay()];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${dayOfWeek}, ${day} de ${month} de ${year}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  };

  // Função para formatar horário no formato brasileiro
  const formatBrazilianTime = (timeString: string): string => {
    if (!timeString) return '';
    
    try {
      // Se já está no formato "HH:MM", usar diretamente
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const formattedHours = hours.padStart(2, '0');
        const formattedMinutes = minutes.padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}h`;
      }
      
      // Se for uma string de horário diferente, tentar parsear
      const date = new Date(`2000-01-01T${timeString}`);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}h`;
    } catch (error) {
      console.error('Erro ao formatar horário:', error);
      return timeString;
    }
  };

  React.useEffect(() => {
    const loadEventDetails = async () => {
      try {
        setLoading(true);
        // Simular carregamento de dados
        setTimeout(async () => {
          const details = await EventService.getEventInfo();
          if (details) {
            setEventDetails({
              date: details.event_date,
              time: details.event_time,
              location: details.event_location,
              address: details.additional_info || ''
            });
          }
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading event details:', error);
        setLoading(false);
      }
    };

    loadEventDetails();
  }, []);

  // Tela de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Chá de Cozinha
            </h1>
            <p className="text-2xl text-gray-600">
              Carol & Yuri
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Loading skeleton para convite */}
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>

            {/* Loading skeleton para detalhes do evento */}
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              
              {/* Skeleton para cards de detalhes */}
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading indicator */}
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 text-gray-600">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span>Carregando informações do evento...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="text-center py-12 px-4 sm:py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Chá de Cozinha
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600">
          Carol & Yuri
        </p>
      </header>

      <section className="px-4 mb-6 sm:mb-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <p className="text-gray-700 text-center leading-relaxed text-sm sm:text-base">
            Queridos familiares e amigos, é com muito carinho que os convidamos para celebrar 
            conosco este momento especial. Sua presença é o nosso maior presente!
          </p>
        </div>
      </section>

      <section className="px-4 mb-6 pb-24 sm:mb-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">
            Detalhes do Evento
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">Data</p>
                  <p className="text-gray-600 text-sm sm:text-base">{formatBrazilianDate(eventDetails.date)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">Horário</p>
                  <p className="text-gray-600 text-sm sm:text-base">{formatBrazilianTime(eventDetails.time)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">Local</p>
                  <p className="text-gray-600 text-sm sm:text-base">{eventDetails.location}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{eventDetails.address}</p>
                </div>
              </div>
            </div>

            <Link href="/presentes" className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-gray-50 transition-colors shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    <div>
                      <p className="font-medium text-gray-800 text-sm sm:text-base">Lista de Presentes</p>
                      <p className="text-xs sm:text-sm text-gray-600">Veja nossa lista de desejos</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 text-lg">›</div>
                </div>
              </div>
            </Link>

            <Link href="/confirmacao" className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-gray-50 transition-colors shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    <div>
                      <p className="font-medium text-gray-800 text-sm sm:text-base">Confirmar Presença</p>
                      <p className="text-xs sm:text-sm text-gray-600">RSVP até 12 de Novembro</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 text-lg">›</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Navigation />
    </div>
  );
}
