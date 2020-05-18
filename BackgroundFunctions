function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [ {name: "Atualizar tarefas", functionName: "UpdateAll"}];
  ss.addMenu("ClickUp", menuEntries); }

function onEdit(e) { var activeCell = e.range;
                     var r = activeCell.getRow();
                     var c = activeCell.getColumn();
                     var ss_name = activeCell.getSheet().getName();

                    if (ss_name == "Essa semana" && r==2 && c==2 || r==2 && c==5){
                      
                     var semana_ss = SpreadsheetApp.getActive().getSheetByName("Essa semana");
                     var lr1 = semana_ss.getLastRow();
                       
                       semana_ss.getRange(6, 2, 1000, 9).setBorder(false, false, false, false, false, false);
                       semana_ss.getRange(6, 2, lr1-5, 9).setBorder(true, true, true, true, true, true);} }

function onSelectionChange(e) { var activeCell = e.range;
                                var r = activeCell.getRow();
                                var c = activeCell.getColumn();
                                var ss_name = activeCell.getSheet().getName();
                               
                               if(ss_name == "Tarefas" && r==1 && c==1) {
                                 
                                 var semana_ss = SpreadsheetApp.getActive().getSheetByName("Essa semana");
                                 var lr1 = semana_ss.getLastRow();
                       
                                 semana_ss.getRange(6, 2, 1000, 7).setBorder(false, false, false, false, false, false);
                                 semana_ss.getRange(6, 2, lr1-5, 7).setBorder(true, true, true, true, true, true);}
                     
                                 var atrasos_ss = SpreadsheetApp.getActive().getSheetByName("Atrasadas");
                                 var lr2 = atrasos_ss.getLastRow();
                       
                                 atrasos_ss.getRange(5, 2, 1000, 9).setBorder(false, false, false, false, false, false);
                                 atrasos_ss.getRange(5, 2, lr2-4, 9).setBorder(true, true, true, true, true, true);} 
