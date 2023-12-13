package com.zts.robot.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.zts.robot.pojo.Wujiang;
import com.zts.robot.service.WujiangService;
import com.zts.robot.util.RedisUtil;
import com.zts.robot.util.Tools;
import com.zts.robot.util.Verify;

import net.sf.json.JSONObject;

@Controller
public class WujiangController {
	@Autowired
	private WujiangService memberService;
	
	/**
	 * 添加参赛人员(非后台管理)
	 * @param match
	 * @param createuid
	 * @return
	 */
	@RequestMapping("/addWujiang")
	@ResponseBody
	public Map<String, Object> addWujiang(HttpServletRequest request,Wujiang member){
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			
			JSONObject userJson= Tools.getUserJsonByCookie(request);
			String mid=request.getParameter("mid");
			member.setMid(mid);
			//member.setTmcode(Tools.get32UUID());
			member.setTmstatus("00");
			member.setCkstatus("01");
			member.setDelflg("00");
			member.setCreatedate(Tools.getStringByDateAndTime(new Date()));
			member.setCreateuid(userJson.getString("uid"));
			memberService.addWujiang(member);
			resultMap.put("status", 0);
		} catch (Exception e) {
			e.printStackTrace();
			resultMap.put("status", 1);
			resultMap.put("errmsg", "系统异常！：" + e.getMessage());
		}
		return resultMap;
		
	}
	
	/**
	 * 修改参赛人员信息
	 * @param match
	 * @param createuid
	 * @return
	 */
	@RequestMapping("/updateWujiang")
	@ResponseBody
	public Map<String, Object> updateWujiang(Wujiang member){
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			memberService.updateWujiang(member);
			resultMap.put("status", 0);
		} catch (Exception e) {
			e.printStackTrace();
			resultMap.put("status", 1);
			resultMap.put("errmsg", "系统异常！：" + e.getMessage());
		}
		return resultMap;
		
	}
	
	/**
	 * 查询参赛人员列表
	 * @param match
	 * @param createuid
	 * @return
	 */
	@RequestMapping("/findWujiangListByPage")
	@ResponseBody
	public Map<String, Object> findWujiangListByPage(HttpServletRequest request,Integer iDisplayLength,
			Integer iDisplayStart){
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			JSONObject userJson= Tools.getUserJsonByCookie(request);
			String roleflg = userJson.getString("roleflg");
			String openedMatchMid = RedisUtil.get("sys_openedMatchMid");
			String signuid =  userJson.getString("uid");
			
			Map<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("mid", openedMatchMid);
			paramMap.put("signuid", signuid);
			paramMap.put("roleflg", roleflg);
			
			int totalSize = memberService.findWujiangListTotalSize(paramMap);
			if (iDisplayLength==null||iDisplayLength != -1) {
				paramMap.put("beginNo", iDisplayStart);
				paramMap.put("endNo", iDisplayLength);
			}
			
				List<Map<String,Object>> matchList=memberService.findMatchListByPage(paramMap);
				resultMap.put("status", 0);
				resultMap.put("list",matchList);
				resultMap.put("iTotalRecords", totalSize);

		} catch (Exception e) {
			e.printStackTrace();
			resultMap.put("status", 1);
			resultMap.put("errmsg", "系统异常！：" + e.getMessage());
		}
		return resultMap;
		
	}
	/**
	 * 删除成员
	 * @param request
	 * @param tmid
	 * @return
	 */
	@RequestMapping("/updateDelflgWujiangByTmid")
	@ResponseBody
	public Map<String, Object> updateDelflgWujiangByTmid(HttpServletRequest request,String tmid){
		Map<String, Object> resultMap = new HashMap<String, Object>();
		JSONObject userJson= Tools.getUserJsonByCookie(request);
		try {
			String upduid = userJson.getString("uid");
			memberService.updateDelflgWujiangByTmid(tmid,upduid,resultMap);
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			resultMap.put("status", 1);
			resultMap.put("errmsg", "系统异常！：" + e.getMessage());
		}
		return resultMap;
		
	}
	/**
	 * 查询出所有的参赛人员
	 * @param request
	 * @param iDisplayLength
	 * @param iDisplayStart
	 * @return
	 */
	@RequestMapping("/findAllWujiangListByPage")
	@ResponseBody
	public Map<String, Object> findAllWujiangListByPage(HttpServletRequest request,Integer iDisplayLength,
			Integer iDisplayStart){
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {			
			Map<String, Object> paramMap = new HashMap<String, Object>();
			
			String sex=request.getParameter("sex");
			String str=request.getParameter("str");//姓名，手机号，邮箱
			String flg=request.getParameter("flg");//01后台，02注册人
			String mid=request.getParameter("mid");
			String name="";
			String phone="";
			String email="";
			paramMap.put("flg", flg);
			if("02".equals(flg)){
				JSONObject userJson= Tools.getUserJsonByCookie(request);
				String openedMatchMid =mid;
				String signuid =  userJson.getString("uid");
				paramMap.put("signuid", signuid);
			}
			if(str.indexOf("@")>0){
				str=str.substring(0,str.indexOf("@"));
				email=str;
				paramMap.put("email", email);
			}else if(Verify.CheckDigitalBegin(str)){
				phone=str;
				paramMap.put("phone", phone);
			}else if(str!=null && !"".equals(str)){
				name=str;
				paramMap.put("name", name);
			}
			paramMap.put("sex", sex);
			paramMap.put("mid", mid);
			int totalSize = memberService.findAllWujiangListByPageTotalSize(paramMap);
			if (iDisplayLength==null||iDisplayLength != -1) {
				paramMap.put("beginNo", iDisplayStart);
				paramMap.put("endNo", iDisplayLength);
			}
			
				List<Map<String,Object>> matchList=memberService.findAllWujiangListByPage(paramMap);
				resultMap.put("status", 0);
				resultMap.put("list",matchList);
				resultMap.put("iTotalRecords", totalSize);

		} catch (Exception e) {
			e.printStackTrace();
			resultMap.put("status", 1);
			resultMap.put("errmsg", "系统异常！：" + e.getMessage());
		}
		return resultMap;
		
	}
	
	
	/**
	 * 查询成员根据证件类型和证件号
	 * @param didtype
	 * @param did
	 * @return
	 */
	@RequestMapping("/findWujiangMapByDidMid")
	@ResponseBody
	public Map<String, Object> findWujiangMapByDidMid(HttpServletRequest request,String didtype,String did){
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			String mid = request.getParameter("mid");
			Map<String, Object> memberMap= memberService.findWujiangMapByDidMid(mid,didtype,did);
			if(memberMap==null){
				resultMap.put("status", 1);
				return resultMap;
			}
			resultMap.put("info", memberMap);
			resultMap.put("status", 0);
		} catch (Exception e) {
			// TODO: handle exception
			resultMap.put("status", 1);
			resultMap.put("errmsg", e);
		}
		return resultMap;
	}
	/**
	 * 每个成员所参加的赛项
	 * @param request
	 * @param tmid
	 * @return
	 */
	@RequestMapping("/findJoinRaceByTmid")
	@ResponseBody
	public Map<String, Object> findJoinRaceByTmid(HttpServletRequest request,String tmid){
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			JSONObject userJson= Tools.getUserJsonByCookie(request);
			if("03".equals(userJson.get("roleflg"))){
				
			}
			String roleflg = userJson.getString("roleflg");
			String uid = userJson.getString("uid");
			List<Map<String, Object>> raceTeamList = memberService.findJoinRaceByTmid(tmid,roleflg,uid);
			resultMap.put("status", 0);
			resultMap.put("list", raceTeamList);
		} catch (Exception e) {
			// TODO: handle exception
			resultMap.put("status", 1);
			resultMap.put("errmsg", e);
		}
		return resultMap;		
	}
}
