function UpdateAll() {

  // ATUALIZAR TAREFAS
  
  var ss = SpreadsheetApp.getActive().getSheetByName("Tarefas");
  
  // armazenar todas as células da planilha em um array
  var lr_i = ss.getLastRow();
  var data = ss.getRange(3, 1, lr_i, 10).getValues();
  
  // criar o array no qual as informações da url serão armazenadas
  var base = [];
  
  // inserir aqui as informações do url, como time, espaço e token:
  
  var TOKEN = getToken();
  var TEAM_ID = getTeamID();
  var SPACE_ID = getSpaceID();
  var URL_before = "https://api.clickup.com/api/v2/team/"+ TEAM_ID + "/task?space_ids%5B%5D=" + SPACE_ID + "&subtasks=true&include_closed=true&order_by=updated&date_updated_lt=";
  var URL_after = "&statuses%5B%5D=parada&statuses%5B%5D=por%20vir&statuses%5B%5D=entregue&statuses%5B%5D=em%20andamento&statuses%5B%5D=atrasada";
  
  // pegar a data de agora
  var last_update = new Date().getTime();
  
  do { // aqui vamos puxar bloco por bloco de 100 tarefas e concatená-las em um array, esse array (com todos os blocos) será usado para as operações
    
  // define o url final do qual puxar os dados da API
  var API_URL = (URL_before + last_update + URL_after);
  // cabeçalho do request da url
  var options = {headers: {Authorization: TOKEN}}
  
  // aqui vamos puxar os dados da API e converte-los para um formato adequado de processamento
  var response = UrlFetchApp.fetch(API_URL, options);
  var tasks = JSON.parse((response.getContentText()));
  var tasks_block = tasks["tasks"];
  var base = base.concat(tasks_block);
    
  // pega a data de atualização mais antiga do bloco como referência para a próxima iteração  
  var last_update = tasks_block[tasks_block.length - 1].date_updated;
  
      } while (tasks_block.length == 100); // Aqui definimos que quando o bloco possuir menos de 100 tarefas, ele será o último a ser iterado
    
  // pega os dados da planilha de subsistemas e IDs
  var ss_ids = SpreadsheetApp.getActive().getSheetByName("IDs");
  var lr_ids = ss_ids.getLastRow();
  var id_data = ss_ids.getRange(3, 1, lr_ids, 2).getValues();
  var new_data = id_data.map(function(r){ return r[1];})
  
  // pega os dados de data de início
  var ss_ids = SpreadsheetApp.getActive().getSheetByName("IDs");
  function filterCache(row) { if (row[0] == null || row[0] == "") { return false; } else { return true; };} // remove linhas em branco
  var cache = ss_ids.getRange(3, 15, ss_ids.getLastRow(), 2).getValues();
  var cache = cache.filter(filterCache);
  function ids(row){return row[0].toString();}
  var cache_ids = cache.map(ids);
  
  // essa função pega os dados do url (dados brutos) e retorna um array com as informações mais relevantes
  function getUrlData(task) {      
    
    var n = task.name;
    var ns = n.split(" ")[0];
    var nss = n.split(ns + " ")[1];
    if (isNaN(ns)){ var name = n; var code = ""} else { var name = nss; var code = ns; }
    
    var task_id = task.id;
    var status = task.status.status;
    
    var subsystem_id = task.project.id;
        var looking_for = parseInt(subsystem_id);
        var index = new_data.indexOf(looking_for);
        var subsystem = id_data[index][0];
    
    var date_upt = new Date(task.date_updated * 1);
    if (task.due_date == null){var due_date = "";} else {var due_date = new Date(task.due_date * 1);}
    if (task.date_closed == null){var date_closed = "";} else {var date_closed = new Date(task.date_closed * 1);}
    if (task.start_date == null){var start_date = "";} else {var start_date = new Date(task.start_date * 1);}
    var creator = task.creator.username;
    var assignees = task["assignees"];
    if (assignees[0] == undefined){var assignees_usernames = null;}
    else {function mapAssignee(assignee) {return assignee.username}
    var assignees_usernames = assignees.map(mapAssignee); }
    
    if (task.status.status != "entregue" && task.due_date != null){
      var today = new Date(new Date().getTime()).valueOf();
      var due = new Date(task.due_date * 1).valueOf();
      var delay = Math.floor((today-due)/(24*60*60*1000));}
    else { var delay = ""; }
    
    var looking_for = task_id.toString();
    var index = cache_ids.indexOf(looking_for);
    if (index > -1){ var start = cache[index][1]} else { var start = ""};
    
    return [name, status, subsystem, task_id, date_upt, start_date, due_date, assignees_usernames, date_closed, delay, start, code]; }
  
  // array com todos os dados relevantes das tarefas
  var url_data = base.map(getUrlData);
  
  // essa função permite que o programa trate de forma diferente tarefas novas (criadas recentemente) e tarefas que somente trocaram de status
  // essa função ainda não é usada no programa, mas tem potencial de realizar operações mais sofisticadas no futuro
  function changeCode(row) {
    
    var tasks_ids = data.map(function(r){ return r[3];})
    var task_id_index = tasks_ids.indexOf(row[3]);
    
    if (task_id_index > -1) {                        
      if (data[task_id_index][1] != row[1]) { } //Insira aqui o que fazer quando a tarefa alterar de status 
    } else { } } //Insira aqui o que fazer quando a tarefa for nova
  
  // plota todos os dados na planilha 
  ss.getRange(3, 1, url_data.length, url_data[0].length).setValues(url_data); 
  
  // ATUALIZAR ATRASOS
    
  // armazenar todas as células da planilha em um array
  var lr_i = ss.getLastRow();
  var data = ss.getRange(3, 1, lr_i, 10).getValues();

  function mapDelay(task) { if (task[9] > 0) { var id = task[3]} return id;}
  var delayed_ids = data.map(mapDelay);
  
  function filterLogic(row) { if (row == null) { return false; } else { return true; };} 
  var filtered_ids = delayed_ids.filter(filterLogic);
  
  var array_final = [];
  
  for (var i = 0; i < filtered_ids.length; i++) {
    var array_tarefa = []; 
    var array_motivo = [];
    var array_descricao = [];
    
    var ID = filtered_ids[i];
    var URL_1 = "https://api.clickup.com/api/v2/task/" + ID + "/comment";
    
    var response = UrlFetchApp.fetch(URL_1, options);
    var comments = JSON.parse((response.getContentText()));
    var comment_text = comments["comments"];
    
    for (var j = 0; j < comment_text.length; j++) {
      
      var text = comment_text[j]["comment_text"];
      var string_text = text.toString();
      if (string_text.indexOf("MOTIVO") > -1) { 
          var split1 = text.split(" ")[1];
          var motivo = split1.split(":")[0].toString().toLowerCase();
          var descricao = string_text.split(": ")[1].toString();
          var descricao = descricao.split("\n")[0].toString().toLowerCase();
        
          var array_motivo = array_motivo.concat(motivo);
          var array_descricao = array_descricao.concat(descricao); } }
    
    var array_final = array_final.concat([[ID, array_motivo, array_descricao]]); }
  
  var result = [];
  for (k = 0; k < delayed_ids.length; k++) {
    if (delayed_ids[k] != null) {
      var pos = filtered_ids.indexOf(delayed_ids[k]);
      var row = [array_final[pos][1], array_final[pos][2]];}
    else { var row = [null, null]; }
    var result = result.concat([row]);}
  
  var ss_atrasos = SpreadsheetApp.getActive().getSheetByName("Atrasadas");
  ss_atrasos.getRange(5, 2, 1000, 9).clearContent();
  ss.getRange(3, 13, result.length, 2).setValues(result);
  
  // ATUALIZAR FORMATAÇÃO
  
  var semana_ss = SpreadsheetApp.getActive().getSheetByName("Essa semana");
  var lr1 = semana_ss.getLastRow();
                       
  semana_ss.getRange(6, 2, 1000, 9).setBorder(false, false, false, false, false, false);
  semana_ss.getRange(6, 2, lr1-5, 9).setBorder(true, true, true, true, true, true);

  var lr2 = ss_atrasos.getLastRow();
                       
  ss_atrasos.getRange(5, 2, 1000, 9).setBorder(false, false, false, false, false, false);
  ss_atrasos.getRange(5, 2, lr2-4, 9).setBorder(true, true, true, true, true, true); 
  
  SpreadsheetApp.getActiveSpreadsheet().toast('O dashboard foi atualizado com sucesso', 'ClickUp'); } 
