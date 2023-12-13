$(function(){
	// bmsgetcurmatchname();
	var jsonobj=JSON.parse(sessionStorage.getItem("playerlistJson"));
	var num="";
	if(jsonobj!=undefined){
		num=jsonobj.pageNo;
		$("#searchsex").attr("altvalue",jsonobj.sex);
		if(jsonobj.sex!=""){
			$("#searchsex").val($("#searchsex").next().find("[altvalue="+jsonobj.sex+"]").text());
		}
		$("#searchbirthday").val(jsonobj.birthday);
		$("#searchdidtype").attr("altvalue",jsonobj.didtype);
		if(jsonobj.didtype!=""){
			$("#searchdidtype").val($("#searchdidtype").next().find("[altvalue="+jsonobj.didtype+"]").text());
		}
		$("#searchdid").val(jsonobj.did);
		$("#searchschool").val(jsonobj.school);
		$("#searchdepart").val(jsonobj.departname);
		$("#roleflg").attr("altvalue",jsonobj.roleflg);
		if(jsonobj.roleflg!=""){
			$("#roleflg").val($("#roleflg").next().find("[altvalue="+jsonobj.roleflg+"]").text());
		}
		$("#str").val(jsonobj.str);
	}else{
		num=0
	}
	getAllMem(num);
	 $(".selinput").click(function(e){
     	e.stopPropagation();
     	$(".emulate").hide();
     	var me=this;
     	$(me).next().show();
     	$(me).next().children().click(function(){
     		$(me).val($(this).text());
     		$(me).attr("altvalue",$(this).attr("altvalue"));
     		$(me).next().hide();
     	})
     })
     $(document).click(function(){
    		$(".emulate").hide();
    	})
})

function getAllMem(num){
	var sex=$("#searchsex").attr("altvalue");
	var str=$("#str").val();
	var mid=sessionStorage.getItem("currentmid");
	var pageSize=10;
	$("#page").unbind().data("pagination", null).empty();	
	$("#page").pagination({
		pageIndex: num,
		pageSize : pageSize,
		showFirstLastBtn : true,
		showPrevious: true,
	    showNext: true,
	    autoHidePrevious: true,
	    autoHideNext: true,
	    showJump: true,
	    jumpBtnText:'跳转',
		remote : {
			"url" : "../findAllMemberListByPage",
			pageParams : function(data) {
				var param={};
				param.pageNo=data.pageIndex;
				param.sex=sex;
				param.str=str;
				sessionStorage.setItem("playerlistJson", JSON.stringify(param));
				return {
					iDisplayStart : data.pageIndex * data.pageSize,
					iDisplayLength : data.pageSize,
					"sex":sex,
					"str":str,
					"flg":"01",
					"mid":mid
				};
			}, // [Function]:自定义请求参数
			"success" : function(data, status) {
				console.log(data)
				if (data.status == 0) {
					$("tbody").empty();
					sessionStorage.setItem("mid",data.list[0].mid);
					$(".current").html(data.list[0].mname);
					var htmls="";
					if(data.list.length==0){
						$(".export").hide();
					}
					$.each(data.list,function(i,mem){
						htmls+='<tr><td><img class="memberhead" src="'+mem.picurl+'">'
				    			+'<span>'+mem.tmname+'</span></td><td>'+mem.tmcode+'</td>'
				    	if(mem.roleflg=="01"){
							htmls+='<td>指导教师</td>'
						}
						else{htmls+='<td>队员</td>'}
				    	htmls+='<td><img src="../images/'+(mem.sex=="01"?'male.png':'female.png')
				    			+'"></td>';
						$.each(folkname,function(i,nation){
							if(mem.folk==nation.folkid){
								htmls+='<td>'+nation.folk+'</td>'
							}
						})
					    htmls+='<td>'+mem.birthday+'</td>'
								+'<td>'+mem.email+'</td>'
								+'<td>'+mem.phone+'</td>'
								+'<td>'+mem.school+'</td>'
						if(mem.disclaimerurl==""){
							htmls+='<td>未上传</td>'
						}else{
							htmls+='<td><a class="view" href="'+mem.disclaimerurl+'">查看文件</a></td>'
						}
						if(mem.diningtype=="01"){htmls+='<td>普通</td>'}
						else if(mem.diningtype=="02"){htmls+='<td>清真</td>'}
						else{htmls+='<td>素食</td>'}
//						if(mem.ckstatus=="00"){htmls+='<td>已签到</td>'}
//						else{htmls+='<td>未签到</td>'}
						htmls+='<td detail=\''+JSON.stringify(mem)+'\'>'
								//+'<img class="xiangqing" src="../images/xiangqing.png" onclick="viewMem(this)">'
								+'<img class="change" src="../images/change.png" onclick="editMember(this)">'
								+'<img class="shanchu" src="../images/saixiang2.png" '
								+'onclick="getMyRace(this)">'
								+'</td></tr>'
					})
					$("tbody").append(htmls)
				}else if(data.status == 1){
	        		alertMsg("2",data.errmsg,"fail")
	        	}
			},
			"error" : function(data) {
				alertMsg("2","后台获取数据出错！","fail")
			},
			beforeSend : null, // [Function]:请求之前回调函数（同jQuery）
			complete : null, // [Function]:请求完成回调函数（同jQuery）
			pageIndexName : 'pageIndex', // (已过时）[String]:自定义请求参数的当前页名称
			pageSizeName : 'iDisplayLength', // (已过时）[String]:自定义请求参数的每页数量名称
			totalName : 'iTotalRecords', // [String]:自定义返回的总页数名称，对象属性可写成'data.total'
			traditional : false
			// [Boolean]:参数序列化方式（同jQuery）
		},
	});
}

var temp;
var picurl="";
function editMember(obj){
	temp=obj;
	var info=JSON.parse($(obj).parent().attr("detail"));
	var htmls="";
	picurl=info.picurl;
	htmls+='<div id="shade"></div><div id="changeteainfo">'
			+'<img class="guanbi" src="../images/guanbi.png" onclick="closeInfoWin()">'
			+'<div id="form">';
	if(info.roleflg=="01"){htmls+='<h1>修改指导教师</h1>'}
	else{htmls+='<h1>修改队员</h1>'}
    htmls+='<div class="changeinfo clearfix"><div class="div-l">'
			+'<div class="perinfodiv"><span>姓名</span><input type="text" id="tmname" value="'+info.tmname+'"></div>'
			+'<div class="perinfodiv"><span>民族</span><input type="text" id="folk" readonly altvalue="'+info.folk
			+'" class="selinput" value="';
    $.each(folkname,function(i,nation){
		if(info.folk==nation.folkid){
			htmls+=nation.folk
		}
	})
	htmls+=	'"><ul class="emulate"></ul></div>'
			+'<div class="perinfodiv"><span>证件类型</span><input id="didtype" type="text" name="" readonly="readonly"'
			+' altvalue="'+info.didtype+'" class="selinput" value="';
    if(info.didtype=="00"){htmls+='身份证'}
	else if(info.didtype=="01"){htmls+='护照'}
	else{htmls+='港澳台通行证'}
    htmls+='"><ul class="emulate"><li altvalue="00">身份证</li><li altvalue="01">护照</li>'
			+'<li altvalue="02">港澳台通行证</li></ul></div>'
			+'<div class="perinfodiv"><span>证件号</span><input type="text" id="did"'
			+' value="'+info.did+'"></div>'
			+'<div class="perinfodiv"><span>学校</span><input type="text" id="school"'
			+' value="'+info.school+'"></div>'
			+'</div><div class="div-c">'
			+'<div class="perinfodiv" id="sex"><span>性别</span>'
	if(info.sex=="01"){
		htmls+='<input value="01" type="radio" name="sex" checked>男'
			+'<input value="02" type="radio" name="sex" id="female">女</div>'
	}else{
		htmls+='<input value="01" type="radio" name="sex">男'
			+'<input value="02" type="radio" name="sex" id="female" checked>女</div>'
	}
			
	htmls+='<div class="perinfodiv"><span>生日</span><input id="birthday" type="text" readonly '
			+'value="'+info.birthday+'" onclick="laydate({ elem:\'#birthday\', format:\'YYYY-MM-DD\'} )"></div>'
			+'<div class="perinfodiv"><span>邮箱</span><input type="text" id="email"'
			+' value="'+info.email+'"></div>'
			
			+'<div class="perinfodiv"><span>手机</span><input type="text" id="phone"'
			+' value="'+info.phone+'"></div>'
			+'<div class="perinfodiv"><span>院系</span><input type="text" id="departname"'
			+' value="'+info.departname+'"></div>'
			+'</div><div class="div-r">'
			+'<span id="zhaopian">照片</span><form id="myform" enctype="multipart/form-data" method="post">'
			+'<img src="'+info.picurl+'" id="portrait">'
			+'<input type="file" class="imgfile" id="file" name="files" onchange="uploadImg()"><input hidden name="savetype" value="00"></form>'
			+'<span id="imgformat">413*626px,不超过1000kb</span>'
			+'<div class="perinfodiv"><span style="vertical-align: middle;">用餐类型</span>'
			+'<input id="diningtype" type="text" readonly="readonly" altvalue="'+info.diningtype
			+'" class="selinput" value="'
	if(info.diningtype=="01"){htmls+='普通'}
	else if(info.diningtype=="02"){htmls+='清真'}
	else{htmls+='素食'}		
	htmls+='"><ul class="emulate"><li altvalue="01">普通</li><li altvalue="02">清真</li><li altvalue="03">素食</li></ul></div>'
			+'</div></div><div class="memsave"><a id="savebtn" onclick="editSaveInfo()">保存</a></div></div></div>';
    $("body").append(htmls);
    var html2=""
        $.each(folkname,function(i,nation){
    		html2+='<li altvalue="'+nation.folkid+'">'+nation.folk+'</li>'
    	})
    	$("#folk").next().append(html2)
    	$(document).click(function(){
    		$(".emulate").hide();
    	})
        $(".selinput").click(function(e){
        	e.stopPropagation();
        	var me=this;
        	$(me).next().show();
        	$(me).next().children().click(function(){
        		$(me).val($(this).text());
        		$(me).attr("altvalue",$(this).attr("altvalue"));
        		$(me).next().hide();
        	})
        })
}

function editSaveInfo(){
	var obj = temp
	var htmls="";
	var roleflg=JSON.parse($(obj).parent().attr("detail")).roleflg;
	var tmid=JSON.parse($(obj).parent().attr("detail")).tmid;
	var tmname=$("#tmname").val();
	var folk=$("#folk").attr("altvalue");
	var didtype=$("#didtype").attr("altvalue");
	var email=$("#email").val();
	var school=$("#school").val();
	var sex=$("#sex").find("input:checked").val();
	var birthday=$("#birthday").val();
	var did=$("#did").val();
	var phone=$("#phone").val();
	var departname=$("#departname").val();
	var diningtype=$("#diningtype").attr("altvalue");
	var mid=JSON.parse($(obj).parent().attr("detail")).mid;
	if(tmname.trim()==""){
		alertMsg("2","请填写姓名！","fail");
		return;
	}else if(tmname.indexOf(",")!=-1){
		alertMsg("2","姓名不允许出现非法字符！","fail");
		return;
	}
	if(folk==""){
		alertMsg("2","请选择民族！","fail");
		return;
	}
	if(didtype==""){
		alertMsg("2","请选择证件类型！","fail");
		return;
	}
	if(email.trim()==""){
		alertMsg("2","请填写邮箱！","fail");
		return;
	}else{
		var reg=/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
		if(!reg.test(email)){
			alertMsg("1","邮箱格式不正确！","fail");
			return;
		}
	}
	if(sex==""||sex==undefined){
		alertMsg("2","请选择性别！","fail");
		return;
	}
	if(did.trim()==""){
		alertMsg("2","请填写证件号！","fail");
		return;
	}else{
		var reg=/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
		if(didtype=="00"&&!IdentityCodeValid(did)){
			alertMsg("2","证件号格式不正确！","fail");
			return;
		}
	}
	if(phone.trim()==""){
		alertMsg("2","请填写手机号！","fail");
		return;
	}else{
		var reg=/^1[34578]\d{9}$/; 
		if(!reg.test(phone)){
			alertMsg("2","手机号格式不正确！","fail");
			return;
		}
	}
	if(diningtype==""){
		alertMsg("2","请选择用餐类型！","fail");
		return;
	}
	if(picurl==""){
		alertMsg("2","请上传头像！","fail");
		return;
	}
	var info={};
	info.tmid=tmid;
	info.roleflg=roleflg;
	info.tmname=tmname;
	info.folk=folk;
	info.didtype=didtype;
	info.email=email;
	info.school=school;
	info.sex=sex;
	info.birthday=birthday;
	info.did=did;
	info.phone=phone;
	info.departname=departname;
	info.diningtype=diningtype;
	info.picurl=picurl;
	info.mid=mid;
	htmls+='<td><img class="headicon" src="'+$("#portrait").attr("src")+'">'
	    	+'<span>'+tmname+'</span></td><td><img src="../images/'+(sex=="01"?'male.png':'female.png')
	    	+'"></td>';
	$.each(folkname,function(i,nation){
		if(folk==nation.folkid){
			htmls+='<td>'+nation.folk+'</td>'
		}
	})
    htmls+='<td>'+birthday+'</td>';
	if(didtype=="00"){htmls+='<td>身份证</td>'}
	else if(didtype=="01"){htmls+='<td>护照</td>'}
	else{htmls+='<td>港澳台通行证</td>'}
	htmls+='<td>'+did+'</td>'
			+'<td>'+email+'</td>'
			+'<td>'+phone+'</td>'
			+'<td>'+school+'</td>'
			+'<td>'+departname+'</td>';
	if(diningtype=="01"){htmls+='<td>普通</td>'}
	else if(diningtype=="02"){htmls+='<td>清真</td>'}
	else{htmls+='<td>素食</td>'}
	htmls+='<td><a class="editbtn" onclick="editMember(this)" detail=\''+JSON.stringify(info)+'\'></a>'
		+'<a class="delbtn" onclick="delMem(this)"></a></td>'
	$.ajax({
		type: "GET",
        url: "../updateMember",
        dataType: "JSON",
        async:false,
        data: info,
        success: function(data){
        	if(data.status == 0){
        		alertMsg("2","修改成功！","success")
        		setTimeout('location.reload()',2000);
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function closeInfoWin(){
	$("#shade").remove()
	$("#changeteainfo").remove();
	$("#myRace").remove();
}

function uploadImg(){
	var filetype=$("#file").val().slice($("#file").val().lastIndexOf(".")+1).toUpperCase()
	if (filetype == 'JPG'||filetype == 'PNG'||filetype == 'JPEG'){
		$("#myform").ajaxSubmit({
			url : "../uploadFiles",
			dataType : 'json',
			async : false,
			success : function(data) {
				if(data.status==0){
					readAsDataURL();
					picurl=data.urls;
				}else if(data.status == 1){
	        		alertMsg("2",data.errmsg,"fail")
	        	}
			},
			error:function(){
				alertMsg("2","上传失败！","fail")
			}
	    })
	}else{
		alertMsg("2","文件格式不正确","fail")
		return
	}
  
}

//图片预览
function readAsDataURL(){
  var simpleFile = document.getElementById("file").files[0];
  var reader = new FileReader();
  // 将文件以Data URL形式进行读入页面
  reader.readAsDataURL(simpleFile);
  reader.onload = function(e){
      $("#portrait").attr("src",this.result);
  }
}

function delMem(){
	closeWin();
	var tmid=JSON.parse($(tempobj).parent().attr("detail")).tmid;
	$.ajax({
		type: "GET",
        url: "../updateDelflgMemberByTmid",
        dataType: "JSON",
        async:false,
        data: {
        	"tmid":tmid
        },
        success: function(data){
        	if(data.status == 0){
        		alertMsg("2","删除成功","success")
        		setTimeout('location.reload()',2000);
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function exportPlayer(){
	
	$.ajax({
		type: "GET",
        url: "../downAllMatchUser",
        dataType: "JSON",
        async:false,
        data: {
        	
        },
        success: function(data){
        	if(data.status == 0){
        		console.log(data)
        		window.open(data.fileurl,"_blank");
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
	/*var form=$("<form>");//定义一个form表单
	form.attr("style","display:none");
	form.attr("target","");
	form.attr("method","post");
	form.attr("action","downAllMatchUser");
	var input1=$("<input>");
	input1.attr("type","hidden");
	input1.attr("name","mid");
	input1.attr("value",mid);
	$("body").append(form);//将表单放置在web中
	form.append(input1);
	form.submit();//表单提交
*/}

function clearSearch(){
	$(".searchul input").each(function(){
		$(this).val("");
		if($(this).attr("altvalue")!=null){
			$(this).attr("altvalue","")
		}
	})
}

function getMyRace(obj){
	var tmid=JSON.parse($(obj).parent().attr("detail")).tmid;
	$.ajax({
		type: "GET",
        url: "../findJoinRaceByTmid",
        dataType: "JSON",
        async:false,
        data: {
        	"tmid":tmid,
        },
        success: function(data){
        	if(data.status == 0){
        		console.log(data)
        		var htmls="";
        		htmls+='<div id="shade"></div><div id="myRace">'
        			+'<img class="guanbi" src="../images/guanbi.png" onclick="closeInfoWin()">'
        			+'<h1>已报名赛项</h1><table><thead><tr><td>赛项名称</td><td>所在队伍</td></tr></thead>'
        			+'<tbody>';
	        	$.each(data.list,function(i,item){
	        		htmls+='<tr><td>'+item.rname+'</td><td>'+item.tnames+'</td></tr>'
	        	})
	        	htmls+='</tbody></table>';
	        	$("body").append(htmls)
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})		
}
