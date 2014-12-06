/**
 * Created by JetBrains WebStorm.
 * User: ngaripova
 * Date: 01.06.12
 * Time: 13:11
 * To change this template use File | Settings | File Templates.
 */
function plotLineArea(datapoints, axisx, axisy) {
    var points = datapoints.points,
        ps = datapoints.pointsize,
        left = Math.min(Math.max(0, axisx.min), axisx.max),
        i = 0, top, areaOpen = false,
        ypos = 1, xpos = 0, segmentStart = 0, segmentEnd = 0;

    // we process each segment in two turns, first forward
    // direction to sketch out top, then once we hit the
    // end we go backwards to sketch the bottom
    while (true) {
        if (ps > 0 && i > points.length + ps)
            break;

        i += ps; // ps is negative if going backwards

        var x1 = points[i - ps + xpos],
            y1 = points[i - ps + ypos],
            x2 = points[i + xpos], y2 = points[i + ypos];

        if (areaOpen) {
            if (ps > 0 && x1 != null && x2 == null) {
                // at turning point
                segmentEnd = i;
                ps = -ps;
                xpos = 2;
                continue;
            }

            if (ps < 0 && i == segmentStart + ps) {
                // done with the reverse sweep
                ctx.fill();
                areaOpen = false;
                ps = -ps;
                ypos = 1;
                i = segmentStart = segmentEnd + ps;
                continue;
            }
        }

        if (y1 == null || y2 == null)
            continue;



        //clip y values differently - like the x values
        // clip with xmin
        if (y1 <= y2 && y1 < axisy.min) {
            if (y2 < axisy.min)
                continue;
            x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
            y1 = axisy.min;
        }
        else if (y2 <= y1 && y2 < axisy.min) {
            if (y1 < axisy.min)
                continue;
            x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
            y2 = axisy.min;
        }

        // clip with xmax
        if (y1 >= y2 && y1 > axisy.max) {
            if (y2 > axisy.max)
                continue;
            x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
            y1 = axisy.max;
        }
        else if (y2 >= y1 && y2 > axisy.max) {
            if (y1 > axisy.max)
                continue;
            x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
            y2 = axisy.max;
        }


        if (!areaOpen) {
            // open area
            ctx.beginPath();
            //ctx.moveTo(axisx.p2c(x1), axisy.p2c(bottom));
            ctx.moveTo(axisx.p2c(left), axisy.p2c(y1));
            areaOpen = true;
        }

        // now first check the case where both is outside
        if (x1 >= axisx.max && x2 >= axisx.max) {
            ctx.lineTo(axisx.p2c(axisx.max), axisy.p2c(y1));
            //ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.max));
            ctx.lineTo(axisx.p2c(axisx.max), axisy.p2c(y2));
            //ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.max));
            continue;
        }
        else if (y1 <= axisy.min && y2 <= axisy.min) {
            ctx.lineTo(axisx.p2c(axisx.min), axisy.p2c(y1));
            //ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.min));
            ctx.lineTo(axisx.p2c(axisx.min), axisy.p2c(y2));
            //ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.min));
            continue;
        }

        // else it's a bit more complicated, there might
        // be a flat maxed out rectangle first, then a
        // triangular cutout or reverse; to find these
        // keep track of the current x values
        var y1old = y1, y2old = y2;


        // clip with xmin
        if (x1 <= x2 && x1 < axisx.min && x2 >= axisx.min) {
            //y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
            x1 = axisx.min;
        }
        else if (x2 <= x1 && x2 < axisx.min && x1 >= axisx.min) {
            //y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
            x2 = axisx.min;
        }

        // clip with xmax
        if (x1 >= x2 && x1 > axisx.max && x2 <= axisx.max) {
            //y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
            x1 = axisx.max;
        }
        else if (x2 >= x1 && x2 > axisx.max && x1 <= axisx.max) {
            //y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
            x2 = axisx.max;
        }

        if (x1 < axisx.min)
            x1 = axisx.min;

        if (x2 < axisx.min)
            x2 = axisx.min;

        // clip x values ... N



        // if the (not x) y value was changed we got a rectangle
        // to fill
        if (y1 != y1old) {
            //N - changed
            ctx.lineTo(axisx.p2c(x1), axisy.p2c(y1old));
            // it goes to (x1, y1), but we fill that below
        }

        // fill triangular section, this sometimes result
        // in redundant points if (x1, y1) hasn't changed
        // from previous line to, but we just ignore that
        ctx.lineTo(axisx.p2c(x1), axisy.p2c(y1));
        ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));

        // fill the other rectangle if it's there
        //N - changed
        if (y2 != y2old) {
            ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));
            ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2old));
        }
    }  //while(1)
}