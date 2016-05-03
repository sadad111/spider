/**
 * Created by 刘冶 on 2016/2/25.
 * 提取所有新闻目录列表
 */
"use strict"

var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');

var flag = false;//判断是否为最后一页
var pageNo = 1;
function crawl() {
    if (flag) {
        console.log('抓取完毕.总页数为:' + (pageNo-1));
        return false;
    }
    console.log("正在抓取 第"+ pageNo+ "页");
    var url ="http://www.ss.pku.edu.cn/index.php/newscenter/news?start="+ (pageNo-1)*20;
    // 创建http get请求
    http.get(url, function (res) {
        var html = ''; // 保存抓取到的HTML源码
        var news = [];  // 保存解析HTML后的数据
        res.setEncoding('utf-8');

        // 抓取页面内容
        res.on('data', function (chunk) {
            html += chunk;
        });
        //网页内容抓取完毕
        res.on('end', function () {
            //console.log(html);
            var $ = cheerio.load(html);
            var pagenum=$('p','div.pagination').text();
            var pm=parseInt(pagenum.substr(pagenum.length-6,2));
//            console.log(pm);
            if (pageNo > pm-1) {
                flag = true;//设置 抓取完毕的标志
            }
            //如果你拿不准选择器的话，可以多用console.log来输出，看看取到的地址是否正确
            $('#info-list-ul li').each(function (index, item) {
                var news_item = {
                    title: $('.info-title', this).text(), // 获取新闻标题
                    time: $('.time', this).text(), // 获取新闻时间
                    link: 'http://www.ss.pku.edu.cn' + $('a', this).attr('href')// 获取新闻详情页链接
                };
                // 把所有新闻放在一个数组里面
                news.push(news_item);
            });
//           console.log(news);
            pageNo = pageNo + 1;
            var path ="data/data" +(pageNo-1)+ ".json";
//            console.log(path);
//            saveData(path,news);
//            readData('data/data.json');
            crawl();
        });
    }).on('error', function (err) {
        console.log(err);
    });
}
    /**
     * 保存数据到本地
     *
     * @param {string} path 保存数据的文件
     * @param {array} news 新闻信息数组
     */
    function saveData(path, news) {
//        fs.appendFile(path, JSON.stringify(news, null, 4), function (err) {
        fs.writeFile(path, JSON.stringify(news, null, 4), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('Data saved OK');
        });
    }
    /**
     * 保存数据到本地
     *
     * @param {string} path 保存数据的文件
     */
    function readData(path) {
        fs.readFile(path, {encoding: 'utf-8'}, function (err, bytesRead) {
            if (err)
                console.log(err);
            else {
                //var data = JSON.parse(bytesRead);
                console.log(bytesRead);
                console.log("readData success");
            }
        });
    }
crawl();





