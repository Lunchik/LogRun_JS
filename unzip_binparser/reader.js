/**
 * Created by JetBrains WebStorm.
 * User: ngaripova
 * Date: 05.05.12
 * Time: 9:04
 * To change this template use File | Settings | File Templates.
 */


function FigureFileExtension(file) {
    //alert ("this = " + this);
    var fileName;
    while (file.indexOf("\\") != -1)
        file = file.slice(file.indexOf("\\") + 1);
    this.ext = file.slice(file.indexOf(".")).toLowerCase();
    this.fileName = file.slice(0, file.indexOf("."));
}

function LogsObject()
{
    this.init = function () {
        this.headerSize = 256;
        this.pointsCount = 0;
        this.logsCount = 0;
        this.curvesCount =0;
        this.curveArray = new Array();
        this.tmplArray = new Array();
        this.changed = false;
        this.zoomScale = 1;
        this.tickShift = 10;
        //this.byteOffset = 0;
    };
    this.fill = function (fileInfo, contents) {
        var lddRead, ldfRead;
        switch (fileInfo.ext) {
            case ".ldf": //save the binary contents
                this.arrBuffer = contents;
                break;
            case ".ldd": //parse and save the properties
                var regCurveDescriptors = /<([^]*)>/gm;
                var regItem = /item([^]*)end/;
                var regValName = /(?:ValName\s=\s)((.)*)/g;
                var regOriginName = /(?=OriginName\s=\s)((.)*)/g;
                var regValUnit = /(?:ValUnit\s=\s)((.)*)/g;
                var regMeaId = /(?:MeaUnits.MeaId\s=\s)((.)*)/g;
                var regMeaSym = /(?:MeaUnits.Sym\s=\s)((.)*)/g;
                var regMeaSymSI = /(?:MeaUnits.SymSI\s=\s)((.)*)/g;
                var regMeaSymOrig = /(?:MeaUnits.SymOrig\s=\s)((.)*)/g;
                var regColor = /(?:Color\s=\s)((.)*)/g;
                var supRegItem = /item/m;
                var supRegEnd = /end/m;
                var regPointsCount = /(?:PointCount\s=\s)((\d)*)/i;
                var regUID = /(?:UID\s=\s)((\d)*)/g;
                var pointsArray = regPointsCount.exec(contents);
                this.pointsCount = pointsArray[1] - 0;
                var supCurveDecsPos = contents.search(regCurveDescriptors);
                var curveDescriptors = contents.match(regCurveDescriptors);
                var supItemIndex = curveDescriptors[0].search(supRegItem);
                var supEndIndex = curveDescriptors[0].search(supRegEnd) +3;
                //var UIDArray = (contents.substring(0, supItemIndex)).match(regUID);
                var depthUIDArray = (contents.substring(0, supCurveDecsPos)).match(regUID);
                var k=0;
                this.tmplArray[k] = new Object();
                this.tmplArray[k].UID = depthUIDArray[0].match(/[0-9]/);
                this.tmplArray[k].customColor = "None";
                //var tempDesc = myArray3[k].match(/'((.)*)'/g)[0];
                this.tmplArray[k].description = "DEPTH";
                k++;
                var iCheck = true;
                //alert (curveDescriptors[0].substring(supItemIndex, supEndIndex));
                //var tester = contents.match(regValName);
                for ( ; ; )
                {
                    this.tmplArray[k] = new Object();
                    var UIDArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regUID);
                    this.tmplArray[k].UID = UIDArray[0].match(/[0-9]/);
                    var origNameArray , temp;
                    if ((origNameArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regOriginName)) != null) {
                        if ((temp = origNameArray[0].match(/(#)((.)*)/g)) == null){
                            temp = origNameArray[0].match(/'((.)*)'/g);
                            this.tmplArray[k].originName = temp[0].substring(1, temp[0].length-1);
                        }
                    }
                    else this.tmplArray[k].originName = " ";

                    var valNameArray;
                    if ((valNameArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regValName)) != null) {
                        if ((temp = valNameArray[0].match(/(#)((.)*)/g)) == null){
                            temp = valNameArray[0].match(/'((.)*)'/g);
                            this.tmplArray[k].valName = temp[0].substring(1, temp[0].length-1);
                        }
                    }
                    else this.tmplArray[k].valName = " ";

                    var valUnitArray;
                    if ((valUnitArray= (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regValUnit)) != null) {
                        if ((temp = valUnitArray[0].match(/(#)((.)*)/g)) == null){
                            temp = valUnitArray[0].match(/'((.)*)'/g);
                            this.tmplArray[k].unitName = temp[0].substring(1, temp[0].length-1);
                        }
                    }
                    else this.tmplArray[k].unitName = " ";

                    var colorArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regColor);
                    var tempColorArray = colorArray[0].match(/(?:cl)((.)*)/g)[0];
                    this.tmplArray[k].customColor = tempColorArray.substring(2, colorArray[0].length);

                    var meaIdArray;
                    if ((meaIdArray = (curveDescriptors[0].substring(supItemIndex, supEndIndex)).match(regMeaId)) != null){
                        this.tmplArray[k].meaID = meaIdArray[0].match(/[0-9]/);
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
                    k++;
                    var tempItem = supItemIndex, tempEnd = supEndIndex;
                    supItemIndex = (curveDescriptors[0].substring(supEndIndex, curveDescriptors[0].length)).search(supRegItem);
                    supEndIndex = (curveDescriptors[0].substring(supEndIndex + supItemIndex, curveDescriptors[0].length)).search(supRegEnd) +6;
                    if (supItemIndex <= 0)
                        break;
                    supItemIndex += tempEnd;
                    supEndIndex += tempEnd+3;


                }
                //alert ("oneoneone");

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
                break;
            default:
                break;
        }
    };

}

function readSingleFile(evt) {

    function readProcess(evt)
    {
        //Retrieve the first (and only!) File from the FileList object
        var f = evt.target.files[0];


        if (f) {
            var r = new FileReader();
            r.onload = function (e) {
//                var contents = e.target.result;
                onZipReceived(e.target.result);
            };
            r.readAsBinaryString(f);
//              r.close();
        } else {
            alert("Failed to load file");
        }
    }


    function onZipReceived(data) {
        var unzip = new JSUnzip();
        var result = unzip.open(data);
        if (!result.status) {
            alert('Error: ' + result.error);
            return;
        }
        if (unzip.comment)
            alert("The zip contains a comment:" + unzip.comment);
        for (var n in unzip.files) {
            var result = unzip.read(n);
            if (!result.status)
                alert('Error: ' + result.error);
            else {
                var fileinfo = new FigureFileExtension(n);
                logsData.fill(fileinfo, result.data);

            }
                //alert ("111");
        }
    }

    var logsData = new LogsObject();

    logsData.init();
    readProcess(evt);
}