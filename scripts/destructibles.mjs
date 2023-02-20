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
const FLAG_ORIGINAL_IMAGE = 'original_image';

const SUPPRESS_OVERLAY = "suppress_overlay";
const SUPPRESS_EFFECTS = "suppress_effects";
// const EMIT_SOUND = "emit_sound";

function Lang(k){
  return game.i18n.localize("DESTRUCTIBLES."+k);
}

async function updateToken(token, hp){
  let token_doc = token;
  if (!hasProperty(token, 'getFlag')) token_doc = token.document;
  let damages = token_doc.getFlag(MOD_NAME, FLAG_DMG);
  let images = token_doc.getFlag(MOD_NAME, FLAG_IMAGES);
  
  if (damages){    
    let v = 101;
    let img = token_doc.getFlag(MOD_NAME, FLAG_ORIGINAL_IMAGE);
    if (img==undefined){
      img =  token.img;
      token_doc.setFlag(MOD_NAME, FLAG_ORIGINAL_IMAGE, img);
    }
    let i = 0;
    let ii = -1;
    for (let dmg of damages){
      dmg = Number(dmg);
      if (dmg>=hp&&v>dmg){
          v = dmg;
          ii = i;
      }
      ++i;
    }
    let target_image = (ii==-1)?img:images[ii];
    console.warn(token);
    if (token.texture.src != target_image){
      await fetch(target_image);
      token_doc.update({img:target_image});
    }
  }
}


Hooks.on('updateActor', (actor, change, options, user_id)=>{

  let val = change.system?.attributes?.hp?.value;
  if (val == undefined) val = change.system?.attributes?.hp?.value;

  if (val != undefined){
    let tk = actor.token;
    let mx = actor.system.attributes.hp.max;
    let hp = 100*val/mx;
    
    /*
    if(hp==0 && game.settings.get(MOD_NAME, EMIT_SOUND) ){
      let sounds = [
      './sound/TP_Pot_Shatter1.wav',
      './sound/TP_Pot_Shatter2.wav',
      './sound/TP_Pot_Shatter3.wav',
      './sound/OOT_Pot_Shatter.wav'
      ];
      let i = Math.floor(Math.random() * 4);
      new Sequence().sound(sounds[i]).play();
    }
    //*/

    let tokens = [];
    if (tk){
      tokens.push(tk);
    }else{
      tokens = canvas.tokens.placeables.filter(t=>actor.id==t.document.actorId);
    }
    for (let token of tokens){
      updateToken(token, hp);
    }
  }
});



Hooks.on('preUpdateToken', (token, change, options, user_id)=>{
  // If configured so, this will stop all effect and overlay icons shown on destructible tokens.  
  //let isDestructible = token.data.flags.destructibles?.images?.length > 0;
  let isDestructible = token.getFlag(MOD_NAME, FLAG_IMAGES)?.length > 0;  

  if (isDestructible){
    if (game.settings.get(MOD_NAME, SUPPRESS_OVERLAY) && change.overlayEffect ){
      return false;
    }
    if (game.settings.get(MOD_NAME, SUPPRESS_EFFECTS) && ( (change.effects?.length) || (change.actorData?.effects?.length) )) {
      return false;
    }
  }
});



// Settings:
Hooks.once("init", () => {    
  game.settings.register(MOD_NAME, SUPPRESS_OVERLAY, {
    name: "Suppress Overlay Icons",
    hint: "Prevent overlay icons on all Destructibles",
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });
  game.settings.register(MOD_NAME, SUPPRESS_EFFECTS, {
    name: "Suppress Effect Icons",
    hint: "Prevent all overlay icons being displayed on Destructibles",
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });

  /*
  game.settings.register(MOD_NAME, EMIT_SOUND, {
    name: "Emit Sound",
    hint: "Emits sounds on destruction",
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });
  */  

  function tokenVidAnim(wrapped, ...args) {
    wrapped(...args);
    let len = this.document.flags?.[MOD_NAME]?.[FLAG_IMAGES]?.length;
    if (len){
      //this.sourceElement.autoplay = false;
      this.sourceElement.loop = false;
    }
  }
  libWrapper.register(MOD_NAME,"Token.prototype.refresh",tokenVidAnim,"WRAPPER");

});



/*       
   _/    _/  _/_/_/   
  _/    _/    _/      
 _/    _/    _/       
_/    _/    _/        
 _/_/    _/_/_/

*/

function createBiEl(){
  let bi = document.createElement('i');
  bi.classList.add('fas');
  bi.classList.add('fa-file-import');
  bi.classList.add('fa-fw');
  return bi;
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

  let v = app.token?.[MOD_NAME]?.[flag_name];
  if(v){
    input.value=app.token.getFlag(MOD_NAME, flag_name);
  } else if(default_value!=null){
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
  let row = this.row;
  if (row===undefined){
    row = 1000 + this.html[0].querySelectorAll('.'+MOD_NAME+'_image').length;
  }
  let flag_name = 'IMAGE'+row;
  let data_path = 'flags.'+MOD_NAME+'.IMAGE'+row;
  
  let grp = createDiv(['form-group', "slim"])     
  let label=createLabel('Token')
  
  let fields = createDiv(['form-fields']);  

  grp.append(label);
  
  let dmg = textBoxConfig(fields, this.app, "DMG."+row, 'at %', 'number', 50, this.dmg, 1);
  let img = textBoxConfig(fields, this.app, flag_name, "Dmg", 'text', 'path/image.png', this.img, undefined);

  dmg.classList.add(MOD_NAME+'_damage');
  img.classList.add(MOD_NAME+'_image');

  const button = createButton("Browse Files", undefined, data_path);
  button.append(createBiEl());
  button.onclick = this.app._activateFilePicker.bind(this.app);

  fields.append(button);

  let pbut = createButton("Remove Image", '-', undefined)
  pbut.onclick = remove_row.bind({app:this.app, html:this.html, row: grp});

  fields.append(pbut);
  
  grp.append(fields);
  const app_tab = this.html[0].querySelector("div[data-tab='appearance']");
  app_tab.insertBefore(grp, app_tab.children[1]);
  this.app.setPosition();
}

function onSubmitHook(event){
  let imgs = this.html[0].querySelectorAll('.'+MOD_NAME+'_image');  
  let dmgs = this.html[0].querySelectorAll('.'+MOD_NAME+'_damage');
  imgs = Array.from(imgs).map(i=>i.value);
  dmgs = Array.from(dmgs).map(i=>i.value);
  console.warn("Writing flags:", imgs, dmgs, this.app.token);  
  // New v10 shim
  let t =  (this.app.token ?? this.app.object);
  t.setFlag(MOD_NAME, FLAG_IMAGES, imgs);
  t.setFlag(MOD_NAME, FLAG_DMG,    dmgs);
  
  /*  
  let data = {};
  data[ 'flags.' + MOD_NAME + '.' + FLAG_IMAGES ] = imgs;
  data[ 'flags.' + MOD_NAME + '.' + FLAG_DMG ]    = dmgs; 
  if (this.app.token.updateSource){
    this.app.token.updateSource(data); // Updating the prototype
    this.app.token.update(data);
  }else{
    this.app.token.update(data);       // Updating the token
  }
  */
}

// Hook into the token config render
Hooks.on("renderTokenConfig", (app, html) => {
  // Create a new form group
  const formGroup = createDiv(['form-group', "slim"])
  // Create a label for this setting  
  formGroup.prepend(createLabel(Lang("title")));

  // Create a form fields container
  const formFields = createDiv(["form-fields"]);
  formGroup.append(formFields);

  const app_tab = html[0].querySelector("div[data-tab='appearance']")
  
  const pbut = createButton("Add Image", '+', undefined);
  pbut.onclick = addrow.bind({app:app, html:html});
  app_tab.children[0].children[1].append(pbut);
  
  // V9 and V10 shim way
  let imgs = app.token.getFlag(MOD_NAME, FLAG_IMAGES);
  let dmgs = app.token.getFlag(MOD_NAME, FLAG_DMG);
  
  imgs = (imgs)?imgs:[];
  dmgs = (dmgs)?dmgs:[];

  let i = 0;
  for(let img of imgs){
    let dmg = (dmgs.length>i)?dmgs[i]:0;
    addrow.bind({app:app, html:html, img:img, dmg:dmg, row:i})();
    ++i;
  }

  // Add the form group to the bottom of the Identity tab
  //html[0].querySelector("div[data-tab='appearance']").append(formGroup);
  //html[0].querySelector('footer button').addEventListener("click", onSubmitHook.bind({app:app, html:html}));
  let update_token_button = html[0].querySelector('footer>button:not(.assign-token)');
  update_token_button.addEventListener("click", onSubmitHook.bind({app:app, html:html}));

  // Set the apps height correctly
  app.setPosition();
});

