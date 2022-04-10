/*
▓█████▄  ██▀███           ▒█████  
▒██▀ ██▌▓██ ▒ ██▒        ▒██▒  ██▒
░██   █▌▓██ ░▄█ ▒        ▒██░  ██▒
░▓█▄   ▌▒██▀▀█▄          ▒██   ██░
░▒████▓ ░██▓ ▒██▒ ██▓    ░ ████▓▒░
 ▒▒▓  ▒ ░ ▒▓ ░▒▓░ ▒▓▒    ░ ▒░▒░▒░ 
 ░ ▒  ▒   ░▒ ░ ▒░ ░▒       ░ ▒ ▒░ 
 ░ ░  ░   ░░   ░  ░      ░ ░ ░ ▒  
   ░       ░       ░         ░ ░  
 ░                 ░              
 */

const MOD_NAME = "destructibles";

const FLAG_DMG = 'damages';
const FLAG_IMAGES = 'images';

function Lang(k){
  return game.i18n.localize("DESTRUCTIBLES."+k);
}










// Settings:
Hooks.once("init", () => {    
 
});



function createBiEl(){
  let bi = document.createElement('i');
  bi.classList.add('fas');
  bi.classList.add('fa-file-import');
  bi.classList.add('fa-fw');
  return bi;
}


function imageSelector( app, flag_name, title ){
  let data_path = 'flags.'+MOD_NAME+'.'+flag_name;
  
  let grp = document.createElement('div');
  grp.classList.add('form-group');
  let label = document.createElement('label');
  label.innerText = title;  
  let fields = document.createElement('div');
  fields.classList.add('form-fields');
  
  const button = document.createElement("button");
  button.classList.add("file-picker");
  button.type = "button";
  button.title = "Browse Files";
  button.tabindex = "-1";
  button.dataset.target = data_path;
  button['data-type'] = "imagevideo";
  button['data-target'] = data_path;
 
  button.onclick = app._activateFilePicker.bind(app);
  
  let bi = createBiEl()

  const inpt = document.createElement("input");  
  inpt.name = data_path;
  inpt.classList.add("image");
  inpt.type = "text";
  inpt.title = title;
  inpt.placeholder = "path/image.png";
  // Insert the flags current value into the input box  
  if (app.token.getFlag(MOD_NAME, flag_name)){
    inpt.value=app.token.getFlag(MOD_NAME, flag_name);
  }
  
  button.append(bi);

  grp.append(label);
  grp.append(fields);
  
  fields.append(button);
  fields.append(inpt);
  return grp;
}


function createLabel(text){
  const label = document.createElement('label');
  label.textContent = text;
  return label;
}
function createDiv(classes){
  const div = document.createElement('div');
  for (let c of classes){div.classList.add(c);}
  return div;
}

function textBoxConfig(parent, app, flag_name, title, type="number",
                       placeholder=null, default_value=null, step=null)
{  
  parent.append(createLabel(title));
  const input = document.createElement('input');
  input.name = 'flags.'+MOD_NAME+'.'+flag_name;
  input.type = type;  
  if(step) input.step = step;
  if(placeholder) input.placeholder = placeholder;

  if(app.token.getFlag(MOD_NAME, flag_name)){
    input.value=app.token.getFlag(MOD_NAME, flag_name);
  }
  else if(default_value!=null){
    input.value = default_value;
  }
  parent.append(input);
  return input;
}

function createButton(title, text, target){
  const button = document.createElement("button");
  button.classList.add("file-picker");
  button.type = "button";
  button.title = title;
  button.textContent = text?text:"";  
  button.tabindex = "-1";
  button.dataset.target = target;
  button['data-type'] = "imagevideo";
  button['data-target'] = target;
  return button;
}


function remove_row(){
  const app_tab = this.html[0].querySelector("div[data-tab='appearance']");
  app_tab.removeChild(this.row);
  this.app.setPosition();
}


function addrow(){
  console.log(this);
  
  let grp = createDiv(['form-group', "slim"])     
  let label=createLabel('Token')
  
  let fields = createDiv(['form-fields']);  
  const button = createButton("Browse Files", undefined, undefined);
  let bi = createBiEl();

  const inpt = document.createElement("input");  
  //inpt.name = data_path;
  inpt.classList.add("image");
  inpt.type = "text";
  inpt.title = "Dmg";
  inpt.placeholder = "path/image.png";
  inpt.value = (this.img)?this.img:"";
  // Insert the flags current value into the input box  
  
  button.append(bi);  
  grp.append(label);
  
  textBoxConfig(fields, this.app, undefined, 'at', 'number', 50, this.dmg, 1);
  fields.append(button);
  fields.append(inpt);

  let pbut = createButton("Remove Image", '-', undefined)
  pbut.onclick = remove_row.bind({app:this.app, html:this.html, row: grp});

  fields.append(pbut);
  
  grp.append(fields);
  const app_tab = this.html[0].querySelector("div[data-tab='appearance']");
  app_tab.insertBefore(grp, app_tab.children[1]);
  this.app.setPosition();  
}


// Hook into the token config render
Hooks.on("renderTokenConfig", (app, html) => {
  document.MASDF = html[0];
  document.MAPP = app;

  // Create a new form group
  const formGroup = createDiv(['form-group', "slim"])
  // Create a label for this setting  
  formGroup.prepend(createLabel(Lang("title")));

  // Create a form fields container
  const formFields = createDiv(["form-fields"]);
  formGroup.append(formFields);

  const app_tab = html[0].querySelector("div[data-tab='appearance']")
  
  const pbut = document.createElement('button');
  pbut.type = "button";
  pbut.textContent = '+';
  pbut.title = "Add Image";
  pbut.classList.add("file-picker");
  pbut.tabindex = "-1";
  pbut.onclick = addrow.bind({app:app, html:html});
  app_tab.children[0].children[1].append(pbut);
  
  let imgs = app.token.getFlag(MOD_NAME, FLAG_IMAGES);
  let dmgs = app.token.getFlag(MOD_NAME, FLAG_DMG);
  
  imgs = (imgs)?imgs:[];
  dmgs = (dmgs)?dmgs:[];

  let i = 0;
  for(let img of imgs){
    let dmg = (dmgs.length>=i)?dmgs[i]:0;
    addrow.bind({app:app, html:html, img:img, dmg:dmg, row:i})();
  }

  // Add the form group to the bottom of the Identity tab
  //html[0].querySelector("div[data-tab='appearance']").append(formGroup);

  // Set the apps height correctly
  app.setPosition();
});

