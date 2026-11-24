# ConectaPro

Marketplace de profissionais e prestadores de serviços locais (início em Cataguases-MG, pronto para outras cidades).
Next.js 14 + TypeScript + Tailwind + PostgreSQL + Prisma. PWA instalável.

## O que já funciona
Cadastro/login (senha com bcrypt, sessão JWT em cookie httpOnly), busca por cidade/bairro/categoria, perfil público com WhatsApp,
pedido de orçamento com data desejada, avaliações, favoritos, denúncias, painel do profissional (pedidos/agenda, visualizações),
assinaturas Mercado Pago (Profissional R$ 29,90 e Premium R$ 49,90) com webhook, painel admin (aprovação, denúncias, MRR, log de atividades),
Termos, Privacidade, exclusão de conta (LGPD), limitação de requisições, cabeçalhos de segurança e healthcheck.

## Rodar no Windows (CMD)
1. Instale Node 18.18+ e PostgreSQL (ou use um Postgres do Railway).
2. `copy .env.example .env` e preencha `DATABASE_URL`, `AUTH_SECRET` (comando de geração está no arquivo) e `ADMIN_EMAIL`.
3. `npm install`
4. `npx prisma migrate deploy` (cria tabelas, a cidade Cataguases e as 12 categorias)
5. `npm run dev` → http://localhost:3000
6. Cadastre-se com o e-mail igual a `ADMIN_EMAIL`: essa conta vira administradora (/admin).

## Enviar ao GitHub (CMD)
```
git init
git add .
git commit -m "ConectaPro inicial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/conectapro.git
git push -u origin main
```

## Publicar no Railway
1. New Project → Deploy from GitHub repo → escolha o repositório.
2. Add → Database → PostgreSQL.
3. No serviço web, em Variables: `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`, `AUTH_SECRET`, `ADMIN_EMAIL`, `APP_URL` (domínio público, com https), `MP_ACCESS_TOKEN`.
4. Settings → Networking → Generate Domain. O `railway.toml` já define build, migrações (`prisma migrate deploy` na inicialização), `PORT` e healthcheck `/api/health`.

## Mercado Pago
- Assinaturas recorrentes usam a API de *preapproval* (checkout hospedado pelo Mercado Pago; cartão de crédito).
- Cadastre no painel do Mercado Pago o webhook `https://SEU-DOMINIO/api/webhooks/mercadopago` (evento de assinaturas/planos).
- O webhook não confia no corpo recebido: consulta a API oficial pelo id e só então ativa o plano.
- Pix: a API de assinaturas recorrentes é voltada a cartão; confirme na documentação atual quais meios sua conta aceita. Pix avulso mensal exige outra rotina (pagamento + lembrete).

## Testes manuais sugeridos
Cadastro cliente e profissional → login admin aprova o profissional → perfil aparece na busca → cliente pede orçamento, avalia, favorita, denuncia →
painel do profissional mostra o pedido → excluir conta remove tudo. Teste pagamentos com credenciais de teste do Mercado Pago.

## Ainda não implementado (próximas etapas)
Upload de foto/portfólio (hoje há só os campos no banco; use S3/Cloudinary), cadastro de serviços/especialidades e múltiplas cidades por profissional,
status do pedido (aceitar/recusar), anúncios (Premium), gestão de categorias/cidades/usuários e moderação de avaliações pela interface admin,
relatórios avançados e testes automatizados.
