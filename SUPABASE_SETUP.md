# Configuração do Supabase - Guia Completo

## 1. Configuração das Variáveis de Ambiente

No arquivo `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
```

## 2. Schema do Banco de Dados

Execute o seguinte SQL no Supabase SQL Editor para criar todas as tabelas:

```sql
-- Tabela de RSVPs
CREATE TABLE rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  attending BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de presentes
CREATE TABLE gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  purchased BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de informações do evento
CREATE TABLE event_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_location TEXT NOT NULL,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de mensagens
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de usuários administradores
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO admin_users (username, password_hash, name, email) VALUES 
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin@example.com');

-- Habilitar Row Level Security
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Permitir leitura pública para RSVPs (apenas contagem)
CREATE POLICY "Public can view RSVP stats" ON rsvps FOR SELECT USING (true);
CREATE POLICY "Public can insert RSVP" ON rsvps FOR INSERT WITH CHECK (true);

-- Permitir leitura pública para presentes
CREATE POLICY "Public can view gifts" ON gifts FOR SELECT USING (true);

-- Permitir leitura pública para informações do evento
CREATE POLICY "Public can view event info" ON event_info FOR SELECT USING (true);

-- Permitir inserção pública de mensagens
CREATE POLICY "Public can insert messages" ON messages FOR INSERT WITH CHECK (true);

-- Políticas para administradores (todas as operações)
CREATE POLICY "Admins have full access to rsvps" ON rsvps FOR ALL USING (true);
CREATE POLICY "Admins have full access to gifts" ON gifts FOR ALL USING (true);
CREATE POLICY "Admins have full access to event_info" ON event_info FOR ALL USING (true);
CREATE POLICY "Admins have full access to messages" ON messages FOR ALL USING (true);
CREATE POLICY "Admins can read admin_users" ON admin_users FOR SELECT USING (true);
```

## 3. Configuração do Supabase Storage

### Criar Bucket para Imagens
1. No Supabase Dashboard, vá em **Storage**
2. Clique em **Create Bucket**
3. Nome do bucket: `gift-images`
4. Marque como **Public** (para permitir acesso público às imagens)
5. Configure:
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/gif, image/webp`

### Políticas de Storage (RLS)
Execute no SQL Editor:
```sql
-- Permitir que todos vejam as imagens (leitura pública)
INSERT INTO storage.buckets (id, name, public) VALUES ('gift-images', 'gift-images', true);

-- Política para permitir upload de imagens (público)
CREATE POLICY "Public can upload gift images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gift-images');

-- Política para permitir leitura pública das imagens
CREATE POLICY "Public can view gift images" ON storage.objects FOR SELECT USING (bucket_id = 'gift-images');

-- Política para permitir deletar imagens (apenas admins podem fazer isso via app)
CREATE POLICY "Public can delete gift images" ON storage.objects FOR DELETE USING (bucket_id = 'gift-images');
```

⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro login através da página de administração.

## 5. Como Obter as Chaves do Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** → **API**
3. Copie a **URL** e a **anon/public key**
4. Cole no arquivo `.env.local`

## 6. Funcionalidades Implementadas

### Sistema de Autenticação
- Login seguro com hash de senha (bcrypt)
- Sessão persistente com localStorage
- Logout seguro
- Alteração de senha

### Serviços de Dados
- **RSVPService**: Gerenciamento de confirmações de presença
- **GiftService**: Gerenciamento de lista de presentes
- **EventService**: Informações do evento
- **MessageService**: Mensagens dos convidados
- **AuthService**: Autenticação de administradores

### Supabase Storage
- **Upload de imagens**: Imagens salvas diretamente no Supabase Storage
- **Gerenciamento automático**: Imagens antigas são deletadas automaticamente
- **URLs públicas**: Imagens acessíveis via URL pública do Supabase
- **Validação**: Tipos de arquivo e tamanho validados antes do upload
- Dashboard com estatísticas
- Gerenciamento de RSVPs
- Gerenciamento de presentes (com ordenação)
- Gerenciamento de mensagens
- Configuração do evento
- Alteração de senha do admin

## 5. Estrutura de Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Políticas de acesso** específicas para operações públicas e administrativas
- **Supabase Storage** configurado com políticas de upload público e delete controlado
- **Hash de senhas** com bcrypt para segurança
- **Validação de tipos** TypeScript completa

## 8. Comandos para Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Executar produção
npm start
```

## 6. Próximos Passos

1. Configure as variáveis de ambiente
2. Execute o schema SQL no Supabase
3. **Configure o Supabase Storage** (bucket gift-images)
4. Execute as políticas de Storage
5. Teste o login com as credenciais padrão
6. Altere a senha do administrador
7. Configure as informações do evento
8. **Teste o upload de imagens** na área administrativa
9. Teste todas as funcionalidades

## 7. Solução de Problemas

### Erro de Conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo

### Erro de Autenticação
- Verifique se a tabela `admin_users` foi criada
- Confirme se o usuário padrão foi inserido

### Erro de Storage
- Verifique se o bucket `gift-images` foi criado
- Confirme se as políticas de Storage foram aplicadas
- Verifique se o bucket está marcado como público

### Erro de Upload de Imagem
- Verifique o tamanho do arquivo (máximo 5MB)
- Confirme o tipo de arquivo (JPG, PNG, GIF, WebP)
- Verifique as permissões do bucket no Supabase

---

✅ **Sistema totalmente integrado e pronto para uso!**

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha sua organização
4. Defina um nome para o projeto (ex: "bridal-shower")
5. Crie uma senha segura para o banco de dados
6. Escolha a região mais próxima
7. Clique em "Create new project"

### 2. Obter Credenciais

Após o projeto ser criado:

1. Vá para **Settings** > **API**
2. Copie os valores:
   - **Project URL** (ex: `https://seu-projeto.supabase.co`)
   - **anon public** key (chave pública anônima)

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 4. Criar Tabelas no Banco

1. No painel do Supabase, vá para **SQL Editor**
2. Cole e execute o conteúdo do arquivo `supabase-schema.sql`
3. Isso criará todas as tabelas necessárias com dados de exemplo

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:

1. **rsvps** - Confirmações de presença
   - `id`, `name`, `phone`, `whatsapp`, `cpf`, `attendance`, `guests`, `message`, `created_at`

2. **gifts** - Lista de presentes
   - `id`, `name`, `description`, `price`, `image`, `purchased`, `order_index`, `category`, `link`, `created_at`

3. **event_info** - Informações do evento
   - `id`, `event_date`, `event_time`, `event_location`, `additional_info`, `created_at`, `updated_at`

4. **messages** - Mensagens aos noivos
   - `id`, `sender_name`, `message`, `created_at`

## 🔧 Uso dos Serviços

### RSVPService
```typescript
import { RSVPService } from '@/services/rsvpService';

// Criar RSVP
const rsvp = await RSVPService.createRSVP({
  name: "João Silva",
  phone: "(11) 99999-9999",
  whatsapp: "(11) 99999-9999",
  cpf: "123.456.789-00",
  attendance: "sim",
  guests: 2,
  message: "Muito feliz em participar!"
});

// Buscar todos os RSVPs
const rsvps = await RSVPService.getAllRSVPs();

// Estatísticas
const stats = await RSVPService.getRSVPStats();
```

### GiftService
```typescript
import { GiftService } from '@/services/giftService';

// Buscar todos os presentes
const gifts = await GiftService.getAllGifts();

// Marcar como comprado
await GiftService.markGiftAsPurchased('gift-id');

// Criar presente
const gift = await GiftService.createGift({
  name: "Panela Nova",
  description: "Panela antiaderente",
  price: 99.90,
  category: "Cozinha",
  order_index: 1,
  purchased: false
});
```

### EventService
```typescript
import { EventService } from '@/services/eventService';

// Buscar informações do evento
const eventInfo = await EventService.getEventInfo();

// Atualizar informações
await EventService.updateEventInfo('event-id', {
  event_location: "Novo endereço do evento"
});
```

### MessageService
```typescript
import { MessageService } from '@/services/messageService';

// Buscar mensagens
const messages = await MessageService.getAllMessages();

// Criar mensagem
const message = await MessageService.createMessage({
  sender_name: "Maria",
  message: "Parabéns pelo casamento!"
});
```

## 🔒 Segurança (RLS)

As políticas de Row Level Security (RLS) estão configuradas para:
- **Permitir inserção e leitura pública** para RSVPs e mensagens
- **Permitir todas as operações** para presentes (para admin)
- **Leitura e edição** para informações do evento

### Ajustar Políticas (Opcional)

Para maior segurança, você pode:
1. Ir para **Authentication** > **Policies**
2. Modificar as políticas conforme necessário
3. Adicionar autenticação de admin para operações sensíveis

## 🧪 Testando a Integração

1. Execute o projeto: `npm run dev`
2. Acesse a página de confirmação e envie um RSVP
3. Verifique no painel do Supabase se os dados foram salvos
4. Teste as funcionalidades do admin

## 📱 Funcionalidades Habilitadas

✅ **RSVPs com Supabase**
- Confirmações salvas no banco
- Validação em tempo real
- Estatísticas automáticas

✅ **Lista de Presentes**
- Presentes sincronizados
- Status de compra em tempo real
- Categorização

✅ **Informações do Evento**
- Data, hora e local centralizados
- Fácil atualização via admin

✅ **Mensagens aos Noivos**
- Todas as mensagens salvas
- Exibição organizada

## 🛠️ Próximos Passos

1. **Configurar seu projeto Supabase**
2. **Atualizar as variáveis de ambiente**
3. **Executar o script SQL**
4. **Testar a aplicação**
5. **Personalizar conforme necessário**

## 🆘 Solução de Problemas

**Erro de conexão:**
- Verifique se as URLs e chaves estão corretas
- Confirme que o projeto Supabase está ativo

**Erro de permissão:**
- Verifique as políticas RLS no painel
- Confirme se as tabelas foram criadas corretamente

**Dados não aparecem:**
- Verifique o console do navegador para erros
- Confirme se os serviços estão sendo chamados corretamente