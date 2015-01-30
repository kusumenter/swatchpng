﻿// Determine Operating Systemif ($.os.search(/windows/i) != -1) {    this_os = "Windows"} else {    this_os = "Macintosh"}// Take input from user to select Color Swatch filef = new File(app.path + "/Presets/Color Swatches/");var type_selection;if(this_os == "Windows") type_selection = "Photoshop Color Swatches: *.ACO";else type_selection = function(f) {    if(f.type == undefined || f.type == "8BCO") return true;    if(f.type == "????") {        farr = f.name.split(".");        if(farr[farr.length - 1].toLowerCase() == "aco") return true;    }    return false;};file = f.openDlg("Select the Color Swatch File", type_selection);//Process the Swatch file using the python script to generate a temporary CSV file that contains the color datascripts_folder = app.path + "/Presets/Scripts/";temp_folder = Folder.temp + '/';app.system('python "' + decodeURIComponent(scripts_folder) + 'swatchpng/aco_process.py" "' + decodeURIComponent(file) + '" "' + decodeURIComponent(temp_folder) + '"');// Load the colors from the temporary CSV file, and then delete the temporary filecsv_file = File(temp_folder + 'swatchpng.csv');csv_file.open('r')colors = [];while(row = csv_file.readln()) colors.push(row);csv_file.remove();// Take input from user for dimension of the square swatches & open an image of the given dimensionside = Number(prompt("Please enter the square sides dimension in pixels", 100));// Function to convert each color row into a JSON object to be used below.var make_color = function(c) {    c = c.split(',');    var obj = {        name: c[0],        type: c[1],        color: new SolidColor()    };    if(obj.type == 'RGB') {        obj.color.model = ColorModel.RGB;        obj.color.rgb.red = c[2]/256;        obj.color.rgb.green = c[3]/256;        obj.color.rgb.blue = c[4]/256;    }    else if(obj.type == 'Lab') {        obj.color.model = ColorModel.LAB;        obj.color.lab.l = c[2]/100;        obj.color.lab.a = c[3]/100;        obj.color.lab.b = c[4]/100;    }    // ^ This is incomplete. I have not processed CMYK, Grayscale & HSB, as I was only testing for RGB & LAB ATM.    // If you need any of them, please add code & send me a pull request, or file an issue & I will try to cover it.    return obj;};// Take input from user to choose folder for swatch images outputf = Folder.selectDialog("Please select the folder to store the swatch image files", Folder.myDocuments);count = 0;// Options for Save for Weboptions = new ExportOptionsSaveForWeb();options.format = SaveDocumentType.PNG;options.PNG8 = false;options.colors = 4;options.transparency = false;// Store all the color swatchesfor(c in colors) {    color = make_color(colors[c]);    app.backgroundColor = color.color;    app.documents.add(side,side,72,color.name, NewDocumentMode.LAB, DocumentFill.BACKGROUNDCOLOR, 1, BitsPerChannelType.SIXTEEN)    app.activeDocument.exportDocument(File(f + "/" + color.name + ".png"), ExportType.SAVEFORWEB, options);    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);    count++;}