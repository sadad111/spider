/**
 * Created by 刘冶 on 2016/2/26.
 * 提取供稿信息,新闻内容以及图片信息
 */

"use strict"

var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');

var links = [];
var page =2;



/**
 * 保存数据到本地
 *
 * @param {string} path 保存数据的文件
 * @param {array} news 新闻信息数组
 */
function saveData(path, news) {
      fs.appendFile(path, JSON.stringify(news, null, 4), function (err) {
//    fs.writeFile(path, JSON.stringify(news, null, 4), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('Data saved OK');
    });
}
function savetxt(path, news) {
    fs.appendFile(path, news, function (err) {
//    fs.writeFile(path, JSON.stringify(news, null, 4), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('Data saved OK');
    });
}



/**
 * 获取单页面的供稿单位及相关内容
 *
 * @param {string} path 保存数据的文件
 */
function getsource(url) {
            url = encodeURI(url);
//          console.log(url);
            http.get(url, function (res) {
                var html = ''; // 保存抓取到的HTML源码
                var content = [];
                res.setEncoding('utf-8');

                // 抓取页面内容
                res.on('data', function (chunk) {
                    html += chunk;
                });

                //网页内容抓取完毕

                res.on('end', function () {
//                     console.log(html);
                    var $ = cheerio.load(html);
                    var owner = $('a', 'div.article-info').first().text();
//                     console.log(owner);
                    if($('.article-content','div').is('p')){
                        $('.article-content p').each(function (index, item) {
                            if(($('p').text().indexOf(" ") != (-1))&&($('p').text().trim().length>=35)||($('p').text().trim().length>=50)){
                                var content0 = $('p').text()+"\r\n"
                            }
                            content.push(content0);
                        });
                    }
                   else
                     {
                        var content0 = $('.article-content','div').text();
                            content.push(content0);
                    }
                        var from_item = {
                            title: $('a', 'div.article-title').first().text(),
                            from: owner.substring(owner.length - 9, 17),
                            link: decodeURI(url)
//                        imag:  $('img', 'div.article-content')
                        };
                        var name = from_item.title.trim();
                            name = name.replace(/\//g,"-");
                            name = name.replace(/\"/g,"-");
                            name = name.replace(/\:/g,"-");
//                      console.log(from_item);
//                      console.log(title)
                        saveData("data/data_content.json",from_item);
                        savetxt("data/data_content/"+name+".txt", content);
                    if($('a', 'li.next').attr('href')!=undefined){
                        var nexturl = 'http://www.ss.pku.edu.cn' + $('a', 'li.next').attr('href');
                        console.log(nexturl);
                        getsource(nexturl);
                    }

                }).on('error', function (err) {
                    console.log(err);

                });
            });

}


/**
 * 获取单页面的图片标题
 *
 * @param {string} path 保存数据的文件
 */
function getimag(url){

              url = encodeURI(url);
            http.get(url, function (res) {
                var html = ''; // 保存抓取到的HTML源码
                var imagsave = [];
                res.setEncoding('utf-8');

                // 抓取页面内容
                res.on('data', function (chunk) {
                    html += chunk;
                });

                //网页内容抓取完毕

                res.on('end', function () {
                    var $ = cheerio.load(html);

                    if($('img', 'div.article-content').attr('src')!=undefined){
                        $('img', 'div.article-content').each(function(imag_title){
                            imag_title = $(this).parent().next().text();
                            var imagname =$(this).attr('src').substring(15);
                            imagname=imagname.replace(/\//g,"-");
                            var url_imag= 'http://www.ss.pku.edu.cn' + $(this).attr('src');
                            if(imag_title == "")
                            {
                                imag_title =$(this).parent().parent().next().text();
                            }
                            if((imag_title.indexOf(" ")==(-1))&&(imag_title.trim().length<50))
                            {
//                                console.log(imag_title.length+'\n');
//                                console.log(imag_title)
                                var imag_save = {
                                    img_title: imag_title,
                                    img_name: imagname
                                };
                                saveData("data/data_imag.json", imag_save);
                            }
//                        console.log(url_imag);
//                        console.log(imagname);
                            url_imag = encodeURI(url_imag);
                        http.get(url_imag, function (res){
                            var path0 = "data/imag/"+imagname;
//                            console.log(path0);
                            res.pipe(fs.createWriteStream(path0));
                        });
                        });
                    }
                    if($('a', 'li.next').attr('href')!=undefined){
                        var nexturl = 'http://www.ss.pku.edu.cn' + $('a', 'li.next').attr('href');
                        console.log(nexturl);
                        getimag(nexturl);
                    }

                }).on('error', function (err) {
                    console.log(err);
                });
            });
//        }


}
//var path ="data/data" +(pageNo-1)+ ".json";
//    getsource(path);

var path ="data/data" +(page-1)+ ".json";
var data00 = fs.readFileSync(path);
data00 = JSON.parse(data00);
for ( var i in data00 ) {
    links.push(data00[i].link);
}
var url = links[0];

//getimag(url);
getsource(url)




