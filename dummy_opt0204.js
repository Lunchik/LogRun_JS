var BIG_NUMBER = 1000000000000;
var gridHeaderSize = 40;
var logsData = new LogsObject();
logsData.init();
var gridDiv = document.getElementById("myGrid");
var tlDiv = document.getElementById("tl");
logsData.initRowHeigh = gridDiv.offsetHeight - gridHeaderSize - tlDiv.offsetHeight;
iii=0;
tmpFiles = new Array();

var fileInput = document.getElementById("fileinput");

function addOption(selectbox,text,value )
{
    var optn = document.createElement("option");
    optn.text = text;
    optn.value = value;
    selectbox.options.add(optn);
}

function onerror(message) {
    alert(message);
}


function BlobBuilderSupported() {
    if (window.BlobBuilder) {
    }
    else if (window.MSBlobBuilder) {
        window.BlobBuilder = window.MSBlobBuilder;
    }
    else if (window.WebKitBlobBuilder) {
        window.BlobBuilder = window.WebKitBlobBuilder;
    }
    else if (window.MozBlobBuilder) {
        window.BlobBuilder = window.MozBlobBuilder;
    }
    else {
        alert ("BlobBuilder is not supperted");
        return false;
    } // if-else

    return true;
} // BlobBuilderSupported

function waitingFormatter(value) {
    return "wait...";
}

function myFormatterChart(val, axis) {
    return " ";
}

function myFormatterDepth(val, axis) {
    if ((val % axis.options.tickShift) == 0)
    {
        //this.tickLength = 5;
        return -val.toFixed(axis.tickDecimals);
    }
    else
        return " ";
}

function stringToBuffer( str ) {
    var arr = str.split("");
    var arrBuf = new ArrayBuffer(arr.length);

    var uint8Buf = new Uint8Array(arrBuf);
    //var uint8Buf2 = new Uint8Array(arr, 0, arr.length);

    for (var i=0; i<arr.length; i++)
        uint8Buf[i] = arr[i].charCodeAt(0);

    return arrBuf;
}

function FigureFileExtension(file) {
    //alert ("this = " + this);
    var fileName;
    while (file.indexOf("\\") != -1)
        file = file.slice(file.indexOf("\\") + 1);
    this.ext = file.slice(file.indexOf(".")).toLowerCase();
    this.fileName = file.slice(0, file.indexOf("."));
}

function string2ArrayBuffer(string, callback) {

    var blobSupported = BlobBuilderSupported();
    var input = string;
    //var BlobBuilderObj = new (window.BlobBuilder || window.WebKitBlobBuilder)();

    var bb = new BlobBuilder();
    //var bb = new (window.BlobBuilder || window.webKitBlobBuilder)();
    bb.append(input);
    var blob1 = bb.getBlob();
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result);
    };
    f.readAsArrayBuffer(blob1);
}

function bracket_parse(txt,b,c)
{
    var lastPos = 0;
    b=(b)?b:"'''";

    c=(c)?c:b;

    //var parser1=(parser1)?parser1:JSON.stringify;

    var tempStrings = new Array();
    var i = 0;

    var parser0= function(s){
        tempStrings[i] = s.substr(lb,s.length-lb-lc);
        lastPos += s.length;
        //document.write(tempStrings[i] + "<br><br>");
        return tempStrings[i++];
    };

    var lb=b.length,lc=c.length;
    re= new RegExp('('+b+')(([.]|[^.])*?)('+c+')','g');
    var regWork = txt.replace(re,parser0);
    return tempStrings;
}

function parserTPL(list, columns) {

    var level = 0, i=0;

    var re = /(item(?=\r))|(end(?=>|\r))/;
    var startPos = 0, endPos=0, columnStartPos = 0, globEndPos = list.length;

    var marker, temp1;
    while (1) {
        if ((marker = list.substring(startPos, globEndPos).search(re)) == -1) {
            break;
        }
        startPos += marker;
        temp1 = list.substr(startPos, 3);
        switch (temp1) {
            case "ite":
                ++level;
                if (columnStartPos == 0) columnStartPos = startPos;
                startPos += 3;
                break;
            case "end":
                --level;
                startPos += 3;
                endPos = startPos;
                break;
            default: //null
                break;
        }
        if (level == 0)
        {
            var logs, fills;
            //read the column
            //columns[i] = {logs : null, fillPairs: null, colName: null};
            var colData = list.substring(/*(*/columnStartPos/* ==0)? 0 : columnStartPos-3*/, endPos);
            var colName = /Caption = '(.*)'/.exec(colData);//colData.match(/Caption = (.*)/);
            if (colName != null)
            {
                colName = (colName[1] == '<DEPTH>') ? "\<DEPTH\>" : colName[1];
            }
            //else colName = null;

            //figure out column type "Kind = " if "clkImg", then we'e a color panel
            var colKind = /Kind = (.*)/.exec(colData);//colData.match(/Caption = (.*)/);
            if (colKind != null)
            {
                colKind = colKind[1];
            }
            else colKind = 'None';

            if (colKind == 'clkImg')
            {//it's a color panel, parse Img.Palette.Table.Strings = ( colors )
                //
                var palette = /Img\.Palette\.Table\.Strings = \(([\s\S]*)\)/.exec(colData);
                var colorValues = bracket_parse(palette[1], '\'', '\'');
                var paletteValues = [];
                var d = document.getElementById("event_dummy");
                for (var k = 0; k<colorValues.length; k++) {
                    //
                    temp = /(.*)=(.*)/.exec(colorValues[k]);
                    var colVal = null;
                    if (temp.length == 3) {
                        var tempColorArray;
                        if ((tempColorArray = /cl(.*)/g.exec(temp[2])) == null){
                            tempColorArray = /\$(.*)/.exec(temp[2]);
                            colVal = {red: parseInt([tempColorArray[1][0], tempColorArray[1][1]].join(''), 16),
                                blue: parseInt([tempColorArray[1][2], tempColorArray[1][3]].join(''),16),
                                green: parseInt([tempColorArray[1][4], tempColorArray[1][5]].join(''), 16)}
                        }
                        else {
                            //
                            d.style.color = tempColorArray[1];
                            temp1 = /\((\d*), (\d*), (\d*)\)/.exec(window.getComputedStyle(d).color);
                            colVal = {red: temp1[1]-0, blue: temp1[2]-0, green: temp1[3]-0};
                        }

                        paletteValues[k] = {range: (temp[1]-0), colVal: colVal};
                    }


                    else alert ("Error in reading and parsing of Palette values!");
                }
            }

            var logandfill = bracket_parse(colData, '<', '>');
            if (logandfill.length == 2)
            {
                logs = (logandfill[0] == "") ? null : bracket_parse(logandfill[0], 'item', ' end');
                fills = (logandfill[1] == "") ? null : bracket_parse(logandfill[1], 'item', ' end');
            }
            else
            {
                logs = (logandfill[1] == "") ? null : bracket_parse(logandfill[1], 'item', ' end');
                fills = (logandfill[2] == "") ? null : bracket_parse(logandfill[2], 'item', ' end');
            }


            //if it is a clkImg we will need to figure out the PlotFrom and PlotTo values
            //though we might need to figure them out anyway.
            if (logs != null)
            {
                var log = [];
                var valName, DSName, temp, inverse;
                //var logsArray = bracket_parse(logs, 'item', 'end');
                for (var j= 0; j< logs.length; j++) {
                    var valNameArray;
                    if ((valNameArray = (logs[j].match(/ValName\s=\s(.*)/))) != null) {
                        if ((temp = /'(.*)'/g.exec(valNameArray[0])) == null) {
                            temp = /(#[\s\S]*)\r/g.exec(valNameArray[0]);
                            valName = temp[1];
                        }
                        else valName = temp[1];
                        /*if ((temp = valNameArray[0].match(/(#)((.)*)/g)) == null){
                         temp = /'(.*)'/g.exec(valNameArray[0]);//.match(/'(.*)'/g);
                         valName = temp[1];
                         }
                         else valName = temp[0]; */
                    }
                    else {
                        valName = "";
                        //alert ("There's no ValName!!!");
                    }

                    var DSNameArray;
                    if ((DSNameArray = (logs[j].match(/DSName\s=\s(.*)/))) != null) {
                        if ((temp = DSNameArray[0].match(/(#)((.)*)/g)) == null){
                            temp = /'(.*)'/g.exec(DSNameArray[0]);//.match(/'(.*)'/g);
                            DSName = temp[1];
                        }
                        else DSName = temp[0];
                    }
                    else {
                        DSName = "";
                        //alert ("There's no ValName!!!");
                    }

                    var inverseArray;
                    if ((inverseArray = (logs[j].match(/Inverse\s=\s(.*)/))) != null) {
                        inverse = (inverseArray[1] == "True");
                    }
                    else {
                        inverse = null;
                        //alert ("There's no ValName!!!");
                    }

                    var plotFrom;
                    if ((plotFrom = logs[j].match(/PlotFrom\s=\s(.*)/)) != null) {
                        plotFrom = plotFrom[1]-0;
                    }
                    else plotFrom = 0;

                    var plotTo;
                    if ((plotTo = logs[j].match(/PlotTo\s=\s(.*)/)) != null) {
                        plotTo = plotTo[1]-0;
                    }
                    else plotTo = 0;

                    log[j] = {valName: valName, DSName: DSName, inverse: inverse, plotFrom: plotFrom, plotTo: plotTo, palette: paletteValues};
                }
            }


            var fill = [];
            //var fill1 = [];
            if (fills != null)
            {
                for (var j= 0; j< fills.length; j++) {

                    var headerOrder;
                    //temp = /Header.Order\s=\s([0-9]{1,})/.exec(fills[j]);
                    //if (temp != null)
                    //{
                    //    headerOrder = temp[1]-0;
                    //}
                    /*else
                     {
                     alert ("Error: heared order is not defined!");
                     continue;
                     }*/
                    headerOrder = j;
                    if (typeof fill[headerOrder] != "undefined")
                    {
                        alert ("Error: heared order is already used!");
                        continue;
                    }
                    fill[headerOrder] = {caption: null, nLogA: null, nLogB: null, fillArea: null,
                        fillColorLT: null, fillColorGT: null, fillPatData: null, twoFills: null, color: null};

                    //Caption parsing /Caption\s=\s'(.*)'/ - it can be undefined
                    temp = /Caption\s=\s'(.*)'/.exec(fills[j]);
                    if (temp != null)
                        fill[headerOrder].caption = temp[1];

                    //Check if there's two fills - if yes, then I save the GT color - just for now
                    //I'll fix two fills case later.
                    temp = /TwoFills\s=\s(.*)/.exec(fills[j]);
                    if (temp != null)
                        fill[headerOrder].twoFills = (temp[1] == 'True');

                    //Header.Order - order of adding the fills
                    /*temp = /Header.Order\s=\s([0-9]{1,})/.exec(fills[j]);
                     if (temp != null)
                     fill[headerOrder].headerOrder = temp[1];      */

                    //Log number(s) (nLogA nLogB) parsing /nLogA\s=\s([0-9]{1,})/
                    temp = /nLogA\s=\s([0-9]{1,})/.exec(fills[j]);
                    if (temp != null)
                        fill[headerOrder].nLogA = temp[1] -0;
                    temp = /nLogB\s=\s([0-9]{1,})/.exec(fills[j]);
                    if (temp != null)
                        fill[headerOrder].nLogB = temp[1] -0;

                    //FillArea parsing /FillArea\s=\s(.*)/
                    temp = /FillArea\s=\s(.*)/.exec(fills[j]);
                    if (temp != null)
                        fill[headerOrder].fillArea = temp[1];

                    //FillColorLT and FillColorGT /FillColorLT\s=\s(.*)/ and /FillColorGT\s=\s(.*)/
                    temp = /FillColorLT\s=\scl(.*)/.exec(fills[j]);
                    if (temp != null)
                        fill[headerOrder].fillColorLT = temp[1];

                    temp = /FillColorGT\s=\scl(.*)/.exec(fills[j]);
                    if (temp != null)
                        fill[headerOrder].fillColorGT = temp[1];

                    //FillPatLT.Data : /FillPatLT.Data\s=\s\{([\s\S]*)\}/
                    temp = /FillPatLT.Data\s=\s\{([\s\S]*)\}/.exec(fills[j]);
                    if (temp != null)
                    {
                        //var k = 0;
                        /*for (;;) {
                         //
                         var reg = /\s{0,}(\S*)/g;
                         temp2 = reg.exec(temp[1]);
                         //k += temp2.lastIndex
                         fill[j].fillPatData += temp2[1];
                         if (temp2[1] == "" || reg.lastIndex >= temp[1].length -1)
                         break;
                         }  */
                        //fill[j].fillPatData = temp[1];
                        var temp2, temp3;
                        var reg = /\s{0,}(\S*)/g;
                        temp3 = "";
                        while((temp2 = reg.exec(temp[1])) != null)
                        {
                            temp3 += temp2[1];
                            if (reg.lastIndex > temp[1].length-1)
                                break;
                        }
                        fill[headerOrder].fillPatData = temp3;
                        //convert the PatData into array of hex?
                        //delete firsth few bytes before beginning of header (424D...)
                        //temp2 = /\S*(424D\S*)/.exec(temp3);
                        //while (1)
                        //{
                        //fill[j].fillPatData = temp2[1];
                        //}
                    }

                    if (fill[headerOrder].twoFills)
                    {
                        fill[headerOrder].color = fill[headerOrder].fillColorGT;
                    }
                    else
                    {
                        fill[headerOrder].color = fill[headerOrder].fillColorLT;
                    }

                    //alert ("aha!");
                }

                if (1) {}
                /*for (j = 0; j< fill.length; j++)
                 {
                 if (typeof fill[j] != 'undefined')
                 fill1.push(fill[j]);
                 } */

            }
            /*else {
             logs = new Array();
             logs[0] = {valName: null, }
             } */
            if (colName == null)
            {
                colName = log[0].valName;
            }
            columns[i] = {logs : log, fillPairs: (typeof fill == 'undefined')?null:fill, colName: colName, filled: false,
                colKind: colKind, palette: paletteValues};
            columnStartPos = endPos + 4;
            i++;
        }
    }
}



function LogsObject()
{
    this.init = function () {
        this.headerSize = 256;
        this.pointsCount = new Array();
        this.logsCount = 0;
        this.curvesCount =0;
        this.curveArray = new Array();
        this.tmplArray = new Array();
        this.templates = new Array();
        this.changed = false;
        this.zoomScale = 1;
        this.tickShift = 10;
        this.arrBuffer = new Array();
        this.tlContainer = document.getElementById("tl");
        //this.byteOffset = 0;
    };

    this.fill = function (fileInfo, contents) {
        var lddRead, ldfRead;
        var ind = fileInfo.fileName.match(/[0-9]{1,}/);
        if (ind == null)
        {
            var index = 0;
        }
        else var index = ind[0] -0;
        switch (fileInfo.ext) {
            case ".ldf": //save the binary contents
                break;
            case ".ldd": //parse and save the properties
                break;
            case ".lvi":
                break;
            case ".ptn":
                break;
            case ".doc":
                break;
            case ".txt":
                break;
            case ".tpl":
                var regTPLName = /(?:\sName\s=\s)((.)*)/g;
                var tplNameArray, temp, Name;
                //this.templates[index] = {Name : null, columns : new Array()};
                if ((tplNameArray = (contents.match(regTPLName))) != null) {
                    if ((temp = tplNameArray[0].match(/(#)((.)*)/g)) == null){
                        temp = /'(.*)'/g.exec(tplNameArray[0]);//tplNameArray[0].match(/'(.*)'/g);
                        if (temp != null)
                        {
                            Name = temp[1];//.substring(1, temp[0].length-1);
                        }
                        else Name = "Template_" + index;
                    }
                }
                this.templates[Name] = {columns: new Array(), inited: false};

                addOption(this.tlContainer, Name, Name);
                //else this.templates[index].Name = null;
                parserTPL(contents, this.templates[Name].columns);
                //alert ("aha!");
                break;
            default:
                break;
        }
    };

    this.fillCurvesData = function(index,filePair){
        //
        //parse and save the properties
        var byteOffSet = 0;

        var contents = filePair.ldd;
        //this.arrBuffer[index] = stringToBuffer(filePair.ldf);

        var regCurveDescriptors = /<([^]*)>/gm;
        //var regItem = /item([^]*)end/;
        var regValName = /(?:ValName\s=\s)((.)*)\r/g;
        var regOriginName = /(?=OriginName\s=\s)((.)*)/g;
        var regValUnit = /(?:ValUnit\s=\s)((.)*)/g;
        var regMeaId = /(?:MeaUnits.MeaId\s=\s)((.)*)/g;
        var regMeaSym = /(?:MeaUnits.Sym\s=\s)((.)*)/g;
        var regMeaSymSI = /(?:MeaUnits.SymSI\s=\s)((.)*)/g;
        var regMeaSymOrig = /(?:MeaUnits.SymOrig\s=\s)((.)*)/g;
        var regColor = /(?:Color\s=\s)((.)*)/g;
        var supRegItem = /item/m;
        var supRegEnd = /end/m;
        ///var regPointsCount = ;
        var regUID = /UID\s=\s(\d*)/g;
        var supCurveDecsPos = contents.search(regCurveDescriptors);
        var curveDescriptors = contents.match(regCurveDescriptors);
        var supItemIndex = curveDescriptors[0].search(supRegItem);
        var supEndIndex = curveDescriptors[0].search(supRegEnd) +3;
        //var UIDArray = (contents.substring(0, supItemIndex)).match(regUID);
        var depthUIDArray = (contents.substring(0, supCurveDecsPos)).match(regUID);

        var pointsArray = /PointCount\s=\s(\d*)/i.exec(contents);
        this.pointsCount[index] = pointsArray[1] - 0;
        var arrBufLength = this.arrBuffer[index].byteLength;
        this.logsCount = (arrBufLength - this.headerSize)/(this.pointsCount*8);
        byteOffSet += this.headerSize;

        var regDSName = /DSName\s=\s'(.*)'/i.exec(contents);
        var DSName = regDSName[1];
        var k="DEPTH_" + DSName;
        this.tmplArray[k] = {customColor : null, UID : null, DSName : regDSName[1], pointsCount: this.pointsCount[index], cbyteOffSet: 256,
            depthBuf : this.arrBuffer[index]};
        //this.tmplArray[k].UID = depthUIDArray[0].match(/[0-9]/);
        this.tmplArray[k].customColor = "None";
        //var tempDesc = myArray3[k].match(/'((.)*)'/g)[0];
        this.tmplArray[k].UID = depthUIDArray[0].match(/[0-9]{1,}/)[0];
        //this.tmplArray[k].depthBuf = new Float64Array(this.arrBuffer[index], byteOffSet, this.pointsCount);
        //byteOffSet += this.pointsCount[index]*8;
        //var depth = this.tmplArray[k].arrBuf;
        //this.tmplArray[k].depthBuf = this.tmplArray[k].arrBuf;
        //alert (this.tmplArray[k].UID + " " + this.tmplArray[k].customColor);
        //k++;
        //var iCheck = true;
        //alert (curveDescriptors[0].substring(supItemIndex, supEndIndex));
        //var tester = contents.match(regValName);
        for ( ; ; )
        {
            var valNameArray, valName;
            if ((valNameArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regValName)) != null) {
                if ((temp = /'(.*)'/g.exec(valNameArray[0])) == null){
                    temp = /(#[\s\S]*)\r/g.exec(valNameArray[0]);//valNameArray[0].match(/'(.*)'/g);
                    valName = temp[1];

                }
                else {
                    valName = temp[1];
                }
                k = valName + "_" + DSName;
            }
            else {
                k = "";
                //alert ("There's no ValName!!!");
            }
            this.tmplArray[k] = {UID: null, originName: null, unitName: null, customColor: null, pointsCount: null,
                meaID: null, meaSym: null, meaSymOrig: null, meaSymSI: null, cbyteOffSet : null, depthBuf : this.arrBuffer[index],
                valName: valName, DSName: DSName};

            var UIDArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regUID);
            this.tmplArray[k].UID = UIDArray[0].match(/[0-9]{1,}/)[0];

            //this.tmplArray[k].arrBuf = new Float64Array(this.arrBuffer[index], byteOffSet, this.pointsCount);

            this.tmplArray[k].pointsCount = this.pointsCount[index];
            byteOffSet += this.pointsCount[index]*8;
            this.tmplArray[k].cbyteOffSet = byteOffSet;

            var origNameArray , temp;
            if ((origNameArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regOriginName)) != null) {
                if ((temp = origNameArray[0].match(/(#)((.)*)/g)) == null){
                    temp = origNameArray[0].match(/'((.)*)'/g);
                    this.tmplArray[k].originName = temp[0].substring(1, temp[0].length-1);
                }
            }
            else this.tmplArray[k].originName = " ";
            /*
             var valNameArray;
             if ((valNameArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regValName)) != null) {
             if ((temp = valNameArray[0].match(/(#)((.)*)/g)) == null){
             temp = valNameArray[0].match(/'((.)*)'/g);
             this.tmplArray[k].valName = temp[0].substring(1, temp[0].length-1);
             }
             }
             else this.tmplArray[k].valName = " ";
             */

            var valUnitArray;
            if ((valUnitArray= (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regValUnit)) != null) {
                if ((temp = valUnitArray[0].match(/(#)((.)*)/g)) == null){
                    temp = valUnitArray[0].match(/'((.)*)'/g);
                    this.tmplArray[k].unitName = temp[0].substring(1, temp[0].length-1);
                }
            }
            else this.tmplArray[k].unitName = " ";

            var colorArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regColor);
            var tempColorArray;
            if ((tempColorArray = /cl(.*)/g.exec(colorArray[0])) == null){
                tempColorArray = colorArray[0].match(/= (.*)/g);
                this.tmplArray[k].customColor = tempColorArray[1];//.substring(2, colorArray[0].length);
            }
            else
                this.tmplArray[k].customColor = tempColorArray[1];//.substring(2, tempColorArray.length);
            if (typeof this.tmplArray[k].customColor == 'undefined')
            /*alert (this.tmplArray[k].customColor + " " + this.tmplArray[k].valName + " "
             + this.tmplArray[k].DSName); */

                var meaIdArray;
            if ((meaIdArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regMeaId)) != null){
                this.tmplArray[k].meaID = meaIdArray[0].match(/[0-9]{1,}/);
            }
            else this.tmplArray[k].meaID = -1;

            var meaSymArray;
            if ((meaSymArray= (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regMeaSym)) != null) {
                if ((temp = meaSymArray[0].match(/(#)((.)*)/g)) == null){
                    temp = meaSymArray[0].match(/'((.)*)'/g);
                    this.tmplArray[k].meaSym = temp[0].substring(1, temp[0].length-1);
                }
            }
            else this.tmplArray[k].meaSym = " ";

            var meaSymSIArray;
            if ((meaSymSIArray= (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regMeaSymSI)) != null) {
                if ((temp = meaSymSIArray[0].match(/(#)((.)*)/g)) == null){
                    temp = meaSymSIArray[0].match(/'((.)*)'/g);
                    this.tmplArray[k].meaSymSI = temp[0].substring(1, temp[0].length-1);
                }
            }
            else this.tmplArray[k].meaSymSI = " ";

            var meaSymOrigArray;
            if ((meaSymOrigArray= (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regMeaSymOrig)) != null) {
                if ((temp = meaSymOrigArray[0].match(/(#)((.)*)/g)) == null){
                    temp = meaSymOrigArray[0].match(/'((.)*)'/g);
                    this.tmplArray[k].meaSymOrig = temp[0].substring(1, temp[0].length-1);
                }
            }
            else this.tmplArray[k].meaSymOrig = " ";

            //alert (this.tmplArray[k].customColor + " " + this.tmplArray[k].unitName);
            //k++;
            var tempItem = supItemIndex, tempEnd = supEndIndex;
            supItemIndex = (curveDescriptors[0].substring(supEndIndex, curveDescriptors[0].length)).search(supRegItem);
            supEndIndex = (curveDescriptors[0].substring(supEndIndex + supItemIndex, curveDescriptors[0].length)).search(supRegEnd) +6;
            if (supItemIndex <= 0)
                break;
            supItemIndex += tempEnd;
            supEndIndex += tempEnd+3;

            /*alert("ValName " + k + " UID " + this.tmplArray[k].UID + " OriginName " +  this.tmplArray[k].originName +
             " UnitName " +  this.tmplArray[k].unitName + " Color " + this.tmplArray[k].customColor +
             " meaID " +  this.tmplArray[k].meaID + " meaSym " +  this.tmplArray[k].meaSym + " meaSymOrig " +
             this.tmplArray[k].meaSymOrig + " meaSymSI " +  this.tmplArray[k].meaSymSI);       */

        }


    }

}




var model = (function() {

    return {
        getEntries : function(file, onend) {
            zip.createReader(new zip.BlobReader(file), function(zipReader) {
                zipReader.getEntries(onend);
            }, onerror);
        },
        getEntryFile : function(entry) {
            var writer, zipFileEntry;

            function getData() {
                entry.getData(writer, function(blob){
                    var r = new FileReader();
                    r.onload = function(e) {
                        //

                        //processInsides(entry, e.target.result);
                        entry.contents = e.target.result;
                        iii++;
                        if (1){}


                        var fileinfo = new FigureFileExtension(entry.filename);
                        var a= "DATA";
                        if (fileinfo.fileName.indexOf(a) != -1) {
                            if (fileinfo.fileName.length <= 4)
                            {
                                if (typeof tmpFiles[0] == "undefined")
                                    tmpFiles[0] = {ldd : " ", ldf : " "};
                                if (fileinfo.ext == ".ldd") {
                                    tmpFiles[0].ldd = entry.contents;
                                    //document.write(result.data + "\n\n\n\n" + result.data.length)
                                }
                                else
                                    tmpFiles[0].ldf = entry.contents
                            }
                            else
                            {
                                var ind = fileinfo.fileName.substring(4, fileinfo.fileName.length) - 0;
                                if (typeof tmpFiles[ind] == "undefined")
                                    tmpFiles[ind] = {ldd : " ", ldf : " "};
                                if (fileinfo.ext == ".ldd")
                                    tmpFiles[ind].ldd = entry.contents;
                                else
                                    tmpFiles[ind].ldf = entry.contents
                            }
                        }
                        else {
                            logsData.fill(fileinfo, entry.contents);
                        }


                        /*for (var ind = 0; ind < tmpFiles.length; ind++)
                         {
                         if (typeof tmpFiles[ind] != "undefined")
                         {
                         logsData.arrBuffer[ind] = stringToBuffer(tmpFiles[ind].ldf);
                         logsData.fillCurvesData(ind, tmpFiles[ind]);
                         }
                         else
                         {
                         logsData.arrBuffer[ind] = null;
                         }
                         }*/

                        //here i have to dispatch an event on dummy!
                        if (iii == entry.allLength) {
                            var clickEvent2 = document.createEvent("MouseEvent");
                            clickEvent2.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                            var dummy2 = document.createElement('dummy2');
                            dummy2.addEventListener('click', tmpFilesProcess, false);
                            var evBool = dummy2.dispatchEvent(clickEvent2);
                            //delete tmpFiles;
                        }
                    };
                    r.readAsBinaryString(blob);
                }, function(){
                    /*var clickEvent2 = document.createEvent("MouseEvent");
                     clickEvent2.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                     var dummy2 = document.createElement('dummy2');
                     dummy2.addEventListener('click', tmpFilesProcess, false);
                     var evBool = dummy2.dispatchEvent(clickEvent2);  */
                });


                //alert ("oneoneone");
            }
            writer = new zip.BlobWriter();
            getData();
        }
    };
})();




function displayTemplate(evt) {
    //alert (evt.target.value);
    var prevOffset;
    var globalContext;
    var customOptions;
    var dummyCanvas;
    var currentTplName = evt.target.value;
    var currentTpl = logsData.templates[currentTplName];

    logsData.zoomScale = 1;
    logsData.initZoomScale = 1;
    logsData.visibleTop = 0;
    logsData.customScrollTop = 0;

    //here I have to process columns data: column name is in currentTpl.columns[i].colName
    //displaying logs names are in currentTpl.columns[i].logs[i].valName and DSName
    //for every log valName I can find the description and ArrayBuffers in logsData.tmplArray[valName].arrBuf and .depthBuf
    //and .customColor

    var dPlot;
    var grid;
    var columns = []; //
    var data = [];

    //Push the depth column manually? - No, first I need to collect data about the other columns - min and max depth.

    //Depth column will be configured after the other columns data is processed
    currentTpl.minDepth = null;
    currentTpl.maxDepth = null;

    //First column is depth (columns[0])

    //the currentTpl info is saved in logsData.templates[currentTplName] after 1st time it is built, so
    //for now I leave it like this and let the data stay in the memory, later I'll think of something.
    //if (!currentTpl.inited){


    //currentTpl.inited = true;

    for (var i = 1; i< currentTpl.columns.length; i++)
    {
        //alert (currentTpl.columns[i].colName);
        for (var j= 0; j<currentTpl.columns[i].logs.length; j++)
        {
            //alert (currentTpl.columns[i].logs[j].valName + " " + currentTpl.columns[i].logs[j].DSName);
            //Here I have to form logs currentTpl.columns[i].logs[j].curveData and .depthData and .customColor from logsData.tmplArray
            var valName = currentTpl.columns[i].logs[j].valName + "_" + currentTpl.columns[i].logs[j].DSName;
            if ((valName != "") && (typeof logsData.tmplArray[valName] != 'undefined')) {
                currentTpl.columns[i].logs[j].customColor = logsData.tmplArray[valName].customColor;
                currentTpl.columns[i].logs[j].pointsCount = logsData.tmplArray[valName].pointsCount;
                currentTpl.columns[i].logs[j].depthData =
                    new Float64Array(logsData.tmplArray[valName].depthBuf,
                        logsData.headerSize,  //- the array for depth begins right after the empty header, that has the size of 256 bytes
                        logsData.tmplArray[valName].pointsCount);

                //console.log(currentTpl.columns[i].logs[j].valName + " " + currentTpl.columns[i].logs[j].DSName);
                //check the min and max depth values, they are going to be inverted, because the data is goiing to be
                //multiplied by (-1) to be displayed correctly in plot.
                if (currentTpl.minDepth == null)
                {
                    currentTpl.minDepth = currentTpl.columns[i].logs[j].depthData[currentTpl.columns[i].logs[j].depthData.length -1];
                }
                else
                {
                    if (currentTpl.minDepth < currentTpl.columns[i].logs[j].depthData[currentTpl.columns[i].logs[j].depthData.length -1])
                        currentTpl.minDepth = currentTpl.columns[i].logs[j].depthData[currentTpl.columns[i].logs[j].depthData.length -1];
                }

                if (currentTpl.maxDepth == null)
                {
                    currentTpl.maxDepth = currentTpl.columns[i].logs[j].depthData[0];
                }
                else
                {
                    if (currentTpl.maxDepth > currentTpl.columns[i].logs[j].depthData[0])
                        currentTpl.minDepth = currentTpl.columns[i].logs[j].depthData[0];
                }

                currentTpl.columns[i].logs[j].curveData =
                    new Float64Array(logsData.tmplArray[valName].depthBuf,
                        logsData.tmplArray[valName].cbyteOffSet,
                        logsData.tmplArray[valName].pointsCount);
                //alert(valName);
            }
            else {
                //alert ("valName = \"\" or there's an error: valName = " + valName);
                //currentTpl.columns[i].logs[j] = null;
            }
            //alert (currentTpl.minDepth + " " + currentTpl.maxDepth);
        } // j-loop for logs
        //alert ("aha1!");

    } //i-loop for columns
    //}
    currentTpl.yaxisMin = (-1) * currentTpl.minDepth - 20;
    currentTpl.yaxisMax = (-1) * currentTpl.maxDepth + 20;
    logsData.yaxisLength = currentTpl.yaxisLength = Math.abs(currentTpl.yaxisMax - currentTpl.yaxisMin);

    var initTickShift = (myGrid.offsetHeight / currentTpl.yaxisLength)*10;
    var initTicksCount = Math.round(currentTpl.yaxisLength *5 * logsData.zoomScale / (initTickShift));
    var initTickSize = 900/(initTicksCount*2);

    //Now I can configure the DEPTH column
    columns.push({id: "depth", name: "DEPTH"/*currentTpl.columns[0].colName*/, field: "depth",
        resizable: false, sortable: false, width: 80, /*formatter: waitingFormatter, */rerenderOnResize: true,
        asyncPostRender: renderFlotPlot = function(cellNode, row, dataContext, colDef) {
            //Custom Options are for changing the size of plot
            if (typeof customOptions != 'undefined') {
                $(cellNode).css("height", customOptions.rowHeight);
            }
            if (typeof logsData.depthPlaceholder == "undefined")
                logsData.depthPlaceholder = $(cellNode);
            //if (typeof dPlot != 'undefined') logsData.changed = 1;
            var ticksCount = Math.round(initTicksCount * logsData.initZoomScale);
            var tickShift = initTickShift * logsData.initZoomScale;
            var tickSize = initTickSize / logsData.initZoomScale;
            var pixelShift = Math.pow(cellNode.offsetHeight/ticksCount, 2) - 3;
            //alert("count  " + ticksCount + " shift " + pixelShift + " height " + cellNode.offsetHeight);
            var options = {
                xaxis: {
                    show: true,
                    min: 0,
                    max: 0,
                    tickFormatter: myFormatterChart,
                    ticks: 0
                },
                yaxis: //[
                {
                    show: true,
                    min: currentTpl.yaxisMin,//logsData.mappingMinY,
                    max: currentTpl.yaxisMax,//logsData.mappingMaxY,
                    tickDecimals: 2,
                    //tickShift: tickShift,
                    //tickFormatter: myFormatterDepth,
                    position: "left",
                    ticks: ticksCount,
                    tickSize: tickSize,
                    //ticksCount: ticksCount,
                    pxShift: pixelShift,
                    tickLength: 39
                },
                //selection: { mode: "y" },
                grid: {
                    borderWidth: 0
                }//,
                //selection: { mode: "xy" }
            };
            //$(cellNode).bind("plotselected", function(evt, range){});
            dPlot = $.plot($(cellNode),
                [
                    {
                        data: 0,
                        xaxis: 1,
                        yaxis: 1
                    }
                ],
                options
            );

            logsData.depthHolder = cellNode;
            if (typeof logsData.depthPlaceholder == 'undefined')
                logsData.depthPlaceholder = cellNode.childNodes[0];

            //if (typeof globalContext == 'undefined')
            globalContext = cellNode.childNodes[0].getContext('2d');
            // else  {
            //     globalContext.canvas.width = cellNode.clientWidth;
            //     globalContext.canvas.height = cellNode.clientHeight;
            // }
            console.log('deb');
            logsData.grid = document.getElementById('myGrid');
            //var gridClass = /*logsData.grid.className.match(/(slickgrid_\S*)/);*//(slickgrid_\S*)[\s\S]*(slickgrid_\S*)/.exec(logsData.grid.className);
            var gridClass = (/(slickgrid_\S*)[\s\S]*(slickgrid_\S*)/.exec(logsData.grid.className) == null) ? /(slickgrid_\S*)/.exec(logsData.grid.className) : /(slickgrid_\S*)[\s\S]*(slickgrid_\S*)/.exec(logsData.grid.className);
            var headerNode = document.getElementById(gridClass[gridClass.length - 1] + colDef.id);
            var spanColName = headerNode.firstChild;
            var ii = headerNode.children.length;
            for ( ; ii > 0; ii--)
            {
                headerNode.removeChild(headerNode.children[ii-1]);
            }
            //headerNode.removeChild(spanColName);
            var centerColName = document.createElement('center');
            headerNode.appendChild(centerColName);
            centerColName.appendChild(spanColName);

            var centerMeasureNode = document.createElement('center');
            headerNode.appendChild(centerMeasureNode);
            centerMeasureNode.style.position = 'inherit';
            //centerMeasureNode.style.position.top = 25;
            var measureNode = document.createElement('span');
            measureNode.textContent = 'm';
            centerMeasureNode.appendChild(measureNode);

            //var colName = document.createElement('p');
            var iii;
        }
    }); //end of creating the Depth column

    var series = [], //arr for columns, it'll contain only original curves - no fills, no nothing
        dataSeries = []; //arr for columns, that'll contain invisible curve clones, zero and max curves, fills
    series[0] = null;
    dataSeries[0] = null;
    //var numberNaN = Number.NaN;
    //console.time("template execution time");
    for (i = 1; i< currentTpl.columns.length; i++)

    {

        //array of series that has data and color definitions for plotting
        series[i] = [];
        dataSeries[i] = [];

        //don't need to fill the logs data if it was already filled once.

        currentTpl.columns[i].dataSeries = new Array();
        currentTpl.columns[i].xmin = null;
        currentTpl.columns[i].xmax = null;
        currentTpl.columns[i].plotTo = null;
        currentTpl.columns[i].plotFrom = null;

        //process float64arrays to create data sets for plotting series, concidering new values of min and max of depth
        for (j=0; j<currentTpl.columns[i].logs.length; j++)
        {
            var invCoef =1;

            //I need to memorize the xmax and xmin for every curve - i'll need it for displaying ranges and filling the plot areas
            if (currentTpl.columns[i].logs[j].valName != "")
            {
                currentTpl.columns[i].dataSeries[j] = new Array();

                //check the max value
                if (typeof currentTpl.columns[i].logs[j].depthData != 'undefined')
                {

                    if (currentTpl.columns[i].logs[j].depthData[0] >
                        currentTpl.maxDepth)
                    {
                        //add the point at this max depth with a NaN value in it
                        currentTpl.columns[i].dataSeries[j].push([Number.NaN, -currentTpl.maxDepth]);
                    }
                }

                for (var k=0; k<currentTpl.columns[i].logs[j].pointsCount; k++)
                {
                    if (currentTpl.columns[i].logs[j].curveData[k] != -5.666666666666667e+307)
                    {
                        currentTpl.columns[i].dataSeries[j].push([currentTpl.columns[i].logs[j].curveData[k]*invCoef/*BIG_NUMBER*/, -currentTpl.columns[i].logs[j].depthData[k]]);
                        //figure out if xmax and xmin are > or < than currentTpl.columns[i].logs[j].curveData[k]
                        if (currentTpl.columns[i].xmin == null)
                        {
                            currentTpl.columns[i].xmin = currentTpl.columns[i].dataSeries[j][k][0]*invCoef;
                        }
                        else
                        {
                            if (currentTpl.columns[i].xmin > currentTpl.columns[i].dataSeries[j][k][0]*invCoef)
                                currentTpl.columns[i].xmin = currentTpl.columns[i].dataSeries[j][k][0]*invCoef;
                        }

                        if (currentTpl.columns[i].xmax == null)
                        {
                            currentTpl.columns[i].xmax = currentTpl.columns[i].dataSeries[j][k][0]*invCoef;
                        }
                        else
                        {
                            if (currentTpl.columns[i].xmax < currentTpl.columns[i].dataSeries[j][k][0]*invCoef)
                                currentTpl.columns[i].xmax = currentTpl.columns[i].dataSeries[j][k][0]*invCoef;
                        }
                    }
                    else
                        currentTpl.columns[i].dataSeries[j].push([Number.NaN, -currentTpl.columns[i].logs[j].depthData[k]]);

                }

                //Change xmin and xmax values if invCoef == -1? Should I?
                if (currentTpl.columns[i].logs[j].inverse)
                {
                    //
                    for (k= 0; k<currentTpl.columns[i].dataSeries[j].length; k++)
                    {
                        //
                        currentTpl.columns[i].dataSeries[j][k][0] *= -1;
                        //currentTpl.columns[i].dataSeries[j][k][0] += currentTpl.columns[i].xmax;
                    }
                }

                //check the min value
                if (typeof currentTpl.columns[i].logs[j].depthData != 'undefined')
                {

                    if (currentTpl.columns[i].logs[j].depthData[currentTpl.columns[i].logs[j].depthData.length -1] <
                        currentTpl.minDepth)
                    {
                        //add the point at this min depth with a NaN value in it
                        currentTpl.columns[i].dataSeries[j].push([Number.NaN, -currentTpl.minDepth]);
                    }
                }

                //check the plotTo and plotFrom values.
                if (currentTpl.columns[i].plotTo != null) {
                    //
                    currentTpl.columns[i].plotTo = (currentTpl.columns[i].plotTo > currentTpl.columns[i].logs[j].plotTo) ?
                        currentTpl.columns[i].plotTo : currentTpl.columns[i].logs[j].plotTo;
                }
                else {
                    //
                    currentTpl.columns[i].plotTo = currentTpl.columns[i].logs[j].plotTo;
                }

                if (currentTpl.columns[i].plotFrom != null) {
                    //
                    currentTpl.columns[i].plotFrom = (currentTpl.columns[i].plotFrom < currentTpl.columns[i].logs[j].plotFrom) ?
                        currentTpl.columns[i].plotFrom : currentTpl.columns[i].logs[j].plotFrom;
                }
                else {
                    //
                    currentTpl.columns[i].plotFrom = currentTpl.columns[i].logs[j].plotFrom;
                }
            }
            else{
                currentTpl.columns[i].dataSeries[j] = null;
            }
            //Form filling option in a new loop

        }

        //Here i switch between different ways of displaying data:
        //1) none - means just a simple curves visualisation (with fills and all, but no sketches, color panels, etc. - plot
        //2) clkImg - color panels - creating canvas and filling it with divs of given colors.
        //others - later
        switch (currentTpl.columns[i].colKind) {
            case "None":

                //last preparations before filling the series and filling them
                for (j=0; j<currentTpl.columns[i].logs.length; j++)
                {
                    if (currentTpl.columns[i].logs[j].inverse)
                    {
                        //
                        for (k= 0; k<currentTpl.columns[i].dataSeries[j].length; k++)
                        {
                            //
                            //currentTpl.columns[i].dataSeries[j][k][0] *= -1;
                            currentTpl.columns[i].dataSeries[j][k][0] += currentTpl.columns[i].xmax;
                        }
                        currentTpl.columns[i].logs[j].xzero = currentTpl.columns[i].xmax;
                    }
                    else
                        currentTpl.columns[i].logs[j].xzero = 0;
                    //Check if the color name is recognisable
                    var tempCol=null;
                    if (currentTpl.columns[i].logs[j].customColor == 'Cream')
                        tempCol = "#eee8aa";
                    if (currentTpl.columns[i].logs[j].customColor == 'MedGray')
                        tempCol = "#708090";
                    //series are the original curves that will be added after all the fills and drawn above them

                    series[i][j]={id: currentTpl.columns[i].logs[j].valName,
                        data: currentTpl.columns[i].dataSeries[j],
                        lines: {show: true, lineWidth: 1, shadowSize: 0},
                        shadowSize: 0,
                        color: (tempCol == null) ? currentTpl.columns[i].logs[j].customColor : tempCol//,
                        //texture: null
                    };
                    currentTpl.columns[i].logs[j].copies = 0;
                }

                var copyK = 0;


                //var fillsLength = dataSeries[i].length - 1;
                for (j=0; j<series[i].length; j++)
                {
                    dataSeries[i].push(series[i][j]);
                }



                //now push the dataSeries plotter into the grid
                columns.push({id: currentTpl.columns[i].colName,
                    name: currentTpl.columns[i].colName,
                    field: i, sortable: false, width: 80,/* formatter: waitingFormatter, */rerenderOnResize: true,
                    asyncPostRender: renderFlotPlot = function(cellNode, row, dataContext, colDef) {
                        if (typeof customOptions != 'undefined') {
                            $(cellNode).css("height", customOptions.rowHeight);
                        }

                        var options = {
                            //lines: {show: true},
                            //fillBetween: null,
                            xaxis: {
                                show: true,

                                tickFormatter: myFormatterChart,
                                ticks: 0,
                                tickSize: 0//,
                            },
                            yaxis: {
                                show: true,
                                min: currentTpl.yaxisMin,//logsData.mappingMinY,
                                max: currentTpl.yaxisMax,//logsData.mappingMaxY,
                                tickFormatter: myFormatterChart,
                                ticks: 0,
                                tickSize: 0//,

                            },
                            grid: {
                                borderWidth: 0
                            }
                        };
                        var cPlot = $.plot(
                            $(cellNode),

                            dataSeries[colDef.field],

                            options
                        );
                        /*var gridClass = (/(slickgrid_\S*)[\s\S]*(slickgrid_\S*)/.exec(logsData.grid.className) == null) ? /(slickgrid_\S*)/.exec(logsData.grid.className) : /(slickgrid_\S*)[\s\S]*(slickgrid_\S*)/.exec(logsData.grid.className);
                         var headerNode = document.getElementById(gridClass[gridClass.length - 1] + colDef.id);
                         //var headerNode = document.getElementById(gridClass[0] + colDef.id);
                         var spanColName = headerNode.firstChild;
                         var ii = headerNode.children.length;
                         for ( ; ii > 0; ii--)
                         {
                         if (headerNode.children[ii-1].tagName != 'DIV')
                         headerNode.removeChild(headerNode.children[ii-1]);
                         }
                         //headerNode.removeChild(spanColName);
                         var centerColName = document.createElement('center');
                         headerNode.appendChild(centerColName);
                         centerColName.style.position = 'inherit';
                         centerColName.appendChild(spanColName); */

                        /*var centerMeasureNode = document.createElement('center');
                         headerNode.appendChild(centerMeasureNode);
                         centerMeasureNode.style.position = 'inherit';
                         centerMeasureNode.style.top = 20;
                         var dsName = currentTpl.columns[colDef.field].logs[0].valName + "_" + currentTpl.columns[colDef.field].logs[0].DSName;
                         var measureNode = document.createElement('span');
                         measureNode.textContent = (typeof logsData.tmplArray[dsName] == 'undefined' || logsData.tmplArray[dsName] == null) ? " " : logsData.tmplArray[dsName].unitName;
                         centerMeasureNode.appendChild(measureNode);

                         var plotFromNode = document.createElement('span');
                         plotFromNode.textContent = currentTpl.columns[colDef.field].plotFrom;
                         headerNode.appendChild(plotFromNode);
                         plotFromNode.style.position = 'inherit';
                         plotFromNode.style.top = 35;
                         plotFromNode.style.left = 0;

                         var plotToNode = document.createElement('span');
                         plotToNode.textContent = currentTpl.columns[colDef.field].plotTo;
                         headerNode.appendChild(plotToNode);
                         plotToNode.style.position = 'absolute';
                         plotToNode.style.top = 35;
                         plotToNode.style.right = 0;    */
                    }
                });
                break;
            case "clkImg": //do nothing at the moment

                break;
            default:
                break;
        }

    }
    //console.timeEnd("template execution time");


    var first = 0;
    var pressed = false;
    var optionsGrid = {
        editable: true,
        enableAddRow: false,
        enableCellNavigation: true,
        asyncEditorLoading: false,
        enableAsyncPostRender: true,
        rowHeight: logsData.initRowHeigh
    };

    $(function () {
        for (var i = 0; i < 1; i++) {
            var d = (data[i] = {});
        }

        var target;

        console.time("grid execution time");
        grid = new Slick.Grid("#myGrid", data, columns, optionsGrid);
        console.timeEnd("grid execution time");

        //var myGr = document.getElementById('myGrid');
        //var
        //logsData.depthPlaceholder = logsData.depthHolder.children[1];
        window.onmousewheel = function (e) {
            //var evt = e;//window.event;

            e.stopPropagation();
            //alert (evt.wheelDelta);
            //if (logsData.initZoomScale != 30)
            {
                if (e.shiftKey) {
                    //here i should add the Yposition of cursor and zoom into this position
                    customOptions = grid.getOptions();
                    var currentHeight = customOptions.rowHeight;
                    if ((e.wheelDelta > 0) && (logsData.initZoomScale != 30)) { //scroll in
                        customOptions.rowHeight += 100*logsData.initZoomScale;
                        logsData.zoomScale = Math.abs(customOptions.rowHeight/currentHeight); //for zoom
                        logsData.initZoomScale = Math.abs(customOptions.rowHeight/logsData.initRowHeigh); //for ticks
                        if (logsData.initZoomScale > 30){
                            logsData.initZoomScale = 30;
                            //return 0;
                        }
                        //else {
                        //customOptions.rowHeight = logsData.initRowHeigh * logsData.initZoomScale;
                        customOptions.rowHeight = logsData.initRowHeigh * logsData.initZoomScale;
                        grid.setOptions(customOptions);
                        //grid.resizeCanvas();
                        //grid.updateRow();
                        grid.invalidateRows();
                        //grid.updateRow(1);
                        grid.resizeCanvas();
                        logsData.customScrollTop += Math.abs((customOptions.rowHeight - currentHeight)*logsData.zoomScale/2);
                        //var y = Math.round(logsData.visibleTop + logsData.initRowHeigh/2);
                        var y = Math.round(logsData.customScrollTop);
                        grid.scrollTo(y);
                        grid.render();
                    }
                    else {
                        if ((e.wheelDelta < 0) && (logsData.initZoomScale != 1)) { //scroll out
                            customOptions.rowHeight -= 100*logsData.initZoomScale;
                            logsData.zoomScale = Math.abs(customOptions.rowHeight/currentHeight); //for zoom
                            logsData.initZoomScale = Math.abs(customOptions.rowHeight/logsData.initRowHeigh); //for ticks
                            if (logsData.initZoomScale < 1){
                                logsData.initZoomScale = 1;
                                //return 0;
                            }
                            //else {
                            //customOptions.rowHeight = logsData.initRowHeigh * logsData.initZoomScale;
                            customOptions.rowHeight = logsData.initRowHeigh * logsData.initZoomScale;
                            grid.setOptions(customOptions);
                            //grid.resizeCanvas();
                            //grid.updateRow();
                            grid.invalidateRows();
                            //grid.updateRow(1);
                            grid.resizeCanvas();
                            logsData.customScrollTop -= Math.abs((customOptions.rowHeight - currentHeight)*logsData.zoomScale/2);

                            //var y = Math.round(logsData.visibleTop + logsData.initRowHeigh/2);
                            var y = Math.round(logsData.customScrollTop);
                            grid.scrollTo(y);
                            grid.render();
                        }
                        else if(logsData.initZoomScale == 1) {
                            logsData.customScrollTop = 0;
                        }
                        //else { alert ("wheelDeltaY == 0");} //do nothing
                    }

                }
                else {
                    customOptions = grid.getOptions();
                    if (e.wheelDelta < 0)
                        if (logsData.customScrollTop <= customOptions.rowHeight - logsData.initRowHeigh - e.wheelDelta)
                            logsData.customScrollTop += Math.abs(e.wheelDelta);
                        else
                            logsData.customScrollTop = customOptions.rowHeight - logsData.initRowHeigh;
                    else
                    if (logsData.customScrollTop >= e.wheelDelta)
                        logsData.customScrollTop -= Math.abs(e.wheelDelta);
                    else
                        logsData.customScrollTop = 0;
                    //logsData.customScrollTop = e.target.scrollTop;
                }
            }
        };

        window.addEventListener('mousedown', startDrag, true);

        function startDrag(e) {
            if (e.target.className == 'overlay')  {
                //return;
                pressed = true;
                //e.preventDefault();
                e.stopPropagation();
                target = e.target;
                var i = 0;
                console.log("START: offsetY = " + e.offsetY);
                logsData.startOffsetY = prevOffset = e.offsetY;
                //logsData.startOffsetY = prevOffset = e.offsetY;
                logsData.startScreenY = e.pageY;
                while (!(target.className.indexOf(logsData.depthHolder.className) +1) && i<10)
                {
                    target = target.parentNode;
                    //alert (target.className + " " + logsData.depthHolder);
                    i++;
                    if (typeof target == 'undefined')
                        console.log('target is undefined');
                }

                //}
                //}
            }
            else if (e.target.className == 'tickLabel') {
                pressed = true;
                //e.preventDefault();
                e.stopPropagation();
                target = e.target;
                var i = 0;
                console.log("START: offsetY = " + (target.top + e.offsetY));
                logsData.startOffsetY = prevOffset = target.offsetTop + e.offsetY;
                //logsData.startOffsetY = prevOffset = e.offsetY;
                logsData.startScreenY = e.pageY;
                while (!(target.className.indexOf(logsData.depthHolder.className) +1) && i<10)
                {
                    target = target.parentNode;
                    //alert (target.className + " " + logsData.depthHolder);
                    i++;
                    if (typeof target == 'undefined')
                        console.log('target is undefined');
                }
            }

            globalContext.save();
            //globalContext.translate(0,0);
            globalContext.strokeStyle = 'rgba(0, 0, 255, 0.7)';
            globalContext.lineWidth = 1;
            globalContext.lineJoin = 'round';
            globalContext.fillStyle = 'rgba(0, 0, 255, 0.3)';
            globalContext.restore();
            globalContext.save();
        }

        window.addEventListener('mousemove', moveIt, true);
        function moveIt(e) {
            if (e.shiftKey && pressed) {
                target = e.target;
                e.preventDefault();
                e.stopPropagation();
                if (e.target.className == 'overlay') {

                    if (typeof prevOffset == 'undefined')
                        prevOffset = logsData.startOffsetY;
                    globalContext.save();
                    globalContext.clearRect(0, logsData.startOffsetY, 78, Math.abs(prevOffset - logsData.startOffsetY));
                    globalContext.strokeStyle = 'rgba(0, 0, 255, 0.7)';
                    //globalContext.lineWidth = 1;
                    //globalContext.lineJoin = 'round';
                    globalContext.fillStyle = 'rgba(0, 0, 255, 0.3)';
                    globalContext.fillRect(0, logsData.startOffsetY, 78, Math.abs(e.offsetY - logsData.startOffsetY));
                    //globalContext.strokeRect(0, logsData.startOffsetY, logsData.depthPlaceholder.width(), Math.abs(e.offsetY - logsData.startOffsetY));
                    console.log(e.target.className + 'logsData.startOffsetY = ' + logsData.startOffsetY  + ' Math.abs(e.offsetY - logsData.startOffsetY) = ' +
                        Math.abs(e.offsetY - logsData.startOffsetY) + ' prevOffset = ' + prevOffset);
                    prevOffset = e.offsetY;
                    globalContext.restore();
                }
                else if (e.target.className == 'tickLabel') {
                    if (typeof prevOffset == 'undefined')
                        prevOffset = logsData.startOffsetY;
                    globalContext.save();
                    globalContext.clearRect(0, logsData.startOffsetY, 78, Math.abs(prevOffset - logsData.startOffsetY));
                    globalContext.strokeStyle = 'rgba(0, 0, 255, 0.7)';

                    globalContext.fillStyle = 'rgba(0, 0, 255, 0.3)';
                    globalContext.fillRect(0, logsData.startOffsetY, 78, Math.abs(e.offsetY + target.offsetTop - logsData.startOffsetY));
                    //globalContext.strokeRect(0, logsData.startOffsetY, logsData.depthPlaceholder.width(), Math.abs(e.offsetY - logsData.startOffsetY));
                    console.log(e.target.className + 'logsData.startOffsetY = ' + logsData.startOffsetY + ' Math.abs(e.offsetY - logsData.startOffsetY) = ' +
                        Math.abs(e.offsetY + target.offsetTop - logsData.startOffsetY) + ' prevOffset = ' + prevOffset + 'offsetTop = ' + target.offsetTop);
                    prevOffset = e.offsetY + target.offsetTop;
                    globalContext.restore();
                }

            }
        }

        $(window).mouseup(function (e) {
            if (e.target.className == 'overlay' || e.target.className == 'tickLabel') {
                //return;
                pressed = false;
                //e.preventDefault();
                e.stopPropagation();
                //window.releaseEvents(Event.MOUSEMOVE);
                if (logsData.initZoomScale != 30) {
                    target = e.target;
                    var i = 0;
                    //logsData.endOffsetY = e.offsetY;
                    logsData.endScreenY = e.pageY;
                    logsData.endOffsetY = logsData.startOffsetY + (logsData.endScreenY - logsData.startScreenY);
                    if (e.which == 1 && e.shiftKey) {
                        //globalContext.destroy();
                        console.log("END: offsetY = " + e.offsetY);
                        logsData.customScrollTop = logsData.startOffsetY;

                        customOptions = grid.getOptions();

                        var currentHeight = customOptions.rowHeight;
                        var diff = logsData.endOffsetY - logsData.startOffsetY;
                        var scale = Math.abs(logsData.yaxisLength/customOptions.rowHeight);
                        logsData.zoomScale = currentHeight/diff;
                        customOptions.rowHeight = currentHeight * logsData.zoomScale;
                        logsData.initZoomScale = customOptions.rowHeight/logsData.initRowHeigh;

                        if (logsData.initZoomScale > 30){
                            logsData.zoomScale *= 30/logsData.initZoomScale;
                            logsData.initZoomScale = 30;
                            //return 0;
                        }

                        customOptions.rowHeight = logsData.initRowHeigh * logsData.initZoomScale;

                        var y = (diff>=0) ? Math.round(logsData.startOffsetY * logsData.zoomScale) : Math.round(logsData.endOffsetY * logsData.zoomScale);
                        logsData.customScrollTop = y;
                        grid.setOptions(customOptions);

                        grid.invalidateRows();
                        //grid.updateRow(1);
                        grid.resizeCanvas();
                        //grid.handleScroll();
                        console.log('y = ' + y);
                        grid.scrollTo(y);
                        globalContext.save();
                        grid.render();
                        //}
                    }
                }
                else {
                    target = e.target;
                    var i = 0;
                    //logsData.endOffsetY = e.offsetY;
                    logsData.endScreenY = e.pageY;
                    logsData.endOffsetY = logsData.startOffsetY + (logsData.endScreenY - logsData.startScreenY);
                    if (e.which == 1 && e.shiftKey) {
                        //globalContext.destroy();
                        console.log("END: offsetY = " + e.offsetY);

                        if (logsData.initZoomScale > 30){

                            logsData.initZoomScale = 30;
                            //return 0;
                        }

                        var y = (diff>=0) ? Math.round(logsData.startOffsetY) : Math.round(logsData.endOffsetY);
                        logsData.customScrollTop = y;

                        grid.invalidateRows();
                        //grid.updateRow(1);
                        grid.resizeCanvas();
                        //grid.handleScroll();
                        console.log('y = ' + y);
                        grid.scrollTo(y);
                        globalContext.save();
                        grid.render();
                    }
                }
            }
            else if (e.target.className == 'tickLabel') {
            }
        });

        grid.onColumnsReordered.subscribe(function(e, args) {
            //alert ("entered")
        })

    });

    //alert ("aha2!");
}

function tmpFilesProcess() {
    for (var ind = 0; ind < tmpFiles.length; ind++)
    {
        if (typeof tmpFiles[ind] != "undefined")
        {
            logsData.arrBuffer[ind] = stringToBuffer(tmpFiles[ind].ldf);
            logsData.fillCurvesData(ind, tmpFiles[ind]);
        }
        else
        {
            logsData.arrBuffer[ind] = null;
        }
    }
    delete tmpFiles;
}



fileInput.addEventListener('change', function(evt) {
    //


    evt.target.style.display = "none";
    evt.target.innerHTML = "hide";

    document.getElementById("tl").style.visibility = "visible";

    model.getEntries(fileInput.files[0], function(entries) {

        var ii = 0;
        entries.forEach(function(entry) {
            //
            entry.number = ii++;
            entry.allLength = entries.length;

            model.getEntryFile(entry);

        });

        //for (var n in entries) {
        //model.getEntryFile(n);

        //}
    });
});

//document.getElementById('fileinput').addEventListener('change', readSingleFile, false);
document.getElementById('tl').addEventListener('change', displayTemplate, false);
