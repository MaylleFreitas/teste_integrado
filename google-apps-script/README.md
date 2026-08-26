# Integração com Google Sheets via Google Apps Script

Este arquivo documenta a infraestrutura de backend sem servidor (serverless) utilizada pela aplicação estática no GitHub Pages.

---

## 📋 Como Configurar em 3 Minutos:

1. Abra o [Google Planilhas](https://sheets.new) e crie uma nova planilha vazia.
2. No menu superior da planilha, vá em: **Extensões** > **Apps Script**.
3. Apague todo o conteúdo do editor e cole o código do arquivo `google-apps-script/Code.gs`.
4. Clique no ícone de disquete (**Salvar**).
5. Clique no botão azul **Implantar** (canto superior direito) > **Nova implantação**.
6. Clique no ícone de engrenagem ao lado de "Selecione o tipo" e escolha **App da Web** (Web app).
7. Preencha as opções:
   - **Descrição**: `API Experimento Percepção`
   - **Executar como**: `Eu` (seu e-mail)
   - **Quem tem acesso**: `Qualquer pessoa` (*Anyone*)
8. Clique em **Implantar**, autorize o acesso à sua conta Google e copie a **URL do app da Web** gerada (termina com `/exec`).

---

## 🔗 Como Conectar à Aplicação no GitHub Pages:

Você pode fornecer a URL de duas formas:
- **Opção A (Recomendada via Link)**: Compartilhe o link do GitHub Pages com o parâmetro:
  `https://seu-usuario.github.io/seu-repositorio/?scriptUrl=SUA_URL_DO_APPS_SCRIPT_AQUI`
- **Opção B (Variável de Ambiente)**: Configure no arquivo `.env`:
  `VITE_APPS_SCRIPT_URL=SUA_URL_DO_APPS_SCRIPT_AQUI`

---

## 📊 Abas Criadas Automaticamente na Planilha:

1. **`Configurações`**:
   - `status`: Mude para `fechado` a qualquer momento para suspender o questionário e bloquear novas respostas, ou `aberto` para aceitar participantes.
   - `tituloPesquisa`: Nome oficial do projeto.
   - `mensagemFechado`: Mensagem exibida aos participantes caso o questionário esteja encerrado.
2. **`Perguntas`**:
   - Armazena as amostras de áudio das seções (`pares_audio` e `mapa`).
   - Você pode adicionar novas linhas, editar URLs e descrições diretamente na planilha.
3. **`Respostas`**:
   - Cada linha representa um participante.
   - Registra todos os dados sociodemográficos, respostas de escala, coordenadas de clique no mapa e **a ordem exata em que as questões foram randomizadas e exibidas** para controle estatístico de efeito de ordem.
