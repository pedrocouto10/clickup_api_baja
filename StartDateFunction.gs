function dailyStart() {
  
  var ss_ids = SpreadsheetApp.getActive().getSheetByName("IDs");
  var lr = ss_ids.getLastRow();
  var yesterday = ss_ids.getRange(3, 18, lr, 1).getValues();
  
  // ------------------------------------------------------------------------- PARTE UM: plotar as datas de início do dia
  
  var base = [];
  
  var TOKEN = getToken();
  var TEAM_ID = getTeamID();
  var SPACE_ID = getSpaceID();
  var URL_before = "https://api.clickup.com/api/v2/team/"+ TEAM_ID + "/task?space_ids%5B%5D=" + SPACE_ID + "&subtasks=true&include_closed=true&order_by=updated&date_updated_lt=";
  var URL_after = "&statuses%5B%5D=em%20andamento&statuses%5B%5D=entregue";
  
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

function getUrlData(task) { var task_id = task.id; return [task_id]; }

// array com todos os ids das tarefas em andamento
  var em_andamento_tasks = base.map(getUrlData);
  
// pega a data de ontem (para adicionar como data de início)
  var hoje = new Date();
  var dia = parseInt(hoje.getDate())
  hoje.setDate(dia - 1)  

//caso a tarefa em andamento hoje estiver arquivada como por vir ontem, considerar sua data de início como hoje  
function StartDateMachine(task) { var index = yesterday.toString().indexOf(task.toString());
     if (index > -1) { var start = Utilities.formatDate(hoje, "GMT+1", "dd/MM/yyyy"); var id = task.toString()}
     else { var start = null; id = null} return [id, start]; }
  
  var ids_and_starts = em_andamento_tasks.map(StartDateMachine);
  function filterLogic(row) { if (row[0] == null || row[0] == "") { return false; } else { return true; };} 
  var fltr_ids_and_starts = ids_and_starts.filter(filterLogic);
  Logger.log(fltr_ids_and_starts);
  
  //adding the news "doing" tasks to the beginnign of the data list
  var cache = ss_ids.getRange(3, 15, lr, 2).getValues();
  var cache = cache.filter(filterLogic);
  
        //remove duplicated tasks from the "doing" tasks arrays
  function ids(row){return row[0].toString();}
  function removeDup(row){ if (cache.map(ids).indexOf(row[0].toString()) > -1) { return false;} else { return true;};}
  var new_array = fltr_ids_and_starts.filter(removeDup);
  
  var plot = cache.concat(new_array);
 
  //plotting the changes in the spreadsheet
  if (plot.length > 0){ss_ids.getRange(3, 15, plot.length, 2).setValues(plot)};
  
  
  // ------------------------------------------------------------------------- PARTE DOIS: atualizar o backlog de tarefas
  
  // criar o array no qual as informações da url serão armazenadas
  var base = [];
  
  // inserir aqui as informações do url, como time, espaço e token:
  var URL_before = "https://api.clickup.com/api/v2/team/"+ TEAM_ID + "/task?space_ids%5B%5D=" + SPACE_ID + "&subtasks=true&include_closed=true&order_by=updated&date_updated_lt=";
  var URL_after = "&statuses%5B%5D=por%20vir";
  
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

function getUrlData(task) { var task_id = task.id; return [task_id]; }

// array com todos os ids das tarefas por_vir do dia de hoje
  var por_vir_tasks = base.map(getUrlData);

  var ss_ids = SpreadsheetApp.getActive().getSheetByName("IDs");
  ss_ids.getRange(3, 18, 2000, 1).clearContent(); 
  ss_ids.getRange(3, 18, por_vir_tasks.length, 1).setValues(por_vir_tasks); 
  
// ------------------------------------------------------------------------- FINAL
  

}
