$(function(){
	if(sessionStorage.getItem("roleflg")=="02"){
		$(".sidebar-ul").find("li:not(:eq(6))").hide();
		$(".magnifier").attr("onclick","findTCMatch(0)")
		bmsgetcurmatchname();
		var jsonobj=JSON.parse(sessionStorage.getItem("TCgradelistJson"));
		var num="";
		if(jsonobj!=undefined){
			num=jsonobj.pageNo;
			$(".searchinput").val(jsonobj.rname);
		}else{
			num=0
		}
		findTCMatch(num);
		
	}else{
		//getEvent();
		bmsgetcurmatchname();
		var jsonobj=JSON.parse(sessionStorage.getItem("gradelistJson"));
		var num="";
		if(jsonobj!=undefined){
			num=jsonobj.pageNo;
			$(".searchinput").val(jsonobj.rname);
		}else{
			num=0
		}
		getCompetition(num);
	}
})

var resultobj="";
var raceobj="";
function getEvent(){
	$.ajax({
		type: "GET",
        url: "../findAllMatchList",
        dataType: "JSON",
        async:false,
        data: {},
        success: function(data){
        	if(data.status == 0){
        		$.each(data.list,function(i,match){
    				if(match.mstatus=="00"){
    					mid=match.mid;
    				}
        		})
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function getCompetition(num){
	var pageSize=10;
	var mid=sessionStorage.getItem("currentmid");
	var rname=$(".searchinput").val();
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
			"url" : "../findRaceListByPage",
			pageParams : function(data) {
				var param={};
				param.pageNo=data.pageIndex;
				param.rname=rname;
				sessionStorage.setItem("gradelistJson", JSON.stringify(param));
				return {
					iDisplayStart : data.pageIndex * data.pageSize,
					iDisplayLength : data.pageSize,
					mid:mid,
					"rname":rname
				};
			}, // [Function]:自定义请求参数
			"success" : function(data, status) {
				console.log(data)
				if (data.status == 0) {
					$("tbody").empty();
					var htmls="";
					$.each(data.list,function(i,com){
						htmls+='<tr rid="'+com.rid+'"><td>'+com.rcode+'</td><td>'
								+com.rname+'</td>'
							  	+'<td>'+com.startdate+'</td>'
							  	+'<td>'+com.enddate+'</td>'
							  	+'<td rid="'+com.rid+'"><a class="operate" onclick="showGrade(this)">成绩管理</a>'
							  	/*+'<span class="split">|</span><a class="operate" onclick="showSetTrophy(this)">奖杯设置</a>'
							  	+'<span class="split">|</span><a class="operate" onclick="showSetAward(this)">奖项设置</a>'*/
							  	+'<span class="split">|</span><a class="operate" '
							  	+'onclick="showReport(\''+com.rid+'\',\'00\',this)">成绩查看</a>'
							  	+'<span class="split">|</span><a class="operate" onclick="grantDiploma(this)">奖状发放</a></td></tr>'
					})
					$("tbody").append(htmls)
				} else if(data.status==1){
					alertMsg("2",data.errmsg,"fail")
				}
			},
			"error" : function(data) {
				alertMsg("2","后台获取数据出错","fail")
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

function showGrade(obj){
	raceobj=obj;
	var rid=$(obj).parent().attr("rid")
	var htmls="";
	var gradeInfo="";
	htmls+='<div class="shade"></div><div class="gradeManage">'
	     +'<h1 class="wTitle">成绩管理</h1><div class="someInfo">'
	     +'<div class="someInfo-left">';
	$.ajax({
		type: "GET",
        url: "../findTeamScoreByRidBySetScore",
        dataType: "JSON",
        async:false,
        data: {
        	"rid":rid
        },
        success: function(data){
        	if(data.status == 0){
        		console.log(data);
        		gradeInfo=data;
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
	htmls+='<p>当前赛项：<span class="curRace">'+$(obj).parent().prev().prev().prev().text()+'</span></p>'
	     +'<p>队伍总数：<span class="teamNum">'+gradeInfo.list.length+'</span></p>'
	     +'</div><input type="text" class="searchteam" placeholder="搜索队伍">'
	     +'<span class="searchbtn" onclick="findTeam(\''+rid+'\')"></span></div><div class="tablewrap"><table class="teamList"><thead><tr>'
	     +'<td style="width:143px">队伍编号</td><td style="width:124px">队伍名称</td>'
	     +'<td style="width:118px">成绩</td><td>操作</td></tr></thead><tbody>';
	$.each(gradeInfo.list,function(i,team){
		htmls+='<tr tid="'+team.tid+'"><td>'+team.tcode+'</td>'
			 +'<td>'+team.tname+'</td>'
			 +'<td><input type="text" class="scoreinput" value="';
		if(team.score==null){
			htmls+='">';
		}else if(team.score=="违规"||team.score=="缺赛"){
			htmls+=team.score+'" readonly>';
		}else{
			htmls+=team.score/100+'">';
		}
		htmls+='</td>';
		if(team.flg=="00"){
			htmls+='<td><span class="gradeBtn1 reject"'
				+' onclick="alertConfirm(\'2\',\'此操作不可逆！确定将该队伍的成绩判定为违规？\',\'setNoScore()\',this)">违规</span>'
		    	+'<span class="gradeBtn1 absence"'
		    	+' onclick="alertConfirm(\'2\',\'此操作不可逆！确定将该队伍的成绩判定为缺赛？\',\'setNoScore()\',this)">缺赛</span></td></tr>'
		}else if(team.flg=="01"){
			htmls+='<td><span class="gradeBtn2 reject">违规</span>'
		    	 +'<span class="gradeBtn3 absence">缺赛</span></td></tr>'
		}else if(team.flg=="02"){
			htmls+='<td><span class="gradeBtn3 reject">违规</span>'
		    	 +'<span class="gradeBtn2 absence">缺赛</span></td></tr>'
		}
			 
	})
	htmls+='</tbody></table></div>'
		 +'<div class="confirmBtn"><a class="conBtn1" onclick="saveGrade(\''+rid+'\')">保存</a>'
		 +'<a class="conBtn2" onclick="closeTempWin()">取消</a></div></div>'    
	$("body").append(htmls)
}
/*
function saveGrade(rid,currentIndex){
	var onswitch;
	var items=$(".tablewrap tbody tr");
	if(currentIndex>=items.length){   
        return;  
    }else{
    	var scoreList=[];
    	var info={};
		var score=$(items[currentIndex]).find(".scoreinput").val();
		info.tid=$(items[currentIndex]).attr("tid");
		info.rid=rid;
		if($(items[currentIndex]).find(".reject").hasClass("gradeBtn2")){
			info.flg="01";
			info.score=0;
		}else if($(items[currentIndex]).find(".absence").hasClass("gradeBtn2")){
			info.flg="02";
			info.score=0;
		}else{
			info.flg="00";
			if(score.trim()==""){
				alertMsg("2","请填写成绩！","fail");
				onswitch=false;
			}else if(isNaN(score)){
				alertMsg("2","成绩必须为数字！","fail");
				onswitch=false;
				return
			}
			info.score=parseInt(score*100)
		}
		scoreList.push(info)
		if(onswitch==false){
			return;
		}
		$.ajax({
			type: "GET",
	        url: "../addTeamScore",
	        dataType: "JSON",
	        data: {
	        	"scoreList":JSON.stringify(scoreList)
	        },
	        success: function(data){
	        	if(data.status == 0){
	        		currentIndex++;
	        		if(currentIndex==items.length){
	        			alertMsg("2","操作成功！","success");
		        		closeTempWin();
	        		}
	        		saveGrade(rid,currentIndex)
	        	}else if(data.status == 1){
	        		alertMsg("2",data.errmsg,"fail")
	        	}
	        },
		})
    }
	
}*/
function saveGrade(rid){
	var scoreList=[];
	var onswitch;
	$(".tablewrap tbody tr").each(function(){
		var info={};
		var score=$(this).find(".scoreinput").val();
		info.tid=$(this).attr("tid");
		info.rid=rid;
		if($(this).find(".reject").hasClass("gradeBtn2")){
			info.flg="01";
			info.score=0;
		}else if($(this).find(".absence").hasClass("gradeBtn2")){
			info.flg="02";
			info.score=0;
		}else{
			info.flg="00";
			if(score.trim()==""){
				alertMsg("2","请填写成绩！","fail");
				onswitch=false;
				return false;
			}else if(isNaN(score)){
				alertMsg("2","成绩必须为数字！","fail");
				onswitch=false;
				return false;
			}
			info.score=score*100	
		}
		scoreList.push(info)
	})
	if(onswitch==false){
		return;
	}
	saveGradeLoading();
	var mid=sessionStorage.getItem("currentmid");
	$.ajax({
		type: "POST",
        url: "../addTeamScore",
        dataType: "JSON",
        async:true,
        data: {
        	"scoreList":JSON.stringify(scoreList),
        	"mid":mid
        },
        success: function(data){
        	if(data.status == 0){
        		closeResult();
        		closeTempWin();
        		showSetTrophy(raceobj);
        	}else if(data.status == 1){
        		closeResult();
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}


function setNoScore(){
	closeWin();
	$(tempobj).addClass("gradeBtn2").removeClass("gradeBtn1").attr("onclick","");
	$(tempobj).siblings().addClass("gradeBtn3").removeClass("gradeBtn1").attr("onclick","");
	$(tempobj).parent().prev().find(".scoreinput").attr("readonly",true).val("");
}

function closeTempWin(){
	$(".shade").remove();
	$(".gradeManage").remove();
	$(".setTrophy").remove();
	$(".setAward").remove();
	$(".grantdiploma").remove();
}

function findTeam(rid){
	var tname=$(".searchteam").val();
	$.ajax({
		type: "GET",
        url: "../findTeamScoreByRid",
        dataType: "JSON",
        async:false,
        data: {
        	"rid":rid,
        	"tname":tname
        },
        success: function(data){
        	if(data.status == 0){
        		console.log(data);
        		$(".tablewrap tbody").empty();
        		var htmls="";
        		$.each(data.list,function(i,team){
        			htmls+='<tr tid="'+team.tid+'"><td>'+team.tcode+'</td>'
		       			 +'<td>'+team.tname+'</td>'
		       			 +'<td><input type="text" class="scoreinput" value="';
		       		if(team.score==null){
		       			htmls+='">';
		       		}else if(team.score=="违规"||team.score=="缺赛"){
		       			htmls+=team.score+'" readonly>';
		       		}else{
		       			htmls+=team.score/100+'">';
		       		}
		       		htmls+='</td>';
		       		if(team.flg=="00"){
		       			htmls+='<td><span class="gradeBtn1 reject"'
		       				+' onclick="alertConfirm(\'2\',\'此操作不可逆！确定将该队伍的成绩判定为违规？\',\'setNoScore()\',this)">违规</span>'
		       		    	+'<span class="gradeBtn1 absence"'
		       		    	+' onclick="alertConfirm(\'2\',\'此操作不可逆！确定将该队伍的成绩判定为缺赛？\',\'setNoScore()\',this)">缺赛</span></td></tr>'
		       		}else if(team.flg=="01"){
		       			htmls+='<td><span class="gradeBtn2 reject">违规</span>'
		       		    	 +'<span class="gradeBtn3 absence">缺赛</span></td></tr>'
		       		}else if(team.flg=="02"){
		       			htmls+='<td><span class="gradeBtn3 reject">违规</span>'
		       		    	 +'<span class="gradeBtn2 absence">缺赛</span></td></tr>'
		       		}
        		})
        		$(".tablewrap tbody").append(htmls)
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function showSetTrophy(obj){
	var rid=$(obj).parent().attr("rid")
	var htmls="";
	var troPhyInfo="";
	htmls+='<div class="shade"></div><div class="setTrophy">'
		 +'<h1 class="wTitle">奖杯设置</h1><div class="someInfo">'
		 +'<div class="someInfo-left"><span style="float:left;">当前赛项：</span>'
		 +'<span class="curRace">'+$(obj).parent().prev().prev().prev().text()+'</span>'
		 +'</div><div class="someInfo-right"><span class="preview2"'
		 +' onclick="showReport(\''+rid+'\',\'02\')">成绩预览</span></div>'
		 +'</div><div class="tablewrap">'
		 +'<table><thead><tr><td style="width:52px;">级别</td>'
		 +'<td style="width:202px;">奖杯类别</td><td style="width:86px;">操作</td></tr></thead><tbody>'
		 $.ajax({
				type: "GET",
		        url: "../findRaceCupByRid",
		        dataType: "JSON",
		        async:false,
		        data: {
		        	"rid":rid
		        },
		        success: function(data){
		        	if(data.status == 0){
		        		troPhyInfo=data.list
		        	}else if(data.status == 1){
		        		alertMsg("2",data.errmsg,"fail")
		        	}
		        },
			})
	if(troPhyInfo.length==0){
		htmls+='<tr><td><span class="levnum">1</span></td>'
			 +'<td><input type="text" class="typeinput"></td>'
			 +'<td><a class="delete" onclick="delItem(this)"></a>'
			 +'<a class="upbtn" onclick="moveUp(this)"></a>'
			 +'<a class="downbtn" onclick="moveDown(this)"></a>'
			 +'</td></tr>'
	}else{
		$.each(troPhyInfo,function(i,trophy){
			htmls+='<tr><td><span class="levnum">'+(i+1)+'</span></td>'
				+'<td><input type="text" class="typeinput" value="'+trophy.cname+'"></td>'
				+'<td><a class="delete" onclick="delItem(this)"></a>'
				+'<a class="upbtn" onclick="moveUp(this)"></a>'
				+'<a class="downbtn" onclick="moveDown(this)"></a>'
				+'</td></tr>'
		})
	}
	htmls+='</tbody></table><div class="add" onclick="addTrophyItem()"></div></div>'
		 +'<div class="confirmBtn">'
		 +'<a class="conBtn1" onclick="saveTrophy(\''+rid+'\')">保存</a>'
 		 /*+'<a class="conBtn2" onclick="closeTempWin()">取消</a>'*/
 		 +'</div></div>'	
 	$("body").append(htmls);
	canMove();
}

function addTrophyItem(){
	var htmls="";
	htmls+='<tr><td><span class="levnum">'+($(".setTrophy tbody tr").length+1)+'</span></td>'
		 +'<td><input type="text" class="typeinput"></td>'
		 +'<td><a class="delete" onclick="delItem(this)"></a>'
		 +'<a class="upbtn" onclick="moveUp(this)"></a>'
		 +'<a class="downbtn" onclick="moveDown(this)"></a>'
		 +'</td></tr>'
	$(".setTrophy tbody").append(htmls);
	canMove();
}

function moveUp(obj){
	var tr=$(obj).parent().parent().clone();
	$(obj).parent().parent().prev().before(tr);
	$(obj).parent().parent().remove();
	canMove();
} 

function moveDown(obj){
	var tr=$(obj).parent().parent().clone();
	$(obj).parent().parent().next().after(tr);
	$(obj).parent().parent().remove();
	canMove();
} 

function canMove(){
	$(".upbtn,.downbtn").show();
	$(".setTrophy tbody tr").each(function(i){
		$(this).find(".levnum").text(i+1)
		if($(this).index()==0){
			$(this).find(".upbtn").hide()
		}
		if($(this).index()==$(".setTrophy tbody tr").length-1){
			$(this).find(".downbtn").hide()
		}
		if(($(this).index()!=0)&&($(this).index()!=$(".setTrophy tbody tr").length-1)){
			$(this).find(".upbtn").show();
			$(this).find(".downbtn").show();
		}
	})
	$(".setAward tbody tr").each(function(i){
		$(this).find(".levnum").text(i+1)
		if($(this).index()==0){
			$(this).find(".upbtn").hide()
		}
		if($(this).index()==$(".setAward tbody tr").length-1){
			$(this).find(".downbtn").hide()
		}
		if(($(this).index()!=0)&&($(this).index()!=$(".setAward tbody tr").length-1)){
			$(this).find(".upbtn").show();
			$(this).find(".downbtn").show();
		}
	})
} 

function delItem(obj){
	$(obj).parent().parent().remove();
	canMove();
}

function saveTrophy(rid){
	var cupList=[];
	var onswitch;
	$(".setTrophy tbody tr").each(function(){
		var info={};
		info.rid=rid;
		info.cname=$(this).find(".typeinput").val();
		if(info.cname.trim()==""){
			alertMsg("2","请填写奖杯类别！","fail");
			onswitch = false;
			return false;
		}
		info.clev=parseInt($(this).find(".levnum").text());
		cupList.push(info)
	})
	if(onswitch == false){
		return;
	}
	 $.ajax({
		type: "GET",
        url: "../addRaceCup",
        dataType: "JSON",
        async:false,
        data: {
        	"cupList":JSON.stringify(cupList)
        },
        success: function(data){
        	if(data.status == 0){
        		closeTempWin();
        		showSetAward(raceobj)
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function showReport(rid,flg,obj){
	var reportInfo="";
	var cupList=[];
	var awardList=[];
	var param={};
	var htmls="";
	var numInfo=getAllTeamNum(rid);
	var onswitch;
	$(".setTrophy tbody tr").each(function(){
		var info={};
		info.rid=rid;
		info.cname=$(this).find(".typeinput").val();
		if(flg=="02"&&info.cname.trim()==""){
			alertMsg("2","请填写奖杯类别！","fail");
			onswitch = false;
			return false;
		}
		info.clev=parseInt($(this).find(".levnum").text());
		cupList.push(info)
	})
	$(".setAward tbody tr").each(function(){
		var info={};
		info.rid=rid;
		info.aname=$(this).find(".aname").val();
		if(flg=="01"&&info.aname.trim()==""){
			alertMsg("2","请填写奖项类别！","fail");
			onswitch = false;
			return false;
		}
		info.aproportion=parseFloat($(this).find(".percentinput").val());
		if(flg=="01"&&$(this).find(".percentinput").val().trim()==""){
			alertMsg("2","请填写队伍数量！","fail");
			onswitch = false;
			return false;
		}else if(checkTeamnum(info.aproportion,numInfo.teamnum)){
			onswitch = false;
			return false;
		}
		info.alev=parseInt($(this).find(".levnum").text());
		awardList.push(info)
	})
	if(onswitch == false){
		return;
	}
	param.rid=rid;
	param.modelflg=flg;
	param.teamnum=numInfo.teamnum;
	htmls+='<div class="cover2"></div><div class="gradeReport">'
		 +'<img class="closeWin" src="../images/guanbi.png" onclick="closeReport()">'
		 +'<h1 class="wTitle">成绩单</h1><div class="someInfo">'
		 +'<div class="someInfo-left">当前赛项：'
		 +'<span class="curRace">'+(obj==undefined?$(".curRace").text():$(obj).parent().prev().prev().prev().text())+'</span>'
		 +'<p class="nump">报名队伍：<span class="allteamnum">'+numInfo.allteamnum+'</span>'
	     +'合格队伍：<span class="teamnum">'+numInfo.teamnum+'</span>'
	     +'违规队伍：<span class="wgteamnum">'+numInfo.wgteamnum+'</span>'
	     +'缺赛队伍：<span class="qsteamnum">'+numInfo.qsteamnum+'</span>'
	     +'</p></div>'
		 +'</div><div class="tablewrap">'
		 +'<table><thead><tr><td style="width:176px;">队伍编号</td>'
		 +'<td style="width:148px;">队伍名称</td>'
		 +'<td style="width:118px;">成绩</td>';
	if(flg=="00"){
		htmls+='<td style="width:132px;">奖杯</td>'
			 +'<td style="width:88px;">奖项</td>'
	}else if(flg=="01"){
		htmls+='<td style="width:88px;">奖项</td>';
		param.awardsJson=JSON.stringify(awardList)
	}else{
		htmls+='<td style="width:132px;">奖杯</td>';
		param.cupJson=JSON.stringify(cupList);
	}
	htmls+='</tr></thead><tbody>';
	$.ajax({
		type: "GET",
        url: "../findScoreRankingByRid",
        dataType: "JSON",
        async:false,
        data: param,
        success: function(data){
        	if(data.status == 0){
        		reportInfo=data;
        		$.each(reportInfo.list,function(i,report){
        			htmls+="<tr><td>"+report.tcode+"</td>"
        				 +"<td>"+report.tname+"</td>";
        			if(report.flg=="00"){
        				htmls+="<td>"+report.score/100+"</td>";
        			}else{
        				htmls+="<td>"+report.score+"</td>";
        			}
        			if(flg=="00"){
        				htmls+='<td>'+(report.cup==null?"":report.cup)+'</td>'
        					 +'<td>'+(report.awards==null?"":report.awards)+'</td>'
        			}else if(flg=="01"){
        				htmls+='<td>'+(report.awards==null?"":report.awards)+'</td>'
        			}else{
        				htmls+='<td>'+(report.cup==null?"":report.cup)+'</td>'
        			}
        			htmls+="</tr>"
        		})
        		htmls+='</tbody></table></div></div>'
        		$("body").append(htmls);
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail");
        	}
        },
	})
}

function getAllTeamNum(rid){
	var numInfo="";
	$.ajax({
		type: "GET",
        url: "../findRaceTeamNumByRid",
        dataType: "JSON",
        async:false,
        data: {
        	"rid":rid,
        },
        success: function(data){
        	if(data.status == 0){
        		numInfo=data.info;
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
	return numInfo;
}

function closeReport(){
	$(".cover2").remove();
	$(".gradeReport").remove();
}

function showSetAward(obj){
	var rid=$(obj).parent().attr("rid")
	var htmls="";
	var awardInfo="";
	var numInfo=getAllTeamNum(rid);
	htmls+='<div class="shade"></div><div class="setAward">'
	     +'<h1 class="wTitle">奖项设置</h1><div class="someInfo">'
	     +'<div class="someInfo-left"><p>当前赛项：'
	     +'<span class="curRace">'+$(obj).parent().prev().prev().prev().text()+'</span></p>'
	     +'<p class="nump">报名队伍：<span class="allteamnum">'+numInfo.allteamnum+'</span>'
	     +'合格队伍：<span class="teamnum">'+numInfo.teamnum+'</span>'
	     +'违规队伍：<span class="wgteamnum">'+numInfo.wgteamnum+'</span>'
	     +'缺赛队伍：<span class="qsteamnum">'+numInfo.qsteamnum+'</span>'
	     +'</p></div><div class="someInfo-right">'
	     +'<span class="preview2" onclick="showReport(\''+rid+'\',\'01\')">成绩预览</span>'
	     +'</div></div><div class="tablewrap"><table>'
	     +'<thead><tr><td style="width:50px;">级别</td>'
	     +'<td style="width:148px;padding-left:30px">奖项类别</td>'
	     +'<td style="width:98px;padding-left:6px">队伍数量</td>'
	     +'<td style="width:132px;">奖项比例</td><td>操作</td></tr></thead><tbody>';
	$.ajax({
		type: "GET",
        url: "../findAwardsByRid",
        dataType: "JSON",
        async:false,
        data: {
        	"rid":rid
        },
        success: function(data){
        	if(data.status == 0){
        		awardInfo=data.list
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
	if(awardInfo.length==0){
		htmls+='<tr><td><span class="levnum">1</span></td>'
			 +'<td><input class="typeinput aname" type="text"></td>'
			 +'<td><input class="typeinput percentinput" type="text" onblur="setTeamNum(this)">'
			 +'</td>'
			 +'<td></td><td>'
			 +'<a class="delete" onclick="delItem(this)"></a>'
			 +'<a class="upbtn" onclick="moveUp(this)"></a>'
			 +'<a class="downbtn" onclick="moveDown(this)"></a>'
			 +'</td></tr>'
	}else{
		$.each(awardInfo,function(i,award){
			htmls+='<tr><td><span class="levnum">'+(i+1)+'</span></td>'
				 +'<td><input class="typeinput aname" type="text" value="'+award.aname+'"></td>'
				 +'<td><input class="typeinput percentinput" type="text" value="'
				 +award.aproportion+'" onblur="setTeamNum(this)">'
				 +'</td>'
				 +'<td>'+((award.aproportion/numInfo.teamnum)*100).toFixed(2)+'%'+'</td><td>'
				 +'<a class="delete" onclick="delItem(this)"></a>'
				 +'<a class="upbtn" onclick="moveUp(this)"></a>'
				 +'<a class="downbtn" onclick="moveDown(this)"></a>'
				 +'</td></tr>'
		})
	}
	htmls+='</tbody></table><div class="add" onclick="addAwardItem()"></div></div>'
		 +'<div class="confirmBtn">'
		 +'<a class="conBtn1" onclick="saveAward(\''+rid+'\')">保存</a>'
		/* +'<a class="conBtn2" onclick="closeTempWin()">取消</a>'*/
		 +'</div></div>'	
	$("body").append(htmls);
	canMove();
} 

function addAwardItem(){
	var htmls="";
	htmls+='<tr><td><span class="levnum">'+($(".setAward tbody").length+1)+'</span></td>'
		 +'<td><input class="typeinput aname" type="text"></td>'
		 +'<td><input class="typeinput percentinput" type="text" onblur="setTeamNum(this)">'
		 +'</td>'
		 +'<td></td><td>'
		 +'<a class="delete" onclick="delItem(this)"></a>'
		 +'<a class="upbtn" onclick="moveUp(this)"></a>'
		 +'<a class="downbtn" onclick="moveDown(this)"></a>'
		 +'</td></tr>'
	$(".setAward tbody").append(htmls);
	canMove();
}

function setTeamNum(obj){
	var teamnum=$(".teamnum").text();
	var num=parseFloat($(obj).val());
	if($(obj).val()!=""){
		if(checkTeamnum(num,teamnum)){
			return;
		}
		$(obj).parent().next().text(((num/teamnum)*100).toFixed(2)+"%")
	}
}

function checkTeamnum(num,teamnum){
	if(isNaN(num)){
		alertMsg("2","队伍数量必须为数字！","fail")
		return true;
	}else{
		if(num<=0){
			alertMsg("2","队伍数量必须大于0！","fail")
			return true;
		}else if(Math.floor(num) !== num){
			alertMsg("2","队伍数量必须为整数！","fail")
			return true;
		}else{
			var sum=0;
			$(".percentinput").each(function(){
				sum+=parseInt($(this).val())
			})
			if(sum>teamnum){
				alertMsg("2","获奖队伍数量不能大于合格队伍总数！","fail")
				return true;
			}
		}
	}
}

function saveAward(rid){
	var awardList=[];
	var onswitch;
	var numInfo=getAllTeamNum(rid);
	$(".setAward tbody tr").each(function(){
		var info={};
		info.rid=rid;
		info.aname=$(this).find(".aname").val();
		if(info.aname.trim()==""){
			alertMsg("2","请填写奖项类别！","fail");
			onswitch = false;
			return false;
		}
		info.aproportion=parseFloat($(this).find(".percentinput").val());
		if($(this).find(".percentinput").val().trim()==""){
			alertMsg("2","请填写队伍数量！","fail");
			onswitch = false;
			return false;
		}else if(checkTeamnum(info.aproportion,numInfo.teamnum)){
			onswitch = false;
			return false;
		}
		info.alev=parseInt($(this).find(".levnum").text());
		awardList.push(info)
	})
	if(onswitch == false){
		return;
	}
	 $.ajax({
		type: "GET",
        url: "../setAwardsByRid",
        dataType: "JSON",
        async:false,
        data: {
        	"rid":rid,
        	"awardsJson":JSON.stringify(awardList)
        },
        success: function(data){
        	if(data.status == 0){
        		closeTempWin();
        		alertMsg("2","操作成功！","success")
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function grantDiploma(obj){
	resultobj=obj;
	var rid=$(obj).parent().attr("rid");
	var rname=$(obj).parent().parent().find("td:eq(1)").text();
	var numInfo=getAllTeamNum(rid);
	var htmls="";
	htmls+='<div class="shade"></div><div class="grantdiploma">'
		 +'<img class="closeWin" src="../images/guanbi.png" onclick="closeTempWin()">'
	     +'<h1 class="wTitle">奖状发放</h1><div class="someInfo">'
	     +'<div class="someInfo-left"><p>当前赛项：'
	     +'<span class="curRace">'+$(obj).parent().prev().prev().prev().text()+'</span></p>'
	     +'<p class="nump">报名队伍：<span class="allteamnum">'+numInfo.allteamnum+'</span>'
	     +'合格队伍：<span class="teamnum">'+numInfo.teamnum+'</span>'
	     +'违规队伍：<span class="wgteamnum">'+numInfo.wgteamnum+'</span>'
	     +'缺赛队伍：<span class="qsteamnum">'+numInfo.qsteamnum+'</span>'
	     +'</p></div><div class="someInfo-right">'
	     +'<span class="preview2" onclick="createModel(\''+rid+'\',\''+rname+'\')">生成奖状及参赛证明</span>'
	     +'<span class="preview2_disabled" onclick="sendEmail(\''+rid+'\',0,\'00\')">发放奖状</span>'
	     +'<span class="preview2_disabled" onclick="sendEmail(\''+rid+'\',0,\'01\')">发放参赛证明</span>'
	     +'<span class="preview2" onclick="download(\'01\')">奖状下载</span>'
	     +'<span class="preview2" onclick="download(\'02\')">奖励下载</span>'
	     +'<span class="preview2" onclick="download(\'03\')">参赛证明下载</span>'
	     +'</div></div><div class="tablewrap"><table>'
	     +'<thead><tr><td style="width:30px;"><input type="checkbox" id="allSel" onclick="selAll()"></td>'
	     +'<td style="width:110px;">队伍编号</td>'
	     +'<td style="width:172px;">队伍名称</td>'
	     +'<td style="width:82px;">奖杯</td>'
	     +'<td style="width:75px;">奖项</td>'
	     +'<td style="width:100px;">参赛证明</td>'
	     +'<td style="width:83px;">生成状态</td>'
	     +'<td style="width:83px;">操作</td>'
	     +'<td style="width:110px;">奖状发放状态</td>'
	     +'<td>证书发放状态</td></tr></thead><tbody>';
	$.ajax({
		type: "GET",
        url: "../findTeamCitationByRid",
        dataType: "JSON",
        async:false,
        data: {
        	"rid":rid
        },
        success: function(data){
        	if(data.status == 0){
        		console.log(data)
        		$.each(data.list,function(i,report){
        			htmls+="<tr tid='"+report.tid+"'>"
        			htmls+="<td>";
        			if(report.flg!="02"&&report.grantstatus!="00"){
        				htmls+="<input type='checkbox' class='chosebox' creatstatus='"+report.creatstatus+"' tid='"+report.tid
        			+"' grantjzstatus='"+report.grantjzstatus+"' grantcsstatus='"+report.grantcsstatus
        			+"' flg='"+report.flg+"' awards='"+report.awards+"' onclick='isAllSel()'></td>";
        			}else{
        				htmls+="</td>"
        			}
        			htmls+="<td>"+report.tcode+"</td>"
        				 +"<td>"+report.tname;
        			if(report.flg=="01"){
        				htmls+="(违规)"
        			}
        			if(report.flg=="02"){
        				htmls+="(缺赛)"
        			}
        			htmls+="</td>"
        			if(report.flg=="00"){
        				htmls+="<td>"+report.cup+"</td>"
        					 +"<td>"+report.awards+"</td>"
        			}else{
        				htmls+="<td class='havestatus'>无</td><td class='havestatus'>无</td>"
        			}	 
        			if(report.flg=="02"){
        				htmls+="<td class='havestatus'>无</td>"
        					 +"<td class='havestatus'>无</td>"
        					 +"<td class='havestatus'>无</td>"
        					 +"<td class='havestatus'>无</td>"
        					 +"<td class='havestatus'>无</td>"
        			}else{
        				htmls+="<td>有</td>";
        				if(report.creatstatus=="00"){
        					htmls+="<td>生成成功</td>"
        						 +"<td url='"+report.awardsurl+','+report.cupurl
        						 +','+report.entryurls+"'><a onclick='previewModel(this)' style='cursor:pointer'>预览</a></td>"
        				}else if(report.creatstatus=="01"){
        					htmls+="<td>未生成</td>"
        						+"<td class='havestatus'>预览</td>"
        				}else if(report.creatstatus=="02"){
        					htmls+="<td>生成失败</td>"
        						+"<td class='havestatus'>预览</td>"
        				}
        				if(report.awards==""){
        					htmls+="<td class='havestatus'>无</td>"
        				}else{
        					if(report.grantjzstatus=="00"){
            					htmls+="<td><span class='grantstatus1'>已发放</span></td>";
            				}else{
            					htmls+="<td><span class='grantstatus2'>未发放</span></td>";
            				}
        				}
        				
        				if(report.grantcsstatus=="00"){
        					htmls+="<td><span class='grantstatus1'>已发放</span></td>";
        				}else{
        					htmls+="<td><span class='grantstatus2'>未发放</span></td>";
        				}
        			}
        			htmls+="</tr>"
        		})
        		htmls+='</tbody></table></div></div>'
        		$("body").append(htmls);
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail");
        	}
        },
	})
}


/*function createModel(rid,currentIndex){
	var tid="";
	var items=$(".chosebox");
	if(currentIndex>=items.length){   
        return;  
    }else{
    	tid=$(items[currentIndex]).parent().attr("tid");
    	creatResult("01");
    	$.ajax({
    		type: "GET",
            url: "../createModel",
            dataType: "JSON",
          
            data: {
            	"rid":rid,
            	"tid":tid
            },
            success: function(data){
            	if(data.status == 0){
            		currentIndex++;  
            		closeResult();
            		if(currentIndex==items.length){
            			closeResult();
            			creatResult("02");
    	        		closeTempWin();
    	        		grantDiploma(resultobj);
            		}
            		createModel(rid,currentIndex)
            	}else if(data.status == 1){
            		alertMsg("2",data.errmsg,"fail")
            	}
            },
    	})
    }
	
}*/

function createModel(rid,rname){
	var tidList=[];
	$(".tablewrap tbody tr").each(function(){
			tidList.push($(this).attr("tid"));
	})
	var mid=sessionStorage.getItem("currentmid");
	$.ajax({
		type: "GET",
        url: "../createModels",       
        dataType: "JSON",
      
        data: {
        	"rid":rid,
        	"tidList":JSON.stringify(tidList),
        	"mid":mid
        },
        success: function(data){
        	if(data.status == 0){
    			closeResult();
    			creatResult("02",rname);
        		closeTempWin();
        		grantDiploma(resultobj);
        	}else if(data.status == 1){
        		closeResult();
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
        error:function(e){
        	console.log(e);
        }
	})

}
function previewModel(obj){
	var url=$(obj).parent().attr("url");
	window.open("../jsp/modelList.html?"+url,"_blank");
} 
function sendEmail(rid,currentIndex,flg){
    if($(".tablewrap tbody tr:first-child").find(".chosebox").attr("creatstatus")=="01"){
    	alertMsg("2","请先生成奖项及参赛证明！","fail");
		return;
    }
    if(flg=="00"&&$("[grantjzstatus=01][awards!='']").length==0){
		alertMsg("2","所有队伍的奖状已发放完毕！","fail");
		return;
	}
    if(flg=="01"&&$("[grantcsstatus=01][flg!='02']").length==0){
		alertMsg("2","所有队伍的证书已发放完毕！","fail");
		return;
	}
    if(flg=="00"){
    	var items=$(".chosebox[grantjzstatus=01][awards!='']:checked");
    }
    if(flg=="01"){
    	var items=$(".chosebox[grantcsstatus=01][flg!='02']:checked");
    }
    if(items.length==0){
    	alertMsg("2","请选择队伍！","fail");
		return;
    }
	if(currentIndex>=items.length){   
        return;  
    }else{
		var tid="";
		var mid=sessionStorage.getItem("currentmid");
		tid=$(items[currentIndex]).attr("tid");
		grantResult("01",currentIndex+1,items.length);
		$.ajax({
			type: "GET",
	        url: "../sendEmailPdf",
	        dataType: "JSON",
	      
	        data: {
	        	"rid":rid,
	        	"tid":tid,
	        	"flg":flg,
	        	"mid":mid
	        },
	        success: function(data){
	        	if(data.status == 0){
	        		currentIndex++;  
	        		closeResult();
	        		if(currentIndex==items.length){
	        			closeResult();
		        		grantResult("02");
		        		closeTempWin();
    	        		grantDiploma(resultobj);
    	        		return;
	        		}
	        		sendEmail(rid,currentIndex,flg);
	        	}else if(data.status == 1){
	        		closeResult();
	        		alertMsg("2",data.errmsg,"fail")
	        	}
	        },
		})
    }
}  

function selAll(){
	var ischecked=$("#allSel").prop("checked");
	$(".chosebox").each(function(){
		if(ischecked){
			$(this).prop("checked",true)
		}else{
			$(this).prop("checked",false)
		}
	})
}

function isAllSel(){
	for(var i=0;i<$(".chosebox").length;i++){
		if($($(".chosebox")[i]).prop("checked")==false){
			$("#allSel").prop("checked",false);
			return;
		}
	}
	$("#allSel").prop("checked",true);
}

function grantResult(flg,num1,num2){
	var htmls="";
	if(flg=="01"){
		htmls+='<div class="cover2"></div><div class="loading">'
			 +'<div class="loadInfo"><img src="../images/fafang.png">'
			 +'<span>奖状及参赛证书发放中('+num1+'/'+num2+')，请稍等......</span></div></div>';
	}else if(flg=="02"){
		htmls+='<div class="cover2"></div><div class="loading">'
			 +'<div class="loadInfo" style="display:block;margin:35px 0"><img src="../images/fafang.png">'
			 +'<span>所选队伍奖状及参赛证明发放<span style="color:#24b231;">成功</span></span>'
			 +'</div><span class="closeLoad" onclick="closeResult()">关闭</span></div>';
	}
	$("body").append(htmls);
}

function creatResult(flg,rname){
	var htmls="";
	if(flg=="01"){
		htmls+='<div class="cover2"></div><div class="loading">'
			 +'<div class="loadInfo"><img src="../images/fafang.png">'
			 +'<span>奖状及参赛证书生成中，请稍等......</span></div></div>';
	}else if(flg=="02"){
		htmls+='<div class="cover2"></div><div class="loading">'
			 +'<div class="loadInfo" style="display:block">'
			 +'<h1 style="font-size:20px">'+rname+'</h1>'
			 +'<img src="../images/fafang.png">'
			 +'<span>奖状及参赛证明生成<span style="color:#24b231;">成功</span></span>'
			 +'</div><span class="closeLoad" style="margin-top:20px" onclick="closeResult()">关闭</span></div>';
	}
	$("body").append(htmls);
}

function saveGradeLoading(){
	var htmls="";
		htmls+='<div class="cover2"></div><div class="loading">'
			 +'<div class="loadInfo"><img src="../images/fafang.png">'
			 +'<span>分数保存中，请稍等......</span></div></div>';
	$("body").append(htmls);
}
function closeResult(){
	$(".cover2").remove();
	$(".loading").remove();
}

function findTCMatch(num){
	var uid=sessionStorage.getItem("uid");
	var pageSize=10;
	var rname=$(".searchinput").val();
	var mid=sessionStorage.getItem("currentmid");
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
			"url" : "../findRaceByUid",
			pageParams : function(data) {
				var param={};
				param.pageNo=data.pageIndex;
				param.rname=rname;
				sessionStorage.setItem("TCgradelistJson", JSON.stringify(param));
				return {
					iDisplayStart : data.pageIndex * data.pageSize,
					iDisplayLength : data.pageSize,
					uid:uid,
					"rname":rname,
					"mid":mid
				};
			}, // [Function]:自定义请求参数
			"success" : function(data, status) {
				console.log(data)
				if (data.status == 0) {
					$("tbody").empty();
					var htmls="";
					$.each(data.list,function(i,com){
						htmls+='<tr rid="'+com.rid+'"><td>'+com.rcode+'</td><td>'
								+com.rname+'</td>'
							  	+'<td>'+com.startdate+'</td>'
							  	+'<td>'+com.enddate+'</td>'
							  	+'<td rid="'+com.rid+'"><a class="operate" onclick="showGrade(this)">成绩管理</a>'
							  	/*+'<span class="split">|</span><a class="operate" onclick="showSetTrophy(this)">奖杯设置</a>'
							  	+'<span class="split">|</span><a class="operate" onclick="showSetAward(this)">奖项设置</a>'*/
							  	+'<span class="split">|</span><a class="operate" '
							  	+'onclick="showReport(\''+com.rid+'\',\'00\',this)">成绩查看</a>'
							  	+'</td></tr>'
					})
					$("tbody").append(htmls)
				} else if(data.status==1){
					alertMsg("2",data.errmsg,"fail")
				}
			},
			"error" : function(data) {
				alertMsg("2","后台获取数据出错","fail")
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

function download(num){
	var mname=$(".currentmatch").text().replace("\\", "").replace("/", "").replace(":", "").replace("*", "")
	.replace("?", "").replace("\"", "").replace("<", "").replace(">", "").replace("|", "");
	var rname=$(".curRace").text().replace("\\", "").replace("/", "").replace(":", "").replace("*", "")
	.replace("?", "").replace("\"", "").replace("<", "").replace(">", "").replace("|", "");
	if(num=="01"){
		var url='http://robotreg.drct-caa.org.cn/staticrobot/zip/'+mname+'/'
				+rname+'/'+mname+rname+'获奖证书ZIP.zip'
	}else if(num=="02"){
		var url='http://robotreg.drct-caa.org.cn/staticrobot/zip/'+mname+'/'
				+rname+'/'+mname+rname+'奖励证书ZIP.zip'
	}else if(num=="03"){
		var url='http://robotreg.drct-caa.org.cn/staticrobot/zip/'+mname+'/'
				+rname+'/'+mname+rname+'参赛证明ZIP.zip';
	}
	window.open(url,'_blank')
}