const express =require('express');
var da
var fix=75//固定车位现有数量
var total_free=75//自由车位总数
var free=75//自由车位数量
var order//固定车位用户排序
var frorder//自由车位用户排序
var allfee=0;
const app=express();
let http=require('http');
let url=require('url');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let fs=require('fs');
//mongoose.set('useFindAndModify',false)
app.use(express.static('files'))
app.set('view engine','ejs');
var mongoose = require('mongoose');
mongoose.set('useFindAndModify',false)
mongoose.connect('mongodb://localhost/Software');
var db = mongoose.connection;
var applyC = new mongoose.Schema(
    {
        Parking_Type:String,
        Car_Card:String,
        Fee:String,
        Name:String,
        Contact:String,
        User_ID:String
    }
    ,
    {
        versionKey:false
    }
)
var apply =mongoose.model('apply',applyC);
//储存申请的表
var fixedparkingC = new mongoose.Schema(
{
        User_ID:String,
        Car_Card:String,
        Name:String,
        Contact:String,
        Order:String,
        status:String

},{
    versionKey:false
    })
var fixedparking =mongoose.model('fixedparking',fixedparkingC);
var ParkingC = new mongoose.Schema(
    {
        Parking_Type:String,
        Car_Card:String,
        Fee:String,
        Name:String,
        Contact:String,
        Order:String,
        User_ID:String
    },
    {
        versionKey:false
    }
);//车位信息
var parking = mongoose.model('parking',ParkingC);
var CarC = new mongoose.Schema(
    {
        Car_Card:String
    }
    ,
    {
        versionKey:false
    }
);//车辆信息
var car = mongoose.model('car',CarC);
var ParkingTypeC = new mongoose.Schema(
    {
        Type_ID:String,
        Type_Name:String
    }
    ,
    {
        versionKey:false
    }
);//车位类型
var parkingType = mongoose.model('parkingType',ParkingTypeC);
var ParkinguseC = new mongoose.Schema(
    {
        User_ID:String,
        Parking_Type:String,
        order:String,
        Enter_Time:String,
        Exit_Time:String,
        Car_Card:String,
        Total_Fee:String,
        LastTime:String,
        status:String,
    }
    ,
    {
        versionKey:false
    }
);//车位使用信息
var parkinguse = mongoose.model('parkinguser',ParkinguseC)
var  UserC=new mongoose.Schema(
    {
        User_ID:String,
        User_Password:String,
        User_Type:String
    }
    ,
    {
        versionKey:false
    }
);//用户信息
var user = mongoose.model('user',UserC);
var moneyC = new mongoose.Schema(
    {
        Enter_Time:String,
        Exit_Time:String,
        Car_Card:String,
        Total_Fee:String,
        Type:String
    }
)
var money = mongoose.model('money',moneyC);
/*var writeC = new mongoose.Schema(
    {

    }
)*/
/*var car =
    {

        User_ID:'dd',
    }
    ;
user.findOneAndUpdate(car,{
    User_Type:4
},function (err,dd) {
    console.log(dd);
})*/
/*var admin= new user(
    {
        User_ID:'admin',
        User_Password:'baoshijie3',
        User_Type:'1'
    }
);*/
/*admin.save(function (err) {

});*/
//创建管理员账号
app.use('/input',function (req,res,next) {
    if(req.query.submitName=='register')
    {
        var fluffy = new user(req.query);
        //用户注册
        if(req.query.User_Type==2) {
            user.find({
                User_ID: req.query.User_ID,
                $or:[
                    {User_Type:2},{User_Type:4}
                ]
            }, function (err, xy) {
                if (err) return console.error(err);
                else {
                    //console.log(JSON.stringify(xy))
                    if (JSON.stringify(xy).length == 2) {
                        fluffy.save(function (err, fluffy) {
                            if (err) return console.error(err);
                            res.render('finish',{});
                            da=req.query.User_ID;

                        });
                    }
                    else
                        res.render('failed1',{})
                        //res.render('review',{});
                }
            });
        }

    }
    else next();
});//用户注册
app.use('/input',function (req,res,next) {
    if(req.query.submitName=='login') {
        //console.log(req.query.User_Type);
        if (req.query.User_Type == 3) {
            res.render('remain', {keyData:free});
        }
        else {
            user.find({
                User_ID:req.query.User_ID,
                User_Password:req.query.User_Password
            },function (err,xyz) {
                //console.log(xyz[0].User_Type)
                var fluffy = new user(req.query);
                user.find({User_ID: req.query.User_ID, User_Password: req.query.User_Password}, function (err, xy) {
                    if (err) return console.error(err);
                    else {
                        //普通账号登录信息页面
                        if ((JSON.stringify(xy).length != 2) && req.query.User_Type == 2 && xyz[0].User_Type == 2) {
                            res.render('finish', {});
                            da=req.query.User_ID;
                            //console.log(da);
                        }
                        //管理员登录
                        else if ((JSON.stringify(xy).length != 2) && req.query.User_Type == 1 && xyz[0].User_Type ==1) {
                            apply.find(function (err, data) {
                                if (err) return console.error(err);
                                else {
                                    //console.log(data);
                                    var count=150-parseInt(order);
                                    res.render('admin', {keyData: data,Most:count,Free:free,per:null,ggdata:[{Name:'姓名',Contact:'联系方式',Car_Card:'车牌号',Order:'车位号'}],stat:null,zxc:null,len:0})

                                }

                            })

                        }
                        else if((JSON.stringify(xy).length != 2) && req.query.User_Type == 2 &&xyz[0].User_Type==4)
                        {
                            da=req.query.User_ID;
                            //console.log(da);
                            parking.find({
                                User_ID:da
                            },function (err,data) {
                                //console.log(data);
                                fixedparking.find({
                                    User_ID:da
                                },function (err,sta) {
                                    if(parseInt(sta[0].status)==1) {
                                        res.render('myinfo', {keyData: data,stat:'使用中'});
                                    }
                                    else if(parseInt(sta[0].status)==2)
                                    {
                                        res.render('myinfo', {keyData: data,stat:'空闲中'});
                                    }
                                })

                            })

                        }
                        else
                            res.render('failed', {});
                        //res.render('saveEjs',{keyData:fluffy})
                    }
                });
            })

        }
    }
    else next();
});//用户登录
app.use('/sub',function (req,res,next) {
    if(req.query.submits =='发送申请')
    {
        var fluffy = new apply(req.query)
        {
            apply.find(
                {
                    Car_Card:req.query.Car_Card
                },
                function (err,xy) {
                    if(err) return console.error(err);
                    else
                    {
                        if(JSON.stringify(xy).length !=2)
                        {
                            res.send('该车牌已存在')
                        }
                        else
                        {
                            //console.log(req.query.User_ID);


                                    //console.log(cdd);

                                    if (req.query.User_ID!=da) {
                                        //console.log(da);
                                        res.render('finish1', {})
                                    }
                                    else
                                    {
                                        fluffy.save(function (err) {
                                            res.render('review',{})
                                        })
                                    }



                        }
                    }
                }
            )
            //res.render('review',{});
        }
    }
        else next();
});
//填写申请
app.use('/ad',function (req,res,next) {
    /*if(req.query.passbt=='通过')
    {
        res.render('finish',{});
    }*/
    if(req.query.passbt=='通过') {
        if(order==null) order=1;
        else order++;
        apply.find(function (err, data) {
            if (err) return console.error(err);
            else {
                var fluffy = new parking({
                    //id: 5ee2177ca862993d4863afa0,
                    User_ID:data[parseInt(req.query.reviewItem)].User_ID,
                    Name: data[parseInt(req.query.reviewItem)].Name,
                    Parking_Type: data[parseInt(req.query.reviewItem)].Parking_Type,
                    Contact: data[parseInt(req.query.reviewItem)].Contact,
                    Car_Card: data[parseInt(req.query.reviewItem)].Car_Card,
                    Order: order
                });//获得选中的信息
                //console.log(order)
                //console.log(fluffy);
                var parkuse= new fixedparking(
                    {
                        User_ID:data[parseInt(req.query.reviewItem)].User_ID,
                        Parking_Type:'fixed',
                        Name:data[parseInt(req.query.reviewItem)].Name,
                        Car_Card:data[parseInt(req.query.reviewItem)].Car_Card,
                        Order:order,
                        status:2//车位未使用
                    }
                )
                parkuse.save();
                fluffy.save(function (err, gg) {//审核通过将审核表中内容存储到固定车位信息表
                    //console.log(gg)
                    if (err) return console.error(err)
                    else {
                        //console.log(fluffy);
                        //console.log(gg);
                        //res.send('dd')
                        //}
                        //user.find(
                            /*{
                                User_ID:data[parseInt(req.query.reviewItem)].User_ID,
                                User_Type:'2'
                            },*/
                            //function (err,zxc) {
                                //if (err) return console.error(err)
                                //else
                               // {
                                    //console.log(zxc);
                                    var uid = {
                                        User_ID:data[parseInt(req.query.reviewItem)].User_ID
                                    };
                                    //console.log(uid);
                                    user.findOneAndUpdate(uid,
                                        {
                                            User_Type:'4'//将审核通过的用户类型进行调整
                                        },function (err,asd) {
                                        //console.log(asd);
                                            if (err) console.error(err)
                                            else
                                            {
                                                apply.deleteMany(data[parseInt(req.query.reviewItem)],function (err) {//通过审核的信息从申请表中删除。
                                                    if(err) return console.error(err)
                                                    else
                                                    {
                                                        apply.find(function (err,newdata) {
                                                            if (err) return console.error(err)
                                                            else
                                                            {
                                                                res.render('admin',{keyData:newdata});
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        }
                                        )
                                }
                            }

                        )
                    }
                    //console.log(req.query.reviewItem);
                })
            }
            else if(req.query.count=='确定')
            {
                total_free=req.query.text;
                free=free+total_free-75;
                //console.log(free);
                apply.find(function (err, data) {
                    if (err) return console.error(err);
                    else {
                        //console.log(data);
                        var count=150-parseInt(order);
                        res.render('admin', {keyData: data,Most:count,Free:total_free,per:null,ggdata:[{Name:'姓名',Contact:'联系方式',Car_Card:'车牌号',Order:'车位号'}],stat:null,zxc:null,len:0})

                    }

                })
            }
            else if(req.query.using=='查询自由车位')
            {
                parkinguse.find({
                    Parking_Type:'free',
                    status:'1'
                },function (err,zxc) {
                    var per = zxc.length/total_free;
                    apply.find(function (err, data) {
                        if (err) return console.error(err);
                        else {
                            //console.log(data);
                            var count=150-parseInt(order);
                            res.render('admin', {keyData: data,Most:count,Free:total_free,per:per,ggdata:[{Name:'姓名',Contact:'联系方式',Car_Card:'车牌号',Order:'车位号'}],stat:null,zxc:null,len:0})

                        }

                    })
                })
            }
            else if(req.query.using=='查询固定车位')
            {
                parkinguse.find(
                    {
                        Parking_Type:'fixed',
                        order:req.query.textsub
                    },
                    function (err,zxc) {

                        apply.find(function (err, data) {
                            if (err) return console.error(err);
                            else {
                                var len=zxc.length;
                                //console.log(req.query.textsub);
                                //console.log(len);
                                //console .log(zxc);
                                //console.log(data);
                                var count=150-parseInt(order);
                                res.render('admin', {keyData: data,Most:count,Free:total_free,per:null,zxc:zxc,ggdata:[{Name:'姓名',Contact:'联系方式',Car_Card:'车牌号',Order:'车位号'}],stat:null,len:len})

                            }

                        })
                    }
                )
            }
            else if(req.query.using=='查询车主信息')
            {
                parking.find({
                    Name:req.query.textname
                },function (err,elsedata) {
                    //console.log(data);
                    fixedparking.find({
                        Name:req.query.textname
                    },function (err,sta) {
                        if(parseInt(sta[0].status)==1) {
                            apply.find(function (err, data) {
                                if (err) return console.error(err);
                                else {
                                    //console.log(data);
                                    var count=150-parseInt(order);
                                    res.render('admin', {keyData: data,Most:count,Free:total_free,per:null,zxc:null,ggdata:elsedata,stat:'使用中',len:0})

                                }

                            })

                        }
                        else if(parseInt(sta[0].status)==2)
                        {
                            apply.find(function (err, data) {
                                if (err) return console.error(err);
                                else {
                                    //console.log(data);
                                    var count=150-parseInt(order);
                                    res.render('admin', {keyData: data,Most:count,Free:total_free,per:null,zxc:null,ggdata:elsedata,stat:'空闲中',len:0})

                                }

                            })

                        }
                    })

                })
            }

            //})
    //}
   else next();
});
app.use('/rema',function (req,res,next) {
   if (req.query.submitname=='进入')
   {
       var date = new Date();
       var year = date.getFullYear();
       var month = date.getMonth()+1;
       var day = date.getDate();
       var hour = date.getHours();
       var minute = date.getMinutes();
       var second = date.getSeconds();
       var time=year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second;
       var ddtime=year*12*30*24+month*30*24+day*24+hour;//进入时间的小时数

       var fluffy = new parkinguse(
           {
               Parking_Type:'free',
               Enter_Time:time,
               Car_Card:req.query.Car_Card,
               LastTime:ddtime,
               status:1
           }
       );
       if(free>0)
       {
           fluffy.save(function (err,xy) {
               if (err) console.error(err);
               else
                   //console.log(xy);
               free--;
               res.render('remain',{keyData:free});
           })
       }
       else
       {
           res.send('剩余车位不足！')
       }
       //console.log(year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second);
       //console.log(year+''+month+''+day+''+hour+''+minute+''+second);
//blog.csdn.net/yiyanbuhe/java/article/details/78632704
       /*if (frorder==null) frorder=1;
       else frorder++;*/

   }
   else if (req.query.submitname=='退出')
   {
       var date = new Date();
       var year = date.getFullYear();
       var month = date.getMonth()+1;
       var day = date.getDate();
       var hour = date.getHours();
       var minute = date.getMinutes();
       var second = date.getSeconds();
       var time=year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second;
       var ddtime=year*12*30*24+month*30*24+day*24+hour+1;//离开时间的小时数
       var lasttime;//
       var fee;
       parkinguse.find({
           Car_Card:req.query.Car_Card,
           status:1//进入的，没缴费
       },function (err,xy) {
           //console.log(xy)
           lasttime=xy[0].LastTime;
           //console.log(lasttime);
           fee=(ddtime-lasttime)*5;
           //console.log(fee);
           var fluffy =
               {
                  Car_Card:req.query.Car_Card
               }
           ;
           parkinguse.findOneAndUpdate(fluffy,{
               Exit_Time:time,
               LastTime:ddtime,
               Total_Fee:fee,
               status:2//出去了
           },function (err,zxc) {
               //console.log(zxc);
               parkinguse.find({
                   Car_Card:req.query.Car_Card,
                   Exit_Time:time
                   },function (err,vbn) {
                   res.render('pay',{keyData:vbn});
                   free++;
                   allfee=allfee+parseInt(vbn[0].Total_Fee);
                   //console.log(allfee);
                   var moneygg = new money({
                       Enter_Time:vbn[0].Enter_Time,
                       Exit_Time:vbn[0].Exit_Time,
                       Total_Fee:vbn[0].Total_Fee,
                       Car_Card:vbn[0].Car_Card
                   })
                   moneygg.save();
                   }

               )
           })
       })
   }
   else next();
    }
)//游客进入退出
app.use('/pay',function (req,res,next) {
    if(req.query.submitname=='离开')
    {
        res.render('payindex',{});
    }
    else next();
})//缴费成功返回主页面
app.use('/myin',function (req,res,next) {
    if(req.query.submitname=='进入')
    {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var time=year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second;
        var ddtime=year*12*30*24+month*30*24+day*24+hour;//进入时间的小时数
        var cdd={
            User_ID:da,
            //Parking_Type:'fixed'
        }
        //console.log(cdd);
        fixedparking.findOneAndUpdate(cdd,
            {
                status:1
            },function (err,ghj) {
            console.log(ghj);
                parking.find({
                    User_ID:da
                },function (err,zxc) {
                    //console.log(zxc);
                    var fluffy = new parkinguse(
                        {
                            User_ID:da,
                            Parking_Type:'fixed',
                            Enter_Time:time,
                            Car_Card:ghj.Car_Card,
                            LastTime:ddtime,
                            status:1,
                            order:zxc[0].Order
                        }
                    );
                    fluffy.save(function (err,xyz) {
                        //console.log(zxc);
                        parking.find({
                            User_ID:da
                        },function (err,data) {
                            //console.log(data);
                            fixedparking.find({
                                User_ID:da
                            },function (err,sta) {
                                if(parseInt(sta[0].status)==1) {
                                    res.render('myinfo', {keyData: data,stat:'使用中'});
                                }
                                else if(parseInt(sta[0].status)==2)
                                {
                                    res.render('myinfo', {keyData: data,stat:'空闲中'});
                                }
                            })

                        })
                    });
                })
            })





        //console.log(year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second);
        //console.log(year+''+month+''+day+''+hour+''+minute+''+second);
//blog.csdn.net/yiyanbuhe/java/article/details/78632704
        /*if (frorder==null) frorder=1;
        else frorder++;*/
    }
    else if(req.query.submitname=='退出')
    {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var time=year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second;
        var ddtime=year*12*30*24+month*30*24+day*24+hour;//进入时间的小时数
        var cdd={
            User_ID:da,
        }
        fixedparking.findOneAndUpdate(cdd,
            {
                status:2
            },function (err,ghj) {
                var gg={
                    User_ID:da
                }
                parkinguse.findOneAndUpdate(gg,{
                    Exit_Time:time,
                    LastTime:ddtime,
                    status:2//出去了
                },function (err,ll) {
                    parking.find({
                        User_ID:da
                    },function (err,data) {
                        //console.log(data);
                        fixedparking.find({
                            User_ID:da
                        },function (err,sta) {
                            if(parseInt(sta[0].status)==1) {
                                res.render('myinfo', {keyData: data,stat:'使用中'});
                            }
                            else if(parseInt(sta[0].status)==2)
                            {
                                res.render('myinfo', {keyData: data,stat:'空闲中'});
                            }
                        })

                    })
                })
            })
    }
    else next();
});
/*app.use('/ad',function (req,res,next) {
    if(req.query.passbt=='通过')
                    res.render('failed',{});
                //res.render('saveEjs',{keyData:fluffy})
    else next();
});*/




app.listen(3000);


