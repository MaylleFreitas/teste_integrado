/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - EXPERIMENTO DE PERCEPÇÃO AUDITIVA (UNICAMP)
 * Backend para Aplicação Estática no GitHub Pages
 * ==============================================================================
 * 
 * INSTRUÇÕES DE INSTALAÇÃO:
 * 1. Crie uma nova planilha no Google Sheets (ex: "Experimento de Percepção Fonética").
 * 2. No menu superior da planilha, clique em: Extensões > Apps Script.
 * 3. Apague qualquer código existente e cole este script completo.
 * 4. Clique no ícone de disquete (Salvar).
 * 5. Clique no botão azul "Implantar" (Deploy) > "Nova implantação" (New deployment).
 * 6. Em "Selecione o tipo", escolha "App da Web" (Web app).
 * 7. Configure:
 *    - Descrição: "API Experimento Percepção"
 *    - Executar como: "Eu" (seu e-mail do Google)
 *    - Quem tem acesso: "Qualquer pessoa" (Anyone) -> ESSENCIAL para os participantes responderem.
 * 8. Clique em "Implantar", autorize as permissões e COPIE a "URL do app da Web" (termina em /exec).
 * 9. Adicione essa URL ao seu app no GitHub Pages via parâmetro `?scriptUrl=SUA_URL_AQUI` 
 *    ou definindo a variável `VITE_APPS_SCRIPT_URL`.
 */

// Nomes das abas da planilha
var SHEET_CONFIG = "Configurações";
var SHEET_QUESTIONS = "Perguntas";
var SHEET_RESPONSES = "Respostas";

/**
 * Endpoint GET: Recupera configurações e a lista de perguntas/estímulos
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Inicializa abas se não existirem
    ensureSheetsInitialized(ss);
    
    // 1. Ler configurações
    var config = getConfigurations(ss);
    
    // 2. Ler perguntas / estímulos
    var sections = getQuestionsFromSheet(ss);
    
    var output = {
      status: config.status || "aberto",
      config: config,
      sections: sections
    };
    
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    var errorOutput = {
      status: "error",
      message: err.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorOutput))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint POST: Grava as respostas completas do participante com rastreamento da ordem apresentada
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheetsInitialized(ss);
    
    var requestData = JSON.parse(e.postData.contents);
    var session = requestData.session || requestData;
    
    var responseSheet = ss.getSheetByName(SHEET_RESPONSES);
    var socio = session.sociodemographic || {};
    
    // Formatar resumos para leitura direta na planilha
    var audioPairsSummary = "";
    if (session.audioPairResponses && session.audioPairResponses.length > 0) {
      audioPairsSummary = session.audioPairResponses.map(function(r) {
        return r.trialId + ": " + r.differenceScore + "% (Ouvido " + r.listenedAudio1Count + "/" + r.listenedAudio2Count + "x, " + r.timeTakenMs + "ms)";
      }).join("; ");
    }
    
    var mapSummary = "";
    if (session.mapClickResponses && session.mapClickResponses.length > 0) {
      mapSummary = session.mapClickResponses.map(function(r) {
        var x = typeof r.clickX === 'number' ? r.clickX.toFixed(1) : r.clickX;
        var y = typeof r.clickY === 'number' ? r.clickY.toFixed(1) : r.clickY;
        return r.trialId + ": (" + x + "%, " + y + "%)";
      }).join("; ");
    }
    
    // Linha completa de dados
    var newRow = [
      session.sessionId || "part-" + new Date().getTime(),
      session.startTime ? new Date(session.startTime).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR'),
      session.endTime ? new Date(session.endTime).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR'),
      session.tcleAccepted ? "SIM" : "NÃO",
      
      // Rastreamento estatístico de ordem de apresentação
      session.presentedOrderAudioPairsSerialized || JSON.stringify(session.presentedOrderAudioPairs || []),
      session.presentedOrderMapTrialsSerialized || JSON.stringify(session.presentedOrderMapTrials || []),
      
      // Questionário Social
      socio.genero || "",
      socio.generoOutro || "",
      socio.idadeAnosExata || socio.faixaEtaria || "",
      socio.escolaridade || "",
      socio.regiaoOrigem || "",
      
      // Módulo Nordeste
      socio.estadoNordeste || "",
      socio.estadoNordesteOutro || "",
      socio.resideCampinas || "",
      socio.tempoCampinasAnos || socio.tempoCampinas || "",
      socio.idadeChegadaCampinasAnos || socio.idadeChegadaCampinas || "",
      
      // Módulo Sudeste
      socio.eDeCampinasSudeste || "",
      socio.residiuOutrosLocaisSudeste || "",
      socio.residiuOutrosLocaisInfanciaSudeste || "",
      socio.outrosLocaisDetalhesSudeste || "",
      
      // Outros locais & Classificação
      socio.residiuOutrosLocais || "",
      socio.outrosLocaisDetalhes || "",
      socio.classificacaoMigratoria || "",
      
      // Resumos das Seções Experimentais
      audioPairsSummary,
      mapSummary,
      socio.comentariosExperimento || "",
      
      // JSON completo
      session.fullJson || JSON.stringify(session)
    ];
    
    responseSheet.appendRow(newRow);
    
    var successOutput = {
      status: "success",
      message: "Respostas gravadas com sucesso.",
      sessionId: session.sessionId
    };
    
    return ContentService.createTextOutput(JSON.stringify(successOutput))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    var errOutput = {
      status: "error",
      message: "Erro ao gravar respostas: " + err.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errOutput))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Lê e retorna as configurações da aba "Configurações"
 */
function getConfigurations(ss) {
  var configSheet = ss.getSheetByName(SHEET_CONFIG);
  var values = configSheet.getDataRange().getValues();
  var config = {
    status: "aberto",
    tituloPesquisa: "Experimento de Percepção Auditiva",
    instituicao: "Universidade Estadual de Campinas (UNICAMP)",
    mensagemFechado: "Esta pesquisa foi encerrada e não está mais recebendo novas respostas. Agradecemos pelo seu interesse!",
    contatoPesquisador: "contato.experimento.linguistica@unicamp.br"
  };
  
  // Linha 1 é cabeçalho (Chave | Valor)
  for (var i = 1; i < values.length; i++) {
    var key = String(values[i][0] || "").trim();
    var val = String(values[i][1] || "").trim();
    if (key) {
      config[key] = val;
    }
  }
  
  return config;
}

/**
 * Lê as perguntas e estímulos da aba "Perguntas" organizadas por seção
 */
function getQuestionsFromSheet(ss) {
  var qSheet = ss.getSheetByName(SHEET_QUESTIONS);
  var values = qSheet.getDataRange().getValues();
  
  var audioPairs = [];
  var mapTrials = [];
  
  // Headers: Seção | ID | Titulo/Palavra | Audio1_URL | Audio2_URL | Descricao | Regiao_Origem
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var section = String(row[0] || "").toLowerCase().trim();
    var id = String(row[1] || "").trim();
    var title = String(row[2] || "").trim();
    var audio1 = String(row[3] || "").trim();
    var audio2 = String(row[4] || "").trim();
    var desc = String(row[5] || "").trim();
    var region = String(row[6] || "").trim();
    
    if (!id && !title && !audio1) continue;
    
    if (section === "pares_audio" || section === "audio_pairs" || section === "percepcao") {
      audioPairs.push({
        id: id || "pair-" + i,
        pairIndex: audioPairs.length + 1,
        title1: "Gravação 1",
        title2: "Gravação 2",
        speechText1: title,
        speechText2: title,
        audio1Url: audio1,
        audio2Url: audio2,
        description: desc || 'Combinação da palavra "' + title + '"',
        phoneticNotes: desc
      });
    } else if (section === "mapa" || section === "map" || section === "geolocalizacao") {
      mapTrials.push({
        id: id || "map-" + i,
        trialIndex: mapTrials.length + 1,
        title: title || "Amostra de Fala " + (mapTrials.length + 1),
        speechText: title,
        audioUrl: audio1,
        originRegion: region || "Sudeste",
        accentLabel: region || "Sudeste"
      });
    }
  }
  
  return {
    audioPairs: audioPairs,
    mapTrials: mapTrials
  };
}

/**
 * Cria e formata as 3 abas automaticamente caso ainda não existam
 */
function ensureSheetsInitialized(ss) {
  // 1. Aba de Configurações
  var configSheet = ss.getSheetByName(SHEET_CONFIG);
  if (!configSheet) {
    configSheet = ss.insertSheet(SHEET_CONFIG);
    configSheet.appendRow(["Chave de Configuração", "Valor da Configuração", "Descrição"]);
    configSheet.appendRow(["status", "aberto", "Defina como 'aberto' para receber respostas ou 'fechado' para suspender a pesquisa"]);
    configSheet.appendRow(["tituloPesquisa", "Experimento de Percepção Auditiva do Português Brasileiro", "Título exibido na interface"]);
    configSheet.appendRow(["instituicao", "Universidade Estadual de Campinas (UNICAMP)", "Instituição acadêmica responsável"]);
    configSheet.appendRow(["mensagemFechado", "Esta pesquisa foi encerrada e não está mais recebendo novas respostas. Agradecemos pelo seu interesse!", "Mensagem exibida quando status for 'fechado'"]);
    configSheet.appendRow(["contatoPesquisador", "contato.experimento.linguistica@unicamp.br", "E-mail de contato"]);
    
    configSheet.getRange("A1:C1").setBackground("#4F46E5").setFontColor("#FFFFFF").setFontWeight("bold");
    configSheet.setColumnWidth(1, 200);
    configSheet.setColumnWidth(2, 400);
    configSheet.setColumnWidth(3, 300);
  }
  
  // 2. Aba de Perguntas
  var qSheet = ss.getSheetByName(SHEET_QUESTIONS);
  if (!qSheet) {
    qSheet = ss.insertSheet(SHEET_QUESTIONS);
    qSheet.appendRow([
      "Seção (pares_audio / mapa)",
      "ID do Estímulo",
      "Título / Palavra",
      "URL do Áudio 1 (ou Áudio do Mapa)",
      "URL do Áudio 2 (apenas pares)",
      "Descrição / Notas Fonéticas",
      "Região / Estado de Origem"
    ]);
    
    // Seed padrão com as amostras originais
    qSheet.appendRow(["pares_audio", "pair-caixa", "Caixa", "https://www.dropbox.com/scl/fi/i3os1xkcgfez21xcypceg/caixa_a.mp3?rlkey=sxb3j59ihsy7rouvry0n7aqtj&st=c9j8nm0e&raw=1", "https://www.dropbox.com/scl/fi/wi5azgaqp60f0vyihu97d/caixa_ai.mp3?rlkey=m67sbeyes9wmgesjunws27lxu&st=etx5kwee&raw=1", "caixa_a vs caixa_ai", ""]);
    qSheet.appendRow(["pares_audio", "pair-peixe", "Peixe", "https://www.dropbox.com/scl/fi/j0hxeseckdg27u0nqgp08/peixe_e.mp3?rlkey=jpxnrvrdfsj8tpap03k8fkqkq&st=qvf483o6&raw=1", "https://www.dropbox.com/scl/fi/qgtm1k1bbmreyjo0attyg/peixe_ei.mp3?rlkey=ol4g46qolyb5a21yb54udnk89&st=h94jag69&raw=1", "peixe_e vs peixe_ei", ""]);
    qSheet.appendRow(["pares_audio", "pair-pelicula", "Película", "https://www.dropbox.com/scl/fi/1eajet4wzmq7vozkbfptk/pelicula_3.mp3?rlkey=qmifwg6arv2zknezf20cfj5vw&st=ryuiku2z&raw=1", "https://www.dropbox.com/scl/fi/ggn3zjyfqq8snfh6p00ma/pelicula_e.mp3?rlkey=zhv8p00uxcd35oe0hnaj8en4x&st=ijzo8h7u&raw=1", "pelicula_3 vs pelicula_e", ""]);
    qSheet.appendRow(["pares_audio", "pair-porta-1", "Porta", "https://www.dropbox.com/scl/fi/tarwlsrqdqfw3ksk680xy/porta_h.mp3?rlkey=fx0onathtqv31fd9ad9xbcy83&st=g5js7496&raw=1", "https://www.dropbox.com/scl/fi/g5werfnzkrajeo2kh8apx/porta_r.mp3?rlkey=x23a5kzj9oua1ivkrsm360mof&st=j4u6dgak&raw=1", "porta_h vs porta_r", ""]);
    qSheet.appendRow(["pares_audio", "pair-porta-2", "Porta", "https://www.dropbox.com/scl/fi/l0qn37qnhf5hotviq43q3/porta_i.mp3?rlkey=5xmguqpho6m6cdhnd8p5mjq8q&st=1j6kcslm&raw=1", "https://www.dropbox.com/scl/fi/be9f453aer38sa41n0rvc/porta_t.mp3?rlkey=8cgfavg12lijs9438mtxirboz&st=r9ux0v2w&raw=1", "porta_i vs porta_t", ""]);
    
    // Seed mapa
    qSheet.appendRow(["mapa", "map-trial-1", "Porta", "https://www.dropbox.com/scl/fi/tarwlsrqdqfw3ksk680xy/porta_h.mp3?rlkey=fx0onathtqv31fd9ad9xbcy83&st=g5js7496&raw=1", "", "Amostra Sudeste", "Sudeste"]);
    qSheet.appendRow(["mapa", "map-trial-2", "Caixa", "https://www.dropbox.com/scl/fi/i3os1xkcgfez21xcypceg/caixa_a.mp3?rlkey=sxb3j59ihsy7rouvry0n7aqtj&st=c9j8nm0e&raw=1", "", "Amostra Nordeste", "Nordeste"]);
    qSheet.appendRow(["mapa", "map-trial-3", "Peixe", "https://www.dropbox.com/scl/fi/j0hxeseckdg27u0nqgp08/peixe_e.mp3?rlkey=jpxnrvrdfsj8tpap03k8fkqkq&st=qvf483o6&raw=1", "", "Amostra Sudeste", "Sudeste"]);
    qSheet.appendRow(["mapa", "map-trial-4", "Película", "https://www.dropbox.com/scl/fi/ggn3zjyfqq8snfh6p00ma/pelicula_e.mp3?rlkey=zhv8p00uxcd35oe0hnaj8en4x&st=ijzo8h7u&raw=1", "", "Amostra Sul", "Sul"]);
    
    qSheet.getRange("A1:G1").setBackground("#0D9488").setFontColor("#FFFFFF").setFontWeight("bold");
  }
  
  // 3. Aba de Respostas
  var respSheet = ss.getSheetByName(SHEET_RESPONSES);
  if (!respSheet) {
    respSheet = ss.insertSheet(SHEET_RESPONSES);
    respSheet.appendRow([
      "ID da Sessão",
      "Início",
      "Fim",
      "TCLE Aceito",
      "Ordem Apresentada (Pares Áudio)",
      "Ordem Apresentada (Mapa)",
      "Gênero",
      "Gênero (Outro)",
      "Idade (Anos)",
      "Escolaridade",
      "Região de Origem (Infância)",
      "Nordeste - Estado Nascimento",
      "Nordeste - Estado (Outro)",
      "Nordeste - Reside Campinas",
      "Nordeste - Tempo em Campinas",
      "Nordeste - Idade Chegada Campinas",
      "Sudeste - É da RMC",
      "Sudeste - Já Residiu em Outros Lugares",
      "Sudeste - Foi na Infância",
      "Sudeste - Detalhes Outros Locais",
      "Outras Regiões - Residiu Outros Locais",
      "Outras Regiões - Detalhes",
      "Classificação Migratória Derivada",
      "Resumo Respostas (Pares de Áudio)",
      "Resumo Respostas (Mapa)",
      "Comentários do Participante",
      "JSON Bruto Completo da Sessão"
    ]);
    
    respSheet.getRange("A1:AA1").setBackground("#1E293B").setFontColor("#FFFFFF").setFontWeight("bold");
    respSheet.setFrozenRows(1);
  }
}
