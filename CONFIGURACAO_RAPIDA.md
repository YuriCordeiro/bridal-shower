# ⚡ Configuração Rápida do Supabase

## 🎯 Próximos Passos Obrigatórios

### 1. Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e chave anônima

### 2. Configurar variáveis de ambiente
Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 3. Executar SQL no Supabase
1. Vá para **SQL Editor** no painel Supabase
2. Cole e execute o conteúdo do arquivo `supabase-schema.sql`

### 4. Testar a aplicação
1. Execute `npm run dev`
2. Teste a confirmação de presença
3. Acesse a área admin e verifique os dados

## ✅ O que já está pronto

- ✅ Cliente Supabase configurado
- ✅ Serviços para RSVPs, Presentes, Eventos e Mensagens
- ✅ Página de confirmação integrada
- ✅ Painel admin parcialmente integrado
- ✅ Tipos TypeScript compatíveis
- ✅ Fallback para localStorage
- ✅ Documentação completa

## 🔧 Funcionalidades Disponíveis

### Para os Convidados:
- Confirmação de presença salva no Supabase
- Campos: nome, telefone, WhatsApp, CPF, mensagem
- Validação automática

### Para os Administradores:
- Visualização de todas as confirmações
- Gerenciamento de lista de presentes
- Estatísticas em tempo real
- Exclusão e edição de dados

## 📋 Estrutura do Banco

**Tabelas criadas automaticamente:**
- `rsvps` - Confirmações de presença
- `gifts` - Lista de presentes
- `event_info` - Informações do evento
- `messages` - Mensagens aos noivos

## 🆘 Se algo não funcionar

1. **Verifique as variáveis de ambiente**
2. **Confirme que o SQL foi executado**
3. **Veja o console do navegador para erros**
4. **Use localStorage como fallback temporário**

---

**📖 Para mais detalhes, consulte: `SUPABASE_SETUP.md`**