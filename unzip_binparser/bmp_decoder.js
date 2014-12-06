/**
 * Created by JetBrains WebStorm.
 * User: ngaripova
 * Date: 29.05.12
 * Time: 11:01
 * To change this template use File | Settings | File Templates.
 */
Math.randInRange = function (lbounds, ubounds) {
    return (Math.random() * ubounds) + lbounds;
}

function Texture2d(d,w,h) {
    this._data = d;
    this._width = w;
    this._height = h;
}

Texture2d.noise = function (width, height) {
    var d = [];
    for (var x = 0; x != width; ++x) {
        for (var y = 0; y != height; ++y) {
            var i = (x + y * width) * 4;
            d[i + 0] = parseInt(Math.randInRange(0, 255)); // Red channel
            d[i + 1] = parseInt(Math.randInRange(0, 255)); // Green channel
            d[i + 2] = parseInt(Math.randInRange(0, 255)); // Blue channel
            d[i + 3] = parseInt(Math.randInRange(0, 255)); // Alpha channel
        }
    }
    return new Texture2d(d, width, height);
}

// the one-dimensional array containing the data in RGBA order, as integers in the range 0 to 255.
Texture2d.prototype.data = function (d) {
    if (undefined != d) {
        this._data = d;
    }
    return this._data;
}

Texture2d.prototype.width = function (w) {
    if (undefined != w) {
        this._width = w;
    }
    return this._width;
}

Texture2d.prototype.height = function (h) {
    if (undefined != h) {
        this._height = h;
    }
    return this._height;
}

Texture2d.prototype.draw = function (canvas) {
    ctx1 = canvas.getContext("2d");

    canvas.setAttribute('width', this.width());
    canvas.setAttribute('height', this.height());

    var w = this.width();
    var h = this.height();
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            var i = (x + y * w) * 4;

            var r = this._data[i + 0];
            var g = this._data[i + 1];
            var b = this._data[i + 2];
            var a = this._data[i + 3];

            ctx1.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
            ctx1.fillRect(x, y, 1, 1);
        }
    }
}

function ByteStream(byteArray) {
    if (byteArray == undefined) {
        this._stream = [];
    } else {
        this._stream = byteArray;
    }
    this._position = 0;
}

ByteStream.prototype.position = function(p) {
    if (undefined != p) {
        this._position = p;
    }
    return this._position;
}

ByteStream.prototype.length = function() {
    return this._stream.length;
}

ByteStream.prototype.eof = function() {
    var l = this.length();
    var p = this.position();
    return (p >= l);
}

ByteStream.prototype.seek = function(origin, count) {
    this.position(origin + count);
}

ByteStream.prototype.readByte = function () {
    if (this.eof()) {
        return undefined;
    }

    var p = this.position();
    var b = this._stream.substring(p, p+2);
    this.position(p + 2);

    // strings would be this way
    //    var c = b.charCodeAt(0);
    //    if (undefined == c) {
    //        debugger; // yikes!
    //    }
    //    return c;

    // for byte arrays just return it
    //return b;

    // with hex CSV make sure we call parseInt
    return parseInt(b, 16);
}

ByteStream.prototype.readBytes = function (numBytes) {
    var b = [];
    for (var i = 0; i < numBytes; ++i) {
        b[i] = this.readByte();
    }
    return b;
}

ByteStream.prototype.readInt16 = function () {
    var b = this.readBytes(2);
    var i = (b[1] << 8) + b[0];
    return i;
}

ByteStream.prototype.readInt32 = function () {
    var b = this.readBytes(4);
    var i = (b[3] << 24) + (b[2] << 16) + (b[1] << 8) + b[0];
    return i;
}

/*ByteStream.prototype.readString = function (length) {
    var b = this.readBytes(length);
    var s = "";
    for (var i = 0; i < length; ++i) {
        s += String.fromCharCode(b[i]);
    }
    return s;
} */


ByteStream.prototype.readString = function (length) {
    var b = this._stream.substring(this._position, this._position+ length); //this.readBytes(length);
    var s = "";
    for (var i = 0; i < length; i += 2) {
        s += String.fromCharCode(parseInt(b[i]+b[i+1],16));
    }
    this._position += length;
    return s;
}



function BitmapDecoder() {
}

BitmapDecoder.prototype.decode = function (byteArray) {
    var memStream = new ByteStream(byteArray);

    // based on http://www.dragonwins.com/bmp/bmpfileformat.htm

    //first read 4 bytes that represent size
    this.cusFileSize = memStream.readInt32();
    this.magic = memStream.readString(4);
    this.fileSize = memStream.readInt32();

    memStream.readInt16(); // unused
    memStream.readInt16(); // unused

    this.dataStart = memStream.readInt32();
    this.headerLength = memStream.readInt32();
    this.width = memStream.readInt32();
    this.height = memStream.readInt32();
    this.colorPlaneCount = memStream.readInt16();
    this.bitsPerPixel = memStream.readInt16();
    this.compressionMethod = memStream.readInt32();
    this.rawSize = memStream.readInt32();
    this.horizontalResolution = memStream.readInt32();
    this.verticalResolution = memStream.readInt32();
    this.numberOfPaletteColors = memStream.readInt32();
    this.numberOfImportantColors = memStream.readInt32();

    if (memStream.position() != (this.dataStart+4)*2) {
        //memStream._position = (this.dataStart+4)*2;
        //debugger;
        //return; // corrupt header
    }

    var textureData = [];
    var padding = 4 - ((this.width * 3) % 4); // scanlines are padded to ensure DWORD size

    for (var y = this.height-1; y >= 0; --y) { // bmp scanlines go bottom up
        //memStream.readBytes(1);
        for (var x = 0; x < this.width; ++x) {
            var pixel = memStream.readBytes(3);

            var i = (x + y * this.width) * 4;
            textureData[i++] = pixel[2];    // r
            textureData[i++] = pixel[1];    // g
            textureData[i++] = pixel[0];    // b
            textureData[i++] = 1;           // a

            //if (x == this.width-1) {
                //memStream.readBytes(padding);
            //}
        }
    }

    this.texture = new Texture2d(textureData, this.width, this.height);

    return this.texture;
}