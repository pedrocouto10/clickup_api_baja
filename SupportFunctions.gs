function getUsers() {
  
  var URL = "https://api.clickup.com/api/v1/team"
  var TOKEN = getToken();
  var options = {headers: {Authorization: TOKEN}}
  
  var response = UrlFetchApp.fetch(URL, options);
  var team = JSON.parse((response.getContentText()));
  var users = team["teams"][0]["members"];
  Logger.log(users);
  
  // Essa função pega os dados do url e coloca em um array
  function getUrlData(user) {      
    
    var picture = "=image(" + '"' + user.user.profilePicture + '"' + ";4;25;25)";
    var username = user.user.username;
    var user_id = user.user.id;
    
    return [picture, username, user_id] }
  
  // Array com todos os dados dos usuários
  var url_data = users.map(getUrlData);
  
  var ss = SpreadsheetApp.getActive().getSheetByName("IDs");
  
  ss.getRange(2,4,100,3).clear();
  ss.getRange(2,4,1,3).setValues([["Foto", "Membro", "ID"]]);
  ss.getRange(2,4,1,3).setFontWeight("Bold").setFontColor('white').setBackground('#7b68ee');
  ss.getRange(3, 4, url_data.length, url_data[0].length).setValues(url_data);
  
}

function AtualizarSubsistema() {
  
  var SPACE_ID = getSpaceID();
  var TOKEN = getToken();
  var URL = "https://api.clickup.com/api/v2/space/" + SPACE_ID +"/folder?archived=false"
  var options = {headers: {Authorization: TOKEN}}
  
  var response = UrlFetchApp.fetch(URL, options);
  var folders = JSON.parse((response.getContentText()));
  var folders = folders["folders"];
  
  //Primeiro vamos criar um array (folders_data) com todos os subsistemas e seus IDs
  function getFolders(folder) { return [folder.name, folder.id] }
  var folders_data = folders.map(getFolders);
  
  var ss = SpreadsheetApp.getActive().getSheetByName("IDs")
      ss.getRange(2, 1, 100, 2).clear();
      ss.getRange(2,1,1,2).setValues([["Nome do Subsistema","Código do Subsistema"]]);
      ss.getRange(3,1,1,2).setValues([["Todos","0000000"]]);
      ss.getRange(2,1,1,2).setFontWeight("Bold").setFontColor('white').setBackground('#7b68ee');
      ss.getRange(4, 1, folders_data.length, folders_data[0].length).setValues(folders_data);
  }

function AtualizarAtrasos() { 

  var ss = SpreadsheetApp.getActive().getSheetByName("Tarefas");
  
  // armazenar todas as células da planilha em um array
  var lr_i = ss.getLastRow();
  var data = ss.getRange(3, 1, lr_i, 10).getValues();

  function mapDelay(task) { if (task[9] > 0) { var id = task[3]} return id;}
  var delayed_ids = data.map(mapDelay);
  
  function filterLogic(row) { if (row == null) { return false; } else { return true; };} 
  var filtered_ids = delayed_ids.filter(filterLogic);
  
  var TOKEN = getToken();
  var options = {headers: {Authorization: TOKEN}}
  
  var array_final = [];
  
  for (var i = 0; i < filtered_ids.length; i++) {
    var array_tarefa = []; 
    var array_motivo = [];
    var array_descricao = [];
    
    var ID = filtered_ids[i];
    var URL = "https://api.clickup.com/api/v2/task/" + ID + "/comment";
    
    var response = UrlFetchApp.fetch(URL, options);
    var comments = JSON.parse((response.getContentText()));
    var comment_text = comments["comments"];
    
    for (var j = 0; j < comment_text.length; j++) {
      
      var text = comment_text[j]["comment_text"];
      var string_text = text.toString();
      if (string_text.indexOf("MOTIVO") > -1) { 
          var split1 = text.split(" ")[1];
          var motivo = split1.split(":")[0].toString().toLowerCase();
          var descricao = string_text.split(": ")[1].toString();
        
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
  ss.getRange(3, 11, result.length, 2).setValues(result);
  ss_atrasos.getRange(3, 9, 1, 2).setValues([[ "", ""]]);}
