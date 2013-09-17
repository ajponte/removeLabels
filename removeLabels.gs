/*
   * Remove Labels App 
   * Created by Alan Ponte, 7/12/13
   * Last updated 8/27/13
   * This app will remove an existing label from Gmail messages with multiple labels
*/

function doGet() {
  var imageLink = "http://cso.lbl.gov/assets/img/L2/Download_Logo-B.png";
  var user = Session.getEffectiveUser();
  var userName = Session.getActiveUser().getUserLoginId();
  var app = UiApp.createApplication();
  app.setTitle("Remove Gmail Labels");
  // Add the LBL logo to the UI.
  var image = app.createImage(imageLink).setSize(425, 90)
                 .setStyleAttribute("paddingLeft", 50)
                 .setStyleAttribute("paddingTop", 25);
  app.add(image);
  
  // Add a message displaying the active user's login id.
  var loggedInAs = app.createLabel("You are logged in as " + userName)
                      .setStyleAttribute("fontWeight", "bold")
                      .setStyleAttribute("paddingLeft", 50)
                      .setStyleAttribute("paddingTop", 25);
  app.add(loggedInAs);
  
  // Add a panel containg instructions and app info.
   var instructionsPanel = app.createAbsolutePanel().setWidth('600').setId('instructionsPanel')
                             // .setSize(600, 450)
                              .setStyleAttribute("paddingLeft", 50);
   instructionsPanel.add(app.createHTML(
        '<p><h2 style="color:navy"> Remove Labels</h2></p>' 
     
        +'<p><h4> This App lets you remove an existing Gmail label from your messages with multiple labels.'
     + ' The messages will remain in the current label, but the messages will no longer be tied to the label which'
     + ' is removed</h4></p>' ));
  app.add(instructionsPanel);
  
  // Create a grid for placing text fields and labels. 
  var grid = app.createGrid(6,5);
  

  var start_label = "";
  var end_label = "";

  // Place labels and text fields into the grid.  
  
  grid.setWidget(2, 0, app.createLabel('Current label'));
  grid.setWidget(2, 1, app.createTextBox()
                          .setName("currentLabel")
                          .setId("currentLabel").setWidth(250)                 
                 .setStyleAttribute('backgroundColor', 'yellow')
                 .setText(start_label));
  
  grid.setWidget(3, 0, app.createLabel('Label to be removed:'));
  grid.setWidget(3, 1, app.createTextBox()
                          .setName("removedLabel")
                          .setId("removedLabel").setWidth(250)                 
                 .setStyleAttribute('backgroundColor', 'yellow')
                 .setText(end_label));


  var sendNowButton = app.createSubmitButton("Remove Labels!").setId('sendNow');  

  
  // Create a Form to submit
  var inputForm = app.createFormPanel().setStyleAttribute("paddingLeft", 50)
                                       //.setStyleAttribute("paddingTop", 25)
                                       .setId("inputForm");                      
  var flow = app.createFlowPanel().setId('flow');
  flow.add(grid);
  flow.add(sendNowButton);

  flow.add(app.createSimplePanel().setHeight(100));
  inputForm.add(flow);
  app.add(inputForm);
  // Display the UI
  
  return app;  
}

/**
   * The response to the send button
*/

function doPost(event) {
  var app = UiApp.getActiveApplication();
  var send = app.getElementById('sendNow');
  send.setVisible(false);
  // Extract values from the text fields of the inputForm.
  var currentLabel = event.parameter.currentLabel;
  var removedLabel = event.parameter.removedLabel;

  
  // Remove leading or trailing spaces from the inputs.

  currentLabel = removeLeadingTrailingSpaces(currentLabel);
  removedLabel = removeLeadingTrailingSpaces(removedLabel);

  
  ScriptProperties.setProperty('forward_start_label', currentLabel);
  ScriptProperties.setProperty('forward_end_label', removedLabel);
 
  var success =  '<p><h3 style="color:green">' +
                       'Removing labels Complete! Check your labels to confirm '
  
  var successMessage = app.createHTML(success).setStyleAttribute("paddingLeft", 50).setStyleAttribute("paddingTop", 25).setId('success');

    //CALL MAIN FUNCTION
 
    removeLabels(currentLabel, removedLabel);
    app.add(successMessage);

  // Display the UI
  return app;
}

/**
 * Removes leading and trailing spaces (' ') from a string. 
*/
function removeLeadingTrailingSpaces(string) {
  var leading_space = false;
  var trailing_space = false;
  var mystring = string;
  var i = 0;
  if (mystring[0] == " ") { leading_space = true;}
  while (leading_space && i < mystring.length) {
    if (mystring[i] != " ") {
      leading_space = false;
      mystring = mystring.substring(i, mystring.length);
    }
    i++;
  }
  i = mystring.length-1;
  if (mystring[i] == ' ') { trailing_space = true;}
  while (trailing_space && i > 0) {
    if (mystring[i] != " ") {
      trailing_space = false;
      mystring = mystring.substring(0, i + 1);
    }
    i--;
  }
  return mystring;
}

/**
 Checks whether a given Gmail label exists.
*/
function isValidLabel(label) {
  try{
  var folder = removeLeadingTrailingSpaces(label);
  folder = GmailApp.getUserLabelByName(folder);
  }
  catch(err){
    //catch "service invoked too many times" error.
    Utilities.sleep(10000);
  }
  if (!folder) {return false};
  return true;
}


/**
* Main Function:
  * For each messages under given Gmail label, remove the label.
  * The threads will be split in half, and each half will be worked on seperately
    on at a time.
*/

function removeLabels(){
  
  var app = UiApp.getActiveApplication();
  
  var currentLabel = GmailApp.getUserLabelByName (arguments[0]);
  var removedLabel = GmailApp.getUserLabelByName (arguments[1]);
  
  var currentThreads = currentLabel.getThreads();
  var removedThreads = removedLabel.getThreads();
  
  var midPoint = Math.floor(currentThreads.length/2);
  for (var i = 0; i <= midPoint; i++){
    try{
    currentThreads[i].removeLabel (removedLabel);
    }
    
    catch (error){
      Logger.log("The Error :" + error);
    }
    }
   for (var i = midPoint; i <=currentThreads.length; i++){
    try{
    currentThreads[i].removeLabel (removedLabel);
    }
    
    catch (error){
      Logger.log("The Error :" + error);
    }
    }   
}
  
 
