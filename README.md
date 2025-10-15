# 💒 Chá de Cozinha - Carol & Yuri

Uma aplicação web moderna e responsiva para gerenciar lista de presentes e confirmações de presença para chá de cozinha.

## 🔐 Resolução do Problema RLS (Row Level Security)

Se você está enfrentando erro 406 no login admin, isso significa que o RLS foi habilitado na tabela `admin_users`. Esta aplicação foi atualizada para usar **autenticação nativa do Supabase** em vez de consultas diretas à tabela.

### ✅ Solução Implementada:
- Sistema de login migrado para `supabase.auth.signInWithPassword()`
- Não depende mais de acesso direto à tabela `admin_users`
- Compatível com políticas RLS rigorosas
- Segurança aprimorada

### 🔧 Como Criar o Primeiro Usuário Admin:

**Opção 1: Via Supabase Dashboard**
1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá para Authentication > Users
3. Clique em "Add user"
4. Use o formato: `admin@admin.local` (ou `seuusername@admin.local`)
5. Defina uma senha segura
6. Salve o usuário

**Opção 2: Via Script (Recomendado)**
```bash
# Execute o script helper
node create-admin.js
```

**Opção 3: Programaticamente**
```javascript
// Use este código no console do navegador na página da aplicação
const { AuthService } = await import('./src/services/authService.ts');
const result = await AuthService.createUser({
  username: 'admin',
  password: 'suaSenhaSegura123'
});
console.log(result);
```

### 🚨 Credenciais de Login:
- **Email:** `admin@admin.local` (ou `username@admin.local`)
- **Senha:** A que você definiu
- **No formulário, use apenas:** `admin` (username sem @admin.local)

## 📱 Funcionalidades

### ✨ **Página Inicial**
- Boas-vindas calorosas para os convidados
- Informações sobre o evento (data e local)
- Navegação rápida para funcionalidades principais
- Design mobile-first e responsivo

### 🎁 **Lista de Presentes**
- Catálogo completo de presentes organizados por categorias
- Filtros por categoria e disponibilidade
- Busca por nome ou descrição
- Sistema de reserva de presentes
- Indicação visual de presentes já reservados

### 📅 **Confirmação de Presença (RSVP)**
- Formulário completo para confirmação de presença
- Coleta de informações dos convidados
- Opção para especificar número de acompanhantes
- Campo para restrições alimentares
- Mensagem especial para a noiva

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React para produção
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Biblioteca de ícones moderna
- **Supabase** - Banco de dados e backend como serviço
- **Prisma** - ORM para banco de dados (preparado para integração)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Configurar Supabase (OBRIGATÓRIO)
# 1. Copie as credenciais do seu projeto Supabase
# 2. Configure o arquivo .env.local
# 3. Execute o script SQL no painel Supabase
# Veja: CONFIGURACAO_RAPIDA.md

# Executar em modo de desenvolvimento
npm run dev

# A aplicação estará disponível em http://localhost:3000
```

### 🗄️ **Configuração do Banco de Dados**
Esta aplicação usa **Supabase** como banco de dados:

1. **Configure seu projeto**: Veja `CONFIGURACAO_RAPIDA.md`
2. **Integração completa**: RSVPs, presentes e mensagens são salvos automaticamente
3. **Fallback offline**: Continua funcionando com localStorage se Supabase não estiver configurado

### Comandos Disponíveis
```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa o linter
```

## 🎨 Design e UX

### Características do Design
- **Mobile-First**: Projetado primeiro para dispositivos móveis
- **Responsivo**: Funciona perfeitamente em todas as telas
- **Acessível**: Seguindo boas práticas de acessibilidade
- **Intuitivo**: Interface clara e fácil de usar

### Paleta de Cores
- Cinza claro (#f8fafc, #f1f5f9)
- Preto principal (#000000, #1f2937)
- Cinza escuro complementar (#374151, #6b7280)
- Tons neutros para texto e elementos

### Navegação
- Barra de navegação fixa na parte inferior (mobile)
- Ícones intuitivos para cada seção
- Indicador visual da página atual

## 📊 Estrutura do Projeto

```
src/
├── app/                    # Páginas da aplicação (App Router)
│   ├── page.tsx           # Página inicial
│   ├── presentes/         # Lista de presentes
│   │   └── page.tsx
│   ├── confirmacao/       # RSVP
│   │   └── page.tsx
│   ├── layout.tsx         # Layout principal
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── Header.tsx         # Cabeçalho
│   ├── Navigation.tsx     # Navegação
│   └── MainLayout.tsx     # Layout comum
├── data/                  # Dados mockados
│   └── gifts.ts          # Lista de presentes
└── types/                 # Definições TypeScript
    └── index.ts          # Interfaces principais
```

## 💾 Preparação para Banco de Dados

A aplicação está preparada para integração com banco de dados utilizando Prisma:

### Próximos Passos para Produção
1. Configurar banco de dados (PostgreSQL, MySQL, etc.)
2. Criar schema Prisma baseado nos tipos TypeScript existentes
3. Implementar API routes para CRUD operations
4. Conectar frontend com as APIs
5. Adicionar autenticação (se necessário)

### Schema Sugerido
```prisma
model Gift {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float?
  imageUrl    String?
  category    String
  isReserved  Boolean  @default(false)
  reservedBy  String?
  reservedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Guest {
  id                   String   @id @default(cuid())
  name                 String
  email                String   @unique
  phone                String?
  willAttend           Boolean?
  numberOfGuests       Int      @default(1)
  dietaryRestrictions  String?
  message              String?
  rsvpAt               DateTime @default(now())
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

## 🔧 Customização

### Personalizando o Conteúdo
- Edite `src/data/gifts.ts` para modificar a lista de presentes
- Atualize as informações do evento em `src/app/page.tsx`
- Modifique cores e estilos no arquivo `tailwind.config.js`

### Adicionando Novas Funcionalidades
- Galeria de fotos do casal
- Página com informações sobre o local
- Sistema de comentários
- Integração com redes sociais
- Notificações por email/WhatsApp

## 📱 Compatibilidade

- ✅ Chrome (versões recentes)
- ✅ Firefox (versões recentes)  
- ✅ Safari (iOS 14+)
- ✅ Edge (versões recentes)
- ✅ Chrome Mobile
- ✅ Safari Mobile

## 🤝 Contribuição

Para melhorar a aplicação:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto foi criado especificamente para o chá de cozinha do casal Carol e do Yuri e pode ser usado como base para eventos similares.

---

**Feito com ❤️ por Yuri, para Carol & Yuri**
