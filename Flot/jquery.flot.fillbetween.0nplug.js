/**
 * Created by JetBrains WebStorm.
 * User: ngaripova
 * Date: 22.05.12
 * Time: 16:29
 * To change this template use File | Settings | File Templates.
 */
(function ($) {
    var options = {
        series: { fillBetween: null } // or number
    };

    function init(plot) {
        function findBottomSeries(s, allseries) {
            var i;
            for (i = 0; i < allseries.length; ++i) {
                if (allseries[i].id == s.fillBetween)
                    return allseries[i];
            }

            if (typeof s.fillBetween == "number") {
                i = s.fillBetween;

                if (i < 0 || i >= allseries.length)
                    return null;

                return allseries[i];
            }

            return null;
        }

        function computeFillBottoms(plot, s, datapoints) {
            if (s.fillBetween == null)
                return;

            var other = findBottomSeries(s, plot.getData());
            if (!other)
                return;

            //take every two element of datapoint.points array and switch them - bad idea
            /*for (var i= 0; i< datapoints.points.length; i += 2)
             {
             var temp = datapoints.points[i];
             datapoints.points[i] = datapoints.points[i+1];
             datapoints.points[i+1] = temp;
             } */

            var ps = datapoints.pointsize,
                points = datapoints.points,
                otherps = other.datapoints.pointsize,
                otherpoints = other.datapoints.points,
                newpoints = [],
                px, py, interx, qx, qy, left,//bottom,
                withlines = s.lines.show,
                withbottom = ps > 2 && datapoints.format[2].x,
                withsteps = withlines && s.lines.steps,
                fromgap = true,
                i = 0, j = 0, l;

            while (true) {
                if (i >= points.length)
                    break;

                l = newpoints.length;

                if (points[i] == null) {
                    // copy gaps
                    for (m = 0; m < ps; ++m)
                        newpoints.push(points[i + m]);
                    i += ps;
                    //if (otherpoints[j] == 0) {
                        j += otherps;
                    //}
                }
                else if (j >= otherpoints.length) {
                    // for lines, we can't use the rest of the points
                    if (!withlines) {
                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);
                    }
                    i += ps;
                }
                else if (otherpoints[j] == null) {
                    // oops, got a gap
                    for (m = 0; m < ps; ++m)
                        newpoints.push(null);
                    fromgap = true;
                    j += otherps;
                }
                else {
                    // cases where we actually got two points
                    px = points[i];
                    py = points[i + 1];
                    qx = otherpoints[j];
                    qy = otherpoints[j + 1];
                    //bottom = 0;
                    left = 0;

                    if (py == qy) {
                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);

                        //newpoints[l + 1] += qy;
                        //bottom = qy;
                        left = qx;

                        i += ps;
                        j += otherps;
                    }
                    else if (py > qy) {
                        // we got past point below, might need to
                        // insert interpolated extra point
                        if (withlines && i > 0 && points[i - ps] != null) {
                            interx = px + (points[i - ps] - px) * (qy - py) / (points[i - ps+1] - py);
                            newpoints.push(qx);
                            newpoints.push(interx);
                            for (m = 2; m < ps; ++m)
                                newpoints.push(points[i + m]);
                            //bottom = qy;
                            left = qx;
                        }

                        j += otherps;
                    }
                    else { // py < qy
                        if (fromgap && withlines) {
                            // if we come from a gap, we just skip this point
                            i += ps;
                            continue;
                        }

                        for (m = 0; m < ps; ++m)
                            newpoints.push(points[i + m]);

                        // we might be able to interpolate a point below,
                        // this can give us a better y
                        if (withlines && j > 0 && otherpoints[j - otherps] != null)
                            left = qx + (otherpoints[j - otherps] - qx) * (py - qy) / (otherpoints[j - otherps + 1] - qy);
                            //bottom = qy + (otherpoints[j - otherps + 1] - qy) * (px - qx) / (otherpoints[j - otherps] - qx);

                        //newpoints[l + 1] += bottom;

                        i += ps;
                    }

                    fromgap = false;

                    if (l != newpoints.length && withbottom)
                        newpoints[l + 2] = left;
                        //newpoints[l + 2] = bottom;
                }

                // maintain the line steps invariant
                if (withsteps && l != newpoints.length && l > 0
                    && newpoints[l] != null
                    && newpoints[l] != newpoints[l - ps]
                    && newpoints[l + 1] != newpoints[l - ps + 1]) {
                    for (m = 0; m < ps; ++m)
                        newpoints[l + ps + m] = newpoints[l + m];
                    newpoints[l + 1] = newpoints[l - ps + 1];
                }
            }

            datapoints.points = newpoints;
        }

        plot.hooks.processDatapoints.push(computeFillBottoms);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'fillbetween',
        version: '1.0'
    });
})(jQuery);
