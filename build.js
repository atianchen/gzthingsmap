var writePath = 'D:/work/project/web/csermap/js/gzmap.js',/*默认输出到本目录min.js文件里*/
  fs = require('fs'),
  r1 = /^(.+)$/mg,/*分行*/
  r2 = /\s{2,}/g,/*去空格*/
  r3 = /([^\\])\/\/.*/g,/*去行注释*/
  r4 = /\/\*.*?\*\//g,/*去块注释*/
  str = '';
var input = ['D:/work/project/web/csermap/js/wgs2mars.js','D:/work/project/web/csermap/js/qtip.js','D:/work/project/web/csermap/js/ol-debug.js','D:/work/project/web/csermap/js/mapservice.js'];
    input.forEach(function(item){
    /*合并对顺序有需求，所以同步读取文件*/
    var data = fs.readFileSync(item, 'utf8');
	str=str+data;
  });
//  str = str.replace(r2,' ').replace(r4, '');   
  /*异步写入到目标文件*/
  fs.writeFile(writePath, str, {encoding: 'utf8'}, function(err){
    if(err) {throw err};
    console.log('complete........');
  });