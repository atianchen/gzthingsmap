!function(a){function b(a,b,c,d){this.west=Math.min(a,c),this.north=Math.max(b,d),this.east=Math.max(a,c),this.south=Math.min(b,d)}function c(a,b,c){return a.west<=b&&a.east>=b&&a.north>=c&&a.south<=c}function d(a,b){for(var d=0;d<k.length;d++)if(c(k[d],a,b)){for(var e=0;e<l.length;e++)if(c(l[e],a,b))return!1;return!0}return!1}function e(a,b){var c=-100+2*a+3*b+.2*b*b+.1*a*b+.2*Math.sqrt(Math.abs(a));return c+=2*(20*Math.sin(6*a*h)+20*Math.sin(2*a*h))/3,c+=2*(20*Math.sin(b*h)+40*Math.sin(b/3*h))/3,c+=2*(160*Math.sin(b/12*h)+320*Math.sin(b*h/30))/3}function f(a,b){var c=300+a+2*b+.1*a*a+.1*a*b+.1*Math.sqrt(Math.abs(a));return c+=2*(20*Math.sin(6*a*h)+20*Math.sin(2*a*h))/3,c+=2*(20*Math.sin(a*h)+40*Math.sin(a/3*h))/3,c+=2*(150*Math.sin(a/12*h)+300*Math.sin(a/30*h))/3}function g(a,b){var c={};if(!d(a,b))return c={lat:b,lng:a};var g=e(a-105,b-35),k=f(a-105,b-35),l=b/180*h,m=Math.sin(l);m=1-j*m*m;var n=Math.sqrt(m);return g=180*g/(i*(1-j)/(m*n)*h),k=180*k/(i/n*Math.cos(l)*h),c={lat:b+g,lng:a+k}}var h=3.141592653589793,i=6378245,j=.006693421622965943,k=[new b(79.4462,49.2204,96.33,42.8899),new b(109.6872,54.1415,135.0002,39.3742),new b(73.1246,42.8899,124.143255,29.5297),new b(82.9684,29.5297,97.0352,26.7186),new b(97.0253,29.5297,124.367395,20.414096),new b(107.975793,20.414096,111.744104,17.871542)],l=[new b(119.921265,25.398623,122.497559,21.785006),new b(101.8652,22.284,106.665,20.0988),new b(106.4525,21.5422,108.051,20.4878),new b(109.0323,55.8175,119.127,50.3257),new b(127.4568,55.8175,137.0227,49.5574),new b(131.2662,44.8922,137.0227,42.5692)];a.transformFromWGSToGCJ=g}(window);
(function(global){
    var pi = 3.14159265358979324;
    var a = 6378245.0;
    var ee = 0.00669342162296594323;

    function outOfChina(lat,lon) {
        if (lon < 72.004 || lon > 137.8347)
            return true;
        if (lat < 0.8293 || lat > 55.8271)
            return true;
        return false;
    }

    function transformLat( x,  y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
            + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
        return ret;
    }

    function transformLon( x,  y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
            * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
                * pi)) * 2.0 / 3.0;
        return ret;
    }

    function gps84_To_Gcj02(lon,lat) {
        if (outOfChina(lat, lon)) {
            return null;
        }
        var dLat = transformLat(lon - 105.0, lat ,- 35.0);
        var dLon = transformLon(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * pi;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
        var mgLat = lat + dLat;
        var mgLon = lon + dLon;
        return {lat:mgLat, lng:mgLon};
    }

    function gcj_To_Gps84(lon,lat) {
        var gps = transform(lat, lon);
        var lontitude = lon * 2 - gps.lng;
        var latitude = lat * 2 - gps.lat;
        return {lat:latitude, lng:lontitude};
    }

    function transform( lat,  lon) {
        if (outOfChina(lat, lon)) {
            return {lat:lat, lng:lon};
        }
        var dLat = transformLat(lon - 105.0, lat - 35.0);
        var dLon = transformLon(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * pi;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
        var mgLat = lat + dLat;
        var mgLon = lon + dLon;
        return {lat:mgLat, lng:mgLon};
    }
    global.transformFromGCJToWGS = gcj_To_Gps84;
    // global.transformFromWGSToGCJ = gps84_To_Gcj02;
})(window);
