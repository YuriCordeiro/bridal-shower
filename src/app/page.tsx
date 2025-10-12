import React from 'react';
import Link from 'next/link';
import { Gift, Calendar, MapPin, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Chá de Cozinha
        </h1>
        <p className="text-2xl text-gray-600">
          Carol & Yuri
        </p>
      </header>

      <section className="px-4 mb-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-700 text-center leading-relaxed">
            Queridos familiares e amigos, é com muito carinho que os convidamos para celebrar 
            conosco este momento especial. Sua presença é o nosso maior presente!
          </p>
        </div>
      </section>

      <section className="px-4 mb-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Detalhes do Evento
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800">Data</p>
                  <p className="text-gray-600">15 de Março, 2024</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800">Horário</p>
                  <p className="text-gray-600">14:00 às 18:00</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800">Local</p>
                  <p className="text-gray-600">Casa da Vovó Maria</p>
                  <p className="text-sm text-gray-500">Rua das Flores, 123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-md mx-auto space-y-3">
          <Link href="/presentes" className="block">
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Gift className="w-6 h-6 text-gray-700" />
                  <div>
                    <p className="font-medium text-gray-800">Lista de Presentes</p>
                    <p className="text-sm text-gray-600">Veja nossa lista de desejos</p>
                  </div>
                </div>
                <div className="w-6 h-6 text-gray-400">›</div>
              </div>
            </div>
          </Link>

          <Link href="/confirmacao" className="block">
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-gray-700" />
                  <div>
                    <p className="font-medium text-gray-800">Confirmar Presença</p>
                    <p className="text-sm text-gray-600">RSVP até 10 de Março</p>
                  </div>
                </div>
                <div className="w-6 h-6 text-gray-400">›</div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <Navigation />
    </div>
  );
}
