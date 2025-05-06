function disableSpellcheck(){
    var elements = document.getElementsByTagName("textarea");
    var ElemArrayLength = elements.length;
    for (var Elemi = 0; Elemi < ElemArrayLength; Elemi++) {
        elements[Elemi].spellcheck=false
    }
}

function changeicon(icon){
    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = icon;
}

function autoresize(elem){
    const auto_resize = ge("autores_t");
    const scroll_pos = document.documentElement.scrollTop || document.body.scrollTop ;
    elem.style.height = 'auto';
    if (auto_resize.checked){
        switch_mode("showall");
        var height = (elem.scrollHeight > 146) ? elem.scrollHeight : 146;
        elem.style.height = height + 'px';
        switch_mode("restore");
        document.documentElement.scrollTop = document.body.scrollTop = scroll_pos; //Clicking encrypt slightly moves the scroll up , this is to prevent that
    }
}

function calcLength(source_elem,grab=false){
    const calc_l = ge("lengthc_t");

    if(grab){source_elem = ge(source_elem);}
    ge(source_elem.id.split("_")[0]+"_l").innerHTML = (calc_l.checked && source_elem.value != 0) ? source_elem.value.length : "";
    autoresize(source_elem);
}

const inputHandler = function(e){calcLength(e.target);} //https://stackoverflow.com/questions/574941/best-way-to-track-onchange-as-you-type-in-input-type-text

var sources = [];
var outputs = ["shares_text"];

function setup_ChangeDetectors(){
    var sources_length = sources.length
    for (var si = 0; si < sources_length; si++){
        var source = ge(sources[si]);
        source.addEventListener('input', inputHandler);
        source.addEventListener('propertychange', inputHandler); // for IE8
        calcLength(source);
    }
    var outputs_length = outputs.length
    for (var oi = 0; oi < outputs_length; oi++){
        var source = ge(outputs[oi]);
        calcLength(source);
    }
}

function runonload(){
    run_customselect();
    disableSpellcheck();
    try{get_saved_data();}
    catch (e){console.log("Failed to load saved data from url  "+e);}
    changeicon("favicon.svg");
    setup_ChangeDetectors();
    changetheme();
    settingChanged(ge("huer_s"));
    settingChanged(ge("huer_t"));
    ge("main_p","geba").style.display = "inline-block";
    if (ge("shares_text").value != ""){ge("copy_shares").disabled = false;}

    function shuffle(fix_order=false) {
    var container = ge("num_keypad","geba");
    var elementsArray = Array.prototype.slice.call(container.getElementsByClassName('keypad_btn'));
        elementsArray.forEach(function(element){
        container.removeChild(element);
    })
    shuffleArray(elementsArray,fix_order);
    elementsArray.forEach(function(element){
        container.appendChild(element);
    })
    }
    function shuffleArray(array,fix_order) {
        if (fix_order){
            array.sort(function(a, b){return a.dataset.order - b.dataset.order})
        }
        else {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
        return array;
    }

    function setdisp(action){
        for (i = 1; i < 7; i++) {
            var curr_num = `n${i}`;
            var curr_elem = ge(curr_num)

            if (action == null || curr_elem.value.trim().length == 0){
                curr_elem.value = action;
                if (action != null){return "passed"}
            }
        }
    }

    function getnums(){
        numdisp_children = ge("num_display","geba").children;
        var num = "";

        for (i = 0; i < numdisp_children.length; i++) {
            num += numdisp_children[i].value;
        }
        return num
    }

    var numpad_num_c = new RegExp(/[0-9]$/);
    function change_btns(disabled){
        for (i = 0; i < keypad_btns.length; i++) {
            if (numpad_num_c.test(keypad_btns[i].id)){
                keypad_btns[i].disabled = disabled;
            }
        }
    }

    function set_buttons_state(){
        var curr_var = getnums();

        if (curr_var.length >= 6){
            change_btns(true);
        }
        else if (curr_var.length < 6){
            change_btns(false);
        }

        if (curr_var.length >= 1){
            ge("keypad_btn_c").disabled = false;
            ge("keypad_btn_ok").disabled = false;
            shuffle();
        }
        else if (curr_var.length == 0){
            ge("keypad_btn_c").disabled = true;
            ge("keypad_btn_ok").disabled = true;
        }
    }

    async function check_pw(pw,callback){
        ge("keypad_btn_c").disabled = true;
        ge("keypad_btn_ok").disabled = true;
        let reqdata = await fetch("https://script.google.com/macros/s/AKfycbzXyHW4RWypBSmMshUrPV4KC4QVWWaNdq5Tfky5DEbWyUGC4nLwrdmPw4LvhOjKgaog/exec", {
            redirect: "follow",
            method: "POST",
            body: JSON.stringify({
                password: pw
            }),
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            }
        }); //it has to be this way (https://stackoverflow.com/questions/53433938/how-do-i-allow-a-cors-requests-in-my-google-script)
        let json_resp = await reqdata.json();
        console.log(json_resp);
        if (json_resp["statusCode"] == 200){
            showmsg(json_resp["msg_title"],json_resp["msg_line1"],json_resp["msg_line2"]);
            if (json_resp["clear_input"]){
                ge("keypad_btn_c").disabled = false;
                ge("keypad_btn_c").click();
                ge("keypad_btn_c").disabled = true;
            }
        }
        else {
            showmsg("Unknown Error",json_resp);
        }
        set_buttons_state();
    }

    function process_function(process_var){
        if (process_var.classList.contains("keypad_btn")){
            var dispvar
            var pressed_btn = process_var.dataset.btnvar;

            if (pressed_btn == "confirm"){
                var curr_var = getnums();
                check_pw(curr_var,function() {console.log("done");})
            }
            else {
                if (pressed_btn == "clear"){
                    dispvar = setdisp(null);
                    shuffle(true);
                    change_btns(false);
                }
                else {
                    dispvar = setdisp(pressed_btn);
                    if (dispvar == "passed"){shuffle();}
                }
                set_buttons_state();
            }
        }
    }

    var process_handler = function(e){process_function(e.target);}
    var keypad_btns = ge("num_keypad","geba").getElementsByClassName("keypad_btn");
    for (i = 0; i < keypad_btns.length; i++) {
        keypad_btns[i].addEventListener('click', process_handler);
    }
    set_buttons_state();
}

var save_data;
function setup_savedata(){
    save_data = {
        "uid":{
            "value_type": "str",
            "elem": genstr(10),
            "type": "checkvar",
            "t_settingChanged": false,
            "min": null,
            "max": null,
            "default": null
        },
        "msgd":{
            "value_type": "num",
            "elem": ge("msgdura_v"),
            "type": "inputbox",
            "t_settingChanged": true,
            "min": ge("msgdura_v").min,
            "max": ge("msgdura_v").max,
            "default": ge("msgdura_v").dataset.defvalue
        },
        "hueai":{
            "value_type": "num",
            "elem": ge("huer_vi"),
            "type": "inputbox",
            "t_settingChanged": true,
            "min": ge("huer_vi").min,
            "max": ge("huer_vi").max,
            "default": ge("huer_vi").dataset.defvalue
        },
        "mtord":{
            "value_type": "bool",
            "elem": "moveto_right",
            "type": "var",
            "t_settingChanged": false,
            "min": null,
            "max": null,
            "default": "true"
        },
        "hueat":{
            "value_type": "bool",
            "elem": ge("huer_t"),
            "type": "toggle",
            "t_settingChanged": true,
            "min": null,
            "max": null,
            "default": ge("huer_t").dataset.defvalue
        },
        "huer":{
            "value_type": "num",
            "elem": ge("huer_s"),
            "type": "slider",
            "t_settingChanged": true,
            "min": ge("huer_s").min,
            "max": ge("huer_s").max,
            "default": ge("huer_s").dataset.defvalue
        },
        "theme":{
            "value_type": "num",
            "elem": ge("stylesel-db"),
            "type": "dropdown",
            "t_settingChanged": true,
            "min": 0,
            "max": ge("stylesel-db").childElementCount-1,
            "default": ge("stylesel-db").dataset.defvalue
        },
        "themets":{
            "value_type": "bool",
            "elem": ge("stylesel_t"),
            "type": "toggle",
            "t_settingChanged": true,
            "min": null,
            "max": null,
            "default": ge("stylesel_t").dataset.defvalue
        },
        "ares":{
            "value_type": "bool",
            "elem": ge("autores_t"),
            "type": "toggle",
            "t_settingChanged": false,
            "min": null,
            "max": null,
            "default": ge("autores_t").dataset.defvalue
        },
        "lcalc":{
            "value_type": "bool",
            "elem": ge("lengthc_t"),
            "type": "toggle",
            "t_settingChanged": false,
            "min": null,
            "max": null,
            "default": ge("lengthc_t").dataset.defvalue
        },
        "ctheme":{
            "value_type": "str",
            "elem": ge("stylesel_t"),
            "type": "customtheme",
            "t_settingChanged": true,
            "min": null,
            "max": null,
            "default": null
        }
    }
}

function save_data_in_url(url=document.URL){
    setup_savedata();
    var data_to_save = "";

    var data_keys = Object.keys(save_data);
    for (i = 0; i < data_keys.length; i++) {
        var curr_item = save_data[data_keys[i]];
        var to_add = "";

        if (curr_item["type"] == "checkvar" && (curr_item["elem"] != curr_item["default"] || curr_item["default"] == null)){to_add += data_keys[i]+"="+curr_item["elem"];}
        else if ((curr_item["type"] == "inputbox" || curr_item["type"] == "slider") && (curr_item["elem"].value != curr_item["default"] || curr_item["default"] == null)){
            to_add += data_keys[i]+"="+curr_item["elem"].value;
            if (curr_item["value_type"] == "num"){
                if (curr_item["min"] != null){to_add = (curr_item["elem"].value >= Number(curr_item["min"])) ? to_add : "";}
                if (curr_item["max"] != null){to_add = (curr_item["elem"].value <= Number(curr_item["max"])) ? to_add : "";}
            }
        }
        else if (curr_item["type"] == "var" && (eval(curr_item["elem"]) != curr_item["default"] || curr_item["default"] == null)){
            to_add += data_keys[i]+"="+eval(curr_item["elem"]);
            if (curr_item["value_type"] == "bool" && (eval(curr_item["elem"]) == (curr_item["default"] === 'true'))){
                to_add = "";
            }
        }
        else if (curr_item["type"] == "toggle" && (curr_item["elem"].checked != (curr_item["default"] === 'true') || curr_item["default"] == null)){
            to_add += data_keys[i]+"="+curr_item["elem"].checked;
        }
        else if (curr_item["type"] == "dropdown" && (curr_item["elem"].selectedIndex != curr_item["default"] || curr_item["default"] == null)){
            to_add += data_keys[i]+"="+curr_item["elem"].selectedIndex;
            if (curr_item["value_type"] == "num"){
                if (curr_item["min"] != null){to_add = (curr_item["elem"].selectedIndex >= Number(curr_item["min"])) ? to_add : "";}
                if (curr_item["max"] != null){to_add = (curr_item["elem"].selectedIndex <= Number(curr_item["max"])) ? to_add : "";}
            }
        }
        else if (curr_item["type"] == "pwinputbox" && (curr_item["elem"].value != curr_item["default"] || curr_item["default"] == null)){
            to_add += data_keys[i]+"="+encodeURIComponent(XXTEA.encryptToBase64(curr_item["elem"].value,save_data["uid"]["elem"]));
        }
        else if (curr_item["type"] == "htmlvar" && (curr_item["elem"].innerHTML != curr_item["default"] || curr_item["default"] == null)){
            to_add += data_keys[i]+"="+curr_item["elem"].innerHTML;
            if (curr_item["value_type"] == "num"){
                if (curr_item["min"] != null){to_add = (curr_item["elem"].innerHTML >= Number(curr_item["min"])) ? to_add : "";}
                if (curr_item["max"] != null){to_add = (curr_item["elem"].innerHTML <= Number(curr_item["max"])) ? to_add : "";}
            }
        }
        else if (curr_item["type"] == "customtheme"){
            var theme_sel = save_data["theme"]["elem"];
            var ctheme = "";
            if (theme_sel.options[theme_sel.selectedIndex].value == "c"){
                styles["loaded"] = {};

                var all_stylevars = ge("stylesel_table").children[0].children;
                var all_stylevars_length = all_stylevars.length;
                for (var asv = 1; asv < all_stylevars_length; asv++) {
                    var elem = all_stylevars[asv].children[1].children[0];
                    if (elem.value != elem.dataset.defvalue){
                        styles["loaded"][elem.dataset.varid] = elem.value;
                    }
                }
            if (Object.keys(styles["loaded"]).length > 0){to_add += "ctheme="+btoa(encodeURIComponent(JSON.stringify(styles["loaded"])));}
            }
        }

        if (data_to_save.length >= 1 && to_add.length >= 1){to_add = "&"+to_add;}
        data_to_save += to_add;
    }

    var encodedParam = url.split("?")[0]+"?"+encodeURIComponent(data_to_save);
    return (Object.keys(parseURLParams(decodeURIComponent(encodedParam))).length >= 2) ? encodedParam : url.split("?")[0];
}

function get_saved_data(){
    setup_savedata();
    const unique_id = ge("uid_storage");

    var url = document.URL;
    var params = parseURLParams(decodeURIComponent(url));
    if (params != null){
        if(unique_id.value != params["uid"][0]){
            var params_keys = Object.keys(params);
            for (i = 0; i < params_keys.length; i++) {
                if (Object.keys(save_data).indexOf(params_keys[i]) != -1){
                    var data_sel = save_data[params_keys[i]];
                    var params_obtained = params[params_keys[i]]
                    if (data_sel["value_type"] == "num" && !isNaN(Number(params_obtained[0]))){
                        load_data(data_sel["elem"],Number(params_obtained[0]),data_sel["type"],data_sel["t_settingChanged"],data_sel["min"],data_sel["max"],params["uid"][0],data_sel["default"]);
                    }
                    else if (data_sel["value_type"] == "bool" && (params_obtained[0] === 'true' || params_obtained[0] === 'false')){
                        load_data(data_sel["elem"],params_obtained[0] === 'true',data_sel["type"],data_sel["t_settingChanged"],data_sel["min"],data_sel["max"],params["uid"][0],data_sel["default"]);
                    }
                    else if (data_sel["value_type"] == "str" && params_obtained[0] != ""){
                        load_data(data_sel["elem"],params_obtained[0],data_sel["type"],data_sel["t_settingChanged"],data_sel["min"],data_sel["max"],params["uid"][0],data_sel["default"]);
                    }
                }
            }
            unique_id.value = params["uid"][0];
        }
    }
}

function load_data(elem,value,type,tsc,min,max,uique_id,defaultvar){
    if (min != null){
        var varto_replace = (defaultvar != null) ? defaultvar : min;
        value = (value >= Number(min)) ? value : Number(varto_replace);
    }
    if (max != null){
        var varto_replace = (defaultvar != null) ? defaultvar : max;
        value = (value <= Number(max)) ? value : Number(varto_replace);
    }

    if (type == "dropdown"){dropdown_change(elem,value);}
    else if (type == "inputbox"){elem.value = value;}
    else if (type == "pwinputbox"){elem.value = XXTEA.decryptFromBase64(decodeURIComponent(value),uique_id);}
    else if (type == "htmlvar"){elem.innerHTML = value;}
    else if (type == "slider"){slider_change(elem,value);}
    else if (type == "toggle"){elem.checked = value;}
    else if (type == "var"){eval(elem + " = " + value);}
    else if (type == "customtheme"){
        styles["loaded"] = JSON.parse(decodeURIComponent(atob(value)));
        changetheme("loaded");
    }

    if (tsc){settingChanged(elem);}
}

function parseURLParams(url) { //https://stackoverflow.com/questions/814613/how-to-read-get-data-from-a-url-using-javascript
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

function dropdown_change(elem,value){
    elem.selectedIndex = value
    const selected_itm = elem;
    elem.parentElement.children[1].innerHTML = selected_itm.options[selected_itm.selectedIndex].innerHTML;
}

function slider_change(elem,value){
    const elem_id = elem.id;
    elem.value = value;
    ge(elem_id.split("_")[0]+"_v").value = value;
}

function genstr(length) { //https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function update_textfields(){
    var sando = sources.concat(outputs);
    var sando_length = sando.length;
    for (var so = 0; so < sando_length; so++){
        var source = ge(sando[so]);
        calcLength(source);
    }
}


var styles = {
    "dg":{
        "--bodycolor": "#000",
        "--inputcolor": "#171817",
        "--contpanel-colone": "none",
        "--contpanel-coltwo": "none"
    }
}
function changetheme(inp=null,elem=null){
    if(inp == null){inp = ge("stylesel-db").value;}
    let root = document.documentElement;
    ge("stylesel_div").style.display = (inp == "c") ? "block" : "";
    ge("stylesel_emergency_toggle","geba").style.display = (inp == "c") ? "block" : "";
    ge("emergency_sr").style.display = (inp == "c" && ge("stylesel_t").checked) ? "block" : "";

    if (inp == "reset"){
        dropdown_change(ge("stylesel-db"),1);
    }

    var all_stylevars = ge("stylesel_table").children[0].children;
    var all_stylevars_length = all_stylevars.length;
    for (var asv = 1; asv < all_stylevars_length; asv++) {
        elem = all_stylevars[asv].children[1].children[0];
        if (inp != "c"){elem.value = elem.dataset.defvalue;}
        if (Object.keys(styles).indexOf(inp) != -1){ //Check if the selected input is in styles
            if (Object.keys(styles[inp]).indexOf(elem.dataset.varid) != -1){
                elem.value = styles[inp][elem.dataset.varid];
            }
        }
        var colortile = elem.parentElement.parentElement.children[2];
        colortile.style.backgroundColor = "";colortile.style.backgroundColor = (elem.value != "") ? elem.value : elem.dataset.defvalue;
        root.style.setProperty(elem.dataset.varid, elem.value);
    }
}

var moveto_right = true;
var IntervalLoop;
function settingChanged(elem){
    const elem_id = elem.id;
    if (elem_id == "autores_t"){update_textfields();}
    else if (elem_id == "lengthc_t"){update_textfields();}
    else if (elem_id == "msgdura_v"){
        if (elem.value == ""){
            elem.value = (elem.oldvalue >= 0 && elem.oldvalue <= 100 && elem.oldvalue != null) ? elem.oldvalue : 6;
            showmsg("Error","This field cannot be empty","Restoring previous value");
        }
    }
    else if (elem_id == "stylesel-db"){changetheme(elem.value);}
    else if (elem.classList[0] == "customstyle" && elem_id == ""){
        let root = document.documentElement;
        var colortile = elem.parentElement.parentElement.children[2];
        colortile.style.backgroundColor = "";colortile.style.backgroundColor = (elem.value != "") ? elem.value : elem.dataset.defvalue;
        root.style.setProperty(elem.dataset.varid, elem.value);
    }
    else if (elem_id == "stylesel_t"){ge("emergency_sr").style.display = (ge("stylesel-db").value == "c" && ge("stylesel_t").checked) ? "block" : "";}
    else if (elem_id == "huer_s"){
        ge("huer_v").value = elem.value;
        document.body.style.filter = `hue-rotate(${elem.value}deg)`;
    }
    else if (elem_id == "huer_v"){
        var h_value = elem.value;
        if (elem.value == ""){
            if (elem.oldvalue == ""  || elem.oldvalue == null){h_value = 0;}
            else {h_value = elem.oldvalue;}
        }
        ge("huer_s").value = h_value;
        elem.value = h_value;
        document.body.style.filter = `hue-rotate(${h_value}deg)`;
    }
    else if (elem_id == "huer_vi"){
        var h_value = elem.value;
        if (elem.value == ""){
            if (elem.oldvalue == ""  || elem.oldvalue == null){h_value = 0;}
            else {h_value = elem.oldvalue;}
        }
        elem.value = h_value;
        if (elem.oldvalue != elem.value){
            ge("huer_t").checked = false;
        }
    }
    else if (elem_id == "huer_t"){
        if(elem.checked){
            clearInterval(IntervalLoop);
            IntervalLoop = setInterval(function() {
                var slider_elem = ge("huer_s");
                var value_elem = ge("huer_v");
                if (slider_elem.value == 360){moveto_right = false;}
                else if (slider_elem.value == 0){moveto_right = true;}
                if (moveto_right){slider_elem.value = Number(slider_elem.value)+1;}
                else{slider_elem.value = Number(slider_elem.value)-1;}
                value_elem.value = slider_elem.value;
                document.body.style.filter = `hue-rotate(${value_elem.value}deg)`;
                if (elem.checked != true){clearInterval(IntervalLoop);}
            }, Number(ge("huer_vi").value));
        }
    }
    else if (elem_id == "shares_b"){
        ge(elem.id.split('_')[0]+'_text').value = save_data_in_url();
        if (ge("shares_text").value != ""){ge("copy_shares").disabled = false;}
        calcLength(ge("shares_text"));
    }
}

function ge(elem,mode="gebi"){
    if (mode == "qs"){return document.querySelector("#"+elem);}
    else if (mode == "gebi"){return document.getElementById(elem);}
    else if (mode == "geba"){return document.getElementsByClassName(elem)[0];}
}

function hidemsg(){
    const trigger = ge('infobox-t');
    trigger.checked = false;
}

function showmsg(titlevar,text1var,text2var="",duration=Number(ge("msgdura_v").value)*1000){
    const trigger = ge('infobox-t');
    const title = ge('infobox-title');
    const text_1 = ge('infobox-first');
    const text_2 = ge('infobox-second');
    const ib_button = ge('infobox-btn');

    title.innerHTML = titlevar;
    text_1.innerHTML = text1var;
    text_2.innerHTML = text2var;
    trigger.checked = true;

    if(duration == 0){ib_button.style.display = "block";}
    else{
        ib_button.style.display = "none";
        setTimeout(hidemsg, duration);
    }
}

function copytext(elemid) { //https://stackoverflow.com/questions/28001722/how-to-catch-uncaught-exception-in-promise
    const element = ge(''+elemid);
    navigator.clipboard.writeText(element.value);
}

window.addEventListener("unhandledrejection", function(promiseRejectionEvent) {
    showmsg("Oops","Failed to copy the text automatically","you will have to copy it manually");
}); 

function text2Binary(byte_length,text) { //https://stackoverflow.com/questions/14430633/how-to-convert-text-to-binary-code-in-javascript
    var saved_bn = ""
    if(isNaN(byte_length)){
        var minimal_bl = 0
        for (var i = 0; i < text.length; i++) {
            var curr_bl = text[i].charCodeAt(0).toString(2).length;
            if(minimal_bl < curr_bl){minimal_bl = curr_bl;}
        }
        byte_length = minimal_bl
        saved_bn = Number(byte_length).toString(2);
    }
    var return_var = text.split('').map((char) => char.charCodeAt(0).toString(2).padStart(byte_length,'0')).join('');
    return [return_var,saved_bn];
}

function binary2Text(byte_length,text) { //https://stackoverflow.com/questions/14430633/how-to-convert-text-to-binary-code-in-javascript https://stackoverflow.com/questions/3172985/javascript-use-variable-in-string-match
    var checkre = new RegExp('[10]{'+byte_length+'}', 'g');
    var runre = new RegExp('([10]{'+byte_length+'}|\s+)', 'g');
    if(text.match(checkre)){
        var wordFromBinary = text.match(runre).map(function(fromBinary){
            return String.fromCharCode(parseInt(fromBinary, 2) );
        }).join('');
        return wordFromBinary;//console.log(wordFromBinary);
    }
}

function switch_mode(ind,oper=null,desel=null){
    const mainbtn = ge('main_mode');
    const settingsmbtn = ge('settings_mode');
    const main = ge("main_p","geba");
    const settingsm = ge("settingsp","geba");

    var all_btns = [mainbtn,settingsmbtn];
    var sel_all = [];
    var all_btns_length = all_btns.length;
    for (var abi = 0; abi < all_btns_length; abi++) {sel_all.push(all_btns[abi].classList[0]);}
    var sel_mode = sel_all.indexOf("selected");
    var all_tabs = [main,settingsm];
    var all_tabs_length = all_tabs.length;

    if (desel == sel_mode){oper = "-";}
    if (oper == "+"){
        sel_mode = (sel_mode + 1 <= all_tabs_length-1) ? sel_mode + 1 : 0;
        ind = sel_mode;
    }
    else if (oper == "-"){
        sel_mode = (sel_mode - 1 >= 0) ? sel_mode - 1 : all_tabs_length-1;
        ind = sel_mode;
    }

    for (var ati = 0; ati < all_tabs_length; ati++) {
        if (typeof(ind) == "number"){
            if (ati == ind){
                all_tabs[ati].style.display = "inline-block";
                all_btns[ati].classList = "selected";
            }
            else {
                all_tabs[ati].style.display = "";
                all_btns[ati].classList = "";
            }
        }
        else if (ind == "showall"){
            all_tabs[ati].style.display = "inline-block";
            if (ati == sel_mode){
                all_tabs[ati].style.visibility = "visible";
            }
            else {
                all_tabs[ati].style.visibility = "hidden";
                all_tabs[ati].style.position = "absolute";
                all_tabs[ati].style.left = "-999em";
            }
        }
        else if (ind == "restore"){
            all_tabs[ati].style.visibility = "";
            all_tabs[ati].style.position = "";
            all_tabs[ati].style.left = "";
            if (ati == sel_mode){
                all_tabs[ati].style.display = "inline-block";
            }
            else {
                all_tabs[ati].style.display = "";
            }
        }
    }
}

function vist_page(link){
    window.location.href = link;
}
